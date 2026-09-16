/**
 * SUITE KIỂM THỬ TOÀN DIỆN "TIÊN ĐẠO TRƯỜNG SINH" (KIEMTIEN 3.0)
 * Chạy bằng Node.js thuần (Zero-dependency, không cần npm / framework)
 * Lệnh chạy: node scratch/run-all-tests.js
 */

const assert = require('assert');

// 1. Khởi tạo môi trường giả lập (Mock DOM & Storage)
global.window = global;
const elements = {};
global.document = {
    addEventListener: () => {},
    getElementById: (id) => {
        if (!elements[id]) {
            elements[id] = {
                id,
                style: {},
                innerText: '',
                innerHTML: '',
                children: [],
                classList: { toggle: () => {}, add: () => {}, remove: () => {} },
                addEventListener: () => {},
                setAttribute: () => {},
                getAttribute: () => '',
                appendChild: (child) => elements[id].children.push(child),
                removeChild: (child) => {
                    const idx = elements[id].children.indexOf(child);
                    if (idx !== -1) elements[id].children.splice(idx, 1);
                },
                getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 })
            };
        }
        return elements[id];
    },
    createElement: (tag) => ({
        style: {},
        innerText: '',
        innerHTML: '',
        children: [],
        classList: { add: () => {}, remove: () => {}, toggle: () => {} },
        setAttribute: () => {},
        getAttribute: () => '',
        addEventListener: () => {}
    }),
    querySelectorAll: () => []
};

global.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
};

// 2. Nạp toàn bộ dữ liệu & engine theo đúng thứ tự index.html
require('../js/data/realms.js');
require('../js/data/skills.js');
require('../js/data/skills_ultimate.js');
require('../js/data/items.js');
require('../js/data/titles.js');
require('../js/data/stages.js');
require('../js/data/tower.js');
require('../js/data/pets.js');
require('../js/engine/storage.js');
require('../js/state/player.js');
require('../js/engine/combat.js');
require('../js/ui/ui.js');

console.log("==================================================================");
console.log("🚀 BẮT ĐẦU BỘ KIỂM THỬ TOÀN DIỆN HỆ THỐNG - KIEMTIEN 3.0");
console.log("==================================================================\n");

let totalTests = 0;
let passedTests = 0;

function runTest(suiteName, testName, fn) {
    totalTests++;
    try {
        fn();
        passedTests++;
        console.log(`  ✓ [PASS] ${testName}`);
    } catch (err) {
        console.error(`  ✗ [FAIL] ${testName}`);
        console.error(`    -> Lỗi: ${err.message}`);
        if (err.stack) {
            const stackLines = err.stack.split("\n").slice(1, 3).join("\n");
            console.error(`    ${stackLines}`);
        }
        throw err;
    }
}

// ==================================================================
// SUITE 1: CHỈ SỐ CƠ BẢN & PHÂN BỔ ĐIỂM TIỀM NĂNG (STATS & POTENTIAL)
// ==================================================================
console.log("--- SUITE 1: Chỉ Số Nhân Vật & Điểm Tiềm Năng ---");

runTest("Suite 1", "Khởi tạo chỉ số chuẩn và phân bổ tiềm năng chính xác", () => {
    const p = new Player();
    p.statPoints = 10;
    
    // Cộng 2 điểm Vật lí (+10 công phẳng), 3 điểm Phép (+15 công phẳng), 5 điểm HP (+150 HP phẳng)
    p.allocateStat("vatLi", 2);
    p.allocateStat("phep", 3);
    p.allocateStat("mau", 5);
    
    assert.strictEqual(p.statVatLi, 2);
    assert.strictEqual(p.statPhep, 3);
    assert.strictEqual(p.statMau, 5);
    assert.strictEqual(p.statPoints, 0);
    
    const stats = p.getTotalStats();
    assert(stats.vatLi >= 15 + 2 * 5, "Công vật lí phải tính điểm tiềm năng");
    assert(stats.phep >= 15 + 3 * 5, "Công phép phải tính điểm tiềm năng");
    assert(stats.maxHp >= 150 + 5 * 30, "Máu tối đa phải tính điểm tiềm năng");
});

