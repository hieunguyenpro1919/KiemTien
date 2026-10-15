import React, { useEffect, useRef, useState, useCallback } from "react";
import { usePlayerStore } from "../../core/state/usePlayerStore";
import { STAGE_DATABASE, StageDefinition, StageSystem } from "../../core/constants/stages.data";
import { SkillSystem } from "../../core/constants/skills.data";
import { CombatEngine, CombatEngineRuntimeState, CombatSpeed } from "../../combat/CombatEngine";
import { formatBigNumber } from "../../core/utils/format";

export const CombatTab: React.FC = () => {
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<CombatEngine | null>(null);

    // Player Store State & Actions
    const realmIndex = usePlayerStore(s => s.realmIndex);
    const tierIndex = usePlayerStore(s => s.tierIndex);
    const isVoCuc = usePlayerStore(s => s.isVoCuc);
    const clearedStageIds = usePlayerStore(s => s.clearedStageIds);
    const markStageCleared = usePlayerStore(s => s.markStageCleared);
    const addTuVi = usePlayerStore(s => s.addTuVi);
    const addCurrency = usePlayerStore(s => s.addCurrency);
    const getTotalStats = usePlayerStore(s => s.getTotalStats);
    const equippedSkills = usePlayerStore(s => s.equippedSkills);
    const equippedUltimate = usePlayerStore(s => s.equippedUltimate);

    // Stage Selection
    const [selectedStageIndex, setSelectedStageIndex] = useState(0);
    const [combatState, setCombatState] = useState<CombatEngineRuntimeState | null>(null);
    const [battleResult, setBattleResult] = useState<{
        type: "VICTORY" | "DEFEAT";
        message: string;
        rewards?: { tuVi: string; linhThach: string };
    } | null>(null);

    const currentStage = STAGE_DATABASE[selectedStageIndex] || STAGE_DATABASE[0];
    const isUnlocked = StageSystem.isStageUnlocked(realmIndex, tierIndex, currentStage, isVoCuc);
    const isCleared = clearedStageIds.includes(currentStage.id);

    // Skills data
    const skill0 = SkillSystem.getSkillById(equippedSkills[0]);
    const skill1 = SkillSystem.getSkillById(equippedSkills[1]);
    const skill2 = SkillSystem.getSkillById(equippedSkills[2]);
    const ultimateSkill = SkillSystem.getUltimateById(equippedUltimate);

    // Handle Victory
    const handleVictory = useCallback((stage: StageDefinition) => {
        // Cộng thưởng vào Player Store
        addTuVi(stage.rewards.tuVi);
        addCurrency("linhThach", stage.rewards.linhThach);
        if (stage.rewards.honNguyen) {
            addCurrency("honNguyenThach", stage.rewards.honNguyen);
        }
        if (stage.rewards.tinhNguyen) {
            addCurrency("tinhNguyen", stage.rewards.tinhNguyen);
        }
        markStageCleared(stage.id);

        setBattleResult({
            type: "VICTORY",
            message: `Trảm sát thành công ${stage.monster.name}! Nhận thưởng tu vi và linh thạch dồi dào.`,
            rewards: {
                tuVi: formatBigNumber(stage.rewards.tuVi),
                linhThach: formatBigNumber(stage.rewards.linhThach)
            }
        });
    }, [addTuVi, addCurrency, markStageCleared]);

    // Handle Defeat
    const handleDefeat = useCallback((reason: string) => {
        setBattleResult({
            type: "DEFEAT",
            message: reason || "Đạo Hữu bị trọng thương trước uy áp của yêu thú!"
        });
    }, []);

    // Khởi tạo PixiJS v8 Application
    useEffect(() => {
        let isMounted = true;
        const container = canvasContainerRef.current;
        if (!container) return;

        const engine = new CombatEngine();
        engineRef.current = engine;

        engine.onStateUpdate = (st) => {
            if (isMounted) {
                setCombatState(st);
            }
        };

        engine.onVictory = (stage) => {
            if (isMounted) {
                handleVictory(stage);
            }
        };

        engine.onDefeat = (reason) => {
            if (isMounted) {
                handleDefeat(reason);
            }
        };

        // Gắn engine vào DOM
        engine.init(container).then(() => {
            if (!isMounted) return;
            // Bắt đầu trận chiến với ải được chọn
            const playerStats = getTotalStats();
            engine.startBattle(
                currentStage,
                playerStats,
                [skill0, skill1, skill2],
                ultimateSkill
            );
        });

        // Xử lý resize tự động
        const handleResize = () => {
            engine.resize();
        };
        window.addEventListener("resize", handleResize);

        return () => {
            isMounted = false;
            window.removeEventListener("resize", handleResize);
            engine.destroy();
            engineRef.current = null;
        };
    }, []);

    // Khi chọn Ải mới: Bắt đầu lại trận đánh nếu engine đang chạy
    const startBattleWithStage = (stage: StageDefinition) => {
        setBattleResult(null);
        if (engineRef.current) {
            const playerStats = getTotalStats();
            engineRef.current.startBattle(
                stage,
                playerStats,
                [skill0, skill1, skill2],
                ultimateSkill
            );
        }
    };

    // Điều khiển trận đấu
    const handleSetSpeed = (spd: CombatSpeed) => {
        engineRef.current?.setSpeed(spd);
    };

    const handleToggleAuto = () => {
        if (combatState) {
            engineRef.current?.setAutoCombat(!combatState.isAutoCombat);
        }
    };

    const handleCastSkill = (slot: 0 | 1 | 2) => {
        engineRef.current?.castSkill(slot);
    };

    const handleCastUltimate = () => {
        engineRef.current?.castUltimate();
    };

    const handleNextStage = () => {
        if (selectedStageIndex < STAGE_DATABASE.length - 1) {
            const nextIdx = selectedStageIndex + 1;
            setSelectedStageIndex(nextIdx);
            startBattleWithStage(STAGE_DATABASE[nextIdx]);
        }
    };

    const handlePrevStage = () => {
        if (selectedStageIndex > 0) {
            const prevIdx = selectedStageIndex - 1;
            setSelectedStageIndex(prevIdx);
            startBattleWithStage(STAGE_DATABASE[prevIdx]);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
            {/* KHUNG SÀN ĐẤU 2D WEBGL (PIXIJS V8 CANVAS) */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/30 bg-[#060913] shadow-2xl shadow-cyan-950/40">
                {/* Pixi Canvas Mount Point */}
                <div
                    ref={canvasContainerRef}
                    className="w-full h-[380px] sm:h-[430px] md:h-[460px] relative cursor-crosshair"
                />

                {/* HUD Overlay: Thông Tin Người Chơi (Góc Dưới Bên Trái Sàn Đấu) */}
                {combatState && (
                    <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 min-w-[200px] sm:min-w-[240px] pointer-events-none select-none shadow-lg">
                        <div className="flex items-center justify-between text-xs font-semibold mb-1">
                            <span className="text-cyan-300">🧙‍♂️ Đạo Hữu</span>
                            <span className="text-slate-300 font-mono">
                                {formatBigNumber(combatState.playerCurrentHp)} / {formatBigNumber(combatState.playerMaxHp)}
                            </span>
                        </div>

                        {/* Thanh Máu Người Chơi */}
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700 mb-2 relative">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150"
                                style={{
                                    width: `${Math.max(0, Math.min(100, combatState.playerCurrentHp.div(combatState.playerMaxHp).times(100).toNumber()))}%`
                                }}
                            />
                            {combatState.playerCurrentShield.gt(0) && (
                                <div
                                    className="absolute inset-0 bg-cyan-400/50 border-r-2 border-cyan-300"
                                    title="Khiên Hộ Thể"
                                />
                            )}
                        </div>

                        {/* Thanh Nộ Khí Người Chơi (Rage Bar) */}
                        <div className="flex items-center justify-between text-[11px] font-semibold text-amber-400 mb-1">
                            <span>⚡ Nộ Khí:</span>
                            <span className="font-mono">{Math.floor(combatState.playerRage)} / 100</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                            <div
                                className={`h-full transition-all duration-150 ${
                                    combatState.playerRage >= 100
                                        ? "bg-gradient-to-r from-amber-400 to-yellow-300 animate-pulse shadow-md shadow-amber-400/50"
                                        : "bg-gradient-to-r from-amber-600 to-amber-500"
                                }`}
                                style={{ width: `${combatState.playerRage}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* HUD Overlay: Tên Ải & Trạng Thái (Góc Trên Bên Trái) */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold font-serif bg-slate-950/80 backdrop-blur-md border border-amber-400/40 text-amber-300 shadow">
                        {currentStage.name}
                    </span>
                    <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                        style={{
                            backgroundColor: `${currentStage.diffColor}22`,
                            color: currentStage.diffColor,
                            border: `1px solid ${currentStage.diffColor}66`
                        }}
                    >
                        {currentStage.difficulty}
                    </span>
                    {isCleared && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            ✓ ĐÃ QUA
                        </span>
                    )}
                </div>

                {/* HUD Overlay: Nút Tốc Độ & Auto Nhanh (Góc Trên Bên Phải) */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow">
                    {([1, 2, 3] as CombatSpeed[]).map(spd => (
                        <button
                            key={spd}
                            onClick={() => handleSetSpeed(spd)}
                            className={`px-2.5 py-1 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer ${
                                combatState?.speed === spd
                                    ? "bg-amber-500 text-slate-950 shadow-sm shadow-amber-400/50"
                                    : "text-slate-400 hover:text-slate-200"
                            }`}
                        >
                            x{spd}
                        </button>
                    ))}
                    <button
                        onClick={handleToggleAuto}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            combatState?.isAutoCombat
                                ? "bg-cyan-600 text-white shadow-sm shadow-cyan-400/40"
                                : "bg-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                    >
                        ⚡ {combatState?.isAutoCombat ? "TỰ ĐỘNG" : "THỦ CÔNG"}
                    </button>
                </div>

                {/* Modal Thông Báo Thắng / Thua Trực Quan */}
                {battleResult && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-30 flex items-center justify-center p-4">
                        <div
                            className={`max-w-md w-full p-6 rounded-2xl border-2 text-center shadow-2xl relative animate-scaleUp ${
                                battleResult.type === "VICTORY"
                                    ? "bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-amber-400/60 shadow-amber-500/20"
                                    : "bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-red-500/60 shadow-red-500/20"
                            }`}
                        >
                            <div className="text-4xl mb-2">
                                {battleResult.type === "VICTORY" ? "🎉" : "💀"}
                            </div>
                            <h3
                                className={`text-2xl font-bold font-serif mb-2 tracking-wide ${
                                    battleResult.type === "VICTORY" ? "text-amber-300" : "text-red-400"
                                }`}
                            >
                                {battleResult.type === "VICTORY" ? "TRẢM SÁT ĐẠI THẮNG!" : "TRỌNG THƯƠNG THẤT BẠI"}
                            </h3>
                            <p className="text-xs text-slate-300 mb-4">{battleResult.message}</p>

                            {battleResult.rewards && (
                                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 mb-4 space-y-1 text-sm font-mono">
                                    <div className="text-emerald-400 font-semibold">
                                        +{battleResult.rewards.tuVi} Tu Vi
                                    </div>
                                    <div className="text-amber-400 font-semibold">
                                        +{battleResult.rewards.linhThach} Linh Thạch
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={() => startBattleWithStage(currentStage)}
                                    className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
                                >
                                    🔄 Khiêu Chiến Lại
                                </button>
                                {battleResult.type === "VICTORY" && selectedStageIndex < STAGE_DATABASE.length - 1 && (
                                    <button
                                        onClick={handleNextStage}
                                        className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
                                    >
                                        Tiếp Tục Ải Kế ➔
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* BỘ ĐIỀU KHIỂN XUẤT CHIÊU THẦN THÔNG & ĐẠI THẦN THÔNG */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* 3 Ô Kỹ Năng Thường */}
                <div className="md:col-span-3 grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((slotIdx) => {
                        const skill = [skill0, skill1, skill2][slotIdx];
                        const cd = combatState?.skillCooldowns[slotIdx] || 0;
                        const isReady = cd <= 0 && !!skill;

                        return (
                            <button
                                key={slotIdx}
                                onClick={() => handleCastSkill(slotIdx as 0 | 1 | 2)}
                                disabled={!isReady}
                                className={`relative p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer select-none overflow-hidden ${
                                    isReady
                                        ? "bg-slate-900/90 hover:bg-slate-800 border-cyan-500/50 hover:border-cyan-400 shadow-md shadow-cyan-900/20 active:scale-95"
                                        : "bg-slate-950/60 border-slate-800 opacity-60 cursor-not-allowed"
                                }`}
                            >
                                <span className="text-2xl mb-1">{skill?.icon || "⭕"}</span>
                                <span className="text-xs font-serif font-bold text-slate-200 line-clamp-1">
                                    {skill?.name || "Chưa Trang Bị"}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                    {cd > 0 ? `${cd.toFixed(1)}s` : isReady ? "Sẵn Sàng" : "Trống"}
                                </span>

                                {/* Cooldown Progress Overlay */}
                                {cd > 0 && skill && (
                                    <div
                                        className="absolute inset-0 bg-black/60 pointer-events-none"
                                        style={{ height: `${(cd / skill.cooldown) * 100}%` }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* 1 Ô Đại Thần Thông "Nhất Niệm" */}
                <div className="md:col-span-1">
                    <button
                        onClick={handleCastUltimate}
                        disabled={!combatState || combatState.playerRage < 100}
                        className={`w-full h-full min-h-[75px] p-3 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden ${
                            combatState && combatState.playerRage >= 100
                                ? "bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 border-amber-300 text-white shadow-xl shadow-rose-600/40 animate-pulse active:scale-95 cursor-pointer"
                                : "bg-slate-950/60 border-slate-800 text-slate-500 cursor-not-allowed"
                        }`}
                    >
                        <span className="text-2xl mb-0.5">{ultimateSkill?.icon || "🌌"}</span>
                        <span className="text-xs font-serif font-bold tracking-wide">
                            {ultimateSkill?.name || "Nhất Niệm"}
                        </span>
                        <span className="text-[10px] font-mono font-semibold">
                            {combatState && combatState.playerRage >= 100
                                ? "🔥 BẤM ĐỂ KHAI THIÊN!"
                                : `Cần 100 Nộ (${Math.floor(combatState?.playerRage || 0)}/100)`}
                        </span>
                    </button>
                </div>
            </div>

            {/* BẢNG ĐIỀU HƯỚNG & THÔNG TIN ẢI CỐT TRUYỆN */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrevStage}
                            disabled={selectedStageIndex === 0}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                            ◀
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-base font-bold font-serif text-amber-300">
                                    {currentStage.name}
                                </h4>
                                <span className="text-xs text-slate-400">({currentStage.area})</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{currentStage.desc}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                            onClick={handleNextStage}
                            disabled={selectedStageIndex >= STAGE_DATABASE.length - 1}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                            ▶
                        </button>
                        <button
                            onClick={() => startBattleWithStage(currentStage)}
                            disabled={!isUnlocked}
                            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold font-serif text-xs transition cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUnlocked ? "⚔️ Khiêu Chiến Ải Này" : "🔒 Chưa Đủ Cảnh Giới"}
                        </button>
                    </div>
                </div>

                {/* Chi Tiết Yêu Quái & Phần Thưởng */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
                    {/* Yêu Quái Trấn Ải */}
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-2xl">
                            {currentStage.monster.avatar}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-slate-200 flex items-center justify-between">
                                <span>{currentStage.monster.name}</span>
                                {currentStage.monster.isBoss && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 border border-red-500/40">
                                        BOSS
                                    </span>
                                )}
                            </div>
                            <div className="text-slate-400 mt-1 grid grid-cols-2 gap-1 font-mono">
                                <span>HP: {formatBigNumber(currentStage.monster.hp)}</span>
                                <span>Công: {formatBigNumber(currentStage.monster.attack)}</span>
                                <span>Thủ: {formatBigNumber(currentStage.monster.defense)}</span>
                                <span>Tốc: {currentStage.monster.attackSpeed}s</span>
                            </div>
                        </div>
                    </div>

                    {/* Phần Thưởng Khiêu Chiến */}
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-center">
                        <span className="text-slate-400 font-semibold mb-1">🎁 Phần Thưởng Rơi:</span>
                        <div className="flex flex-wrap items-center gap-3 font-mono font-semibold">
                            <span className="text-emerald-400">
                                +{formatBigNumber(currentStage.rewards.tuVi)} Tu Vi
                            </span>
                            <span className="text-amber-400">
                                +{formatBigNumber(currentStage.rewards.linhThach)} Linh Thạch
                            </span>
                            {currentStage.rewards.possibleDrops.length > 0 && (
                                <span className="text-purple-400">
                                    Vật phẩm: {currentStage.rewards.possibleDrops.join(", ")}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CombatTab;
