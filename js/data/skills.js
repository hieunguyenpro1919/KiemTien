/**
 * HỆ THỐNG KỸ NĂNG TU TIÊN
 * Phân loại: Vật Lí, Phép Thuật, Hộ Thể (Khiên), Trị Liệu
 * Sắp xếp tự động từ thấp đến cao theo Cảnh Giới & Tầng yêu cầu
 */

const SKILL_DATABASE = [
    // --- TÔI KHÍ CẢNH (Realm 0) ---
    {
        id: "skill_toai_thach_quyen",
        name: "Toái Thạch Quyền",
        type: "vat_li",
        reqRealm: 0,
        reqTier: 0, // Tôi Khí Tầng 1
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
        reqTier: 0, // Tôi Khí Tầng 1
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
        reqTier: 2, // Tôi Khí Tầng 3
        price: 120,
        cooldown: 8,
        multiplier: 0.45, // Tạo khiên bằng 45% HP tối đa
        icon: "🛡️",
        vfx: "shield",
        desc: "Vận khí bao phủ bì phu cứng như sắt thép. Nhận khiên hộ thể bằng 45% Máu tối đa trong 5s."
    },
    {
        id: "skill_quy_nguyen_khi",
        name: "Quy Nguyên Khí",
        type: "tri_lieu",
        reqRealm: 0,
        reqTier: 4, // Tôi Khí Tầng 5
        price: 200,
        cooldown: 9,
        multiplier: 2.5, // Hồi máu = Phép * 2.5 + 15% Max HP
        icon: "💚",
        vfx: "heal",
        desc: "Điều hòa kinh mạch, khôi phục sinh lực bị tổn hại. Hồi phục lượng lớn Sinh Mệnh."
    },
    {
        id: "skill_liet_phong_kiem",
        name: "Liệt Phong Kiếm",
        type: "vat_li",
        reqRealm: 0,
        reqTier: 7, // Tôi Khí Tầng 8
        price: 350,
        cooldown: 5,
        multiplier: 3.5,
        icon: "🗡️",
        vfx: "wind_slash",
        desc: "Kiếm nhanh như gió bão xé rách phòng ngự mục tiêu. Gây 350% sát thương Vật Lí."
    },

    // --- NGƯNG KHÍ CẢNH (Realm 1) ---
    {
        id: "skill_ngu_kiem_quyet",
        name: "Ngự Kiếm Quyết",
        type: "vat_li",
        reqRealm: 1,
        reqTier: 0, // Ngưng Khí Tầng 1
        price: 600,
        cooldown: 5,
        multiplier: 4.5,
        icon: "⚔️",
        vfx: "flying_swords",
        desc: "Điều khiển phi kiếm vút ra chém liên hoàn vào tử huyệt địch. Gây 450% sát thương Vật Lí."
    },
    {
        id: "skill_huyen_bang_tien",
        name: "Huyền Băng Tiễn",
        type: "phep",
        reqRealm: 1,
        reqTier: 2, // Ngưng Khí Tầng 3
        price: 800,
        cooldown: 6,
        multiplier: 5.0,
        icon: "❄️",
        vfx: "ice_spike",
        desc: "Ngưng tụ khí lạnh buốt giá thành tiễn băng sắc nhọn. Gây 500% sát thương Phép cực mạnh."
    },
    {
        id: "skill_ho_the_cuong_khi",
        name: "Hộ Thể Cương Khí",
        type: "ho_the",
        reqRealm: 1,
        reqTier: 4, // Ngưng Khí Tầng 5
        price: 1200,
        cooldown: 10,
        multiplier: 0.65, // Khiên 65% Max HP
        icon: "💠",
        vfx: "golden_shield",
        desc: "Giải phóng cương khí vô hình tạo màng bảo hộ vững chãi. Nhận khiên bằng 65% Máu tối đa."
    },

    // --- LINH HẢI CẢNH (Realm 2) ---
    {
        id: "skill_linh_hai_trieu_tich",
        name: "Linh Hải Triều Tịch",
        type: "phep",
        reqRealm: 2,
        reqTier: 0, // Linh Hải Tầng 1
        price: 2500,
        cooldown: 6,
        multiplier: 7.0,
        icon: "🌊",
        vfx: "water_surge",
        desc: "Khơi thông đan điền linh hải, dâng trào sóng cuộn cuồng phong nhấn chìm kẻ địch. Gây 700% sát thương Phép."
    },
    {
        id: "skill_thanh_moc_truyen_sinh",
        name: "Thanh Mộc Trường Sinh",
        type: "tri_lieu",
        reqRealm: 2,
        reqTier: 3, // Linh Hải Tầng 4
        price: 3200,
        cooldown: 10,
        multiplier: 3.5,
        icon: "🌿",
        vfx: "heal_nature",
        desc: "Dẫn khí mộc linh bao bọc bản thân, hồi phục 50% Máu tối đa và tẩy rửa thương tổn."
    },
    {
        id: "skill_thien_kiem_tram_yeu",
        name: "Thiên Kiếm Trảm Ma",
        type: "vat_li",
        reqRealm: 2,
        reqTier: 6, // Linh Hải Tầng 7
        price: 4500,
        cooldown: 7,
        multiplier: 8.5,
        icon: "⚡",
        vfx: "sky_sword",
        desc: "Triệu hoán hư ảnh cự kiếm thiên đình chém xuống. Gây 850% sát thương Vật Lí bạo liệt."
    },

    // --- TẠO ĐẢO CẢNH (Realm 3) ---
    {
        id: "skill_dia_long_toai_thach",
        name: "Địa Long Toái Thạch",
        type: "vat_li",
        reqRealm: 3,
        reqTier: 0, // Tạo Đảo Tầng 1
        price: 8000,
        cooldown: 7,
        multiplier: 10.5,
        icon: "🐉",
        vfx: "earth_quake",
        desc: "Dậm chân thức tỉnh địa long kình lực, đất đá vụn nát. Gây 1050% sát thương Vật Lí chấn động."
    },
    {
        id: "skill_bat_quai_phong_ma",
        name: "Bát Quái Trận Đồ",
        type: "phep",
        reqRealm: 3,
        reqTier: 4, // Tạo Đảo Tầng 5
        price: 11000,
        cooldown: 8,
        multiplier: 12.0,
        icon: "☯️",
        vfx: "bagua_seal",
        desc: "Hiện trận đồ bát quái trấn áp lục phủ ngũ tạng yêu tà. Gây 1200% sát thương Phép."
    },

    // --- NGUYÊN LINH THỤ (Realm 4) ---
    {
        id: "skill_nguyen_linh_phuc_to",
        name: "Nguyên Linh Hộ Thể",
        type: "ho_the",
        reqRealm: 4,
        reqTier: 0, // Nguyên Linh Thụ Tầng 1
        price: 20000,
        cooldown: 11,
        multiplier: 0.85, // Khiên 85% Max HP
        icon: "🌳",
        vfx: "golden_shield",
        desc: "Cổ thụ nguyên linh tỏa ánh thần quang, hấp thụ 85% lượng Máu tối đa thành lớp giáp bất hoại."
    },
    {
        id: "skill_van_diep_phi_hoa",
        name: "Vạn Diệp Phi Hoa",
        type: "phep",
        reqRealm: 4,
        reqTier: 4, // Nguyên Linh Thụ Tầng 5
        price: 26000,
        cooldown: 7,
        multiplier: 15.0,
        icon: "🍃",
        vfx: "leaf_storm",
        desc: "Vạn phiến linh diệp biến hóa thành lưỡi đao sắc bén cắt nát vạn vật. Gây 1500% sát thương Phép."
    },

    // --- TẠO HÓA ĐÀI (Realm 5) ---
    {
        id: "skill_tao_hoa_than_loi",
        name: "Tạo Hóa Thần Lôi",
        type: "phep",
        reqRealm: 5,
        reqTier: 0, // Tạo Hóa Đài Tầng 1
        price: 50000,
        cooldown: 8,
        multiplier: 18.0,
        icon: "🌩️",
        vfx: "divine_thunder",
        desc: "Vận chuyển càn khôn trên Tạo Hóa Đài, dẫn Cửu Thiên Thần Lôi hủy diệt tà đạo. Gây 1800% sát thương Phép."
    },
    {
        id: "skill_bat_diet_kim_than",
        name: "Bất Diệt Kim Thân",
        type: "vat_li",
        reqRealm: 5,
        reqTier: 4, // Tạo Hóa Đài Tầng 5
        price: 65000,
        cooldown: 8,
        multiplier: 20.0,
        icon: "✨",
        vfx: "golden_smash",
        desc: "Hóa thân kim cương bất hoại, vung quyền trấn sơn diệt hải. Gây 2000% sát thương Vật Lí kinh thiên."
    },
    {
        id: "skill_thon_thien",
        name: "Thôn Thiên Ma Công",
        type: "phep",
        reqRealm: 5, // Tạo Hóa Đài
        reqTier: 8, // Tầng 8
        price: 90000,
        cooldown: 10,
        multiplier: 24.0,
        icon: "🕳️",
        vfx: "black_hole",
        desc: "Hóa ra hắc động càn quét linh khí trời đất. Gây 2400% sát thương Phép, cắn nuốt sinh cơ kẻ địch."
    },

    // --- THÔNG THIÊN TRỤ (Realm 6) ---
    {
        id: "skill_thong_thien_kinh_kich",
        name: "Thông Thiên Kình Kích",
        type: "vat_li",
        reqRealm: 6,
        reqTier: 0, // Thông Thiên Trụ Tầng 1
        price: 130000,
        cooldown: 8,
        multiplier: 30.0,
        icon: "🏛️",
        vfx: "pillar_smash",
        desc: "Mượn uy thế trụ trời chống đỡ vòm trời dộng xuống đỉnh đầu quân thù. Gây 3000% sát thương Vật Lí."
    },
    {
        id: "skill_tich_diet_ma_quang",
        name: "Tịch Diệt Thần Quang",
        type: "phep",
        reqRealm: 6,
        reqTier: 4, // Thông Thiên Trụ Tầng 5
        price: 170000,
        cooldown: 9,
        multiplier: 35.0,
        icon: "🔮",
        vfx: "oblivion_beam",
        desc: "Bắn ra chùm sáng tịch diệt phân rã mọi kết cấu nguyên tử. Gây 3500% sát thương Phép."
    },
    {
        id: "skill_thao_tu_kiem",
        name: "Thảo Tự Kiếm Quyết",
        type: "vat_li",
        reqRealm: 6, // Thông Thiên Trụ
        reqTier: 5, // Tầng 5
        price: 250000,
        cooldown: 8,
        multiplier: 42.0,
        icon: "🌿",
        vfx: "grass_sword",
        desc: "Một ngọn cỏ chém đứt nhật nguyệt tinh thần. Gây 4200% sát thương Vật Lí siêu việt."
    },

    // --- NGỌC ĐIỆN CẢNH (Realm 7) ---
    {
        id: "skill_ngoc_hu_kiem_tran",
        name: "Ngọc Hư Kiếm Trận",
        type: "vat_li",
        reqRealm: 7,
        reqTier: 0, // Ngọc Điện Tầng 1
        price: 350000,
        cooldown: 9,
        multiplier: 55.0,
        icon: "🌌",
        vfx: "flying_swords_gold",
        desc: "Vạn thanh kiếm ngọc từ tiên điện giáng lâm xoay vần xé toạc càn khôn. Gây 5500% sát thương Vật Lí."
    },
    {
        id: "skill_tien_quang_thai_at",
        name: "Thái Ất Tiên Quang",
        type: "tri_lieu",
        reqRealm: 7,
        reqTier: 4, // Ngọc Điện Tầng 5
        price: 450000,
        cooldown: 12,
        multiplier: 6.5,
        icon: "☀️",
        vfx: "celestial_aura",
        desc: "Ánh ngọc tiên điện thanh tẩy, hồi phục 75% Máu và ban khiên chắn bằng 65% HP tối đa."
    },

    // --- ĐỈNH CẤP NGAI (Realm 8) ---
    {
        id: "skill_chi_ton_vuong_toa",
        name: "Chí Tôn Vương Tọa",
        type: "phep",
        reqRealm: 8,
        reqTier: 0, // Đỉnh Cấp Ngai Tầng 1
        price: 1000000,
        cooldown: 10,
        multiplier: 80.0,
        icon: "👑",
        vfx: "throne_wrath",
        desc: "Uy áp của đấng ngự trên ngai vàng đỉnh cấp ép nát linh hồn địch. Gây 8000% sát thương Phép chí tôn."
    },
    {
        id: "skill_hon_don_vo_cuc",
        name: "Hỗn Độn Vô Cực Trảm",
        type: "vat_li",
        reqRealm: 8,
        reqTier: 9, // Đỉnh Cấp Ngai Đỉnh Phong
        price: 3000000,
        cooldown: 12,
        multiplier: 150.0,
        icon: "💥",
        vfx: "cosmic_crush",
        desc: "Tuyệt chiêu tối cao dung hợp hỗn độn sơ khai, một nhát trảm diệt thế. Gây 15000% sát thương Vật Lí."
    },
    {
        id: "skill_tieng_sao_than_gio",
        name: "Tiếng Sáo Và Thần Gió",
        type: "phep",
        reqRealm: 8,
        reqTier: 9,
        price: 8500000,
        cooldown: 11,
        multiplier: 5000.0,
        icon: "🪈",
        vfx: "tempest_melody",
        desc: "Tiếng sáo réo rắt câu thông cửu thiên cương phong, triệu hoán chân thân Phong Thần giáng thế. Cơn bão cuồng nộ hủy diệt thổi bay vạn vật, gây 500000% sát thương Phép cực mạnh."
    },
    // --- VÔ THƯỢNG LỘ (Realm 9) ---
    {
        id: "skill_vo_thuong_kiem_y",
        name: "Vô Thượng Bất Diệt Kiếm Ý",
        type: "vat_li",
        reqRealm: 9,
        reqTier: 0,
        price: 25000000,
        cooldown: 10,
        multiplier: 15000.0,
        icon: "⚔️",
        vfx: "cosmic_crush",
        desc: "Kiếm ý siêu việt trần thế chém rách trật tự không gian. Gây 1,500,000% sát thương Vật Lí."
    },
    {
        id: "skill_vo_thuong_ho_the",
        name: "Bất Diệt Chân Thân",
        type: "ho_the",
        reqRealm: 9,
        reqTier: 5,
        price: 45000000,
        cooldown: 12,
        multiplier: 1.2,
        icon: "🛡️",
        vfx: "golden_shield",
        desc: "Thân thể chạm ngưỡng vô thượng, ngưng tụ lớp giáp hộ thân bằng 120% Máu tối đa."
    },
    {
        id: "skill_vo_thuong_van_kiem_phep",
        name: "Vô Thượng Lôi Ngục Trận",
        type: "phep",
        reqRealm: 9,
        reqTier: 2,
        price: 30000000,
        cooldown: 10,
        multiplier: 16500.0,
        icon: "⚡",
        vfx: "divine_thunder",
        desc: "Dẫn động lôi kiếp từ thiên ngoại hư không tạo thành biển sấm sét vô tận. Gây 1,650,000% sát thương Phép."
    },

    // --- VẠN VÌ TINH TÚ (Realm 10) ---
    {
        id: "skill_tinh_ha_lac_tieu",
        name: "Tinh Hà Lạc Tiêu",
        type: "phep",
        reqRealm: 10,
        reqTier: 0,
        price: 100000000,
        cooldown: 12,
        multiplier: 45000.0,
        icon: "🌠",
        vfx: "cosmic_crush",
        desc: "Dẫn dắt vạn thiên tinh tú lao xuống như thiên thạch diệt thế. Gây 4,500,000% sát thương Phép cực hạn."
    },
    {
        id: "skill_tinh_than_ho_the",
        name: "Chu Thiên Tinh Thần Khôi",
        type: "ho_the",
        reqRealm: 10,
        reqTier: 4,
        price: 150000000,
        cooldown: 14,
        multiplier: 1.5,
        icon: "🪐",
        vfx: "golden_shield",
        desc: "Triệu hồi quỹ đạo ngân hà hộ thân, nhận lớp khiên hấp thụ bằng 150% Máu tối đa."
    },

    // --- ĐẠI ĐẠO CHÍ CAO VÔ THƯỢNG (Realm 11) ---
    {
        id: "skill_dai_dao_quy_nhan",
        name: "Đại Đạo Khởi Nguyên Thần Quyền",
        type: "vat_li",
        reqRealm: 11,
        reqTier: 0,
        price: 500000000,
        cooldown: 15,
        multiplier: 120000.0,
        icon: "💥",
        vfx: "cosmic_crush",
        desc: "Dồn toàn bộ căn nguyên vũ trụ vào một quyền, vạn vật quy về tro bụi. Gây 12,000,000% sát thương Vật Lí."
    },
    {
        id: "skill_hon_don_tai_sinh",
        name: "Hư Vô Nghịch Chuyển",
        type: "tri_lieu",
        reqRealm: 11,
        reqTier: 5,
        price: 800000000,
        cooldown: 18,
        multiplier: 15.0,
        icon: "⚛️",
        vfx: "celestial_aura",
        desc: "Nghịch chuyển quy tắc sinh tử, hồi phục 100% Máu tối đa và nhận khiên bằng 100% HP tối đa."
    },
    {
        id: "skill_dai_dao_tich_diet",
        name: "Đại Đạo Hư Vô Thần Quang",
        type: "phep",
        reqRealm: 11,
        reqTier: 2,
        price: 550000000,
        cooldown: 14,
        multiplier: 135000.0,
        icon: "🌌",
        vfx: "oblivion_beam",
        desc: "Giải phóng chùm sáng bản nguyên khởi nguyên của vũ trụ, xóa bỏ tồn tại của đối thủ. Gây 13,500,000% sát thương Phép chí cao."
    },
    {
        id: "skill_van_phap_quy_tong",
        name: "Vạn Pháp Quy Tông Thuật",
        type: "phep",
        reqRealm: 11,
        reqTier: 8,
        price: 900000000,
        cooldown: 16,
        multiplier: 180000.0,
        icon: "⚛️",
        vfx: "cosmic_crush",
        desc: "Dung hợp ức vạn pháp tắc đạo môn thành một đòn hủy diệt tối hậu. Gây 18,000,000% sát thương Phép."
    }
];

