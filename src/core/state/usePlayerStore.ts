import { create } from "zustand";
import { BigNumber, toBigNumber, BigNumberSource } from "../types/bignum";
import { PlayerCurrencies, PlayerCombatStats } from "../types/player";
import { BreakthroughGate, TribulationRate, BreakthroughResult, QuickBreakthroughResult } from "../types/realm";
import { RealmSystem, STAT_POINTS_PER_TIER } from "../constants/realms.data";
import { ItemSystem, ItemSlotType } from "../constants/items.data";

export type StatType = "vat_li" | "phep" | "mau";

export interface EquippedItemsState {
    non: string | null;
    giap: string | null;
    vukhi: string | null;
}

export interface PlayerStoreState {
    name: string;
    realmIndex: number;
    tierIndex: number;
    tuVi: BigNumber;
    tinhNguyen: BigNumber;
    vocucPendingTuVi: BigNumber;
    isVoCuc: boolean;
    vanThienDiaClears: number;

    // 3 Thuộc tính tiềm năng chuẩn bản V3
    statPoints: number;
    statVatLi: number; // Điểm Công Vật Lí
    statPhep: number;  // Điểm Công Phép
    statMau: number;   // Điểm Sinh Lực (Máu)

    // 3 Ô Trang Bị Đạo Thân (Nón, Giáp, Vũ Khí)
    equipped: EquippedItemsState;

    // Kỹ Năng Xuất Trận (3 Ô thường + 1 Ô Đại Thần Thông)
    equippedSkills: [string | null, string | null, string | null];
    equippedUltimate: string | null;

    currencies: PlayerCurrencies;

    clearedStageIds: string[];
    breakthroughBonusRate: number;
    highestTowerFloor: number;
    lastOnlineTimestamp: number;

    // Getters
    getBreakthroughGate: () => BreakthroughGate;
    getBreakthroughRate: () => TribulationRate;
    getMaxTuVi: () => BigNumber;
    getAfkRate: () => BigNumber;
    getTotalStats: () => PlayerCombatStats;
    getMaxHp: () => BigNumber;

    // Actions
    setName: (name: string) => void;
    addTuVi: (amount: BigNumberSource) => { added: BigNumber; canBreakthrough: boolean };
    addTinhNguyen: (amount: BigNumberSource) => { added: BigNumber; canBreakthrough: boolean };
    addCurrency: (currency: keyof PlayerCurrencies, amount: BigNumberSource) => void;

    // Phân hệ điểm tiềm năng chuẩn V3
    allocateStat: (type: StatType, amount?: number) => boolean;
    allocateStatMax: (type: StatType) => number;
    resetStats: () => number;

    // Thao tác Trang Bị & Kỹ Năng
    equipItem: (slot: ItemSlotType, itemId: string | null) => void;
    unequipItem: (slot: ItemSlotType) => void;
    equipSkill: (slotIndex: 0 | 1 | 2, skillId: string | null) => void;
    equipUltimate: (ultimateId: string | null) => void;

    attemptBreakthrough: () => BreakthroughResult;
    quickBreakthrough: () => QuickBreakthroughResult;
    markStageCleared: (stageId: string) => void;
    updateLastOnline: () => void;
    resetAllData: () => void;
}

