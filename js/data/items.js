/**
 * HỆ THỐNG TRANG BỊ VÀ VẬT PHẨM TU TIÊN
 * 3 Ô Trang Bị: Nón, Giáp, Vũ Khí
 * Phẩm Cấp: Phàm -> Linh -> Huyền -> Địa -> Thiên -> Tiên -> Thánh
 */

const RARITY_ORDER = {
    pham: 0,
    linh: 1,
    huyen: 2,
    dia: 3,
    thien: 4,
    tien: 5,
    thanh: 6,
    cuc_dao: 7
};

const RARITY_INFO = {
    pham: { name: "Phàm Phẩm", color: "#b0bec5", bg: "rgba(176, 190, 197, 0.15)", border: "#78909c" },
    linh: { name: "Linh Phẩm", color: "#4fc3f7", bg: "rgba(79, 195, 247, 0.15)", border: "#0288d1" },
    huyen: { name: "Huyền Phẩm", color: "#ba68c8", bg: "rgba(186, 104, 200, 0.15)", border: "#7b1fa2" },
    dia: { name: "Địa Phẩm", color: "#ffb74d", bg: "rgba(255, 183, 77, 0.15)", border: "#f57c00" },
    thien: { name: "Thiên Phẩm", color: "#ff5252", bg: "rgba(255, 82, 82, 0.2)", border: "#d32f2f" },
    tien: { name: "Tiên Phẩm", color: "#00e676", bg: "rgba(0, 230, 118, 0.2)", border: "#00c853" },
    thanh: { name: "Thánh Phẩm", color: "#ffd700", bg: "rgba(255, 215, 0, 0.2)", border: "#ffc107" },
    cuc_dao: { name: "Cực Đạo", color: "#ff2a85", bg: "rgba(255, 42, 133, 0.25)", border: "#ff2a85" }
};

