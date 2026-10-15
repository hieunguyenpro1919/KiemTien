import assert from "node:assert";
import { Decimal } from "../src/core/types/bignum";
import { RealmSystem, REALM_DATABASE } from "../src/core/constants/realms.data";
import { PetSystem, PET_DATABASE } from "../src/core/constants/pets.data";
import { StageSystem, STAGE_DATABASE } from "../src/core/constants/stages.data";
import { usePlayerStore } from "../src/core/state/usePlayerStore";
import { GameLoopEngine } from "../src/core/state/useGameLoop";

console.log("==================================================================");
console.log("🚀 KIỂM THỬ TOÀN DIỆN CORE ENGINE & STATE - KIEMTIEN v4 (TS + BIGNUM)");
console.log("==================================================================");

let passedTests = 0;
let totalTests = 0;

function test(name: string, fn: () => void) {
    totalTests++;
    try {
        fn();
        console.log(`  ✓ [PASS] ${name}`);
        passedTests++;
    } catch (err: any) {
        console.error(`  ✗ [FAIL] ${name}`);
        console.error("    Lỗi:", err.message);
        throw err;
    }
}

// -------------------------------------------------------------
console.log("\n--- SUITE 1: Phép Toán Số Lớn (break_eternity.js Decimal) ---");

test("Số học vượt ngưỡng Number.MAX_SAFE_INTEGER (9e15) không bị mất độ chính xác", () => {
    const safeLimit = new Decimal("9007199254740991");
    const hugeNumber = safeLimit.times(1000000000);
    assert(hugeNumber.gt(safeLimit));
    assert(hugeNumber.gte(new Decimal("9e24")));

    const supremeTuVi = new Decimal("1e100");
    const gained = new Decimal("5e99");
    const total = supremeTuVi.plus(gained);
    assert(total.eq(new Decimal("1.5e100")));
});

test("Toán chia lấy nguyên và modulo cho chuyển đổi Tinh Nguyên (1 Tỷ Tu Vi = 1 Tinh Nguyên)", () => {
    const tuVi = new Decimal("3500000000"); // 3.5 Tỷ
    const ONE_BILLION = new Decimal("1000000000");
    const tinhGained = tuVi.div(ONE_BILLION).floor();
    const remainder = tuVi.mod(ONE_BILLION);

    assert.strictEqual(tinhGained.toNumber(), 3);
    assert.strictEqual(remainder.toNumber(), 500000000);
});

// -------------------------------------------------------------
console.log("\n--- SUITE 2: Hằng Số & Công Thức Cảnh Giới (Realms System) ---");

test("Đủ 12 Đại Cảnh Giới chuẩn cốt truyện với hệ số tu vi lũy tiến BigNumber", () => {
    assert.strictEqual(REALM_DATABASE.length, 12);
    assert.strictEqual(REALM_DATABASE[0].name, "Tôi Khí");
    assert.strictEqual(REALM_DATABASE[11].name, "Đại Đạo Chí Cao Vô Thượng");

    // Tôi khí Tầng 1: base = 100
    const toiKhiT1 = RealmSystem.getMaxTuVi(0, 0);
    assert.strictEqual(toiKhiT1.toNumber(), 100);

    // Tôi khí Tầng 2: 100 * 1.35 = 135
    const toiKhiT2 = RealmSystem.getMaxTuVi(0, 1);
    assert.strictEqual(toiKhiT2.toNumber(), 135);

    // Tốc độ AFK tăng theo tầng
    const afkRateT1 = RealmSystem.getAfkTuViRate(0, 0);
    const afkRateT5 = RealmSystem.getAfkTuViRate(0, 4);
    assert(afkRateT5.gt(afkRateT1));
});

// -------------------------------------------------------------
console.log("\n--- SUITE 3: Quản Lý Thuộc Tính Tiềm Năng & Reset Chuẩn V3 ---");

test("Cộng điểm tiềm năng chuẩn V3 (Vật Lí, Phép, Máu) và cộng tối đa (+Max)", () => {
    const store = usePlayerStore.getState();
    store.resetAllData();

    assert.strictEqual(store.statPoints, 4);
    assert.strictEqual(store.statVatLi, 0);
    assert.strictEqual(store.statPhep, 0);
    assert.strictEqual(store.statMau, 0);

    // Nâng 2 điểm Công Vật Lí
    const ok = store.allocateStat("vat_li", 2);
    assert.strictEqual(ok, true);
    assert.strictEqual(usePlayerStore.getState().statPoints, 2);
    assert.strictEqual(usePlayerStore.getState().statVatLi, 2);

    // Nâng Max vào Máu (Sinh Lực)
    const maxPoints = store.allocateStatMax("mau");
    assert.strictEqual(maxPoints, 2);
    assert.strictEqual(usePlayerStore.getState().statPoints, 0);
    assert.strictEqual(usePlayerStore.getState().statMau, 2);
});

