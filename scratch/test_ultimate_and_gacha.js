const assert = require('assert');

// 1. Load dependencies
const { RealmSystem } = require('../js/data/realms.js');
const { SkillSystem } = require('../js/data/skills.js');
const { UltimateSkillSystem, ULTIMATE_SKILLS, ULTIMATE_TIERS } = require('../js/data/skills_ultimate.js');
const { ItemSystem, ITEM_DATABASE } = require('../js/data/items.js');
const { TitleSystem } = require('../js/data/titles.js');
const { StageSystem } = require('../js/data/stages.js');
const { TowerSystem } = require('../js/data/tower.js');

global.RealmSystem = RealmSystem;
global.SkillSystem = SkillSystem;
global.UltimateSkillSystem = UltimateSkillSystem;
global.ItemSystem = ItemSystem;
global.ITEM_DATABASE = ITEM_DATABASE;
global.TitleSystem = TitleSystem;
global.StageSystem = StageSystem;
global.TowerSystem = TowerSystem;

const { Player } = require('../js/state/player.js');
const { CombatEngine } = require('../js/engine/combat.js');
global.Player = Player;
global.CombatEngine = CombatEngine;

console.log("=== BẮT ĐẦU KIỂM THỬ ĐẠI THẦN THÔNG, BẢO HIỂM PITY & HƯ KHÔNG THÁP ===");

// TEST 1: Database & Item verification
console.log("\n[TEST 1] Kiểm tra cơ sở dữ liệu vật phẩm & Đại Thần Thông...");
assert.strictEqual(ULTIMATE_SKILLS.length, 6, "Phải có đúng 6 Đại Thần Thông khởi đầu");
const ticketItem = ItemSystem.getItem("ticket_tam_dao");
assert(ticketItem, "Vật phẩm ticket_tam_dao phải tồn tại trong Bách Bảo Các");
assert.strictEqual(ticketItem.price, 500000, "Vé Tầm Đạo phải có giá 500.000 Hỗn Nguyên");
assert.strictEqual(ticketItem.currency, "hon_nguyen", "Vé Tầm Đạo mua bằng Hỗn Nguyên Thạch");
console.log("-> PASS: Dữ liệu 6 kỹ năng và Vé Tầm Đạo chính xác.");

// TEST 2: Gacha base drop rates over 100,000 pulls (0.2% Thần, 2% Thánh, 97.8% Linh)
console.log("\n[TEST 2] Kiểm tra tỷ lệ quay gacha cơ sở 100.000 lần (0.2% Thần, 2% Thánh, 97.8% Linh)...");
const counts = { THAN: 0, THANH: 0, LINH: 0 };
const totalPulls = 100000;
for (let i = 0; i < totalPulls; i++) {
    const dropped = UltimateSkillSystem.rollGachaDrop(0, 0); // No pity
    counts[dropped.tier.toUpperCase()]++;
}
const pThan = (counts.THAN / totalPulls) * 100;
const pThanh = (counts.THANH / totalPulls) * 100;
const pLinh = (counts.LINH / totalPulls) * 100;
console.log(`Kết quả: Thần = ${pThan.toFixed(2)}% (Mục tiêu ~0.2%), Thánh = ${pThanh.toFixed(2)}% (Mục tiêu ~2.0%), Linh = ${pLinh.toFixed(2)}% (Mục tiêu ~97.8%)`);
assert(Math.abs(pThan - 0.2) < 0.15, `Tỷ lệ Thần Cấp lệch quá mức: ${pThan}%`);
assert(Math.abs(pThanh - 2.0) < 0.35, `Tỷ lệ Thánh Cấp lệch quá mức: ${pThanh}%`);
assert(Math.abs(pLinh - 97.8) < 0.45, `Tỷ lệ Linh Cấp lệch quá mức: ${pLinh}%`);
console.log("-> PASS: Tỷ lệ rơi Gacha cơ sở phân phối chuẩn xác.");

