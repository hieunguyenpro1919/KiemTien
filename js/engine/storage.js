/**
 * HỆ THỐNG LƯU TRỮ VÀ TẢI TIẾN TRÌNH (STORAGE SYSTEM)
 * Tuân thủ nghiêm ngặt chuẩn "KIEM TIEN - SAVE SYSTEM & DATA COMPATIBILITY SPECIFICATION"
 * 
 * 1. Schema Immutability: Không đổi tên/xóa field cốt lõi
 * 2. Merge Default State: Luôn deep merge với DEFAULT_PLAYER_DATA
 * 3. Version Migration: CURRENT_SAVE_VERSION & migrateSaveData()
 * 4. Safe Write / Auto-Backup: Lưu vào tu_tien_2d_save_backup trước khi ghi đè
 * 5. Defensive Coding: Kiểm tra an toàn, try-catch, tự động phục hồi từ backup khi save chính hỏng
 */

class StorageSystem {
    static SAVE_KEY = "tu_tien_2d_save_v1";
    static BACKUP_KEY = "tu_tien_2d_save_backup";
    static CURRENT_SAVE_VERSION = 4;

    /**
     * Tự động sao lưu dự phòng (Safe Write / Auto-Backup)
     * Trước khi ghi đè chuỗi dữ liệu mới vào khóa chính, luôn sao lưu chuỗi cũ vào khóa backup
     */
    static save(player) {
        try {
            if (!player || typeof player.toJSON !== "function") {
                console.error("[Storage] Không thể lưu: Đối tượng player không hợp lệ!");
                return false;
            }

            const data = player.toJSON();
            data.saveVersion = this.CURRENT_SAVE_VERSION;
            const newJsonStr = JSON.stringify(data);

            // 1. Sao lưu bản lưu hiện tại sang khóa backup trước khi ghi đè
            try {
                if (typeof localStorage !== "undefined") {
                    const currentData = localStorage.getItem(this.SAVE_KEY);
                    if (currentData) {
                        localStorage.setItem(this.BACKUP_KEY, currentData);
                    }
                }
            } catch (backupErr) {
                console.warn("[Storage] Không thể ghi khóa backup (có thể bộ nhớ đầy):", backupErr);
            }

            // 2. Ghi bản lưu mới vào khóa chính
            if (typeof localStorage !== "undefined") {
                localStorage.setItem(this.SAVE_KEY, newJsonStr);
            }
            return true;
        } catch (e) {
            console.error("[Storage] Lỗi nghiêm trọng khi lưu game:", e);
            return false;
        }
    }

    /**
     * Nạp dữ liệu với Merge Default State & Migration
     */
    static load(player) {
        try {
            if (typeof localStorage === "undefined") return false;

            let str = localStorage.getItem(this.SAVE_KEY);

            // Nếu khóa chính không có dữ liệu, thử tìm ở khóa backup
            if (!str) {
                str = localStorage.getItem(this.BACKUP_KEY);
                if (!str) return false;
                console.warn("[Storage] Khóa chính trống, đã tìm thấy dữ liệu từ khóa backup.");
            }

            let rawData;
            try {
                rawData = JSON.parse(str);
            } catch (parseErr) {
                console.error("[Storage] Dữ liệu khóa chính bị hỏng cú pháp JSON! Đang thử khôi phục từ backup...", parseErr);
                return this.tryRecoverFromBackup(player);
            }

            // Tiến hành migration và nạp vào player
            const migratedData = this.migrateSaveData(rawData);
            player.fromJSON(migratedData);
            return true;
        } catch (e) {
            console.error("[Storage] Lỗi khi nạp dữ liệu game:", e);
            return this.tryRecoverFromBackup(player);
        }
    }

    /**
     * Thử phục hồi từ bản sao lưu dự phòng khi bản chính gặp lỗi
     */
    static tryRecoverFromBackup(player) {
        try {
            if (typeof localStorage === "undefined") return false;
            const backupStr = localStorage.getItem(this.BACKUP_KEY);
            if (!backupStr) return false;
            const backupData = JSON.parse(backupStr);
            const migratedData = this.migrateSaveData(backupData);
            player.fromJSON(migratedData);
            console.warn("[Storage] Đã phục hồi dữ liệu người chơi thành công từ bản sao lưu dự phòng!");
            // Ghi đè lại bản phục hồi sang bản chính
            this.save(player);
            return true;
        } catch (err) {
            console.error("[Storage] Phục hồi từ bản sao lưu dự phòng cũng thất bại:", err);
            return false;
        }
    }

