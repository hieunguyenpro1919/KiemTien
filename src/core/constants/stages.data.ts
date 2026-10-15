import { BigNumber, toBigNumber } from "../types/bignum";

export interface StageMonster {
    name: string;
    title: string;
    avatar: string;
    hp: BigNumber;
    attack: BigNumber;
    defense: BigNumber;
    attackSpeed: number;
    isBoss?: boolean;
    damageCapPct?: number;  // Giới hạn sát thương Kim Thân (mặc định 0.10 - 0.20)
    breakCapPct?: number;   // Giới hạn khi bị Phá Kim Thân (mặc định 0.30 - 0.40)
}

export interface StageReward {
    tuVi: BigNumber;
    linhThach: BigNumber;
    honNguyen?: BigNumber;
    tinhNguyen?: BigNumber;
    dropChance: number;
    possibleDrops: string[];
}

export interface StageDefinition {
    id: string;
    number: number;
    name: string;
    area: string;
    difficulty: string;
    diffColor: string;
    reqRealm: number;
    reqTier: number;
    desc: string;
    monster: StageMonster;
    rewards: StageReward;
}

export const STAGE_DATABASE: readonly StageDefinition[] = [
    {
        id: "stage_01",
        number: 1,
        name: "Ải 1: Thảo Dược Viên Ngoại Vi",
        area: "Thanh Vân Ngoại Vi",
        difficulty: "Dễ",
        diffColor: "#4caf50",
        reqRealm: 0,
        reqTier: 0,
        desc: "Khu vườn thảo dược ven rừng thường có yêu thỏ và dã kê quấy nhiễu.",
        monster: {
            name: "Linh Thảo Thỏ Yêu",
            title: "Tiểu Yêu Sơ Sinh",
            avatar: "🐇",
            hp: toBigNumber(220),
            attack: toBigNumber(16),
            defense: toBigNumber(5),
            attackSpeed: 2.2
        },
        rewards: {
            tuVi: toBigNumber(120),
            linhThach: toBigNumber(50),
            dropChance: 0.5,
            possibleDrops: ["hat_01", "armor_01", "pill_tu_khi_tieu"]
        }
    },
    {
        id: "stage_02",
        number: 2,
        name: "Ải 2: Bích Lạc Khê Cốc",
        area: "Thanh Vân Ngoại Vi",
        difficulty: "Bình Thường",
        diffColor: "#29b6f6",
        reqRealm: 0,
        reqTier: 2,
        desc: "Bên dòng suối trong vắt, linh khí tụ lại thu hút bầy Hắc Thủy Xà hung hãn.",
        monster: {
            name: "Hắc Thủy Xà",
            title: "Độc Xà Ngàn Năm",
            avatar: "🐍",
            hp: toBigNumber(550),
            attack: toBigNumber(38),
            defense: toBigNumber(12),
            attackSpeed: 2.0
        },
        rewards: {
            tuVi: toBigNumber(300),
            linhThach: toBigNumber(120),
            dropChance: 0.55,
            possibleDrops: ["weapon_01", "hat_02", "pill_tu_khi_tieu"]
        }
    },
    {
        id: "stage_03",
        number: 3,
        name: "Ải 3: Hắc Sa Động Phủ",
        area: "Thanh Vân Ngoại Vi",
        difficulty: "Khó",
        diffColor: "#ab47bc",
        reqRealm: 0,
        reqTier: 5,
        desc: "Hang động tối tăm sực mùi tanh nồng, nơi sào huyệt Ma Hùng khổng lồ cư ngụ.",
        monster: {
            name: "Cuồng Bạo Ma Hùng",
            title: "Thủ Lĩnh Động Quỷ",
            avatar: "🐻",
            hp: toBigNumber(1400),
            attack: toBigNumber(85),
            defense: toBigNumber(25),
            attackSpeed: 2.4,
            isBoss: true,
            damageCapPct: 0.25,
            breakCapPct: 0.40
        },
        rewards: {
            tuVi: toBigNumber(800),
            linhThach: toBigNumber(300),
            dropChance: 0.65,
            possibleDrops: ["armor_02", "weapon_02", "pill_tu_khi_trung"]
        }
    },
    {
        id: "stage_04",
        number: 4,
        name: "Ải 4: Phong Lôi Lãm Nhai",
        area: "Thanh Vân Ngoại Vi",
        difficulty: "Hung Hiểm",
        diffColor: "#ff7043",
        reqRealm: 0,
        reqTier: 9,
        desc: "Vách núi chót vót gió lốc gầm rú, Thiết Vũ Điêu sải cánh rình mồi.",
        monster: {
            name: "Thiết Vũ Điêu Vương",
            title: "Bá Chủ Bầu Trời",
            avatar: "🦅",
            hp: toBigNumber(3200),
            attack: toBigNumber(180),
            defense: toBigNumber(45),
            attackSpeed: 1.8,
            isBoss: true,
            damageCapPct: 0.25,
            breakCapPct: 0.40
        },
        rewards: {
            tuVi: toBigNumber(2000),
            linhThach: toBigNumber(750),
            dropChance: 0.70,
            possibleDrops: ["weapon_03", "hat_03", "pill_tu_khi_dai"]
        }
    },
    {
        id: "stage_05",
        number: 5,
        name: "Ải 5: U Minh Trúc Lâm",
        area: "U Minh Cốc",
        difficulty: "Nguy Hiểm",
        diffColor: "#e91e63",
        reqRealm: 1,
        reqTier: 0,
        desc: "Rừng trúc u ám chướng khí ngập tràn, sào huyệt U Minh Lang Vương.",
        monster: {
            name: "U Minh Lang Vương",
            title: "Dạ Hành Sát Thủ",
            avatar: "🐺",
            hp: toBigNumber(8500),
            attack: toBigNumber(400),
            defense: toBigNumber(100),
            attackSpeed: 1.6,
            isBoss: true,
            damageCapPct: 0.20,
            breakCapPct: 0.35
        },
        rewards: {
            tuVi: toBigNumber(5000),
            linhThach: toBigNumber(2000),
            dropChance: 0.75,
            possibleDrops: ["armor_03", "weapon_04"]
        }
    },
    {
        id: "stage_15",
        number: 15,
        name: "Ải 15: Bạch Ngọc Tiên Cung",
        area: "Cửu Tiêu Ngọc Điện",
        difficulty: "Chí Tôn",
        diffColor: "#f1c40f",
        reqRealm: 7,
        reqTier: 9,
        desc: "Tiên cung sừng sững trên mây, Ngọc Hư Chiến Thần sở hữu Kim Thân Hộ Thể vạn kiếp bất diệt.",
        monster: {
            name: "Ngọc Hư Chiến Thần",
            title: "Hộ Cung Thần Tướng",
            avatar: "👑",
            hp: toBigNumber(600000000),
            attack: toBigNumber(5000000),
            defense: toBigNumber(1500000),
            attackSpeed: 1.5,
            isBoss: true,
            damageCapPct: 0.10, // Kim Thân chuẩn: trần 10% HP
            breakCapPct: 0.35   // Phá Kim Thân: trần 35% HP
        },
        rewards: {
            tuVi: toBigNumber(75000000),
            linhThach: toBigNumber(30000000),
            dropChance: 0.90,
            possibleDrops: ["weapon_thanh_01", "armor_thanh_01"]
        }
    },
    {
        id: "stage_17",
        number: 17,
        name: "Ải 17: Vấn Đạo",
        area: "Thiên Ngoại Hư Không",
        difficulty: "Tuyệt Vọng",
        diffColor: "#e74c3c",
        reqRealm: 8,
        reqTier: 9,
        desc: "Hóa thân vấn đạo chặn đứng đường lên Vô Thượng Lộ. Bắt buộc trảm sát để đột phá Cảnh Giới 10.",
        monster: {
            name: "Hóa Thân Vấn Đạo",
            title: "Thiên Đạo Chấp Pháp",
            avatar: "👤",
            hp: toBigNumber(100000000000),
            attack: toBigNumber(500000000),
            defense: toBigNumber(100000000),
            attackSpeed: 1.4,
            isBoss: true,
            damageCapPct: 0.10,
            breakCapPct: 0.35
        },
        rewards: {
            tuVi: toBigNumber(100000000),
            linhThach: toBigNumber(1000000000),
            dropChance: 1.0,
            possibleDrops: ["weapon_thanh_02"]
        }
    },
    {
        id: "stage_18",
        number: 18,
        name: "Ải 18: Tinh Hà Thần Điện",
        area: "Vô Thượng Tinh Vực",
        difficulty: "Vũ Trụ",
        diffColor: "#ff007f",
        reqRealm: 9,
        reqTier: 99,
        desc: "Tinh Hà Thần Long gối đầu trên ngân hà. Bắt buộc vượt qua để thăng hoa Vạn Vì Tinh Tú.",
        monster: {
            name: "Tinh Hà Thần Long",
            title: "Trấn Thủ Tinh Vực",
            avatar: "🐲",
            hp: toBigNumber(500000000000),
            attack: toBigNumber(2500000000),
            defense: toBigNumber(500000000),
            attackSpeed: 1.3,
            isBoss: true,
            damageCapPct: 0.15,
            breakCapPct: 0.35
        },
        rewards: {
            tuVi: toBigNumber(500000000),
            linhThach: toBigNumber(5000000000),
            dropChance: 1.0,
            possibleDrops: ["pill_tinh_tu"]
        }
    },
    {
        id: "stage_19",
        number: 19,
        name: "Ải 19: Đại Đạo Thần Cung",
        area: "Chí Cao Vĩnh Hằng",
        difficulty: "Khởi Nguyên",
        diffColor: "#ffd700",
        reqRealm: 10,
        reqTier: 99,
        desc: "Hư Vô Thần Đế chấp chưởng trật tự vũ trụ. Trảm sát mở đường thăng lên Đại Đạo Chí Cao Vô Thượng.",
        monster: {
            name: "Hư Vô Thần Đế",
            title: "Đại Đạo Chúa Tể",
            avatar: "☀️",
            hp: toBigNumber("2500000000000"),
            attack: toBigNumber("12000000000"),
            defense: toBigNumber("2000000000"),
            attackSpeed: 1.2,
            isBoss: true,
            damageCapPct: 0.15,
            breakCapPct: 0.35
        },
        rewards: {
            tuVi: toBigNumber("2000000000"),
            linhThach: toBigNumber("25000000000"),
            dropChance: 1.0,
            possibleDrops: ["pill_khoi_nguyen_thanh_dan"]
        }
    },
    {
        id: "stage_vo_cuc",
        number: 22,
        name: "Ải 22: Hư Vô Bản Nguyên Cảnh",
        area: "Hư Vô Thần Vực",
        difficulty: "Vô Cực",
        diffColor: "#00f2fe",
        reqRealm: 11,
        reqTier: 99,
        desc: "Cực hạn bản nguyên của vũ trụ nơi mọi quy tắc tan biến. Đánh bại Hư Vô Bản Nguyên mở Cảnh Giới Vô Cực.",
        monster: {
            name: "Hư Vô Bản Nguyên",
            title: "Chí Tôn Hư Vô Tối Thượng",
            avatar: "🌌",
            hp: toBigNumber("200000000000000"),
            attack: toBigNumber("3500000000"),
            defense: toBigNumber("80000000"),
            attackSpeed: 1.2,
            isBoss: true,
            damageCapPct: 0.20,
            breakCapPct: 0.30
        },
        rewards: {
            tuVi: toBigNumber("1000000000000"),
            linhThach: toBigNumber(0),
            honNguyen: toBigNumber(50000),
            tinhNguyen: toBigNumber(100),
            dropChance: 1.0,
            possibleDrops: ["pill_bat_hu_luan_hoi"]
        }
    },
    {
        id: "stage_23",
        number: 23,
        name: "Ải 23: Vấn Thiên Địa",
        area: "Thiên Đạo Luân Hồi Giới",
        difficulty: "Vấn Đạo",
        diffColor: "#ff007f",
        reqRealm: 11,
        reqTier: 99,
        desc: "Ải khảo nghiệm tối thượng kiểm chứng đạo tâm mỗi 100 tầng của Cảnh Giới Vô Cực. Boss scale chỉ số động theo người chơi.",
        monster: {
            name: "Thiên Đạo Hóa Thân (Vấn Thiên Địa)",
            title: "Ý Chí Thiên Địa Tối Cao",
            avatar: "⚡",
            hp: toBigNumber("500000000000000"),
            attack: toBigNumber("5000000000"),
            defense: toBigNumber("100000000"),
            attackSpeed: 1.3,
            isBoss: true,
            damageCapPct: 0.20,
            breakCapPct: 0.30
        },
        rewards: {
            tuVi: toBigNumber(0),
            tinhNguyen: toBigNumber(100),
            linhThach: toBigNumber(1000000000),
            honNguyen: toBigNumber(100000),
            dropChance: 1.0,
            possibleDrops: ["pill_chung_dao_tinh_nguyen"]
        }
    }
];

export class StageSystem {
    static getAllStages(): readonly StageDefinition[] {
        return STAGE_DATABASE;
    }

    static getStageById(id: string): StageDefinition | null {
        return STAGE_DATABASE.find(s => s.id === id) || null;
    }

    /**
     * Mở khóa Hư Không Tháp: Vượt qua Ải 3 trở lên
     */
    static isTowerUnlocked(clearedStageIds: readonly string[]): boolean {
        return clearedStageIds.includes("stage_03") || clearedStageIds.length >= 3;
    }

    /**
     * Kiểm tra điều kiện mở khóa ải
     */
    static isStageUnlocked(playerRealm: number, playerTier: number, stage: StageDefinition, isVoCuc = false): boolean {
        if (stage.id === "stage_23") {
            return isVoCuc;
        }
        if (playerRealm > stage.reqRealm) return true;
        if (playerRealm === stage.reqRealm && playerTier >= stage.reqTier) return true;
        return false;
    }
}
