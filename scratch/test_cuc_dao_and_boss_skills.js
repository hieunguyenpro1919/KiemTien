/**
 * Automated test script for:
 * 1. Phẩm cấp Cực Đạo & 6 trang bị mới
 * 2. Kỹ năng người chơi Đốt Máu Boss (Bỏ qua Kim Thân & Khiên)
 * 3. Bộ 4 kỹ năng độc quyền cho Boss (Choáng, Sốc sát thương, Tạo khiên, Hút máu 10% HP)
 */

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

// Mock DOM
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
require("../js/engine/combat.js");

console.log("=== BẮT ĐẦU KIỂM THỬ: PHẨM CẤP CỰC ĐẠO, ĐỐT MÁU & KỸ NĂNG BOSS ===");

// -------------------------------------------------------------
// TEST 1: Phẩm cấp Cực Đạo và 6 món trang bị mới
// -------------------------------------------------------------
console.log("\n--- TEST 1: Kiểm tra Phẩm Cấp Cực Đạo và 6 Trang Bị Mới ---");
assert.strictEqual(RARITY_ORDER.cuc_dao, 7, "RARITY_ORDER.cuc_dao phải bằng 7");
assert.ok(RARITY_INFO.cuc_dao, "RARITY_INFO.cuc_dao phải tồn tại");
assert.strictEqual(RARITY_INFO.cuc_dao.name, "Cực Đạo");

const expectedItems = [
    { id: "hat_cuc_dao_01", slot: "non", currency: "hon_nguyen", price: 12000 },
    { id: "hat_cuc_dao_02", slot: "non", currency: "hon_nguyen", price: 12000 },
    { id: "armor_cuc_dao_01", slot: "giap", currency: "hon_nguyen", price: 18000 },
    { id: "armor_cuc_dao_02", slot: "giap", currency: "hon_nguyen", price: 18000 },
    { id: "weapon_cuc_dao_vat_li", slot: "vukhi", currency: "hon_nguyen", price: 15000 },
    { id: "weapon_cuc_dao_phep", slot: "vukhi", currency: "hon_nguyen", price: 15000 },
];

for (const exp of expectedItems) {
    const item = ItemSystem.getItemById(exp.id);
    assert.ok(item, `Trang bị [${exp.id}] phải tồn tại trong ITEM_DATABASE`);
    assert.strictEqual(item.slot, exp.slot, `Slot của [${exp.id}] phải là ${exp.slot}`);
    assert.strictEqual(item.rarity, "cuc_dao", `Phẩm cấp của [${exp.id}] phải là cuc_dao`);
    assert.strictEqual(item.currency, exp.currency, `Tiền tệ của [${exp.id}] phải là hon_nguyen`);
    assert.strictEqual(item.price, exp.price, `Giá của [${exp.id}] phải là ${exp.price}`);
    console.log(`✓ Trang bị [${item.name}] (${item.id}) - Slot: ${item.slot}, Giá: ${item.price} 🌀`);
}

// -------------------------------------------------------------
// TEST 2: Mua bán trang bị Cực Đạo bằng Hỗn Nguyên Thạch
// -------------------------------------------------------------
console.log("\n--- TEST 2: Kiểm tra Mua Bán Trang Bị Cực Đạo bằng Hỗn Nguyên Thạch ---");
const player = new Player();
player.realmIndex = 11;
player.tierIndex = 100;
player.honNguyen = 50000;
player.linhThach = 0;

const buyRes = player.buyItem("weapon_cuc_dao_vat_li", 1);
assert.strictEqual(buyRes.success, true, "Mua vũ khí Cực Đạo phải thành công");
assert.strictEqual(player.honNguyen, 35000, "Số dư Hỗn Nguyên phải giảm còn 35.000");
assert.ok(player.inventory.includes("weapon_cuc_dao_vat_li"), "Túi đồ phải có vũ khí vừa mua");

