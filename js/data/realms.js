/**
 * HỆ THỐNG CẢNH GIỚI TU TIÊN
 * 9 Đại Cảnh Giới, mỗi cảnh giới 10 tầng (Tầng 1 -> Tầng 9 -> Đỉnh Phong)
 * Mỗi lần đột phá tăng 1 tầng: nhận 4 ĐIỂM TIỀM NĂNG
 */

const REALM_DATA = [
    {
        id: "toi_khi",
        name: "Tôi Khí",
        hanzi: "淬气",
        color: "#a3b899",
        baseTuVi: 100,
        tuViGrowth: 1.35,
        afkExpBase: 2,
        desc: "Luyện thối cốt nhục, bài trừ tạp chất trong cơ thể, bước đầu cảm ứng linh khí thiên địa."
    },
    {
        id: "ngung_khi",
        name: "Ngưng Khí",
        hanzi: "凝气",
        color: "#4ecca3",
        baseTuVi: 350,
        tuViGrowth: 1.4,
        afkExpBase: 5,
        desc: "Dẫn khí nhập thể, ngưng tụ thành khí tuyền trong đan điền, linh lực vận chuyển thông suốt."
    },
    {
        id: "linh_hai",
        name: "Linh Hải",
        hanzi: "灵海",
        color: "#00adb5",
        baseTuVi: 1200,
        tuViGrowth: 1.45,
        afkExpBase: 12,
        desc: "Khí hóa thành dịch, đan điền mở rộng mênh mông như biển linh dịch, pháp lực dồi dào."
    },
    {
        id: "tao_dao",
        name: "Tạo Đảo",
        hanzi: "造岛",
        color: "#3f72af",
        baseTuVi: 4500,
        tuViGrowth: 1.5,
        afkExpBase: 30,
        desc: "Giữa biển linh hải cô đọng ngưng kết thành tiên đảo, đạo cơ vững như bàn thạch."
    },
    {
        id: "nguyen_linh_thu",
        name: "Nguyên Linh Thụ",
        hanzi: "元灵树",
        color: "#16c79a",
        baseTuVi: 16000,
        tuViGrowth: 1.55,
        afkExpBase: 75,
        desc: "Trên tiên đảo đâm chồi cổ thụ thần linh, hấp thu tinh hoa nhật nguyệt, sinh sôi bất diệt."
    },
    {
        id: "tao_hoa_dai",
        name: "Tạo Hóa Đài",
        hanzi: "造化台",
        color: "#f39c12",
        baseTuVi: 60000,
        tuViGrowth: 1.6,
        afkExpBase: 180,
        desc: "Dưới tàng cây lập nên đài thần tạo hóa, lĩnh ngộ thiên địa quy tắc, chuyển hóa càn khôn."
    },
    {
        id: "thong_thien_tru",
        name: "Thông Thiên Trụ",
        hanzi: "通天柱",
        color: "#e056fd",
        baseTuVi: 220000,
        tuViGrowth: 1.65,
        afkExpBase: 450,
        desc: "Đột phá trần thế, ngưng dựng cột thần thông thiên chống đỡ vòm trời đạo giới."
    },
    {
        id: "ngoc_dien",
        name: "Ngọc Điện",
        hanzi: "玉殿",
        color: "#f1c40f",
        baseTuVi: 850000,
        tuViGrowth: 1.7,
        afkExpBase: 1200,
        desc: "Trên đỉnh thông thiên xây dựng tiên điện bạch ngọc, xuất thần nhập hóa, siêu thoát phàm tục."
    },
    {
        id: "dinh_cap_ngai",
        name: "Đỉnh Cấp Ngai",
        hanzi: "顶级王座",
        color: "#e74c3c",
        baseTuVi: 3500000,
        tuViGrowth: 1.75,
        afkExpBase: 3000,
        desc: "Ngự trên vương tọa cửu tiêu, chưởng quản vạn giới sinh linh, độc bộ thiên hạ, trường sinh bất tử."
    },
    {
        id: "vo_thuong_lo",
        name: "Vô Thượng Lộ",
        hanzi: "无上路",
        color: "#ff007f",
        baseTuVi: 15000000,
        tuViGrowth: 1.5,
        afkExpBase: 8000,
        reqStageId: "stage_17", // Bắt buộc đánh bại Ải Vấn Đạo mới đột phá được lên Vô Thượng Lộ
        desc: "Đạp lên con đường vô thượng xưa nay chưa từng có ai đặt chân, siêu việt quy tắc phàm trần, vô địch thế gian."
    },
    {
        id: "van_vi_tinh_tu",
        name: "Vạn Vì Tinh Tú",
        hanzi: "万辰星宿",
        color: "#00f2fe",
        baseTuVi: 60000000,
        tuViGrowth: 1.55,
        afkExpBase: 25000,
        reqStageId: "stage_18", // Bắt buộc đánh bại Ải 18 mới đột phá được lên Vạn Vì Tinh Tú
        desc: "Dung nhập vạn vì tinh tú trên dải ngân hà, mỗi cử động dẫn động tinh thần chi lực, vô cùng vô tận."
    },
    {
        id: "dai_dao_chi_cao",
        name: "Đại Đạo Chí Cao Vô Thượng",
        hanzi: "至高无上大道",
        color: "#ffd700",
        baseTuVi: 250000000,
        tuViGrowth: 1.6,
        afkExpBase: 100000,
        reqStageId: "stage_19", // Bắt buộc đánh bại Ải 19 mới đột phá được lên Đại Đạo Chí Cao
        desc: "Hóa thân thành chính đại đạo tối cao của vũ trụ, vạn vật do tâm sinh, vạn pháp do ý diệt, vĩnh hằng bất diệt."
    }
];