test("Tẩy tủy hoàn trả 100% điểm tiềm năng đã phân bổ chuẩn V3", () => {
    const store = usePlayerStore.getState();
    const returned = store.resetStats();
    assert.strictEqual(returned, 4);

    const afterReset = usePlayerStore.getState();
    assert.strictEqual(afterReset.statVatLi, 0);
    assert.strictEqual(afterReset.statPhep, 0);
    assert.strictEqual(afterReset.statMau, 0);
    assert.strictEqual(afterReset.statPoints, 4);
});

test("Công thức tính Tổng Chỉ Số Chiến Đấu (getTotalStats) khớp 100% bản V3 (bao gồm trang bị)", () => {
    const store = usePlayerStore.getState();
    store.resetAllData();

    // 1. Khi chưa mang trang bị nào
    usePlayerStore.setState({
        equipped: { non: null, giap: null, vukhi: null }
    });

    // Tôi Khí Tầng 1 (absTier = 0)
    // baseHp = 150, baseVatLi = 15, basePhep = 15, basePhongThu = 5, baseKhangPhep = 5, baseBaoKich = 5
    const nakedStats = store.getTotalStats();
    assert.strictEqual(nakedStats.maxHp.toNumber(), 150);
    assert.strictEqual(nakedStats.vatLi.toNumber(), 15);
    assert.strictEqual(nakedStats.phep.toNumber(), 15);
    assert.strictEqual(nakedStats.phongThu.toNumber(), 5);
    assert.strictEqual(nakedStats.khangPhep.toNumber(), 5);
    assert.strictEqual(nakedStats.baoKich, 5);

    // 2. Khi mang 3 món khởi đầu: hat_01 (+100 HP, +10 Thủ), armor_01 (+120 HP, +15 Thủ), weapon_01 (+15 VL, +5 Phép, +2% Bạo)
    usePlayerStore.setState({
        equipped: { non: "hat_01", giap: "armor_01", vukhi: "weapon_01" }
    });
    const equippedStats = store.getTotalStats();
    assert.strictEqual(equippedStats.maxHp.toNumber(), 370); // 150 + 100 + 120 = 370
    assert.strictEqual(equippedStats.vatLi.toNumber(), 30);  // 15 + 15 = 30
    assert.strictEqual(equippedStats.phep.toNumber(), 20);   // 15 + 5 = 20
    assert.strictEqual(equippedStats.phongThu.toNumber(), 30); // 5 + 10 + 15 = 30
    assert.strictEqual(equippedStats.baoKich, 7);            // 5 + 2 = 7%

    // 3. Giả lập cộng 10 điểm Máu khi không mặc đồ:
    usePlayerStore.setState({
        equipped: { non: null, giap: null, vukhi: null },
        statMau: 10
    });
    // allocatedHp = 10 * 30 = 300 -> rawHp = 450
    // hpMultiplier = 1 + 10 * 0.004 = 1.04 -> maxHp = 450 * 1.04 = 468
    // bonusDefFromMau = floor(10 / 10) = 1 -> phongThu = 5 + 1 = 6, khangPhep = 5 + 1 = 6
    const statsWithMau = store.getTotalStats();
    assert.strictEqual(statsWithMau.maxHp.toNumber(), 468);
    assert.strictEqual(statsWithMau.phongThu.toNumber(), 6);
    assert.strictEqual(statsWithMau.khangPhep.toNumber(), 6);
});

// -------------------------------------------------------------
console.log("\n--- SUITE 4: Tích Lũy Tu Vi & Đột Phá Tầng (Breakthrough Actions) ---");

test("addTuVi tích lũy chính xác và tự động kiểm tra điều kiện có thể đột phá", () => {
    const store = usePlayerStore.getState();
    store.resetAllData();

    // Max tu vi của Tôi Khí Tầng 1 là 100
    const res1 = store.addTuVi(50);
    assert.strictEqual(res1.canBreakthrough, false);
    assert.strictEqual(usePlayerStore.getState().tuVi.toNumber(), 50);

    const res2 = store.addTuVi(60);
    assert.strictEqual(res2.canBreakthrough, true);
    assert.strictEqual(usePlayerStore.getState().tuVi.toNumber(), 110);
});

test("Đột phá thành công: tiêu hao đúng tu vi, tăng tầng và cộng đúng 4 điểm tiềm năng", () => {
    const store = usePlayerStore.getState();
    // Hiện có 110 tu vi, cần 100 tu vi cho Tầng 1
    const oldPoints = store.statPoints;
    const breakRes = store.attemptBreakthrough();

    assert.strictEqual(breakRes.success, true);
    assert.strictEqual(breakRes.statPointsGained, 4);
    assert.strictEqual(breakRes.newTier, 1);

    const updated = usePlayerStore.getState();
    assert.strictEqual(updated.tierIndex, 1);
    assert.strictEqual(updated.tuVi.toNumber(), 10); // 110 - 100 = 10
    assert.strictEqual(updated.statPoints, oldPoints + 4);
});