class SkillSystem {
    static getAllSkills() {
        return SKILL_DATABASE;
    }

    static getSkillById(id) {
        return SKILL_DATABASE.find(s => s.id === id) || null;
    }

    /**
     * So sánh 2 kỹ năng từ THẤP đến CAO
     * Ưu tiên: Cảnh giới yêu cầu (reqRealm) -> Tầng yêu cầu (reqTier) -> Giá tiền (price)
     */
    static compareSkills(a, b) {
        if (!a && !b) return 0;
        if (!a) return 1;
        if (!b) return -1;

        // 1. Cảnh giới yêu cầu từ thấp đến cao
        const realmA = a.reqRealm !== undefined ? a.reqRealm : 0;
        const realmB = b.reqRealm !== undefined ? b.reqRealm : 0;
        if (realmA !== realmB) return realmA - realmB;

        // 2. Tầng yêu cầu từ thấp đến cao
        const tierA = a.reqTier !== undefined ? a.reqTier : 0;
        const tierB = b.reqTier !== undefined ? b.reqTier : 0;
        if (tierA !== tierB) return tierA - tierB;

        // 3. Giá tiền từ thấp đến cao
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        if (priceA !== priceB) return priceA - priceB;

        // 4. Theo tên nếu bằng nhau
        return (a.name || "").localeCompare(b.name || "");
    }

    /**
     * Lấy danh sách kỹ năng có thể học dựa theo Cảnh Giới người chơi
     */
    static getAvailableSkills(playerRealm, playerTier) {
        return SKILL_DATABASE.filter(s => {
            return RealmSystem.isRealmSufficient(playerRealm, playerTier, s.reqRealm, s.reqTier);
        }).sort((a, b) => this.compareSkills(a, b));
    }

    /**
     * Kiểm tra người chơi có đủ điều kiện cảnh giới để dùng kỹ năng này không
     */
    static canUseSkill(playerRealm, playerTier, skillId) {
        const skill = this.getSkillById(skillId);
        if (!skill) return false;
        return RealmSystem.isRealmSufficient(playerRealm, playerTier, skill.reqRealm, skill.reqTier);
    }
}

if (typeof window !== "undefined") {
    window.SKILL_DATABASE = SKILL_DATABASE;
    window.SkillSystem = SkillSystem;
}