const sellRes = player.sellItem("weapon_cuc_dao_vat_li");
assert.strictEqual(sellRes.success, true, "Bán vũ khí Cực Đạo phải thành công");
assert.strictEqual(sellRes.gain, 5000, "Thu về 5.000 Hỗn Nguyên Thạch");
assert.strictEqual(player.honNguyen, 40000, "Số dư Hỗn Nguyên sau khi bán phải là 40.000");
console.log("✓ Mua và bán trang bị Cực Đạo bằng 🌀 Hỗn Nguyên Thạch hoạt động chính xác 100%");

// -------------------------------------------------------------
// TEST 3: Kỹ năng Đốt Máu định kỳ mỗi 1s (Bỏ qua Kim Thân & Khiên)
// -------------------------------------------------------------
console.log("\n--- TEST 3: Kỹ năng Đốt Máu định kỳ mỗi 1s (Bỏ qua Kim Thân & Khiên) ---");
const burnSkill = SkillSystem.getSkillById("skill_cuc_dao_dot_mau");
assert.ok(burnSkill, "Kỹ năng [skill_cuc_dao_dot_mau] phải tồn tại");
assert.strictEqual(burnSkill.isBurnHp, true, "Kỹ năng phải có cờ isBurnHp: true");
assert.strictEqual(burnSkill.burnDuration, 5, "Thời gian duy trì thiêu đốt là 5 giây");
assert.strictEqual(burnSkill.burnPctPerTick, 0.03, "Mỗi 1 giây đốt 3% Max HP");

const mockParticles = {
    emitSlash() {}, emitFire() {}, emitThunder() {}, emitMeditationQi() {},
    addFloatingText() {}, emitBreakthrough() {}
};
const mockSound = {
    playSlash() {}, playFireSpell() {}, playThunder() {}, playShield() {},
    playHeal() {}, playVictory() {}, playDefeat() {}
};

const combat = new CombatEngine(player, mockParticles, mockSound);
player.equippedSkills = ["skill_cuc_dao_dot_mau", null, null];

// Khởi tạo Boss với Kim Thân 20% cap và lớp khiên 500.000
const bossStage = {
    id: "stage_test_boss",
    name: "Ải Test Boss",
    number: 22,
    monster: {
        name: "Hư Không Tối Cao Ma Hoàng",
        hp: 10000000000, // 10 Tỷ HP
        attack: 5000,
        defense: 1000,
        attackSpeed: 2.0,
        isBoss: true,
        damageCapPct: 0.20,
        breakCapPct: 0.30
    }
};

combat.isAuto = false; // Tắt auto để tránh người chơi tự vung kiếm giết Boss khi đang test
combat.playerAttackTimer = -999; // Tạm khóa đòn đánh thường để test riêng biệt sát thương thiêu đốt DoT
combat.startBattle(bossStage, null);
combat.playerAttackTimer = -999;
combat.monsterShield = 500000; // Boss đang có 500k khiên

const hpInitial = combat.monsterHp;
const shieldBeforeBurn = combat.monsterShield;

// 1. Thi triển kỹ năng Đốt Máu
const used = combat.useSkill(0);
assert.strictEqual(used, true, "Thi triển kỹ năng Đốt Máu thành công");
assert.strictEqual(combat.monsterBurnDuration, 5.0, "Thời gian thiêu đốt bắt đầu đếm từ 5 giây");

// 2. Chạy 1 giây (1 nhịp đốt)
combat.tick(1.0);
assert.strictEqual(combat.monsterShield, shieldBeforeBurn, "Khiên của Boss KHÔNG được giảm (bỏ qua khiên!)");
const hpAfter1s = combat.monsterHp;
const tick1Dmg = hpInitial - hpAfter1s;
console.log(`[Giây 1] Máu Boss sau 1s: ${hpAfter1s.toLocaleString()}, Sát thương đốt: ${tick1Dmg.toLocaleString()}`);
assert.ok(tick1Dmg >= 300000000, "Sau 1 giây, sát thương đốt máu phải >= 3% Max HP (300.000.000)");

