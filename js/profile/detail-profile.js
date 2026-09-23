/**
 * CONTROLLER: CHI TIẾT HỒ SƠ NHÂN VẬT (PROFILE DETAIL)
 * Gắn với: profile-detail.html
 */

import { getProfileById, setActiveProfile, deleteProfile, REALM_NAMES, REALM_COLORS, formatRelativeTime, formatDateTime } from "./profile-storage.js";
import { showToast, showConfirmModal } from "./profile-ui.js";

document.addEventListener("DOMContentLoaded", () => {
    initDetailPage();
});

function initDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get("id");

    if (!profileId) {
        showToast("Không tìm thấy mã hồ sơ!", "error");
        setTimeout(() => window.location.href = "index.html", 1500);
        return;
    }

    const profile = getProfileById(profileId);
    if (!profile) {
        showToast("Hồ sơ không tồn tại hoặc đã bị xóa!", "error");
        setTimeout(() => window.location.href = "index.html", 1500);
        return;
    }

    // 1. Đọc dữ liệu chi tiết từ save slot nếu có
    let saveData = null;
    if (profile.saveKey) {
        try {
            const raw = localStorage.getItem(profile.saveKey);
            if (raw) saveData = JSON.parse(raw);
        } catch (e) {
            console.warn("Không đọc được save slot của profile:", e);
        }
    }

    // 2. Điền các trường thông tin cơ bản
    const realmName = REALM_NAMES[profile.realmIndex] || "Tôi Khí";
    const realmColor = REALM_COLORS[profile.realmIndex] || "#a3b899";
    const tierText = profile.isVoCuc
        ? `Cảnh Giới Vô Cực (Tầng ${(profile.tierIndex || 0) + 1})`
        : `Tầng ${(profile.tierIndex || 0) + 1}`;

    const setText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setText("detail-avatar", profile.avatar || "🧙‍♂️");
    setText("detail-name", profile.name);
    setText("detail-realm", `${realmName} • ${tierText}`);
    const realmEl = document.getElementById("detail-realm");
    if (realmEl) {
        realmEl.style.color = realmColor;
    }

    setText("detail-created-at", formatDateTime(profile.createdAt));
    setText("detail-last-played", `${formatRelativeTime(profile.lastPlayed)} (${formatDateTime(profile.lastPlayed)})`);
    setText("detail-notes", profile.notes ? `"${profile.notes}"` : "Chưa lập lời thề đạo tâm.");

    // 3. Tính toán và hiển thị các chỉ số tu vi chi tiết (từ saveData nếu có, hoặc mặc định cấp 1)
    let hp = 100, atk = 15, def = 5, speed = 10, critRate = "5%", critDmg = "150%";
    let linhThach = 200, honNguyen = 0, petName = "Chưa thuần hóa";
    let playTimeFormatted = "Chưa ghi nhận";

    if (saveData) {
        if (saveData.stats) {
            hp = saveData.stats.maxHp || hp;
            atk = saveData.stats.atk || atk;
            def = saveData.stats.def || def;
            speed = saveData.stats.speed || speed;
            if (typeof saveData.stats.critRate === "number") critRate = `${Math.round(saveData.stats.critRate * 100)}%`;
            if (typeof saveData.stats.critDmg === "number") critDmg = `${Math.round(saveData.stats.critDmg * 100)}%`;
        }
        if (typeof saveData.linhThach === "number") linhThach = saveData.linhThach.toLocaleString("vi-VN");
        if (typeof saveData.honNguyenThach === "number") honNguyen = saveData.honNguyenThach.toLocaleString("vi-VN");

        if (saveData.activePet) {
            petName = `${saveData.activePet.name || 'Linh Thú'} (Cấp ${saveData.activePet.level || 1})`;
        }

        if (typeof saveData.totalPlayTime === "number") {
            const h = Math.floor(saveData.totalPlayTime / 3600);
            const m = Math.floor((saveData.totalPlayTime % 3600) / 60);
            playTimeFormatted = h > 0 ? `${h} giờ ${m} phút` : `${m} phút`;
        }
    }

    setText("stat-hp", hp);
    setText("stat-atk", atk);
    setText("stat-def", def);
    setText("stat-speed", speed);
    setText("stat-crit", `${critRate} / ${critDmg}`);
    setText("stat-linhthach", linhThach);
    setText("stat-honnguyen", honNguyen);
    setText("stat-pet", petName);
    setText("stat-playtime", playTimeFormatted);

    // 4. Gắn sự kiện các nút hành động
    const btnPlay = document.getElementById("btn-detail-play");
    if (btnPlay) {
        btnPlay.addEventListener("click", () => {
            setActiveProfile(profileId);
            showToast("Khởi động tu vi... Đang chuyển vào Động Phủ!", "success", 1200);
            setTimeout(() => window.location.href = "game.html", 400);
        });
    }

    const btnEdit = document.getElementById("btn-detail-edit");
    if (btnEdit) {
        btnEdit.addEventListener("click", () => {
            window.location.href = `profile-edit.html?id=${profileId}`;
        });
    }

    const btnDelete = document.getElementById("btn-detail-delete");
    if (btnDelete) {
        btnDelete.addEventListener("click", () => {
            showConfirmModal({
                title: "HỦY BỎ ĐẠO THÂN",
                message: `Đạo hữu có chắc chắn muốn xóa vĩnh viễn hồ sơ [${profile.name}]? Toàn bộ cảnh giới, trang bị và linh thạch của hồ sơ này sẽ bị xóa sạch và không thể khôi phục!`,
                confirmText: "Xác Nhận Xóa",
                cancelText: "Giữ Lại",
                isDanger: true,
                onConfirm: () => {
                    const res = deleteProfile(profileId);
                    if (res.success) {
                        showToast(res.msg, "success", 2000);
                        setTimeout(() => window.location.href = "index.html", 600);
                    } else {
                        showToast(res.msg, "error");
                    }
                }
            });
        });
    }
}
