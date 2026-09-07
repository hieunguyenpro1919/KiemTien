/**
 * HỆ THỐNG BẢN ĐỒ VÀ ẢI CHIẾN ĐẤU (STAGES)
 * Mỗi Ải có độ khó, quái vật/Boss và YÊU CẦU CẢNH GIỚI TU VI
 * Người chơi không đủ tu vi sẽ bị phong ấn không thể khiêu chiến
 */

const STAGE_DATABASE = [
    // ================= KHU VỰC 1: THANH VÂN NGOẠI VI (YÊU CẦU TÔI KHÍ) =================
    {
        id: "stage_01",
        number: 1,
        name: "Ải 1: Thảo Dược Viên Ngoại Vi",
        area: "Thanh Vân Ngoại Vi",
        difficulty: "Dễ",
        diffColor: "#4caf50",
        reqRealm: 0,
        reqTier: 0, // Tôi Khí Tầng 1
        desc: "Khu vườn thảo dược ven rừng thường có yêu thỏ và dã kê quấy nhiễu.",
        monster: {
            name: "Linh Thảo Thỏ Yêu",
            title: "Tiểu Yêu Sơ Sinh",
            avatar: "🐇",
            hp: 220,
            attack: 16,
            defense: 5,
            attackSpeed: 2.2
        },
        rewards: {
            tuVi: 120,
            linhThach: 50,
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
        reqTier: 2, // Tôi Khí Tầng 3
        desc: "Bên dòng suối trong vắt, linh khí tụ lại thu hút bầy Hắc Thủy Xà hung hãn.",
        monster: {
            name: "Hắc Thủy Xà",
            title: "Độc Xà Ngàn Năm",
            avatar: "🐍",
            hp: 550,
            attack: 38,
            defense: 12,
            attackSpeed: 2.0
        },
        rewards: {
            tuVi: 300,
            linhThach: 120,
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
        reqTier: 5, // Tôi Khí Tầng 6
        desc: "Hang động tối tăm sực mùi tanh nồng, nơi sào huyệt Ma Hùng khổng lồ cư ngụ.",
        monster: {
            name: "Cuồng Bạo Ma Hùng",
            title: "Thủ Lĩnh Động Quỷ",
            avatar: "🐻",
            hp: 1400,
            attack: 85,
            defense: 25,
            attackSpeed: 2.4,
            isBoss: true,
            damageCapPct: 0.25,
            breakCapPct: 0.40
        },
        rewards: {
            tuVi: 800,
            linhThach: 300,
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
        reqTier: 9, // Tôi Khí Đỉnh Phong
        desc: "Vách núi chót vót gió lốc gầm rú, Thiết Vũ Điêu sải cánh rình mồi.",
        monster: {
            name: "Thiết Vũ Điêu Vương",
            title: "Bá Chủ Bầu Trời",
            avatar: "🦅",
            hp: 3200,
            attack: 160,
            defense: 45,
            attackSpeed: 1.8,
            isBoss: true,
            damageCapPct: 0.25,
            breakCapPct: 0.40
        },
        rewards: {
            tuVi: 2000,
            linhThach: 750,
            dropChance: 0.75,
            possibleDrops: ["weapon_02", "hat_02", "pill_tay_tuy", "pill_tu_khi_trung"]
        }
    },

    // ================= KHU VỰC 2: VẠN THÚ MA LÂM (YÊU CẦU NGƯNG KHÍ) =================
    {
        id: "stage_05",
        number: 5,
        name: "Ải 5: Cổ Thụ Lạc Lối",
        area: "Vạn Thú Ma Lâm",
        difficulty: "Bình Thường",
        diffColor: "#29b6f6",
        reqRealm: 1,
        reqTier: 0, // Ngưng Khí Tầng 1
        desc: "Rừng già cổ thụ rậm rạp che khuất ánh mặt trời, sương mù dày đặc che giấu sát cơ.",
        monster: {
            name: "U Minh Bạch Lang",
            title: "Dã Thú Ngưng Tụ Linh Lực",
            avatar: "🐺",
            hp: 5800,
            attack: 280,
            defense: 80,
            attackSpeed: 1.9
        },
        rewards: {
            tuVi: 4500,
            linhThach: 1600,
            dropChance: 0.55,
            possibleDrops: ["hat_03", "armor_03", "pill_tu_khi_dai"]
        }
    },
    {
        id: "stage_06",
        number: 6,
        name: "Ải 6: Xích Hỏa Diễm Đàm",
        area: "Vạn Thú Ma Lâm",
        difficulty: "Khó",
        diffColor: "#ab47bc",
        reqRealm: 1,
        reqTier: 4, // Ngưng Khí Tầng 5
        desc: "Hồ dung nham nóng rực sôi sục, nơi Hỏa Diễm Ma Viên canh giữ linh quả.",
        monster: {
            name: "Xích Diễm Ma Viên",
            title: "Thủ Hộ Hỏa Linh",
            avatar: "🦍",
            hp: 12500,
            attack: 520,
            defense: 150,
            attackSpeed: 2.1,
            isBoss: true,
            damageCapPct: 0.25,
            breakCapPct: 0.40
        },
        rewards: {
            tuVi: 10000,
            linhThach: 4000,
            dropChance: 0.65,
            possibleDrops: ["weapon_03", "armor_03", "pill_tu_khi_dai"]
        }
    },
    {
        id: "stage_07",
        number: 7,
        name: "Ải 7: Vạn Thú Tế Đàn",
        area: "Vạn Thú Ma Lâm",
        difficulty: "Tuyệt Địa",
        diffColor: "#e53935",
        reqRealm: 1,
        reqTier: 9, // Ngưng Khí Đỉnh Phong
        desc: "Tế đàn cổ xưa nơi Huyết Lân Cự Mãng ngưng tụ sát khí chu vi trăm dặm.",
        monster: {
            name: "Huyết Lân Cự Mãng Vương",
            title: "Ma Lâm Yêu Vương",
            avatar: "🐉",
            hp: 26000,
            attack: 980,
            defense: 260,
            attackSpeed: 1.7,
            isBoss: true,
            damageCapPct: 0.25,
            breakCapPct: 0.40
        },
        rewards: {
            tuVi: 25000,
            linhThach: 9500,
            dropChance: 0.8,
            possibleDrops: ["weapon_03", "hat_03", "pill_tay_tuy", "pill_tu_khi_dai"]
        }
    },

    // ================= KHU VỰC 3: TRẦM UYÊN LINH HẢI (YÊU CẦU LINH HẢI) =================
    {
        id: "stage_08",
        number: 8,
        name: "Ải 8: U Lam Hàn Hải",
        area: "Trầm Uyên Linh Hải",
        difficulty: "Bình Thường",
        diffColor: "#29b6f6",
        reqRealm: 2,
        reqTier: 0, // Linh Hải Tầng 1
        desc: "Mặt biển xanh biếc linh khí nồng đặc, nhưng dưới đáy sâu là nơi ẩn nấp của thủy yêu.",
        monster: {
            name: "Bích Hải Kình Ngư",
            title: "Thủy Tộc Cường Giả",
            avatar: "🐋",
            hp: 55000,
            attack: 1800,
            defense: 500,
            attackSpeed: 2.2
        },
        rewards: {
            tuVi: 55000,
            linhThach: 22000,
            dropChance: 0.6,
            possibleDrops: ["hat_04", "armor_04", "weapon_04"]
        }
    },
    {
        id: "stage_09",
        number: 9,
        name: "Ải 9: Đoạn Long Thủy Phủ",
        area: "Trầm Uyên Linh Hải",
        difficulty: "Tuyệt Địa",
        diffColor: "#e53935",
        reqRealm: 2,
        reqTier: 8, // Linh Hải Tầng 9
        desc: "Thủy phủ nguy nga bị ma khí nhuộm đen, Giao Long nửa bước hóa rồng chiếm cứ.",
        monster: {
            name: "Hắc Thủy Bát Đầu Giao",
            title: "Bá Chủ Thủy Vực",
            avatar: "🐲",
            hp: 120000,
            attack: 3400,
            defense: 950,
            attackSpeed: 1.8,
            isBoss: true,
            damageCapPct: 0.25,
            breakCapPct: 0.40
        },
        rewards: {
            tuVi: 140000,
            linhThach: 55000,
            dropChance: 0.8,
            possibleDrops: ["weapon_04", "hat_04", "armor_04", "pill_tay_tuy"]
        }
    },

    // ================= KHU VỰC 4: CỔ ĐẢO HOANG KHƯ (YÊU CẦU TẠO ĐẢO) =================
    {
        id: "stage_10",
        number: 10,
        name: "Ải 10: Hoang Khư Tàn Tích",
        area: "Cổ Đảo Hoang Khư",
        difficulty: "Khó",
        diffColor: "#ab47bc",
        reqRealm: 3,
        reqTier: 0, // Tạo Đảo Tầng 1
        desc: "Hòn đảo cổ xưa trôi dạt giữa hư không, các thạch tướng thủ vệ vẫn kiên trì canh gác.",
        monster: {
            name: "Cổ Đảo Cự Thạch Tướng",
            title: "Khôi Lỗi Viễn Cổ",
            avatar: "🗿",
            hp: 280000,
            attack: 7200,
            defense: 2200,
            attackSpeed: 2.5
        },
        rewards: {
            tuVi: 320000,
            linhThach: 130000,
            dropChance: 0.65,
            possibleDrops: ["hat_05", "armor_05", "weapon_05"]
        }
    },
    {
        id: "stage_11",
        number: 11,
        name: "Ải 11: Phong Ma Tiên Trận",
        area: "Cổ Đảo Hoang Khư",
        difficulty: "Tuyệt Địa",
        diffColor: "#e53935",
        reqRealm: 3,
        reqTier: 9, // Tạo Đảo Đỉnh Phong
        desc: "Tiên trận vỡ nát phong ấn một phân thân của Viễn Cổ Ma Thần.",
        monster: {
            name: "Viễn Cổ Ma Thần Tàn Hồn",
            title: "Tà Thần Thượng Cổ",
            avatar: "👿",
            hp: 600000,
            attack: 14000,
            defense: 4200,
            attackSpeed: 1.7,
            isBoss: true,
            damageCapPct: 0.25,
            breakCapPct: 0.40
        },
        rewards: {
            tuVi: 800000,
            linhThach: 350000,
            dropChance: 0.85,
            possibleDrops: ["weapon_05", "hat_05", "armor_05", "pill_tay_tuy"]
        }
    },

    // ================= KHU VỰC 5: NGUYÊN LINH THÁNH ĐỊA (YÊU CẦU NGUYÊN LINH THỤ) =================
    {
        id: "stage_12",
        number: 12,
        name: "Ải 12: Thần Thụ Tầng Dưới",
        area: "Nguyên Linh Thánh Địa",
        difficulty: "Khó",
        diffColor: "#ab47bc",
        reqRealm: 4,
        reqTier: 0, // Nguyên Linh Thụ Tầng 1
        desc: "Gốc cây thần thụ sinh ra các linh thể bảo vệ thiên địa linh quả.",
        monster: {
            name: "Cổ Thụ Hộ Vệ Thần",
            title: "Linh Thể Bất Tử",
            avatar: "🌳",
            hp: 1300000,
            attack: 28000,
            defense: 9000,
            attackSpeed: 2.0
        },
        rewards: {
            tuVi: 2000000,
            linhThach: 850000,
            dropChance: 0.7,
            possibleDrops: ["hat_06", "armor_06", "weapon_06"]
        }
    },

    // ================= KHU VỰC 6: TẠO HÓA LÔI SƠN (YÊU CẦU TẠO HÓA ĐÀI) =================
    {
        id: "stage_13",
        number: 13,
        name: "Ải 13: Cửu Thiên Lôi Trì",
        area: "Tạo Hóa Lôi Sơn",
        difficulty: "Tuyệt Địa",
        diffColor: "#e53935",
        reqRealm: 5,
        reqTier: 0, // Tạo Hóa Đài Tầng 1
        desc: "Hồ chứa thiên lôi cuồn cuộn vạn tia chớp, sinh ra Lôi Kỳ Lân thủ hộ lôi thai.",
        monster: {
            name: "Cửu Tiêu Lôi Kỳ Lân",
            title: "Thần Thú Lôi Phạt",
            avatar: "🦄",
            hp: 3200000,
            attack: 62000,
            defense: 18000,
            attackSpeed: 1.6,
            isBoss: true,
            damageCapPct: 0.25,
            breakCapPct: 0.40
        },
        rewards: {
            tuVi: 5500000,
            linhThach: 2400000,
            dropChance: 0.8,
            possibleDrops: ["hat_07", "armor_07", "weapon_07"]
        }
    },

    // ================= KHU VỰC 7: THÔNG THIÊN MA GIỚI (YÊU CẦU THÔNG THIÊN TRỤ) =================
    {
        id: "stage_14",
        number: 14,
        name: "Ải 14: Kình Thiên Đỉnh Giới",
        area: "Thông Thiên Ma Giới",
        difficulty: "Tuyệt Địa",
        diffColor: "#e53935",
        reqRealm: 6,
        reqTier: 0, // Thông Thiên Trụ Tầng 1
        desc: "Đỉnh trụ trời chọc thủng hư vô, nơi ngự trị của Hư Không Thôn Phệ Thú.",
        monster: {
            name: "Hư Không Cự Ma",
            title: "Chúa Tể Vết Nứt Hư Vô",
            avatar: "👾",
            hp: 8500000,
            attack: 140000,
            defense: 45000,
            attackSpeed: 1.8,
            isBoss: true,
            damageCapPct: 0.25,
            breakCapPct: 0.40
        },
        rewards: {
            tuVi: 16000000,
            linhThach: 6500000,
            dropChance: 0.85,
            possibleDrops: ["hat_08", "armor_08", "weapon_08"]
        }
    },

    // ================= KHU VỰC 8: NGỌC HƯ TIÊN CUNG (YÊU CẦU NGỌC ĐIỆN) =================
    {
        id: "stage_15",
        number: 15,
        name: "Ải 15: Bạch Ngọc Tiên Môn",
        area: "Ngọc Hư Tiên Cung",
        difficulty: "Chí Tôn",
        diffColor: "#ffd700",
        reqRealm: 7,
        reqTier: 0, // Ngọc Điện Tầng 1
        desc: "Cửa ải bước vào thế giới thần tiên, canh giữ bởi Ngọc Hư Tiên Tướng uy chấn cửu thiên.",
        monster: {
            name: "Ngọc Hư Chiến Thần",
            title: "Trấn Cung Thần Tướng",
            avatar: "⚔️",
            hp: 22000000,
            attack: 320000,
            defense: 95000,
            attackSpeed: 1.5,
            isBoss: true,
            damageCapPct: 0.25,
            breakCapPct: 0.40
        },
        rewards: {
            tuVi: 45000000,
            linhThach: 18000000,
            dropChance: 0.9,
            possibleDrops: ["hat_09", "armor_09", "weapon_09"]
        }
    },

    // ================= KHU VỰC 9: CỬU TRỌNG THIÊN ĐỈNH (YÊU CẦU ĐỈNH CẤP NGAI) =================
    {
        id: "stage_16",
        number: 16,
        name: "Ải 16: Đỉnh Cấp Vương Tọa - Chung Cực Quyết Đấu",
        area: "Cửu Trọng Thiên Đỉnh",
        difficulty: "Nghịch Thiên",
        diffColor: "#ff1744",
        reqRealm: 8,
        reqTier: 0, // Đỉnh Cấp Ngai Tầng 1
        desc: "Nơi cao nhất của chư thiên vạn giới. Đánh bại Hỗn Độn Chúa Tể để đăng cơ vị trí Đỉnh Cấp Ngai Vàng!",
        monster: {
            name: "Hỗn Độn Chúa Tể",
            title: "Đấng Tối Cao Của Vũ Trụ",
            avatar: "👑",
            hp: 60000000,
            attack: 850000,
            defense: 250000,
            attackSpeed: 1.4,
            isBoss: true,
            damageCapPct: 0.20,
            breakCapPct: 0.30
        },
        rewards: {
            tuVi: 130000000,
            linhThach: 75000000,
            dropChance: 1.0,
            possibleDrops: ["hat_10", "armor_10", "weapon_10"]
        }
    },

    // ================= KHU VỰC 10: THIÊN NGOẠI VẤN ĐẠO (CỰC HẠN CHIẾN) =================
    {
        id: "stage_17",
        number: 17,
        name: "Ải 17: Vấn Đạo",
        area: "Thiên Ngoại Hư Không",
        difficulty: "Vấn Đạo",
        diffColor: "#d500f9",
        reqRealm: 8,
        reqTier: 0, // Đỉnh Cấp Ngai
        desc: "Nơi khảo nghiệm đạo tâm tối thượng vượt ra ngoài càn khôn vạn giới. Chiến thắng Hóa Thân Vấn Đạo để chứng minh đạo quả chân chính!",
        monster: {
            name: "Hóa Thân Vấn Đạo",
            title: "Cực Cảnh Đại Đạo",
            avatar: "🌌",
            hp: 100000000000, // 100 Tỷ Máu
            attack: 10000000, // 10 Triệu Sát Thương
            defense: 850000,
            attackSpeed: 1.5,
            isBoss: true,
            damageCapPct: 0.20,
            breakCapPct: 0.30
        },
        rewards: {
            tuVi: 350000000, // 350 Triệu Tu Vi
            linhThach: 3500000000, // 3.5 Tỷ Linh Thạch
            dropChance: 1.0,
            possibleDrops: ["weapon_tien_01", "armor_tien_01", "hat_12", "weapon_phep_tien_01", "pill_thanh_chuyen"]
        }
    },

    // ================= KHU VỰC 11: VÔ THƯỢNG TINH VỰC (YÊU CẦU VÔ THƯỢNG LỘ) =================
    {
        id: "stage_18",
        number: 18,
        name: "Ải 18: Tinh Hà Thần Điện",
        area: "Vô Thượng Tinh Vực",
        difficulty: "Vô Thượng",
        diffColor: "#ff007f",
        reqRealm: 9, // Vô Thượng Lộ
        reqTier: 0,
        desc: "Ải thí luyện tối cao của Vô Thượng Lộ. Đánh bại Tinh Hà Thần Long để phá vỡ gông cùm bước vào cảnh giới Vạn Vì Tinh Tú!",
        monster: {
            name: "Tinh Hà Thần Long",
            title: "Chúa Tể Tinh Hà",
            avatar: "🐉",
            hp: 250000000000, // 250 Tỷ Máu
            attack: 25000000, // 25 Triệu Sát Thương
            defense: 2000000,
            attackSpeed: 1.5,
            isBoss: true,
            damageCapPct: 0.20,
            breakCapPct: 0.30
        },
        rewards: {
            tuVi: 1800000000, // 1.8 Tỷ Tu Vi
            linhThach: 18000000000, // 18 Tỷ Linh Thạch
            dropChance: 1.0,
            possibleDrops: ["weapon_thanh_01", "hat_13", "weapon_phep_thanh_01", "pill_thanh_01", "pill_tay_tuy"]
        }
    },

    // ================= KHU VỰC 12: CHÍ CAO VĨNH HẰNG GIỚI (YÊU CẦU VẠN VÌ TINH TÚ) =================
    {
        id: "stage_19",
        number: 19,
        name: "Ải 19: Đại Đạo Thần Cung",
        area: "Chí Cao Vĩnh Hằng Giới",
        difficulty: "Chí Cao",
        diffColor: "#ffd700",
        reqRealm: 10, // Vạn Vì Tinh Tú
        reqTier: 0,
        desc: "Cấm địa khởi nguyên của toàn bộ chư thiên vũ trụ. Đánh bại Hư Vô Thần Đế để đắc đạo thành Đại Đạo Chí Cao Vô Thượng!",
        monster: {
            name: "Hư Vô Thần Đế",
            title: "Đại Đạo Tối Cao Khởi Nguyên",
            avatar: "⚛️",
            hp: 2500000000000, // 2.500 Tỷ Máu
            attack: 120000000, // 120 Triệu Sát Thương
            defense: 6000000,
            attackSpeed: 1.4,
            isBoss: true,
            damageCapPct: 0.20,
            breakCapPct: 0.30
        },
        rewards: {
            tuVi: 7500000000, // 7.5 Tỷ Tu Vi
            linhThach: 85000000000, // 85 Tỷ Linh Thạch
            dropChance: 1.0,
            possibleDrops: ["hat_14", "armor_thanh_giap", "weapon_phep_thanh_02", "weapon_thanh_01", "pill_thanh_01"]
        }
    },

    // ================= KHU VỰC 13: BẢN NGUYÊN KHỞI NGUYÊN GIỚI (YÊU CẦU ĐẠI ĐẠO CHÍ CAO) =================
    {
        id: "stage_20",
        number: 20,
        name: "Ải 20: Thái Sơ Hỗn Độn Đàm",
        area: "Bản Nguyên Khởi Nguyên Giới",
        difficulty: "Chí Cao",
        diffColor: "#ffd700",
        reqRealm: 11, // Đại Đạo Chí Cao Vô Thượng
        reqTier: 10, // Yêu cầu Tầng 11 trở lên
        desc: "Đầm lầy hỗn độn trước khi thiên địa phân khai. Nơi ngủ say của Cổ Thần Thái Sơ ngưng tụ từ bản nguyên đại đạo.",
        monster: {
            name: "Thái Sơ Cổ Thần",
            title: "Hóa Thân Bản Nguyên Hỗn Độn",
            avatar: "🗿",
            hp: 15000000000000, // 15.000 Tỷ Máu (15 Trillion)
            attack: 450000000,   // 450 Triệu Sát Thương
            defense: 18000000,
            attackSpeed: 1.35,
            isBoss: true,
            damageCapPct: 0.20,
            breakCapPct: 0.30
        },
        rewards: {
            tuVi: 35000000000,     // 35 Tỷ Tu Vi
            linhThach: 350000000000, // 350 Tỷ Linh Thạch
            dropChance: 1.0,
            possibleDrops: ["hat_15", "armor_dai_dao_thanh_bao", "pill_khoi_nguyen_thanh_dan"]
        }
    },
    {
        id: "stage_21",
        number: 21,
        name: "Ải 21: Vĩnh Hằng Luân Hồi Kính",
        area: "Bản Nguyên Khởi Nguyên Giới",
        difficulty: "Bất Hủ",
        diffColor: "#e040fb",
        reqRealm: 11, // Đại Đạo Chí Cao Vô Thượng
        reqTier: 30, // Yêu cầu Tầng 31 trở lên
        desc: "Mặt gương luân hồi phản chiếu bản ngã cực hạn. Đánh bại Tâm Ma Đại Đạo để hoàn toàn bước vào cảnh giới bất hủ bất diệt.",
        monster: {
            name: "Chí Cao Tâm Ma",
            title: "Cực Cảnh Đại Đạo Nghịch Luân",
            avatar: "👁️",
            hp: 80000000000000, // 80.000 Tỷ Máu (80 Trillion)
            attack: 1800000000,  // 1.8 Tỷ Sát Thương
            defense: 45000000,
            attackSpeed: 1.3,
            isBoss: true,
            damageCapPct: 0.20,
            breakCapPct: 0.30
        },
        rewards: {
            tuVi: 180000000000,     // 180 Tỷ Tu Vi
            linhThach: 1800000000000, // 1.8 Nghìn Tỷ Linh Thạch (1.8 Trillion)
            dropChance: 1.0,
            possibleDrops: ["weapon_dai_dao_chi_ton", "weapon_phep_thanh_02", "pill_khoi_nguyen_thanh_dan"]
        }
    },
];

class StageSystem {
    static getAllStages() {
        return STAGE_DATABASE;
    }

    static getStageById(id) {
        return STAGE_DATABASE.find(s => s.id === id) || null;
    }

    /**
     * Kiểm tra người chơi có đủ điều kiện tu vi để vào ải không
     */
    static isStageUnlocked(playerRealm, playerTier, stage) {
        return RealmSystem.isRealmSufficient(playerRealm, playerTier, stage.reqRealm, stage.reqTier);
    }
}

if (typeof window !== "undefined") {
    window.STAGE_DATABASE = STAGE_DATABASE;
    window.StageSystem = StageSystem;
}