// 3. Chạy tiếp 4 giây nữa (tổng 5 nhịp đốt trong 5 giây)
for (let sec = 2; sec <= 5; sec++) {
    const hpBeforeTick = combat.monsterHp;
    combat.tick(1.0);
    const tickDmg = hpBeforeTick - combat.monsterHp;
    console.log(`[Giây ${sec}] Sát thương đốt: ${tickDmg.toLocaleString()}, Máu Boss còn: ${combat.monsterHp.toLocaleString()}`);
    assert.ok(tickDmg >= 300000000, `Sau giây ${sec}, sát thương đốt phải >= 3% Max HP`);
}

const totalBurnDmg = hpInitial - combat.monsterHp;
console.log(`Tổng sát thương thiêu đốt sau 5 giây: ${totalBurnDmg.toLocaleString()} (Máu ban đầu: ${hpInitial.toLocaleString()})`);
assert.ok(totalBurnDmg >= 1500000000, "Tổng sát thương thiêu đốt sau 5 giây phải >= 15% Max HP (1.5 Tỷ HP)");
assert.strictEqual(combat.monsterShield, shieldBeforeBurn, "Khiên của Boss vẫn nguyên vẹn 500k suốt quá trình đốt máu!");
assert.strictEqual(combat.monsterBurnDuration, 0, "Sau 5 giây, hiệu ứng thiêu đốt kết thúc (duration = 0)");

// 4. Giây thứ 6: Không còn hiệu ứng đốt máu, máu không giảm nữa
const hpAfterEnd = combat.monsterHp;
combat.tick(1.0);
assert.strictEqual(combat.monsterHp, hpAfterEnd, "Sau khi hết hiệu ứng thiêu đốt, quái không bị trừ máu nữa");

combat.stopBattle();
console.log("✓ Cơ chế Đốt Máu định kỳ mỗi 1 giây đã hoạt động chuẩn xác, HOÀN TOÀN BỎ QUA Khiên và Kim Thân!");

// -------------------------------------------------------------
// TEST 4: Bộ 4 kỹ năng độc quyền của Boss
// -------------------------------------------------------------
console.log("\n--- TEST 4: Bộ 4 Kỹ Năng Độc Quyền của Boss ---");

// A. Xác nhận quái thường KHÔNG kích hoạt kỹ năng Boss
const normalStage = {
    id: "stage_test_normal",
    name: "Ải Quái Thường",
    number: 1,
    monster: {
        name: "Linh Thảo Thỏ Yêu",
        hp: 500,
        attack: 20,
        defense: 5,
        attackSpeed: 2.0,
        isBoss: false // Quái thường
    }
};

combat.startBattle(normalStage, null);
// Chạy tick 10s
for (let i = 0; i < 100; i++) {
    combat.tick(0.1);
}
assert.strictEqual(combat.bossSkillTimer, 0, "Quái thường không được tích lũy bossSkillTimer");
assert.strictEqual(combat.monsterShield, 0, "Quái thường không được có khiên Boss");
assert.strictEqual(combat.playerStunTimer, 0, "Quái thường không thể làm choáng người chơi");
combat.stopBattle();
console.log("✓ Quái thường (isBoss: false) KHÔNG kích hoạt bất kỳ kỹ năng nào của Boss!");

// B. Kiểm tra Boss: Kỹ năng 1 - Choáng (Stun)
player.equipped = {
    non: "hat_cuc_dao_01",
    giap: "armor_cuc_dao_01",
    vukhi: "weapon_cuc_dao_vat_li"
};
combat.startBattle(bossStage, null);
combat.bossSkillIndex = 0; // Kỹ năng 0 = stun
combat.bossCastSkill();

assert.strictEqual(combat.playerStunTimer, 2.0, "Kỹ năng Stun phải làm người chơi bị choáng 2.0s");

// Khi bị choáng, bấm kỹ năng phải bị từ chối
player.equippedSkills = ["skill_cuc_dao_dot_mau", null, null];
combat.skillCooldowns[0] = 0;
const castWhileStunned = combat.useSkill(0);
assert.strictEqual(castWhileStunned, false, "Người chơi không thể xuất chiêu khi đang bị Choáng!");

// Chạy 2.1s để hết choáng
combat.tick(2.1);
assert.strictEqual(combat.playerStunTimer, 0, "Sau 2.1s thì người chơi phải hết Choáng");
console.log("✓ Kỹ năng [Choáng] (Stun 2.0s) hoạt động chính xác, khóa đòn đánh & kỹ năng!");

