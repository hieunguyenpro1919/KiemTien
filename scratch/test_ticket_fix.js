const assert = require('assert');

// Mock browser DOM & Storage
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

// Require dependencies in index.html order
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

console.log("================ BẮT ĐẦU KIỂM THỬ SỬA LỖI VÉ TẦM ĐẠO ================\\n");

// 1. Kiểm tra khởi tạo Player: Vé Tầm Đạo tự động quy đổi vào gachaTickets
console.log("--- TEST 1: Khởi tạo Player & Tự Động Quy Đổi Vé trong Túi ---");
const p1 = new Player();
assert.strictEqual(p1.inventory.includes("ticket_tam_dao"), false, "Túi đồ không được giữ lại ticket_tam_dao thô");
assert.strictEqual(p1.gachaTickets, 2, "gachaTickets khởi tạo phải = 1 (default) + 1 (từ inventory starter) = 2 vé");
console.log("✓ TEST 1 PASSED: Khởi tạo người chơi tự động nạp vé từ túi đồ vào gachaTickets:", p1.gachaTickets);

// 2. Kiểm tra Mua Vé tại Bách Bảo Các (Lẻ, x10, và Mua Hết)
console.log("\\n--- TEST 2: Mua Vé tại Bách Bảo Các (Nạp Thẳng Đài Cầu Đạo) ---");
p1.honNguyen = 50000000; // 50M Hỗn Nguyên

// Mua 1 vé
const buy1 = p1.buyItem("ticket_tam_dao", 1);
assert.strictEqual(buy1.success, true);
assert.strictEqual(buy1.isGachaTicket, true);
assert.strictEqual(p1.inventory.includes("ticket_tam_dao"), false, "Vé không được lưu trong túi đồ");
assert.strictEqual(p1.gachaTickets, 3, "gachaTickets phải tăng từ 2 lên 3");
console.log("✓ TEST 2.1: Mua 1 vé nạp thẳng Đài Cầu Đạo, tổng vé:", p1.gachaTickets);

// Mua 5 vé
const buy5 = p1.buyItem("ticket_tam_dao", 5);
assert.strictEqual(buy5.success, true);
assert.strictEqual(p1.gachaTickets, 8, "gachaTickets phải tăng lên 8");
console.log("✓ TEST 2.2: Mua 5 vé nạp thẳng Đài Cầu Đạo, tổng vé:", p1.gachaTickets);

// Mua tối đa (buyMaxPill)
p1.honNguyen = 2500000; // 2.5M Hỗn Nguyên = mua được đúng 5 vé (500k/vé)
const buyMax = p1.buyMaxPill("ticket_tam_dao");
assert.strictEqual(buyMax.success, true);
assert.strictEqual(buyMax.count, 5);
assert.strictEqual(buyMax.isGachaTicket, true);
assert.strictEqual(p1.gachaTickets, 13, "gachaTickets phải tăng từ 8 lên 13");
console.log("✓ TEST 2.3: Mua tối đa (buyMaxPill) nạp thẳng Đài Cầu Đạo, tổng vé:", p1.gachaTickets);

// 3. Kiểm tra nạp save cũ có chứa ticket_tam_dao trong inventory
console.log("\\n--- TEST 3: Nạp Save Cũ có Vé Tầm Đạo trong Túi Đồ ---");
const oldSaveData = {
    saveVersion: 3,
    name: "Tiêu Viêm Cũ",
    realmIndex: 3,
    tierIndex: 1,
    gachaTickets: 0,
    inventory: ["hat_01", "ticket_tam_dao", "ticket_tam_dao", "ticket_tam_dao", "pill_tu_khi_tieu"]
};
const pOld = new Player();
pOld.fromJSON(oldSaveData);
assert.strictEqual(pOld.inventory.filter(id => id === "ticket_tam_dao").length, 0, "Vé trong túi phải được quét sạch");
assert.strictEqual(pOld.gachaTickets, 3, "gachaTickets phải được quy đổi thành công 3 vé");
console.log("✓ TEST 3 PASSED: Nạp save cũ tự động chuyển 3 vé từ túi đồ sang gachaTickets:", pOld.gachaTickets);

