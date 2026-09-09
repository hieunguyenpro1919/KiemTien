/**
 * HỆ THỐNG ĐẠI THẦN THÔNG (ULTIMATE SKILLS) & GACHA CẦU ĐẠO
 * Phân cấp: 
 *  - Thần Cấp (4%): Đột biến tuyệt đối, sát thương chuẩn / bỏ qua quy luật
 *  - Thánh Cấp (26%): Cục diện xoay chuyển, can thiệp sâu vào trận đấu
 *  - Linh Cấp (70%): Chiến thuật ổn định, buff chỉ số & phòng hộ
 */

const ULTIMATE_SKILL_DATABASE = [
    // ================= [1] THẦN CẤP (Tỉ lệ 4%) =================
    {
        id: "ult_than_nhat_niem",
        name: "Nhất Niệm",
        tier: "than",
        costRage: 100,
        rageCost: 100,
        icon: "🌌",
        vfx: "void_slash",
        desc: "Nhất niệm khai thiên, vạn cổ giai không! Giáng đòn đánh thẳng vào 80% Máu tối đa của Boss, BỎ QUA HOÀN TOÀN KIM THÂN VÀ GIÁP/KHÁNG (Sát thương chuẩn True Damage).",
        detail: "Nhất niệm khai thiên, vạn cổ giai không! Giáng đòn đánh thẳng vào 80% Máu tối đa của Boss, BỎ QUA HOÀN TOÀN KIM THÂN VÀ GIÁP/KHÁNG (Sát thương chuẩn True Damage).",
        shortDesc: "Trừ thẳng 80% Máu Boss (Sát thương chuẩn, Bỏ qua Kim Thân & Giáp)"
    },

    // ================= [2] THÁNH CẤP (Tỉ lệ 26%) =================
    {
        id: "ult_thanh_tue_nguyet",
        name: "Tuế Nguyệt",
        tier: "thanh",
        costRage: 200, // Tích nộ lâu gấp đôi
        rageCost: 200,
        icon: "⏳",
        vfx: "time_freeze",
        desc: "Luân chuyển thời không, nghịch hồi nhân quả! Tiêu hao 200 Nộ Khí (lâu gấp đôi), lập tức LÀM MỚI TOÀN BỘ 3 KỸ NĂNG CHỦ ĐỘNG của bản thân để xả skill liên hoàn.",
        detail: "Luân chuyển thời không, nghịch hồi nhân quả! Tiêu hao 200 Nộ Khí (lâu gấp đôi), lập tức LÀM MỚI TOÀN BỘ 3 KỸ NĂNG CHỦ ĐỘNG của bản thân để xả skill liên hoàn.",
        shortDesc: "Lập tức hồi toàn bộ 3 kỹ năng thường (Tiêu hao 200 Nộ)"
    },
    {
        id: "ult_thanh_y_chi_bat_tan",
        name: "Ý Chí Bất Tận",
        tier: "thanh",
        costRage: 100,
        rageCost: 100,
        icon: "⚔️",
        vfx: "berserk_frenzy",
        desc: "Chiến ý bất diệt, quyền kình xé toạc hư không! Trong 8 giây kích phát: Tăng +200% Tốc Độ Đánh, đồng thời đòn đánh thường biến thành SÁT THƯƠNG CHUẨN (gây 250% Công Vật Lí bỏ qua giáp).",
        detail: "Chiến ý bất diệt, quyền kình xé toạc hư không! Trong 8 giây kích phát: Tăng +200% Tốc Độ Đánh, đồng thời đòn đánh thường biến thành SÁT THƯƠNG CHUẨN (gây 250% Công Vật Lí bỏ qua giáp).",
        shortDesc: "+200% Tốc Đánh, đánh thường thành Sát Thương Chuẩn trong 8s"
    },

    // ================= [3] LINH CẤP (Tỉ lệ 70%) =================
    {
        id: "ult_linh_vo_ton",
        name: "Vô Tổn",
        tier: "linh",
        costRage: 100,
        rageCost: 100,
        icon: "🛡️",
        vfx: "arcane_barrier",
        desc: "Linh lực ngưng kết thành hộ thuẫn chí tôn! Tạo lớp Khiên Hộ Thể cực dày bằng 600% Sát Thương Phép + 30% Máu Tối Đa trong 8 giây.",
        detail: "Linh lực ngưng kết thành hộ thuẫn chí tôn! Tạo lớp Khiên Hộ Thể cực dày bằng 600% Sát Thương Phép + 30% Máu Tối Đa trong 8 giây.",
        shortDesc: "Tạo Khiên Hộ Thể cực dày (600% Công Phép + 30% Max HP)"
    },
    {
        id: "ult_linh_bat_kham",
        name: "Bất Kham",
        tier: "linh",
        costRage: 100,
        rageCost: 100,
        icon: "⚡",
        vfx: "iron_will",
        desc: "Kim thân bất toái, tâm cảnh kiên cố! Trong 10 giây, đối thủ KHÔNG THỂ gây sát thương vượt quá 5% Máu Tối Đa của bản thân trong mỗi đòn đánh (Damage Cap phòng ngự).",
        detail: "Kim thân bất toái, tâm cảnh kiên cố! Trong 10 giây, đối thủ KHÔNG THỂ gây sát thương vượt quá 5% Máu Tối Đa của bản thân trong mỗi đòn đánh (Damage Cap phòng ngự).",
        shortDesc: "Trong 10s, chặn mọi đòn đánh của Boss không vượt quá 5% Max HP"
    },
    {
        id: "ult_linh_huyet_te",
        name: "Huyết Tế",
        tier: "linh",
        costRage: 100,
        rageCost: 100,
        icon: "🩸",
        vfx: "blood_sacrifice",
        desc: "Đốt cháy huyết mạch đoạt mệnh địch nhân! Tiêu hao 50% Máu hiện tại để giáng đòn hủy diệt gây 45% Máu Tối Đa của Boss. Đòn đánh này XUYÊN KIM THÂN nhưng KHÔNG XUYÊN GIÁP.",
        detail: "Đốt cháy huyết mạch đoạt mệnh địch nhân! Tiêu hao 50% Máu hiện tại để giáng đòn hủy diệt gây 45% Máu Tối Đa của Boss. Đòn đánh này XUYÊN KIM THÂN nhưng KHÔNG XUYÊN GIÁP.",
        shortDesc: "Tự trừ 50% Máu, gây 45% Máu Boss (Xuyên Kim Thân, không xuyên Giáp)"
    }
];

