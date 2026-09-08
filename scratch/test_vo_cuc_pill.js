const assert = require("assert");

// Mock browser globals
global.window = global;
global.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
};
global.document = {
    getElementById: (id) => null,
    querySelectorAll: (s) => [],
    createElement: (tag) => ({
        style: {},
        classList: { add() {}, remove() {}, toggle() {} },
        appendChild() {},
        setAttribute() {},
        children: []
    })
};

// Load modules
require("../js/data/realms.js");
require("../js/data/items.js");
require("../js/data/skills.js");
require("../js/data/stages.js");
require("../js/data/titles.js");
require("../js/state/player.js");

console.log("=== BẮT ĐẦU KIỂM THỬ: VÔ CỰC ĐẠI ĐẠO BẤT HỦ THẦN ĐAN ===");

// 1. Kiểm tra định nghĩa vật phẩm trong database
console.log("\n--- TEST 1: Kiểm tra định nghĩa vật phẩm ---");
const pill = ItemSystem.getItemById("pill_vo_cuc_dai_dao");
assert.ok(pill, "Vật phẩm [pill_vo_cuc_dai_dao] phải tồn tại trong ITEM_DATABASE");
assert.strictEqual(pill.name, "Vô Cực Đại Đạo Bất Hủ Thần Đan");
assert.strictEqual(pill.slot, "dan_duoc");
assert.strictEqual(pill.rarity, "cuc_dao");
assert.strictEqual(pill.currency, "hon_nguyen");
assert.strictEqual(pill.price, 25000);
assert.strictEqual(pill.sellPrice, 8000);
assert.strictEqual(pill.tinhNguyenGain, 1000);
assert.strictEqual(pill.reqRealm, 11);
console.log("✓ Định nghĩa [pill_vo_cuc_dai_dao] chính xác 100%");

// 2. Kiểm tra Mua Bán bằng Hỗn Nguyên Thạch & Cơ chế tự động nén từ Linh Thạch
console.log("\n--- TEST 2: Mua bán bằng Hỗn Nguyên Thạch & Tự động nén từ Linh Thạch ---");
const player = new Player();
player.realmIndex = 11;
player.tierIndex = 100;
player.isVoCuc = true;
player.tinhNguyen = 0;
player.pillsConsumed = 0;

// Trường hợp A: Đủ Hỗn Nguyên (có 50.000 🌀)
player.honNguyen = 50000;
player.linhThach = 0;
const buyRes1 = player.buyItem("pill_vo_cuc_dai_dao", 1);
assert.strictEqual(buyRes1.success, true);
assert.strictEqual(player.honNguyen, 25000, "Đã trừ đúng 25.000 Hỗn Nguyên");
assert.strictEqual(player.inventory.includes("pill_vo_cuc_dai_dao"), true);
console.log("✓ Mua trực tiếp bằng Hỗn Nguyên Thạch thành công");

// Trường hợp B: Thiếu Hỗn Nguyên nhưng đủ Linh Thạch (có 5.000 🌀 và 25.000 Tỷ 💎)
player.honNguyen = 5000;
player.linhThach = 25000000000000; // 25.000 Tỷ Linh Thạch
const buyRes2 = player.buyItem("pill_vo_cuc_dai_dao", 1); // cần 25.000 🌀 (thiếu 20.000 🌀 = 20.000 Tỷ 💎)
assert.strictEqual(buyRes2.success, true);
assert.strictEqual(player.honNguyen, 0);
assert.strictEqual(player.linhThach, 5000000000000, "Đã tự động nén 20.000 Tỷ Linh Thạch bù vào 20.000 Hỗn Nguyên còn thiếu");
console.log("✓ Cơ chế tự động nén Linh Thạch khi mua Thần Đan hoạt động hoàn hảo");

// Trường hợp C: Bán lại vật phẩm thu về Hỗn Nguyên Thạch
const initialHN = player.honNguyen;
const sellRes = player.sellItem("pill_vo_cuc_dai_dao");
assert.strictEqual(sellRes.success, true);
assert.strictEqual(player.honNguyen, initialHN + 8000, "Bán lại thu về đúng 8.000 🌀 Hỗn Nguyên Thạch");
console.log("✓ Bán lại Thần Đan thu về đúng 8.000 🌀 Hỗn Nguyên Thạch");