// 4. Kiểm tra useAllConsumables và useConsumable
console.log("\\n--- TEST 4: Dùng Vé trong Túi Đồ (Nếu có) qua useConsumable / useAllConsumables ---");
pOld.inventory.push("ticket_tam_dao", "ticket_tam_dao");
const resUseAll = pOld.useAllConsumables("ticket_tam_dao");
assert.strictEqual(resUseAll.success, true);
assert.strictEqual(resUseAll.count, 2);
assert.strictEqual(resUseAll.isGachaTicket, true);
assert.strictEqual(pOld.gachaTickets, 5, "gachaTickets phải tăng từ 3 lên 5");
assert.strictEqual(resUseAll.msg.includes("Vé Tầm Đạo"), true, "Thông điệp phải chứa Vé Tầm Đạo");
assert.strictEqual(pOld.inventory.filter(id => id === "ticket_tam_dao").length, 0);
console.log("✓ TEST 4 PASSED: useAllConsumables cộng đúng vé:", resUseAll.msg);

// 5. Kiểm tra UI renderGachaTab & Tầm Đạo Tất Cả (handleGachaRollAll)
console.log("\\n--- TEST 5: Kiểm tra UI Đài Cầu Đạo & Nút Tầm Đạo Hết Vé ---");
const dummySound = { playHeal: () => {}, playClick: () => {}, playBreakthrough: () => {}, playFail: () => {}, playEquip: () => {} };
const combat = new CombatEngine(pOld, null, dummySound);
const ui = new UIController(pOld, combat, null, dummySound);

// Cố tình đẩy thêm 2 vé vào inventory để kiểm tra quét tự động khi mở Đài Cầu Đạo
pOld.inventory.push("ticket_tam_dao", "ticket_tam_dao");
assert.strictEqual(pOld.gachaTickets, 5);

ui.switchTab("gacha");
// Sau khi renderGachaTab, 2 vé trong inventory phải tự nạp vào
assert.strictEqual(pOld.gachaTickets, 7, "Đài Cầu Đạo phải tự động thu hồi 2 vé từ túi đồ nâng tổng lên 7");
assert.strictEqual(elements["gacha-tickets-count"].innerText, "7 Vé", "Nhãn hiển thị vé tại Đài Cầu Đạo phải là '7 Vé'");
console.log("✓ TEST 5.1: Đài Cầu Đạo hiển thị đúng số vé khả dụng:", elements["gacha-tickets-count"].innerText);

// Kiểm tra nút Tầm Đạo Hết Vé (handleGachaRollAll)
ui.handleGachaRollAll();
assert.strictEqual(pOld.gachaTickets, 0, "Sau khi dùng hết 7 vé, gachaTickets còn lại phải = 0");
assert.strictEqual(elements["gacha-tickets-count"].innerText, "0 Vé", "Nhãn Đài Cầu Đạo cập nhật = 0 Vé");
console.log("✓ TEST 5.2: Tầm Đạo Hết Vé thành công, số vé còn lại:", pOld.gachaTickets);

// Kiểm tra bấm Tầm Đạo Hết Vé khi không còn vé nào
let failedToast = "";
ui.showToast = (msg) => { failedToast = msg; };
ui.handleGachaRollAll();
assert.strictEqual(failedToast.includes("Không có Vé Tầm Đạo nào"), true, "Phải báo lỗi khi hết vé");
console.log("✓ TEST 5.3: Báo lỗi chính xác khi không có vé nào:", failedToast);

console.log("\\n🎉 TẤT CẢ CÁC BÀI KIỂM THỬ ĐÃ VƯỢT QUA XUẤT SẮC! HỆ THỐNG ĐÃ HOÀN TOÀN ĐƯỢC KHẮC PHỤC!");
