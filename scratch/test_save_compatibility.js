/**
 * TEST SAVE COMPATIBILITY & SYSTEM SPECIFICATION
 * Kiểm tra 5 Rules và Checklist trong "KIEM TIEN - SAVE SYSTEM & DATA COMPATIBILITY SPECIFICATION"
 */

// Mock browser globals for Node.js environment
global.localStorage = {
    _store: {},
    getItem(key) {
        return this._store[key] || null;
    },
    setItem(key, val) {
        this._store[key] = String(val);
    },
    removeItem(key) {
        delete this._store[key];
    },
    clear() {
        this._store = {};
    }
};

// Mock RealmSystem & ItemSystem & TitleSystem for testing
global.RealmSystem = {
    getMaxTuVi(realmIndex, tierIndex) { return 1000; },
    getAbsoluteTier(realmIndex, tierIndex) { return 0; },
    getRealm(id) { return { name: "Tôi Khí" }; },
    getFullRealmTitle(r, t) { return "Tôi Khí"; }
};

global.ItemSystem = {
    getItemById(id) {
        return { id, name: id, slot: "vukhi", stats: { vatLi: 10 } };
    }
};

global.TitleSystem = {
    getTitleById(id) {
        return { id, name: "Sơ Nhập", buffs: { vatLi: 5 } };
    }
};

const Player = require("../js/state/player.js");
const StorageSystem = require("../js/engine/storage.js");

console.log("==================================================");
console.log("BẮT ĐẦU KIỂM THỬ TƯƠNG THÍCH HỆ THỐNG LƯU TRỮ (SAVE)");
console.log("==================================================");

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
    totalTests++;
    if (condition) {
        console.log(`✅ [PASS] ${message}`);
        passedTests++;
    } else {
        console.error(`❌ [FAIL] ${message}`);
        process.exitCode = 1;
    }
}

// 1. Kiểm tra cấu trúc khởi tạo mặc định (DEFAULT_PLAYER_DATA)
console.log("\n--- TEST 1: DEFAULT_PLAYER_DATA & Schema Immutability ---");
const p1 = new Player();
assert(p1.name === "Tiêu Viêm", "Player name mặc định chính xác");
assert(p1.realmIndex === 0 && p1.tierIndex === 0, "Cảnh giới & tầng khởi tạo đúng");
assert(Array.isArray(p1.inventory) && p1.inventory.length > 0, "Túi đồ khởi tạo an toàn dưới dạng mảng");
assert(p1.equipped && typeof p1.equipped === "object", "Trang bị khởi tạo an toàn");
assert(p1.equippedTitle === "title_so_nhap", "Danh hiệu mặc định khởi tạo");

// 2. Kiểm tra nạp Save phiên bản cũ (v1) - thiếu các trường mới
console.log("\n--- TEST 2: Nạp Save v1 cũ (thiếu danh hiệu, thiếu linhThach, saveVersion) ---");
const oldSaveV1 = {
    name: "Hàn Lập",
    realmIndex: 2,
    tierIndex: 5,
    tuVi: 500,
    statPoints: 12,
    statVatLi: 10,
    statPhep: 5,
    statMau: 20,
    equipped: { non: "hat_01", giap: "armor_01", vukhi: "weapon_01" },
    equippedSkills: ["skill_toai_thach_quyen"],
    inventory: ["pill_tu_khi_tieu"]
    // Hoàn toàn không có: saveVersion, linhThach, equippedTitle, unlockedTitles, clearedStages
};

localStorage.setItem(StorageSystem.SAVE_KEY, JSON.stringify(oldSaveV1));

const p2 = new Player();
const loadSuccess = StorageSystem.load(p2);
assert(loadSuccess === true, "StorageSystem.load nạp thành công save v1 cũ");
assert(p2.name === "Hàn Lập", "Giữ nguyên tên cũ của người chơi");
assert(p2.realmIndex === 2 && p2.tierIndex === 5, "Giữ nguyên cảnh giới cũ");
assert(p2.equippedTitle === "title_so_nhap", "Fallback tự động gán danh hiệu mặc định");
assert(Array.isArray(p2.unlockedTitles) && p2.unlockedTitles.includes("title_so_nhap"), "Fallback tự động danh sách danh hiệu");
assert(p2.linhThach === 200, "Fallback tự động nạp linh thạch");
assert(p2.inventory.includes("item_rename_scroll"), "Người chơi cũ được tự động cấp 1 Cuộn Giấy Đổi Tên");
assert(Array.isArray(p2.clearedStages), "clearedStages fallback thành mảng rỗng không bị undefined");

