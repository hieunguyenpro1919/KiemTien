import React from "react";
import { usePlayerStore } from "../../core/state/usePlayerStore";
import { RealmSystem } from "../../core/constants/realms.data";
import { GAME_VERSION, GAME_CODENAME } from "../../core/constants/version";
import { formatBigNumber, formatPercent } from "../../core/utils/format";

export const Header: React.FC = () => {
    const {
        name,
        realmIndex,
        tierIndex,
        tuVi,
        tinhNguyen,
        isVoCuc,
        currencies,
        getMaxTuVi
    } = usePlayerStore();

    const maxTuVi = getMaxTuVi();
    const realmColor = RealmSystem.getRealmColor(realmIndex, isVoCuc);
    const realmTitle = RealmSystem.getFullRealmTitle(realmIndex, tierIndex, isVoCuc);

    // Tính phần trăm tiến độ Tu Vi
    const currentResource = isVoCuc ? tinhNguyen : tuVi;
    let progressPct = 0;
    if (maxTuVi.gt(0)) {
        progressPct = Math.min(100, Math.max(0, currentResource.div(maxTuVi).times(100).toNumber()));
    }

    return (
        <header className="sticky top-0 z-50 w-full bg-slate-950/85 backdrop-blur-xl border-b border-amber-500/20 shadow-2xl shadow-black/80">
            {/* Thanh thông tin trên cùng */}
            <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
                {/* Logo & Tên Game */}
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-400/40 shadow-inner">
                        <span className="text-2xl animate-pulse">☯️</span>
                        <div className="absolute inset-0 rounded-xl bg-amber-400/10 blur-sm pointer-events-none" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-base sm:text-lg font-bold tracking-wider font-serif bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                                TIÊN ĐẠO TRƯỜNG SINH
                            </h1>
                            <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-sm">
                                {GAME_VERSION} [{GAME_CODENAME}]
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="font-medium text-slate-200">Đạo hữu: {name}</span>
                            <span>•</span>
                            <span className="text-amber-300 font-mono text-[11px]">Nghịch Thiên Tu Đạo</span>
                        </div>
                    </div>
                </div>

                {/* Khối Cảnh Giới & Thanh Tiến Độ Tu Vi */}
                <div className="flex-1 min-w-[220px] max-w-md mx-auto sm:mx-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span
                            className="font-semibold tracking-wide px-2 py-0.5 rounded-md border text-[11px] shadow-sm flex items-center gap-1.5"
                            style={{
                                color: realmColor,
                                borderColor: `${realmColor}55`,
                                backgroundColor: `${realmColor}15`
                            }}
                        >
                            <span>✨</span>
                            {realmTitle}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                            {formatPercent(progressPct)}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative w-full h-2.5 bg-slate-900/90 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                        <div
                            className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 shadow-lg shadow-emerald-500/50"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>Linh Khí:</span>
                        <span>
                            {formatBigNumber(currentResource)} / {formatBigNumber(maxTuVi)} {isVoCuc ? "🌌" : "Tu Vi"}
                        </span>
                    </div>
                </div>

                {/* Dải Tiền Tệ & Tài Nguyên */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Linh Thạch */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-cyan-500/20 shadow-sm text-xs">
                        <span className="text-sm">💎</span>
                        <div className="flex flex-col">
                            <span className="font-mono font-bold text-cyan-300 leading-tight">
                                {formatBigNumber(currencies.linhThach)}
                            </span>
                            <span className="text-[9px] text-slate-500 leading-none">Linh Thạch</span>
                        </div>
                    </div>

                    {/* Hỗn Nguyên Thạch */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-indigo-500/30 shadow-sm text-xs">
                        <span className="text-sm">🌀</span>
                        <div className="flex flex-col">
                            <span className="font-mono font-bold text-indigo-300 leading-tight">
                                {formatBigNumber(currencies.honNguyenThach)}
                            </span>
                            <span className="text-[9px] text-indigo-400/60 leading-none">Hỗn Nguyên</span>
                        </div>
                    </div>

                    {/* Tinh Nguyên Đại Đạo (Hiển thị khi ở Vô Cực hoặc đã có Tinh Nguyên) */}
                    {(isVoCuc || currencies.tinhNguyen.gt(0)) && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-amber-400/50 shadow-md shadow-amber-500/10 text-xs animate-pulse">
                            <span className="text-sm">🌌</span>
                            <div className="flex flex-col">
                                <span className="font-mono font-bold text-amber-300 leading-tight">
                                    {formatBigNumber(currencies.tinhNguyen)}
                                </span>
                                <span className="text-[9px] text-amber-400/60 leading-none">Tinh Nguyên</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