const TIER_NAMES = [
    "Tầng 1", "Tầng 2", "Tầng 3", "Tầng 4", "Tầng 5",
    "Tầng 6", "Tầng 7", "Tầng 8", "Tầng 9", "Đỉnh Phong"
];

// Điểm tiềm năng nhận được mỗi khi thăng 1 tầng tu vi
const STAT_POINTS_PER_TIER = 4;

class RealmSystem {
    static getRealmCount() {
        return REALM_DATA.length;
    }

    static getTierCount() {
        return TIER_NAMES.length;
    }

    static getRealm(realmIndex) {
        return REALM_DATA[Math.min(realmIndex, REALM_DATA.length - 1)];
    }

    /**
     * Lấy tên tầng tu vi.
     * Từ Vô Thượng Lộ (realmIndex >= 9) hoặc khi tierIndex >= 10: Tầng tăng vô hạn (Tầng 1, Tầng 2, ..., Tầng 100...)
     */
    static getTierName(tierIndex, realmIndex = 0) {
        if (realmIndex >= 9 || tierIndex >= 10) {
            return `Tầng ${tierIndex + 1}`;
        }
        return TIER_NAMES[Math.min(tierIndex, TIER_NAMES.length - 1)];
    }

    static getFullRealmTitle(realmIndex, tierIndex) {
        const realm = this.getRealm(realmIndex);
        const tier = this.getTierName(tierIndex, realmIndex);
        return `${realm.name} - ${tier}`;
    }

    static getRealmColor(realmIndex) {
        const realm = this.getRealm(realmIndex);
        return realm.color;
    }

    /**
     * Lấy ID ải bắt buộc phải vượt để đột phá lên cảnh giới mục tiêu
     */
    static getBreakthroughReqStage(targetRealmIndex) {
        const realm = REALM_DATA[targetRealmIndex];
        return realm ? (realm.reqStageId || null) : null;
    }

    /**
     * Tính toán tổng Tu Vi cần thiết để đột phá tầng hiện tại
     * Đảm bảo an toàn không bị tràn số lũy thừa JS khi tầng lên rất cao
     */
    static getMaxTuVi(realmIndex, tierIndex) {
        const realm = this.getRealm(realmIndex);
        const growth = realm.tuViGrowth || 1.5;
        if (tierIndex <= 15) {
            const factor = Math.pow(growth, tierIndex);
            return Math.floor(realm.baseTuVi * factor);
        } else {
            // Trên tầng 15 tăng trưởng tuyến tính lũy tiến bền vững
            const at15 = realm.baseTuVi * Math.pow(growth, 15);
            return Math.floor(at15 * (1 + (tierIndex - 15) * 0.25));
        }
    }

    /**
     * Tính tốc độ thu thập tu vi tự nhiên khi đả tọa (mỗi giây)
     */
    static getAfkTuViRate(realmIndex, tierIndex) {
        const realm = this.getRealm(realmIndex);
        return Math.floor(realm.afkExpBase * (1 + tierIndex * 0.15));
    }

    /**
     * So sánh xem cảnh giới A có đạt tối thiểu cảnh giới B hay không
     */
    static isRealmSufficient(playerRealm, playerTier, reqRealm, reqTier = 0) {
        if (playerRealm > reqRealm) return true;
        if (playerRealm === reqRealm && playerTier >= reqTier) return true;
        return false;
    }

    /**
     * Tổng số tầng đã đạt (dùng để so sánh độ sâu tu vi và tính base stats)
     */
    static getAbsoluteTier(realmIndex, tierIndex) {
        return realmIndex * 10 + tierIndex;
    }
}

// Xuất ra môi trường trình duyệt
if (typeof window !== "undefined") {
    window.REALM_DATA = REALM_DATA;
    window.TIER_NAMES = TIER_NAMES;
    window.STAT_POINTS_PER_TIER = STAT_POINTS_PER_TIER;
    window.RealmSystem = RealmSystem;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { REALM_DATA, TIER_NAMES, STAT_POINTS_PER_TIER, RealmSystem };
}