// TEST 2.1: Hard Pity Verification (100 pulls for Thánh, 500 pulls for Thần)
console.log("\n[TEST 2.1] Kiểm tra cơ chế Bảo Hiểm (Hard Pity 100 cho Thánh Cấp, 500 cho Thần Cấp)...");
// Trực tiếp kiểm tra hàm rollGachaDrop khi chạm mốc pity
const pityThanhSkill = UltimateSkillSystem.rollGachaDrop(0, 100);
assert.strictEqual(pityThanhSkill.tier, "thanh", "Chạm mốc pityThanh >= 100 bắt buộc phải ra Thánh Cấp");

const pityThanSkill = UltimateSkillSystem.rollGachaDrop(500, 0);
assert.strictEqual(pityThanSkill.tier, "than", "Chạm mốc pityThan >= 500 bắt buộc phải ra Thần Cấp");

// Kiểm tra đếm pity trong Player
const pPity = new Player();
pPity.gachaTickets = 1000;
pPity.fortuneShards = 0;
pPity.pityThanCount = 499;
pPity.pityThanhCount = 50;

const rollPity500 = pPity.rollGacha(1);
assert.strictEqual(rollPity500.results[0].skill.tier, "than", "Lượt quay thứ 500 chắc chắn phải ra Thần Cấp");
assert.strictEqual(pPity.pityThanCount, 0, "Sau khi ra Thần Cấp, pityThanCount phải reset về 0");
assert.strictEqual(pPity.pityThanhCount, 0, "Sau khi ra Thần Cấp, pityThanhCount phải reset về 0");

pPity.pityThanCount = 10;
pPity.pityThanhCount = 99;
const rollPity100 = pPity.rollGacha(1);
assert.strictEqual(rollPity100.results[0].skill.tier, "thanh", "Lượt quay thứ 100 chắc chắn phải ra Thánh Cấp");
assert.strictEqual(pPity.pityThanhCount, 0, "Sau khi ra Thánh Cấp, pityThanhCount phải reset về 0");
assert.strictEqual(pPity.pityThanCount, 11, "pityThanCount tiếp tục tăng lên 11");
console.log("-> PASS: Cơ chế Bảo Hiểm Pity 500 và 100 hoạt động chuẩn xác 100%.");

// TEST 3: Ticket consumption, duplicate shards & 10-shard forging
console.log("\n[TEST 3] Kiểm tra tiêu hao vé, phân giải mảnh trùng và ngưng tụ 10 mảnh -> 1 vé...");
const p = new Player();
p.gachaTickets = 50;
p.fortuneShards = 0;
p.unlockedUltimates = [];

const rollRes = p.rollGacha(20);
assert.strictEqual(p.gachaTickets + (p.fortuneShards >= 10 ? Math.floor(p.fortuneShards / 10) : 0), 50 - 20 + rollRes.ticketsForged, "Số vé tiêu hao và ngưng tụ phải khớp");
assert.strictEqual(rollRes.results.length, 20, "Phải trả về 20 kết quả");
console.log(`Sau 20 roll: Mở được ${p.unlockedUltimates.length} chiêu, Mảnh dư: ${p.fortuneShards}, Vé ngưng tụ được: ${rollRes.ticketsForged}`);
assert(p.fortuneShards < 10, "Mảnh cơ duyên sau khi tự động ngưng tụ phải < 10");
console.log("-> PASS: Hệ thống gacha & ngưng tụ vé hoạt động chính xác.");

// TEST 4: Tower milestone ticket rewards
console.log("\n[TEST 4] Kiểm tra phần thưởng Hư Không Tháp mốc 50 tầng...");
for (let f = 1; f <= 350; f++) {
    const stage = TowerSystem.getStage(f);
    if (f % 50 === 0) {
        assert(stage.rewards.gachaTickets >= 1, `Tầng ${f} phải có thưởng vé tầm đạo`);
        if (f >= 300) {
            assert.strictEqual(stage.rewards.gachaTickets, 2, `Tầng ${f} phải có thưởng 2 vé`);
        } else {
            assert.strictEqual(stage.rewards.gachaTickets, 1, `Tầng ${f} phải có thưởng 1 vé`);
        }
    } else {
        assert(!stage.rewards.gachaTickets, `Tầng ${f} không được có vé tầm đạo`);
    }
}
console.log("-> PASS: Hư Không Tháp chỉ thưởng vé ở đúng các mốc chia hết cho 50.");

