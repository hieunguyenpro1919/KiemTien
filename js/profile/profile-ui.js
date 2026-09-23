/**
 * MODULE GIAO DIỆN HỒ SƠ NHÂN VẬT (PROFILE UI SYSTEM)
 * Môn: JavaScript thuần & ES6+
 * Chuẩn Module: ES6 (import/export), Zero External Dependencies
 */

import { REALM_NAMES, REALM_COLORS, DEFAULT_AVATARS, formatRelativeTime, formatDateTime } from "./profile-storage.js";

/**
 * Hiển thị thông báo Toast đẹp mắt, không chặn màn hình
 * @param {string} message Nội dung thông báo
 * @param {'success'|'error'|'info'|'warning'} type Loại thông báo
 * @param {number} duration Thời gian hiển thị (ms)
 */
export function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById("profile-toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "profile-toast-container";
        container.className = "profile-toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `profile-toast toast-${type}`;
    
    const icons = {
        success: "✨",
        error: "⚠️",
        info: "ℹ️",
        warning: "🔔"
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || "ℹ️"}</span>
        <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);

    // Kích hoạt animation xuất hiện
    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    // Tự động biến mất
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

/**
 * Hiển thị Hộp thoại Xác nhận (Custom Modal Dialog)
 * Thay thế triệt để confirm() xấu xí của trình duyệt
 * @param {Object} options { title, message, confirmText, cancelText, onConfirm, onCancel }
 */
export function showConfirmModal({
    title = "Xác nhận hành động",
    message = "Đạo hữu có chắc chắn muốn thực hiện hành động này?",
    confirmText = "Đồng ý",
    cancelText = "Hủy bỏ",
    isDanger = false,
    onConfirm = () => {},
    onCancel = () => {}
} = {}) {
    // Xóa modal cũ nếu có
    const existing = document.getElementById("profile-custom-modal");
    if (existing) existing.remove();

    const backdrop = document.createElement("div");
    backdrop.id = "profile-custom-modal";
    backdrop.className = "profile-modal-backdrop";

    backdrop.innerHTML = `
        <div class="profile-modal-card">
            <div class="profile-modal-header ${isDanger ? 'danger' : ''}">
                <span class="modal-icon">${isDanger ? '⚠️' : '❓'}</span>
                <h3>${title}</h3>
            </div>
            <div class="profile-modal-body">
                <p>${message}</p>
            </div>
            <div class="profile-modal-actions">
                <button class="btn-profile-secondary" id="btn-modal-cancel">${cancelText}</button>
                <button class="${isDanger ? 'btn-profile-danger' : 'btn-profile-primary'}" id="btn-modal-confirm">${confirmText}</button>
            </div>
        </div>
    `;

    document.body.appendChild(backdrop);
    requestAnimationFrame(() => backdrop.classList.add("active"));

    const closeModal = () => {
        backdrop.classList.remove("active");
        setTimeout(() => backdrop.remove(), 300);
    };

    backdrop.querySelector("#btn-modal-cancel").addEventListener("click", () => {
        closeModal();
        onCancel();
    });

    backdrop.querySelector("#btn-modal-confirm").addEventListener("click", () => {
        closeModal();
        onConfirm();
    });

    backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
            closeModal();
            onCancel();
        }
    });
}

/**
 * Render thẻ Hồ sơ nhân vật (Character Card) cho trang index.html
 * @param {Object} profile Đối tượng hồ sơ
 * @param {boolean} isActive Hồ sơ có đang được chọn làm active hay không
 * @returns {string} Chuỗi HTML của thẻ
 */
export function renderProfileCard(profile, isActive = false) {
    const realmName = REALM_NAMES[profile.realmIndex] || "Tôi Khí";
    const realmColor = REALM_COLORS[profile.realmIndex] || "#a3b899";
    const tierText = profile.isVoCuc
        ? `Vô Cực (Tầng ${(profile.tierIndex || 0) + 1})`
        : `Tầng ${(profile.tierIndex || 0) + 1}`;

    const activeBadge = isActive 
        ? `<div class="profile-card-active-badge">Đang Tu Luyện</div>` 
        : "";

    const lastPlayedText = formatRelativeTime(profile.lastPlayed);

    return `
        <article class="profile-card ${isActive ? 'is-active' : ''}" data-profile-id="${profile.id}">
            ${activeBadge}
            <div class="profile-card-header">
                <div class="profile-card-avatar" style="border-color: ${realmColor};">
                    <span>${profile.avatar || "🧙‍♂️"}</span>
                </div>
                <div class="profile-card-identity">
                    <h3 class="profile-card-name" title="${profile.name}">${profile.name}</h3>
                    <div class="profile-card-realm" style="color: ${realmColor};">
                        <span>⚡ ${realmName}</span>
                        <span class="realm-tier-bullet">•</span>
                        <span>${tierText}</span>
                    </div>
                </div>
            </div>

            <div class="profile-card-body">
                <div class="profile-meta-row">
                    <span class="meta-label">🕒 Hoạt động:</span>
                    <span class="meta-value">${lastPlayedText}</span>
                </div>
                <div class="profile-meta-row">
                    <span class="meta-label">📅 Khởi tạo:</span>
                    <span class="meta-value">${formatDateTime(profile.createdAt).split(' - ')[1] || 'N/A'}</span>
                </div>
                ${profile.notes ? `
                    <div class="profile-card-notes" title="${profile.notes}">
                        "${profile.notes}"
                    </div>
                ` : `
                    <div class="profile-card-notes empty-notes">
                        Chưa lập lời thề đạo tâm.
                    </div>
                `}
            </div>

            <div class="profile-card-footer">
                <button class="btn-profile-enter" data-action="play" data-profile-id="${profile.id}">
                    <span>🎮 Vào Tu Luyện</span>
                </button>
                <div class="profile-quick-actions">
                    <a href="profile-detail.html?id=${profile.id}" class="btn-profile-icon" title="Chi tiết đạo thân">
                        👁️
                    </a>
                    <a href="profile-edit.html?id=${profile.id}" class="btn-profile-icon" title="Chỉnh sửa đạo thân">
                        ✏️
                    </a>
                </div>
            </div>
        </article>
    `;
}

