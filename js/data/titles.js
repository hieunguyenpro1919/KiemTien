/**
 * HỆ THỐNG DANH HIỆU THẦN THÔNG (TITLES SYSTEM)
 * Danh hiệu mở khóa từ:
 * 1. Trảm Sát Các Đại Boss Vực Thẩm (Khu Vực & Ải)
 * 2. Lĩnh Ngộ Bí Tịch (Mở khóa 5 kỹ năng, Mở khóa FULL kỹ năng Tàng Kinh Các)
 * 3. Thành tựu đặc biệt (Sơ nhập đạo môn, Bất hủ tu sĩ)
 *
 * Mỗi danh hiệu mang lại chỉ số BUFF vĩnh viễn khi trang bị:
 * - Máu tối đa (HP)
 * - Sát thương Vật Lí
 * - Sát thương Phép
 * - Phòng Thủ
 * - Kháng Phép
 * - Tỉ lệ Bạo Kích (%)
 */

const TITLE_DATABASE = [
    {
        id: "title_so_nhap",
        name: "Sơ Nhập Đạo Môn",
        icon: "🌱",
        rarity: "pham",
        desc: "Bước chân đầu tiên đạp lên con đường nghịch thiên tu tiên, tâm cảnh bình lặng như nước.",
        conditionDesc: "Bắt đầu cuộc hành trình tu đạo.",
        category: "special",
        buffs: {
            mau: 80,
            vatLi: 10,
            phep: 10
        },
        checkUnlocked: () => true
    },
    {
        id: "title_tram_hung",
        name: "Trảm Hùng Dũng Sĩ",
        icon: "🐻",
        rarity: "linh",
        desc: "Uy danh chấn động Hắc Sa Động Phủ, một quyền đánh bại Cuồng Bạo Ma Hùng.",
        conditionDesc: "Trảm sát Cuồng Bạo Ma Hùng (Vượt Ải 3)",
        category: "boss",
        buffs: {
            vatLi: 35,
            mau: 300,
            phongThu: 15
        },
        checkUnlocked: (p) => p.clearedStages && p.clearedStages.includes("stage_03")
    },
    {
        id: "title_phong_loi",
        name: "Phong Lôi Kiếm Khách",
        icon: "🦅",
        rarity: "huyen",
        desc: "Đao kiếm mang theo lôi đình vạn trượng, đạp vỡ vách núi chém rụng Thiết Vũ Điêu Vương.",
        conditionDesc: "Trảm sát Thiết Vũ Điêu Vương (Vượt Ải 4)",
        category: "boss",
        buffs: {
            vatLi: 75,
            phep: 45,
            baoKich: 3
        },
        checkUnlocked: (p) => p.clearedStages && p.clearedStages.includes("stage_04")
    },
    {
        id: "title_liet_diem",
        name: "Liệt Diễm Chân Nhân",
        icon: "🔥",
        rarity: "huyen",
        desc: "Dẫm nát biển lửa dung nham, thâu tóm chân hỏa của Xích Diễm Ma Viên canh giữ linh quả.",
        conditionDesc: "Trảm sát Xích Diễm Ma Viên (Vượt Ải 6)",
        category: "boss",
        buffs: {
            phep: 130,
            khangPhep: 40,
            mau: 600
        },
        checkUnlocked: (p) => p.clearedStages && p.clearedStages.includes("stage_06")
    },
    {
        id: "title_do_mang",
        name: "Đồ Mãng Chân Quân",
        icon: "🐉",
        rarity: "dia",
        desc: "Đại sát tứ phương tại Vạn Thú Tế Đàn, trảm sát Huyết Lân Cự Mãng ngàn năm uy chấn bát hoang.",
        conditionDesc: "Trảm sát Huyết Lân Cự Mãng Vương (Vượt Ải 7)",
        category: "boss",
        buffs: {
            mau: 1800,
            vatLi: 160,
            phongThu: 65,
            khangPhep: 65
        },
        checkUnlocked: (p) => p.clearedStages && p.clearedStages.includes("stage_07")
    },
    {
        id: "title_hang_long",
        name: "Hàng Long Tôn Giả",
        icon: "🐲",
        rarity: "dia",
        desc: "Trấn áp Đoạn Long Thủy Phủ, một thân thần thông ép Hắc Thủy Bát Đầu Giao quy phục.",
        conditionDesc: "Trảm sát Hắc Thủy Bát Đầu Giao (Vượt Ải 9)",
        category: "boss",
        buffs: {
            vatLi: 420,
            phep: 420,
            mau: 4500,
            baoKich: 5
        },
        checkUnlocked: (p) => p.clearedStages && p.clearedStages.includes("stage_09")
    },
    {
        id: "title_tram_ma",
        name: "Trảm Ma Thần Tướng",
        icon: "⚔️",
        rarity: "thien",
        desc: "Phá tan Phong Ma Tiên Trận trên Cổ Đảo, trảm diệt tàn hồn Ma Thần thượng cổ chấn nhiếp chư thiên.",
        conditionDesc: "Trảm sát Viễn Cổ Ma Thần Tàn Hồn (Vượt Ải 11)",
        category: "boss",
        buffs: {
            vatLi: 1300,
            phep: 1300,
            mau: 15000,
            phongThu: 350,
            khangPhep: 350,
            baoKich: 8
        },
        checkUnlocked: (p) => p.clearedStages && p.clearedStages.includes("stage_11")
    },
    {
        id: "title_ngoc_hu",
        name: "Ngọc Hư Tiên Quân",
        icon: "🌌",
        rarity: "tien",
        desc: "Chân đạp Bạch Ngọc Tiên Cung, trảm Ngọc Hư Thần Tướng, chư thiên tôn xưng Tiên Quân.",
        conditionDesc: "Trảm sát Ngọc Hư Chiến Thần (Vượt Ải 15)",
        category: "boss",
        buffs: {
            vatLi: 50000,
            phep: 50000,
            mau: 1200000,
            phongThu: 25000,
            khangPhep: 25000,
            baoKich: 15
        },
        checkUnlocked: (p) => p.clearedStages && p.clearedStages.includes("stage_15")
    },
    {
        id: "title_chi_ton",
        name: "Hỗn Độn Chí Tôn",
        icon: "👑",
        rarity: "thanh",
        desc: "Đăng cơ Đỉnh Cấp Ngai Vàng, đè bẹp Hỗn Độn Chúa Tể, vạn giới độc tôn, thần ma bái phục.",
        conditionDesc: "Đánh bại Hỗn Độn Chúa Tể (Vượt Ải 16)",
        category: "boss",
        buffs: {
            vatLi: 150000,
            phep: 150000,
            mau: 5000000,
            phongThu: 60000,
            khangPhep: 60000,
            baoKich: 20
        },
        checkUnlocked: (p) => p.clearedStages && p.clearedStages.includes("stage_16")
    },
    {
        id: "title_van_dao",
        name: "Vấn Đạo Thần Tôn",
        icon: "🌌",
        rarity: "thanh",
        desc: "Vượt qua cực hạn ải Vấn Đạo giữa Thiên Ngoại Hư Không, đè bẹp Hóa Thân Vấn Đạo, độc bộ thiên hạ, chân chính vấn đỉnh đại đạo!",
        conditionDesc: "Vượt Ải 17 (Vấn Đạo)",
        category: "boss",
        buffs: {
            vatLi: 500000,
            phep: 500000,
            mau: 20000000,
            phongThu: 200000,
            khangPhep: 200000,
            baoKich: 25
        },
        checkUnlocked: (p) => p.clearedStages && p.clearedStages.includes("stage_17")
    },
    {
        id: "title_tinh_ha",
        name: "Tinh Hà Chi Chủ",
        icon: "🪐",
        rarity: "thanh",
        desc: "Trấn áp Tinh Hà Thần Long tại Ải 18, chưởng quản muôn vàn tinh tú, uy chấn khắp cõi Vô Thượng Lộ!",
        conditionDesc: "Trảm sát Tinh Hà Thần Long (Vượt Ải 18)",
        category: "boss",
        buffs: {
            vatLi: 1500000,
            phep: 1500000,
            mau: 80000000,
            phongThu: 600000,
            khangPhep: 600000,
            baoKich: 30
        },
        checkUnlocked: (p) => p.clearedStages && p.clearedStages.includes("stage_18")
    },
    {
        id: "title_dai_dao",
        name: "Đại Đạo Quy Nhất",
        icon: "⚛️",
        rarity: "thanh",
        desc: "Đánh bại Hư Vô Thần Đế tại Đại Đạo Thần Cung, đạt tới cảnh giới Đại Đạo Chí Cao Vô Thượng tối hậu!",
        conditionDesc: "Đánh bại Hư Vô Thần Đế (Vượt Ải 19)",
        category: "boss",
        buffs: {
            vatLi: 5000000,
            phep: 5000000,
            mau: 300000000,
            phongThu: 2000000,
            khangPhep: 2000000,
            baoKich: 40
        },
        checkUnlocked: (p) => p.clearedStages && p.clearedStages.includes("stage_19")
    },

    {
        id: "title_thai_so",
        name: "Thái Sơ Cổ Thần Trảm",
        icon: "🗿",
        rarity: "thanh",
        desc: "Trấn áp Thái Sơ Cổ Thần tại Hỗn Độn Đàm, thấu triệt nguồn gốc cội nguồn của vũ trụ vạn vật.",
        conditionDesc: "Trảm sát Thái Sơ Cổ Thần (Vượt Ải 20)",
        category: "boss",
        buffs: {
            vatLi: 15000000,
            phep: 15000000,
            mau: 1000000000,
            phongThu: 5000000,
            khangPhep: 5000000,
            baoKich: 45
        },
        checkUnlocked: (p) => p.clearedStages && p.clearedStages.includes("stage_20")
    },
    {
        id: "title_bat_hu_dai_dao",
        name: "Vĩnh Hằng Bất Hủ Tôn",
        icon: "👑",
        rarity: "thanh",
        desc: "Vượt qua Tâm Ma Luân Hồi tại Ải 21, chân thân hóa thành cội nguồn của mọi đại đạo chư thiên.",
        conditionDesc: "Đánh bại Chí Cao Tâm Ma (Vượt Ải 21)",
        category: "boss",
        buffs: {
            vatLi: 35000000,
            phep: 35000000,
            mau: 2500000000,
            phongThu: 12000000,
            khangPhep: 12000000,
            baoKich: 50
        },
        checkUnlocked: (p) => p.clearedStages && p.clearedStages.includes("stage_21")
    },


    {
        id: "title_dac_dao",
        name: "Thông Huyền Kiếm Sĩ",
        icon: "✨",
        rarity: "linh",
        desc: "Lĩnh hội ngũ đại bí tịch, kiếm khí tung hoành, sơ bộ chạm tới đạo pháp huyền diệu.",
        conditionDesc: "Lĩnh ngộ từ 5 bí kíp trở lên trong Tàng Kinh Các.",
        category: "skill",
        buffs: {
            vatLi: 70,
            phep: 70,
            baoKich: 3
        },
        checkUnlocked: (p) => p.learnedSkills && p.learnedSkills.length >= 5
    },
    {
        id: "title_van_phap",
        name: "Vạn Pháp Thông Tri",
        icon: "📜",
        rarity: "thien",
        desc: "Lĩnh ngộ thông thấu toàn bộ bí kíp trong thiên hạ, vạn pháp quy nhất, thần thông quảng đại vô song.",
        conditionDesc: "Lĩnh ngộ toàn bộ bí kíp trong Tàng Kinh Các.",
        category: "skill",
        buffs: {
            vatLi: 25000,
            phep: 25000,
            mau: 500000,
            phongThu: 12000,
            khangPhep: 12000,
            baoKich: 10
        },
        checkUnlocked: (p) => {
            if (typeof SkillSystem === "undefined" || !p.learnedSkills) return false;
            const allSkills = SkillSystem.getAllSkills();
            return allSkills.length > 0 && p.learnedSkills.length >= allSkills.length;
        }
    },
    {
        id: "title_bat_hu",
        name: "Bất Hủ Chân Nhân",
        icon: "🧘‍♂️",
        rarity: "dia",
        desc: "Đả tọa ngàn năm, vượt qua luân hồi sinh tử, bước vào hàng ngũ cường giả chân chính.",
        conditionDesc: "Đột phá đạt cảnh giới Tạo Đảo trở lên.",
        category: "special",
        buffs: {
            mau: 3500,
            vatLi: 300,
            phep: 300,
            phongThu: 120,
            khangPhep: 120
        },
        checkUnlocked: (p) => p.realmIndex >= 3
    },
    {
        id: "title_phe_co",
        name: "Phê Cỏ",
        icon: "🌿",
        rarity: "huyen",
        desc: "Cắn đan dược như nhai kẹo, dược lực tràn trề khiến thần trí lâng lâng. Danh hiệu chuyên bế quan cày cấp, cấm mang vào phó bản chiến đấu!",
        conditionDesc: "Tiêu thụ lũy kế từ 10.000 viên đan dược trở lên.",
        category: "special",
        buffs: {
            cultivationBonusPct: 50,
            noCombat: true
        },
        checkUnlocked: (p) => (p.pillsConsumed || 0) >= 10000
    }
];