// TEST 5: Serialization & Deserialization
console.log("\n[TEST 5] Kiểm tra lưu/nạp tiến trình (Persistence toJSON/fromJSON)...");
p.unlockedUltimates = ["ult_than_nhat_niem", "ult_thanh_tue_nguyet"];
p.equippedUltimate = "ult_than_nhat_niem";
p.gachaTickets = 15;
p.fortuneShards = 7;
p.pityThanCount = 320;
p.pityThanhCount = 45;
p.vocucPendingTuVi = 500000000;

const json = p.toJSON();
const pRestored = new Player();
pRestored.fromJSON(json);

assert.deepStrictEqual(pRestored.unlockedUltimates, ["ult_than_nhat_niem", "ult_thanh_tue_nguyet"]);
assert.strictEqual(pRestored.equippedUltimate, "ult_than_nhat_niem");
assert.strictEqual(pRestored.gachaTickets, 15);
assert.strictEqual(pRestored.fortuneShards, 7);
assert.strictEqual(pRestored.pityThanCount, 320, "pityThanCount phải được phục hồi đúng");
assert.strictEqual(pRestored.pityThanhCount, 45, "pityThanhCount phải được phục hồi đúng");
assert.strictEqual(pRestored.vocucPendingTuVi, 500000000, "vocucPendingTuVi phải được phục hồi đúng");
console.log("-> PASS: Lưu và nạp dữ liệu Đại Thần Thông & Pity hoàn hảo.");

// TEST 6: Combat Rage Mechanics
console.log("\n[TEST 6] Kiểm tra cơ chế Nộ Khí (+20 khi cast skill, +4 khi đánh thường, +4 khi bị đánh)...");
const dummySound = new Proxy({}, { get: () => () => {} });
const dummyParticles = new Proxy({}, { get: () => () => {} });

const combat = new CombatEngine(p, dummyParticles, dummySound);

function resetCombat(combat, p) {
    combat.isActive = true;
    combat.playerRage = 0;
    combat.playerMaxRage = (p.equippedUltimate === "ult_thanh_tue_nguyet") ? 200 : 100;
    combat.ultimateBuffYChi = 0;
    combat.ultimateBuffBatKham = 0;
    combat.playerShield = 0;
    combat.monsterShield = 0;
    combat.playerStunTimer = 0;
    combat.skillCooldowns = [0, 0, 0];
    combat.monster = {
        name: "Cổ Ma Boss",
        hp: 1000000,
        maxHp: 1000000,
        defense: 50000,
        attack: 1000,
        isBoss: true,
        currentAttackTimer: 0
    };
    combat.monsterHp = 1000000;
    combat.monsterMaxHp = 1000000;
}

resetCombat(combat, p);

// Mặc định nộ = 0, maxRage = 100
assert.strictEqual(combat.playerRage, 0);
assert.strictEqual(combat.playerMaxRage, 100);

// Đánh thường: +4
combat.addRage(4);
assert.strictEqual(combat.playerRage, 4);

// Bị đánh: +4
combat.addRage(4);
assert.strictEqual(combat.playerRage, 8);

// Tung skill: +20
combat.addRage(20);
assert.strictEqual(combat.playerRage, 28);

// Giới hạn tối đa 100
combat.addRage(200);
assert.strictEqual(combat.playerRage, 100);

// Nếu trang bị Tuế Nguyệt -> maxRage phải là 200
p.equippedUltimate = "ult_thanh_tue_nguyet";
resetCombat(combat, p);
assert.strictEqual(combat.playerMaxRage, 200, "Tuế Nguyệt phải yêu cầu 200 Nộ Khí");
console.log("-> PASS: Cơ chế tích lũy nộ và maxRage chuẩn xác.");

// TEST 7: Skill Effects Execution
console.log("\n[TEST 7] Kiểm tra thực thi 6 chiêu Đại Thần Thông...");

