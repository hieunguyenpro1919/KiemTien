const fs = require('fs');
const path = require('path');

// Mock localStorage
const localStorageMock = (function() {
    let store = {};
    return {
        getItem: function(key) { return store[key] || null; },
        setItem: function(key, value) { store[key] = value.toString(); },
        removeItem: function(key) { delete store[key]; },
        clear: function() { store = {}; }
    };
})();
global.localStorage = localStorageMock;
global.window = global;

// Load game files
require('../../Kiemtien/js/data/realms.js');
require('../../Kiemtien/js/data/titles.js');
require('../../Kiemtien/js/data/items.js');
require('../../Kiemtien/js/data/stages.js');
require('../../Kiemtien/js/data/tower.js');
require('../../Kiemtien/js/state/player.js');
require('../../Kiemtien/js/engine/storage.js');

console.log("=== BẮT ĐẦU KIỂM THỬ HỆ THỐNG HỖN NGUYÊN & VÔ CỰC ===");

// TEST 1: Currency Exchange (Quy đổi Linh Thạch & Hỗn Nguyên)
console.log("\n--- TEST 1: QUY ĐỔI TIỀN TỆ ---");
const p1 = new Player();
p1.linhThach = 3500000000; // 3.5 Tỷ Linh Thạch
p1.honNguyen = 0;

let res1 = p1.exchangeLinhThachToHonNguyen(1);
console.log("Đổi 1 🌀:", res1.success, "LT còn:", p1.linhThach, "HN:", p1.honNguyen);
if (!res1.success || p1.linhThach !== 2500000000 || p1.honNguyen !== 1) {
    throw new Error("TEST 1.1 FAILED");
}

let resAll = p1.exchangeAllLinhThachToHonNguyen();
console.log("Nén toàn bộ 💎 -> 🌀:", resAll.success, "Nén được:", resAll.amount, "LT dư:", p1.linhThach, "HN:", p1.honNguyen);
if (!resAll.success || resAll.amount !== 2 || p1.linhThach !== 500000000 || p1.honNguyen !== 3) {
    throw new Error("TEST 1.2 FAILED");
}

let resBack = p1.exchangeHonNguyenToLinhThach(1);
console.log("Phân giải 1 🌀 -> 💎:", resBack.success, "LT:", p1.linhThach, "HN:", p1.honNguyen);
if (!resBack.success || p1.linhThach !== 1500000000 || p1.honNguyen !== 2) {
    throw new Error("TEST 1.3 FAILED");
}

// TEST 2: Vô Cực Breakthrough & Progression
console.log("\n--- TEST 2: ĐỘT PHÁ VÔ CỰC & BÌNH CẢNH TẦNG 100 ---");
const p2 = new Player();
p2.realmIndex = 11; // Đại Đạo Chí Cao
p2.tierIndex = 99;  // Tầng 100
p2.tuVi = p2.getMaxTuVi() + 5000000000000; // Đủ max tu vi + dư 5.000 Tỷ
p2.clearedStages = [];

console.log("Chưa vượt Ải 22, có thể đột phá không?", p2.canBreakthrough());
let btFail = p2.breakthrough();
console.log("Kết quả đột phá:", btFail);
if (btFail.success || !btFail.isVoCucBlocked) {
    throw new Error("TEST 2.1 FAILED: Phải bị chặn bởi Bình Cảnh Tầng 100");
}

// Đánh bại Ải 22 (stage_vo_cuc)
p2.clearedStages.push("stage_vo_cuc");
console.log("Đã vượt Ải 22, có thể đột phá không?", p2.canBreakthrough());
let btSuccess = p2.breakthrough();
console.log("Kết quả đột phá sau Ải 22:", btSuccess.success, "Title:", btSuccess.newTitle, "isVoCuc:", p2.isVoCuc, "Tier:", p2.tierIndex, "Tinh Nguyên:", p2.tinhNguyen);
if (!btSuccess.success || !p2.isVoCuc || p2.tierIndex !== 100) {
    throw new Error("TEST 2.2 FAILED: Đột phá Vô Cực thất bại");
}

