import React, { useState, useMemo } from "react";
import { usePlayerStore, StatType } from "../../core/state/usePlayerStore";
import { RealmSystem } from "../../core/constants/realms.data";
import { ItemSystem, RARITY_INFO, ItemSlotType } from "../../core/constants/items.data";
import { SkillSystem } from "../../core/constants/skills.data";
import { formatBigNumber } from "../../core/utils/format";

type InventoryFilterType = "all" | "equip" | "skill" | "dan_duoc";

export const CultivateTab: React.FC = () => {
    // Zustand State & Actions
    const name = usePlayerStore(s => s.name);
    const setName = usePlayerStore(s => s.setName);
    const title = usePlayerStore(s => s.title);
    const setTitle = usePlayerStore(s => s.setTitle);
    const realmIndex = usePlayerStore(s => s.realmIndex);
    const tierIndex = usePlayerStore(s => s.tierIndex);
    const tuVi = usePlayerStore(s => s.tuVi);
    const isVoCuc = usePlayerStore(s => s.isVoCuc);
    const statPoints = usePlayerStore(s => s.statPoints);
    const statVatLi = usePlayerStore(s => s.statVatLi);
    const statPhep = usePlayerStore(s => s.statPhep);
    const statMau = usePlayerStore(s => s.statMau);
    const equipped = usePlayerStore(s => s.equipped);
    const equippedSkills = usePlayerStore(s => s.equippedSkills);
    const equippedUltimate = usePlayerStore(s => s.equippedUltimate);
    const inventory = usePlayerStore(s => s.inventory);
    const learnedSkills = usePlayerStore(s => s.learnedSkills);

    const getMaxTuVi = usePlayerStore(s => s.getMaxTuVi);
    const getAfkRate = usePlayerStore(s => s.getAfkRate);
    const getBreakthroughGate = usePlayerStore(s => s.getBreakthroughGate);
    const getBreakthroughRate = usePlayerStore(s => s.getBreakthroughRate);
    const getTotalStats = usePlayerStore(s => s.getTotalStats);

    const allocateStat = usePlayerStore(s => s.allocateStat);
    const allocateStatMax = usePlayerStore(s => s.allocateStatMax);
    const resetStats = usePlayerStore(s => s.resetStats);
    const equipItem = usePlayerStore(s => s.equipItem);
    const unequipItem = usePlayerStore(s => s.unequipItem);
    const equipSkill = usePlayerStore(s => s.equipSkill);
    const unequipSkill = usePlayerStore(s => s.unequipSkill);
    const quickEquipSkill = usePlayerStore(s => s.quickEquipSkill);
    const equipUltimate = usePlayerStore(s => s.equipUltimate);
    const useConsumable = usePlayerStore(s => s.useConsumable);
    const sellItem = usePlayerStore(s => s.sellItem);
    const sellAllDuplicateEquipment = usePlayerStore(s => s.sellAllDuplicateEquipment);
    const attemptBreakthrough = usePlayerStore(s => s.attemptBreakthrough);
    const quickBreakthrough = usePlayerStore(s => s.quickBreakthrough);

    // Local UI State
    const [invFilter, setInvFilter] = useState<InventoryFilterType>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    // Modals
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [tempName, setTempName] = useState(name);
    const [titleModalOpen, setTitleModalOpen] = useState(false);
    const [equipModalSlot, setEquipModalSlot] = useState<ItemSlotType | null>(null);
    const [skillModalSlot, setSkillModalSlot] = useState<0 | 1 | 2 | null>(null);
    const [quickSellModalOpen, setQuickSellModalOpen] = useState(false);

    // Calculations
    const maxTuVi = getMaxTuVi();
    const afkRate = getAfkRate();
    const breakthroughGate = getBreakthroughGate();
    const breakthroughRate = getBreakthroughRate();
    const totalStats = getTotalStats();
    const realmData = isVoCuc
        ? { name: "Cảnh Giới Vô Cực", hanzi: "无极", desc: "Phá vỡ giới hạn thiên đạo vũ trụ, quy chân phản phác, đạt đến cảnh giới vô cùng vô tận.", color: "#00f2fe" }
        : RealmSystem.getRealm(realmIndex);

    const progressPct = useMemo(() => {
        if (!maxTuVi || maxTuVi.lte(0)) return 0;
        const ratio = tuVi.div(maxTuVi).toNumber();
        return Math.min(100, Math.max(0, Math.floor(ratio * 100)));
    }, [tuVi, maxTuVi]);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 3000);
    };

    // Inventory grouping
    const itemMap = useMemo(() => {
        const map = new Map<string, number>();
        inventory.forEach(id => {
            map.set(id, (map.get(id) || 0) + 1);
        });
        return map;
    }, [inventory]);

    // Inventory items & skills list
    const filteredEntries = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const entries: Array<{ type: "item" | "skill"; id: string; count: number }> = [];

        // 1. Items
        if (invFilter === "all" || invFilter === "equip" || invFilter === "dan_duoc") {
            itemMap.forEach((count, id) => {
                const item = ItemSystem.getItemById(id);
                if (!item) return;

                const isEquip = ["non", "giap", "vukhi"].includes(item.slot);
                const isDan = item.slot === "dan_duoc" || item.slot === "item";

                if (invFilter === "equip" && !isEquip) return;
                if (invFilter === "dan_duoc" && !isDan) return;

                if (query) {
                    const matchName = item.name.toLowerCase().includes(query);
                    const matchDesc = item.desc.toLowerCase().includes(query);
                    if (!matchName && !matchDesc) return;
                }

                entries.push({ type: "item", id, count });
            });
        }

        // 2. Learned Skills
        if (invFilter === "all" || invFilter === "skill") {
            learnedSkills.forEach(id => {
                const skill = SkillSystem.getSkillById(id);
                if (!skill) return;

                if (query) {
                    const matchName = skill.name.toLowerCase().includes(query);
                    const matchDesc = skill.desc.toLowerCase().includes(query);
                    if (!matchName && !matchDesc) return;
                }

                entries.push({ type: "skill", id, count: 1 });
            });
        }

        return entries;
    }, [invFilter, searchQuery, itemMap, learnedSkills]);

    // Counts for tabs
    const countEquip = useMemo(() => {
        return inventory.filter(id => {
            const it = ItemSystem.getItemById(id);
            return it && ["non", "giap", "vukhi"].includes(it.slot);
        }).length;
    }, [inventory]);

    const countDan = useMemo(() => {
        return inventory.filter(id => {
            const it = ItemSystem.getItemById(id);
            return it && (it.slot === "dan_duoc" || it.slot === "item");
        }).length;
    }, [inventory]);

    const countSkills = learnedSkills.length;
    const countAll = inventory.length + countSkills;

    // Duplicate equipment summary
    const dupsSummary = useMemo(() => {
        let totalCount = 0;
        let totalGain = 0;
        const list: Array<{ item: any; count: number; gain: number }> = [];

        itemMap.forEach((count, id) => {
            const it = ItemSystem.getItemById(id);
            if (it && ["non", "giap", "vukhi"].includes(it.slot)) {
                const isWorn = Object.values(equipped).includes(id);
                const keep = isWorn ? 0 : 1;
                const dups = Math.max(0, count - keep);
                if (dups > 0) {
                    const gain = (it.sellPrice || 10) * dups;
                    totalCount += dups;
                    totalGain += gain;
                    list.push({ item: it, count: dups, gain });
                }
            }
        });

        return { totalCount, totalGain, list };
    }, [itemMap, equipped]);

    // Handle Breakthrough
    const handleBreakthrough = () => {
        const res = attemptBreakthrough();
        showToast(res.msg);
    };

    const handleQuickBreakthrough = () => {
        const res = quickBreakthrough();
        showToast(res.message);
    };

    const handleAllocate = (type: StatType, amt: number) => {
        if (amt === -1) {
            allocateStatMax(type);
        } else {
            allocateStat(type, amt);
        }
    };

    return (
        <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 py-4 space-y-4">
            {/* Toast Notification */}
            {toastMsg && (
                <div className="fixed top-20 right-4 z-50 bg-slate-900 border-2 border-amber-400 text-amber-200 px-4 py-3 rounded-xl shadow-2xl animate-bounce">
                    {toastMsg}
                </div>
            )}

            {/* ================= HÀNG 1: 3 CỘT (ĐIỂM TIỀM NĂNG - ĐỘNG PHỦ - 3 Ô TRANG BỊ) ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

                {/* CỘT 1 (BÊN TRÁI): BẢNG ĐIỂM TIỀM NĂNG & CHỈ SỐ (lg:col-span-4) */}
                <div className="lg:col-span-4 bg-slate-950/80 border border-teal-900/40 rounded-xl p-4 shadow-xl backdrop-blur-md flex flex-col justify-between">
                    <div>
                        {/* Panel Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-teal-900/40 mb-3">
                            <h2 className="text-sm font-bold font-serif text-teal-300 flex items-center gap-2">
                                <span>📊</span> ĐIỂM TIỀM NĂNG & CHỈ SỐ
                            </h2>
                            <button
                                onClick={() => {
                                    const pts = resetStats();
                                    if (pts > 0) showToast(`Đã tẩy tủy, hoàn lại ${pts} điểm tiềm năng!`);
                                }}
                                className="text-[11px] px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-semibold transition cursor-pointer"
                                title="Tẩy tủy hoàn trả 100% điểm tiềm năng"
                            >
                                🧪 Tẩy Tủy
                            </button>
                        </div>

                        {/* Điểm Khả Dụng */}
                        <div className="flex items-center justify-between bg-slate-900/80 rounded-lg p-2.5 mb-3 border border-slate-800">
                            <span className="text-xs text-slate-300">Điểm Khả Dụng (+4/tầng):</span>
                            <span className="text-lg font-bold font-mono text-amber-400">
                                {statPoints}
                            </span>
                        </div>

                        {/* 3 Hàng Thuộc Tính Chuẩn V3 */}
                        <div className="space-y-2.5">
                            {/* Hàng Vật Lí */}
                            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 hover:border-teal-500/30 transition">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-semibold text-slate-300">⚔️ Sát Thương Vật Lí</span>
                                    <span className="text-sm font-bold font-mono text-emerald-400">
                                        {formatBigNumber(totalStats.vatLi)}
                                    </span>
                                </div>
                                <div className="text-[11px] text-slate-400 mb-2 font-mono">
                                    (+{formatBigNumber(totalStats.allocatedVatLi)} • +{totalStats.bonusVatLiPct}% từ {statVatLi}đ)
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => handleAllocate("vat_li", 100)}
                                        disabled={statPoints < 100}
                                        className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-bold font-mono text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        +100
                                    </button>
                                    <button
                                        onClick={() => handleAllocate("vat_li", 500)}
                                        disabled={statPoints < 500}
                                        className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-bold font-mono text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        +500
                                    </button>
                                    <button
                                        onClick={() => handleAllocate("vat_li", -1)}
                                        disabled={statPoints < 1}
                                        className="flex-1 py-1 rounded bg-amber-600 hover:bg-amber-500 text-[11px] font-bold font-mono text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        Max
                                    </button>
                                </div>
                            </div>

                            {/* Hàng Phép */}
                            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 hover:border-teal-500/30 transition">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-semibold text-slate-300">🔮 Sát Thương Phép</span>
                                    <span className="text-sm font-bold font-mono text-cyan-400">
                                        {formatBigNumber(totalStats.phep)}
                                    </span>
                                </div>
                                <div className="text-[11px] text-slate-400 mb-2 font-mono">
                                    (+{formatBigNumber(totalStats.allocatedPhep)} • +{totalStats.bonusPhepPct}% từ {statPhep}đ)
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => handleAllocate("phep", 100)}
                                        disabled={statPoints < 100}
                                        className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-bold font-mono text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        +100
                                    </button>
                                    <button
                                        onClick={() => handleAllocate("phep", 500)}
                                        disabled={statPoints < 500}
                                        className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-bold font-mono text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        +500
                                    </button>
                                    <button
                                        onClick={() => handleAllocate("phep", -1)}
                                        disabled={statPoints < 1}
                                        className="flex-1 py-1 rounded bg-amber-600 hover:bg-amber-500 text-[11px] font-bold font-mono text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        Max
                                    </button>
                                </div>
                            </div>

                            {/* Hàng Máu */}
                            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 hover:border-teal-500/30 transition">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-semibold text-slate-300">❤️ Sinh Mệnh (HP)</span>
                                    <span className="text-sm font-bold font-mono text-rose-400">
                                        {formatBigNumber(totalStats.maxHp)}
                                    </span>
                                </div>
                                <div className="text-[11px] text-slate-400 mb-2 font-mono">
                                    (+{formatBigNumber(totalStats.allocatedHp)} HP • +{totalStats.bonusHpPct}% từ {statMau}đ)
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => handleAllocate("mau", 100)}
                                        disabled={statPoints < 100}
                                        className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-bold font-mono text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        +100
                                    </button>
                                    <button
                                        onClick={() => handleAllocate("mau", 500)}
                                        disabled={statPoints < 500}
                                        className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-bold font-mono text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        +500
                                    </button>
                                    <button
                                        onClick={() => handleAllocate("mau", -1)}
                                        disabled={statPoints < 1}
                                        className="flex-1 py-1 rounded bg-amber-600 hover:bg-amber-500 text-[11px] font-bold font-mono text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        Max
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chỉ số phụ (Phòng Ngự & Bạo Kích) */}
                    <div className="mt-3 p-3 rounded-xl bg-black/40 border border-dashed border-slate-700/60 flex items-center justify-between text-xs font-mono">
                        <div>
                            <span className="text-slate-400 block text-[10px]">🛡️ Phòng Ngự:</span>
                            <span className="text-slate-200 font-bold">
                                {formatBigNumber(totalStats.phongThu)} (Vật) / {formatBigNumber(totalStats.khangPhep)} (Phép)
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-slate-400 block text-[10px]">⚡ Bạo Kích:</span>
                            <span className="text-amber-400 font-bold">{totalStats.baoKich}%</span>
                        </div>
                    </div>
                </div>

                {/* CỘT 2 (Ở GIỮA): ĐỘNG PHỦ TU LUYỆN (lg:col-span-4) */}
                <div className="lg:col-span-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-teal-500/40 rounded-xl p-4 shadow-2xl shadow-teal-950/30 flex flex-col items-center text-center relative overflow-hidden">
                    {/* Header Panel */}
                    <h2 className="text-sm font-bold font-serif text-teal-300 flex items-center gap-2 mb-3">
                        <span>🧘‍♂️</span> ĐỘNG PHỦ TU LUYỆN
                    </h2>

                    {/* Banner Danh Xưng & Danh Hiệu */}
                    <div className="w-full bg-slate-900/80 rounded-xl p-2.5 mb-3 border border-slate-800 flex items-center justify-between">
                        <div className="text-left">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                {title}
                            </span>
                            <h3 className="text-base font-bold font-serif text-slate-100 mt-0.5">
                                {name}
                            </h3>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => {
                                    setTempName(name);
                                    setRenameModalOpen(true);
                                }}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-amber-500/30 text-[11px] text-amber-300 font-semibold cursor-pointer transition"
                            >
                                ✏️ Đổi Tên
                            </button>
                            <button
                                onClick={() => setTitleModalOpen(true)}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-[11px] text-cyan-300 font-semibold cursor-pointer transition"
                            >
                                🎖️ Danh Hiệu
                            </button>
                        </div>
                    </div>

                    {/* Vòng Tròn Thái Cực / Bát Quái Xoay Chậm */}
                    <div className="relative w-36 h-36 my-2 flex items-center justify-center">
                        {/* Outer Ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-teal-400/40 animate-[spin_20s_linear_infinite]" />
                        {/* Inner Ring */}
                        <div className="absolute inset-2 rounded-full border border-teal-300/30 animate-[spin_12s_linear_infinite_reverse]" />
                        {/* Avatar Trung Tâm */}
                        <div className="w-24 h-24 rounded-full bg-slate-950 border-2 border-teal-400 flex items-center justify-center text-4xl shadow-[0_0_35px_rgba(78,204,163,0.45)] select-none">
                            🧘‍♂️
                        </div>
                    </div>

                    {/* Tên Cảnh Giới & Chữ Hán Triện Cổ */}
                    <h2 className="text-xl font-bold font-serif text-amber-300 tracking-wide mt-2">
                        {RealmSystem.getFullRealmTitle(realmIndex, tierIndex, isVoCuc)}
                    </h2>
                    <div className="text-xs text-amber-400/80 font-serif tracking-[6px] my-1">
                        {realmData.hanzi}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 max-w-xs mb-3">
                        {realmData.desc}
                    </p>

                    {/* Hộp Cảnh Báo Bình Cảnh */}
                    {breakthroughGate.blocked && (
                        <div className="w-full p-2.5 rounded-lg bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs mb-3 font-semibold text-left">
                            ⚠️ {breakthroughGate.message}
                        </div>
                    )}

                    {/* Thanh Tiến Độ Tu Vi */}
                    <div className="w-full bg-slate-900/80 rounded-xl p-3 border border-slate-800 mb-3 text-left">
                        <div className="flex items-center justify-between text-xs font-semibold mb-1">
                            <span className="text-slate-300">Tiến Độ Tu Vi:</span>
                            <span className="text-emerald-400 font-mono">
                                {formatBigNumber(tuVi)} / {formatBigNumber(maxTuVi)} ({progressPct}%)
                            </span>
                        </div>
                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 mb-2">
                            <div
                                className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-400 transition-all duration-300 shadow-md shadow-teal-500/40"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <span className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300">
                                +{formatBigNumber(afkRate)} Tu Vi/giây
                            </span>
                            <span className="text-indigo-300">
                                ⚡ Tỉ Lệ Độ Kiếp: {breakthroughRate.totalRate}%
                            </span>
                        </div>
                    </div>

                    {/* Bộ Nút Đột Phá */}
                    <div className="w-full flex items-center gap-2 mt-auto">
                        <button
                            onClick={handleBreakthrough}
                            className="flex-[1.2] py-2.5 px-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold font-serif text-xs rounded-xl shadow-lg shadow-teal-500/30 transition-all cursor-pointer active:scale-95"
                        >
                            ⚡ Tích Lũy Tu Vi Đột Phá
                        </button>
                        <button
                            onClick={handleQuickBreakthrough}
                            className="flex-[0.9] py-2.5 px-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:via-orange-500 hover:to-amber-600 text-slate-950 font-bold font-serif text-xs rounded-xl shadow-lg shadow-amber-600/30 transition-all cursor-pointer active:scale-95 border border-amber-400/60"
                        >
                            ⚡ Đột Phá Nhanh
                        </button>
                    </div>
                </div>

                {/* CỘT 3 (BÊN PHẢI): 3 Ô TRANG BỊ ĐẠO THÂN (lg:col-span-4) */}
                <div className="lg:col-span-4 bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 shadow-xl backdrop-blur-md flex flex-col justify-between">
                    <div>
                        <div className="pb-3 border-b border-amber-500/30 mb-3">
                            <h2 className="text-sm font-bold font-serif text-amber-300 flex items-center gap-2">
                                <span>🛡️</span> 3 Ô TRANG BỊ ĐẠO THÂN
                            </h2>
                        </div>

                        {/* 3 Thẻ Trang Bị Xếp Dọc */}
                        <div className="space-y-3">
                            {(["non", "giap", "vukhi"] as const).map((slotKey) => {
                                const itemId = equipped[slotKey];
                                const item = itemId ? ItemSystem.getItemById(itemId) : null;
                                const rarity = item ? RARITY_INFO[item.rarity] : null;
                                const slotLabels: Record<string, { name: string; defaultIcon: string }> = {
                                    non: { name: "Thần Quán (Nón)", defaultIcon: "👑" },
                                    giap: { name: "Thánh Giáp (Giáp)", defaultIcon: "🛡️" },
                                    vukhi: { name: "Thần Kiếm (Vũ Khí)", defaultIcon: "⚔️" }
                                };

                                if (item && rarity) {
                                    return (
                                        <div
                                            key={slotKey}
                                            className="p-3 rounded-xl border flex items-center justify-between gap-3 transition relative overflow-hidden"
                                            style={{
                                                borderColor: rarity.border,
                                                background: rarity.bg
                                            }}
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="text-3xl shrink-0 drop-shadow-md">
                                                    {item.icon}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <strong className="text-xs font-serif truncate" style={{ color: rarity.color }}>
                                                            {item.name}
                                                        </strong>
                                                        <span
                                                            className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider shrink-0"
                                                            style={{
                                                                color: rarity.color,
                                                                border: `1px solid ${rarity.border}`
                                                            }}
                                                        >
                                                            {rarity.name}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-300 font-mono mt-0.5 truncate">
                                                        {item.stats?.mau && `HP +${item.stats.mau} `}
                                                        {item.stats?.vatLi && `VL +${item.stats.vatLi} `}
                                                        {item.stats?.phep && `Phép +${item.stats.phep} `}
                                                        {item.stats?.phongThu && `Thủ +${item.stats.phongThu} `}
                                                        {item.stats?.baoKich && `Bạo +${item.stats.baoKich}% `}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5 shrink-0 justify-center">
                                                <button
                                                    onClick={() => unequipItem(slotKey)}
                                                    className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-[11px] font-bold text-rose-300 transition cursor-pointer"
                                                >
                                                    Tháo
                                                </button>
                                                <button
                                                    onClick={() => setEquipModalSlot(slotKey)}
                                                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 transition cursor-pointer"
                                                >
                                                    Đổi
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }

                                // Ô Trống
                                return (
                                    <div
                                        key={slotKey}
                                        onClick={() => setEquipModalSlot(slotKey)}
                                        className="p-3.5 rounded-xl border-2 border-dashed border-slate-700/80 hover:border-amber-400/60 bg-black/30 flex items-center justify-between gap-3 cursor-pointer transition select-none group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <span className="text-2xl shrink-0 opacity-50 group-hover:opacity-100 transition">
                                                {slotLabels[slotKey].defaultIcon}
                                            </span>
                                            <div className="min-w-0">
                                                <div className="text-xs font-semibold text-slate-400 group-hover:text-amber-300 transition truncate">
                                                    Chưa Trang Bị [{slotLabels[slotKey].name}]
                                                </div>
                                                <div className="text-[10px] text-slate-500 truncate">
                                                    (Nhấp vào đây để mặc trang bị từ túi đồ)
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-amber-400/80 shrink-0 group-hover:text-amber-300">
                                            + Mặc
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>

            {/* ================= HÀNG 2: KỸ NĂNG VÀ ĐẠI THẦN THÔNG ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                {/* Cụm 3 Ô Kỹ Năng Xuất Trận (col-span-12 lg:col-span-7) */}
                <div className="lg:col-span-7 bg-slate-950/80 border border-cyan-500/30 rounded-xl p-4 shadow-xl backdrop-blur-md flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30 mb-3">
                        <h2 className="text-sm font-bold font-serif text-cyan-300 flex items-center gap-2">
                            <span>⚡</span> 3 Ô KỸ NĂNG XUẤT TRẬN
                        </h2>
                        <span className="text-[11px] text-slate-400">Tự động xuất chiêu theo lượt trong trận đấu</span>
                    </div>

                    <div className="space-y-2.5">
                        {[0, 1, 2].map((slotIdx) => {
                            const skillId = equippedSkills[slotIdx];
                            const skill = skillId ? SkillSystem.getSkillById(skillId) : null;
                            const typeNames: Record<string, string> = {
                                vat_li: "Vật Lí",
                                phep: "Pháp Thuật",
                                ho_the: "Hộ Thể",
                                tri_lieu: "Trị Liệu"
                            };

                            if (skill) {
                                return (
                                    <div
                                        key={slotIdx}
                                        className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/40 flex items-center justify-between hover:border-cyan-400 transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-3xl">{skill.icon}</div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <strong className="text-xs font-serif text-cyan-300">
                                                        {skill.name}
                                                    </strong>
                                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-600/50 text-cyan-300">
                                                        {typeNames[skill.type] || "Công Pháp"}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                                    {skill.desc} • <span className="text-amber-400 font-mono font-semibold">⏳ Hồi {skill.cooldown}s</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => unequipSkill(slotIdx as 0 | 1 | 2)}
                                            className="px-3 py-1.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-xs font-bold text-rose-300 transition cursor-pointer"
                                        >
                                            Gỡ
                                        </button>
                                    </div>
                                );
                            }

                            // Ô Kỹ Năng Trống
                            return (
                                <div
                                    key={slotIdx}
                                    onClick={() => setSkillModalSlot(slotIdx as 0 | 1 | 2)}
                                    className="p-3 rounded-xl border-2 border-dashed border-slate-700/80 hover:border-cyan-400/60 bg-black/30 flex items-center gap-3 cursor-pointer transition select-none group"
                                >
                                    <span className="text-xl text-slate-500 group-hover:text-cyan-400 transition">➕</span>
                                    <div>
                                        <div className="text-xs font-semibold text-slate-400 group-hover:text-cyan-300 transition">
                                            Ô Kỹ Năng {slotIdx + 1}
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            (Bấm vào đây để chọn gán bí tịch đã học)
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Cụm Đại Thần Thông Trấn Thân (col-span-12 lg:col-span-5) */}
                <div className="lg:col-span-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-400/60 rounded-xl p-4 shadow-xl shadow-amber-500/10 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center justify-between pb-3 border-b border-amber-500/30 mb-3">
                        <h2 className="text-sm font-bold font-serif text-amber-300 flex items-center gap-2">
                            <span>🔮</span> ĐẠI THẦN THÔNG TRẤN THÂN
                        </h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Đài Cầu Đạo
                        </span>
                    </div>

                    {equippedUltimate ? (
                        (() => {
                            const ult = SkillSystem.getUltimateById(equippedUltimate);
                            if (!ult) return null;
                            return (
                                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-950 border border-amber-400/50 flex flex-col justify-between h-full">
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className="text-4xl drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                                            {ult.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-base font-bold font-serif text-amber-300">
                                                    {ult.name}
                                                </h4>
                                                <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                                    {ult.tier === "than" ? "THẦN CẤP" : "THÁNH CẤP"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                                                {ult.shortDesc}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                                        <span className="text-amber-400 font-mono font-semibold">
                                            ⚡ Tiêu hao: {ult.rageCost} Nộ Khí
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => equipUltimate(null)}
                                                className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-[11px] font-bold text-rose-300 transition cursor-pointer"
                                            >
                                                Gỡ Ra
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()
                    ) : (
                        <div className="p-6 rounded-xl border-2 border-dashed border-slate-700 bg-black/40 text-center flex flex-col items-center justify-center my-auto">
                            <span className="text-3xl mb-1 opacity-60">🌌</span>
                            <p className="text-xs text-slate-400 mb-2">Chưa trang bị Đại Thần Thông trấn thân</p>
                            <button
                                onClick={() => equipUltimate("ult_than_nhat_niem")}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs cursor-pointer"
                            >
                                🔮 Trang Bị Nhất Niệm
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ================= HÀNG 3: TÚI TRỮ VẬT CÀN KHÔN (INVENTORY) ================= */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
                {/* Header & Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-4">
                    <div>
                        <h2 className="text-base font-bold font-serif text-slate-100 flex items-center gap-2">
                            <span>🎒</span> TÚI TRỮ VẬT CÀN KHÔN
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Chứa trang bị, đan dược và toàn bộ bí kíp võ học đã có
                        </p>
                    </div>

                    {/* Toolbar Lọc & Tìm Kiếm */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Nhóm Nút Lọc */}
                        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                            <button
                                onClick={() => setInvFilter("all")}
                                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                                    invFilter === "all" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                ✨ Tất Cả ({countAll})
                            </button>
                            <button
                                onClick={() => setInvFilter("equip")}
                                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                                    invFilter === "equip" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                🛡️ Trang Bị ({countEquip})
                            </button>
                            <button
                                onClick={() => setInvFilter("skill")}
                                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                                    invFilter === "skill" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                ⚡ Bí Kíp ({countSkills})
                            </button>
                            <button
                                onClick={() => setInvFilter("dan_duoc")}
                                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                                    invFilter === "dan_duoc" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                🧪 Đan Dược ({countDan})
                            </button>
                        </div>

                        {/* Ô Search & Nút Bán Đồ Trùng */}
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="🔍 Tìm vật phẩm, bí kíp..."
                                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 w-44 sm:w-52"
                            />
                            <button
                                onClick={() => setQuickSellModalOpen(true)}
                                className="px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 text-xs font-bold transition cursor-pointer shadow-sm whitespace-nowrap"
                                title="Bán nhanh toàn bộ nón, giáp, vũ khí trùng lặp trong túi đồ"
                            >
                                ⚡ Bán Đồ Trùng
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lưới Thẻ Bài Vật Phẩm & Kỹ Năng Trong Túi Đồ */}
                {filteredEntries.length === 0 ? (
                    <div className="py-16 text-center text-slate-500">
                        <div className="text-4xl mb-2">📭</div>
                        <p className="text-sm">Không tìm thấy vật phẩm hay bí kíp nào phù hợp trong túi!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                        {filteredEntries.map((entry) => {
                            if (entry.type === "item") {
                                const item = ItemSystem.getItemById(entry.id);
                                if (!item) return null;
                                const rarity = RARITY_INFO[item.rarity];
                                const isEquip = ["non", "giap", "vukhi"].includes(item.slot);
                                const isDan = item.slot === "dan_duoc" || item.slot === "item";
                                const isCurrentlyEquipped = Object.values(equipped).includes(item.id);
                                const isRealmOk = realmIndex >= item.reqRealm;

                                return (
                                    <div
                                        key={`item_${item.id}`}
                                        className="p-3 rounded-xl border flex flex-col justify-between transition relative overflow-hidden"
                                        style={{
                                            borderColor: rarity.border,
                                            background: rarity.bg
                                        }}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{item.icon}</span>
                                                    <div>
                                                        <strong className="text-xs font-serif block line-clamp-1" style={{ color: rarity.color }}>
                                                            {item.name}
                                                        </strong>
                                                        <span className="text-[10px] text-slate-400">
                                                            {rarity.name} • {item.slot.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                {entry.count > 1 && (
                                                    <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-black/60 text-amber-300 border border-amber-500/30">
                                                        x{entry.count}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Chỉ số buff */}
                                            <div className="text-[11px] text-slate-300 font-mono my-1.5">
                                                {item.stats && (
                                                    <>
                                                        {item.stats.mau && <span className="mr-2">HP +{item.stats.mau}</span>}
                                                        {item.stats.vatLi && <span className="mr-2">VL +{item.stats.vatLi}</span>}
                                                        {item.stats.phep && <span className="mr-2">Phép +{item.stats.phep}</span>}
                                                        {item.stats.phongThu && <span className="mr-2">Thủ +{item.stats.phongThu}</span>}
                                                        {item.stats.baoKich && <span>Bạo +{item.stats.baoKich}%</span>}
                                                    </>
                                                )}
                                                {item.tuViGain && (
                                                    <span className="text-emerald-400 font-semibold">
                                                        +{item.tuViGain * entry.count} Tu Vi
                                                    </span>
                                                )}
                                                {item.isResetPill && (
                                                    <span className="text-rose-400 font-semibold">
                                                        🧪 Tẩy toàn bộ điểm tiềm năng
                                                    </span>
                                                )}
                                                {item.isRenameScroll && (
                                                    <span className="text-cyan-400 font-semibold">
                                                        📜 Cuộn giấy đổi đạo hiệu
                                                    </span>
                                                )}
                                                {!isRealmOk && (
                                                    <div className="text-[10px] text-rose-400 font-semibold mt-0.5">
                                                        🔒 Cần Cảnh Giới {item.reqRealm + 1}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/80 mt-2">
                                            {isEquip && (
                                                <button
                                                    onClick={() => equipItem(item.slot, item.id)}
                                                    disabled={!isRealmOk}
                                                    className={`flex-1 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                                                        isCurrentlyEquipped
                                                            ? "bg-slate-800 text-amber-400 border border-amber-500/40"
                                                            : "bg-teal-600 hover:bg-teal-500 text-slate-950 font-serif"
                                                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                                                >
                                                    {isCurrentlyEquipped ? "Đang Mặc" : "Trang Bị"}
                                                </button>
                                            )}

                                            {isDan && (
                                                <button
                                                    onClick={() => {
                                                        const res = useConsumable(item.id);
                                                        showToast(res.msg);
                                                    }}
                                                    disabled={!isRealmOk}
                                                    className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-serif text-[11px] transition cursor-pointer disabled:opacity-40"
                                                >
                                                    Sử Dụng
                                                </button>
                                            )}

                                            <button
                                                onClick={() => {
                                                    const res = sellItem(item.id);
                                                    if (res.success) showToast(`Đã bán 1x ${item.name}, nhận +${res.gain} 💎!`);
                                                }}
                                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono transition cursor-pointer"
                                                title={`Bán nhận ${item.sellPrice} Linh Thạch`}
                                            >
                                                Bán ({item.sellPrice}💎)
                                            </button>
                                        </div>
                                    </div>
                                );
                            }

                            // Kỹ Năng Đã Học
                            const skill = SkillSystem.getSkillById(entry.id);
                            if (!skill) return null;
                            const isEquipped = equippedSkills.includes(skill.id);
                            const equipSlotIdx = equippedSkills.indexOf(skill.id);

                            return (
                                <div
                                    key={`skill_${skill.id}`}
                                    className={`p-3 rounded-xl border flex flex-col justify-between transition relative overflow-hidden ${
                                        isEquipped
                                            ? "bg-cyan-950/30 border-cyan-500/50 shadow-md shadow-cyan-950/40"
                                            : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{skill.icon}</span>
                                                <div>
                                                    <strong className="text-xs font-serif text-teal-300 block line-clamp-1">
                                                        {skill.name}
                                                    </strong>
                                                    <span className="text-[10px] text-slate-400">
                                                        BÍ KÍP • ⏳ {skill.cooldown}s
                                                    </span>
                                                </div>
                                            </div>
                                            {isEquipped && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                                    Ô {equipSlotIdx + 1}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-300 line-clamp-2 my-1.5">
                                            {skill.desc}
                                        </p>
                                    </div>

                                    <div className="pt-2 border-t border-slate-800 mt-2">
                                        {isEquipped ? (
                                            <button
                                                onClick={() => unequipSkill(equipSlotIdx as 0 | 1 | 2)}
                                                className="w-full py-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-[11px] font-bold text-rose-300 transition cursor-pointer"
                                            >
                                                Tháo Trận
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    quickEquipSkill(skill.id);
                                                    showToast(`Đã xuất trận [${skill.name}]!`);
                                                }}
                                                className="w-full py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-serif text-[11px] transition cursor-pointer"
                                            >
                                                Xuất Trận
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ================= MODAL: ĐỔI TÊN ================= */}
            {renameModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="max-w-sm w-full bg-slate-950 border-2 border-amber-400/60 rounded-2xl p-5 text-center shadow-2xl">
                        <h3 className="text-base font-bold font-serif text-amber-300 mb-3">
                            ✏️ ĐỔI ĐẠO HIỆU NHÂN VẬT
                        </h3>
                        <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            maxLength={16}
                            placeholder="Nhập đạo hiệu mới..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-center text-slate-100 focus:outline-none focus:border-amber-400 mb-4"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setRenameModalOpen(false)}
                                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold cursor-pointer"
                            >
                                Hủy Bỏ
                            </button>
                            <button
                                onClick={() => {
                                    if (tempName.trim()) {
                                        setName(tempName.trim());
                                        setRenameModalOpen(false);
                                        showToast(`Đã đổi đạo hiệu thành [${tempName.trim()}]!`);
                                    }
                                }}
                                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-xs text-slate-950 font-bold cursor-pointer"
                            >
                                Xác Nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL: DANH HIỆU ================= */}
            {titleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="max-w-sm w-full bg-slate-950 border-2 border-cyan-400/60 rounded-2xl p-5 text-center shadow-2xl">
                        <h3 className="text-base font-bold font-serif text-cyan-300 mb-3">
                            🎖️ QUẢN LÝ DANH HIỆU
                        </h3>
                        <div className="space-y-2 mb-4 text-left">
                            {["Sơ Nhập Tu Tiên", "Thiên Kiêu Vấn Đạo", "Bất Tử Kiếm Tôn", "Hỗn Nguyên Thần Chủ"].map((t) => (
                                <div
                                    key={t}
                                    onClick={() => {
                                        setTitle(t);
                                        setTitleModalOpen(false);
                                        showToast(`Đã trang bị danh hiệu [${t}]!`);
                                    }}
                                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                                        title === t
                                            ? "bg-amber-500/20 border-amber-400 text-amber-300"
                                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                                    }`}
                                >
                                    <span className="text-xs font-bold font-serif">{t}</span>
                                    {title === t && <span className="text-xs text-amber-400">✓ Đang Dùng</span>}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setTitleModalOpen(false)}
                            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold cursor-pointer"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {/* ================= MODAL: CHỌN TRANG BỊ CHO Ô RỖNG ================= */}
            {equipModalSlot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="max-w-md w-full bg-slate-950 border-2 border-amber-400/60 rounded-2xl p-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                            <h3 className="text-sm font-bold font-serif text-amber-300">
                                CHỌN TRANG BỊ CHO Ô [{equipModalSlot.toUpperCase()}]
                            </h3>
                            <button
                                onClick={() => setEquipModalSlot(null)}
                                className="text-slate-400 hover:text-slate-200 text-lg cursor-pointer"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="max-h-72 overflow-y-auto space-y-2 mb-4">
                            {inventory
                                .map(id => ItemSystem.getItemById(id))
                                .filter((item): item is NonNullable<typeof item> => !!item && item.slot === equipModalSlot)
                                .map(item => {
                                    const rarity = RARITY_INFO[item.rarity];
                                    const isRealmOk = realmIndex >= item.reqRealm;
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => {
                                                if (isRealmOk) {
                                                    equipItem(equipModalSlot, item.id);
                                                    setEquipModalSlot(null);
                                                    showToast(`Đã mặc [${item.name}]!`);
                                                }
                                            }}
                                            className="p-2.5 rounded-xl border flex items-center justify-between cursor-pointer hover:brightness-110 transition"
                                            style={{ borderColor: rarity.border, background: rarity.bg }}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-2xl">{item.icon}</span>
                                                <div>
                                                    <strong className="text-xs font-serif block" style={{ color: rarity.color }}>
                                                        {item.name}
                                                    </strong>
                                                    <span className="text-[10px] text-slate-300 font-mono">
                                                        {item.stats?.mau && `HP +${item.stats.mau} `}
                                                        {item.stats?.vatLi && `VL +${item.stats.vatLi} `}
                                                        {item.stats?.phep && `Phép +${item.stats.phep} `}
                                                        {item.stats?.phongThu && `Thủ +${item.stats.phongThu} `}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                disabled={!isRealmOk}
                                                className="px-3 py-1 rounded bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs font-serif disabled:opacity-40"
                                            >
                                                {isRealmOk ? "Mặc" : "Khóa"}
                                            </button>
                                        </div>
                                    );
                                })}

                            {inventory.filter(id => {
                                const it = ItemSystem.getItemById(id);
                                return it && it.slot === equipModalSlot;
                            }).length === 0 && (
                                <div className="text-center py-8 text-slate-500 text-xs">
                                    Không có trang bị [{equipModalSlot}] nào trong túi đồ!
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setEquipModalSlot(null)}
                            className="w-full py-2 rounded-xl bg-slate-800 text-xs text-slate-300 font-bold cursor-pointer"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {/* ================= MODAL: CHỌN KỸ NĂNG CHO Ô RỖNG ================= */}
            {skillModalSlot !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="max-w-md w-full bg-slate-950 border-2 border-cyan-400/60 rounded-2xl p-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                            <h3 className="text-sm font-bold font-serif text-cyan-300">
                                CHỌN KỸ NĂNG CHO Ô {skillModalSlot + 1}
                            </h3>
                            <button
                                onClick={() => setSkillModalSlot(null)}
                                className="text-slate-400 hover:text-slate-200 text-lg cursor-pointer"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="max-h-72 overflow-y-auto space-y-2 mb-4">
                            {learnedSkills.map(skillId => {
                                const skill = SkillSystem.getSkillById(skillId);
                                if (!skill) return null;
                                const isWorn = equippedSkills.includes(skill.id);
                                return (
                                    <div
                                        key={skill.id}
                                        onClick={() => {
                                            equipSkill(skillModalSlot, skill.id);
                                            setSkillModalSlot(null);
                                            showToast(`Đã gán [${skill.name}] vào Ô ${skillModalSlot + 1}!`);
                                        }}
                                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400 flex items-center justify-between cursor-pointer transition"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-2xl">{skill.icon}</span>
                                            <div>
                                                <strong className="text-xs font-serif text-cyan-300 block">
                                                    {skill.name} {isWorn ? "(Đang gắn)" : ""}
                                                </strong>
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                    Hồi {skill.cooldown}s • {skill.desc}
                                                </span>
                                            </div>
                                        </div>
                                        <button className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-serif">
                                            Gán
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setSkillModalSlot(null)}
                            className="w-full py-2 rounded-xl bg-slate-800 text-xs text-slate-300 font-bold cursor-pointer"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {/* ================= MODAL: BÁN ĐỒ TRÙNG ================= */}
            {quickSellModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="max-w-md w-full bg-slate-950 border-2 border-amber-400/60 rounded-2xl p-5 shadow-2xl text-center">
                        <h3 className="text-base font-bold font-serif text-amber-300 mb-2">
                            ⚡ BÁN NHANH TRANG BỊ TRÙNG LẶP
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">
                            Hệ thống sẽ giữ lại 1 bản trang bị mạnh nhất trong túi đồ và bán toàn bộ các bản dư thừa.
                        </p>

                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 mb-4 flex items-center justify-around font-mono">
                            <div>
                                <span className="text-[10px] text-slate-400 block">Món trùng:</span>
                                <span className="text-sm font-bold text-slate-200">{dupsSummary.totalCount} món</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block">Linh thạch thu về:</span>
                                <span className="text-sm font-bold text-amber-400">+{dupsSummary.totalGain} 💎</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setQuickSellModalOpen(false)}
                                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold cursor-pointer"
                            >
                                Hủy Bỏ
                            </button>
                            <button
                                onClick={() => {
                                    const res = sellAllDuplicateEquipment(true);
                                    setQuickSellModalOpen(false);
                                    showToast(`🎉 Bán thành công ${res.totalCount} trang bị trùng, thu về +${res.totalGain} 💎!`);
                                }}
                                disabled={dupsSummary.totalCount === 0}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs cursor-pointer disabled:opacity-40"
                            >
                                Xác Nhận Bán
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CultivateTab;
