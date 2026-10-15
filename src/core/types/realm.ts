import { BigNumber } from "./bignum";

/**
 * Định danh 12 Đại Cảnh Giới Cốt Truyện và Cảnh Giới Vô Cực Tối Cao
 */
export type RealmId =
    | "toi_khi"             // 1. Tôi Khí (淬气)
    | "ngung_khi"           // 2. Ngưng Khí (凝气)
    | "linh_hai"            // 3. Linh Hải (灵海)
    | "tao_dao"             // 4. Tạo Đảo (造岛)
    | "nguyen_linh_thu"     // 5. Nguyên Linh Thụ (元灵树)
    | "tao_hoa_dai"         // 6. Tạo Hóa Đài (造化台)
    | "thong_thien_tru"     // 7. Thông Thiên Trụ (通天柱)
    | "ngoc_dien"           // 8. Ngọc Điện (玉殿)
    | "dinh_cap_ngai"       // 9. Đỉnh Cấp Ngai (顶级王座)
    | "vo_thuong_lo"        // 10. Vô Thượng Lộ (无上路)
    | "van_vi_tinh_tu"      // 11. Vạn Vì Tinh Tú (万辰星宿)
    | "dai_dao_chi_cao"     // 12. Đại Đạo Chí Cao Vô Thượng (至高无上大道)
    | "vo_cuc";             // 13. Cảnh Giới Vô Cực (🌌 Tinh Nguyên Hư Vô)

/**
 * Cấu hình tham số cho từng Đại Cảnh Giới
 */
export interface RealmConfig {
    readonly id: RealmId;
    readonly index: number;          // Thứ tự cảnh giới (0 -> 11)
    readonly name: string;           // Tên thuần Việt (ví dụ: "Tôi Khí")
    readonly hanzi: string;          // Chữ Hán cổ (ví dụ: "淬气")
    readonly color: string;          // Mã màu nhận diện Hex/HSL
    readonly baseTuVi: BigNumber;    // Tu vi cơ bản cần cho tầng 1
    readonly tuViGrowth: number;     // Hệ số lũy tiến tu vi giữa các tầng (vd: 1.35)
    readonly afkExpBase: BigNumber;  // Tốc độ tích lũy tu vi AFK cơ bản mỗi giây
    readonly desc: string;           // Khẩu quyết tu luyện cảnh giới
    readonly reqStageId?: string;    // Điều kiện vượt ải cốt truyện bắt buộc để thăng cảnh giới (vd: stage_17)
}

/**
 * Cổng kiểm soát Bình Cảnh Đột Phá (Breakthrough Gates)
 */
export interface BreakthroughGate {
    readonly blocked: boolean;
    readonly reason?: "STAGE_REQUIRED" | "VO_CUC_GATE_STAGE_22" | "VAN_THIEN_DIA_STAGE_23";
    readonly requiredStageId?: string;
    readonly requiredStageName?: string;
    readonly message: string;
}

/**
 * Tỉ lệ độ kiếp & rủi ro Lôi Kiếp
 */
export interface TribulationRate {
    readonly baseRate: number;       // Tỉ lệ cơ sở (%)
    readonly pillBonusRate: number;  // Tỉ lệ cộng thêm từ Đan Dược (%)
    readonly totalRate: number;      // Tổng tỉ lệ thành công hữu hiệu (%)
    readonly failPenaltyTuViPct: number; // Mức phạt mất tu vi khi sét đánh thất bại (mặc định: 20%)
}

/**
 * Kết quả trả về của hàm Đột Phá (Tuân thủ hợp đồng trả về chuẩn)
 */
export interface BreakthroughResult {
    readonly success: boolean;
    readonly msg: string;
    readonly oldTier: number;
    readonly newTier: number;
    readonly oldRealmIndex: number;
    readonly newRealmIndex: number;
    readonly statPointsGained: number; // Thường là +4 điểm tiềm năng/tầng
    readonly isVoCucBlocked?: boolean;
    readonly isVanThienDiaBlocked?: boolean;
    readonly tribulationFailed?: boolean;
    readonly tuViLost?: BigNumber;
}

/**
 * Kết quả thực thi Đột Phá Nhanh (Quick Breakthrough)
 */
export interface QuickBreakthroughResult {
    readonly success: boolean;
    readonly successCount: number;
    readonly totalPointsGained: number;
    readonly stopReason: "INSUFFICIENT_TU_VI" | "GATE_BLOCKED" | "TRIBULATION_FAILED" | "MAX_REACHED";
    readonly finalRealmIndex: number;
    readonly finalTierIndex: number;
    readonly message: string;
}