// Kiểm tra danh xưng và trần tu vi Vô Cực
console.log("Full Title:", p2.getFullTitle());
let maxTN_101 = p2.getMaxTuVi();
console.log("Max Tinh Nguyên Tầng 101:", maxTN_101);
if (maxTN_101 !== 100) {
    throw new Error("TEST 2.3 FAILED: Max Tinh Nguyên Tầng 101 phải là 100");
}

// Test cắn đan dược trong Vô Cực
p2.inventory = ["pill_bat_hu_luan_hoi", "pill_thai_so_than_dan"];
let initialTN = p2.tinhNguyen;
p2.useConsumable("pill_bat_hu_luan_hoi");
console.log("Cắn Bất Hủ Luân Hồi Đan (+500 Tỷ Tu Vi):", "Tinh Nguyên từ", initialTN, "lên", p2.tinhNguyen);
if (p2.tinhNguyen !== initialTN + 500) {
    throw new Error("TEST 2.4 FAILED: Đan 500 Tỷ phải cho +500 Tinh Nguyên");
}

// Test đột phá lên Tầng 102 Vô Cực
let pointsBefore = p2.statPoints;
let bt102 = p2.breakthrough();
console.log("Đột phá Tầng 102:", bt102.success, "New Title:", p2.getFullTitle(), "Stat Points:", pointsBefore, "->", p2.statPoints);
if (!bt102.success || p2.tierIndex !== 101 || p2.statPoints !== pointsBefore + 4) {
    throw new Error("TEST 2.5 FAILED: Đột phá Tầng 102 thất bại");
}
console.log("Max Tinh Nguyên Tầng 102:", p2.getMaxTuVi());
if (p2.getMaxTuVi() !== 110) {
    throw new Error("TEST 2.6 FAILED: Max Tinh Nguyên Tầng 102 phải là 110 (100 + 1*10)");
}

// TEST 3: Endless Tower Tickets & Scaling
console.log("\n--- TEST 3: HƯ KHÔNG THÁP & LỆNH BÀI ---");
const p3 = new Player();
p3.honNguyen = 10000000; // 10M 🌀
let ticketRes = p3.buyTowerTicket(1);
console.log("Mua 1 vé bằng Hỗn Nguyên:", ticketRes.success, "HN còn:", p3.honNguyen, "Tickets:", p3.towerData.dailyTickets);
if (!ticketRes.success || p3.honNguyen !== 5000000 || p3.towerData.dailyTickets !== 4) {
    throw new Error("TEST 3.1 FAILED");
}

// Test mua vé bằng nén tự động từ Linh Thạch khi thiếu Hỗn Nguyên
p3.honNguyen = 0;
p3.linhThach = 6000000000000000; // 6 triệu tỷ Linh Thạch (= 6M Hỗn Nguyên)
let autoConvertTicket = p3.buyTowerTicket(1);
console.log("Mua 1 vé tự nén từ Linh Thạch:", autoConvertTicket.success, "LT còn:", p3.linhThach, "Tickets:", p3.towerData.dailyTickets);
if (!autoConvertTicket.success || p3.linhThach !== 1000000000000000 || p3.towerData.dailyTickets !== 5) {
    throw new Error("TEST 3.2 FAILED");
}

// Test Tower rewards scaling (Tầng 100+ chuyển sang Hỗn Nguyên)
let stage50 = TowerSystem.generateTowerStage(50);
console.log("Tầng 50 rewards:", stage50.rewards);
let stage250 = TowerSystem.generateTowerStage(250);
console.log("Tầng 250 rewards:", stage250.rewards);
if (!stage250.rewards.honNguyen || stage250.rewards.honNguyen <= 0) {
    throw new Error("TEST 3.3 FAILED: Tầng 250 phải thưởng Hỗn Nguyên");
}