const DEFAULT_CURRENCIES: PlayerCurrencies = {
    linhThach: toBigNumber(200),
    honNguyenThach: toBigNumber(0),
    tinhNguyen: toBigNumber(0),
    veTamDao: 5,
    manhCoDuyen: 0,
    lenhBaiHuKhong: 1,
    manhThuHon: 0
};

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
    name: "Tiêu Viêm",
    realmIndex: 0,
    tierIndex: 0,
    tuVi: toBigNumber(0),
    tinhNguyen: toBigNumber(0),
    vocucPendingTuVi: toBigNumber(0),
    isVoCuc: false,
    vanThienDiaClears: 0,

    // Bắt đầu với 4 điểm tiềm năng theo chuẩn V3
    statPoints: 4,
    statVatLi: 0,
    statPhep: 0,
    statMau: 0,

    // 3 Ô Trang Bị khởi đầu chuẩn V3
    equipped: {
        non: "hat_01",
        giap: "armor_01",
        vukhi: "weapon_01"
    },

    // 3 Kỹ Năng thường + 1 Đại Thần Thông chuẩn V3
    equippedSkills: [
        "skill_toai_thach_quyen",
        "skill_dan_hoa_thuat",
        null
    ],
    equippedUltimate: "ult_than_nhat_niem",

    currencies: { ...DEFAULT_CURRENCIES },

    clearedStageIds: [],
    breakthroughBonusRate: 0,
    highestTowerFloor: 0,
    lastOnlineTimestamp: Date.now(),

    // ================= GETTERS =================
    getMaxTuVi: () => {
        const { realmIndex, tierIndex, isVoCuc } = get();
        return RealmSystem.getMaxTuVi(realmIndex, tierIndex, isVoCuc);
    },

    getAfkRate: () => {
        const { realmIndex, tierIndex, isVoCuc } = get();
        return RealmSystem.getAfkTuViRate(realmIndex, tierIndex, isVoCuc);
    },

    getBreakthroughGate: (): BreakthroughGate => {
        const { realmIndex, tierIndex, isVoCuc, clearedStageIds, vanThienDiaClears } = get();

        // 1. Cổng Bình Cảnh Ải 22 (Tầng 100 Đại Đạo Chí Cao, chưa mở Vô Cực)
        if (!isVoCuc && realmIndex >= 11 && tierIndex >= 99) {
            const hasClearedVoCuc = clearedStageIds.includes("stage_vo_cuc");
            if (!hasClearedVoCuc) {
                return {
                    blocked: true,
                    reason: "VO_CUC_GATE_STAGE_22",
                    requiredStageId: "stage_vo_cuc",
                    requiredStageName: "Ải 22: Hư Vô Bản Nguyên Cảnh",
                    message: "Cần đánh bại [Ải 22: Hư Vô Bản Nguyên Cảnh] mới có thể bước chân vào Cảnh Giới Vô Cực!"
                };
            }
        }

        // 2. Cổng Bình Cảnh Ải 23 (Mỗi 100 tầng ở Cảnh Giới Vô Cực: Tầng 200, 300...)
        if (isVoCuc && (tierIndex + 1) % 100 === 0) {
            const milestone = Math.floor((tierIndex + 1) / 100);
            if (vanThienDiaClears < milestone) {
                return {
                    blocked: true,
                    reason: "VAN_THIEN_DIA_STAGE_23",
                    requiredStageId: "stage_23",
                    requiredStageName: `Ải 23: Vấn Thiên Địa (Mốc ${milestone * 100} Tầng)`,
                    message: `Cần vượt qua [Ải 23: Vấn Thiên Địa] (Mốc ${milestone * 100} Tầng) để tiếp tục đột phá!`
                };
            }
        }

        // 3. Yêu cầu ải cốt truyện khi thăng Đại Cảnh Giới (Ải 17, 18, 19)
        const nextRealm = realmIndex + 1;
        if (realmIndex >= 8 && nextRealm < RealmSystem.getRealmCount()) {
            const reqStage = RealmSystem.getBreakthroughReqStage(nextRealm);
            if (reqStage && !clearedStageIds.includes(reqStage)) {
                return {
                    blocked: true,
                    reason: "STAGE_REQUIRED",
                    requiredStageId: reqStage,
                    message: `Cần đánh bại ải [${reqStage}] để thăng lên cảnh giới kế tiếp!`
                };
            }
        }

        return {
            blocked: false,
            message: ""
        };
    },

    getBreakthroughRate: (): TribulationRate => {
        const { realmIndex, tierIndex, breakthroughBonusRate } = get();
        let baseRate = 100;

        if (realmIndex <= 8) {
            baseRate = Math.max(10, 100 - tierIndex * 5); // 100% -> 55%
        } else {
            const cycleTier = tierIndex % 100;
            baseRate = Math.max(10, +(100 - cycleTier * 0.5).toFixed(1));
        }

        const totalRate = Math.min(100, Math.max(10, +(baseRate + breakthroughBonusRate).toFixed(1)));
        return {
            baseRate,
            pillBonusRate: breakthroughBonusRate,
            totalRate,
            failPenaltyTuViPct: 20
        };
    },

    /**
     * TÍNH TOÁN TỔNG CHỈ SỐ NHÂN VẬT CHUẨN XÁC THEO BẢN V3 (KẾT HỢP TRANG BỊ)
     */
    getTotalStats: (): PlayerCombatStats => {
        const { realmIndex, tierIndex, statVatLi, statPhep, statMau, equipped } = get();

        // Chỉ số cơ sở từ cảnh giới và tầng (absTier)
        const absTier = realmIndex * 10 + tierIndex;
        const baseHp = toBigNumber(150 + absTier * 45);
        const baseVatLi = toBigNumber(15 + absTier * 5);
        const basePhep = toBigNumber(15 + absTier * 5);
        const basePhongThu = toBigNumber(5 + absTier * 3);
        const baseKhangPhep = toBigNumber(5 + absTier * 3);
        const baseBaoKich = 5;

        // Chỉ số cộng phẳng từ điểm tiềm năng
        const allocatedHp = toBigNumber((statMau || 0) * 30);
        const allocatedVatLi = toBigNumber((statVatLi || 0) * 5);
        const allocatedPhep = toBigNumber((statPhep || 0) * 5);

        // Chỉ số cộng từ 3 Ô Trang Bị Đang Mặc
        let equipHp = 0;
        let equipVatLi = 0;
        let equipPhep = 0;
        let equipPhongThu = 0;
        let equipKhangPhep = 0;
        let equipBaoKich = 0;

        (["non", "giap", "vukhi"] as const).forEach(slot => {
            const itemId = equipped[slot];
            if (itemId) {
                const item = ItemSystem.getItemById(itemId);
                if (item && item.stats) {
                    if (item.stats.mau) equipHp += item.stats.mau;
                    if (item.stats.vatLi) equipVatLi += item.stats.vatLi;
                    if (item.stats.phep) equipPhep += item.stats.phep;
                    if (item.stats.phongThu) equipPhongThu += item.stats.phongThu;
                    if (item.stats.khangPhep) equipKhangPhep += item.stats.khangPhep;
                    if (item.stats.baoKich) equipBaoKich += item.stats.baoKich;
                }
            }
        });

        // Hệ số nhân phần trăm (%) khuếch đại
        const hpMultiplier = 1 + (statMau || 0) * 0.004;
        const vatLiMultiplier = 1 + (statVatLi || 0) * 0.0035;
        const phepMultiplier = 1 + (statPhep || 0) * 0.0035;

        // Tổng chỉ số trước khi nhân %
        const rawHp = baseHp.plus(allocatedHp).plus(equipHp);
        const rawVatLi = baseVatLi.plus(allocatedVatLi).plus(equipVatLi);
        const rawPhep = basePhep.plus(allocatedPhep).plus(equipPhep);

        // Áp dụng hệ số khuếch đại
        const maxHp = rawHp.times(hpMultiplier).round();
        const totalVatLi = rawVatLi.times(vatLiMultiplier).round();
        const totalPhep = rawPhep.times(phepMultiplier).round();

        // Chỉ số phụ từ điểm tiềm năng
        const bonusDefFromMau = Math.floor((statMau || 0) / 10);
        const bonusResFromPhep = Math.floor((statPhep || 0) / 20);
        const bonusCritFromVatLi = Math.floor((statVatLi || 0) / 20);

        const phongThu = basePhongThu.plus(equipPhongThu).plus(bonusDefFromMau);
        const khangPhep = baseKhangPhep.plus(equipKhangPhep).plus(bonusDefFromMau + bonusResFromPhep);
        const baoKich = Math.min(75, baseBaoKich + equipBaoKich + bonusCritFromVatLi);

        return {
            maxHp,
            vatLi: totalVatLi,
            phep: totalPhep,
            phongThu,
            khangPhep,
            baoKich,
            hpMultiplier,
            vatLiMultiplier,
            phepMultiplier,
            allocatedHp,
            allocatedVatLi,
            allocatedPhep,
            bonusHpPct: ((statMau || 0) * 0.4).toFixed(1),
            bonusVatLiPct: ((statVatLi || 0) * 0.35).toFixed(1),
            bonusPhepPct: ((statPhep || 0) * 0.35).toFixed(1),
            bonusDefFromMau,
            bonusResFromPhep,
            bonusCritFromVatLi
        };
    },

    getMaxHp: (): BigNumber => {
        return get().getTotalStats().maxHp;
    },

    // ================= ACTIONS =================
    setName: (name: string) => set({ name: name.trim() }),

    addTuVi: (amount: BigNumberSource) => {
        const val = toBigNumber(amount);
        if (val.lte(0)) {
            return { added: toBigNumber(0), canBreakthrough: false };
        }

        const { isVoCuc, vocucPendingTuVi, tinhNguyen } = get();

        // Ở Cảnh Giới Vô Cực: 1 Tỷ Tu Vi chuyển thành 1 Tinh Nguyên
        if (isVoCuc) {
            const newPending = vocucPendingTuVi.plus(val);
            const ONE_BILLION = toBigNumber(1000000000);
            if (newPending.gte(ONE_BILLION)) {
                const tinhGained = newPending.div(ONE_BILLION).floor();
                const remainingPending = newPending.mod(ONE_BILLION);
                const newTinh = tinhNguyen.plus(tinhGained);
                set({
                    vocucPendingTuVi: remainingPending,
                    tinhNguyen: newTinh
                });
                return { added: val, canBreakthrough: newTinh.gte(get().getMaxTuVi()) };
            } else {
                set({ vocucPendingTuVi: newPending });
                return { added: val, canBreakthrough: false };
            }
        }

        const newTuVi = get().tuVi.plus(val);
        set({ tuVi: newTuVi });
        const canBreak = newTuVi.gte(get().getMaxTuVi()) && !get().getBreakthroughGate().blocked;
        return { added: val, canBreakthrough: canBreak };
    },

    addTinhNguyen: (amount: BigNumberSource) => {
        const val = toBigNumber(amount);
        if (val.lte(0)) return { added: toBigNumber(0), canBreakthrough: false };

        const newTinh = get().tinhNguyen.plus(val);
        set({ tinhNguyen: newTinh });
        const canBreak = newTinh.gte(get().getMaxTuVi()) && !get().getBreakthroughGate().blocked;
        return { added: val, canBreakthrough: canBreak };
    },

    addCurrency: (currency: keyof PlayerCurrencies, amount: BigNumberSource) => {
        const val = toBigNumber(amount);
        const currencies = { ...get().currencies };
        const currentVal = toBigNumber(currencies[currency]);
        currencies[currency] = currentVal.plus(val) as any;
        set({ currencies });
    },

    // ================= PHÂN BỔ ĐIỂM TIỀM NĂNG CHUẨN V3 =================
    allocateStat: (type: StatType, amount = 1): boolean => {
        const { statPoints, statVatLi, statPhep, statMau } = get();
        if (statPoints < amount || amount <= 0) return false;

        if (type === "vat_li") {
            set({
                statVatLi: statVatLi + amount,
                statPoints: statPoints - amount
            });
        } else if (type === "phep") {
            set({
                statPhep: statPhep + amount,
                statPoints: statPoints - amount
            });
        } else if (type === "mau") {
            set({
                statMau: statMau + amount,
                statPoints: statPoints - amount
            });
        } else {
            return false;
        }

        return true;
    },

    allocateStatMax: (type: StatType): number => {
        const { statPoints } = get();
        if (statPoints <= 0) return 0;
        const pts = statPoints;
        get().allocateStat(type, pts);
        return pts;
    },

    resetStats: (): number => {
        const { statVatLi, statPhep, statMau, statPoints } = get();
        const total = statVatLi + statPhep + statMau;
        if (total <= 0) return 0;

        set({
            statPoints: statPoints + total,
            statVatLi: 0,
            statPhep: 0,
            statMau: 0
        });

        return total;
    },

    // ================= TRANG BỊ & KỸ NĂNG =================
    equipItem: (slot: ItemSlotType, itemId: string | null) => {
        const equipped = { ...get().equipped, [slot]: itemId };
        set({ equipped });
    },

    unequipItem: (slot: ItemSlotType) => {
        const equipped = { ...get().equipped, [slot]: null };
        set({ equipped });
    },

    equipSkill: (slotIndex: 0 | 1 | 2, skillId: string | null) => {
        const skills = [...get().equippedSkills] as [string | null, string | null, string | null];
        skills[slotIndex] = skillId;
        set({ equippedSkills: skills });
    },

    equipUltimate: (ultimateId: string | null) => {
        set({ equippedUltimate: ultimateId });
    },

    // ================= ĐỘT PHÁ CẢNH GIỚI =================
    attemptBreakthrough: (): BreakthroughResult => {
        const state = get();
        const gate = state.getBreakthroughGate();

        // 1. Kiểm tra Cổng Bình Cảnh
        if (gate.blocked) {
            return {
                success: false,
                msg: gate.message,
                oldTier: state.tierIndex,
                newTier: state.tierIndex,
                oldRealmIndex: state.realmIndex,
                newRealmIndex: state.realmIndex,
                statPointsGained: 0,
                isVoCucBlocked: gate.reason === "VO_CUC_GATE_STAGE_22",
                isVanThienDiaBlocked: gate.reason === "VAN_THIEN_DIA_STAGE_23"
            };
        }

        const maxTuVi = state.getMaxTuVi();
        const rateInfo = state.getBreakthroughRate();

        // 2. Trường Hợp Ở Cảnh Giới Vô Cực (Tầng 101+)
        if (state.isVoCuc) {
            if (state.tinhNguyen.lt(maxTuVi)) {
                return {
                    success: false,
                    msg: `Chưa đủ Tinh Nguyên! Cần ${maxTuVi.toString()} 🌌 (Hiện có: ${state.tinhNguyen.toString()} 🌌).`,
                    oldTier: state.tierIndex,
                    newTier: state.tierIndex,
                    oldRealmIndex: state.realmIndex,
                    newRealmIndex: state.realmIndex,
                    statPointsGained: 0
                };
            }

            const roll = Math.random() * 100;
            if (roll > rateInfo.totalRate) {
                const penalty = maxTuVi.times(0.2).floor().max(1);
                const afterPenalty = state.tinhNguyen.minus(penalty).max(0);
                set({ tinhNguyen: afterPenalty });
                return {
                    success: false,
                    msg: `⚡ [LÔI KIẾP THẤT BẠI] Đột phá thất bại (Tỉ lệ: ${rateInfo.totalRate}%), tổn thất 20% linh lực (-${penalty.toString()} 🌌).`,
                    oldTier: state.tierIndex,
                    newTier: state.tierIndex,
                    oldRealmIndex: state.realmIndex,
                    newRealmIndex: state.realmIndex,
                    statPointsGained: 0,
                    tribulationFailed: true,
                    tuViLost: penalty
                };
            }

            const newTier = state.tierIndex + 1;
            set({
                tinhNguyen: state.tinhNguyen.minus(maxTuVi).max(0),
                tierIndex: newTier,
                statPoints: state.statPoints + STAT_POINTS_PER_TIER
            });

            return {
                success: true,
                msg: `🌌 Đột phá thành công! Thăng lên Cảnh Giới Vô Cực - Tầng ${newTier + 1}! (+4 Điểm Tiềm Năng)`,
                oldTier: state.tierIndex,
                newTier: newTier,
                oldRealmIndex: state.realmIndex,
                newRealmIndex: state.realmIndex,
                statPointsGained: STAT_POINTS_PER_TIER
            };
        }

        // 3. Mốc Chuyển Giao: Tầng 100 Đại Đạo Chí Cao (realmIndex 11, tierIndex 99)
        if (state.realmIndex >= 11 && state.tierIndex >= 99) {
            if (state.tuVi.lt(maxTuVi)) {
                return {
                    success: false,
                    msg: `Chưa đủ Tu Vi để thăng hoa Vô Cực! Cần ${maxTuVi.toString()} Tu Vi.`,
                    oldTier: state.tierIndex,
                    newTier: state.tierIndex,
                    oldRealmIndex: state.realmIndex,
                    newRealmIndex: state.realmIndex,
                    statPointsGained: 0
                };
            }

            const excessTuVi = state.tuVi.minus(maxTuVi).max(0);
            const initialTinhNguyen = excessTuVi.div(1000000000).floor();
            set({
                isVoCuc: true,
                tierIndex: 100,
                tuVi: toBigNumber(0),
                tinhNguyen: initialTinhNguyen,
                statPoints: state.statPoints + STAT_POINTS_PER_TIER,
                breakthroughBonusRate: 0
            });

            return {
                success: true,
                msg: "🌌 [THĂNG HOA ĐẠI THÀNH] Đạo hữu đã phá toái hư không, chính thức bước vào CẢNH GIỚI VÔ CỰC! (+4 Điểm Tiềm Năng)",
                oldTier: 99,
                newTier: 100,
                oldRealmIndex: 11,
                newRealmIndex: 11,
                statPointsGained: STAT_POINTS_PER_TIER
            };
        }

        // 4. Đột Phá Thông Thường
        if (state.tuVi.lt(maxTuVi)) {
            return {
                success: false,
                msg: `Chưa tích tụ đủ linh lực! Cần ${maxTuVi.toString()} Tu Vi.`,
                oldTier: state.tierIndex,
                newTier: state.tierIndex,
                oldRealmIndex: state.realmIndex,
                newRealmIndex: state.realmIndex,
                statPointsGained: 0
            };
        }

        const roll = Math.random() * 100;
        if (roll > rateInfo.totalRate) {
            const penalty = maxTuVi.times(0.2).floor().max(1);
            const remainingTuVi = state.tuVi.minus(penalty).max(0);
            set({ tuVi: remainingTuVi });
            return {
                success: false,
                msg: `⚡ [LÔI KIẾP THẤT BẠI] Đan điền chấn động! Đột phá thất bại (Tỉ lệ: ${rateInfo.totalRate}%), hao tổn 20% tu vi.`,
                oldTier: state.tierIndex,
                newTier: state.tierIndex,
                oldRealmIndex: state.realmIndex,
                newRealmIndex: state.realmIndex,
                statPointsGained: 0,
                tribulationFailed: true,
                tuViLost: penalty
            };
        }

        const remainingTuVi = state.tuVi.minus(maxTuVi).max(0);
        let nextRealm = state.realmIndex;
        let nextTier = state.tierIndex;

        if (state.realmIndex < 8) {
            if (state.tierIndex < RealmSystem.getTierCount() - 1) {
                nextTier++;
            } else {
                nextRealm++;
                nextTier = 0;
            }
        } else {
            const nextRealmTarget = state.realmIndex + 1;
            const reqStage = RealmSystem.getBreakthroughReqStage(nextRealmTarget);
            const hasClearedReq = !reqStage || state.clearedStageIds.includes(reqStage);

            if (state.realmIndex < RealmSystem.getRealmCount() - 1 && hasClearedReq) {
                nextRealm++;
                nextTier = 0;
            } else {
                nextTier++;
            }
        }

        set({
            tuVi: remainingTuVi,
            realmIndex: nextRealm,
            tierIndex: nextTier,
            statPoints: state.statPoints + STAT_POINTS_PER_TIER
        });

        const isMajor = nextRealm > state.realmIndex;
        const realmTitle = RealmSystem.getFullRealmTitle(nextRealm, nextTier, false);

        return {
            success: true,
            msg: isMajor
                ? `🎉 [THĂNG ĐẠI CẢNH GIỚI] Chúc mừng đạo hữu đã thăng hoa lên ${realmTitle}! (+4 Điểm Tiềm Năng)`
                : `✨ Đột phá thành công lên ${realmTitle}! (+4 Điểm Tiềm Năng)`,
            oldTier: state.tierIndex,
            newTier: nextTier,
            oldRealmIndex: state.realmIndex,
            newRealmIndex: nextRealm,
            statPointsGained: STAT_POINTS_PER_TIER
        };
    },

    quickBreakthrough: (): QuickBreakthroughResult => {
        let successCount = 0;
        let totalPoints = 0;
        let stopReason: QuickBreakthroughResult["stopReason"] = "INSUFFICIENT_TU_VI";
        let lastMsg = "";

        const MAX_LOOPS = 200;
        for (let i = 0; i < MAX_LOOPS; i++) {
            const gate = get().getBreakthroughGate();
            if (gate.blocked) {
                stopReason = "GATE_BLOCKED";
                lastMsg = gate.message;
                break;
            }

            const res = get().attemptBreakthrough();
            if (res.success) {
                successCount++;
                totalPoints += res.statPointsGained;
                lastMsg = res.msg;
            } else {
                if (res.tribulationFailed) {
                    stopReason = "TRIBULATION_FAILED";
                    lastMsg = res.msg;
                } else {
                    stopReason = "INSUFFICIENT_TU_VI";
                    lastMsg = res.msg;
                }
                break;
            }
        }

        const state = get();
        return {
            success: successCount > 0,
            successCount,
            totalPointsGained: totalPoints,
            stopReason,
            finalRealmIndex: state.realmIndex,
            finalTierIndex: state.tierIndex,
            message: successCount > 0
                ? `Đã đột phá liên tục thành công ${successCount} tầng (+${totalPoints} điểm tiềm năng)! Dừng do: ${lastMsg}`
                : `Không thể đột phá nhanh: ${lastMsg}`
        };
    },

    markStageCleared: (stageId: string) => {
        const { clearedStageIds, vanThienDiaClears } = get();
        const updated = Array.from(new Set([...clearedStageIds, stageId]));
        let extraClears = vanThienDiaClears;
        if (stageId === "stage_23") {
            extraClears++;
        }
        set({ clearedStageIds: updated, vanThienDiaClears: extraClears });
    },

    updateLastOnline: () => set({ lastOnlineTimestamp: Date.now() }),

    resetAllData: () => set({
        realmIndex: 0,
        tierIndex: 0,
        tuVi: toBigNumber(0),
        tinhNguyen: toBigNumber(0),
        vocucPendingTuVi: toBigNumber(0),
        isVoCuc: false,
        vanThienDiaClears: 0,
        statPoints: 4,
        statVatLi: 0,
        statPhep: 0,
        statMau: 0,
        equipped: {
            non: "hat_01",
            giap: "armor_01",
            vukhi: "weapon_01"
        },
        equippedSkills: [
            "skill_toai_thach_quyen",
            "skill_dan_hoa_thuat",
            null
        ],
        equippedUltimate: "ult_than_nhat_niem",
        currencies: { ...DEFAULT_CURRENCIES },
        clearedStageIds: [],
        breakthroughBonusRate: 0,
        highestTowerFloor: 0,
        lastOnlineTimestamp: Date.now()
    })
}));
