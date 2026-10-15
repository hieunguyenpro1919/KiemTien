import { toBigNumber } from "../types/bignum";
import { PetDefinition, PetId, PetRealmConfig, PetCombatStats } from "../types/pet";

/**
 * 12 Cảnh Giới Của Thần Thú Đồng Bộ Chuẩn Xác Với Nhân Vật
 */
export const PET_REALMS: readonly PetRealmConfig[] = [
    { index: 0,  name: "Tôi Khí Cảnh",              reqTuVi: toBigNumber(500),           titleColor: "#a3b899" },
    { index: 1,  name: "Ngưng Khí Cảnh",            reqTuVi: toBigNumber(3000),          titleColor: "#4ecca3" },
    { index: 2,  name: "Linh Hải Cảnh",             reqTuVi: toBigNumber(20000),         titleColor: "#00adb5" },
    { index: 3,  name: "Tạo Đảo Cảnh",              reqTuVi: toBigNumber(150000),        titleColor: "#3f72af" },
    { index: 4,  name: "Nguyên Linh Thụ",           reqTuVi: toBigNumber(1000000),       titleColor: "#16c79a" },
    { index: 5,  name: "Tạo Hóa Đài",               reqTuVi: toBigNumber(8000000),       titleColor: "#f39c12" },
    { index: 6,  name: "Thông Thiên Trụ",           reqTuVi: toBigNumber(60000000),      titleColor: "#e056fd" },
    { index: 7,  name: "Ngọc Điện Cảnh",            reqTuVi: toBigNumber(500000000),     titleColor: "#f1c40f" },
    { index: 8,  name: "Đỉnh Cấp Ngai",             reqTuVi: toBigNumber(4000000000),    titleColor: "#e74c3c" },
    { index: 9,  name: "Vô Thượng Lộ",              reqTuVi: toBigNumber(30000000000),   titleColor: "#ff007f" },
    { index: 10, name: "Vạn Vì Tinh Tú",            reqTuVi: toBigNumber(200000000000),  titleColor: "#00f2fe" },
    { index: 11, name: "Đại Đạo Chí Cao Vô Thượng", reqTuVi: toBigNumber(1500000000000), titleColor: "#ffd700" }
];

