/**
 * CONTROLLER: KHỞI TẠO HỒ SƠ NHÂN VẬT MỚI (CREATE PROFILE)
 * Gắn với: profile-create.html
 */

import { getProfiles, createProfile, validateProfileData, MAX_PROFILES_LIMIT } from "./profile-storage.js";
import { renderAvatarPicker, showToast } from "./profile-ui.js";

document.addEventListener("DOMContentLoaded", () => {
    initCreatePage();
});

function initCreatePage() {
    // 1. Kiểm tra giới hạn hồ sơ trước
    const profiles = getProfiles();
    if (profiles.length >= MAX_PROFILES_LIMIT) {
        showLimitExceededBanner();
        return;
    }

    const form = document.getElementById("form-create-profile");
    const nameInput = document.getElementById("input-profile-name");
    const notesInput = document.getElementById("input-profile-notes");
    const nameErrorEl = document.getElementById("name-error");
    const notesCounterEl = document.getElementById("notes-counter");
    const avatarContainer = document.getElementById("avatar-picker-container");

    // Các phần tử hiển thị Live Preview
    const previewAvatarEl = document.getElementById("preview-avatar");
    const previewNameEl = document.getElementById("preview-name");
    const previewNotesEl = document.getElementById("preview-notes");

    let currentSelectedAvatar = "🧙‍♂️";

    // 2. Khởi tạo Avatar Picker
    if (avatarContainer) {
        renderAvatarPicker(avatarContainer, currentSelectedAvatar, (newAvatar) => {
            currentSelectedAvatar = newAvatar;
            if (previewAvatarEl) previewAvatarEl.textContent = newAvatar;
        });
    }

    // 3. Realtime Validation & Live Preview cho Đạo Hiệu (Name)
    if (nameInput) {
        nameInput.addEventListener("input", () => {
            const rawVal = nameInput.value;
            const trimmed = rawVal.trim();

            // Cập nhật Live Preview
            if (previewNameEl) {
                previewNameEl.textContent = trimmed || "Chưa đặt đạo hiệu";
            }

            // Real-time validation
            const { isValid, errors } = validateProfileData({ name: trimmed, notes: notesInput ? notesInput.value : "" });
            if (errors.name) {
                nameInput.classList.add("input-invalid");
                if (nameErrorEl) {
                    nameErrorEl.textContent = errors.name;
                    nameErrorEl.style.display = "block";
                }
            } else {
                nameInput.classList.remove("input-invalid");
                if (nameErrorEl) {
                    nameErrorEl.textContent = "";
                    nameErrorEl.style.display = "none";
                }
            }
        });
    }

    // 4. Realtime Validation & Counter cho Lời Thề Đạo Tâm (Notes)
    if (notesInput) {
        notesInput.addEventListener("input", () => {
            const val = notesInput.value;
            const len = val.length;

            if (notesCounterEl) {
                notesCounterEl.textContent = `${len}/100`;
                if (len > 100) {
                    notesCounterEl.classList.add("counter-exceeded");
                } else {
                    notesCounterEl.classList.remove("counter-exceeded");
                }
            }

            if (previewNotesEl) {
                previewNotesEl.textContent = val.trim() ? `"${val.trim()}"` : "Chưa lập lời thề đạo tâm.";
            }
        });
    }

    // 5. Submit Form
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = nameInput ? nameInput.value : "";
            const notes = notesInput ? notesInput.value : "";

            const result = createProfile({
                name,
                avatar: currentSelectedAvatar,
                notes
            });

            if (!result.success) {
                showToast(result.msg || "Không thể tạo hồ sơ!", "error");
                if (result.errors && result.errors.name && nameErrorEl) {
                    nameErrorEl.textContent = result.errors.name;
                    nameErrorEl.style.display = "block";
                    nameInput.focus();
                }
                return;
            }

            showToast(result.msg, "success", 2000);
            setTimeout(() => {
                // Tùy chọn chuyển thẳng về cổng chọn hoặc vào game
                window.location.href = "index.html";
            }, 500);
        });
    }
}

function showLimitExceededBanner() {
    const mainBox = document.getElementById("create-card-box");
    if (mainBox) {
        mainBox.innerHTML = `
            <div class="limit-exceeded-state">
                <span class="limit-icon">🛑</span>
                <h2>ĐÃ ĐẠT GIỚI HẠN 5 HỒ SƠ</h2>
                <p>Số lượng đạo thân đã đạt mức tối đa (5/5). Đạo môn không thể phân thân thêm.</p>
                <div class="limit-actions">
                    <a href="profile-manage.html" class="btn-profile-primary">🗂️ Quản Lý & Xóa Bớt Hồ Sơ</a>
                    <a href="index.html" class="btn-profile-secondary">⬅️ Quay Về Cổng Chọn</a>
                </div>
            </div>
        `;
    }
}