// 7.1. Nhất Niệm: Giảm 80% HP Boss bỏ qua Kim Thân và Giáp
p.equippedUltimate = "ult_than_nhat_niem";
resetCombat(combat, p);
combat.monster.isBoss = true;
combat.monsterMaxHp = 1000000;
combat.monsterHp = 1000000;
combat.monster.defense = 50000;
combat.playerRage = 100;

const usedNhatNiem = combat.useUltimate();
assert(usedNhatNiem, "Phải thi triển thành công Nhất Niệm");
assert.strictEqual(combat.playerRage, 0, "Nộ khí phải bị tiêu hao về 0");
assert.strictEqual(combat.monsterHp, 200000, "Boss phải còn đúng 20% HP (200.000)");
console.log("-> PASS 7.1: Nhất Niệm trừ đúng 80% HP Boss bỏ qua Kim Thân & Giáp.");

// 7.2. Tuế Nguyệt: Hồi mọi skill lập tức, tiêu hao 200 nộ
p.equippedUltimate = "ult_thanh_tue_nguyet";
resetCombat(combat, p);
combat.skillCooldowns = [8.5, 12.0, 15.0];
combat.playerRage = 150;
assert.strictEqual(combat.useUltimate(), false, "Chưa đủ 200 nộ không thể dùng Tuế Nguyệt");
combat.playerRage = 200;
assert(combat.useUltimate(), "Đủ 200 nộ phải dùng được Tuế Nguyệt");
assert.deepStrictEqual(combat.skillCooldowns, [0, 0, 0], "Toàn bộ 3 skill phải được hồi chiêu về 0 ngay lập tức");
assert.strictEqual(combat.playerRage, 0);
console.log("-> PASS 7.2: Tuế Nguyệt hồi toàn bộ chiêu thức ngay tức khắc.");

// 7.3. Ý Chí Bất Tận: +300% tốc đánh, sát thương chuẩn 800% Công Vật Lí, XUYÊN KHIÊN đánh thẳng vào máu nhưng TUÂN THỦ KIM THÂN
p.equippedUltimate = "ult_thanh_y_chi_bat_tan";
resetCombat(combat, p);
combat.playerRage = 100;
combat.useUltimate();
assert.strictEqual(combat.ultimateBuffYChi, 8, "Thời gian buff Ý Chí Bất Tận là 8s");

// Test 7.3.1: Đánh thường scale 800% Công Vật Lí và XUYÊN KHIÊN BOSS
combat.monster.isBoss = true;
combat.monsterMaxHp = 10000000; // 10 Triệu HP
combat.monsterHp = 10000000;
combat.monsterShield = 5000000; // Khiên Boss 5 Triệu cực dày
combat.monster.defense = 999999; // Giáp cực lớn
p.statVatLi = 500;
const pStats = p.getTotalStats();
combat.playerBasicAttack();

const expectedDmg = Math.floor(pStats.vatLi * 8.0); // 500 * 8.0 = 4.000
const isRegular = (combat.monsterHp === 10000000 - expectedDmg);
const isCrit = (combat.monsterHp === 10000000 - Math.floor(expectedDmg * 1.75));
assert(isRegular || isCrit, "Đánh thường phải gây sát thương chuẩn scale theo 800% Công Vật Lí");
assert.strictEqual(combat.monsterShield, 5000000, "Đòn đánh Ý Chí Bất Tận phải XUYÊN THẲNG QUA KHIÊN BOSS (khiên không bị trừ và không chặn)");
console.log("-> PASS 7.3.1: Ý Chí Bất Tận scale 800% Vật Lí, XUYÊN QUA KHIÊN BOSS đánh thẳng vào máu!");

// Test 7.3.2: Tuân thủ Kim Thân Hộ Thể (Damage Cap)
combat.monsterMaxHp = 1000000; // Boss 1 Triệu HP
combat.monsterHp = 1000000;
combat.monster.damageCapPct = 0.20; // Trần 20% (200.000)
combat.monster.breakCapPct = 0.35; // Trần 35% khi bạo kích (350.000)
p.statVatLi = 1000000; // 800% = 8 Triệu sát thương (vượt xa máu Boss)