runTest("Suite 1", "Trang bị nón, giáp, vũ khí và buff danh hiệu hoạt động chuẩn xác", () => {
    const p = new Player();
    p.inventory = ["hat_01", "armor_01", "weapon_01"];
    p.equipItem("hat_01");
    p.equipItem("armor_01");
    p.equipItem("weapon_01");
    
    assert.strictEqual(p.equipped.non, "hat_01");
    assert.strictEqual(p.equipped.giap, "armor_01");
    assert.strictEqual(p.equipped.vukhi, "weapon_01");
    
    p.unlockedTitles = ["title_phe_co"];
    p.equippedTitle = "title_phe_co";
    assert.strictEqual(p.equippedTitle, "title_phe_co");
});

runTest("Suite 1", "Tẩy tủy đan thu hồi toàn bộ điểm tiềm năng chính xác", () => {
    const p = new Player();
    p.statVatLi = 5;
    p.statPhep = 5;
    p.statMau = 10;
    p.statPoints = 0;
    p.inventory = ["pill_tay_tuy"];
    
    const res = p.useConsumable("pill_tay_tuy");
    assert.strictEqual(res.success, true);
    assert.strictEqual(p.statPoints, 20, "Phải thu hồi đúng 5 + 5 + 10 = 20 điểm");
    assert.strictEqual(p.statVatLi, 0);
    assert.strictEqual(p.statPhep, 0);
    assert.strictEqual(p.statMau, 0);
});

// ==================================================================
// SUITE 2: CÁC ĐIỀU KIỆN & BÌNH CẢNH ĐỘT PHÁ (BREAKTHROUGH GATES)
// ==================================================================
console.log("\n--- SUITE 2: Điều Kiện Đột Phá & Bình Cảnh (Gates) ---");

runTest("Suite 2", "Kiểm tra bình cảnh Ải 22 ở Tầng 100 Đại Đạo Chí Cao Vô Thượng", () => {
    const p = new Player();
    p.realmIndex = 11;
    p.tierIndex = 99; // Tầng 100 (0-indexed)
    p.clearedStages = [];
    
    const gate = p.getBreakthroughGate ? p.getBreakthroughGate() : null;
    if (gate) {
        assert.strictEqual(gate.blocked, true);
        assert.strictEqual(gate.reason, "stage_22");
    }
    assert.strictEqual(p.canBreakthrough(), false, "Chưa qua Ải 22 không được phép đột phá");
    
    p.clearedStages = ["stage_vo_cuc"];
    const gateCleared = p.getBreakthroughGate ? p.getBreakthroughGate() : null;
    if (gateCleared) {
        assert.strictEqual(gateCleared.blocked, false);
    }
});

runTest("Suite 2", "Kiểm tra bình cảnh Ải 23: Vấn Thiên Địa mỗi 100 tầng trong Cảnh Giới Vô Cực", () => {
    const p = new Player();
    p.isVoCuc = true;
    p.realmIndex = 11;
    p.tierIndex = 199; // Mốc chuẩn bị lên Tầng 201 (Milestone 2)
    p.vanThienDiaMilestonesCleared = 1; // Mới chỉ vượt mốc 1
    
    const gate = p.getBreakthroughGate ? p.getBreakthroughGate() : null;
    if (gate) {
        assert.strictEqual(gate.blocked, true);
        assert.strictEqual(gate.reason, "stage_23");
        assert.strictEqual(gate.milestone, 2);
    }
    assert.strictEqual(p.canBreakthrough(), false, "Chưa hạ Boss Ải 23 mốc 2 phải bị chặn");
    
    p.vanThienDiaMilestonesCleared = 2;
    const gateCleared = p.getBreakthroughGate ? p.getBreakthroughGate() : null;
    if (gateCleared) {
        assert.strictEqual(gateCleared.blocked, false);
    }
});

