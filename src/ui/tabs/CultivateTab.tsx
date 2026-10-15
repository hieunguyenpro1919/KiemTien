import React, { useState } from "react";
import { usePlayerStore, StatType } from "../../core/state/usePlayerStore";
import { RealmSystem } from "../../core/constants/realms.data";
import { ItemSystem, ItemSlotType } from "../../core/constants/items.data";
import { SkillSystem } from "../../core/constants/skills.data";
import { formatBigNumber, formatPercent } from "../../core/utils/format";

export const CultivateTab: React.FC = () => {
    const {
        realmIndex,
        tierIndex,
        tuVi,
        tinhNguyen,
        isVoCuc,
        statPoints,
        statVatLi,
        statPhep,
        statMau,
        equipped,
        equippedSkills,
        equippedUltimate,
        getMaxTuVi,
        getAfkRate,
        getBreakthroughGate,
        getBreakthroughRate,
        getTotalStats,
        addTuVi,
        allocateStat,
        allocateStatMax,
        resetStats,
        unequipItem,
        attemptBreakthrough,
        quickBreakthrough
    } = usePlayerStore();

    const [actionMessage, setActionMessage] = useState<{
        type: "success" | "error" | "info";
        text: string;
    } | null>(null);

    const maxTuVi = getMaxTuVi();
    const afkRate = getAfkRate();
    const gate = getBreakthroughGate();
    const tribulation = getBreakthroughRate();
    const pStats = getTotalStats();

    const currentResource = isVoCuc ? tinhNguyen : tuVi;
    const canAttempt = currentResource.gte(maxTuVi) && !gate.blocked;
    const realmColor = RealmSystem.getRealmColor(realmIndex, isVoCuc);
    const realm = RealmSystem.getRealm(realmIndex);
    const realmTitle = RealmSystem.getFullRealmTitle(realmIndex, tierIndex, isVoCuc);

    // Tính % thanh tiến độ
    let progressPct = 0;
    if (maxTuVi.gt(0)) {
        progressPct = Math.min(100, Math.max(0, currentResource.div(maxTuVi).times(100).toNumber()));
    }

    // Xử lý bấm Đột Phá
    const handleBreakthrough = () => {
        const res = attemptBreakthrough();
        if (res.success) {
            setActionMessage({ type: "success", text: res.msg });
        } else {
            setActionMessage({ type: "error", text: res.msg });
        }
    };

    // Xử lý bấm Đột Phá Nhanh
    const handleQuickBreakthrough = () => {
        const res = quickBreakthrough();
        if (res.success) {
            setActionMessage({ type: "success", text: res.message });
        } else {
            setActionMessage({ type: "error", text: res.message });
        }
    };

    // Xử lý Đả Tọa bằng tay (+1 nhịp tu vi)
    const handleManualCultivate = () => {
        const gain = afkRate.times(5).max(10);
        addTuVi(gain);
        setActionMessage({
            type: "info",
            text: `🧘‍♂️ Đạo hữu vừa đả tọa ngưng tụ được +${formatBigNumber(gain)} Tu Vi!`
        });
    };

    // 3 Thuộc tính tiềm năng chuẩn bản V3
    const STAT_CONFIGS: {
        type: StatType;
        label: string;
        icon: string;
        color: string;
        currentPoints: number;
        currentVal: string;
        addedText: string;
        tooltip: string;
    }[] = [
        {
            type: "vat_li",
            label: "Công Vật Lí",
            icon: "⚔️",
            color: "text-amber-400",
            currentPoints: statVatLi,
            currentVal: formatBigNumber(pStats.vatLi),
            addedText: statVatLi > 0
                ? `(+${formatBigNumber(pStats.allocatedVatLi)} • +${pStats.bonusVatLiPct}% từ ${statVatLi}đ)`
                : `(+0 từ 0đ)`,
            tooltip: "Mỗi điểm: +5 Công Vật Lí & +0.35% Tổng Sát Thương VL. Mỗi 20 điểm: +1% Bạo Kích."
        },
        {
            type: "phep",
            label: "Công Phép",
            icon: "🔮",
            color: "text-cyan-400",
            currentPoints: statPhep,
            currentVal: formatBigNumber(pStats.phep),
            addedText: statPhep > 0
                ? `(+${formatBigNumber(pStats.allocatedPhep)} • +${pStats.bonusPhepPct}% từ ${statPhep}đ)`
                : `(+0 từ 0đ)`,
            tooltip: "Mỗi điểm: +5 Công Phép & +0.35% Tổng Sát Thương Phép. Mỗi 20 điểm: +1 Kháng Phép."
        },
        {
            type: "mau",
            label: "Sinh Lực (Máu)",
            icon: "❤️",
            color: "text-rose-400",
            currentPoints: statMau,
            currentVal: formatBigNumber(pStats.maxHp),
            addedText: statMau > 0
                ? `(+${formatBigNumber(pStats.allocatedHp)} HP • +${pStats.bonusHpPct}% từ ${statMau}đ)`
                : `(+0 HP từ 0đ)`,
            tooltip: "Mỗi điểm: +30 HP & +0.4% Tổng Máu Tối Đa. Mỗi 10 điểm: +1 Phòng Ngự & +1 Kháng Phép."
        }
    ];

    // Cấu hình 3 Ô Trang Bị
    const EQUIP_SLOTS: {
        slot: ItemSlotType;
        title: string;
        iconDefault: string;
    }[] = [
        { slot: "non",   title: "Thần Quán (Nón)",  iconDefault: "👑" },
        { slot: "giap",  title: "Thánh Giáp (Áo)",   iconDefault: "🛡️" },
        { slot: "vukhi", title: "Thần Kiếm (Vũ Khí)", iconDefault: "⚔️" }
    ];

    // Lấy thông tin Đại Thần Thông đang trang bị
    const ultimateSkill = SkillSystem.getUltimateById(equippedUltimate);

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
            {/* Thông báo kết quả thao tác (Toast Banner) */}
            {actionMessage && (
                <div
                    className={`flex items-center justify-between p-3.5 rounded-xl border backdrop-blur-md transition-all duration-300 animate-fadeIn ${
                        actionMessage.type === "success"
                            ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-200"
                            : actionMessage.type === "error"
                            ? "bg-rose-950/70 border-rose-500/50 text-rose-200"
                            : "bg-cyan-950/70 border-cyan-500/50 text-cyan-200"
                    }`}
                >
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
                        <span>{actionMessage.type === "success" ? "✨" : actionMessage.type === "error" ? "⚡" : "ℹ️"}</span>
                        <span>{actionMessage.text}</span>
                    </div>
                    <button
                        onClick={() => setActionMessage(null)}
                        className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Layout 3 Cột Chuẩn Bản V3 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* ================= CỘT 1 (BÊN TRÁI): BẢNG CỘNG ĐIỂM TIỀM NĂNG ================= */}
                <div className="lg:col-span-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">📊</span>
                                <h2 className="font-serif font-bold text-slate-100 text-sm tracking-wide">
                                    ĐIỂM TIỀM NĂNG
                                </h2>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-semibold">
                                <span>Khả dụng:</span>
                                <span className="text-sm font-bold text-amber-400">+{statPoints}</span>
                            </div>
                        </div>

                        {/* 3 Hàng Thuộc Tính Chuẩn V3 */}
                        <div className="space-y-3.5">
                            {STAT_CONFIGS.map((stat) => (
                                <div
                                    key={stat.type}
                                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-slate-700/80 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{stat.icon}</span>
                                            <span className={`font-semibold text-xs sm:text-sm ${stat.color}`}>
                                                {stat.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 font-mono">
                                            <span className="text-slate-400 text-xs font-medium">({stat.currentPoints}đ)</span>
                                            <span className="font-bold text-sm text-slate-100">{stat.currentVal}</span>
                                        </div>
                                    </div>

                                    <p
                                        className="text-[11px] text-slate-400 mb-3 cursor-help border-b border-dotted border-slate-700/60 inline-block"
                                        title={stat.tooltip}
                                    >
                                        {stat.addedText}
                                    </p>

                                    {/* Cụm Nút Cộng Điểm: +1, +5, +Max */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={statPoints < 1}
                                            onClick={() => allocateStat(stat.type, 1)}
                                            className="flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg bg-slate-800/80 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-slate-800/80 text-white border border-slate-700/60 transition-all cursor-pointer disabled:cursor-not-allowed"
                                        >
                                            +1
                                        </button>
                                        <button
                                            disabled={statPoints < 5}
                                            onClick={() => allocateStat(stat.type, 5)}
                                            className="flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg bg-slate-800/80 hover:bg-teal-600 disabled:opacity-40 disabled:hover:bg-slate-800/80 text-teal-200 hover:text-white border border-slate-700/60 transition-all cursor-pointer disabled:cursor-not-allowed"
                                        >
                                            +5
                                        </button>
                                        <button
                                            disabled={statPoints < 1}
                                            onClick={() => allocateStatMax(stat.type)}
                                            className="flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg bg-slate-800/80 hover:bg-amber-600 disabled:opacity-40 disabled:hover:bg-slate-800/80 text-amber-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer disabled:cursor-not-allowed"
                                            title="Cộng toàn bộ điểm khả dụng vào thuộc tính này"
                                        >
                                            +Max
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Nút Tẩy Tủy */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80">
                        <button
                            onClick={() => {
                                const returned = resetStats();
                                if (returned > 0) {
                                    setActionMessage({
                                        type: "info",
                                        text: `🔄 Tẩy tủy thành công! Thu hồi nguyên vẹn ${returned} điểm tiềm năng.`
                                    });
                                } else {
                                    setActionMessage({
                                        type: "info",
                                        text: "Chưa phân bổ điểm tiềm năng nào để tẩy tủy."
                                    });
                                }
                            }}
                            className="w-full py-2.5 px-3 text-xs font-semibold rounded-xl bg-slate-950/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            <span>🔄</span>
                            <span>Tẩy Tủy Hoàn Trả Điểm</span>
                        </button>
                    </div>
                </div>

                {/* ================= CỘT 2 (Ở GIỮA): TU LUYỆN, ĐỘ KIẾP & ĐỘT PHÁ ================= */}
                <div className="lg:col-span-4 bg-gradient-to-b from-slate-900/80 to-slate-950/90 backdrop-blur-xl border border-amber-500/25 rounded-2xl p-6 shadow-2xl shadow-black/80 flex flex-col justify-between relative overflow-hidden">
                    <div
                        className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
                        style={{ backgroundColor: realmColor }}
                    />

                    <div>
                        {/* Header Cảnh Giới */}
                        <div className="text-center mb-6">
                            <div
                                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-950/80 border-2 shadow-2xl mb-3 relative"
                                style={{ borderColor: realmColor }}
                            >
                                <span className="text-4xl animate-pulse">🧘‍♂️</span>
                                <div
                                    className="absolute inset-0 rounded-full blur-md opacity-40 pointer-events-none"
                                    style={{ backgroundColor: realmColor }}
                                />
                            </div>

                            <h2
                                className="text-xl sm:text-2xl font-bold font-serif tracking-wider mb-1"
                                style={{ color: realmColor }}
                            >
                                {realmTitle}
                            </h2>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed italic">
                                "{realm.desc}"
                            </p>
                        </div>

                        {/* Thanh Tiến Độ Tu Vi */}
                        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 mb-4 shadow-inner">
                            <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-slate-400">Tiến Độ Tu Vi:</span>
                                <span className="font-mono font-bold text-amber-300">
                                    {formatBigNumber(currentResource)} / {formatBigNumber(maxTuVi)} {isVoCuc ? "🌌" : "Tu Vi"}
                                </span>
                            </div>

                            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative mb-2">
                                <div
                                    className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 shadow-md shadow-emerald-500/50"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                    <span>🍃</span>
                                    <span>Thu Thập Tự Nhiên:</span>
                                </span>
                                <span className="font-mono font-semibold text-emerald-300">
                                    +{formatBigNumber(afkRate)} / giây
                                </span>
                            </div>
                        </div>

                        {/* Cảnh Báo Bình Cảnh */}
                        {gate.blocked && (
                            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs mb-4 flex items-center gap-2 animate-pulse">
                                <span className="text-lg">🚨</span>
                                <div className="leading-tight">
                                    <span className="font-bold text-red-400">Bình Cảnh Chặn Đường: </span>
                                    <span>{gate.message}</span>
                                </div>
                            </div>
                        )}

                        {/* Tỉ Lệ Độ Kiếp */}
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 mb-6">
                            <div className="flex items-center gap-1.5">
                                <span>⚡</span>
                                <span>Tỉ lệ độ kiếp:</span>
                                <span className="font-mono font-bold text-amber-400">
                                    {formatPercent(tribulation.totalRate)}
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-400 italic">
                                (Thất bại tổn thất 20% tu vi)
                            </span>
                        </div>
                    </div>

                    {/* Cụm Nút Hành Động */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                disabled={!canAttempt}
                                onClick={handleBreakthrough}
                                className={`py-3.5 px-4 rounded-xl font-bold font-serif text-sm tracking-wide shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                                    canAttempt
                                        ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/30 scale-[1.02] active:scale-95"
                                        : "bg-slate-800/50 text-slate-400 border border-slate-700/40 opacity-60 cursor-not-allowed"
                                }`}
                            >
                                <span>⚡</span>
                                <span>ĐỘT PHÁ</span>
                            </button>

                            <button
                                disabled={!canAttempt}
                                onClick={handleQuickBreakthrough}
                                className="py-3.5 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-50 text-amber-300 border border-amber-500/30 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                title="Đột phá liên tục nhiều tầng cho đến khi hết tu vi hoặc chạm bình cảnh"
                            >
                                <span>⏩</span>
                                <span>Đột Phá Nhanh</span>
                            </button>
                        </div>

                        <button
                            onClick={handleManualCultivate}
                            className="w-full py-2.5 px-4 rounded-xl font-medium text-xs bg-slate-900/60 hover:bg-slate-800/60 text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <span>🧘‍♂️</span>
                            <span>Đả Tọa Tụ Khí (+5x Tốc Độ AFK)</span>
                        </button>
                    </div>
                </div>

                {/* ================= CỘT 3 (BÊN PHẢI): TRANG BỊ, KỸ NĂNG & CHỈ SỐ ================= */}
                <div className="lg:col-span-4 space-y-5">

                    {/* [1] CỤM 3 Ô TRANG BỊ ĐẠO THÂN */}
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-xl">
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">👑</span>
                                <h3 className="font-serif font-bold text-slate-100 text-xs sm:text-sm tracking-wide">
                                    TRANG BỊ ĐẠO THÂN
                                </h3>
                            </div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                                3 Ô Cốt Lõi
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                            {EQUIP_SLOTS.map((slotItem) => {
                                const itemId = equipped[slotItem.slot];
                                const item = ItemSystem.getItemById(itemId);
                                const rarity = item ? ItemSystem.getRarityInfo(item.rarity) : null;

                                return (
                                    <div
                                        key={slotItem.slot}
                                        className={`relative p-2.5 rounded-xl flex flex-col items-center text-center transition-all duration-200 ${
                                            item && rarity
                                                ? "border shadow-lg"
                                                : "border-2 border-dashed border-slate-800 bg-slate-950/40 text-slate-400"
                                        }`}
                                        style={{
                                            borderColor: rarity ? rarity.border : undefined,
                                            backgroundColor: rarity ? rarity.bg : undefined
                                        }}
                                    >
                                        {/* Icon */}
                                        <div className="text-2xl mb-1">
                                            {item ? item.icon : slotItem.iconDefault}
                                        </div>

                                        {/* Tên & Phẩm Cấp */}
                                        <div
                                            className="text-[11px] font-bold line-clamp-1 mb-0.5"
                                            style={{ color: rarity ? rarity.color : "#94a3b8" }}
                                            title={item ? item.name : slotItem.title}
                                        >
                                            {item ? item.name : slotItem.title}
                                        </div>

                                        {/* Chỉ Số Rút Gọn */}
                                        {item ? (
                                            <div className="text-[10px] text-slate-300 font-mono mb-2 line-clamp-1">
                                                {item.stats.mau ? `+${item.stats.mau} HP ` : ""}
                                                {item.stats.vatLi ? `+${item.stats.vatLi} VL ` : ""}
                                                {item.stats.phep ? `+${item.stats.phep} Phép ` : ""}
                                                {item.stats.phongThu ? `+${item.stats.phongThu} Thủ ` : ""}
                                            </div>
                                        ) : (
                                            <div className="text-[9px] text-slate-400 font-mono mb-2 italic">
                                                Chưa trang bị
                                            </div>
                                        )}

                                        {/* Nút Tháo / Đổi */}
                                        {item && (
                                            <button
                                                onClick={() => unequipItem(slotItem.slot)}
                                                className="w-full py-0.5 text-[10px] font-medium rounded bg-slate-900/80 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700/60 transition-colors cursor-pointer"
                                            >
                                                Tháo
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* [2] CỤM KỸ NĂNG XUẤT TRẬN & ĐẠI THẦN THÔNG */}
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-xl">
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">📜</span>
                                <h3 className="font-serif font-bold text-slate-100 text-xs sm:text-sm tracking-wide">
                                    KỸ NĂNG XUẤT TRẬN & THẦN THÔNG
                                </h3>
                            </div>
                            <span className="text-[10px] text-amber-400 font-mono font-semibold">
                                3 Chiêu + 1 Tuyệt Kỹ
                            </span>
                        </div>

                        {/* 3 Ô Kỹ Năng Thường */}
                        <div className="grid grid-cols-3 gap-2.5 mb-3">
                            {equippedSkills.map((skillId, idx) => {
                                const skill = SkillSystem.getSkillById(skillId);

                                return (
                                    <div
                                        key={idx}
                                        className={`p-2 rounded-xl flex flex-col items-center text-center transition-all ${
                                            skill
                                                ? "bg-slate-950/80 border border-cyan-500/30 shadow-md"
                                                : "border-2 border-dashed border-slate-800 bg-slate-950/40 text-slate-400"
                                        }`}
                                    >
                                        <div className="text-xl mb-0.5">{skill ? skill.icon : "➕"}</div>
                                        <div className="text-[11px] font-semibold text-slate-200 line-clamp-1">
                                            {skill ? skill.name : `Ô Chiêu ${idx + 1}`}
                                        </div>
                                        <div className="text-[10px] text-cyan-400 font-mono">
                                            {skill ? `CD: ${skill.cooldown}s` : "Chưa Gán"}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 1 Ô ĐẠI THẦN THÔNG TRẤN THÂN (Nổi bật rực rỡ) */}
                        {ultimateSkill && (
                            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/50 via-slate-950/90 to-amber-950/40 border-2 border-amber-400/60 shadow-xl shadow-amber-500/10 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 shadow-inner">
                                        <span className="text-2xl animate-pulse">{ultimateSkill.icon}</span>
                                        <div className="absolute inset-0 rounded-xl bg-amber-400/20 blur-sm pointer-events-none" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-serif font-bold text-amber-300">
                                                {ultimateSkill.name}
                                            </span>
                                            <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase">
                                                Thần Cấp
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-300 line-clamp-1">
                                            {ultimateSkill.shortDesc}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <div className="text-[10px] text-slate-400 font-mono">Tiêu Hao:</div>
                                    <div className="text-xs font-mono font-bold text-amber-400">
                                        {ultimateSkill.rageCost} Nộ
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* [3] BẢNG TỔNG HỢP CHỈ SỐ CHIẾN ĐẤU (V3) */}
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-xl">
                        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800/80 mb-3">
                            <span className="text-lg">⚔️</span>
                            <h3 className="font-serif font-bold text-slate-100 text-xs sm:text-sm tracking-wide">
                                CHỈ SỐ CHIẾN ĐẤU (V3)
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/70 flex justify-between">
                                <span className="text-slate-400">❤️ Sinh Lực:</span>
                                <span className="font-mono font-bold text-rose-400">{formatBigNumber(pStats.maxHp)}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/70 flex justify-between">
                                <span className="text-slate-400">⚔️ Công VL:</span>
                                <span className="font-mono font-bold text-amber-400">{formatBigNumber(pStats.vatLi)}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/70 flex justify-between">
                                <span className="text-slate-400">🔮 Công Phép:</span>
                                <span className="font-mono font-bold text-cyan-400">{formatBigNumber(pStats.phep)}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/70 flex justify-between">
                                <span className="text-slate-400">🛡️ Phòng Thủ:</span>
                                <span className="font-mono font-bold text-blue-400">{formatBigNumber(pStats.phongThu)}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/70 flex justify-between">
                                <span className="text-slate-400">💠 Kháng Phép:</span>
                                <span className="font-mono font-bold text-indigo-300">{formatBigNumber(pStats.khangPhep)}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/70 flex justify-between">
                                <span className="text-slate-400">💥 Bạo Kích:</span>
                                <span className="font-mono font-bold text-yellow-300">{pStats.baoKich}%</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};
