const assert = require("assert");

// 1. Mock globals
global.window = global;
const localStorageMock = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
};
global.localStorage = localStorageMock;

// 2. Load game dependencies
require("../js/data/realms.js");
require("../js/data/titles.js");
require("../js/data/items.js");
require("../js/data/skills.js");
require("../js/data/skills_ultimate.js");
require("../js/data/stages.js");
require("../js/data/tower.js");
const Player = require("../js/state/player.js");
const CombatEngine = require("../js/engine/combat.js");

console.log("=== BẮT ĐẦU KIỂM THỬ 2 KỸ NĂNG VÔ CỰC MỚI ===");

// TEST 1: Kiểm tra thông số và điều kiện cảnh giới
console.log("\n--- TEST 1: Kiểm tra định nghĩa & điều kiện học bí kíp ---");
const skillThuan = SkillSystem.getSkillById("skill_dai_dao_hon_nguyen_thuan");
const skillSinhCo = SkillSystem.getSkillById("skill_dai_dao_bat_diet_sinh_co");

assert(skillThuan, "Kỹ năng Hỗn Nguyên Thái Sơ Thuẫn phải tồn tại");
assert.strictEqual(skillThuan.reqRealm, 11);
assert.strictEqual(skillThuan.reqTier, 400);
assert.strictEqual(skillThuan.currency, "hon_nguyen");
assert.strictEqual(skillThuan.price, 5000);
assert.strictEqual(skillThuan.multiplier, 5.0);

assert(skillSinhCo, "Kỹ năng Đại Đạo Bất Diệt Luân Hồi Quyết phải tồn tại");
assert.strictEqual(skillSinhCo.reqRealm, 11);
assert.strictEqual(skillSinhCo.reqTier, 700);
assert.strictEqual(skillSinhCo.currency, "hon_nguyen");
assert.strictEqual(skillSinhCo.price, 10000);
assert.strictEqual(skillSinhCo.healFullHp, true);
assert.strictEqual(skillSinhCo.shieldMultiplier, 0.8);

console.log("✓ Định nghĩa 2 kỹ năng chính xác 100%.");

// TEST 2: Thử mua bí kíp bằng Hỗn Nguyên và tự động nén Linh Thạch
console.log("\n--- TEST 2: Mua bí kíp bằng Hỗn Nguyên & Tự động nén từ Linh Thạch ---");
const p = new Player();
p.realmIndex = 11;
p.tierIndex = 500; // Tầng 501 Vô Cực (đủ điều kiện học skillThuan, chưa đủ skillSinhCo)

// Chưa đủ tier cho skillSinhCo (cần 700, hiện tại 500)
const tryLearnFail = p.learnSkill("skill_dai_dao_bat_diet_sinh_co");
assert.strictEqual(tryLearnFail.success, false, "Chưa đạt Tầng 700 không được học skillSinhCo");

// Thử mua skillThuan khi không đủ tiền
p.honNguyen = 1000;
p.linhThach = 10000000; // Không đủ 5000 HN
const tryMoneyFail = p.learnSkill("skill_dai_dao_hon_nguyen_thuan");
assert.strictEqual(tryMoneyFail.success, false, "Không đủ tiền phải bị từ chối");

// Cung cấp đủ Hỗn Nguyên Thạch (5000 🌀)
p.honNguyen = 5000;
const buySuccessHN = p.learnSkill("skill_dai_dao_hon_nguyen_thuan");
assert.strictEqual(buySuccessHN.success, true, "Mua thành công bằng Hỗn Nguyên Thạch");
assert.strictEqual(p.honNguyen, 0);
assert(p.learnedSkills.includes("skill_dai_dao_hon_nguyen_thuan"));
console.log("✓ Mua thành công bằng Hỗn Nguyên Thạch.");

// Thăng lên Tầng 800 để học skillSinhCo bằng cơ chế tự nén Linh Thạch
p.tierIndex = 800;
p.honNguyen = 2000; // Có 2.000 🌀 (còn thiếu 8.000 🌀)
p.linhThach = 8000000000000; // Có 8.000 Tỷ 💎 Linh Thạch -> tự động nén thành 8.000 🌀!
const buySuccessCompress = p.learnSkill("skill_dai_dao_bat_diet_sinh_co");
assert.strictEqual(buySuccessCompress.success, true, "Mua thành công nhờ tự động nén Linh Thạch");
assert.strictEqual(p.honNguyen, 0);
assert.strictEqual(p.linhThach, 0);
assert(p.learnedSkills.includes("skill_dai_dao_bat_diet_sinh_co"));
console.log("✓ Mua thành công nhờ cơ chế tự động nén Linh Thạch sang Hỗn Nguyên!");

// TEST 3: Thực thi trong Combat - Hỗn Nguyên Thái Sơ Thuẫn (Khiên 500% Max HP)
console.log("\n--- TEST 3: Thực thi Hỗn Nguyên Thái Sơ Thuẫn (Khiên 500% Max HP) ---");
p.equippedSkills = ["skill_dai_dao_hon_nguyen_thuan", "skill_dai_dao_bat_diet_sinh_co", null];
const combat = new CombatEngine(p);
combat.playerMaxHp = 1000000; // 1 Triệu HP
combat.playerHp = 1000000;
combat.playerShield = 0;
combat.isActive = true;
combat.monsterHp = 50000000;
combat.monsterMaxHp = 50000000;
combat.monster = { name: "Thử Nghiệm Boss", defense: 0, attack: 100 };

combat.useSkill(0); // Dùng Hỗn Nguyên Thái Sơ Thuẫn
console.log(`Khiên nhận được sau khi dùng Thuẫn: ${combat.playerShield.toLocaleString()} (Max HP: ${combat.playerMaxHp.toLocaleString()})`);
assert.strictEqual(combat.playerShield, 5000000, "Lớp khiên nhận được phải bằng ĐÚNG 500% Max HP (5 Triệu)!");
console.log("✓ Khiên 500% Max HP đã được cộng đầy đủ, không bị giới hạn 120%!");

// TEST 4: Thực thi trong Combat - Đại Đạo Bất Diệt Luân Hồi Quyết (Hồi 100% HP + Khiên 80% HP)
console.log("\n--- TEST 4: Thực thi Đại Đạo Bất Diệt Luân Hồi Quyết (Hồi 100% HP + Khiên 80% HP) ---");
combat.playerHp = 50000; // Máu tụt còn 50.000 / 1.000.000 (sắp chết)
combat.playerShield = 0; // Hết khiên

combat.useSkill(1); // Dùng Đại Đạo Bất Diệt Luân Hồi Quyết
console.log(`Sau khi dùng Luân Hồi Quyết: Máu = ${combat.playerHp.toLocaleString()} / ${combat.playerMaxHp.toLocaleString()}, Khiên = ${combat.playerShield.toLocaleString()}`);
assert.strictEqual(combat.playerHp, combat.playerMaxHp, "Máu phải lập tức hồi đầy 100% (1 Triệu HP)!");
assert.strictEqual(combat.playerShield, 800000, "Khiên hộ mệnh nhận được phải bằng ĐÚNG 80% Max HP (800.000)!");
console.log("✓ Hồi đầy 100% Khí Huyết và nhận thêm Khiên 80% Max HP chính xác 100%!");

console.log("\n🎉 TOÀN BỘ CÁC BÀI TEST 2 KỸ NĂNG VÔ CỰC MỚI ĐÃ VƯỢT QUA 100%!");
