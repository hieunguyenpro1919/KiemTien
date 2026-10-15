import { useEffect, useState, useCallback } from "react";
import { usePlayerStore } from "./usePlayerStore";
import { BigNumber } from "../types/bignum";

export interface OfflineProgressReport {
    offlineSeconds: number;
    tuViGained: BigNumber;
    formattedTime: string;
}

/**
 * Controller vòng lặp trò chơi độc lập (Game Ticker & Offline Calculator)
 */
export class GameLoopEngine {
    private static instance: GameLoopEngine | null = null;
    private timerId: number | null = null;
    private lastTickTime: number = Date.now();
    private isRunning: boolean = false;
    private onOfflineReportCallback: ((report: OfflineProgressReport) => void) | null = null;

    private constructor() {}

    static getInstance(): GameLoopEngine {
        if (!this.instance) {
            this.instance = new GameLoopEngine();
        }
        return this.instance;
    }

    setOfflineCallback(cb: (report: OfflineProgressReport) => void) {
        this.onOfflineReportCallback = cb;
    }

    /**
     * Tính toán tiến trình Offline khi người chơi vắng mặt (AFK)
     */
    checkOfflineProgress(): OfflineProgressReport | null {
        const store = usePlayerStore.getState();
        const lastOnline = store.lastOnlineTimestamp || Date.now();
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - lastOnline) / 1000);

        // Chỉ tính offline nếu rời đi trên 10 giây
        if (elapsedSeconds < 10) {
            store.updateLastOnline();
            return null;
        }

        // Giới hạn tối đa 24 giờ tích lũy offline (86.400 giây)
        const cappedSeconds = Math.min(elapsedSeconds, 86400);
        const afkRate = store.getAfkRate();
        const tuViGained = afkRate.times(cappedSeconds);

        if (tuViGained.gt(0)) {
            store.addTuVi(tuViGained);
        }
        store.updateLastOnline();

        // Định dạng thời gian
        const hours = Math.floor(elapsedSeconds / 3600);
        const minutes = Math.floor((elapsedSeconds % 3600) / 60);
        const seconds = elapsedSeconds % 60;
        const timeStr = `${hours > 0 ? `${hours}h ` : ""}${minutes > 0 ? `${minutes}m ` : ""}${seconds}s`;

        const report: OfflineProgressReport = {
            offlineSeconds: elapsedSeconds,
            tuViGained,
            formattedTime: timeStr
        };

        if (this.onOfflineReportCallback) {
            this.onOfflineReportCallback(report);
        }

        return report;
    }

    /**
     * Bắt đầu vòng lặp game thời gian thực (1 giây/tick)
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTickTime = Date.now();

        // Kiểm tra offline progress trước
        this.checkOfflineProgress();

        if (typeof window !== "undefined") {
            this.timerId = window.setInterval(() => {
                this.tick();
            }, 1000);
        }
    }

    /**
     * Nhịp đập mỗi giây
     */
    private tick() {
        const now = Date.now();
        const deltaSeconds = Math.max(1, Math.floor((now - this.lastTickTime) / 1000));
        this.lastTickTime = now;

        const store = usePlayerStore.getState();
        const afkRate = store.getAfkRate();
        const tuViGained = afkRate.times(deltaSeconds);

        if (tuViGained.gt(0)) {
            store.addTuVi(tuViGained);
        }
        store.updateLastOnline();
    }

    stop() {
        if (this.timerId !== null) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.isRunning = false;
    }
}

/**
 * React Hook tích hợp Game Loop vào ứng dụng
 */
export function useGameLoop() {
    const [offlineReport, setOfflineReport] = useState<OfflineProgressReport | null>(null);

    const clearOfflineReport = useCallback(() => {
        setOfflineReport(null);
    }, []);

    useEffect(() => {
        const engine = GameLoopEngine.getInstance();
        engine.setOfflineCallback((report) => {
            setOfflineReport(report);
        });

        engine.start();

        return () => {
            engine.stop();
        };
    }, []);

    return {
        offlineReport,
        clearOfflineReport
    };
}
