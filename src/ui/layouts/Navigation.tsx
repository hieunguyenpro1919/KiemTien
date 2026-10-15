import React from "react";
import { usePlayerStore } from "../../core/state/usePlayerStore";

export type NavTabId =
    | "cultivate"   // 🏛️ Động Phủ (Tu luyện & Tiềm năng)
    | "combat"      // ⚔️ Đấu Pháp (Chọn ải & Sàn đấu 2D)
    | "tower"       // 🗼 Hư Không Tháp
    | "pets"        // 🐾 Linh Thú
    | "inventory"   // 🎒 Hành Trang (Túi đồ & Trang bị)
    | "gacha"       // 🔮 Cầu Đạo (Đài rút thần thông)
    | "shop";       // 🏪 Bách Bảo Các

export interface NavTabItem {
    id: NavTabId;
    label: string;
    shortLabel: string;
    icon: string;
}

export const NAV_TABS: readonly NavTabItem[] = [
    { id: "cultivate", label: "Động Phủ", shortLabel: "Động Phủ", icon: "🏛️" },
    { id: "combat",    label: "Đấu Pháp", shortLabel: "Đấu Pháp", icon: "⚔️" },
    { id: "tower",     label: "Hư Không Tháp", shortLabel: "Hư Tháp", icon: "🗼" },
    { id: "pets",      label: "Linh Thú", shortLabel: "Linh Thú", icon: "🐾" },
    { id: "inventory", label: "Hành Trang", shortLabel: "Túi Đồ", icon: "🎒" },
    { id: "gacha",     label: "Cầu Đạo", shortLabel: "Cầu Đạo", icon: "🔮" },
    { id: "shop",      label: "Bách Bảo Các", shortLabel: "Bảo Các", icon: "🏪" }
];

interface NavigationProps {
    activeTab: NavTabId;
    onTabChange: (tabId: NavTabId) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
    const statPoints = usePlayerStore((s) => s.statPoints);

    return (
        <nav className="w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 sticky top-[57px] z-40 px-2 py-1.5 shadow-md">
            <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {NAV_TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const hasBadge = tab.id === "cultivate" && statPoints > 0;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 select-none ${
                                isActive
                                    ? "bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 text-amber-300 border border-amber-400/50 shadow-lg shadow-amber-500/20 font-semibold"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                            }`}
                        >
                            <span className="text-base">{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="sm:hidden">{tab.shortLabel}</span>

                            {/* Badge điểm tiềm năng chưa cộng */}
                            {hasBadge && (
                                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-red-600 text-white shadow-sm shadow-red-700/50 animate-bounce ml-0.5">
                                    +{statPoints}
                                </span>
                            )}

                            {/* Active Underline Glow */}
                            {isActive && (
                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full shadow-sm shadow-amber-400" />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
