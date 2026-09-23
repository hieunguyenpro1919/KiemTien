/**
 * PHÂN HỆ QUẢN LÝ DỮ LIỆU HỒ SƠ NHÂN VẬT (PROFILE STORAGE & CRUD)
 * Môn: JavaScript thuần & ES6+
 * Chuẩn Module: ES6 (import/export), Zero External Dependencies
 */

export const STORAGE_KEY_PROFILES = "kiemtien_profiles";
export const STORAGE_KEY_ACTIVE_ID = "kiemtien_active_profile_id";
export const MAX_PROFILES_LIMIT = 5;

export const DEFAULT_AVATARS = [
    { id: "mage", icon: "🧙‍♂️", name: "Tiên Phong Đạo Cốt" },
    { id: "elf", icon: "🧝", name: "Linh Tộc Tiên Tử" },
    { id: "ninja", icon: "🥷", name: "Ám Dạ Kiếm Sĩ" },
    { id: "sword", icon: "⚔️", name: "Kiếm Tu Thần Quân" },
    { id: "meditate", icon: "🧘", name: "Khổ Hạnh Đạo Nhân" },
    { id: "dragon", icon: "🐉", name: "Chân Long Thiên Tử" },
    { id: "eagle", icon: "🦅", name: "Kim Bằng Đại Hiệp" },
    { id: "fox", icon: "🦊", name: "Cửu Vĩ Linh Hồ" },
    { id: "tiger", icon: "🐯", name: "Bạch Hổ Tôn Giả" },
    { id: "lightning", icon: "⚡", name: "Lôi Kiếp Thần Đế" }
];

export const REALM_NAMES = [
    "Tôi Khí", "Ngưng Khí", "Linh Hải", "Tạo Đảo",
    "Nguyên Linh Thụ", "Tạo Hóa Đài", "Thông Thiên Trụ", "Ngọc Điện",
    "Đỉnh Cấp Ngai", "Vô Thượng Lộ", "Vạn Vì Tinh Tú", "Đại Đạo Chí Cao Vô Thượng"
];

export const REALM_COLORS = [
    "#a3b899", "#4ecca3", "#00adb5", "#3f72af",
    "#16c79a", "#f39c12", "#e056fd", "#f1c40f",
    "#e74c3c", "#ff007f", "#00f2fe", "#ffd700"
];

/**
 * Tự động di trú dữ liệu cũ:
 * Nếu đã có bản lưu game cũ (tu_tien_2d_save_v1) mà chưa có danh sách hồ sơ,
 * tự động khởi tạo hồ sơ mặc định "Tiêu Viêm" để bảo toàn 100% tiến trình người chơi.
 */
export function migrateExistingSaveIfNeeded() {
    try {
        const existingProfiles = localStorage.getItem(STORAGE_KEY_PROFILES);
        if (existingProfiles) return; // Đã có danh sách hồ sơ, không cần migrate

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
            } catch (e) {
                console.warn("[ProfileStorage] Không thể đọc save cũ khi migrate:", e);
            }
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
            saveKey: "tu_tien_2d_save_v1" // Hồ sơ mặc định giữ nguyên khóa save cũ
        };

        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify([defaultProfile]));
        localStorage.setItem(STORAGE_KEY_ACTIVE_ID, defaultProfile.id);
        console.log("[ProfileStorage] Auto-migration thành công: Đã tạo hồ sơ kế thừa mặc định.");
    } catch (err) {
        console.error("[ProfileStorage] Lỗi trong quá trình migrate:", err);
    }
}

/**
 * Lấy toàn bộ danh sách hồ sơ nhân vật (có tự động gọi migrate nếu cần)
 * @returns {Array} Mảng các đối tượng hồ sơ
 */
export function getProfiles() {
    try {
        migrateExistingSaveIfNeeded();
        const str = localStorage.getItem(STORAGE_KEY_PROFILES);
        if (!str) return [];
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("[ProfileStorage] Lỗi khi đọc danh sách hồ sơ:", e);
        return [];
    }
}

/**
 * Tìm hồ sơ theo ID
 * @param {string} id ID hồ sơ
 * @returns {Object|null}
 */
