export interface SkillDefinition {
    id: string;
    name: string;
    type: "vat_li" | "phep" | "ho_the" | "tri_lieu";
    reqRealm: number;
    reqTier: number;
    price: number;
    cooldown: number; // Thời gian hồi chiêu (giây)
    multiplier: number;
    icon: string;
    vfx: string;
    desc: string;
}

export interface UltimateSkillDefinition {
    id: string;
    name: string;
    tier: "than" | "thanh" | "linh";
    rageCost: number; // Nộ khí tiêu hao (thường 100 nộ)
    icon: string;
    vfx: string;
    desc: string;
    shortDesc: string;
}

export const SKILL_DATABASE: readonly SkillDefinition[] = [
    {
        id: "skill_toai_thach_quyen",
        name: "Toái Thạch Quyền",
        type: "vat_li",
        reqRealm: 0,
        reqTier: 0,
        price: 50,
        cooldown: 4,
        multiplier: 2.5,
        icon: "👊",
        vfx: "impact",
        desc: "Dồn kình lực vào nắm đấm, đập vỡ đá tảng. Gây 250% sát thương Vật Lí."
    },
    {
        id: "skill_dan_hoa_thuat",
        name: "Dẫn Hỏa Thuật",
        type: "phep",
        reqRealm: 0,
        reqTier: 0,
        price: 50,
        cooldown: 4,
        multiplier: 2.5,
        icon: "🔥",
        vfx: "fireball",
        desc: "Ngưng tụ một tia linh hỏa thiêu đốt địch thủ. Gây 250% sát thương Phép."
    },
    {
        id: "skill_thiet_bo_sam",
        name: "Thiết Bố Sam",
        type: "ho_the",
        reqRealm: 0,
        reqTier: 2,
        price: 120,
        cooldown: 8,
        multiplier: 0.45,
        icon: "🛡️",
        vfx: "shield",
        desc: "Vận khí bao phủ bì phu cứng như sắt thép. Nhận khiên hộ thể bằng 45% Máu tối đa trong 5s."
    },
    {
        id: "skill_quy_nguyen_khi",
        name: "Quy Nguyên Khí",
        type: "tri_lieu",
        reqRealm: 0,
        reqTier: 4,
        price: 200,
        cooldown: 9,
        multiplier: 2.5,
        icon: "💚",
        vfx: "heal",
        desc: "Điều hòa kinh mạch, khôi phục sinh lực bị tổn hại. Hồi phục lượng lớn Sinh Mệnh."
    }
];

export const ULTIMATE_SKILL_DATABASE: readonly UltimateSkillDefinition[] = [
    {
        id: "ult_than_nhat_niem",
        name: "Nhất Niệm",
        tier: "than",
        rageCost: 100,
        icon: "🌌",
        vfx: "void_slash",
        desc: "Nhất niệm khai thiên, vạn cổ giai không! Giáng đòn đánh thẳng vào 80% Máu tối đa của Boss, BỎ QUA HOÀN TOÀN KIM THÂN VÀ GIÁP/KHÁNG (Sát thương chuẩn True Damage).",
        shortDesc: "Trừ thẳng 80% Máu Boss (Sát thương chuẩn, Bỏ qua Kim Thân & Giáp)"
    },
    {
        id: "ult_thanh_tue_nguyet",
        name: "Tuế Nguyệt",
        tier: "thanh",
        rageCost: 200,
        icon: "⏳",
        vfx: "time_freeze",
        desc: "Luân chuyển thời không, nghịch hồi nhân quả! Tiêu hao 200 Nộ Khí, lập tức HỒI PHỤC TOÀN BỘ 3 KỸ NĂNG CHỦ ĐỘNG để xả combo tức thì.",
        shortDesc: "Hồi lập tức 3 kỹ năng thường (Tiêu hao 200 Nộ)"
    },
    {
        id: "ult_thanh_y_chi_bat_tan",
        name: "Ý Chí Bất Tận",
        tier: "thanh",
        rageCost: 100,
        icon: "⚔️",
        vfx: "berserk_frenzy",
        desc: "Chiến ý bất diệt! Trong 8 giây: Tăng +300% Tốc Độ Đánh, đòn đánh thường hóa thành SÁT THƯƠNG CHUẨN 800% Công Vật Lí.",
        shortDesc: "+300% Tốc Đánh, đòn đánh thành Sát Thương Chuẩn trong 8s"
    },
    {
        id: "ult_linh_vo_ton",
        name: "Vô Tổn",
        tier: "linh",
        rageCost: 100,
        icon: "🛡️",
        vfx: "arcane_barrier",
        desc: "Tạo lớp Khiên Hộ Thể cực dày bằng 600% Sát Thương Phép + 30% Máu Tối Đa trong 8 giây.",
        shortDesc: "Tạo khiên hộ thể dày 600% Phép + 30% Máu trong 8s"
    }
];

export class SkillSystem {
    static getSkillById(id: string | null | undefined): SkillDefinition | null {
        if (!id) return null;
        return SKILL_DATABASE.find(s => s.id === id) || null;
    }

    static getUltimateById(id: string | null | undefined): UltimateSkillDefinition | null {
        if (!id) return null;
        return ULTIMATE_SKILL_DATABASE.find(u => u.id === id) || null;
    }
}