    /**
     * Quy trình Migration dữ liệu theo Version & Hợp nhất cấu trúc mặc định (Merge Default State)
     */
    static migrateSaveData(savedData) {
        const defaultData = (typeof Player !== "undefined" && typeof Player.getDefaultData === "function")
            ? Player.getDefaultData()
            : {
                saveVersion: this.CURRENT_SAVE_VERSION,
                name: "Tiêu Viêm",
                realmIndex: 0,
                tierIndex: 0,
                tuVi: 0,
                statPoints: 4,
                statVatLi: 0,
                statPhep: 0,
                statMau: 0,
                equipped: { non: null, giap: null, vukhi: null },
                equippedSkills: ["skill_toai_thach_quyen", "skill_dan_hoa_thuat", null],
                learnedSkills: ["skill_toai_thach_quyen", "skill_dan_hoa_thuat"],
                inventory: ["hat_01", "armor_01", "weapon_01", "pill_tu_khi_tieu", "pill_tu_khi_tieu", "item_rename_scroll"],
                equippedTitle: "title_so_nhap",
                unlockedTitles: ["title_so_nhap"],
                hasHadRenameScroll: true,
                linhThach: 200,
                clearedStages: [],
                pillsConsumed: 0,
                towerData: {
                    highestFloor: 0,
                    currentFloor: 1,
                    dailyTickets: 3,
                    lastResetDate: ""
                },
                lastOnlineTime: Date.now()
            };

        if (!savedData || typeof savedData !== "object") {
            return defaultData;
        }

        // Hợp nhất Default State với Saved Data (Deep Merge an toàn)
        const merged = {
            ...defaultData,
            ...savedData,
            equipped: {
                ...defaultData.equipped,
                ...(savedData.equipped || {})
            },
            equippedSkills: Array.isArray(savedData.equippedSkills)
                ? [
                    savedData.equippedSkills[0] ?? defaultData.equippedSkills[0],
                    savedData.equippedSkills[1] ?? defaultData.equippedSkills[1],
                    savedData.equippedSkills[2] ?? defaultData.equippedSkills[2]
                ]
                : [...defaultData.equippedSkills],
            learnedSkills: Array.isArray(savedData.learnedSkills)
                ? [...savedData.learnedSkills]
                : [...defaultData.learnedSkills],
            inventory: Array.isArray(savedData.inventory)
                ? [...savedData.inventory]
                : [...defaultData.inventory],
            unlockedTitles: Array.isArray(savedData.unlockedTitles) && savedData.unlockedTitles.length > 0
                ? [...savedData.unlockedTitles]
                : [...defaultData.unlockedTitles],
            clearedStages: Array.isArray(savedData.clearedStages)
                ? [...savedData.clearedStages]
                : [...defaultData.clearedStages],
            towerData: (savedData.towerData && typeof savedData.towerData === "object")
                ? {
                    ...defaultData.towerData,
                    ...savedData.towerData
                }
                : { ...defaultData.towerData }
        };

        let ver = Number(savedData?.saveVersion) || 1;

        // V1 -> V2 Migration:
        // Cập nhật hệ thống Danh Hiệu (Titles), Cuộn Giấy Đổi Tên, tiền Linh Thạch
        if (ver < 2) {
            if (merged.linhThach === undefined || isNaN(merged.linhThach)) {
                merged.linhThach = 200;
            }
            if (!merged.equippedTitle) {
                merged.equippedTitle = "title_so_nhap";
            }
            if (!merged.unlockedTitles || merged.unlockedTitles.length === 0) {
                merged.unlockedTitles = ["title_so_nhap"];
            }
            if (savedData.hasHadRenameScroll !== true && !merged.inventory.includes("item_rename_scroll")) {
                merged.inventory.push("item_rename_scroll");
            }
            merged.hasHadRenameScroll = true;
            ver = 2;
        }

        // V2 -> V3 Migration:
        // Cập nhật hệ thống Hỗn Nguyên Thạch (honNguyen), Tinh Nguyên Đại Đạo (tinhNguyen), và Cảnh Giới Vô Cực (isVoCuc)
        if (ver < 3) {
            if (merged.honNguyen === undefined || isNaN(merged.honNguyen)) {
                merged.honNguyen = 0;
            }
            if (merged.tinhNguyen === undefined || isNaN(merged.tinhNguyen)) {
                merged.tinhNguyen = 0;
            }
            if (merged.isVoCuc === undefined) {
                merged.isVoCuc = false;
            }
            // Nếu người chơi cũ đã ở Tầng >= 100 của Đại Đạo Chí Cao (realmIndex >= 11, tierIndex >= 99)
            if (merged.realmIndex >= 11 && merged.tierIndex >= 99) {
                merged.isVoCuc = true;
                // PHƯƠNG ÁN A: KHÔNG tự động thêm stage_vo_cuc!
                // Người chơi cũ dù đã vượt Tầng 100 vẫn phải đánh bại Ải 22 mới được tiếp tục đột phá.
                if (merged.tuVi && merged.tuVi > 0) {
                    merged.tinhNguyen = Math.floor(merged.tuVi / 1000000000);
                    merged.tuVi = 0;
                }
            }
            ver = 3;
        }

        // V3 -> V4 Migration:
        // Cập nhật hệ thống Tam Đại Thần Thú & Cơ Chế Nuôi Dưỡng (activePetId, pets)
        if (ver < 4) {
            if (merged.activePetId === undefined) {
                merged.activePetId = null;
            }
            if (!merged.pets || typeof merged.pets !== "object") {
                merged.pets = {
                    pet_tank: { unlocked: false, realm: 0, exp: 0, skillLevel: 1, shards: 0 },
                    pet_dps:  { unlocked: false, realm: 0, exp: 0, skillLevel: 1, shards: 0 },
                    pet_buff: { unlocked: false, realm: 0, exp: 0, skillLevel: 1, shards: 0 }
                };
            }
            ver = 4;
        }

        merged.saveVersion = this.CURRENT_SAVE_VERSION;
        return merged;
    }