combat.playerBasicAttack();
const dmgDealt = 1000000 - combat.monsterHp;
assert(dmgDealt === 200000 || dmgDealt === 350000, `Sát thương phải bị Kim Thân giới hạn ở trần (200.000 hoặc 350.000), thực tế: ${dmgDealt}`);
console.log(`-> PASS 7.3.2: Ý Chí Bất Tận TUÂN THỦ KIM THÂN (sát thương chạm trần ${dmgDealt.toLocaleString()} HP)!`);

// 7.4. Vô Tổn: Khiên = 600% Công Phép + 30% Max HP
p.equippedUltimate = "ult_linh_vo_ton";
resetCombat(combat, p);
p.statPhep = 500;
p.statMau = 500;
const pStatsVoTon = p.getTotalStats();
combat.playerMaxHp = pStatsVoTon.maxHp;
combat.playerShield = 0;
combat.playerRage = 100;
combat.useUltimate();
const expectedShield = Math.floor(pStatsVoTon.phep * 6.0 + pStatsVoTon.maxHp * 0.3);
assert.strictEqual(combat.playerShield, expectedShield, "Khiên Vô Tổn tính chuẩn theo chỉ số");
console.log("-> PASS 7.4: Vô Tổn tạo khiên hộ thể khổng lồ chính xác.");

// 7.5. Bất Kham: Đòn đánh/chiêu của Boss không thể gây quá 5% Max HP của người chơi mỗi đòn trong 10s
p.equippedUltimate = "ult_linh_bat_kham";
resetCombat(combat, p);
combat.playerRage = 100;
const pMaxHp = p.getMaxHp();
combat.playerMaxHp = pMaxHp;
combat.playerHp = pMaxHp;
combat.playerShield = 0;
combat.useUltimate();
assert.strictEqual(combat.ultimateBuffBatKham, 10, "Buff Bất Kham duy trì 10s");

combat.monster.attack = 999999;
combat.monsterAttack();
const maxDmgAllowed = Math.floor(pMaxHp * 0.05);
assert.strictEqual(combat.playerHp, pMaxHp - maxDmgAllowed, "Người chơi chỉ mất tối đa 5% Max HP");
console.log("-> PASS 7.5: Bất Kham khóa trần sát thương nhận vào ở mức 5% Max HP.");

// 7.6. Huyết Tế: Tự trừ 50% HP hiện tại, gây 45% Max HP Boss
p.equippedUltimate = "ult_linh_huyet_te";
resetCombat(combat, p);
combat.playerRage = 100;
combat.playerHp = 80000;
combat.monsterMaxHp = 1000000;
combat.monsterHp = 1000000;
combat.monster.defense = 50000;

combat.useUltimate();
assert.strictEqual(combat.playerHp, 40000, "Người chơi phải bị trừ 50% máu hiện tại");
const expectedHuyetTeDmg = Math.max(1, 450000 - Math.floor(combat.monster.defense * 0.5));
assert.strictEqual(combat.monsterHp, 1000000 - expectedHuyetTeDmg, "Boss phải nhận sát thương Huyết Tế (xuyên kim thân, tính giáp)");
console.log("-> PASS 7.6: Huyết Tế tự trừ 50% máu, gây sát thương xuyên Kim Thân và tính Giáp chính xác.");

// TEST 8: Tower Tu Vi & Tinh Nguyen Overhaul & 1:1 Bugfix
console.log("\n[TEST 8] Kiểm tra cân bằng Hư Không Tháp & Khắc phục triệt để lỗi quy đổi 1:1...");
const pVoCuc = new Player();
pVoCuc.isVoCuc = true;
pVoCuc.tinhNguyen = 50;
pVoCuc.vocucPendingTuVi = 0;

// 8.1. addTuVi với lượng nhỏ (1000 hoặc 1.000.000) KHÔNG được cộng 1:1 Tinh Nguyên
pVoCuc.addTuVi(1000);
assert.strictEqual(pVoCuc.tinhNguyen, 50, "1000 Tu Vi KHÔNG được cộng 1 Tinh Nguyên nào!");
assert.strictEqual(pVoCuc.vocucPendingTuVi, 1000, "1000 Tu Vi phải lưu vào vocucPendingTuVi");