test("Đột phá nhanh (quickBreakthrough) thực hiện nhiều tầng liên tiếp cho đến khi dừng minh bạch", () => {
    const origRandom = Math.random;
    Math.random = () => 0.01; // Đảm bảo test không bị thất bại ngẫu nhiên do tỷ lệ lôi kiếp
    try {
        const store = usePlayerStore.getState();
        store.resetAllData();
        // Nạp đủ 50.000 tu vi để nhảy nhiều tầng
        store.addTuVi(50000);

        const quickRes = store.quickBreakthrough();
        assert.strictEqual(quickRes.success, true);
        assert(quickRes.successCount >= 3, "Phải thăng ít nhất 3 tầng");
        assert(quickRes.totalPointsGained >= 12, "Phải nhận tương ứng số điểm tiềm năng");
        assert.strictEqual(typeof quickRes.message, "string");
    } finally {
        Math.random = origRandom;
    }
});

// -------------------------------------------------------------
console.log("\n--- SUITE 5: Cổng Bình Cảnh Ải 22 & Cảnh Giới Vô Cực (Gates & Vo Cuc) ---");

test("Chặn Bình Cảnh Ải 22 ở Tầng 100 Đại Đạo Chí Cao Vô Thượng khi chưa diệt Boss", () => {
    const store = usePlayerStore.getState();
    store.resetAllData();

    // Giả lập người chơi đạt Tầng 100 (tierIndex 99) Đại Đạo Chí Cao (realmIndex 11)
    usePlayerStore.setState({
        realmIndex: 11,
        tierIndex: 99,
        tuVi: new Decimal("999999999999999"),
        clearedStageIds: []
    });

    const gate = store.getBreakthroughGate();
    assert.strictEqual(gate.blocked, true);
    assert.strictEqual(gate.reason, "VO_CUC_GATE_STAGE_22");

    const breakRes = store.attemptBreakthrough();
    assert.strictEqual(breakRes.success, false);
    assert.strictEqual(breakRes.isVoCucBlocked, true);
});

test("Vượt Ải 22 mở khóa thăng hoa vào Cảnh Giới Vô Cực (isVoCuc = true, Tinh Nguyên kích hoạt)", () => {
    const store = usePlayerStore.getState();
    // Đánh bại Ải 22
    store.markStageCleared("stage_vo_cuc");

    const gateAfter = store.getBreakthroughGate();
    assert.strictEqual(gateAfter.blocked, false);

    const breakRes = store.attemptBreakthrough();
    assert.strictEqual(breakRes.success, true);

    const vocucState = usePlayerStore.getState();
    assert.strictEqual(vocucState.isVoCuc, true);
    assert.strictEqual(vocucState.tierIndex, 100); // Bước lên Tầng 101 Vô Cực
});

// -------------------------------------------------------------
console.log("\n--- SUITE 6: Dữ Liệu Thần Thú & Phó Bản (Pets & Stages) ---");

test("Tam Đại Thần Thú khởi tạo chuẩn và scale chỉ số lũy tiến theo 12 cảnh giới", () => {
    assert.strictEqual(PET_DATABASE.length, 3);
    const tankPet = PetSystem.getPetById("pet_tank");
    assert(tankPet !== null);

    const statsRealm0 = PetSystem.calculatePetStats("pet_tank", 0);
    const statsRealm5 = PetSystem.calculatePetStats("pet_tank", 5);

    assert(statsRealm0 !== null && statsRealm5 !== null);
    assert(statsRealm5.hp.gt(statsRealm0.hp));
    assert(statsRealm5.attack.gt(statsRealm0.attack));
});

test("Hệ thống 23 Ải chính tuyến và điều kiện mở khóa Hư Không Tháp", () => {
    assert(STAGE_DATABASE.length >= 7);
    const stage1 = StageSystem.getStageById("stage_01");
    assert(stage1 !== null);

    // Chưa vượt Ải 3 -> Chưa mở tháp
    assert.strictEqual(StageSystem.isTowerUnlocked(["stage_01", "stage_02"]), false);
    // Vượt Ải 3 -> Mở Hư Không Tháp
    assert.strictEqual(StageSystem.isTowerUnlocked(["stage_01", "stage_02", "stage_03"]), true);
});

// -------------------------------------------------------------
console.log("\n--- SUITE 7: Vòng Lặp Game & Tích Lũy Offline (GameLoop & AFK) ---");

test("Tính toán tích lũy tu vi khi offline (AFK rate * thời gian vắng mặt)", () => {
    const store = usePlayerStore.getState();
    store.resetAllData();
    
    // Giả lập vắng mặt 3600 giây (1 giờ)
    const now = Date.now();
    usePlayerStore.setState({ lastOnlineTimestamp: now - 3600 * 1000 });

    const engine = GameLoopEngine.getInstance();
    const report = engine.checkOfflineProgress();

    assert(report !== null);
    assert.strictEqual(report.offlineSeconds, 3600);
    // Tôi Khí Tầng 1: AFK rate = 2 tu vi/s -> 3600s = 7200 tu vi
    assert.strictEqual(report.tuViGained.toNumber(), 7200);
    assert.strictEqual(usePlayerStore.getState().tuVi.toNumber(), 7200);
});

// -------------------------------------------------------------
console.log("\n==================================================================");
console.log(`🎉 HOÀN TẤT TẤT CẢ KIỂM THỬ: ${passedTests}/${totalTests} TESTS ĐẠT (100% PASS)`);
console.log("==================================================================");
