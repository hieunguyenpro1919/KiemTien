/**
 * HỆ THỐNG TAM ĐẠI THẦN THÚ & CƠ CHẾ NUÔI DƯỠNG (DIVINE BEAST SYSTEM)
 * 3 Thần Thú độc bản tương đương phẩm cấp THẦN CẤP:
 * 1. pet_tank: Bắc Hải Huyền Vũ (Hộ Vệ - Tank)
 * 2. pet_dps:  Cửu U Ma Long (Kích Sát - DPS)
 * 3. pet_buff: Cửu Thiên Phượng Hoàng (Phụ Trợ - Buff)
 */

const PET_REALMS = [
    { index: 0,  name: "Tôi Khí Cảnh",              reqExp: 500,           titleColor: "#a3b899" },
    { index: 1,  name: "Ngưng Khí Cảnh",            reqExp: 3000,          titleColor: "#4ecca3" },
    { index: 2,  name: "Linh Hải Cảnh",             reqExp: 20000,         titleColor: "#00adb5" },
    { index: 3,  name: "Tạo Đảo Cảnh",              reqExp: 150000,        titleColor: "#3f72af" },
    { index: 4,  name: "Nguyên Linh Thụ",           reqExp: 1000000,       titleColor: "#16c79a" },
    { index: 5,  name: "Tạo Hóa Đài",               reqExp: 8000000,       titleColor: "#f39c12" },
    { index: 6,  name: "Thông Thiên Trụ",           reqExp: 60000000,      titleColor: "#e056fd" },
    { index: 7,  name: "Ngọc Điện Cảnh",            reqExp: 500000000,     titleColor: "#f1c40f" },
    { index: 8,  name: "Đỉnh Cấp Ngai",             reqExp: 4000000000,    titleColor: "#e74c3c" },
    { index: 9,  name: "Vô Thượng Lộ",              reqExp: 30000000000,   titleColor: "#ff007f" },
    { index: 10, name: "Vạn Vì Tinh Tú",            reqExp: 200000000000,  titleColor: "#00f2fe" },
    { index: 11, name: "Đại Đạo Chí Cao Vô Thượng", reqExp: 1500000000000, titleColor: "#ffd700" }
];