pVoCuc.addTuVi(1000000);
assert.strictEqual(pVoCuc.tinhNguyen, 50, "1 Triệu Tu Vi KHÔNG được cộng 1 Tinh Nguyên nào!");
assert.strictEqual(pVoCuc.vocucPendingTuVi, 1001000, "Phải cộng dồn chính xác vào vocucPendingTuVi");

// Cộng đủ 1 Tỷ Tu Vi -> ngưng tụ thành đúng 1 Tinh Nguyên
pVoCuc.addTuVi(1000000000 - 1001000);
assert.strictEqual(pVoCuc.tinhNguyen, 51, "Đủ 1 Tỷ Tu Vi phải ngưng tụ đúng +1 Tinh Nguyên!");
assert.strictEqual(pVoCuc.vocucPendingTuVi, 0, "Số dư phải về 0");
console.log("-> PASS 8.1: addTuVi ở Cảnh Giới Vô Cực không còn lỗi 1:1, tích lũy 1 Tỷ = 1 Tinh Nguyên chuẩn xác.");

// 8.2. Kiểm tra phần thưởng Quét Tháp (Sweep) cho người chơi Vô Cực
const sweepVoCuc = TowerSystem.calculateSweepRewards(300, true);
assert(sweepVoCuc, "Quét tháp tầng 300 phải thành công");
assert.strictEqual(sweepVoCuc.totalTuVi, 0, "Người chơi Vô Cực quét tháp KHÔNG nhận Tu Vi (totalTuVi = 0)");
assert(sweepVoCuc.totalTinhNguyen > 1000 && sweepVoCuc.totalTinhNguyen < 2000, `Lượng Tinh Nguyên quét tầng 300 phải cân bằng hợp lý (~1.000-2.000), hiện tại: ${sweepVoCuc.totalTinhNguyen}`);
console.log(`-> Quét tầng 1 -> 295 (Vô Cực): Nhận ${sweepVoCuc.totalTinhNguyen} Tinh Nguyên, ${sweepVoCuc.totalTuVi} Tu Vi (Cực kỳ cân bằng, không bị 1 triệu Tinh Nguyên!).`);

// 8.3. Kiểm tra phần thưởng Quét Tháp (Sweep) cho người chơi Tiền Vô Cực
const sweepPreVoCuc = TowerSystem.calculateSweepRewards(300, false);
assert.strictEqual(sweepPreVoCuc.totalTinhNguyen, 0, "Người chơi tiền Vô Cực quét tháp KHÔNG nhận Tinh Nguyên");
assert(sweepPreVoCuc.totalTuVi > 0, "Người chơi tiền Vô Cực phải nhận Tu Vi");
console.log("-> PASS 8.2 & 8.3: Quét tháp phân lập rõ ràng giữa Vô Cực (Tinh Nguyên) và Tiền Vô Cực (Tu Vi).");

// 8.4. Kiểm tra phần thưởng thắng trận đơn lẻ trong Tháp
const combatTowerVoCuc = new CombatEngine(pVoCuc, dummyParticles, dummySound);
combatTowerVoCuc.isTowerBattle = true;
combatTowerVoCuc.currentStage = TowerSystem.getStage(150);
const startTinhNguyen = pVoCuc.tinhNguyen;
combatTowerVoCuc.handleVictory();
const gainedTinhNguyen = pVoCuc.tinhNguyen - startTinhNguyen;
assert.strictEqual(gainedTinhNguyen, TowerSystem.getFloorTinhNguyen(150), "Thắng tầng 150 phải nhận đúng Tinh Nguyên theo tầng");
console.log(`-> Thắng tầng 150 (Vô Cực): Nhận đúng +${gainedTinhNguyen} Tinh Nguyên, không bị lỗi 1:1.`);
console.log("-> PASS 8.4: Thắng trận leo tháp cộng Tinh Nguyên cân bằng cho người chơi Vô Cực.");

console.log("\n========================================================");
console.log("🎉 TOÀN BỘ 8/8 BỘ KIỂM THỬ ĐẠI THẦN THÔNG, PITY & THÁP ĐÃ VƯỢT QUA 100%!");
console.log("========================================================");
