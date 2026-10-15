export type ItemSlotType = "non" | "giap" | "vukhi" | "dan_duoc" | "item";

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
    stats?: ItemStats;
    tuViGain?: number;
    tinhNguyenGain?: number;
    isResetPill?: boolean;
    isRenameScroll?: boolean;
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
    {
        id: "hat_thanh_01",
        name: "Ngọc Hư Hỗn Thiên Quán",
        slot: "non",
        rarity: "thanh",
        reqRealm: 7,
        stats: { mau: 250000, phongThu: 12000, khangPhep: 9500 },
        price: 5000000,
        sellPrice: 2000000,
        icon: "👑",
        desc: "Thần quán của thượng cổ tiên thần, hộ thể vạn kiếp bất diệt."
    },
    {
        id: "hat_cuc_dao_01",
        name: "Hồng Mông Khởi Nguyên Thần Quán",
        slot: "non",
        rarity: "cuc_dao",
        reqRealm: 10,
        stats: { mau: 5000000, phongThu: 150000, khangPhep: 120000 },
        price: 100000000,
        sellPrice: 40000000,
        icon: "👑",
        desc: "Cực Đạo Thần Quán đan dệt từ khí hỗn nguyên sơ khai, che chở linh hồn vô thượng."
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
    {
        id: "armor_thanh_01",
        name: "Bát Hoang Chiến Thần Khôi Giáp",
        slot: "giap",
        rarity: "thanh",
        reqRealm: 7,
        stats: { mau: 350000, phongThu: 18000, khangPhep: 14000 },
        price: 6500000,
        sellPrice: 2800000,
        icon: "🛡️",
        desc: "Thánh giáp rèn từ thiên thạch ngoài cửu tiêu, ngưng tụ chiến ý bất diệt."
    },
    {
        id: "armor_cuc_dao_01",
        name: "Thái Sơ Hỗn Độn Thánh Giáp",
        slot: "giap",
        rarity: "cuc_dao",
        reqRealm: 10,
        stats: { mau: 8000000, phongThu: 220000, khangPhep: 180000 },
        price: 120000000,
        sellPrice: 50000000,
        icon: "🛡️",
        desc: "Cực Đạo Thánh Giáp bất hoại, vạn pháp bất xâm, miễn nhiễm toàn bộ sát thương phàm trần."
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
    },
    {
        id: "weapon_thanh_01",
        name: "Cửu Tiêu Long Ngâm Kiếm",
        slot: "vukhi",
        rarity: "thanh",
        reqRealm: 7,
        stats: { vatLi: 85000, phep: 65000, baoKich: 25 },
        price: 8000000,
        sellPrice: 3500000,
        icon: "⚔️",
        desc: "Thần kiếm đúc bằng long tủy, mỗi kiếm vung ra phát ra tiếng rồng gầm thấu trời."
    },
    {
        id: "weapon_cuc_dao_01",
        name: "Trảm Thiên Bạt Kiếm Thần Binh",
        slot: "vukhi",
        rarity: "cuc_dao",
        reqRealm: 10,
        stats: { vatLi: 1800000, phep: 1500000, baoKich: 35 },
        price: 150000000,
        sellPrice: 65000000,
        icon: "⚔️",
        desc: "Cực Đạo Thần Kiếm trảm phá quy tắc thiên địa, một kiếm khai thiên tịch địa."
    },

    // --- ĐAN DƯỢC & VẬT PHẨM (dan_duoc / item) ---
    {
        id: "pill_tu_khi_tieu",
        name: "Tiểu Tụ Khí Đan",
        slot: "dan_duoc",
        rarity: "pham",
        reqRealm: 0,
        tuViGain: 100,
        price: 50,
        sellPrice: 15,
        icon: "💊",
        desc: "Uống vào lập tức tăng 100 điểm Tu Vi cho đạo hữu."
    },
    {
        id: "pill_tu_khi_trung",
        name: "Trung Tụ Khí Đan",
        slot: "dan_duoc",
        rarity: "linh",
        reqRealm: 0,
        tuViGain: 500,
        price: 220,
        sellPrice: 70,
        icon: "💊",
        desc: "Uống vào lập tức tăng 500 điểm Tu Vi."
    },
    {
        id: "pill_tu_khi_dai",
        name: "Đại Tụ Khí Đan",
        slot: "dan_duoc",
        rarity: "huyen",
        reqRealm: 1,
        tuViGain: 2500,
        price: 1000,
        sellPrice: 350,
        icon: "✨",
        desc: "Đan dược thượng phẩm ngưng tụ linh khí nồng đặc, tăng 2,500 Tu Vi."
    },
    {
        id: "pill_ngoc_linh",
        name: "Ngọc Linh Đan",
        slot: "dan_duoc",
        rarity: "dia",
        reqRealm: 4,
        tuViGain: 15000,
        price: 2500,
        sellPrice: 1500,
        icon: "✨",
        desc: "Đan dược tiên phẩm ngưng tụ linh khí tinh khiết, tăng 15,000 Tu Vi."
    },
    {
        id: "pill_tien_linh",
        name: "Tiên Linh Đan",
        slot: "dan_duoc",
        rarity: "thien",
        reqRealm: 4,
        tuViGain: 25000,
        price: 8000,
        sellPrice: 3500,
        icon: "🌟",
        desc: "Đan dược tiên phẩm ngưng tụ tiên khí sơ khai, tăng 25,000 Tu Vi."
    },
    {
        id: "pill_tay_tuy",
        name: "Tẩy Tủy Đan",
        slot: "dan_duoc",
        rarity: "huyen",
        reqRealm: 0,
        isResetPill: true,
        price: 5000,
        sellPrice: 1500,
        icon: "🧪",
        desc: "Thanh tẩy kinh mạch, hoàn trả 100% điểm tiềm năng đã cộng."
    },
    {
        id: "item_rename_scroll",
        name: "Cuộn Giấy Đổi Tên",
        slot: "dan_duoc",
        rarity: "linh",
        reqRealm: 0,
        isRenameScroll: true,
        price: 1000,
        sellPrice: 300,
        icon: "📜",
        desc: "Pháp bảo cho phép đạo hữu đặt lại đạo hiệu danh xưng của nhân vật."
    },
    {
        id: "ticket_tam_dao",
        name: "Vé Tầm Đạo",
        slot: "item",
        rarity: "thanh",
        reqRealm: 0,
        price: 10000,
        sellPrice: 2000,
        icon: "🎫",
        desc: "Vé quay tầm đạo tại Đài Cầu Đạo để lĩnh ngộ Đại Thần Thông và thuần phục Thần Thú."
    },
    {
        id: "item_tower_ticket",
        name: "Lệnh Bài Hư Không",
        slot: "item",
        rarity: "dia",
        reqRealm: 0,
        price: 5000,
        sellPrice: 1000,
        icon: "🗼",
        desc: "Lệnh bài vào khiêu chiến các tầng sâu trong Hư Không Tháp."
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