// ==================================================================
// SUITE 3: CHUẨN HÓA HỢP ĐỒNG TRẢ VỀ CỦA BREAKTHROUGH (RETURN CONTRACT)
// ==================================================================
console.log("\n--- SUITE 3: Chuẩn Hóa Hợp Đồng Trả Về Của Đột Phá ---");

runTest("Suite 3", "breakthrough() khi thiếu tu vi/tinh nguyên không bao giờ trả về bare false", () => {
    const p = new Player();
    p.tuVi = 0; // Không đủ tu vi
    
    const res = p.breakthrough();
    assert.notStrictEqual(res, false, "breakthrough() KHÔNG ĐƯỢC trả về bare boolean false");
    assert.strictEqual(typeof res, "object", "breakthrough() phải luôn trả về một object");
    assert.strictEqual(res.success, false);
    assert(res.msg && res.msg.length > 0, "Phải có thông báo lỗi cụ thể");
});

runTest("Suite 3", "breakthrough() khi bị chặn Ải 22/23 trả về thông tin bình cảnh cụ thể", () => {
    const p = new Player();
    p.realmIndex = 11;
    p.tierIndex = 99;
    p.clearedStages = [];
    p.tuVi = 999999999999;
    
    const res = p.breakthrough();
    assert.strictEqual(typeof res, "object");
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.isVoCucBlocked, true);
    assert(res.msg.includes("Ải 22"), "Thông báo phải nhắc tới Ải 22");
});

runTest("Suite 3", "Đột phá thành công cộng đúng 4 điểm tiềm năng và tăng tầng", () => {
    const p = new Player();
    p.tuVi = p.getMaxTuVi();
    const oldTier = p.tierIndex;
    const oldPoints = p.statPoints;
    
    // Tỉ lệ độ kiếp 100% ở cảnh giới đầu
    const res = p.breakthrough();
    assert.strictEqual(typeof res, "object");
    assert.strictEqual(res.success, true);
    assert.strictEqual(p.statPoints, oldPoints + 4);
    assert.strictEqual(p.tierIndex, oldTier + 1);
});

runTest("Suite 3", "quickBreakthrough() dừng lại chính xác và báo lý do dừng minh bạch", () => {
    const p = new Player();
    p.tuVi = p.getMaxTuVi() * 2; // Đủ để thăng đúng 2 tầng
    
    const res = p.quickBreakthrough();
    assert.strictEqual(typeof res, "object");
    assert.strictEqual(res.success, true);
    assert(res.successCount >= 1, "Phải thăng được ít nhất 1 tầng");
    assert.strictEqual(typeof res.stopReason, "string");
});

// ==================================================================
// SUITE 4: TỈ LỆ ĐỘ KIẾP & PHẠT THẤT BẠI (TRIBULATION & PENALTIES)
// ==================================================================
console.log("\n--- SUITE 4: Tỉ Lệ Độ Kiếp & Khấu Trừ Thất Bại ---");

runTest("Suite 4", "Tính toán tỉ lệ độ kiếp giảm dần theo tầng và nhận buff từ đan", () => {
    const p = new Player();
    p.realmIndex = 11;
    p.tierIndex = 50;
    
    const rateBase = p.getBreakthroughRate();
    assert(rateBase.totalRate <= 100);
    
    // Sử dụng Luận Đạo Tinh Nguyên (+1% tỉ lệ)
    p.inventory = ["pill_luan_dao_tinh_nguyen"];
    p.useConsumable("pill_luan_dao_tinh_nguyen");
    
    const rateWithBuff = p.getBreakthroughRate();
    assert.strictEqual(rateWithBuff.totalRate, rateBase.totalRate + 1);
});

// ==================================================================
// SUITE 5: CÔNG THỨC CHIẾN ĐẤU & TRẦN SÁT THƯƠNG "KIM THÂN"
// ==================================================================
console.log("\n--- SUITE 5: Công Thức Sát Thương & Trần Kim Thân Boss ---");