class TitleSystem {
    static getAllTitles() {
        return TITLE_DATABASE;
    }

    static getTitleById(id) {
        return TITLE_DATABASE.find(t => t.id === id) || null;
    }

    /**
     * Kiểm tra và mở khóa các danh hiệu đủ điều kiện cho người chơi
     * Trả về mảng các danh hiệu MỚI vừa được mở khóa
     */
    static checkAndUnlockTitles(player) {
        if (!player.unlockedTitles) {
            player.unlockedTitles = [];
        }

        const newlyUnlocked = [];

        TITLE_DATABASE.forEach(title => {
            if (!player.unlockedTitles.includes(title.id)) {
                if (title.checkUnlocked(player)) {
                    player.unlockedTitles.push(title.id);
                    newlyUnlocked.push(title);
                }
            }
        });

        // Nếu chưa trang bị danh hiệu nào mà đã mở khóa ít nhất 1 danh hiệu -> Tự động trang bị
        if (!player.equippedTitle && player.unlockedTitles.length > 0) {
            player.equippedTitle = player.unlockedTitles[0];
        }

        return newlyUnlocked;
    }

    /**
     * Trang bị danh hiệu cho người chơi
     */
    static equipTitle(player, titleId) {
        if (!titleId) {
            player.equippedTitle = null;
            return { success: true, title: null };
        }

        if (!player.unlockedTitles || !player.unlockedTitles.includes(titleId)) {
            return { success: false, msg: "Đạo hữu chưa mở khóa danh hiệu này!" };
        }

        const title = this.getTitleById(titleId);
        if (!title) {
            return { success: false, msg: "Danh hiệu không tồn tại!" };
        }

        player.equippedTitle = titleId;
        return { success: true, title: title };
    }