const PET_DATABASE = [
    {
        id: "pet_tank",
        name: "Bắc Hải Huyền Vũ",
        role: "ho_ve",
        roleName: "Hộ Vệ (Tank)",
        icon: "🐢",
        element: "Băng Thủy / Cương Thạch",
        themeColor: "#00d2d3",
        badgeBg: "rgba(0, 210, 211, 0.2)",
        borderGlow: "0 0 15px rgba(0, 210, 211, 0.6)",
        lore: "Thượng cổ Thánh thú ngưng kết từ vạn năm huyền băng và địa mạch vĩnh cửu của Bắc Hải, sở hữu khả năng hộ chủ tuyệt đối, bia thịt bất hoại che chở đạo tâm.",
        baseStats: {
            hp: 2500,
            vatLi: 25,
            phep: 20,
            phongThu: 50,
            attackSpeed: 2.2
        },
        passive: {
            id: "passive_tank",
            name: "Bá Thể Bất Diệt",
            icon: "🛡️",
            desc: "Tăng 20% Máu tối đa cho cả Thần Thú lẫn Chủ Nhân. Khi bước vào trận chiến, Thần Thú tự động ngưng kết một lớp khiên hộ thể bằng 200% Máu tối đa của nó. Toàn bộ đòn đánh của kẻ địch sẽ nhắm vào Thần Thú trước."
        },
        skill: {
            id: "skill_pet_tank",
            name: "Phản Sát Chấn Thiên",
            icon: "💥",
            type: "passive_reflect",
            cooldown: 0, // Phản đòn nội tại khi bị đánh trúng
            desc: "Bật trạng thái phản chấn hộ thể. Khi bị kẻ địch tấn công, phản ngược lại sát thương nhận vào về phía đối thủ."
        }
    },
    {
        id: "pet_dps",
        name: "Cửu U Ma Long",
        role: "kich_sat",
        roleName: "Kích Sát (DPS)",
        icon: "🐉",
        element: "U Minh / Lôi Hỏa",
        themeColor: "#ff3838",
        badgeBg: "rgba(255, 56, 56, 0.2)",
        borderGlow: "0 0 15px rgba(255, 56, 56, 0.6)",
        lore: "Hắc Long đản sinh nơi chín tầng địa ngục sâu thẳm, mang trong mình ngọn lửa hủy diệt vô tận. Tấn công hủy thiên diệt địa, đoạt hồn phách sinh linh bổ dưỡng cho phe ta.",
        baseStats: {
            hp: 800,
            vatLi: 120,
            phep: 100,
            phongThu: 10,
            attackSpeed: 1.6
        },
        passive: {
            id: "passive_dps",
            name: "Hủy Thiên Diệt Địa",
            icon: "⚡",
            desc: "Mọi đòn tấn công của Thần Thú đánh trực tiếp vào chân thân đối thủ, HOÀN TOÀN BỎ QUA Kim Thân bất hoại và Hộ Giáp của Boss (Sát thương chuẩn đánh thẳng vào máu)."
        },
        skill: {
            id: "skill_pet_dps",
            name: "Tước Đoạt Sinh Mệnh",
            icon: "🩸",
            type: "active",
            cooldown: 20, // Giảm dần theo cấp độ
            desc: "Cưỡng chế đoạt % Máu hiện tại của Boss, lập tức hồi phục lượng sinh lực đoạt được đồng thời cho cả Thần Thú và Chủ Nhân."
        }
    },
    {
        id: "pet_buff",
        name: "Cửu Thiên Phượng Hoàng",
        role: "phu_tro",
        roleName: "Phụ Trợ (Buff)",
        icon: "🦅",
        element: "Niết Bàn / Thuần Dương",
        themeColor: "#ffd700",
        badgeBg: "rgba(255, 215, 0, 0.2)",
        borderGlow: "0 0 15px rgba(255, 215, 0, 0.6)",
        lore: "Thần điểu niết bàn từ chí dương thiên hỏa cửu trùng thiên, tiếng hót vang vọng chấn hưng chiến ý, ban phát chúc phúc vô lượng cho người sở hữu vượt qua ranh giới phàm trần.",
        baseStats: {
            hp: 1500,
            vatLi: 40,
            phep: 60,
            phongThu: 25,
            attackSpeed: 1.4
        },
        passive: {
            id: "passive_buff",
            name: "Vĩnh Kiếp Chúc Phúc",
            icon: "👑",
            desc: "Sát thương gây ra của Chủ Nhân vĩnh viễn tăng gấp 2 lần (+100% Tổng Sát Thương từ đòn đánh thường và toàn bộ kỹ năng)."
        },
        skill: {
            id: "skill_pet_buff",
            name: "Đại Đạo Cuồng Nộ",
            icon: "🔥",
            type: "active_buff",
            cooldown: 25,
            desc: "Khai mở trạng thái đốn ngộ cuồng loạn cho Chủ Nhân: Tăng gấp 10 lần Tốc độ đánh, và toàn bộ đòn đánh của Chủ Nhân trong trạng thái này đều đánh trực diện bỏ qua Kim Thân của Boss (vẫn chịu ảnh hưởng của Giáp)."
        }
    }
];

class PetSystem {
    static getAllPets() {
        return PET_DATABASE;
    }

    static getPetById(id) {
        return PET_DATABASE.find(p => p.id === id) || null;
    }

    static getRealm(realmIndex) {
        const idx = Math.max(0, Math.min(PET_REALMS.length - 1, realmIndex || 0));
        return PET_REALMS[idx];
    }

    static getMaxRealm() {
        return PET_REALMS.length - 1;
    }

