import { BigNumber, toBigNumber } from "../types/bignum";
import { RealmConfig } from "../types/realm";

/**
 * Danh Sách 12 Đại Cảnh Giới Cốt Truyện và Cảnh Giới Vô Cực
 */
export const REALM_DATABASE: readonly RealmConfig[] = [
    {
        id: "toi_khi",
        index: 0,
        name: "Tôi Khí",
        hanzi: "淬气",
        color: "#a3b899",
        baseTuVi: toBigNumber(100),
        tuViGrowth: 1.35,
        afkExpBase: toBigNumber(2),
        desc: "Luyện thối cốt nhục, bài trừ tạp chất trong cơ thể, bước đầu cảm ứng linh khí thiên địa."
    },
    {
        id: "ngung_khi",
        index: 1,
        name: "Ngưng Khí",
        hanzi: "凝气",
        color: "#4ecca3",
        baseTuVi: toBigNumber(350),
        tuViGrowth: 1.40,
        afkExpBase: toBigNumber(5),
        desc: "Dẫn khí nhập thể, ngưng tụ thành khí tuyền trong đan điền, linh lực vận chuyển thông suốt."
    },
    {
        id: "linh_hai",
        index: 2,
        name: "Linh Hải",
        hanzi: "灵海",
        color: "#00adb5",
        baseTuVi: toBigNumber(1200),
        tuViGrowth: 1.45,
        afkExpBase: toBigNumber(12),
        desc: "Khí hóa thành dịch, đan điền mở rộng mênh mông như biển linh dịch, pháp lực dồi dào."
    },
    {
        id: "tao_dao",
        index: 3,
        name: "Tạo Đảo",
        hanzi: "造岛",
        color: "#3f72af",
        baseTuVi: toBigNumber(4500),
        tuViGrowth: 1.50,
        afkExpBase: toBigNumber(30),
        desc: "Giữa biển linh hải cô đọng ngưng kết thành tiên đảo, đạo cơ vững như bàn thạch."
    },
    {
        id: "nguyen_linh_thu",
        index: 4,
        name: "Nguyên Linh Thụ",
        hanzi: "元灵树",
        color: "#16c79a",
        baseTuVi: toBigNumber(16000),
        tuViGrowth: 1.55,
        afkExpBase: toBigNumber(75),
        desc: "Trên tiên đảo đâm chồi cổ thụ thần linh, hấp thu tinh hoa nhật nguyệt, sinh sôi bất diệt."
    },
    {
        id: "tao_hoa_dai",
        index: 5,
        name: "Tạo Hóa Đài",
        hanzi: "造化台",
        color: "#f39c12",
        baseTuVi: toBigNumber(60000),
        tuViGrowth: 1.60,
        afkExpBase: toBigNumber(180),
        desc: "Dưới tàng cây lập nên đài thần tạo hóa, lĩnh ngộ thiên địa quy tắc, chuyển hóa càn khôn."
    },
    {
        id: "thong_thien_tru",
        index: 6,
        name: "Thông Thiên Trụ",
        hanzi: "通天柱",
        color: "#e056fd",
        baseTuVi: toBigNumber(220000),
        tuViGrowth: 1.65,
        afkExpBase: toBigNumber(450),
        desc: "Đột phá trần thế, ngưng dựng cột thần thông thiên chống đỡ vòm trời đạo giới."
    },
    {
        id: "ngoc_dien",
        index: 7,
        name: "Ngọc Điện",
        hanzi: "玉殿",
        color: "#f1c40f",
        baseTuVi: toBigNumber(850000),
        tuViGrowth: 1.70,
        afkExpBase: toBigNumber(1200),
        desc: "Trên đỉnh thông thiên xây dựng tiên điện bạch ngọc, xuất thần nhập hóa, siêu thoát phàm tục."
    },
    {
        id: "dinh_cap_ngai",
        index: 8,
        name: "Đỉnh Cấp Ngai",
        hanzi: "顶级王座",
        color: "#e74c3c",
        baseTuVi: toBigNumber(3500000),
        tuViGrowth: 1.75,
        afkExpBase: toBigNumber(3000),
        desc: "Ngự trên vương tọa cửu tiêu, chưởng quản vạn giới sinh linh, độc bộ thiên hạ, trường sinh bất tử."
    },
    {
        id: "vo_thuong_lo",
        index: 9,
        name: "Vô Thượng Lộ",
        hanzi: "无上路",
        color: "#ff007f",
        baseTuVi: toBigNumber(15000000),
        tuViGrowth: 1.50,
        afkExpBase: toBigNumber(8000),
        reqStageId: "stage_17",
        desc: "Đạp lên con đường vô thượng xưa nay chưa từng có ai đặt chân, siêu việt quy tắc phàm trần."
    },
    {
        id: "van_vi_tinh_tu",
        index: 10,
        name: "Vạn Vì Tinh Tú",
        hanzi: "万辰星宿",
        color: "#00f2fe",
        baseTuVi: toBigNumber(60000000),
        tuViGrowth: 1.55,
        afkExpBase: toBigNumber(25000),
        reqStageId: "stage_18",
        desc: "Dung nhập vạn vì tinh tú trên dải ngân hà, mỗi cử động dẫn động tinh thần chi lực vô tận."
    },
    {
        id: "dai_dao_chi_cao",
        index: 11,
        name: "Đại Đạo Chí Cao Vô Thượng",
        hanzi: "至高无上大道",
        color: "#ffd700",
        baseTuVi: toBigNumber(250000000),
        tuViGrowth: 1.60,
        afkExpBase: toBigNumber(100000),
        reqStageId: "stage_19",
        desc: "Hóa thân thành chính đại đạo tối cao của vũ trụ, vạn vật do tâm sinh, vạn pháp do ý diệt."
    }
];

