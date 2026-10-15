import Decimal from "break_eternity.js";

/**
 * Kiểu số lớn tiêu chuẩn cho toàn bộ hệ thống trò chơi.
 * Sử dụng break_eternity.js hỗ trợ số mũ nhiều tầng (lên tới 10^^1e308),
 * triệt tiêu hoàn toàn giới hạn Number.MAX_SAFE_INTEGER (9e15) của JavaScript.
 */
export type BigNumber = Decimal;
export { Decimal };

/**
 * Các dạng dữ liệu có thể chuyển đổi thành BigNumber
 */
export type BigNumberSource = Decimal | number | string;

/**
 * Chuyển đổi an toàn giá trị bất kỳ sang Decimal
 */
export function toBigNumber(val: BigNumberSource | null | undefined): BigNumber {
    if (val === null || val === undefined) return new Decimal(0);
    if (val instanceof Decimal) return val;
    return new Decimal(val);
}
