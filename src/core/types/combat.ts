import { BigNumber } from "./bignum";

/**
 * Phân Loại Nguồn Sát Thương
 */
export type DamageType =
    | "PHYSICAL"      // Sát thương vật lý (bị cản bởi Phòng Thủ & Giáp)
    | "MAGICAL"       // Sát thương phép thuật / linh lực
    | "TRUE_DAMAGE"   // Sát thương chuẩn (bỏ qua 100% Giáp & Kim Thân)
    | "ULTIMATE"      // Đại Thần Thông trấn thân (tiêu hao Nộ Khí)
    | "REFLECT"       // Sát thương phản hồi hộ thể
    | "BURN_PERCENT"; // Đốt máu theo % HP tối đa

/**
 * Đối Tượng Tham Chiến
 */
export type CombatantType = "PLAYER" | "PET" | "MONSTER" | "BOSS";

/**
 * Bối Cảnh Tính Toán Sát Thương Toàn Diện (Damage Context)
 * Đảm bảo mọi cơ chế: Kim Thân, Phá Kim Thân, Bạo Kích, Sát Thương Chuẩn, Khiên Chắn
 * đều được tính toán nhất quán, loại bỏ hoàn toàn các lỗi tính toán ngầm.
 */
export interface DamageContext {
    readonly source: CombatantType;
    readonly target: CombatantType;
    readonly damageType: DamageType;

    // Sát thương đầu vào trước khi qua giáp
    readonly rawDamage: BigNumber;

    // Các cờ kích hoạt đặc biệt
    readonly isCrit: boolean;
    readonly critMultiplier: number;
    readonly isSkill: boolean;
    readonly isUltimate: boolean;
    readonly ignoresDefense: boolean;

    // Cơ chế Kim Thân Hộ Thể của Boss
    readonly targetHasKimThan: boolean;
    readonly maxHpTarget: BigNumber;
    readonly kimThanCapPct: number;      // Trần đòn thường (ví dụ: 10% HP Boss)
    readonly breakCapPct: number;        // Trần khi Bạo Kích / Kỹ Năng (ví dụ: 30% - 40% HP Boss)

    // Kết quả tính toán đầu ra
    isBrokenKimThan: boolean;            // Có phá vỡ kết cấu kim thân không?
    isCappedByKimThan: boolean;          // Đòn đánh có bị chạm trần không?
    mitigatedByDefense: BigNumber;       // Lượng sát thương bị phòng thủ triệt tiêu
    finalDamage: BigNumber;              // Sát thương thực tế giáng xuống mục tiêu
    absorbedByShield: BigNumber;         // Lượng sát thương bị khiên hộ thể hấp thu
    damageToHp: BigNumber;               // Sát thương thực tế trừ thẳng vào thanh HP
    isFatal: boolean;                    // Đòn kết liễu
}

/**
 * Trạng Thái Thực Thể Trên Sàn Đấu 2D (Combatant Runtime State)
 */
export interface CombatantRuntimeState {
    readonly name: string;
    readonly type: CombatantType;
    currentHp: BigNumber;
    maxHp: BigNumber;
    currentShield: BigNumber;
    rage: number;                        // 0 -> 100 Nộ Khí
    attackCooldown: number;              // Giây còn lại đến đòn đánh kế tiếp
    stunTimer: number;                   // Giây bị choáng còn lại
    burnDuration: number;                // Giây hiệu ứng thiêu đốt còn lại
}

/**
 * Tùy Chọn Tốc Độ Trận Đấu
 */
export type CombatSpeed = 1 | 2 | 3;

/**
 * Trạng Thái Toàn Cục Của Phiên Chiến Đấu (Battle State)
 */
export interface BattleState {
    isActive: boolean;
    isAutoCombat: boolean;
    speed: CombatSpeed;
    isTowerBattle: boolean;
    battleTimer: number;                 // Thời gian trận đấu trôi qua (giây)
    enrageTimerRemaining: number;        // Đếm ngược Cuồng Nộ (mặc định 60s cho Boss/Tháp)
    isEnraged: boolean;                  // Đã bộc phát 1000% ATK chưa

    player: CombatantRuntimeState;
    monster: CombatantRuntimeState;
    pet: CombatantRuntimeState | null;

    skillCooldowns: [number, number, number]; // 3 ô kỹ năng chủ động
}

/**
 * Kết Quả Sau Khi Trận Chiến Kết Thúc
 */
export interface BattleOutcome {
    readonly victory: boolean;
    readonly reason: "VICTORY" | "DEFEAT" | "ENRAGE_TIMEOUT" | "FLED";
    readonly stageId?: string;
    readonly towerFloor?: number;
    readonly durationSeconds: number;
    readonly rewards?: {
        tuViGained: BigNumber;
        linhThachGained: BigNumber;
        honNguyenGained?: BigNumber;
        tinhNguyenGained?: BigNumber;
        veTamDaoGained?: number;
        itemsDropped?: string[];
    };
}