// Test Sweep rewards (Sweep tầng 250)
let sweep = TowerSystem.calculateSweepRewards(250);
console.log("Sweep 250 rewards: Tu Vi:", sweep.totalTuVi, "HN:", sweep.totalHonNguyen, "LT:", sweep.totalLinhThach);
if (!sweep.totalHonNguyen || sweep.totalHonNguyen <= 0) {
    throw new Error("TEST 3.4 FAILED: Sweep tầng cao phải có totalHonNguyen");
}

// TEST 4: Storage Migration (V2 -> V3)
console.log("\n--- TEST 4: CHUYỂN ĐỔI BẢN LƯU (SAVE MIGRATION V2 -> V3) ---");
const oldSaveV2 = {
    saveVersion: 2,
    realmIndex: 11,
    tierIndex: 120, // Đang ở Tầng 121
    tuVi: 5000000000,
    linhThach: 10000000000,
    statPoints: 20,
    clearedStages: ["stage_21"]
};
localStorageMock.setItem(StorageSystem.SAVE_KEY, JSON.stringify(oldSaveV2));

const migratedPlayer = new Player();
let loadSuccess = StorageSystem.load(migratedPlayer);
console.log("Tải save V2 cũ -> V3: Load success =", loadSuccess);
console.log("- isVoCuc:", migratedPlayer.isVoCuc);
console.log("- Hon Nguyen:", migratedPlayer.honNguyen);
console.log("- Tinh Nguyen:", migratedPlayer.tinhNguyen);
console.log("- Cleared stage_vo_cuc:", migratedPlayer.clearedStages.includes("stage_vo_cuc"));
console.log("- Full Title:", migratedPlayer.getFullTitle());

if (!migratedPlayer.isVoCuc) {
    throw new Error("TEST 4.1 FAILED: Save Tầng > 100 phải kích hoạt isVoCuc để dùng Tinh Nguyên");
}
if (migratedPlayer.clearedStages.includes("stage_vo_cuc")) {
    throw new Error("TEST 4.2 FAILED (Phương án A): Người chơi cũ chưa đánh Ải 22 thì không được tự động có stage_vo_cuc");
}
if (migratedPlayer.canBreakthrough()) {
    throw new Error("TEST 4.3 FAILED (Phương án A): Người chơi cũ chưa đánh Ải 22 phải bị khóa đột phá");
}
let resBtOld = migratedPlayer.breakthrough();
console.log("- Thử đột phá khi chưa đánh Ải 22:", resBtOld);
if (!resBtOld.isVoCucBlocked) {
    throw new Error("TEST 4.4 FAILED (Phương án A): Phải trả về isVoCucBlocked = true");
}

// Sau khi đánh Ải 22 và có đủ Tinh Nguyên
migratedPlayer.clearedStages.push("stage_vo_cuc");
migratedPlayer.tinhNguyen = migratedPlayer.getMaxTuVi(); // Cần 300 Tinh Nguyên cho Tầng 121
if (!migratedPlayer.canBreakthrough()) {
    throw new Error("TEST 4.5 FAILED: Sau khi đánh Ải 22 và đủ Tinh Nguyên phải mở khóa đột phá");
}
let resBtPassed = migratedPlayer.breakthrough();
console.log("- Đột phá Tầng 122 sau khi hạ Ải 22:", resBtPassed.success, "New Title:", migratedPlayer.getFullTitle());
if (!resBtPassed.success || migratedPlayer.tierIndex !== 121) {
    throw new Error("TEST 4.6 FAILED: Đột phá Tầng 122 thất bại");
}
console.log("✅ Đã kiểm thử Phương án A thành công: Người chơi cũ bị khóa đột phá cho đến khi đánh Ải 22!");

console.log("\n✅ TẤT CẢ CÁC BÀI KIỂM THỬ ĐỀU ĐẠT 100%!");