export const TIER_NAMES: readonly string[] = [
    "Tầng 1", "Tầng 2", "Tầng 3", "Tầng 4", "Tầng 5",
    "Tầng 6", "Tầng 7", "Tầng 8", "Tầng 9", "Đỉnh Phong"
];

export const STAT_POINTS_PER_TIER = 4;

export class RealmSystem {
    static getRealmCount(): number {
        return REALM_DATABASE.length;
    }

    static getTierCount(): number {
        return TIER_NAMES.length;
    }

    static getRealm(realmIndex: number): RealmConfig {
        const idx = Math.max(0, Math.min(realmIndex, REALM_DATABASE.length - 1));
        return REALM_DATABASE[idx];
    }

    static getTierName(tierIndex: number, realmIndex = 0): string {
        if (realmIndex >= 9 || tierIndex >= 10) {
            return `Tầng ${tierIndex + 1}`;
        }
        const idx = Math.max(0, Math.min(tierIndex, TIER_NAMES.length - 1));
        return TIER_NAMES[idx];
    }

    static getFullRealmTitle(realmIndex: number, tierIndex: number, isVoCuc = false): string {
        if (isVoCuc) {
            return `🌌 Cảnh Giới Vô Cực - Tầng ${tierIndex + 1}`;
        }
        const realm = this.getRealm(realmIndex);
        const tier = this.getTierName(tierIndex, realmIndex);
        return `${realm.name} - ${tier}`;
    }

    static getRealmColor(realmIndex: number, isVoCuc = false): string {
        if (isVoCuc) return "#00f2fe";
        return this.getRealm(realmIndex).color;
    }

    static getBreakthroughReqStage(targetRealmIndex: number): string | null {
        const realm = REALM_DATABASE[targetRealmIndex];
        return realm ? (realm.reqStageId || null) : null;
    }

    /**
     * Tính toán tổng Tu Vi cần thiết để đột phá tầng hiện tại (BigNumber)
     */
    static getMaxTuVi(realmIndex: number, tierIndex: number, isVoCuc = false): BigNumber {
        // Cảnh giới Vô Cực (tính bằng Tinh Nguyên 🌌)
        if (isVoCuc) {
            const voCucTier = Math.max(1, tierIndex - 100);
            // Bắt đầu từ 100 Tinh Nguyên, tăng 1.15x mỗi tầng
            return toBigNumber(100).times(toBigNumber(1.15).pow(voCucTier)).floor();
        }

        const realm = this.getRealm(realmIndex);
        const growth = toBigNumber(realm.tuViGrowth || 1.5);
        
        // Sử dụng break_eternity.js: tính toán luỹ thừa tự nhiên không sợ tràn số
        if (tierIndex <= 15) {
            return realm.baseTuVi.times(growth.pow(tierIndex)).floor();
        } else {
            const at15 = realm.baseTuVi.times(growth.pow(15));
            const extra = toBigNumber(1).plus(toBigNumber(tierIndex - 15).times(0.25));
            return at15.times(extra).floor();
        }
    }

    /**
     * Tính tốc độ thu thập tu vi tự nhiên khi đả tọa (mỗi giây)
     */
    static getAfkTuViRate(realmIndex: number, tierIndex: number, isVoCuc = false): BigNumber {
        if (isVoCuc) {
            // Ở Cảnh Giới Vô Cực: 1.000.000 Tu Vi / s cơ bản
            const voCucTier = Math.max(1, tierIndex - 100);
            return toBigNumber(1000000).times(toBigNumber(1.10).pow(voCucTier)).floor();
        }
        const realm = this.getRealm(realmIndex);
        const multiplier = toBigNumber(1).plus(toBigNumber(tierIndex).times(0.15));
        return realm.afkExpBase.times(multiplier).floor();
    }

    static isRealmSufficient(playerRealm: number, playerTier: number, reqRealm: number, reqTier = 0): boolean {
        if (playerRealm > reqRealm) return true;
        if (playerRealm === reqRealm && playerTier >= reqTier) return true;
        return false;
    }
}