    /**
     * Tính toán chỉ số của Thần Thú theo Cảnh Giới (0 - 11)
     * - Tank: HP tăng lũy kế cực mạnh (x2.6 mỗi cảnh giới), Công tăng nhẹ (x1.8).
     * - DPS:  Công tăng lũy kế cực đại (x2.4 mỗi cảnh giới), HP tăng rất thấp (x1.6).
     * - Buff: Tốc độ cao, HP tăng cân bằng (x2.0), Công tăng vừa (x1.9).
     */
    static calculatePetStats(petId, realmIndex = 0) {
        const pet = this.getPetById(petId);
        if (!pet) return null;

        const realm = Math.max(0, Math.min(11, realmIndex));
        const base = pet.baseStats;

        if (petId === "pet_tank") {
            const hpMult = Math.pow(2.6, realm);
            const atkMult = Math.pow(1.8, realm);
            const defMult = Math.pow(2.2, realm);
            return {
                maxHp: Math.floor(base.hp * hpMult),
                vatLi: Math.floor(base.vatLi * atkMult),
                phep: Math.floor(base.phep * atkMult),
                phongThu: Math.floor(base.phongThu * defMult),
                attackSpeed: base.attackSpeed
            };
        } else if (petId === "pet_dps") {
            const hpMult = Math.pow(1.65, realm);
            const atkMult = Math.pow(2.45, realm);
            const defMult = Math.pow(1.5, realm);
            return {
                maxHp: Math.floor(base.hp * hpMult),
                vatLi: Math.floor(base.vatLi * atkMult),
                phep: Math.floor(base.phep * atkMult),
                phongThu: Math.floor(base.phongThu * defMult),
                attackSpeed: base.attackSpeed
            };
        } else {
            // pet_buff
            const hpMult = Math.pow(2.0, realm);
            const atkMult = Math.pow(1.9, realm);
            const defMult = Math.pow(1.8, realm);
            return {
                maxHp: Math.floor(base.hp * hpMult),
                vatLi: Math.floor(base.vatLi * atkMult),
                phep: Math.floor(base.phep * atkMult),
                phongThu: Math.floor(base.phongThu * defMult),
                attackSpeed: base.attackSpeed
            };
        }
    }

    /**
     * Thông số Thần Thông theo cấp độ (1 - 12)
     */
    static getSkillInfo(petId, skillLevel = 1) {
        const lvl = Math.max(1, Math.min(12, skillLevel || 1));
        const pet = this.getPetById(petId);
        if (!pet) return null;

        if (petId === "pet_tank") {
            // Cấp 1: 10% phản sát thương, mỗi cấp +5% (Cấp 12: 65%)
            const reflectPct = 0.10 + (lvl - 1) * 0.05;
            return {
                id: pet.skill.id,
                name: pet.skill.name,
                level: lvl,
                maxLevel: 12,
                reflectPct: Math.round(reflectPct * 100),
                cooldown: 0,
                desc: `Phản lại ${Math.round(reflectPct * 100)}% tổng sát thương kẻ địch đánh trúng về phía đối thủ.`
            };
        } else if (petId === "pet_dps") {
            // Cấp 1: Đoạt 20% máu hiện tại Boss, CD 20s.
            // Mỗi cấp: +1% máu đoạt (Cấp 12: 31%), giảm 0.8s CD (Cấp 12: 11.2s)
            const drainPct = 0.20 + (lvl - 1) * 0.01;
            const cooldown = Math.max(8, 20 - (lvl - 1) * 0.8);
            return {
                id: pet.skill.id,
                name: pet.skill.name,
                level: lvl,
                maxLevel: 12,
                drainPct: Math.round(drainPct * 100),
                cooldown: Math.round(cooldown * 10) / 10,
                desc: `Cưỡng chế đoạt ${Math.round(drainPct * 100)}% Máu hiện tại của Boss (Hồi chiêu: ${(Math.round(cooldown * 10) / 10)}s), hồi phục lượng máu đó đồng thời cho cả Thần Thú và Chủ Nhân.`
            };
        } else {
            // pet_buff
            // Cấp 1: Tăng 10x tốc đánh & xuyên Kim Thân trong 5.0s, CD 25s.
            // Mỗi cấp: +0.5s thời lượng (Cấp 12: 10.5s), CD 25s.
            const duration = 5.0 + (lvl - 1) * 0.5;
            const cooldown = 25.0;
            return {
                id: pet.skill.id,
                name: pet.skill.name,
                level: lvl,
                maxLevel: 12,
                speedMultiplier: 10.0,
                duration: Math.round(duration * 10) / 10,
                cooldown: cooldown,
                desc: `Tăng gấp 10 lần Tốc độ đánh của Chủ Nhân trong ${Math.round(duration * 10) / 10} giây (Hồi chiêu: ${cooldown}s). Toàn bộ đòn đánh của Chủ Nhân trong trạng thái này đánh trực diện bỏ qua Kim Thân của Boss (vẫn chịu ảnh hưởng của Giáp).`
            };
        }
    }

