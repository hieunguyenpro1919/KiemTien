/**
 * CONTROLLER: CHỈNH SỬA THÔNG TIN HỒ SƠ (EDIT PROFILE)
 * Gắn với: profile-edit.html
 */

import { getProfileById, updateProfile, validateProfileData } from "./profile-storage.js";
import { renderAvatarPicker, showToast } from "./profile-ui.js";

document.addEventListener("DOMContentLoaded", () => {
    initEditPage();
});

function initEditPage() {
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

    const form = document.getElementById("form-edit-profile");
    const nameInput = document.getElementById("input-profile-name");
    const notesInput = document.getElementById("input-profile-notes");
    const nameErrorEl = document.getElementById("name-error");
    const notesCounterEl = document.getElementById("notes-counter");
    const avatarContainer = document.getElementById("avatar-picker-container");

    // Các phần tử Live Preview
    const previewAvatarEl = document.getElementById("preview-avatar");
    const previewNameEl = document.getElementById("preview-name");
    const previewNotesEl = document.getElementById("preview-notes");

    let currentSelectedAvatar = profile.avatar || "🧙‍♂️";

    // Điền dữ liệu ban đầu
    if (nameInput) nameInput.value = profile.name;
    if (notesInput) notesInput.value = profile.notes || "";
    if (previewAvatarEl) previewAvatarEl.textContent = currentSelectedAvatar;
    if (previewNameEl) previewNameEl.textContent = profile.name;
    if (previewNotesEl) previewNotesEl.textContent = profile.notes ? `"${profile.notes}"` : "Chưa lập lời thề đạo tâm.";
    if (notesCounterEl) notesCounterEl.textContent = `${(profile.notes || "").length}/100`;

    // Khởi tạo Avatar Picker
    if (avatarContainer) {
        renderAvatarPicker(avatarContainer, currentSelectedAvatar, (newAvatar) => {
            currentSelectedAvatar = newAvatar;
            if (previewAvatarEl) previewAvatarEl.textContent = newAvatar;
        });
    }

    // Realtime Validation cho Tên
    if (nameInput) {
        nameInput.addEventListener("input", () => {
            const rawVal = nameInput.value;
            const trimmed = rawVal.trim();

            if (previewNameEl) previewNameEl.textContent = trimmed || "Chưa đặt đạo hiệu";

            const { isValid, errors } = validateProfileData({ name: trimmed, notes: notesInput ? notesInput.value : "" }, profileId);
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

    // Realtime Counter cho Ghi Chú
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

    // Xử lý Submit
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = nameInput ? nameInput.value : "";
            const notes = notesInput ? notesInput.value : "";

            const result = updateProfile(profileId, {
                name,
                avatar: currentSelectedAvatar,
                notes
            });

            if (!result.success) {
                showToast(result.msg || "Cập nhật thất bại!", "error");
                if (result.errors && result.errors.name && nameErrorEl) {
                    nameErrorEl.textContent = result.errors.name;
                    nameErrorEl.style.display = "block";
                    nameInput.focus();
                }
                return;
            }

            showToast(result.msg, "success", 2000);
            setTimeout(() => {
                window.location.href = `profile-detail.html?id=${profileId}`;
            }, 500);
        });
    }
}