// 3. Kiểm tra Dùng 1 viên (Cắn lẻ)
console.log("\n--- TEST 3: Dùng 1 viên (Cắn lẻ) ---");
player.inventory = ["pill_vo_cuc_dai_dao"];
player.tinhNguyen = 500;
player.pillsConsumed = 10;

const useSingleRes = player.useConsumable("pill_vo_cuc_dai_dao");
assert.strictEqual(useSingleRes.success, true);
assert.strictEqual(useSingleRes.isTinhNguyen, true);
assert.strictEqual(useSingleRes.isVoCucToast, true);
assert.strictEqual(useSingleRes.gainAmount, 1000);
assert.strictEqual(player.tinhNguyen, 1500, "Tinh Nguyên tăng đúng từ 500 lên 1.500 (+1.000)");
assert.strictEqual(player.pillsConsumed, 11, "Đã tăng số đan dược tiêu thụ lên 11");
assert.strictEqual(player.inventory.length, 0, "Viên thuốc đã được dùng hết khỏi túi");
console.log("✓ Dùng lẻ 1 viên tăng trực tiếp +1.000 Tinh Nguyên nguyên bản (không qua Tu Vi)");

// 4. Kiểm tra Dùng Hết (Nuốt nhanh hàng loạt)
console.log("\n--- TEST 4: Dùng Hết (Nuốt nhanh hàng loạt) ---");
player.inventory = [
    "pill_vo_cuc_dai_dao",
    "pill_vo_cuc_dai_dao",
    "pill_vo_cuc_dai_dao",
    "hat_cuc_dao_01" // Trang bị khác trong túi
];
player.tinhNguyen = 1500;
player.pillsConsumed = 11;

const useAllRes = player.useAllConsumables("pill_vo_cuc_dai_dao");
assert.strictEqual(useAllRes.success, true);
assert.strictEqual(useAllRes.count, 3, "Đã dùng đúng 3 viên");
assert.strictEqual(useAllRes.isTinhNguyen, true);
assert.strictEqual(useAllRes.isVoCucToast, true);
assert.strictEqual(useAllRes.totalTuVi, 3000, "Tổng Tinh Nguyên nhận được là 3.000");
assert.strictEqual(player.tinhNguyen, 4500, "Tinh Nguyên tăng từ 1.500 lên 4.500 (+3.000)");
assert.strictEqual(player.pillsConsumed, 14, "Đã tăng số đan dược tiêu thụ lên 14");
assert.strictEqual(player.inventory.includes("pill_vo_cuc_dai_dao"), false, "Không còn viên nào trong túi");
assert.strictEqual(player.inventory.length, 1, "Vật phẩm khác trong túi không bị ảnh hưởng");
console.log("✓ Dùng Hết 3 viên Thần Đan tăng đúng +3.000 Tinh Nguyên và dọn sạch túi đồ");

// 5. Kiểm tra Mua Hết (buyMaxPill)
console.log("\n--- TEST 5: Mua Hết (buyMaxPill) với Hỗn Nguyên & Linh Thạch ---");
player.honNguyen = 30000; // 30.000 HN (đủ 1 viên giá 25k, dư 5k)
player.linhThach = 45000000000000; // 45.000 Tỷ LT = 45.000 HN. Tổng cộng = 75.000 HN = đủ đúng 3 viên!
player.inventory = [];

const buyMaxRes = player.buyMaxPill("pill_vo_cuc_dai_dao");
assert.strictEqual(buyMaxRes.success, true);
assert.strictEqual(buyMaxRes.count, 3, "Mua tối đa được đúng 3 viên (tổng 75.000 🌀)");
assert.strictEqual(player.inventory.filter(id => id === "pill_vo_cuc_dai_dao").length, 3);
console.log("✓ Mua Hết Thần Đan (buyMaxPill) tính toán chính xác số lượng và tự động nén tiền tệ");

console.log("\n=======================================================");
console.log("🎉 TẤT CẢ CÁC BÀI KIỂM THỬ THẦN ĐAN ĐÃ ĐẠT 100%!");
console.log("=======================================================");