// Kiểm tra tính chỉ số sau khi nạp save cũ (Defensive Coding)
let stats;
try {
    stats = p2.getTotalStats();
    assert(stats && stats.maxHp > 0 && stats.vatLi > 0, "getTotalStats tính toán trơn tru không phát sinh lỗi undefined");
} catch (e) {
    assert(false, `getTotalStats gây lỗi: ${e.message}`);
}

// 3. Kiểm tra Safe Write & Auto-Backup
console.log("\n--- TEST 3: Safe Write & Tự Động Sao Lưu Dự Phòng (Auto-Backup) ---");
p2.name = "Dược Lão";
p2.linhThach = 9999;
StorageSystem.save(p2);

const backupContent = localStorage.getItem(StorageSystem.BACKUP_KEY);
assert(backupContent !== null, "Khóa sao lưu dự phòng tu_tien_2d_save_backup đã được ghi");
const parsedBackup = JSON.parse(backupContent);
assert(parsedBackup.name === "Hàn Lập", "Bản sao lưu lưu đúng trạng thái TRƯỚC KHI ghi đè mới");

const currentSave = JSON.parse(localStorage.getItem(StorageSystem.SAVE_KEY));
assert(currentSave.name === "Dược Lão" && currentSave.linhThach === 9999, "Bản lưu chính lưu đúng trạng thái mới");
assert(currentSave.saveVersion === StorageSystem.CURRENT_SAVE_VERSION, "Bản lưu mới mang đúng CURRENT_SAVE_VERSION");

// 4. Kiểm tra Tự động phục hồi từ backup khi bản chính bị hỏng cú pháp JSON
console.log("\n--- TEST 4: Tự động phục hồi khi Save chính bị hỏng cú pháp (Corruption Recovery) ---");
localStorage.setItem(StorageSystem.SAVE_KEY, "{ corrupted_bad_json: true, broken... ");
const pCorrupted = new Player();
const recovered = StorageSystem.load(pCorrupted);
assert(recovered === true, "Hệ thống tự động kích hoạt phục hồi từ backup khi save chính hỏng");
assert(pCorrupted.name === "Hàn Lập", "Khôi phục thành công dữ liệu từ backup");

// 5. Kiểm tra Export / Import chuỗi Base64
console.log("\n--- TEST 5: Xuất và Nhập chuỗi sao lưu Base64 ---");
const pExport = new Player();
pExport.name = "Tiêu Viêm Hắc Ám";
pExport.linhThach = 50000;
const exportCode = StorageSystem.exportSaveString(pExport);
assert(typeof exportCode === "string" && exportCode.length > 20, "Xuất mã Base64 thành công");

const pImport = new Player();
const importResult = StorageSystem.importSaveString(pImport, exportCode);
assert(importResult === true, "Nhập mã Base64 thành công");
assert(pImport.name === "Tiêu Viêm Hắc Ám", "Dữ liệu sau khi Import trùng khớp");
assert(pImport.linhThach === 50000, "Linh Thạch sau khi Import chính xác");

// 6. Kiểm tra Import chuỗi Base64 phiên bản v1 cũ (không có các trường mới)
console.log("\n--- TEST 6: Import chuỗi Base64 từ Save v1 cổ xưa ---");
const v1Json = JSON.stringify({ name: "Cổ Giả", realmIndex: 1, inventory: ["weapon_01"] });
const v1Code = Buffer.from(v1Json).toString("base64");
const pImportV1 = new Player();
const importV1Result = StorageSystem.importSaveString(pImportV1, v1Code);
assert(importV1Result === true, "Import mã Base64 từ v1 cổ xưa thành công");
assert(pImportV1.name === "Cổ Giả", "Tên người chơi từ mã v1 hiển thị chính xác");
assert(pImportV1.equippedTitle === "title_so_nhap", "Trường danh hiệu mới tự động fallback");
assert(pImportV1.inventory.includes("weapon_01") && pImportV1.inventory.includes("item_rename_scroll"), "Vật phẩm cũ giữ nguyên và được tặng cuộn đổi tên");

console.log("\n==================================================");
console.log(`KẾT QUẢ: ${passedTests}/${totalTests} TESTS ĐẠT THÀNH CÔNG!`);
console.log("==================================================");