    /**
     * Chi phí và điều kiện nâng cấp Thần Thông lên cấp kế tiếp (từ currentLevel lên currentLevel + 1)
     */
    static getSkillUpgradeCost(petId, currentLevel = 1) {
        const nextLvl = currentLevel + 1;
        if (nextLvl > 12) return null; // Đã đạt cấp tối đa

        // Yêu cầu Mảnh Thú Hồn: Cấp 2-4: 1 mảnh, Cấp 5-8: 2 mảnh, Cấp 9-11: 3 mảnh, Cấp 12: 5 mảnh
        let shardsNeeded = 1;
        if (nextLvl >= 12) shardsNeeded = 5;
        else if (nextLvl >= 9) shardsNeeded = 3;
        else if (nextLvl >= 5) shardsNeeded = 2;

        // Yêu cầu Linh Thạch / Hỗn Nguyên Thạch
        let linhThach = 0;
        let honNguyen = 0;
        if (nextLvl <= 3) {
            linhThach = nextLvl * 50000;
        } else if (nextLvl <= 6) {
            linhThach = nextLvl * 500000;
        } else if (nextLvl <= 8) {
            linhThach = nextLvl * 10000000;
        } else if (nextLvl <= 10) {
            linhThach = nextLvl * 500000000;
        } else {
            // Cấp 11, 12: Cần Hỗn Nguyên Thạch
            honNguyen = (nextLvl - 10) * 1000;
        }

        // Đan dược mốc tương ứng (tùy chọn theo cấp)
        let pillId = null;
        let pillName = null;
        if (nextLvl === 2) { pillId = "pill_tu_khi_dai"; pillName = "Đại Tụ Khí Đan"; }
        else if (nextLvl === 3) { pillId = "pill_tu_khi_dai"; pillName = "Đại Tụ Khí Đan"; }
        else if (nextLvl === 4) { pillId = "pill_ngoc_linh"; pillName = "Ngọc Linh Đan"; }
        else if (nextLvl === 5) { pillId = "pill_tien_linh"; pillName = "Tiên Linh Đan"; }
        else if (nextLvl === 6) { pillId = "pill_tien_linh"; pillName = "Tiên Linh Đan"; }
        else if (nextLvl === 7) { pillId = "pill_cuu_dieu"; pillName = "Cửu Diệu Bất Tử Dược"; }
        else if (nextLvl === 8) { pillId = "pill_cuu_dieu"; pillName = "Cửu Diệu Bất Tử Dược"; }
        else if (nextLvl === 9) { pillId = "pill_thanh_chuyen"; pillName = "Cửu Chuyển Thánh Đan"; }
        else if (nextLvl === 10) { pillId = "pill_thanh_01"; pillName = "Vĩnh Hằng Thánh Đan"; }
        else if (nextLvl === 11) { pillId = "pill_tinh_tu"; pillName = "Cửu Diệu Thần Tinh Đan"; }
        else if (nextLvl === 12) { pillId = "pill_khoi_nguyen_thanh_dan"; pillName = "Đại Đạo Khởi Nguyên Đan"; }

        return {
            targetLevel: nextLvl,
            reqRealm: nextLvl - 1, // Để lên cấp N cần Thú đạt Cảnh Giới N - 1
            shards: shardsNeeded,
            linhThach,
            honNguyen,
            pillId,
            pillName
        };
    }
}

// Export cho môi trường Node.js và Trình duyệt
if (typeof module !== "undefined" && module.exports) {
    module.exports = { PET_DATABASE, PET_REALMS, PetSystem };
}
if (typeof window !== "undefined") {
    window.PET_DATABASE = PET_DATABASE;
    window.PET_REALMS = PET_REALMS;
    window.PetSystem = PetSystem;
}