/**
 * Render bảng chọn Avatar trực quan
 * @param {HTMLElement} containerElement Khung chứa các avatar
 * @param {string} selectedAvatar Avatar hiện tại đang chọn
 * @param {Function} onSelect Callback khi chọn avatar
 */
export function renderAvatarPicker(containerElement, selectedAvatar = "🧙‍♂️", onSelect = () => {}) {
    if (!containerElement) return;

    containerElement.innerHTML = "";
    DEFAULT_AVATARS.forEach(item => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `avatar-option ${item.icon === selectedAvatar ? 'selected' : ''}`;
        btn.dataset.icon = item.icon;
        btn.title = item.name;
        btn.innerHTML = `
            <span class="avatar-emoji">${item.icon}</span>
            <span class="avatar-label">${item.name}</span>
        `;

        btn.addEventListener("click", () => {
            containerElement.querySelectorAll(".avatar-option").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            onSelect(item.icon);
        });

        containerElement.appendChild(btn);
    });
}

/**
 * Render số liệu Dashboard thống kê tổng quan (cho profile-manage.html)
 * @param {Object} stats Số liệu từ getProfileDashboardStats()
 * @param {HTMLElement} containerElement Khung chứa 4 thẻ Dashboard
 */
export function renderDashboardCards(stats, containerElement) {
    if (!containerElement) return;

    containerElement.innerHTML = `
        <div class="dashboard-stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
                <div class="stat-label">Số Lượng Đạo Thân</div>
                <div class="stat-value">${stats.totalProfiles} <small>/ ${stats.maxCapacity}</small></div>
                <div class="stat-desc">Dung lượng hồ sơ cho phép</div>
            </div>
        </div>

        <div class="dashboard-stat-card">
            <div class="stat-icon">⚡</div>
            <div class="stat-info">
                <div class="stat-label">Cảnh Giới Cao Nhất</div>
                <div class="stat-value-highlight">${stats.highestRealmText}</div>
                <div class="stat-desc">Đạo hiệu: <strong>${stats.highestProfileName}</strong></div>
            </div>
        </div>

        <div class="dashboard-stat-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-info">
                <div class="stat-label">Tổng Thời Gian Tu Đạo</div>
                <div class="stat-value">${stats.totalPlayTimeFormatted}</div>
                <div class="stat-desc">Tích lũy từ tất cả hồ sơ</div>
            </div>
        </div>

        <div class="dashboard-stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-info">
                <div class="stat-label">Hoạt Động Gần Nhất</div>
                <div class="stat-value-sm">${stats.latestActiveName}</div>
                <div class="stat-desc">${stats.latestActiveTimeText}</div>
            </div>
        </div>
    `;
}

/**
 * Render 1 hàng trong bảng Quản lý danh sách (profile-manage.html)
 * @param {Object} profile Đối tượng hồ sơ
 * @param {number} index Thứ tự hiển thị
 * @param {boolean} isActive Có phải active không
 * @returns {string} Chuỗi HTML <tr>
 */
export function renderProfileTableRow(profile, index, isActive = false) {
    const realmName = REALM_NAMES[profile.realmIndex] || "Tôi Khí";
    const realmColor = REALM_COLORS[profile.realmIndex] || "#a3b899";
    const tierText = profile.isVoCuc
        ? `Vô Cực (${(profile.tierIndex || 0) + 1})`
        : `Tầng ${(profile.tierIndex || 0) + 1}`;

    return `
        <tr data-profile-id="${profile.id}" class="${isActive ? 'row-active' : ''}">
            <td class="text-center">${index + 1}</td>
            <td>
                <div class="table-profile-cell">
                    <span class="table-avatar">${profile.avatar || "🧙‍♂️"}</span>
                    <div class="table-profile-info">
                        <strong>${profile.name}</strong>
                        ${isActive ? '<span class="badge-active">Đang chọn</span>' : ''}
                    </div>
                </div>
            </td>
            <td>
                <span class="table-realm-badge" style="background: ${realmColor}22; color: ${realmColor}; border-color: ${realmColor}44;">
                    ${realmName} • ${tierText}
                </span>
            </td>
            <td>
                <span title="${formatDateTime(profile.lastPlayed)}">
                    ${formatRelativeTime(profile.lastPlayed)}
                </span>
            </td>
            <td class="text-center">
                <div class="table-actions">
                    <button class="btn-tbl btn-tbl-play" data-action="play" data-profile-id="${profile.id}" title="Vào Tu Luyện">
                        🎮 Chơi
                    </button>
                    <a href="profile-detail.html?id=${profile.id}" class="btn-tbl btn-tbl-view" title="Xem Chi Tiết">
                        👁️
                    </a>
                    <a href="profile-edit.html?id=${profile.id}" class="btn-tbl btn-tbl-edit" title="Chỉnh Sửa">
                        ✏️
                    </a>
                    <button class="btn-tbl btn-tbl-delete" data-action="delete" data-profile-id="${profile.id}" data-profile-name="${profile.name}" title="Xóa Vĩnh Viễn">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `;
}
