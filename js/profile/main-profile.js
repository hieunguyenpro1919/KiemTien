/**
 * CONTROLLER: TRANG CHỌN HỒ SƠ TU TIÊN (MAIN PROFILE PORTAL)
 * Gắn với: index.html
 */

import { getProfiles, getActiveProfile, setActiveProfile, MAX_PROFILES_LIMIT } from "./profile-storage.js";
import { renderProfileCard, showToast } from "./profile-ui.js";

document.addEventListener("DOMContentLoaded", () => {
    initPortal();
});

function initPortal() {
    const gridEl = document.getElementById("profiles-grid");
    const countBadgeEl = document.getElementById("profile-capacity-badge");
    const btnCreateNewEl = document.getElementById("btn-quick-create");

    const profiles = getProfiles();
    const activeProfile = getActiveProfile();

    // 1. Cập nhật huy hiệu số lượng hồ sơ
    if (countBadgeEl) {
        countBadgeEl.textContent = `${profiles.length}/${MAX_PROFILES_LIMIT}`;
        if (profiles.length >= MAX_PROFILES_LIMIT) {
            countBadgeEl.classList.add("badge-full");
        } else {
            countBadgeEl.classList.remove("badge-full");
        }
    }

    // 2. Ẩn/hiện nút tạo nhanh nếu đã đạt tối đa
    if (btnCreateNewEl && profiles.length >= MAX_PROFILES_LIMIT) {
        btnCreateNewEl.classList.add("disabled");
        btnCreateNewEl.setAttribute("title", "Đã đạt số lượng hồ sơ tối đa (5/5). Vui lòng xóa bớt tại trang Quản Lý!");
    }

    // 3. Render danh sách hồ sơ
    if (!gridEl) return;

    if (profiles.length === 0) {
        gridEl.innerHTML = `
            <div class="empty-state-card">
                <div class="empty-icon">🪷</div>
                <h3>Chưa Có Đạo Thân Nào Khởi Đạo</h3>
                <p>Hãy lập hồ sơ đạo thân đầu tiên để chính thức bước lên con đường nghịch thiên tu tiên!</p>
                <a href="profile-create.html" class="btn-profile-primary" style="margin-top: 16px; display: inline-flex; align-items: center; gap: 8px;">
                    <span>✨ Khởi Tạo Đạo Thân</span>
                </a>
            </div>
        `;
        return;
    }

    let html = "";
    profiles.forEach(p => {
        const isActive = activeProfile && activeProfile.id === p.id;
        html += renderProfileCard(p, isActive);
    });

    // Nếu chưa đầy 5 slot, thêm thẻ "Thêm hồ sơ mới" dạng nét đứt mời gọi
    if (profiles.length < MAX_PROFILES_LIMIT) {
        html += `
            <a href="profile-create.html" class="profile-card profile-card-add" title="Khởi tạo thêm một đạo thân mới">
                <div class="add-icon-wrapper">
                    <span class="add-icon">➕</span>
                </div>
                <h3>Lập Đạo Thân Mới</h3>
                <p>Còn trống ${MAX_PROFILES_LIMIT - profiles.length} linh vị</p>
            </a>
        `;
    }

    gridEl.innerHTML = html;

    // 4. Lắng nghe sự kiện click trên các nút trong thẻ
    gridEl.querySelectorAll("[data-action='play']").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const profileId = btn.dataset.profileId;
            launchGame(profileId);
        });
    });

    // Cho phép click cả thẻ để chọn và vào game luôn
    gridEl.querySelectorAll(".profile-card:not(.profile-card-add)").forEach(card => {
        card.addEventListener("click", (e) => {
            // Tránh trigger nếu click trúng link sửa/xem
            if (e.target.closest("a") || e.target.closest("button")) return;
            const profileId = card.dataset.profileId;
            launchGame(profileId);
        });
    });
}

/**
 * Kích hoạt hồ sơ và điều hướng sang màn hình game chính
 * @param {string} profileId 
 */
function launchGame(profileId) {
    if (!profileId) return;
    setActiveProfile(profileId);
    showToast("Đang hội nhập chân linh... Chúc đạo hữu đắc đạo phi thăng!", "success", 1500);
    setTimeout(() => {
        window.location.href = "game.html";
    }, 400);
}
