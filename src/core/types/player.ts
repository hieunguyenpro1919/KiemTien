import { BigNumber } from "./bignum";
import { RealmId } from "./realm";

/**
 * 3 Thuộc Tính Tiềm Năng Chuẩn Mực Của Bản V3
 * - statVatLi: Công Vật Lí (+5 phẳng & +0.35% tổng công VL, mỗi 20đ +1% Bạo Kích)
 * - statPhep:  Công Phép (+5 phẳng & +0.35% tổng công Phép, mỗi 20đ +1 Kháng Phép)
 * - statMau:   Sinh Lực / Máu (+30 phẳng & +0.4% tổng HP, mỗi 10đ +1 Thủ & +1 Kháng Phép)
 */
export interface PlayerPotentialAttributes {
    statVatLi: number; // Công Vật Lí
    statPhep: number;  // Công Phép
    statMau: number;   // Sinh Lực (Máu)
}

/**
 * 6 Chỉ Số Chiến Đấu Sau Khi Tính Toán Chuẩn Bản V3 (Total Combat Stats)
 */
export interface PlayerCombatStats {
    maxHp: BigNumber;           // Máu tối đa (Sinh Lực)
    vatLi: BigNumber;           // Sát thương Vật Lí tổng
    phep: BigNumber;            // Sát thương Phép tổng
    phongThu: BigNumber;        // Phòng thủ Vật Lý
    khangPhep: BigNumber;       // Kháng Phép
    baoKich: number;            // Tỉ lệ Bạo Kích (%) (5% -> 75%)

    // Thống kê chi tiết hỗ trợ Tooltip và UI
    hpMultiplier: number;
    vatLiMultiplier: number;
    phepMultiplier: number;
    allocatedHp: BigNumber;
    allocatedVatLi: BigNumber;
    allocatedPhep: BigNumber;
    bonusHpPct: string;
    bonusVatLiPct: string;
    bonusPhepPct: string;
    bonusDefFromMau: number;
    bonusResFromPhep: number;
    bonusCritFromVatLi: number;
}

/**
 * Các Loại Tiền Tệ & Tài Nguyên Trực Thuộc
 */
export interface PlayerCurrencies {
    linhThach: BigNumber;       // 💎 Linh Thạch
    honNguyenThach: BigNumber;  // 🌀 Hỗn Nguyên Thạch
    tinhNguyen: BigNumber;      // 🌌 Tinh Nguyên Đại Đạo (ở Cảnh Giới Vô Cực)
    veTamDao: number;           // 🔮 Vé quay Đài Cầu Đạo
    manhCoDuyen: number;        // 🧩 Mảnh Cơ Duyên (10 mảnh = 1 vé)
    lenhBaiHuKhong: number;     // 🎫 Lệnh Bài Quét Hư Không Tháp
    manhThuHon: number;         // 🐾 Mảnh Thú Hồn bồi dưỡng Pet
}

/**
 * Phẩm Cấp Trang Bị & Vật Phẩm (7 Bậc Phẩm Chất)
 */
export type ItemRarity =
    | "pham"    // Phàm Cấp (Xám / Trắng)
    | "linh"    // Linh Cấp (Xanh Lá)
    | "huyen"   // Huyền Cấp (Xanh Lam)
    | "dia"     // Địa Cấp (Tím)
    | "thien"   // Thiên Cấp (Cam Vàng)
    | "thanh"   // Thánh Cấp (Đỏ Rực)
    | "than";   // Thần Cấp (Cầu Vồng Neon)

/**
 * Vị Trí Ô Trang Bị Trên Người Nhân Vật
 */
export type EquipSlot = "weapon" | "armor" | "helmet";

export interface EquipmentItem {
    readonly id: string;
    readonly name: string;
    readonly slot: EquipSlot;
    readonly rarity: ItemRarity;
    readonly icon: string;
    readonly attackBonus?: BigNumber;
    readonly defenseBonus?: BigNumber;
    readonly hpBonus?: BigNumber;
    readonly critBonus?: number;
    readonly desc: string;
}

/**
 * Ngăn Chứa Trang Bị Đang Mặc
 */
export type EquippedSlots = {
    [key in EquipSlot]: EquipmentItem | null;
};

/**
 * Trạng Thái Toàn Diện Của Người Chơi (Player Model)
 */
export interface PlayerState {
    id: string;
    name: string;
    avatar: string;
    createdAt: number;
    lastSaved: number;

    // Tiến trình Cảnh Giới
    realmId: RealmId;
    realmIndex: number;          // 0 -> 11
    tierIndex: number;           // 0 -> 9 (hoặc vô hạn ở cảnh giới cao)
    tuVi: BigNumber;             // Tu vi hiện tại trong tầng
    isVoCuc: boolean;            // Đã phá vỡ bình cảnh Ải 22 mở Vô Cực chưa
    vanThienDiaClears: number;   // Số lần đã trảm Boss Ải 23

    // Điểm Tiềm Năng & Thuộc Tính
    statPoints: number;          // Điểm khả dụng chưa cộng
    attributes: PlayerPotentialAttributes;

    // Tài Nguyên Tiền Tệ
    currencies: PlayerCurrencies;

    // Trang Bị & Túi Đồ
    equipped: EquippedSlots;
    inventory: string[];         // Danh sách ID vật phẩm trong túi

    // Kỹ Năng & Đại Thần Thông
    equippedSkillIds: [string | null, string | null, string | null]; // Tối đa 3 chiêu
    equippedUltimateId: string | null;                              // 1 Đại Thần Thông
    unlockedSkillIds: string[];
    unlockedUltimateIds: string[];

    // Thần Thú Đồng Hành
    activePetId: string | null;

    // Tiến Trình PVE & Tháp
    clearedStageIds: string[];
    highestTowerFloor: number;

    // Danh Hiệu & Thành Tựu
    activeTitleId: string | null;
    unlockedTitleIds: string[];
}