const ITEM_DATABASE = [
    // ================= NÓN (HEADGEAR) - SẮP XẾP TỪ THẤP ĐẾN CAO =================
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
        id: "hat_05",
        name: "Cổ Đảo Huyền Khôi",
        slot: "non",
        rarity: "huyen",
        reqRealm: 3,
        stats: { mau: 5000, phongThu: 250, khangPhep: 200 },
        price: 16000,
        sellPrice: 5500,
        icon: "🪖",
        desc: "Nón sắt cổ xưa phong hóa trăm năm từ tiên đảo cổ, phòng thủ trác tuyệt."
    },
    {
        id: "hat_06",
        name: "Nguyên Mộc Thần Quán",
        slot: "non",
        rarity: "dia",
        reqRealm: 4,
        stats: { mau: 15000, phongThu: 700, khangPhep: 580 },
        price: 55000,
        sellPrice: 28000,
        icon: "⚜️",
        desc: "Bện từ nhánh cổ thụ thần linh, sinh mệnh lực tràn trề bất tận."
    },
    {
        id: "hat_07",
        name: "Tạo Hóa Lôi Mạo",
        slot: "non",
        rarity: "dia",
        reqRealm: 5,
        stats: { mau: 40000, phongThu: 2000, khangPhep: 1800 },
        price: 180000,
        sellPrice: 60000,
        icon: "⚡",
        desc: "Ngâm qua vạn tia thiên kiếp lôi đình, uy nghiêm chấn nhiếp bát hoang."
    },
    {
        id: "hat_08",
        name: "Thông Thiên Thần Mạo",
        slot: "non",
        rarity: "thien",
        reqRealm: 6,
        stats: { mau: 1200000, phongThu: 42000, khangPhep: 38000 },
        price: 650000,
        sellPrice: 220000,
        icon: "🌟",
        desc: "Rèn từ vẫn thạch trụ trời, linh quang chiếu rọi cửu thiên."
    },
    {
        id: "hat_09",
        name: "Ngọc Hư Tiên Vương Quán",
        slot: "non",
        rarity: "thien",
        reqRealm: 7,
        stats: { mau: 3500000, phongThu: 110000, khangPhep: 95000 },
        price: 2200000,
        sellPrice: 750000,
        icon: "👑",
        desc: "Ngọc quán thượng phẩm của chư tiên trên Ngọc Hư Tiên Cung."
    },
    {
        id: "hat_10",
        name: "Hỗn Độn Ngai Thần Quán",
        slot: "non",
        rarity: "thien",
        reqRealm: 8,
        stats: { mau: 10000000, phongThu: 280000, khangPhep: 260000 },
        price: 8000000,
        sellPrice: 3000000,
        icon: "👑",
        desc: "Thần quan tối cao của chủ nhân Đỉnh Cấp Ngai Vàng."
    },
    {
        id: "hat_11",
        name: "Cửu Trọng Ngai Vương Quán",
        slot: "non",
        rarity: "tien",
        reqRealm: 8,
        stats: { mau: 16500000, phongThu: 480000, khangPhep: 450000 },
        price: 25000000,
        sellPrice: 9000000,
        icon: "👑",
        desc: "Đế miện đúc từ tinh thiết cửu tiêu, ngưng tụ uy nghiêm tuyệt đối của bậc chúa tể vương tọa."
    },
    {
        id: "hat_12",
        name: "Vấn Đạo Thái Hư Quán",
        slot: "non",
        rarity: "tien",
        reqRealm: 9,
        stats: { mau: 42000000, phongThu: 1200000, khangPhep: 1000000 },
        price: 85000000,
        sellPrice: 30000000,
        icon: "💠",
        desc: "Ngọc quán ngưng tụ ý niệm vấn đạo nơi thiên ngoại hư không, thức hải kiên cố vạn kiếp bất diệt."
    },
    {
        id: "hat_13",
        name: "Vạn Cổ Tinh Hà Mạo",
        slot: "non",
        rarity: "thanh",
        reqRealm: 10,
        stats: { mau: 100000000, phongThu: 2800000, khangPhep: 2000000 },
        price: 320000000,
        sellPrice: 110000000,
        icon: "🌌",
        desc: "Dệt từ ánh sáng của ức vạn tinh tú trong tinh hà thần điện, che chở nguyên thần khỏi quy tắc hủy diệt."
    },
    {
        id: "hat_14",
        name: "Chí Cao Vĩnh Hằng Thánh Quán",
        slot: "non",
        rarity: "thanh",
        reqRealm: 11,
        stats: { mau: 280000000, phongThu: 8500000, khangPhep: 8000000 },
        price: 1200000000,
        sellPrice: 450000000,
        icon: "👑",
        desc: "Thánh quan chí cao quy tụ căn nguyên đại đạo vũ trụ, mang trên đầu như chư thiên thần phật đồng hành hộ mệnh."
    },
    {
        id: "hat_15",
        name: "Khởi Nguyên Thái Cực Quán",
        slot: "non",
        rarity: "thanh",
        reqRealm: 11,
        stats: { mau: 800000000, phongThu: 22000000, khangPhep: 20000000 },
        price: 3500000000,
        sellPrice: 1200000000,
        icon: "👑",
        desc: "Thần quan đúc từ bản nguyên thái cực thuở sơ khai, thức hải vĩnh hằng cùng thiên địa."
    },
    {
        id: "hat_cuc_dao_01",
        name: "Cực Đạo Vô Lượng Thần Quán",
        slot: "non",
        rarity: "cuc_dao",
        reqRealm: 11,
        currency: "hon_nguyen",
        stats: { mau: 2500000000, phongThu: 80000000, khangPhep: 35000000 },
        price: 12000,
        sellPrice: 4000,
        icon: "👑",
        desc: "Thần quán Cực Đạo dung hợp khí tức hồng mông nguyên thủy, hộ trì thức hải bất diệt, phòng thủ vật lí trác tuyệt."
    },
    {
        id: "hat_cuc_dao_02",
        name: "Cực Đạo Hư Không Minh Miện",
        slot: "non",
        rarity: "cuc_dao",
        reqRealm: 11,
        currency: "hon_nguyen",
        stats: { mau: 2500000000, phongThu: 35000000, khangPhep: 80000000 },
        price: 12000,
        sellPrice: 4000,
        icon: "🪞",
        desc: "Đế miện Cực Đạo đúc từ tinh hoa hư không vạn giới, hóa giải vạn loại pháp thuật cấm kỵ chư thiên."
    },

    // ================= GIÁP (ARMOR) - SẮP XẾP TỪ THẤP ĐẾN CAO =================
    {
        id: "armor_01",
        name: "Thô Bố Y",
        slot: "giap",
        rarity: "pham",
        reqRealm: 0,
        stats: { mau: 150, phongThu: 16 },
        price: 150,
        sellPrice: 50,
        icon: "🥋",
        desc: "Áo vải thô của người thường, chỉ che gió sương nhẹ nhàng."
    },
    {
        id: "armor_02",
        name: "Thanh Nguyệt Đạo Bào",
        slot: "giap",
        rarity: "linh",
        reqRealm: 0,
        stats: { mau: 350, phongThu: 36 },
        price: 500,
        sellPrice: 200,
        icon: "👘",
        desc: "Dệt từ tơ tằm linh nguyệt, nhẹ như mây bay nhưng cản được đao kiếm phàm tục."
    },
    {
        id: "armor_03",
        name: "Huyền Thiết Trọng Giáp",
        slot: "giap",
        rarity: "linh",
        reqRealm: 1,
        stats: { mau: 900, phongThu: 90 },
        price: 1800,
        sellPrice: 900,
        icon: "🛡️",
        desc: "Đúc từ quặng huyền thiết ngàn năm, phòng ngự vật lí cực kỳ kiên cố."
    },
    {
        id: "armor_04",
        name: "Lam Thủy Sa Y",
        slot: "giap",
        rarity: "huyen",
        reqRealm: 2,
        stats: { mau: 2800, phongThu: 180 },
        price: 6000,
        sellPrice: 2800,
        icon: "🥻",
        desc: "Áo dệt từ sóng nước linh hải, hóa giải chấn động cực tốt."
    },
    {
        id: "armor_05",
        name: "Thạch Bàn Tiên Giáp",
        slot: "giap",
        rarity: "huyen",
        reqRealm: 3,
        stats: { mau: 9000, phongThu: 580 },
        price: 32000,
        sellPrice: 11500,
        icon: "🦺",
        desc: "Áo giáp kết tinh từ nham thạch linh đảo, đứng yên vững chãi như núi."
    },
    {
        id: "armor_06",
        name: "Trường Sinh Cổ Thụ Y",
        slot: "giap",
        rarity: "dia",
        reqRealm: 4,
        stats: { mau: 32000, phongThu: 1800 },
        price: 100000,
        sellPrice: 32000,
        icon: "🧥",
        desc: "Dệt từ vỏ cổ thụ nguyên linh, sinh cơ dồi dào, thân thể khó bị tổn thương."
    },
    {
        id: "armor_07",
        name: "Càn Khôn Tạo Hóa Giáp",
        slot: "giap",
        rarity: "dia",
        reqRealm: 5,
        stats: { mau: 88000, phongThu: 4200 },
        price: 300000,
        sellPrice: 120000,
        icon: "🦹",
        desc: "Chứa đựng quy tắc tạo hóa càn khôn hộ thân, đao thương bất nhập."
    },
    {
        id: "armor_08",
        name: "Kình Thiên Thần Lân Giáp",
        slot: "giap",
        rarity: "thien",
        reqRealm: 6,
        stats: { mau: 2500000, phongThu: 68000 },
        price: 1200000,
        sellPrice: 480000,
        icon: "🛡️",
        desc: "Vảy rồng kình thiên chống đỡ trụ trời kết thành, phòng ngự kinh thế."
    },
    {
        id: "armor_09",
        name: "Bạch Ngọc Tiên Cung Bào",
        slot: "giap",
        rarity: "thien",
        reqRealm: 7,
        stats: { mau: 7500000, phongThu: 180000 },
        price: 4500000,
        sellPrice: 1500000,
        icon: "✨",
        desc: "Đạo bào tiên giới ngọc điện, phát ra vầng hào quang bất diệt."
    },
    {
        id: "armor_10",
        name: "Cửu Tiêu Chí Tôn Giáp",
        slot: "giap",
        rarity: "thien",
        reqRealm: 8,
        stats: { mau: 22000000, phongThu: 480000 },
        price: 20000000,
        sellPrice: 10000000,
        icon: "👑",
        desc: "Chiến giáp chí tôn độc nhất vô nhị của chúa tể vương tọa đỉnh cấp."
    },
    {
        id: "armor_thanh_giap",
        name: "Hỗn Độn Thánh Thể Giáp",
        slot: "giap",
        rarity: "thanh",
        reqRealm: 8,
        stats: { mau: 55000000, phongThu: 1100000 },
        price: 150000000,
        sellPrice: 45000000,
        icon: "🛡️",
        desc: "Thánh giáp rèn từ hỗn độn bản nguyên, tự thành một giới, vạn pháp bất xâm."
    },
    {
        id: "armor_tien_01",
        name: "Vô Thượng Tiên Y",
        slot: "giap",
        rarity: "tien",
        reqRealm: 9,
        stats: { mau: 180000000, phongThu: 1850000 },
        price: 280000000,
        sellPrice: 95000000,
        icon: "🥻",
        desc: "Thiên y dệt từ vân vụ tinh hà, vạn pháp bất xâm, độc tôn thiên địa."
    },
    {
        id: "armor_van_vi_tinh_giap",
        name: "Vạn Tinh Quy Tông Giáp",
        slot: "giap",
        rarity: "thanh",
        reqRealm: 10,
        stats: { mau: 350000000, phongThu: 4500000 },
        price: 600000000,
        sellPrice: 200000000,
        icon: "🌌",
        desc: "Dệt từ bụi tinh vân và quỹ đạo tinh tú, ngưng kết lực lượng phòng ngự vô hạn của dải ngân hà."
    },
    {
        id: "armor_dai_dao_thanh_bao",
        name: "Khởi Nguyên Hư Vô Thánh Bào",
        slot: "giap",
        rarity: "thanh",
        reqRealm: 11,
        stats: { mau: 1200000000, phongThu: 15000000 },
        price: 2500000000,
        sellPrice: 900000000,
        icon: "⚛️",
        desc: "Thánh bào sinh ra trước thuở hỗn độn sơ khai, mọi đòn tấn công chạm vào đều tiêu biến vào cõi hư vô."
    },
    {
        id: "armor_cuc_dao_01",
        name: "Cực Đạo Bất Diệt Thánh Giáp",
        slot: "giap",
        rarity: "cuc_dao",
        reqRealm: 11,
        currency: "hon_nguyen",
        stats: { mau: 4500000000, phongThu: 120000000, khangPhep: 50000000 },
        price: 18000,
        sellPrice: 6000,
        icon: "🛡️",
        desc: "Thần giáp Cực Đạo tôi luyện từ cốt tủy thần ma viễn cổ, lực phòng ngự vật lí đạt cảnh giới kim cương bất hoại."
    },
    {
        id: "armor_cuc_dao_02",
        name: "Cực Đạo Hỗn Độn Tiên Bào",
        slot: "giap",
        rarity: "cuc_dao",
        reqRealm: 11,
        currency: "hon_nguyen",
        stats: { mau: 4500000000, phongThu: 50000000, khangPhep: 120000000 },
        price: 18000,
        sellPrice: 6000,
        icon: "👘",
        desc: "Đạo bào Cực Đạo đan dệt từ tơ trời hỗn độn, hấp thu và triệt tiêu toàn bộ uy áp phép thuật cấm chú."
    },

    // ================= VŨ KHÍ (WEAPON) - SẮP XẾP TỪ THẤP ĐẾN CAO =================
    {
        id: "weapon_01",
        name: "Thiết Kiếm Rỉ Sét",
        slot: "vukhi",
        rarity: "pham",
        reqRealm: 0,
        stats: { vatLi: 12, phep: 5, baoKich: 2 },
        price: 100,
        sellPrice: 30,
        icon: "🗡️",
        desc: "Thanh kiếm sắt phàm trần rỉ sét, vũ khí cơ bản nhất."
    },
    {
        id: "weapon_02",
        name: "Thanh Phong Linh Kiếm",
        slot: "vukhi",
        rarity: "linh",
        reqRealm: 0,
        stats: { vatLi: 38, phep: 20, baoKich: 5 },
        price: 500,
        sellPrice: 180,
        icon: "⚔️",
        desc: "Lưỡi kiếm sáng loáng tụ khí thanh phong, chém sắt như chém bùn."
    },
    {
        id: "weapon_03",
        name: "Xích Viêm Pháp Trượng",
        slot: "vukhi",
        rarity: "linh",
        reqRealm: 1,
        stats: { vatLi: 25, phep: 95, baoKich: 8 },
        price: 1800,
        sellPrice: 600,
        icon: "🪄",
        desc: "Trượng gắn ngọc lửa xích viêm, khuếch đại uy lực thần thông phép thuật."
    },
    {
        id: "weapon_04",
        name: "Bích Lạc Đoạn Thủy Kiếm",
        slot: "vukhi",
        rarity: "huyen",
        reqRealm: 2,
        stats: { vatLi: 420, phep: 380, baoKich: 10 },
        price: 6500,
        sellPrice: 2200,
        icon: "🗡️",
        desc: "Một kiếm chém đứt dòng nước cuồn cuộn của linh hải, sắc bén vô song."
    },
    {
        id: "weapon_05",
        name: "Cổ Đảo Trảm Ma Đao",
        slot: "vukhi",
        rarity: "huyen",
        reqRealm: 3,
        stats: { vatLi: 1200, phep: 850, baoKich: 14 },
        price: 25000,
        sellPrice: 8500,
        icon: "🪓",
        desc: "Thanh đao nặng ngàn cân lưu lại từ di tích tiên đảo diệt ma."
    },
    {
        id: "weapon_06",
        name: "Nguyên Linh Thiên Mộc Trượng",
        slot: "vukhi",
        rarity: "dia",
        reqRealm: 4,
        stats: { vatLi: 1500, phep: 3200, baoKich: 16 },
        price: 85000,
        sellPrice: 30000,
        icon: "🌿",
        desc: "Gọt đẽo từ tâm mộc nguyên linh, thi triển pháp thuật như thần trợ."
    },
    {
        id: "weapon_dai_hoang",
        name: "Đại Hoang Chiến Kích",
        slot: "vukhi",
        rarity: "dia",
        reqRealm: 4,
        stats: { vatLi: 950, phep: 200, baoKich: 18 },
        price: 110000,
        sellPrice: 40000,
        icon: "🔱",
        desc: "Chiến kích rèn từ dị cốt hoang thú thượng cổ, tỏa ra khí tức hồng hoang áp chế vạn vật."
    },
    {
        id: "weapon_07",
        name: "Tạo Hóa Lôi Thần Kiếm",
        slot: "vukhi",
        rarity: "dia",
        reqRealm: 5,
        stats: { vatLi: 2200, phep: 2400, baoKich: 18 },
        price: 280000,
        sellPrice: 95000,
        icon: "⚡",
        desc: "Kiếm dẫn thiên lôi giáng thế, chém ra lôi đình vạn dặm."
    },
    {
        id: "weapon_11",
        name: "Thiên Linh Cổ Sáo",
        slot: "vukhi",
        rarity: "tien",
        reqRealm: 5,
        stats: { vatLi: 1600, phep: 4500, baoKich: 22 },
        price: 350000,
        sellPrice: 120000,
        icon: "🎵",
        desc: "Cổ sáo Tiên Phẩm tinh xảo ngưng tụ thanh âm đại đạo, tấu lên khúc nhạc kinh thiên động địa."
    },
    {
        id: "weapon_08",
        name: "Thông Thiên Trảm Hư Kích",
        slot: "vukhi",
        rarity: "thien",
        reqRealm: 6,
        stats: { vatLi: 75000, phep: 65000, baoKich: 26 },
        price: 1100000,
        sellPrice: 400000,
        icon: "🔱",
        desc: "Trọng kích xé toạc tầng mây thông thiên, uy áp nghiền nát hư không."
    },
    {
        id: "weapon_09",
        name: "Ngọc Hư Vạn Kiếm Quy Tông",
        slot: "vukhi",
        rarity: "thien",
        reqRealm: 7,
        stats: { vatLi: 190000, phep: 210000, baoKich: 32 },
        price: 4000000,
        sellPrice: 1500000,
        icon: "🌌",
        desc: "Tiên kiếm ngọc điện trấn phái, xuất vỏ vạn kiếm đều quy phục."
    },
    {
        id: "weapon_tien_kiem",
        name: "Lăng Tiêu Trảm Tiên Kiếm",
        slot: "vukhi",
        rarity: "tien",
        reqRealm: 7,
        stats: { vatLi: 260000, phep: 290000, baoKich: 36 },
        price: 6500000,
        sellPrice: 2500000,
        icon: "✨",
        desc: "Tiên kiếm lưu truyền từ cấm địa Thái Sơ, vạch phá hư không, trảm diệt quần tiên."
    },
    {
        id: "weapon_10",
        name: "Hỗn Độn Chí Tôn Hoàng Kiếm",
        slot: "vukhi",
        rarity: "thien",
        reqRealm: 8,
        stats: { vatLi: 580000, phep: 620000, baoKich: 42 },
        price: 15000000,
        sellPrice: 6000000,
        icon: "👑",
        desc: "Thần kiếm hỗn độn tối thượng chém phá hư vô, chư thiên cúng bái."
    },
    {
        id: "weapon_thanh_kiem",
        name: "Hỗn Độn Thái Sơ Thánh Kiếm",
        slot: "vukhi",
        rarity: "thanh",
        reqRealm: 8,
        stats: { vatLi: 1100000, phep: 1200000, baoKich: 50 },
        price: 120000000,
        sellPrice: 40000000,
        icon: "⚔️",
        desc: "Thánh kiếm tối cao ngưng tụ lúc vũ trụ sơ khai, ẩn chứa hỗn độn chân lý, nhất kiếm định càn khôn."
    },
    {
        id: "weapon_tien_01",
        name: "Thái Hư Trảm Tiên Kiếm",
        slot: "vukhi",
        rarity: "tien",
        reqRealm: 9,
        stats: { vatLi: 3200000, phep: 3000000, baoKich: 55 },
        price: 350000000,
        sellPrice: 120000000,
        icon: "✨",
        desc: "Thần binh đúc từ tinh hoa nhật nguyệt thiên ngoại, xé rách màng bọc hư không."
    },
    {
        id: "weapon_thanh_01",
        name: "Vô Cực Tinh Thuần Thánh Kiếm",
        slot: "vukhi",
        rarity: "thanh",
        reqRealm: 10,
        stats: { vatLi: 15000000, phep: 6500000, baoKich: 65 },
        price: 500000000,
        sellPrice: 250000000,
        icon: "🌟",
        desc: "Thánh kiếm nắm giữ cội nguồn đại đạo, một chém trảm dứt vạn vì tinh tú."
    },
    {
        id: "weapon_dai_dao_chi_ton",
        name: "Chí Cao Vĩnh Hằng Luân Hồi Kiếm",
        slot: "vukhi",
        rarity: "thanh",
        reqRealm: 11,
        stats: { vatLi: 40000000, phep: 40000000, baoKich: 75 },
        price: 3000000000,
        sellPrice: 1000000000,
        icon: "👑",
        desc: "Vũ khí sinh ra từ ý niệm bản nguyên của đại đạo, nhất niệm sinh thế giới, nhất niệm diệt quần tiên."
    },

    {
        id: "weapon_phep_thien_01",
        name: "Thông Thiên Ngũ Hành Phiến",
        slot: "vukhi",
        rarity: "thien",
        reqRealm: 6,
        stats: { vatLi: 35000, phep: 115000, baoKich: 28 },
        price: 1250000,
        sellPrice: 450000,
        icon: "🪭",
        desc: "Bảo phiến luyện từ lông Phượng Hoàng thông thiên, phất tay dẫn động ngũ hành linh lực cuộn trào."
    },
    {
        id: "weapon_phep_tien_01",
        name: "Thái Hư Hỗn Độn Kính",
        slot: "vukhi",
        rarity: "tien",
        reqRealm: 9,
        stats: { vatLi: 1200000, phep: 4800000, baoKich: 58 },
        price: 360000000,
        sellPrice: 125000000,
        icon: "🪞",
        desc: "Gương cổ phản chiếu vạn giới hư không, ngưng tụ đạo tắc phép thuật thiên ngoại bắn nát chư thiên."
    },
    {
        id: "weapon_phep_thanh_01",
        name: "Chí Tôn Vạn Tinh Trượng",
        slot: "vukhi",
        rarity: "thanh",
        reqRealm: 10,
        stats: { vatLi: 4500000, phep: 18500000, baoKich: 68 },
        price: 520000000,
        sellPrice: 260000000,
        icon: "🪄",
        desc: "Pháp trượng ngưng tụ ánh sáng của ức vạn tinh thần, một niệm thi triển cấm thuật hủy thiên diệt địa."
    },
    {
        id: "weapon_phep_thanh_02",
        name: "Đại Đạo Hư Vô Thần Châu",
        slot: "vukhi",
        rarity: "thanh",
        reqRealm: 11,
        stats: { vatLi: 10000000, phep: 52000000, baoKich: 80 },
        price: 3200000000,
        sellPrice: 1100000000,
        icon: "🔮",
        desc: "Viên thần châu khởi nguyên chứa đựng vạn pháp quy tắc vũ trụ, uy lực phép thuật đạt tới cực cảnh."
    },
    {
        id: "weapon_cuc_dao_vat_li",
        name: "Cực Đạo Tru Tiên Thần Kiếm",
        slot: "vukhi",
        rarity: "cuc_dao",
        reqRealm: 11,
        currency: "hon_nguyen",
        stats: { vatLi: 120000000, phep: 25000000, baoKich: 85 },
        price: 15000,
        sellPrice: 5000,
        icon: "⚔️",
        desc: "Thần kiếm Cực Đạo trảm phá càn khôn vũ trụ, sát khí ngập trời, chém đứt sinh cơ của vạn vật."
    },
    {
        id: "weapon_cuc_dao_phep",
        name: "Cực Đạo Hỗn Độn Thần Trượng",
        slot: "vukhi",
        rarity: "cuc_dao",
        reqRealm: 11,
        currency: "hon_nguyen",
        stats: { vatLi: 25000000, phep: 135000000, baoKich: 85 },
        price: 15000,
        sellPrice: 5000,
        icon: "🪄",
        desc: "Pháp trượng Cực Đạo hiệu triệu quy tắc bản nguyên hỗn độn, dẫn dắt vạn đạo lôi hỏa diệt thế."
    },

    // ================= ĐAN DƯỢC & TIÊU HAO - SẮP XẾP TỪ THẤP ĐẾN CAO =================
    {
        id: "pill_tay_tuy",
        name: "Tẩy Tủy Đan",
        slot: "dan_duoc",
        rarity: "dia",
        reqRealm: 0,
        isResetPill: true,
        price: 5000,
        sellPrice: 1500,
        icon: "🧪",
        desc: "Nghịch thiên linh đan Địa Phẩm cực hiếm, ngưng tụ từ thiên địa linh tủy vạn năm. Rửa tủy phạt mao, thu hồi toàn bộ điểm tiềm năng để phân bổ lại từ đầu."
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
        desc: "Pháp bảo khắc ấn thiên đạo pháp tắc, cho phép đạo hữu đặt lại đạo hiệu danh xưng của nhân vật trên Thiên Đạo Bia."
    },
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
        id: "pill_cuu_dieu",
        name: "Cửu Diệu Bất Tử Dược",
        slot: "dan_duoc",
        rarity: "thien",
        reqRealm: 7,
        tuViGain: 1200000,
        price: 1500000,
        sellPrice: 500000,
        icon: "🥀",
        desc: "Thần dược sinh trưởng nơi cấm địa sinh mệnh, nhỏ một giọt cũng đủ nghịch thiên cải mệnh, tăng 1,200,000 Tu Vi."
    },
    {
        id: "pill_thanh_chuyen",
        name: "Cửu Chuyển Thánh Đan",
        slot: "dan_duoc",
        rarity: "thanh",
        reqRealm: 8,
        tuViGain: 8000000,
        price: 80000000,
        sellPrice: 25000000,
        icon: "💊",
        desc: "Thánh dược luyện hóa từ vạn đạo pháp tắc, đoạt thiên địa tạo hóa, tăng 8,000,000 Tu Vi."
    },
    {
        id: "pill_thanh_01",
        name: "Vĩnh Hằng Thánh Đan",
        slot: "dan_duoc",
        rarity: "thanh",
        reqRealm: 9,
        tuViGain: 150000000,
        price: 500000000,
        sellPrice: 150000000,
        icon: "💠",
        desc: "Thánh dược ngưng tụ toàn bộ sinh cơ của một tinh hệ, lập tức tăng 150,000,000 Tu Vi."
    },
    {
        id: "pill_tinh_tu",
        name: "Cửu Diệu Thần Tinh Đan",
        slot: "dan_duoc",
        rarity: "thanh",
        reqRealm: 10,
        tuViGain: 800000000,
        price: 2000000000,
        sellPrice: 600000000,
        icon: "🪐",
        desc: "Đan dược cô đọng tinh hoa năng lượng của chín vì tinh tú, lập tức gia tăng 800,000,000 Tu Vi."
    },
    {
        id: "pill_khoi_nguyen_thanh_dan",
        name: "Đại Đạo Khởi Nguyên Đan",
        slot: "dan_duoc",
        rarity: "thanh",
        reqRealm: 11,
        tuViGain: 3500000000,
        price: 10000000000,
        sellPrice: 3000000000,
        icon: "⚛️",
        desc: "Thánh đan đoạt thiên địa tạo hóa cội nguồn, lập tức gia tăng 3,500,000,000 Tu Vi."
    },

    // ================= ĐAN DƯỢC ĐẠI ĐẠO TỐI CAO (CẢNH GIỚI ĐẠI ĐẠO CHÍ CAO VÔ THƯỢNG) =================
    {
        id: "pill_hon_don_ban_nguyen",
        name: "Hỗn Độn Bản Nguyên Đan",
        slot: "dan_duoc",
        rarity: "thanh",
        reqRealm: 11, // Yêu cầu Đại Đạo Chí Cao Vô Thượng
        tuViGain: 15000000000, // +15 Tỷ Tu Vi
        price: 35000000000, // 35 Tỷ Linh Thạch
        sellPrice: 10000000000,
        icon: "🔮",
        desc: "Đan dược ngưng tụ từ bản nguyên hỗn độn sơ khai, ẩn chứa lực lượng thiên địa phân khai, lập tức gia tăng 15 Tỷ Tu Vi."
    },
    {
        id: "pill_thai_so_than_dan",
        name: "Thái Sơ Vô Cực Thần Đan",
        slot: "dan_duoc",
        rarity: "thanh",
        reqRealm: 11, // Yêu cầu Đại Đạo Chí Cao Vô Thượng
        tuViGain: 60000000000, // +60 Tỷ Tu Vi
        price: 120000000000, // 120 Tỷ Linh Thạch
        sellPrice: 35000000000,
        icon: "🌌",
        desc: "Luyện hóa từ khí tức Thái Sơ ngàn vạn năm, khai thông thần hải vô tận, lập tức gia tăng 60 Tỷ Tu Vi cho bậc Chí Tôn."
    },
    {
        id: "pill_bat_hu_luan_hoi",
        name: "Vĩnh Hằng Bất Hủ Luân Hồi Đan",
        slot: "dan_duoc",
        rarity: "thanh",
        reqRealm: 11, // Yêu cầu Đại Đạo Chí Cao Vô Thượng
        tuViGain: 500000000000, // +500 Tỷ Tu Vi
        price: 500000000000, // 500 Tỷ Linh Thạch
        sellPrice: 150000000000,
        icon: "⚛️",
        desc: "Nghịch chuyển luân hồi vĩnh hằng, hấp thu trọn vẹn quy tắc đại đạo tối cao, lập tức gia tăng 500 Tỷ Tu Vi."
    },
    {
        id: "item_tower_ticket",
        name: "Lệnh Bài Hư Không",
        slot: "dan_duoc",
        rarity: "tien",
        reqRealm: 0,
        currency: "hon_nguyen",
        price: 5000, // 5 Nghìn Hỗn Nguyên Thạch
        sellPrice: 1000, // 1 Nghìn Hỗn Nguyên Thạch
        icon: "🎫",
        desc: "Lệnh bài thần bí phong ấn không gian chi lực, dùng để khiêu chiến Hư Không Tháp. Mua bằng Hỗn Nguyên Thạch (5.000 🌀). Khi dùng tăng thêm 1 Lệnh Bài Hư Không (không giới hạn số lượng)."
    },
    {
        id: "pill_vo_cuc_dai_dao",
        name: "Vô Cực Đại Đạo Bất Hủ Thần Đan",
        slot: "dan_duoc",
        rarity: "cuc_dao",
        reqRealm: 11, // Cảnh giới Vô Cực / Đại Đạo Chí Cao
        currency: "hon_nguyen",
        tinhNguyenGain: 1000,
        price: 25000, // 25.000 Hỗn Nguyên Thạch
        sellPrice: 8000,
        icon: "🌌",
        desc: "Thần đan nghịch thiên luyện hóa từ quy tắc căn nguyên của vạn giới hư vô. Khi dùng trực tiếp gia tăng 1.000 điểm Tinh Nguyên đại đạo."
    },
    {
        id: "pill_chung_dao_tinh_nguyen",
        name: "Chứng Đạo Tinh Nguyên",
        slot: "dan_duoc",
        rarity: "cuc_dao",
        reqRealm: 11,
        notForSale: true,
        price: 0,
        sellPrice: 10000,
        rateGain: 10,
        icon: "💠",
        desc: "Tinh hoa ngưng tụ từ thiên địa chi lực sau khi thông qua khảo nghiệm Ải 23: Vấn Thiên Địa (Chiến lợi phẩm độc quyền rơi từ Ải 23, không bán tại Bách Bảo Các). Khi phục dụng vĩnh viễn gia tăng +10% tỉ lệ độ kiếp thành công (cộng dồn vĩnh viễn, không bị mất sau khi đột phá)."
    },
    {
        id: "pill_luan_dao_tinh_nguyen",
        name: "Luận Đạo Tinh Nguyên",
        slot: "dan_duoc",
        rarity: "cuc_dao",
        reqRealm: 0,
        currency: "hon_nguyen",
        price: 250000,
        sellPrice: 80000,
        rateGain: 1,
        icon: "🔮",
        desc: "Tinh hoa ngộ đạo đúc kết từ vạn cổ luận biến quy tắc đại đạo (bán tại Bách Bảo Các với giá 250.000 Hỗn Nguyên). Khi phục dụng vĩnh viễn gia tăng +1% tỉ lệ độ kiếp thành công (cộng dồn vĩnh viễn, không bị mất sau khi đột phá)."
    }
];

