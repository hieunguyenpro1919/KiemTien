/**
 * CẦU NỐI HỒ SƠ VÀ TRÒ CHƠI (GAME PROFILE BRIDGE)
 * Tự động cấu hình slot lưu trữ của StorageSystem theo Hồ Sơ đang chọn
 * mà không sửa đổi bất kỳ dòng code nào trong storage.js hay app.js!
 */

(function() {
    const STORAGE_KEY_PROFILES = "kiemtien_profiles";
    const STORAGE_KEY_ACTIVE_ID = "kiemtien_active_profile_id";

    // 1. Kiểm tra auto-migration nếu chưa từng có danh sách hồ sơ
    let activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    let profilesStr = localStorage.getItem(STORAGE_KEY_PROFILES);

    if (!profilesStr) {
        // Tự động di trú save cũ sang hồ sơ mặc định
        const oldSaveStr = localStorage.getItem("tu_tien_2d_save_v1") || localStorage.getItem("tu_tien_2d_save_backup");
        let profileName = "Tiêu Viêm";
        let realmIndex = 0;
        let tierIndex = 0;
        let isVoCuc = false;

        if (oldSaveStr) {
            try {
                const oldData = JSON.parse(oldSaveStr);
                if (oldData && typeof oldData === "object") {
                    if (oldData.name) profileName = oldData.name;
                    if (typeof oldData.realmIndex === "number") realmIndex = oldData.realmIndex;
                    if (typeof oldData.tierIndex === "number") tierIndex = oldData.tierIndex;
                    if (oldData.isVoCuc) isVoCuc = true;
                }
            } catch (e) {}
        }

        const now = Date.now();
        const defaultProfile = {
            id: "prof_default",
            name: profileName,
            avatar: "🧙‍♂️",
            notes: "Hồ sơ tu chân nguyên bản kế thừa từ đạo hạnh tiền khởi.",
            createdAt: now,
            lastPlayed: now,
            realmIndex,
            tierIndex,
            isVoCuc,
            saveKey: "tu_tien_2d_save_v1"
        };

        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify([defaultProfile]));
        localStorage.setItem(STORAGE_KEY_ACTIVE_ID, defaultProfile.id);
        activeId = defaultProfile.id;
        profilesStr = JSON.stringify([defaultProfile]);
    }

    // 2. Tìm hồ sơ đang hoạt động
    let activeProfile = null;
    try {
        const profiles = JSON.parse(profilesStr);
        if (Array.isArray(profiles) && profiles.length > 0) {
            activeProfile = profiles.find(p => p.id === activeId) || profiles[0];
            localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeProfile.id);
        }
    } catch (e) {
        console.warn("[GameProfileBridge] Lỗi đọc hồ sơ:", e);
    }

    // 3. Cấu hình StorageSystem trỏ vào đúng slot lưu của hồ sơ
    if (activeProfile && typeof StorageSystem !== "undefined") {
        const saveKey = activeProfile.saveKey || `tu_tien_2d_save_profile_${activeProfile.id}`;
        const backupKey = activeProfile.id === "prof_default"
            ? "tu_tien_2d_save_backup"
            : `tu_tien_2d_save_backup_${activeProfile.id}`;

        StorageSystem.SAVE_KEY = saveKey;
        StorageSystem.BACKUP_KEY = backupKey;

        console.log(`[GameProfileBridge] Đang tu luyện với Hồ Sơ: [${activeProfile.name}] (Slot: ${saveKey})`);

        // 4. Hook nhẹ nhàng vào StorageSystem.save để cập nhật metadata của profile trong danh sách
        const originalSave = StorageSystem.save;
        StorageSystem.save = function(player) {
            const result = originalSave.apply(this, arguments);
            if (result && player) {
                try {
                    const curProfilesStr = localStorage.getItem(STORAGE_KEY_PROFILES);
                    if (curProfilesStr) {
                        const curProfiles = JSON.parse(curProfilesStr);
                        const idx = curProfiles.findIndex(p => p.id === activeProfile.id);
                        if (idx !== -1) {
                            curProfiles[idx].lastPlayed = Date.now();
                            curProfiles[idx].realmIndex = typeof player.realmIndex === "number" ? player.realmIndex : curProfiles[idx].realmIndex;
                            curProfiles[idx].tierIndex = typeof player.tierIndex === "number" ? player.tierIndex : curProfiles[idx].tierIndex;
                            curProfiles[idx].isVoCuc = !!player.isVoCuc;
                            if (player.name) curProfiles[idx].name = player.name;
                            localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(curProfiles));
                        }
                    }
                } catch (syncErr) {
                    console.warn("[GameProfileBridge] Lỗi đồng bộ metadata hồ sơ:", syncErr);
                }
            }
            return result;
        };
    }
})();