    /**
     * Tháo danh hiệu hiện tại
     */
    static unequipTitle(player) {
        player.equippedTitle = null;
        return { success: true };
    }

    /**
     * Định dạng chuỗi hiển thị buff của danh hiệu
     */
    static formatBuffsText(buffs) {
        if (!buffs) return "Không có hiệu ứng";
        const parts = [];
        if (buffs.mau) parts.push(`HP +${buffs.mau.toLocaleString()}`);
        if (buffs.vatLi) parts.push(`V.Lí +${buffs.vatLi.toLocaleString()}`);
        if (buffs.phep) parts.push(`Phép +${buffs.phep.toLocaleString()}`);
        if (buffs.phongThu) parts.push(`Thủ +${buffs.phongThu.toLocaleString()}`);
        if (buffs.khangPhep) parts.push(`K.Phép +${buffs.khangPhep.toLocaleString()}`);
        if (buffs.baoKich) parts.push(`Bạo +${buffs.baoKich}%`);
        if (buffs.cultivationBonusPct) parts.push(`🌿 Tốc độ Tu Vi +${buffs.cultivationBonusPct}% (Đả tọa/Treo máy)`);
        if (buffs.noCombat) parts.push(`⚠️ Cấm chiến đấu`);
        return parts.length > 0 ? parts.join(" • ") : "Không có hiệu ứng";
    }
}

if (typeof window !== "undefined") {
    window.TITLE_DATABASE = TITLE_DATABASE;
    window.TitleSystem = TitleSystem;
}