export const PET_DATABASE: readonly PetDefinition[] = [
    {
        id: "pet_tank",
        name: "Bắc Hải Huyền Vũ",
        aliasName: "Hộ Vệ Côn Bằng",
        role: "tank",
        roleName: "Hộ Vệ (Tank)",
        icon: "🐢",
        element: "Băng Thủy / Cương Thạch",
        themeColor: "#00d2d3",
        lore: "Thượng cổ Thánh thú ngưng kết từ vạn năm huyền băng và địa mạch vĩnh cửu của Bắc Hải, sở hữu khả năng hộ chủ tuyệt đối, bia thịt bất hoại che chở đạo tâm.",
        baseStats: {
            hp: toBigNumber(2500),
            attack: toBigNumber(25),
            defense: toBigNumber(50),
            attackSpeed: 2.2
        },
        passive: {
            id: "passive_tank",
            name: "Bá Thể Bất Diệt",
            icon: "🛡️",
            description: "Tăng 20% Máu tối đa cho cả Thần Thú lẫn Chủ Nhân. Khi vào trận, tự động tạo khiên hộ thể bằng 200% HP Thần Thú đỡ mọi đòn cho Chủ Nhân."
        },
        skill: {
            id: "skill_pet_tank",
            name: "Phản Sát Chấn Thiên",
            icon: "💥",
            cooldown: 0,
            description: "Bật trạng thái phản chấn hộ thể. Khi bị kẻ địch tấn công, phản ngược lại sát thương nhận vào về phía đối thủ.",
            upgradeCosts: []
        }
    },
    {
        id: "pet_dps",
        name: "Cửu U Ma Long",
        aliasName: "Thần Thú Huyết Nguyệt",
        role: "dps",
        roleName: "Kích Sát (DPS)",
        icon: "🐉",
        element: "U Minh / Lôi Hỏa",
        themeColor: "#ff3838",
        lore: "Hắc Long đản sinh nơi chín tầng địa ngục sâu thẳm, mang trong mình ngọn lửa hủy diệt vô tận. Tấn công hủy thiên diệt địa, đoạt hồn phách sinh linh.",
        baseStats: {
            hp: toBigNumber(800),
            attack: toBigNumber(120),
            defense: toBigNumber(10),
            attackSpeed: 1.6
        },
        passive: {
            id: "passive_dps",
            name: "Hủy Thiên Diệt Địa",
            icon: "⚡",
            description: "Mọi đòn tấn công của Thần Thú đánh trực tiếp vào chân thân đối thủ, HOÀN TOÀN BỎ QUA Kim Thân bất hoại và Hộ Giáp của Boss (100% Sát thương chuẩn)."
        },
        skill: {
            id: "skill_pet_dps",
            name: "Tước Đoạt Sinh Mệnh",
            icon: "🩸",
            cooldown: 20,
            description: "Cưỡng chế đoạt % Máu hiện tại của Boss, lập tức hồi phục lượng sinh lực đoạt được đồng thời cho cả Thần Thú và Chủ Nhân.",
            upgradeCosts: []
        }
    },
    {
        id: "pet_buff",
        name: "Cửu Thiên Phượng Hoàng",
        aliasName: "Chí Tôn Hỗn Độn",
        role: "buff",
        roleName: "Phụ Trợ (Buff)",
        icon: "🦅",
        element: "Niết Bàn / Thuần Dương",
        themeColor: "#ffd700",
        lore: "Thần điểu niết bàn từ chí dương thiên hỏa cửu trùng thiên, tiếng hót vang vọng chấn hưng chiến ý, ban phát chúc phúc vô lượng cho người sở hữu.",
        baseStats: {
            hp: toBigNumber(1500),
            attack: toBigNumber(60),
            defense: toBigNumber(25),
            attackSpeed: 1.4
        },
        passive: {
            id: "passive_buff",
            name: "Vĩnh Kiếp Chúc Phúc",
            icon: "👑",
            description: "Sát thương gây ra của Chủ Nhân vĩnh viễn tăng gấp 2 lần (+100% Tổng Sát Thương từ đòn đánh thường và toàn bộ kỹ năng)."
        },
        skill: {
            id: "skill_pet_buff",
            name: "Đại Đạo Cuồng Nộ",
            icon: "🔥",
            cooldown: 25,
            description: "Tăng gấp 10 lần Tốc độ đánh của Chủ Nhân và toàn bộ đòn đánh của Chủ Nhân trong trạng thái này đánh trực diện bỏ qua Kim Thân của Boss.",
            upgradeCosts: []
        }
    }
];

export class PetSystem {
    static getAllPets(): readonly PetDefinition[] {
        return PET_DATABASE;
    }

    static getPetById(id: PetId | string): PetDefinition | null {
        return PET_DATABASE.find(p => p.id === id) || null;
    }

    static getRealm(realmIndex: number): PetRealmConfig {
        const idx = Math.max(0, Math.min(PET_REALMS.length - 1, realmIndex || 0));
        return PET_REALMS[idx];
    }

    static getMaxRealm(): number {
        return PET_REALMS.length - 1;
    }