    /**
     * Xóa dữ liệu (cả khóa chính và khóa backup)
     */
    static clear() {
        try {
            if (typeof localStorage !== "undefined") {
                localStorage.removeItem(this.SAVE_KEY);
                localStorage.removeItem(this.BACKUP_KEY);
            }
            return true;
        } catch (e) {
            console.error("[Storage] Lỗi khi xóa save:", e);
            return false;
        }
    }

    /**
     * Xuất chuỗi sao lưu Base64 tương thích tuyệt đối
     */
    static exportSaveString(player) {
        try {
            const data = player.toJSON();
            data.saveVersion = this.CURRENT_SAVE_VERSION;
            const json = JSON.stringify(data);
            return btoa(unescape(encodeURIComponent(json)));
        } catch (e) {
            console.error("[Storage] Lỗi khi xuất chuỗi sao lưu:", e);
            return null;
        }
    }

    /**
     * Nhập chuỗi sao lưu Base64 (Hỗ trợ cả chuỗi phiên bản cũ)
     */
    static importSaveString(player, code) {
        try {
            if (!code || typeof code !== "string") return false;
            const cleanCode = code.trim();
            if (!cleanCode) return false;

            const json = decodeURIComponent(escape(atob(cleanCode)));
            const rawData = JSON.parse(json);

            // Cho chạy qua pipeline Migration & Merge
            const migratedData = this.migrateSaveData(rawData);
            player.fromJSON(migratedData);

            // Lưu ngay lập tức sau khi import thành công
            this.save(player);
            return true;
        } catch (e) {
            console.error("[Storage] Lỗi khi nhập chuỗi sao lưu:", e);
            return false;
        }
    }
}

if (typeof window !== "undefined") {
    window.StorageSystem = StorageSystem;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = StorageSystem;
    module.exports.StorageSystem = StorageSystem;
}