class UltimateSkillSystem {
    static getSkillById(id) {
        return ULTIMATE_SKILL_DATABASE.find(s => s.id === id) || null;
    }

    static getSkill(id) {
        return this.getSkillById(id);
    }

    static getAllSkills() {
        return ULTIMATE_SKILL_DATABASE;
    }

    static getSkillsByTier(tier) {
        return ULTIMATE_SKILL_DATABASE.filter(s => s.tier === tier);
    }

    static getTier(tier) {
        return this.getTierInfo(tier);
    }

    static getTierInfo(tier) {
        switch (tier) {
            case "than":
                return {
                    name: "Thần Cấp",
                    color: "#ffd700",
                    badgeColor: "#ff1744",
                    bg: "radial-gradient(circle, rgba(255, 23, 68, 0.25), rgba(255, 215, 0, 0.15))",
                    border: "#ffd700",
                    glow: "0 0 20px rgba(255, 215, 0, 0.6), 0 0 35px rgba(255, 23, 68, 0.4)",
                    ratePct: 0.2
                };
            case "thanh":
                return {
                    name: "Thánh Cấp",
                    color: "#e040fb",
                    badgeColor: "#7c4dff",
                    bg: "radial-gradient(circle, rgba(224, 64, 251, 0.2), rgba(124, 77, 255, 0.1))",
                    border: "#e040fb",
                    glow: "0 0 15px rgba(224, 64, 251, 0.5)",
                    ratePct: 2.0
                };
            case "linh":
            default:
                return {
                    name: "Linh Cấp",
                    color: "#00e676",
                    badgeColor: "#00b0ff",
                    bg: "radial-gradient(circle, rgba(0, 230, 118, 0.15), rgba(0, 176, 255, 0.08))",
                    border: "#00e676",
                    glow: "0 0 12px rgba(0, 230, 118, 0.4)",
                    ratePct: 97.8
                };
        }
    }

    /**
     * Rút ngẫu nhiên 1 Đại Thần Thông theo tỉ lệ Gacha & Cơ Chế Bảo Hiểm (Pity):
     * - Hard Pity Thần Cấp: 500 lần chắc chắn ra Thần Cấp (pityThan >= 500)
     * - Hard Pity Thánh Cấp: 100 lần chắc chắn ra Thánh Cấp (pityThanh >= 100)
     * - Tỉ lệ cơ sở:
     *   + Thần Cấp : 0.2% (0 <= roll < 0.2)
     *   + Thánh Cấp: 2.0% (0.2 <= roll < 2.2)
     *   + Linh Cấp : 97.8% (2.2 <= roll < 100)
     */
    static rollGachaDrop(pityThan = 0, pityThanh = 0) {
        let chosenTier = "linh";

        if (pityThan >= 500) {
            chosenTier = "than";
        } else if (pityThanh >= 100) {
            chosenTier = "thanh";
        } else {
            const roll = Math.random() * 100;
            if (roll < 0.2) {
                chosenTier = "than";
            } else if (roll < 2.2) {
                chosenTier = "thanh";
            } else {
                chosenTier = "linh";
            }
        }

        const pool = this.getSkillsByTier(chosenTier);
        if (pool.length === 0) return ULTIMATE_SKILL_DATABASE[0];

        const randomIndex = Math.floor(Math.random() * pool.length);
        return pool[randomIndex];
    }
}

// Export cho môi trường Node.js (Unit Test) và Trình duyệt
if (typeof module !== "undefined" && module.exports) {
    module.exports = { ULTIMATE_SKILL_DATABASE, ULTIMATE_SKILLS: ULTIMATE_SKILL_DATABASE, UltimateSkillSystem };
}
if (typeof window !== "undefined") {
    window.ULTIMATE_SKILL_DATABASE = ULTIMATE_SKILL_DATABASE;
    window.ULTIMATE_SKILLS = ULTIMATE_SKILL_DATABASE;
    window.UltimateSkillSystem = UltimateSkillSystem;
}
