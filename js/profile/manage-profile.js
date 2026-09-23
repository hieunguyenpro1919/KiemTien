/**
 * CONTROLLER: QUẢN LÝ & THỐNG KÊ DANH SÁCH HỒ SƠ (MANAGE PROFILES)
 * Gắn với: profile-manage.html
 */

import { getProfiles, getActiveProfile, setActiveProfile, deleteProfile, getProfileDashboardStats, MAX_PROFILES_LIMIT } from "./profile-storage.js";
import { renderDashboardCards, renderProfileTableRow, showToast, showConfirmModal } from "./profile-ui.js";

document.addEventListener("DOMContentLoaded", () => {
    initManagePage();
});

function initManagePage() {
    renderAll();
}

function renderAll() {
    const profiles = getProfiles();
    const activeProfile = getActiveProfile();
    const stats = getProfileDashboardStats();

    // 1. Render Dashboard Cards
    const dashboardContainer = document.getElementById("dashboard-stats-grid");
    if (dashboardContainer) {
        renderDashboardCards(stats, dashboardContainer);
    }

    // 2. Cập nhật nút tạo mới và huy hiệu giới hạn
    const btnCreateNew = document.getElementById("btn-manage-create");
    const countBadge = document.getElementById("manage-capacity-badge");
    if (countBadge) {
        countBadge.textContent = `${profiles.length}/${MAX_PROFILES_LIMIT}`;
    }
    if (btnCreateNew) {
        if (profiles.length >= MAX_PROFILES_LIMIT) {
            btnCreateNew.classList.add("disabled");
            btnCreateNew.removeAttribute("href");
            btnCreateNew.setAttribute("title", "Đã đầy danh ngạch 5 hồ sơ. Hãy xóa bớt trước khi tạo mới!");
        } else {
            btnCreateNew.classList.remove("disabled");
            btnCreateNew.setAttribute("href", "profile-create.html");
            btnCreateNew.removeAttribute("title");
        }
    }

    // 3. Render Bảng Hồ Sơ
    const tableBody = document.getElementById("profiles-table-body");
    const emptyState = document.getElementById("table-empty-state");
    const tableWrap = document.getElementById("table-container-wrap");

    if (!tableBody) return;

    if (profiles.length === 0) {
        if (tableWrap) tableWrap.style.display = "none";
        if (emptyState) emptyState.style.display = "block";
        return;
    }

    if (tableWrap) tableWrap.style.display = "block";
    if (emptyState) emptyState.style.display = "none";

    let rowsHtml = "";
    profiles.forEach((p, idx) => {
        const isActive = activeProfile && activeProfile.id === p.id;
        rowsHtml += renderProfileTableRow(p, idx, isActive);
    });
    tableBody.innerHTML = rowsHtml;

    // 4. Gắn sự kiện cho các nút hành động trong bảng
    tableBody.querySelectorAll("[data-action='play']").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.profileId;
            setActiveProfile(id);
            showToast("Đang chuẩn bị động phủ... Chúc tu hành thuận lợi!", "success", 1200);
            setTimeout(() => window.location.href = "game.html", 300);
        });
    });

    tableBody.querySelectorAll("[data-action='delete']").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.profileId;
            const name = btn.dataset.profileName || "Hồ sơ";

            showConfirmModal({
                title: "XÓA ĐẠO THÂN",
                message: `Đạo hữu có thực sự muốn xóa bỏ hồ sơ [${name}]? Mọi cảnh giới, pháp bảo, đan dược và linh thú gắn liền sẽ vĩnh viễn tiêu tán!`,
                confirmText: "Đồng Ý Xóa",
                cancelText: "Hủy Bỏ",
                isDanger: true,
                onConfirm: () => {
                    const result = deleteProfile(id);
                    if (result.success) {
                        showToast(result.msg, "success");
                        renderAll(); // Cập nhật lại UI không cần tải lại trang
                    } else {
                        showToast(result.msg, "error");
                    }
                }
            });
        });
    });
}
