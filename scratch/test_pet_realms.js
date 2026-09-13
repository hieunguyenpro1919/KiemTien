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

// Require dependencies in order
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

console.log("================ BẮT ĐẦU KIỂM THỬ CẢNH GIỚI TU VI CỦA THẦN THÚ ================\n");

// 1. Kiểm tra chính xác 12 Cảnh Giới của Thần Thú
console.log("--- TEST 1: Kiểm tra 12 Cảnh Giới của Thần Thú ---");
const expectedRealms = [
    "Tôi Khí Cảnh",
    "Ngưng Khí Cảnh",
    "Linh Hải Cảnh",
    "Tạo Đảo Cảnh",
    "Nguyên Linh Thụ",
    "Tạo Hóa Đài",
    "Thông Thiên Trụ",
    "Ngọc Điện Cảnh",
    "Đỉnh Cấp Ngai",
    "Vô Thượng Lộ",
    "Vạn Vì Tinh Tú",
    "Đại Đạo Chí Cao Vô Thượng"
];

assert.strictEqual(PET_REALMS.length, 12, "Số lượng Cảnh giới Pet phải đúng bằng 12");

for (let i = 0; i < 12; i++) {
    const realm = PetSystem.getRealm(i);
    assert.strictEqual(realm.index, i);
    assert.strictEqual(realm.name, expectedRealms[i], `Cảnh giới ${i} phải là '${expectedRealms[i]}'`);
    console.log(`✓ Cảnh giới ${i}: [${realm.name}] - Cần ${realm.reqExp.toLocaleString()} Tu Vi - Màu: ${realm.titleColor}`);
}

// 2. Kiểm tra các Đan Dược Dược Dẫn nâng cấp Thần Thông trong ITEM_DATABASE
console.log("\n--- TEST 2: Kiểm tra Đan Dược Mốc Nâng Cấp Thần Thông ---");
for (let lvl = 1; lvl <= 11; lvl++) {
    const cost = PetSystem.getSkillUpgradeCost("pet_tank", lvl);
    if (cost.pillId) {
        const item = ItemSystem.getItemById(cost.pillId);
        assert(item !== null, `Vật phẩm dược dẫn ${cost.pillId} (${cost.pillName}) phải tồn tại trong ITEM_DATABASE`);
        console.log(`✓ Lên Cấp ${cost.targetLevel} (Cảnh Giới ${cost.reqRealm} - ${PetSystem.getRealm(cost.reqRealm).name}): Yêu cầu 1x [${item.name}] (${cost.pillId})`);
    }
}

// 3. Kiểm tra Đột Phá Thần Thú qua từng Cảnh Giới
console.log("\n--- TEST 3: Kiểm tra Đột Phá Thần Thú từ Cảnh Giới 0 -> 11 ---");
const player = new Player();
player.pets.pet_dps.unlocked = true;

for (let i = 0; i < 11; i++) {
    const curRealm = PetSystem.getRealm(player.pets.pet_dps.realm);
    player.pets.pet_dps.exp = curRealm.reqExp;
    const res = player.breakthroughPet("pet_dps");
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.newRealm, i + 1);
    assert.strictEqual(res.newRealmName, expectedRealms[i + 1]);
    console.log(`✓ Đột phá thành công lên Cảnh giới ${res.newRealm}: [${res.newRealmName}]!`);
}

assert.strictEqual(player.pets.pet_dps.realm, 11);
const maxRes = player.breakthroughPet("pet_dps");
assert.strictEqual(maxRes.success, false, "Đạt Cảnh giới 11 không thể đột phá thêm");
console.log("✓ Chặn đột phá khi đã đạt Đại Đạo Chí Cao Vô Thượng thành công!");

// 4. Kiểm tra Nuôi Dưỡng Tu Vi (Ăn Đan Dược)
console.log("\n--- TEST 4: Nuôi Dưỡng Tu Vi Bằng Đan Dược Game ---");
player.pets.pet_tank.unlocked = true;
player.inventory = ["pill_tu_khi_tieu", "pill_tu_khi_tieu", "pill_tu_khi_trung"];
// 2x 100 + 1x 500 = 700 Exp => Đủ đột phá Cảnh giới 0 (500 Exp)
const feedRes = player.feedPetMax("pet_tank");
assert.strictEqual(feedRes.success, true);
assert.strictEqual(feedRes.totalPills, 3);
assert.strictEqual(feedRes.totalExp, 700);
assert.strictEqual(feedRes.canBreakthrough, true);
console.log(`✓ Cho ăn Max thành công: ${feedRes.totalPills} viên đan, nhận +${feedRes.totalExp} Tu Vi, có thể đột phá: ${feedRes.canBreakthrough}`);

console.log("\n🎉 TẤT CẢ CÁC BÀI TEST CẢNH GIỚI THẦN THÚ ĐÃ VƯỢT QUA XUẤT SẮC 100%!");