export function getProfileById(id) {
    const profiles = getProfiles();
    return profiles.find(p => p.id === id) || null;
}

/**
 * Lấy hồ sơ đang hoạt động (active profile)
 * @returns {Object|null}
 */
export function getActiveProfile() {
    const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    const profiles = getProfiles();
    if (!profiles.length) return null;

    if (activeId) {
        const found = profiles.find(p => p.id === activeId);
        if (found) return found;
    }

    // Nếu activeId không hợp lệ, mặc định chọn hồ sơ đầu tiên
    const first = profiles[0];
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, first.id);
    return first;
}

/**
 * Đặt hồ sơ hoạt động
 * @param {string} id ID hồ sơ được chọn
 * @returns {boolean}
 */
export function setActiveProfile(id) {
    const profile = getProfileById(id);
    if (!profile) return false;
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
    return true;
}

/**
 * Kiểm tra tính hợp lệ của dữ liệu nhập vào hồ sơ
 * @param {Object} data Dữ liệu gồm { name, notes }
 * @param {string|null} currentId ID của hồ sơ đang sửa (nếu có, để bỏ qua khi kiểm tra trùng tên)
 * @returns {Object} { isValid: boolean, errors: { name?: string, notes?: string, general?: string } }
 */
export function validateProfileData({ name = "", notes = "" } = {}, currentId = null) {
    const errors = {};
    const trimmedName = String(name).trim();

    // 1. Kiểm tra tên nhân vật
    if (!trimmedName) {
        errors.name = "Đạo hiệu nhân vật không được để trống!";
    } else if (trimmedName.length < 3) {
        errors.name = "Đạo hiệu phải có tối thiểu 3 ký tự!";
    } else if (trimmedName.length > 20) {
        errors.name = "Đạo hiệu tối đa không quá 20 ký tự!";
    } else if (/[<>\"\'\&\\\/]/.test(trimmedName)) {
        errors.name = "Đạo hiệu không được chứa các ký tự đặc biệt nguy hiểm (< > \" ' & / \\)!";
    } else {
        // Kiểm tra trùng tên với hồ sơ khác
        const profiles = getProfiles();
        const isDuplicate = profiles.some(p => p.id !== currentId && p.name.trim().toLowerCase() === trimmedName.toLowerCase());
        if (isDuplicate) {
            errors.name = `Đạo hiệu [${trimmedName}] đã tồn tại ở hồ sơ khác. Vui lòng chọn tên khác!`;
        }
    }

    // 2. Kiểm tra ghi chú
    const trimmedNotes = String(notes || "").trim();
    if (trimmedNotes.length > 100) {
        errors.notes = "Lời thề đạo tâm không được vượt quá 100 ký tự!";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        cleanData: {
            name: trimmedName,
            notes: trimmedNotes
        }
    };
}

/**
 * Tạo mới một hồ sơ nhân vật
 * @param {Object} profileData { name, avatar, notes }
 * @param {number} maxProfiles Giới hạn số lượng tối đa
 * @returns {Object} { success: boolean, profile?: Object, msg?: string, errors?: Object }
 */
export function createProfile({ name = "", avatar = "🧙‍♂️", notes = "" } = {}, maxProfiles = MAX_PROFILES_LIMIT) {
    const profiles = getProfiles();

    // 1. Kiểm tra giới hạn số lượng hồ sơ
    if (profiles.length >= maxProfiles) {
        return {
            success: false,
            msg: `Đã đạt giới hạn tối đa ${maxProfiles}/${maxProfiles} hồ sơ. Vui lòng xóa bớt hồ sơ cũ tại trang Quản Lý!`
        };
    }

    // 2. Validate dữ liệu
    const { isValid, errors, cleanData } = validateProfileData({ name, notes });
    if (!isValid) {
        return {
            success: false,
            msg: errors.name || errors.notes || "Dữ liệu nhập không hợp lệ!",
            errors
        };
    }

    const now = Date.now();
    const newId = `prof_${now}_${Math.random().toString(36).substring(2, 6)}`;
    const saveKey = `tu_tien_2d_save_profile_${newId}`;

    const newProfile = {
        id: newId,
        name: cleanData.name,
        avatar: avatar || "🧙‍♂️",
        notes: cleanData.notes || "",
        createdAt: now,
        lastPlayed: now,
        realmIndex: 0,
        tierIndex: 0,
        isVoCuc: false,
        saveKey
    };

    profiles.push(newProfile);
    try {
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
        setActiveProfile(newId);
        return {
            success: true,
            profile: newProfile,
            msg: `Tạo hồ sơ đạo thân [${newProfile.name}] thành công!`
        };
    } catch (e) {
        console.error("[ProfileStorage] Không thể ghi localStorage:", e);
        return {
            success: false,
            msg: "Lỗi bộ nhớ trình duyệt! Không thể lưu hồ sơ mới."
        };
    }
}

/**
 * Cập nhật thông tin hồ sơ (Chỉ cho phép đổi tên, avatar, ghi chú - Không cho sửa cảnh giới/chỉ số)
 * @param {string} id ID hồ sơ
 * @param {Object} updateData { name, avatar, notes }
 * @returns {Object} { success: boolean, profile?: Object, msg?: string, errors?: Object }
 */
export function updateProfile(id, { name = "", avatar = "", notes = "" } = {}) {
    const profiles = getProfiles();
    const idx = profiles.findIndex(p => p.id === id);
    if (idx === -1) {
        return { success: false, msg: "Không tìm thấy hồ sơ chỉ định!" };
    }

    const currentProfile = profiles[idx];
    const { isValid, errors, cleanData } = validateProfileData({ name, notes }, id);
    if (!isValid) {
        return {
            success: false,
            msg: errors.name || errors.notes || "Dữ liệu chỉnh sửa không hợp lệ!",
            errors
        };
    }

    // Cập nhật các thông tin mô tả, giữ nguyên chỉ số gameplay
    currentProfile.name = cleanData.name;
    if (avatar) currentProfile.avatar = avatar;
    currentProfile.notes = cleanData.notes;

    // Đồng bộ cập nhật tên vào save game slot nếu có
    if (currentProfile.saveKey) {
        try {
            const rawSaveStr = localStorage.getItem(currentProfile.saveKey);
            if (rawSaveStr) {
                const saveData = JSON.parse(rawSaveStr);
                saveData.name = cleanData.name;
                localStorage.setItem(currentProfile.saveKey, JSON.stringify(saveData));
            }
        } catch (saveSyncErr) {
            console.warn("[ProfileStorage] Không thể đồng bộ tên mới sang save slot:", saveSyncErr);
        }
    }

    try {
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
        return {
            success: true,
            profile: currentProfile,
            msg: `Cập nhật hồ sơ [${currentProfile.name}] thành công!`
        };
    } catch (e) {
        console.error("[ProfileStorage] Lỗi lưu cập nhật:", e);
        return { success: false, msg: "Lỗi ghi dữ liệu trình duyệt!" };
    }
}

/**
 * Xóa vĩnh viễn một hồ sơ và dọn sạch dữ liệu save liên quan trong LocalStorage
 * @param {string} id ID hồ sơ cần xóa
 * @returns {Object} { success: boolean, msg: string }
 */
export function deleteProfile(id) {
    const profiles = getProfiles();
    const idx = profiles.findIndex(p => p.id === id);
    if (idx === -1) {
        return { success: false, msg: "Hồ sơ không tồn tại hoặc đã bị xóa trước đó!" };
    }

    const deleted = profiles[idx];

    // 1. Dọn sạch bản lưu game và bản backup tương ứng trong LocalStorage
    if (deleted.saveKey) {
        try {
            localStorage.removeItem(deleted.saveKey);
            localStorage.removeItem(`tu_tien_2d_save_backup_${deleted.id}`);
            // Nếu là hồ sơ mặc định, dọn luôn backup gốc
            if (deleted.id === "prof_default") {
                localStorage.removeItem("tu_tien_2d_save_backup");
            }
        } catch (cleanupErr) {
            console.warn("[ProfileStorage] Lỗi dọn save slot khi xóa hồ sơ:", cleanupErr);
        }
    }

    // 2. Xóa khỏi danh sách hồ sơ
    profiles.splice(idx, 1);
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));

    // 3. Nếu đang active hồ sơ vừa xóa, tự động chuyển sang hồ sơ còn lại (nếu có)
    const currentActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (currentActiveId === id) {
        if (profiles.length > 0) {
            localStorage.setItem(STORAGE_KEY_ACTIVE_ID, profiles[0].id);
        } else {
            localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
        }
    }

    return {
        success: true,
        msg: `Đã xóa vĩnh viễn hồ sơ [${deleted.name}] và toàn bộ dữ liệu tu luyện gắn liền!`
    };
}