class ItemSystem {
    static getItemById(id) {
        return ITEM_DATABASE.find(item => item.id === id) || null;
    }

    static getItemsBySlot(slot) {
        return ITEM_DATABASE.filter(item => item.slot === slot);
    }

    static getRarity(rarityKey) {
        return RARITY_INFO[rarityKey] || RARITY_INFO.pham;
    }

    /**
     * So sánh 2 vật phẩm từ THẤP đến CAO
     * Ưu tiên: Cảnh giới yêu cầu (reqRealm) -> Phẩm cấp (rarity) -> Giá tiền (price)
     */
    static compareItems(a, b) {
        if (!a && !b) return 0;
        if (!a) return 1;
        if (!b) return -1;

        // 1. Cảnh giới yêu cầu từ thấp đến cao
        const realmA = a.reqRealm !== undefined ? a.reqRealm : 0;
        const realmB = b.reqRealm !== undefined ? b.reqRealm : 0;
        if (realmA !== realmB) return realmA - realmB;

        // 2. Phẩm cấp từ thấp đến cao
        const rA = RARITY_ORDER[a.rarity] !== undefined ? RARITY_ORDER[a.rarity] : 0;
        const rB = RARITY_ORDER[b.rarity] !== undefined ? RARITY_ORDER[b.rarity] : 0;
        if (rA !== rB) return rA - rB;

        // 3. Giá tiền từ thấp đến cao
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        if (priceA !== priceB) return priceA - priceB;

        // 4. Theo tên nếu bằng nhau
        return (a.name || "").localeCompare(b.name || "");
    }

    /**
     * Lấy các mặt hàng bày bán trong Bách Bảo Các tương ứng cảnh giới
     */
    static getShopItems(playerRealm) {
        return ITEM_DATABASE.filter(item => {
            return item.reqRealm <= playerRealm + 1;
        }).sort((a, b) => this.compareItems(a, b));
    }
}

if (typeof window !== "undefined") {
    window.RARITY_ORDER = RARITY_ORDER;
    window.RARITY_INFO = RARITY_INFO;
    window.ITEM_DATABASE = ITEM_DATABASE;
    window.ItemSystem = ItemSystem;
}