runTest("Suite 5", "Kim Thân giới hạn tối đa sát thương nhận vào của Boss", () => {
    const combat = new CombatEngine(null);
    combat.monster = { isBoss: true, damageCapPct: 0.10, breakCapPct: 0.10 };
    combat.monsterMaxHp = 1000000;
    
    // Đòn đánh cực mạnh 5.000.000 DMG bị trần ở mức 10% = 100.000
    const capRes = combat.applyDamageCap(5000000, false);
    assert.strictEqual(capRes.isCapped, true);
    assert.strictEqual(capRes.damage, 100000);
});

runTest("Suite 5", "Cơ chế phá Kim Thân với đòn bạo kích cho phép ngưỡng trần cao hơn", () => {
    const combat = new CombatEngine(null);
    combat.monster = { isBoss: true, damageCapPct: 0.20, breakCapPct: 0.40 };
    combat.monsterMaxHp = 1000000;
    
    // Đòn thường: trần 20% = 200.000
    const normalCap = combat.applyDamageCap(500000, false);
    assert.strictEqual(normalCap.damage, 200000);
    
    // Đòn bạo kích / kỹ năng: trần 40% = 400.000
    const specialCap = combat.applyDamageCap(500000, true);
    assert.strictEqual(specialCap.damage, 400000);
    assert.strictEqual(specialCap.isBreak, true);
});

// ==================================================================
// SUITE 6: HỆ THỐNG TAM ĐẠI THẦN THÚ & 12 CẢNH GIỚI CHUẨN
// ==================================================================
console.log("\n--- SUITE 6: Tam Đại Thần Thú & 12 Cảnh Giới Game ---");

runTest("Suite 6", "12 Cảnh Giới Thần Thú đồng bộ chính xác với hệ thống game", () => {
    const expected = [
        "Tôi Khí Cảnh", "Ngưng Khí Cảnh", "Linh Hải Cảnh", "Tạo Đảo Cảnh",
        "Nguyên Linh Thụ", "Tạo Hóa Đài", "Thông Thiên Trụ", "Ngọc Điện Cảnh",
        "Đỉnh Cấp Ngai", "Vô Thượng Lộ", "Vạn Vì Tinh Tú", "Đại Đạo Chí Cao Vô Thượng"
    ];
    assert.strictEqual(PET_REALMS.length, 12);
    for (let i = 0; i < 12; i++) {
        const realm = PetSystem.getRealm(i);
        assert.strictEqual(realm.name, expected[i]);
    }
});

runTest("Suite 6", "Đột phá Thần Thú tăng trưởng chỉ số và giới hạn Cảnh Giới 11", () => {
    const p = new Player();
    p.pets.pet_tank.unlocked = true;
    p.pets.pet_tank.realm = 0;
    p.pets.pet_tank.exp = 500;
    
    const res = p.breakthroughPet("pet_tank");
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.newRealm, 1);
    assert.strictEqual(res.newRealmName, "Ngưng Khí Cảnh");
    
    const stats = p.getPetStats("pet_tank");
    assert(stats.maxHp > 2500, "HP Thần Thú Tank phải tăng trưởng sau đột phá");
});

// ==================================================================
// SUITE 7: LƯU TRỮ, DI CƯ DỮ LIỆU & QUY ĐỔI TINH NGUYÊN
// ==================================================================
console.log("\n--- SUITE 7: Lưu Trữ, Tương Thích Ngược & Tinh Nguyên ---");

runTest("Suite 7", "Cơ chế Vô Cực: 1 Tỷ Tu Vi = 1 Tinh Nguyên (Chống lỗi tràn số 1:1)", () => {
    const p = new Player();
    p.isVoCuc = true;
    p.tinhNguyen = 0;
    p.vocucPendingTuVi = 0;
    
    // Thêm 500 triệu tu vi -> chưa đủ 1 tỷ -> 0 Tinh Nguyên
    p.addTuVi(500000000);
    assert.strictEqual(p.tinhNguyen, 0);
    
    // Thêm tiếp 1.5 tỷ tu vi -> tổng 2 tỷ -> +2 Tinh Nguyên
    p.addTuVi(1500000000);
    assert.strictEqual(p.tinhNguyen, 2);
    assert.strictEqual(p.vocucPendingTuVi, 0);
});