// C. Kiểm tra Boss: Kỹ năng 2 - Sốc Sát Thương (Burst)
combat.bossSkillIndex = 1; // Kỹ năng 1 = burst
const playerHpBeforeBurst = combat.playerHp;
combat.bossCastSkill();
const playerDamageTaken = playerHpBeforeBurst - combat.playerHp;
assert.ok(playerDamageTaken > 0, "Người chơi phải nhận sát thương từ cú sốc");
console.log(`✓ Kỹ năng [Sốc Sát Thương] gây ${playerDamageTaken.toLocaleString()} sát thương bộc phát!`);

// D. Kiểm tra Boss: Kỹ năng 3 - Tạo Khiên (Shield 15% Max HP)
combat.bossSkillIndex = 2; // Kỹ năng 2 = shield
combat.monsterShield = 0;
combat.bossCastSkill();
const expectedShield = Math.floor(combat.monsterMaxHp * 0.15);
assert.strictEqual(combat.monsterShield, expectedShield, "Boss phải nhận khiên bằng đúng 15% Máu tối đa");
console.log(`✓ Kỹ năng [Tạo Khiên] ngưng tụ ${combat.monsterShield.toLocaleString()} HP khiên bảo vệ Boss!`);

// Đòn đánh thường phải bị khiên hấp thụ trước
const shieldBeforeHit = combat.monsterShield;
const bossHpBeforeHit = combat.monsterHp;
combat.playerBasicAttack();
assert.ok(combat.monsterShield < shieldBeforeHit, "Đòn đánh thường phải bào mòn khiên Boss");
assert.strictEqual(combat.monsterHp, bossHpBeforeHit, "Máu Boss không bị trừ chừng nào khiên còn nguyên vẹn");
console.log(`✓ Khiên của Boss đã hấp thụ thành công đòn đánh thường của người chơi!`);

// E. Kiểm tra Boss: Kỹ năng 4 - Hút Máu (Life Steal)
// "tối đa 10% hp người chơi bỏ qua khiên thành 10% hp cho boss"
combat.bossSkillIndex = 3; // Kỹ năng 3 = lifesteal
combat.playerShield = 10000000; // Người chơi có 10 Triệu khiên
combat.monsterHp = 5000000; // Boss bị mất nửa máu

const pMaxHp = combat.playerMaxHp;
const pExpectedDrain = Math.floor(pMaxHp * 0.10);
const mExpectedHeal = Math.floor(combat.monsterMaxHp * 0.10);

const pHpBeforeDrain = combat.playerHp;
const mHpBeforeDrain = combat.monsterHp;
const pShieldBeforeDrain = combat.playerShield;

combat.bossCastSkill();

// Xác nhận:
// 1. Khiên của người chơi KHÔNG bị trừ (bỏ qua khiên!)
assert.strictEqual(combat.playerShield, pShieldBeforeDrain, "Khiên của người chơi phải giữ nguyên (bỏ qua khiên)");
// 2. Máu của người chơi bị trừ đúng 10% Max HP
assert.strictEqual(combat.playerHp, pHpBeforeDrain - pExpectedDrain, "Người chơi phải bị trừ đúng 10% Max HP");
// 3. Boss hồi phục đúng 10% Max HP của Boss
assert.strictEqual(combat.monsterHp, mHpBeforeDrain + mExpectedHeal, "Boss phải hồi phục đúng 10% Max HP của Boss");

console.log(`✓ Kỹ năng [Hút Máu] trừ đúng ${pExpectedDrain.toLocaleString()} HP của người chơi (bỏ qua khiên) và hồi đúng ${mExpectedHeal.toLocaleString()} HP cho Boss!`);

combat.stopBattle();

console.log("\n=======================================================");
console.log("🎉 TẤT CẢ 4 BỘ TEST ĐÃ VƯỢT QUA VỚI ĐỘ CHÍNH XÁC TUYỆT ĐỐI (100%)!");
console.log("=======================================================");
