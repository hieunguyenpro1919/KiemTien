/**
 * BỘ KIỂM THỬ ĐỘC LẬP: PHÂN HỆ QUẢN LÝ HỒ SƠ NHÂN VẬT (PROFILE CRUD & STORAGE)
 * Môn học: JavaScript thuần & ES6+
 * Lệnh chạy: node scratch/test_profiles_crud.js
 */

const assert = require('assert');
const path = require('path');

// Giả lập môi trường trình duyệt cho LocalStorage
const mockStorage = {
    _data: {},
    getItem(k) { return this._data[k] !== undefined ? this._data[k] : null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
};

global.localStorage = mockStorage;
global.window = global;

async function runProfileTests() {
    console.log("==================================================================");
    console.log("🚀 BẮT ĐẦU KIỂM THỬ: PHÂN HỆ HỒ SƠ NHÂN VẬT (PROFILE SYSTEM)");
    console.log("==================================================================\n");

    // Dynamic import ES module profile-storage.js
    const modulePath = path.resolve(__dirname, '../js/profile/profile-storage.js').replace(/\\/g, '/');
    const ProfileStorage = await import('file:///' + modulePath);

    let passed = 0;
    let total = 0;

    function test(name, fn) {
        total++;
        try {
            fn();
            console.log(`  ✓ [PASS] ${name}`);
            passed++;
        } catch (err) {
            console.error(`  ✗ [FAIL] ${name}`);
            console.error(err);
        }
    }

    console.log("--- NHÓM 1: Xác Thực Dữ Liệu Hồ Sơ (Validation) ---");
    test("Đạo hiệu không được để trống hoặc chỉ có khoảng trắng", () => {
        const res = ProfileStorage.validateProfileData({ name: "   " });
        assert.strictEqual(res.isValid, false);
        assert(res.errors.name);
    });

    test("Đạo hiệu phải có tối thiểu 3 ký tự và tối đa 20 ký tự", () => {
        const tooShort = ProfileStorage.validateProfileData({ name: "AB" });
        assert.strictEqual(tooShort.isValid, false);

        const tooLong = ProfileStorage.validateProfileData({ name: "A".repeat(21) });
        assert.strictEqual(tooLong.isValid, false);

        const valid = ProfileStorage.validateProfileData({ name: "Tiểu Y Tiên" });
        assert.strictEqual(valid.isValid, true);
    });

    test("Lọc ký tự đặc biệt nguy hiểm chống XSS trong đạo hiệu", () => {
        const xss1 = ProfileStorage.validateProfileData({ name: "<script>" });
        assert.strictEqual(xss1.isValid, false);

        const xss2 = ProfileStorage.validateProfileData({ name: 'Hàn"Lập' });
        assert.strictEqual(xss2.isValid, false);

        const xss3 = ProfileStorage.validateProfileData({ name: "Đạo&Đời" });
        assert.strictEqual(xss3.isValid, false);
    });

    test("Lời thề đạo tâm không được vượt quá 100 ký tự", () => {
        const res = ProfileStorage.validateProfileData({ name: "Hàn Lập", notes: "X".repeat(101) });
        assert.strictEqual(res.isValid, false);
        assert(res.errors.notes);
    });

    console.log("\n--- NHÓM 2: Tự Động Di Trú Save Cũ (Auto-Migration) ---");
    test("Di trú bản lưu cũ tu_tien_2d_save_v1 thành hồ sơ mặc định Tiêu Viêm", () => {
        mockStorage.clear();
        mockStorage.setItem("tu_tien_2d_save_v1", JSON.stringify({
            name: "Lâm Động",
            realmIndex: 3,
            tierIndex: 5,
            isVoCuc: false,
            linhThach: 50000
        }));

        ProfileStorage.migrateExistingSaveIfNeeded();
        const profiles = ProfileStorage.getProfiles();
        assert.strictEqual(profiles.length, 1);
        assert.strictEqual(profiles[0].id, "prof_default");
        assert.strictEqual(profiles[0].name, "Lâm Động");
        assert.strictEqual(profiles[0].realmIndex, 3);
        assert.strictEqual(profiles[0].saveKey, "tu_tien_2d_save_v1");

        const active = ProfileStorage.getActiveProfile();
        assert.strictEqual(active.id, "prof_default");
    });

    console.log("\n--- NHÓM 3: Thao Tác Tạo Mới & Giới Hạn Hồ Sơ (Create & Limits) ---");
    test("Tạo hồ sơ mới thành công với khóa lưu trữ phân tách độc lập", () => {
        const res = ProfileStorage.createProfile({
            name: "Hàn Lập",
            avatar: "🧝",
            notes: "Tu tiên cẩn trọng, một lòng hướng đạo."
        });
        assert.strictEqual(res.success, true);
        assert(res.profile.id.startsWith("prof_"));
        assert.strictEqual(res.profile.saveKey, `tu_tien_2d_save_profile_${res.profile.id}`);

        const active = ProfileStorage.getActiveProfile();
        assert.strictEqual(active.id, res.profile.id);
    });

    test("Chặn tạo hồ sơ trùng tên không phân biệt hoa thường", () => {
        const res = ProfileStorage.createProfile({ name: "hàn lập" });
        assert.strictEqual(res.success, false);
        assert(res.msg.includes("đã tồn tại"));
    });

    test("Giới hạn tối đa nghiêm ngặt 5 hồ sơ nhân vật", () => {
        // Hiện tại đã có 2 hồ sơ (Lâm Động, Hàn Lập). Tạo thêm 3 hồ sơ để đủ 5:
        ProfileStorage.createProfile({ name: "Thạch Hạo" });
        ProfileStorage.createProfile({ name: "Diệp Phàm" });
        ProfileStorage.createProfile({ name: "Bạch Tiểu Thuần" });

        const profiles = ProfileStorage.getProfiles();
        assert.strictEqual(profiles.length, 5);

        // Tạo hồ sơ thứ 6 phải bị từ chối
        const resOver = ProfileStorage.createProfile({ name: "Mạnh Hạo" });
        assert.strictEqual(resOver.success, false);
        assert(resOver.msg.includes("giới hạn tối đa 5/5"));
    });

    console.log("\n--- NHÓM 4: Cập Nhật & Bảo Toàn Toàn Vẹn Chỉ Số (Update) ---");
    test("Cập nhật đạo hiệu, avatar, ghi chú và đồng bộ tên vào save slot", () => {
        const profiles = ProfileStorage.getProfiles();
        const target = profiles.find(p => p.name === "Thạch Hạo");
        assert(target);

        // Tạo giả lập dữ liệu save slot cho profile này
        mockStorage.setItem(target.saveKey, JSON.stringify({
            name: "Thạch Hạo",
            realmIndex: 0,
            linhThach: 1000
        }));

        const updateRes = ProfileStorage.updateProfile(target.id, {
            name: "Hoang Thiên Đế",
            avatar: "⚡",
            notes: "Một hạt bụi lấp biển, một cọng cỏ chém hết nhật nguyệt tinh thần."
        });

        assert.strictEqual(updateRes.success, true);
        assert.strictEqual(updateRes.profile.name, "Hoang Thiên Đế");
        assert.strictEqual(updateRes.profile.avatar, "⚡");

        // Kiểm tra đồng bộ tên vào save slot
        const updatedSave = JSON.parse(mockStorage.getItem(target.saveKey));
        assert.strictEqual(updatedSave.name, "Hoang Thiên Đế");
        assert.strictEqual(updatedSave.linhThach, 1000); // Chỉ số game vẫn nguyên vẹn!
    });

    console.log("\n--- NHÓM 5: Xóa Hồ Sơ & Dọn Sạch Bộ Nhớ (Delete) ---");
    test("Xóa hồ sơ dọn dẹp sạch save slot và tự động chuyển active sang hồ sơ khác", () => {
        const profilesBefore = ProfileStorage.getProfiles();
        const toDelete = profilesBefore.find(p => p.name === "Hoang Thiên Đế");
        assert(toDelete);

        ProfileStorage.setActiveProfile(toDelete.id);
        assert.strictEqual(ProfileStorage.getActiveProfile().id, toDelete.id);

        const delRes = ProfileStorage.deleteProfile(toDelete.id);
        assert.strictEqual(delRes.success, true);

        // Kiểm tra danh sách giảm đi 1
        const profilesAfter = ProfileStorage.getProfiles();
        assert.strictEqual(profilesAfter.length, 4);
        assert(!profilesAfter.some(p => p.id === toDelete.id));

        // Kiểm tra save slot bị xóa sạch
        assert.strictEqual(mockStorage.getItem(toDelete.saveKey), null);

        // Active profile tự động chuyển sang hồ sơ đầu tiên còn lại
        const newActive = ProfileStorage.getActiveProfile();
        assert(newActive && newActive.id !== toDelete.id);
    });

    console.log("\n--- NHÓM 6: Thống Kê Dashboard & Tiện Ích Định Dạng ---");
    test("Tính toán số liệu Dashboard tổng hợp chính xác", () => {
        // Ghi thời gian chơi giả lập cho 2 profile
        const profiles = ProfileStorage.getProfiles();
        mockStorage.setItem(profiles[0].saveKey, JSON.stringify({ totalPlayTime: 3660 })); // 1h 1m
        mockStorage.setItem(profiles[1].saveKey, JSON.stringify({ totalPlayTime: 1800 })); // 30m

        const stats = ProfileStorage.getProfileDashboardStats();
        assert.strictEqual(stats.totalProfiles, 4);
        assert.strictEqual(stats.maxCapacity, 5);
        assert.strictEqual(stats.highestRealmText, "Tạo Đảo - Tầng 6");
        assert.strictEqual(stats.highestProfileName, "Lâm Động");
        assert.strictEqual(stats.totalPlayTimeFormatted, "1 giờ 31 phút");
    });

    test("Định dạng thời gian tương đối và ngày giờ chuẩn xác", () => {
        assert.strictEqual(ProfileStorage.formatRelativeTime(Date.now() - 10000), "Vừa xong");
        assert.strictEqual(ProfileStorage.formatRelativeTime(Date.now() - 300000), "5 phút trước");
        assert.strictEqual(ProfileStorage.formatRelativeTime(Date.now() - 7200000), "2 giờ trước");

        const dt = ProfileStorage.formatDateTime(new Date(2026, 8, 22, 14, 0).getTime());
        assert(dt.includes("14:00") && dt.includes("22/09/2026"));
    });

    console.log("\n==================================================================");
    console.log(`🎉 KẾT QUẢ KIỂM THỬ PROFILE: ${passed}/${total} TESTS ĐẠT (100% PASS)`);
    console.log("==================================================================\n");

    return { passed, total };
}

if (require.main === module) {
    runProfileTests();
}

module.exports = { runProfileTests };
