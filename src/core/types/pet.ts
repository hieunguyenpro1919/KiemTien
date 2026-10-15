import { BigNumber } from "./bignum";

/**
 * Định danh Tam Đại Thần Thú Thượng Cổ
 */
export type PetId =
    | "pet_tank"    // Bắc Hải Huyền Vũ / Hộ Vệ Côn Bằng (Đỡ đòn, Phản thương, Khiên hộ thể)
    | "pet_dps"     // Cửu U Ma Long / Thần Thú Huyết Nguyệt (Sát thương chuẩn, Trảm % Máu Boss)
    | "pet_buff";   // Cửu Thiên Phượng Hoàng / Chí Tôn Hỗn Độn (Nhân đôi công kích, Cuồng bạo 10x tốc đánh)

/**
 * Vai trò chiến thuật của Thần Thú
 */
export type PetRole = "tank" | "dps" | "buff";

/**
 * 12 Cảnh Giới Tu Vi Của Thần Thú
 */
export interface PetRealmConfig {
    readonly index: number;       // 0 -> 11
    readonly name: string;        // Tên cảnh giới thú (Tôi Khí Cảnh -> Đại Đạo Chí Cao)
    readonly reqTuVi: BigNumber;  // Tu vi thú cần để đột phá
    readonly titleColor: string;  // Màu nhận diện
}

/**
 * Chỉ Số Chiến Đấu Thần Thú
 */
export interface PetCombatStats {
    hp: BigNumber;
    attack: BigNumber;
    defense: BigNumber;
    attackSpeed: number;
}

/**
 * Nội Tại Thần Thú (Vĩnh cửu khi xuất trận)
 */
export interface PetPassiveDefinition {
    readonly id: string;
    readonly name: string;
    readonly icon: string;
    readonly description: string;
}

/**
 * Thần Thông Trợ Chiến Của Thần Thú (Có 12 Cấp Độ)
 */
export interface PetSkillLevelUpgradeCost {
    readonly level: number;             // 2 -> 12
    readonly reqShards: number;         // Mảnh Thú Hồn
    readonly reqLinhThach?: BigNumber;  // Linh Thạch tiêu hao
    readonly reqHonNguyen?: BigNumber;  // Hỗn Nguyên Thạch tiêu hao
    readonly reqPillId?: string;        // Đan dược bồi bổ cần thiết
}

export interface PetSkillDefinition {
    readonly id: string;
    readonly name: string;
    readonly icon: string;
    readonly cooldown: number;          // Giây hồi chiêu (0 nếu là phản đòn tức thì)
    readonly description: string;
    readonly upgradeCosts: readonly PetSkillLevelUpgradeCost[];
}

/**
 * Dữ Liệu Tĩnh Của 1 Loài Thần Thú
 */
export interface PetDefinition {
    readonly id: PetId;
    readonly name: string;
    readonly aliasName?: string;
    readonly role: PetRole;
    readonly roleName: string;
    readonly icon: string;
    readonly element: string;
    readonly themeColor: string;
    readonly lore: string;
    readonly baseStats: PetCombatStats;
    readonly passive: PetPassiveDefinition;
    readonly skill: PetSkillDefinition;
}

/**
 * Dữ Liệu Nuôi Dưỡng Lưu Trữ Của Người Chơi Cho 1 Thần Thú
 */
export interface PetUserData {
    readonly id: PetId;
    isUnlocked: boolean;
    realmIndex: number;      // 0 -> 11
    tuVi: BigNumber;         // Tu vi tích lũy hiện tại
    skillLevel: number;      // 1 -> 12
}