/**
 * Lấy số liệu thống kê Dashboard tổng hợp (Mục 13 của đề bài)
 * @returns {Object}
 */
export function getProfileDashboardStats() {
    const profiles = getProfiles();
    const totalProfiles = profiles.length;

    if (totalProfiles === 0) {
        return {
            totalProfiles: 0,
            maxCapacity: MAX_PROFILES_LIMIT,
            highestRealmText: "Chưa có",
            highestProfileName: "Không có",
            totalPlayTimeFormatted: "0 giờ 0 phút",
            latestActiveName: "Chưa có",
            latestActiveTimeText: "Chưa có"
        };
    }

    // 1. Tìm hồ sơ có cảnh giới cao nhất
    let highestProfile = profiles[0];
    let maxRankScore = -1;

    // 2. Tính tổng thời gian chơi tích lũy từ các save game
    let totalSecondsPlayed = 0;

    // 3. Tìm hồ sơ hoạt động gần nhất
    let latestProfile = profiles[0];

    profiles.forEach(p => {
        // Điểm cảnh giới: realmIndex * 1000 + tierIndex
        const score = ((p.realmIndex || 0) * 1000) + (p.tierIndex || 0) + (p.isVoCuc ? 100000 : 0);
        if (score > maxRankScore) {
            maxRankScore = score;
            highestProfile = p;
        }

        if ((p.lastPlayed || 0) > (latestProfile.lastPlayed || 0)) {
            latestProfile = p;
        }

        // Đọc thời gian chơi từ save slot
        if (p.saveKey) {
            try {
                const saveStr = localStorage.getItem(p.saveKey);
                if (saveStr) {
                    const parsed = JSON.parse(saveStr);
                    if (parsed && typeof parsed.totalPlayTime === "number") {
                        totalSecondsPlayed += parsed.totalPlayTime;
                    }
                }
            } catch (e) {
                // bỏ qua nếu lỗi
            }
        }
    });

    // Định dạng thời gian chơi
    const hours = Math.floor(totalSecondsPlayed / 3600);
    const minutes = Math.floor((totalSecondsPlayed % 3600) / 60);
    const totalPlayTimeFormatted = hours > 0
        ? `${hours} giờ ${minutes} phút`
        : `${minutes} phút`;

    const highestRealmName = REALM_NAMES[highestProfile.realmIndex] || "Tôi Khí";
    const highestTierText = highestProfile.isVoCuc
        ? `Cảnh Giới Vô Cực (Tầng ${(highestProfile.tierIndex || 0) + 1})`
        : `Tầng ${(highestProfile.tierIndex || 0) + 1}`;

    return {
        totalProfiles,
        maxCapacity: MAX_PROFILES_LIMIT,
        highestRealmText: `${highestRealmName} - ${highestTierText}`,
        highestProfileName: highestProfile.name,
        totalPlayTimeFormatted,
        latestActiveName: latestProfile.name,
        latestActiveTimeText: formatRelativeTime(latestProfile.lastPlayed)
    };
}

/**
 * Tiện ích định dạng thời gian tương đối ("Vừa xong", "5 phút trước", "2 ngày trước")
 * @param {number} timestamp 
 * @returns {string}
 */
export function formatRelativeTime(timestamp) {
    if (!timestamp) return "Chưa từng chơi";
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return "Vừa xong";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    const date = new Date(timestamp);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

/**
 * Tiện ích định dạng ngày giờ cụ thể
 * @param {number} timestamp 
 * @returns {string}
 */
export function formatDateTime(timestamp) {
    if (!timestamp) return "N/A";
    const d = new Date(timestamp);
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${hours}:${mins} - ${day}/${month}/${year}`;
}
