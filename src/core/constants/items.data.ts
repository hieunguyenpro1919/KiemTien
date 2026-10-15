export type ItemSlotType = "non" | "giap" | "vukhi";

export type ItemRarityType =
    | "pham"
    | "linh"
    | "huyen"
    | "dia"
    | "thien"
    | "tien"
    | "thanh"
    | "cuc_dao";

export interface ItemStats {
    mau?: number;
    vatLi?: number;
    phep?: number;
    phongThu?: number;
    khangPhep?: number;
    baoKich?: number;
}

export interface ItemDefinition {
    id: string;
    name: string;
    slot: ItemSlotType;
    rarity: ItemRarityType;
    reqRealm: number;
    stats: ItemStats;
    price: number;
    sellPrice: number;
    icon: string;
    desc: string;
}

export const RARITY_INFO: Record<ItemRarityType, { name: string; color: string; border: string; bg: string }> = {
    pham:    { name: "Phàm Phẩm", color: "#b0bec5", border: "#78909c", bg: "rgba(176, 190, 197, 0.12)" },
    linh:    { name: "Linh Phẩm", color: "#4fc3f7", border: "#0288d1", bg: "rgba(79, 195, 247, 0.12)" },
    huyen:   { name: "Huyền Phẩm", color: "#ba68c8", border: "#7b1fa2", bg: "rgba(186, 104, 200, 0.12)" },
    dia:     { name: "Địa Phẩm", color: "#ffb74d", border: "#f57c00", bg: "rgba(255, 183, 77, 0.12)" },
    thien:   { name: "Thiên Phẩm", color: "#ff5252", border: "#d32f2f", bg: "rgba(255, 82, 82, 0.15)" },
    tien:    { name: "Tiên Phẩm", color: "#00e676", border: "#00c853", bg: "rgba(0, 230, 118, 0.15)" },
    thanh:   { name: "Thánh Phẩm", color: "#ffd700", border: "#ffc107", bg: "rgba(255, 215, 0, 0.15)" },
    cuc_dao: { name: "Cực Đạo", color: "#ff2a85", border: "#ff2a85", bg: "rgba(255, 42, 133, 0.2)" }
};

export const ITEM_DATABASE: readonly ItemDefinition[] = [
    // --- NÓN / MŨ (non) ---
    {
        id: "hat_01",
        name: "Trúc Mạo Bình Thường",
        slot: "non",
        rarity: "pham",
        reqRealm: 0,
        stats: { mau: 100, phongThu: 10 },
        price: 100,
        sellPrice: 50,
        icon: "👒",
        desc: "Mũ đan bằng trúc thường, che nắng che mưa cho phàm nhân bước đầu tu đạo."
    },
    {
        id: "hat_02",
        name: "Thanh Trúc Linh Quán",
        slot: "non",
        rarity: "linh",
        reqRealm: 0,
        stats: { mau: 250, phongThu: 25, khangPhep: 10 },
        price: 400,
        sellPrice: 200,
        icon: "🎩",
        desc: "Quấn từ ngọn trúc hấp thu linh khí, tâm thần thanh tịnh, tăng sinh mệnh."
    },
    {
        id: "hat_03",
        name: "Ngưng Khí Đạo Mạo",
        slot: "non",
        rarity: "linh",
        reqRealm: 1,
        stats: { mau: 650, phongThu: 40, khangPhep: 20 },
        price: 1500,
        sellPrice: 800,
        icon: "🧢",
        desc: "Mũ đạo sĩ ngưng kết linh phong, giảm thiểu tà ma xâm lấn."
    },
    {
        id: "hat_04",
        name: "Bích Hải Ngọc Quán",
        slot: "non",
        rarity: "huyen",
        reqRealm: 2,
        stats: { mau: 1800, phongThu: 100, khangPhep: 80 },
        price: 2800,
        sellPrice: 1200,
        icon: "👑",
        desc: "Điêu khắc từ ngọc biển sâu vạn trượng, linh lực bao trùm thức hải."
    },

    // --- ÁO GIÁP (giap) ---
    {
        id: "armor_01",
        name: "Thô Bố Y",
        slot: "giap",
        rarity: "pham",
        reqRealm: 0,
        stats: { mau: 120, phongThu: 15 },
        price: 120,
        sellPrice: 60,
        icon: "🥋",
        desc: "Áo vải thô may vá đơn sơ, chống đỡ tổn thương nhẹ."
    },
    {
        id: "armor_02",
        name: "Huyền Thiết Giáp",
        slot: "giap",
        rarity: "linh",
        reqRealm: 0,
        stats: { mau: 350, phongThu: 45, khangPhep: 15 },
        price: 500,
        sellPrice: 250,
        icon: "🛡️",
        desc: "Rèn từ quặng sắt ngàn năm dưới đáy vực, kiên cố dị thường."
    },
    {
        id: "armor_03",
        name: "Ngưng Khí Đạo Bào",
        slot: "giap",
        rarity: "huyen",
        reqRealm: 1,
        stats: { mau: 1000, phongThu: 80, khangPhep: 50 },
        price: 1800,
        sellPrice: 900,
        icon: "🥻",
        desc: "Đạo bào thêu phù văn ngưng khí, hóa giải kình lực của ngoại ma."
    },

    // --- VŨ KHÍ (vukhi) ---
    {
        id: "weapon_01",
        name: "Gỗ Mục Đoản Kiếm",
        slot: "vukhi",
        rarity: "pham",
        reqRealm: 0,
        stats: { vatLi: 15, phep: 5, baoKich: 2 },
        price: 150,
        sellPrice: 75,
        icon: "🗡️",
        desc: "Kiếm gỗ gọt đẽo từ thân cây sồi mục, sơ khai nhập môn tu tiên."
    },
    {
        id: "weapon_02",
        name: "Thanh Phong Kiếm",
        slot: "vukhi",
        rarity: "linh",
        reqRealm: 0,
        stats: { vatLi: 40, phep: 20, baoKich: 5 },
        price: 600,
        sellPrice: 300,
        icon: "⚔️",
        desc: "Kiếm thép tôi qua gió lạnh đỉnh núi, chém sắt như chém bùn."
    },
    {
        id: "weapon_03",
        name: "Tử Điện Kiếm",
        slot: "vukhi",
        rarity: "huyen",
        reqRealm: 1,
        stats: { vatLi: 120, phep: 80, baoKich: 8 },
        price: 2200,
        sellPrice: 1100,
        icon: "⚡",
        desc: "Lưỡi kiếm ẩn chứa một tia lôi đình tử điện, công phá cương khí đối thủ."
    }
];

export class ItemSystem {
    static getItemById(id: string | null | undefined): ItemDefinition | null {
        if (!id) return null;
        return ITEM_DATABASE.find(item => item.id === id) || null;
    }

    static getRarityInfo(rarity: ItemRarityType) {
        return RARITY_INFO[rarity] || RARITY_INFO.pham;
    }
}
