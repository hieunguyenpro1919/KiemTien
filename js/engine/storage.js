/**
 * HỆ THỐNG LƯU TRỮ VÀ TẢI TIẾN TRÌNH (STORAGE)
 * Tự động lưu vào LocalStorage, hỗ trợ Xuất / Nhập mã sao lưu
 */

class StorageSystem {
    static SAVE_KEY = "tu_tien_2d_save_v1";

    static save(player) {
        try {
            const data = player.toJSON();
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error("Lỗi khi lưu game:", e);
            return false;
        }
    }

    static load(player) {
        try {
            const str = localStorage.getItem(this.SAVE_KEY);
            if (!str) return false;
            const data = JSON.parse(str);
            player.fromJSON(data);
            return true;
        } catch (e) {
            console.error("Lỗi khi tải game:", e);
            return false;
        }
    }

    static clear() {
        localStorage.removeItem(this.SAVE_KEY);
    }

    static exportSaveString(player) {
        try {
            const json = JSON.stringify(player.toJSON());
            return btoa(unescape(encodeURIComponent(json)));
        } catch (e) {
            return null;
        }
    }

    static importSaveString(player, code) {
        try {
            const json = decodeURIComponent(escape(atob(code.trim())));
            const data = JSON.parse(json);
            player.fromJSON(data);
            this.save(player);
            return true;
        } catch (e) {
            return false;
        }
    }
}

if (typeof window !== "undefined") {
    window.StorageSystem = StorageSystem;
}
