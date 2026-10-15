import { BigNumber, Decimal, toBigNumber, BigNumberSource } from "../types/bignum";

const SUFFIXES = [
    "", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc",
    "UDc", "DDc", "TDc", "QaDc", "QiDc", "SxDc", "SpDc", "OcDc", "NoDc", "Vg"
];

/**
 * Định dạng số lớn sang dạng rút gọn quen thuộc trong game Idle RPG
 * Ví dụ: 1,500 -> 1.50K; 2,500,000 -> 2.50M; 1,000,000,000 -> 1.00B
 */
export function formatBigNumber(value: BigNumberSource | null | undefined, precision = 2): string {
    const num = toBigNumber(value);

    if (Decimal.isNaN(num)) return "0";
    if (num.eq(0)) return "0";
    if (num.lt(0)) return `-${formatBigNumber(num.neg(), precision)}`;

    // Nếu nhỏ hơn 1.000, hiển thị dạng số nguyên thông thường
    if (num.lt(1000)) {
        return num.toFixed(num.lt(10) && num.mod(1).gt(0) ? 1 : 0);
    }

    // Nếu rất lớn, định dạng theo suffix hoặc scientific e.g. 1.25e100
    const exponent = Math.floor(num.log10().toNumber());
    const suffixIndex = Math.floor(exponent / 3);

    if (suffixIndex < SUFFIXES.length) {
        const base = num.div(toBigNumber(10).pow(suffixIndex * 3));
        return `${base.toFixed(precision)}${SUFFIXES[suffixIndex]}`;
    }

    // Dạng khoa học chuẩn: 1.25e75
    return num.toExponential(precision);
}

/**
 * Định dạng số nguyên có dấu chấm ngăn cách hàng nghìn kiểu Việt Nam
 */
export function formatInteger(val: number | string | BigNumber): string {
    const num = toBigNumber(val);
    if (num.gte(1000000000)) {
        return formatBigNumber(num);
    }
    return Math.floor(num.toNumber()).toLocaleString("vi-VN");
}

/**
 * Định dạng phần trăm
 */
export function formatPercent(rate: number): string {
    return `${rate.toFixed(1)}%`;
}