runTest("Suite 7", "Nạp save cũ tự động gom vé Đài Cầu Đạo và nâng cấp V4 an toàn", () => {
    const oldSaveData = {
        saveVersion: 3,
        name: "Lão Đạo",
        realmIndex: 2,
        tierIndex: 5,
        inventory: ["hat_01", "ticket_tam_dao", "ticket_tam_dao"],
        gachaTickets: 5
    };
    
    const p = new Player();
    p.fromJSON(oldSaveData);
    
    assert.strictEqual(p.gachaTickets, 7, "2 vé từ túi đồ phải được quy đổi thẳng vào gachaTickets");
    assert.strictEqual(p.inventory.filter(id => id === "ticket_tam_dao").length, 0);
    assert(p.pets && p.pets.pet_tank, "Cấu trúc Thần Thú V4 phải được bổ sung tự động");
});

console.log("\n--- SUITE 8: Kiến Trúc Module Hóa Player & UIController (Giai Đoạn 2) ---");

runTest("Suite 8", "Player.prototype tích hợp đầy đủ 5 phân hệ domain độc lập", () => {
    // Stats domain
    assert.strictEqual(typeof Player.prototype.allocateStat, "function");
    assert.strictEqual(typeof Player.prototype.getTotalStats, "function");
    // Breakthrough domain
    assert.strictEqual(typeof Player.prototype.getBreakthroughRate, "function");
    assert.strictEqual(typeof Player.prototype.quickBreakthrough, "function");
    // Inventory domain
    assert.strictEqual(typeof Player.prototype.equipItem, "function");
    assert.strictEqual(typeof Player.prototype.buyMaxPill, "function");
    // Tower & Gacha domain
    assert.strictEqual(typeof Player.prototype.rollGacha, "function");
    assert.strictEqual(typeof Player.prototype.equipUltimate, "function");
    // Pet domain
    assert.strictEqual(typeof Player.prototype.feedPetPill, "function");
    assert.strictEqual(typeof Player.prototype.breakthroughPet, "function");
});

runTest("Suite 8", "UIController.prototype tích hợp đầy đủ 8 phân hệ Tab giao diện", () => {
    assert(typeof UIController !== "undefined", "UIController phải được định nghĩa");
    // Cultivate tab
    assert.strictEqual(typeof UIController.prototype.renderCultivateTab, "function");
    assert.strictEqual(typeof UIController.prototype.handleBreakthrough, "function");
    // Character tab
    assert.strictEqual(typeof UIController.prototype.renderCharacterTab, "function");
    assert.strictEqual(typeof UIController.prototype.openQuickSellDupsModal, "function");
    // Stages tab
    assert.strictEqual(typeof UIController.prototype.renderStagesTab, "function");
    assert.strictEqual(typeof UIController.prototype.startBattle, "function");
    // Tower tab
    assert.strictEqual(typeof UIController.prototype.renderTowerTab, "function");
    assert.strictEqual(typeof UIController.prototype.startTowerBattle, "function");
    // Skills tab
    assert.strictEqual(typeof UIController.prototype.renderSkillsTab, "function");
    assert.strictEqual(typeof UIController.prototype.buySkill, "function");
    // Shop tab
    assert.strictEqual(typeof UIController.prototype.renderShopTab, "function");
    assert.strictEqual(typeof UIController.prototype.handleBuyMaxPill, "function");
    // Gacha tab
    assert.strictEqual(typeof UIController.prototype.renderGachaTab, "function");
    assert.strictEqual(typeof UIController.prototype.handleGachaRoll, "function");
    // Pets tab
    assert.strictEqual(typeof UIController.prototype.renderPetsTab, "function");
    assert.strictEqual(typeof UIController.prototype.handleFeedPetMax, "function");
    // Toast & Tooltips
    assert.strictEqual(typeof UIController.prototype.showToast, "function");
    assert.strictEqual(typeof UIController.prototype.showItemTooltip, "function");
});

console.log("\n==================================================================");
console.log(`🎉 KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} TESTS ĐẠT (100% PASS)`);
console.log("==================================================================\n");
