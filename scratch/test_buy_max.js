// Test suite for Buy Max Pills (Mua Hết Đan Dược) feature
const path = require('path');

// Mock DOM elements and systems
global.window = global;
global.document = {
    createElement: () => ({
        className: '',
        innerHTML: '',
        style: {}
    }),
    getElementById: (id) => ({
        style: {},
        classList: { add: () => {}, remove: () => {} },
        appendChild: () => {},
        removeChild: () => {},
        children: []
    })
};

const mockLocalStorage = {};
global.localStorage = {
    getItem: (key) => mockLocalStorage[key] || null,
    setItem: (key, val) => { mockLocalStorage[key] = String(val); },
    removeItem: (key) => { delete mockLocalStorage[key]; },
    clear: () => { for (const k in mockLocalStorage) delete mockLocalStorage[k]; }
};

// Load systems
const projectRoot = 'd:/HOCTAP/TuDo/Kiemtien';
require(path.join(projectRoot, 'js/data/realms.js'));
require(path.join(projectRoot, 'js/data/items.js'));
require(path.join(projectRoot, 'js/data/skills.js'));
require(path.join(projectRoot, 'js/data/titles.js'));
require(path.join(projectRoot, 'js/engine/storage.js'));
require(path.join(projectRoot, 'js/state/player.js'));

const { Player, ItemSystem, RealmSystem } = global;

function runTests() {
    let passed = 0;
    let total = 0;

    function assert(desc, condition) {
        total++;
        if (condition) {
            console.log(`  [PASS] ${desc}`);
            passed++;
        } else {
            console.error(`  [FAIL] ${desc}`);
        }
    }

    console.log("=== BẮT ĐẦU KIỂM THỬ TÍNH NĂNG: MUA HẾT ĐAN DƯỢC (BUY MAX PILLS) ===");

    // Test 1: Mua đan dược khi có đủ tiền chẵn
    const player1 = new Player();
    player1.linhThach = 1000;
    player1.inventory = [];
    const res1 = player1.buyMaxPill("pill_tu_khi_tieu"); // price: 50
    assert("Mua thành công khi có đủ tiền", res1.success === true);
    assert("Số lượng mua đúng 20 viên (1000 / 50 = 20)", res1.count === 20);
    assert("Tổng chi phí là 1000 Linh Thạch", res1.totalCost === 1000);
    assert("Số dư Linh Thạch còn lại đúng 0", player1.linhThach === 0);
    assert("Túi đồ nhận đúng 20 viên đan dược", player1.inventory.length === 20 && player1.inventory.every(id => id === "pill_tu_khi_tieu"));

    // Test 2: Mua đan dược khi số tiền có phần dư
    const player2 = new Player();
    player2.linhThach = 225;
    player2.inventory = [];
    const res2 = player2.buyMaxPill("pill_tu_khi_tieu"); // price: 50, affordable: 4 (200), remainder: 25
    assert("Mua thành công khi số tiền có phần dư", res2.success === true);
    assert("Số lượng mua là 4 viên", res2.count === 4);
    assert("Tổng chi phí là 200 Linh Thạch", res2.totalCost === 200);
    assert("Số dư Linh Thạch còn lại đúng 25", player2.linhThach === 25);
    assert("Túi đồ có đúng 4 viên", player2.inventory.length === 4);

    // Test 3: Không đủ tiền mua tối thiểu 1 viên
    const player3 = new Player();
    player3.linhThach = 30;
    player3.inventory = ["weapon_01"];
    const res3 = player3.buyMaxPill("pill_tu_khi_tieu"); // price: 50 > 30
    assert("Từ chối khi không đủ tiền mua 1 viên", res3.success === false && res3.reason === "not_enough_money");
    assert("Linh Thạch không bị trừ", player3.linhThach === 30);
    assert("Túi đồ không bị thay đổi", player3.inventory.length === 1);

    // Test 4: Từ chối khi chưa đủ cảnh giới
    const player4 = new Player();
    player4.realmIndex = 0; // Tôi Khí
    player4.linhThach = 100000;
    const res4 = player4.buyMaxPill("pill_tu_khi_dai"); // reqRealm: 1 (Ngưng Khí)
    assert("Từ chối khi chưa đủ cảnh giới yêu cầu", res4.success === false && res4.reason === "realm_locked");
    assert("Linh Thạch không bị trừ khi bị khóa cảnh giới", player4.linhThach === 100000);

    // Test 5: Từ chối trên các trang bị (Nón, Giáp, Vũ Khí)
    const player5 = new Player();
    player5.linhThach = 100000;
    const resWeapon = player5.buyMaxPill("weapon_01");
    const resArmor = player5.buyMaxPill("armor_01");
    const resHat = player5.buyMaxPill("hat_01");
    assert("Từ chối mua hết cho Vũ Khí", resWeapon.success === false && resWeapon.reason === "not_supported");
    assert("Từ chối mua hết cho Giáp", resArmor.success === false && resArmor.reason === "not_supported");
    assert("Từ chối mua hết cho Nón", resHat.success === false && resHat.reason === "not_supported");

    // Test 6: Từ chối trên Tẩy Tủy Đan và Cuộn Giấy Đổi Tên
    const resResetPill = player5.buyMaxPill("pill_tay_tuy");
    const resRenameScroll = player5.buyMaxPill("item_rename_scroll");
    assert("Từ chối mua hết cho Tẩy Tủy Đan", resResetPill.success === false && resResetPill.reason === "not_supported");
    assert("Từ chối mua hết cho Cuộn Giấy Đổi Tên", resRenameScroll.success === false && resRenameScroll.reason === "not_supported");

    // Test 7: Mua đan dược cao cấp khi đủ cảnh giới và lưu/nạp an toàn
    const player7 = new Player();
    player7.realmIndex = 4; // Nguyên Linh Thụ
    player7.linhThach = 50000; // Ngọc Linh Đan giá 2,500 -> mua được 20 viên
    const res7 = player7.buyMaxPill("pill_ngoc_linh");
    assert("Mua được đan dược cao cấp khi đạt đủ cảnh giới", res7.success === true && res7.count === 20);
    assert("Tiền Linh Thạch trừ chính xác (50000 -> 0)", player7.linhThach === 0);

    // Test lưu và nạp lại
    global.StorageSystem.save(player7);
    const loadedPlayer = new Player();
    global.StorageSystem.load(loadedPlayer);
    assert("Tiến trình lưu và nạp lại chính xác sau khi mua hết", loadedPlayer.linhThach === 0 && loadedPlayer.inventory.filter(id => id === "pill_ngoc_linh").length === 20);

    console.log(`\nKết quả: ${passed}/${total} bài kiểm tra vượt qua.`);
    if (passed === total) {
        console.log(">>> TOÀN BỘ KIỂM THỬ TÍNH NĂNG MUA HẾT ĐAN DƯỢC ĐÃ VƯỢT QUA THÀNH CÔNG! <<<");
        process.exit(0);
    } else {
        process.exit(1);
    }
}

runTests();