    /**
     * Tính toán chỉ số Thần Thú theo Cảnh Giới dạng BigNumber
     */
    static calculatePetStats(petId: PetId, realmIndex = 0): PetCombatStats | null {
        const pet = this.getPetById(petId);
        if (!pet) return null;

        const realm = Math.max(0, Math.min(11, realmIndex));
        const base = pet.baseStats;

        if (petId === "pet_tank") {
            const hpMult = toBigNumber(2.6).pow(realm);
            const atkMult = toBigNumber(1.8).pow(realm);
            const defMult = toBigNumber(2.2).pow(realm);
            return {
                hp: base.hp.times(hpMult).floor(),
                attack: base.attack.times(atkMult).floor(),
                defense: base.defense.times(defMult).floor(),
                attackSpeed: base.attackSpeed
            };
        } else if (petId === "pet_dps") {
            const hpMult = toBigNumber(1.65).pow(realm);
            const atkMult = toBigNumber(2.45).pow(realm);
            const defMult = toBigNumber(1.5).pow(realm);
            return {
                hp: base.hp.times(hpMult).floor(),
                attack: base.attack.times(atkMult).floor(),
                defense: base.defense.times(defMult).floor(),
                attackSpeed: base.attackSpeed
            };
        } else {
            // pet_buff
            const hpMult = toBigNumber(2.0).pow(realm);
            const atkMult = toBigNumber(1.9).pow(realm);
            const defMult = toBigNumber(1.8).pow(realm);
            return {
                hp: base.hp.times(hpMult).floor(),
                attack: base.attack.times(atkMult).floor(),
                defense: base.defense.times(defMult).floor(),
                attackSpeed: base.attackSpeed
            };
        }
    }

    /**
     * Chi tiết kỹ năng trợ chiến theo cấp độ (1 -> 12)
     */
    static getPetSkillInfo(petId: PetId, skillLevel = 1) {
        const lvl = Math.max(1, Math.min(12, skillLevel));
        const pet = this.getPetById(petId);
        if (!pet) return null;

        if (petId === "pet_tank") {
            const reflectPct = 10 + (lvl - 1) * 5; // 10% -> 65%
            return {
                id: pet.skill.id,
                name: pet.skill.name,
                level: lvl,
                maxLevel: 12,
                reflectPct,
                cooldown: 0,
                desc: `Phản lại ${reflectPct}% tổng sát thương kẻ địch đánh trúng về phía đối thủ.`
            };
        } else if (petId === "pet_dps") {
            const drainPct = 20 + (lvl - 1); // 20% -> 31%
            const cooldown = Math.max(8, 20 - (lvl - 1) * 0.8);
            return {
                id: pet.skill.id,
                name: pet.skill.name,
                level: lvl,
                maxLevel: 12,
                drainPct,
                cooldown: Math.round(cooldown * 10) / 10,
                desc: `Cưỡng chế đoạt ${drainPct}% Máu hiện tại của Boss, hồi phục lượng sinh lực đó cho Thú và Chủ Nhân.`
            };
        } else {
            const duration = 5.0 + (lvl - 1) * 0.5; // 5.0s -> 10.5s
            return {
                id: pet.skill.id,
                name: pet.skill.name,
                level: lvl,
                maxLevel: 12,
                speedMultiplier: 10.0,
                duration: Math.round(duration * 10) / 10,
                cooldown: 25.0,
                desc: `Tăng gấp 10 lần Tốc độ đánh của Chủ Nhân trong ${Math.round(duration * 10) / 10}s và bỏ qua Kim Thân.`
            };
        }
    }

    /**
     * Chi phí nâng cấp Thần Thông trợ chiến
     */
    static getSkillUpgradeCost(currentLevel = 1) {
        const nextLvl = currentLevel + 1;
        if (nextLvl > 12) return null;

        let shards = 1;
        if (nextLvl >= 12) shards = 5;
        else if (nextLvl >= 9) shards = 3;
        else if (nextLvl >= 5) shards = 2;

        let linhThach = toBigNumber(0);
        let honNguyen = toBigNumber(0);

        if (nextLvl <= 3) {
            linhThach = toBigNumber(nextLvl * 50000);
        } else if (nextLvl <= 6) {
            linhThach = toBigNumber(nextLvl * 500000);
        } else if (nextLvl <= 8) {
            linhThach = toBigNumber(nextLvl * 10000000);
        } else if (nextLvl <= 10) {
            linhThach = toBigNumber(nextLvl * 500000000);
        } else {
            honNguyen = toBigNumber((nextLvl - 10) * 1000);
        }

        return {
            targetLevel: nextLvl,
            reqRealm: nextLvl - 1,
            shards,
            linhThach,
            honNguyen
        };
    }
}
