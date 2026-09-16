/**
 * BỘ ĐIỀU KHIỂN GIAO DIỆN CHÍNH (UI CONTROLLER & RENDERER)
 * Quản lý chuyển tab, render bảng cộng điểm (+1, +5, Max), 3 ô trang bị, 3 ô kỹ năng,
 * bản đồ ải, Tàng Kinh Các, Bách Bảo Các, túi đồ và thông báo.
 */

class UIController {
    constructor(player, combatEngine, particleSystem, soundEngine) {
        this.player = player;
        this.combat = combatEngine;
        this.particles = particleSystem;
        this.sound = soundEngine;

        this.currentTab = "character"; // character | stages | skills | shop | combat
        this.selectedSkillSlot = null; // Dùng khi đang chọn kỹ năng gán vào ô 0, 1, 2
        this.itemModalItem = null;

        // Bộ lọc cho Bách Bảo Các
        this.shopFilterType = "all";   // all | vukhi | giap | non | dan_duoc
        this.shopFilterRealm = "all";  // all | current | 0..8
        this.shopFilterRarity = "all"; // all | pham | linh | huyen | dia | thien
        this.shopSearchQuery = "";

        // Bộ lọc cho Túi Đồ Tổng Hợp (Unified Inventory)
        this.invFilter = "all"; // all | equip | skill | dan_duoc
        this.invSearchQuery = "";
        this.quickSellKeepOne = true; // Bán nhanh đồ trùng: mặc định giữ lại 1 bản cho trang bị chưa mặc

        // Bộ lọc cho Tàng Kinh Các
        this.skillFilterType = "all";   // all | vat_li | phep | tri_lieu | ho_the
        this.skillFilterRealm = "all";  // all | current | 0..8
        this.skillFilterStatus = "all"; // all | can_learn | unlearned | learned
        this.skillSearchQuery = "";

        // Tự động đánh lại ải (3s)
        this.isAutoRepeat = localStorage.getItem("tu_tien_auto_repeat") === "true";
        this.autoRepeatInterval = null;

        // Tự động leo tháp tiếp theo (3s)
        this.isTowerAutoClimb = false;
        this.towerAutoClimbInterval = null;

        // Thần Thú được chọn xem trong Tab Linh Thú
        this.selectedPetId = null;
    }

    init() {
        if (typeof TitleSystem !== "undefined") {
            TitleSystem.checkAndUnlockTitles(this.player);
        }
        this.bindEvents();
        this.updateHeaderInfo();
        this.updateAutoRepeatBtnUI();
        this.updateCombatSpeedBtnUI();
        this.renderAll();
    }

    // ================= SỰ KIỆN TƯƠNG TÁC =================

    bindEvents() {
        // Chuyển Tab
        document.querySelectorAll(".nav-tab-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
                this.sound.playClick();
            });
        });

        // Nút Đột Phá
        const btnBreakthrough = document.getElementById("btn-breakthrough");
        if (btnBreakthrough) {
            btnBreakthrough.addEventListener("click", () => {
                this.handleBreakthrough();
            });
        }

        // Nút Đột Phá Nhanh
        const btnQuickBreakthrough = document.getElementById("btn-quick-breakthrough");
        if (btnQuickBreakthrough) {
            btnQuickBreakthrough.addEventListener("click", () => {
                this.handleQuickBreakthrough();
            });
        }

        // 3 Nút kỹ năng trong màn chiến đấu
        for (let i = 0; i < 3; i++) {
            const btn = document.getElementById(`combat-skill-btn-${i}`);
            if (btn) {
                btn.addEventListener("click", () => {
                    this.combat.useSkill(i);
                });
            }
        }

        // Nút Đại Thần Thông trong màn chiến đấu
        const btnUltimate = document.getElementById("combat-ultimate-btn");
        if (btnUltimate) {
            btnUltimate.addEventListener("click", () => {
                this.combat.useUltimate();
            });
        }

        // Nút Tốc Độ Trận Đấu (x1, x2, x3)
        const btnSpeed = document.getElementById("btn-combat-speed");
        if (btnSpeed) {
            btnSpeed.addEventListener("click", () => {
                this.toggleCombatSpeed();
            });
        }

        // Nút Tự Động Chiến Đấu (Tự xuất chiêu)
        const btnAuto = document.getElementById("btn-combat-auto");
        if (btnAuto) {
            btnAuto.addEventListener("click", () => {
                this.combat.isAuto = !this.combat.isAuto;
                btnAuto.classList.toggle("active", this.combat.isAuto);
                btnAuto.innerText = this.combat.isAuto ? "Tự Động: BẬT" : "Tự Động: TẮT";
                this.sound.playClick();
            });
        }

        // Nút Tự Động Đánh Lại Ải Trong 3s
        const btnAutoRepeat = document.getElementById("btn-combat-autorepeat");
        if (btnAutoRepeat) {
            btnAutoRepeat.addEventListener("click", () => {
                this.toggleAutoRepeat();
            });
        }

        // Nút Thoát Trận Đấu
        const btnFlee = document.getElementById("btn-combat-flee");
        if (btnFlee) {
            btnFlee.addEventListener("click", () => {
                const targetTab = this.combat.isTowerBattle ? "tower" : "stages";
                const locName = this.combat.isTowerBattle ? "Hư Không Tháp" : "ải";
                if (confirm(`Đạo hữu có chắc muốn rút lui khỏi ${locName}?`)) {
                    this.clearAutoRepeatTimer();
                    this.clearTowerAutoClimbTimer();
                    this.combat.stopBattle();
                    this.switchTab(targetTab);
                }
            });
        }

        // Nút Bật/Tắt Âm Thanh
        const btnSound = document.getElementById("btn-toggle-sound");
        if (btnSound) {
            btnSound.addEventListener("click", () => {
                const muted = this.sound.toggleMute();
                btnSound.innerText = muted ? "🔇 Tắt Âm" : "🔊 Âm Thanh";
            });
        }

        // Nút Lưu Game / Xuất Save
        const btnSave = document.getElementById("btn-manual-save");
        if (btnSave) {
            btnSave.addEventListener("click", () => {
                StorageSystem.save(this.player);
                this.showToast("Đã lưu tiến trình tu luyện thành công!", "success");
            });
        }

        const btnExport = document.getElementById("btn-export-save");
        if (btnExport) {
            btnExport.addEventListener("click", () => {
                const code = StorageSystem.exportSaveString(this.player);
                navigator.clipboard.writeText(code).then(() => {
                    this.showToast("Đã sao chép mã tiến trình vào bộ nhớ tạm!", "info");
                }).catch(() => {
                    prompt("Sao chép mã lưu này:", code);
                });
            });
        }

        const btnImport = document.getElementById("btn-import-save");
        if (btnImport) {
            btnImport.addEventListener("click", () => {
                const code = prompt("Dán mã tiến trình muốn nạp vào đây:");
                if (code) {
                    if (StorageSystem.importSaveString(this.player, code)) {
                        this.showToast("Nạp tiến trình thành công!", "success");
                        this.renderAll();
                    } else {
                        this.showToast("Mã lưu không hợp lệ!", "error");
                    }
                }
            });
        }

        // Modal Đóng
        document.querySelectorAll(".modal-close-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const modal = e.target.closest(".game-modal");
                if (modal) modal.style.display = "none";
            });
        });

        // Sự kiện bộ lọc Bách Bảo Các
        document.querySelectorAll(".shop-type-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                document.querySelectorAll(".shop-type-btn").forEach(b => b.classList.remove("active"));
                e.currentTarget.classList.add("active");
                this.shopFilterType = e.currentTarget.dataset.type || "all";
                this.sound.playClick();
                this.renderShopTab();
            });
        });

        const shopRealmSelect = document.getElementById("shop-realm-select");
        if (shopRealmSelect) {
            shopRealmSelect.addEventListener("change", (e) => {
                this.shopFilterRealm = e.target.value;
                this.sound.playClick();
                this.renderShopTab();
            });
        }

        const shopRaritySelect = document.getElementById("shop-rarity-select");
        if (shopRaritySelect) {
            shopRaritySelect.addEventListener("change", (e) => {
                this.shopFilterRarity = e.target.value;
                this.sound.playClick();
                this.renderShopTab();
            });
        }

        const shopSearchInput = document.getElementById("shop-search-input");
        const btnClearSearch = document.getElementById("btn-clear-shop-search");
        if (shopSearchInput) {
            shopSearchInput.addEventListener("input", (e) => {
                this.shopSearchQuery = e.target.value;
                if (btnClearSearch) {
                    btnClearSearch.style.display = this.shopSearchQuery ? "block" : "none";
                }
                this.renderShopTab();
            });
        }

        if (btnClearSearch) {
            btnClearSearch.addEventListener("click", () => {
                if (shopSearchInput) shopSearchInput.value = "";
                this.shopSearchQuery = "";
                btnClearSearch.style.display = "none";
                this.sound.playClick();
                this.renderShopTab();
            });
        }

        const btnResetShop = document.getElementById("btn-reset-shop-filters");
        if (btnResetShop) {
            btnResetShop.addEventListener("click", () => {
                this.resetShopFilters();
            });
        }

        // Sự kiện bộ lọc Tàng Kinh Các (Skills Shop)
        document.querySelectorAll("#skill-type-buttons .shop-type-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                document.querySelectorAll("#skill-type-buttons .shop-type-btn").forEach(b => b.classList.remove("active"));
                e.currentTarget.classList.add("active");
                this.skillFilterType = e.currentTarget.dataset.skilltype || "all";
                this.sound.playClick();
                this.renderTangKinhCac();
            });
        });

        const skillRealmSelect = document.getElementById("skill-realm-select");
        if (skillRealmSelect) {
            skillRealmSelect.addEventListener("change", (e) => {
                this.skillFilterRealm = e.target.value;
                this.sound.playClick();
                this.renderTangKinhCac();
            });
        }

        const skillStatusSelect = document.getElementById("skill-status-select");
        if (skillStatusSelect) {
            skillStatusSelect.addEventListener("change", (e) => {
                this.skillFilterStatus = e.target.value;
                this.sound.playClick();
                this.renderTangKinhCac();
            });
        }

        const skillSearchInput = document.getElementById("skill-search-input");
        const btnClearSkillSearch = document.getElementById("btn-clear-skill-search");
        if (skillSearchInput) {
            skillSearchInput.addEventListener("input", (e) => {
                this.skillSearchQuery = e.target.value;
                if (btnClearSkillSearch) {
                    btnClearSkillSearch.style.display = this.skillSearchQuery ? "block" : "none";
                }
                this.renderTangKinhCac();
            });
        }

        if (btnClearSkillSearch) {
            btnClearSkillSearch.addEventListener("click", () => {
                if (skillSearchInput) skillSearchInput.value = "";
                this.skillSearchQuery = "";
                btnClearSkillSearch.style.display = "none";
                this.sound.playClick();
                this.renderTangKinhCac();
            });
        }

        const btnResetSkill = document.getElementById("btn-reset-skill-filters");
        if (btnResetSkill) {
            btnResetSkill.addEventListener("click", () => {
                this.resetSkillFilters();
            });
        }

        // Tự động ẩn dứt điểm Tooltip khi click, cuộn trang hoặc chạm màn hình điện thoại
        window.addEventListener("click", () => this.hideItemTooltip());
        window.addEventListener("scroll", () => this.hideItemTooltip(), true);
        window.addEventListener("touchstart", () => this.hideItemTooltip(), { passive: true });
    }

    switchTab(tabName) {
        this.hideItemTooltip(); // Cưỡng chế ẩn tooltip khi chuyển trang, tránh lưu màn
        this.currentTab = tabName;

        // Đổi active button nav
        document.querySelectorAll(".nav-tab-btn").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.tab === tabName);
        });

        // Ẩn hiện các container tab
        document.querySelectorAll(".tab-page").forEach(page => {
            page.style.display = page.id === `tab-${tabName}` ? "block" : "none";
        });

        this.updateHeaderInfo();

        if (tabName === "character" || tabName === "cultivate") this.renderCharacterTab();
        else if (tabName === "stages") this.renderStagesTab();
        else if (tabName === "skills") this.renderSkillsTab();
        else if (tabName === "shop") this.renderShopTab();
        else if (tabName === "tower") this.renderTowerTab();
        else if (tabName === "gacha") this.renderGachaTab();
        else if (tabName === "pets") this.renderPetsTab();
    }

    renderAll() {
        this.updateHeaderInfo();
        this.renderCultivateTab();
        this.renderStagesTab();
        this.renderCharacterTab();
        this.renderSkillsTab();
        this.renderShopTab();
        this.renderTowerTab();
        this.renderGachaTab();
        if (this.player.hasAnyPetUnlocked && this.player.hasAnyPetUnlocked()) {
            this.renderPetsTab();
        }
    }

    // ================= THANH THÔNG TIN ĐỈNH (HEADER) =================

    updateHeaderInfo() {
        const realmColor = RealmSystem.getRealmColor(this.player.realmIndex);
        const titleEl = document.getElementById("header-player-realm");
        if (titleEl) {
            titleEl.innerText = this.player.getFullTitle();
            titleEl.style.color = this.player.isVoCuc ? "#a855f7" : realmColor;
        }

        const tuViCur = document.getElementById("header-tu-vi-cur");
        const tuViMax = document.getElementById("header-tu-vi-max");
        const tuViProgress = document.getElementById("header-tu-vi-progress");
        const maxTuVi = this.player.getMaxTuVi();

        if (this.player.isVoCuc) {
            const currentTinhNguyen = this.player.tinhNguyen || 0;
            if (tuViCur) tuViCur.innerText = `${this.formatNumber(currentTinhNguyen)} 🌌`;
            if (tuViMax) tuViMax.innerText = `${this.formatNumber(maxTuVi)} 🌌`;
            if (tuViProgress) {
                const percent = Math.min(100, (currentTinhNguyen / maxTuVi) * 100);
                tuViProgress.style.width = `${percent}%`;
            }
        } else {
            if (tuViCur) tuViCur.innerText = this.formatNumber(this.player.tuVi);
            if (tuViMax) tuViMax.innerText = this.formatNumber(maxTuVi);
            if (tuViProgress) {
                const percent = Math.min(100, (this.player.tuVi / maxTuVi) * 100);
                tuViProgress.style.width = `${percent}%`;
            }
        }

        const stonesEl = document.getElementById("header-linh-thach");
        if (stonesEl) stonesEl.innerText = this.formatNumber(this.player.linhThach);

        const honNguyenBox = document.getElementById("header-hon-nguyen-box");
        const honNguyenEl = document.getElementById("header-hon-nguyen");
        const hasHonNguyen = (this.player.honNguyen || 0) > 0 || (this.player.linhThach || 0) >= 1e9 || this.player.isVoCuc;
        if (honNguyenBox) {
            honNguyenBox.style.display = hasHonNguyen ? "flex" : "none";
        }
        if (honNguyenEl) {
            honNguyenEl.innerText = this.formatNumber(this.player.honNguyen || 0);
        }

        const exLt = document.getElementById("exchange-lt-val");
        if (exLt) exLt.innerText = this.formatNumber(this.player.linhThach || 0);
        const exHn = document.getElementById("exchange-hn-val");
        if (exHn) exHn.innerText = this.formatNumber(this.player.honNguyen || 0);

        const statPointsBadge = document.getElementById("header-stat-points-badge");
        if (statPointsBadge) {
            if (this.player.statPoints > 0) {
                statPointsBadge.style.display = "inline-block";
                statPointsBadge.innerText = `+${this.player.statPoints} Điểm`;
            } else {
                statPointsBadge.style.display = "none";
            }
        }

        // Hiện Tab Linh Thú khi có ít nhất 1 Thần Thú được mở khóa
        const navTabPets = document.getElementById("nav-tab-pets");
        if (navTabPets) {
            const hasPets = this.player.hasAnyPetUnlocked && this.player.hasAnyPetUnlocked();
            navTabPets.style.display = hasPets ? "flex" : "none";
        }
    }


    // ================= THÔNG BÁO (TOAST POPUPS) =================

    showToast(message, type = "info", id = null) {
        const container = document.getElementById("toast-container");
        if (!container) return;

        // 1. Nếu có ID chỉ định (ví dụ: "toast-breakthrough"), CẬP NHẬT ĐÈ vào toast đang có
        if (id) {
            const existingToast = container.querySelector(`[data-toast-id="${id}"]`);
            if (existingToast) {
                existingToast.className = `game-toast toast-${type} toast-bump`;
                existingToast.innerHTML = `<span>${message}</span>`;
                // Kéo dài timer của existingToast
                if (existingToast._timer) clearTimeout(existingToast._timer);
                existingToast._timer = setTimeout(() => {
                    existingToast.classList.add("fade-out");
                    setTimeout(() => existingToast.remove(), 300);
                }, 1600);
                return;
            }
        }

        // 2. Khống chế số lượng: Tối đa 2 toast hiển thị cùng lúc trên màn hình (FIFO)
        while (container.children.length >= 2) {
            const oldest = container.firstElementChild;
            if (oldest && oldest._timer) clearTimeout(oldest._timer);
            if (oldest) oldest.remove();
        }

        const toast = document.createElement("div");
        toast.className = `game-toast toast-${type}`;
        if (id) toast.setAttribute("data-toast-id", id);
        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);

        toast._timer = setTimeout(() => {
            toast.classList.add("fade-out");
            setTimeout(() => toast.remove(), 300);
        }, 1600);
    }

    formatNumber(num) {
        if (num === undefined || num === null || isNaN(num)) return "0";
        if (num >= 1000000000000000) {
            const q = num / 1000000000000000;
            return (q % 1 === 0 ? q : q.toFixed(2)) + " Triệu Tỷ";
        }
        if (num >= 1000000000000) {
            const t = num / 1000000000000;
            return (t % 1 === 0 ? t : t.toFixed(2)) + " Nghìn Tỷ";
        }
        if (num >= 1000000000) {
            const b = num / 1000000000;
            return (b % 1 === 0 ? b : b.toFixed(2)) + " Tỷ";
        }
        if (num >= 1000000) {
            const m = num / 1000000;
            return (m % 1 === 0 ? m : m.toFixed(1)) + " Tr";
        }
        if (num >= 10000) {
            const k = num / 1000;
            return (k % 1 === 0 ? k : k.toFixed(1)) + "k";
        }
        return num.toLocaleString("vi-VN");
    }

    // ================= TOOLTIP HIỂN THỊ THÔNG TIN TRANG BỊ & KỸ NĂNG =================

    getOrCreateTooltip() {
        let tooltip = document.getElementById("item-tooltip");
        if (!tooltip) {
            tooltip = document.createElement("div");
            tooltip.id = "item-tooltip";
            tooltip.className = "item-tooltip-box";
            tooltip.style.pointerEvents = "none";
            tooltip.style.position = "fixed";
            tooltip.style.zIndex = "999999";
            tooltip.style.display = "none";
            document.body.appendChild(tooltip);
        }
        return tooltip;
    }

    showItemTooltip(e, itemId) {
        const item = ItemSystem.getItemById(itemId);
        if (!item) return;

        const tooltip = this.getOrCreateTooltip();

        const rarity = ItemSystem.getRarity(item.rarity);
        const reqRealmObj = RealmSystem.getRealm(item.reqRealm);
        const reqRealmTitle = reqRealmObj ? reqRealmObj.name : "Phàm Nhân";
        const isRealmOk = this.player.realmIndex >= item.reqRealm;
        const slotNames = { non: "NÓN", giap: "GIÁP", vukhi: "VŨ KHÍ", dan_duoc: "ĐAN DƯỢC" };

        let statsHtml = "";
        if (item.stats) {
            const parts = [];
            if (item.stats.mau) parts.push(`<div class="tooltip-stat-badge"><span>❤️ Sinh Mệnh:</span> <strong>+${this.formatNumber(item.stats.mau)}</strong></div>`);
            if (item.stats.vatLi) parts.push(`<div class="tooltip-stat-badge"><span>⚔️ Sát Thương Vật Lí:</span> <strong>+${this.formatNumber(item.stats.vatLi)}</strong></div>`);
            if (item.stats.phep) parts.push(`<div class="tooltip-stat-badge"><span>🔮 Sát Thương Phép:</span> <strong>+${this.formatNumber(item.stats.phep)}</strong></div>`);
            if (item.stats.phongThu) parts.push(`<div class="tooltip-stat-badge"><span>🛡️ Phòng Thủ:</span> <strong>+${this.formatNumber(item.stats.phongThu)}</strong></div>`);
            if (item.stats.khangPhep) parts.push(`<div class="tooltip-stat-badge"><span>💠 Kháng Phép:</span> <strong>+${this.formatNumber(item.stats.khangPhep)}</strong></div>`);
            if (item.stats.baoKich) parts.push(`<div class="tooltip-stat-badge"><span>⚡ Tỉ Lệ Bạo Kích:</span> <strong>+${item.stats.baoKich}%</strong></div>`);
            statsHtml = parts.join("");
        } else if (item.rateGain) {
            statsHtml = `<div class="tooltip-stat-badge" style="color:#00e676;"><span>⚡ Tỉ Lệ Độ Kiếp:</span> <strong>+${item.rateGain}% (Cảnh giới hiện tại)</strong></div>`;
        } else if (item.tinhNguyenGain) {
            statsHtml = `<div class="tooltip-stat-badge" style="color:#e040fb;"><span>🌌 Tinh Nguyên Đại Đạo:</span> <strong>+${this.formatNumber(item.tinhNguyenGain)}</strong></div>`;
        } else if (item.tuViGain) {
            statsHtml = `<div class="tooltip-stat-badge" style="color:#ffd700;"><span>✨ Tu Vi Nhận Được:</span> <strong>+${this.formatNumber(item.tuViGain)}</strong></div>`;
        } else if (item.isResetPill) {
            statsHtml = `<div class="tooltip-stat-badge" style="color:#a855f7;"><span>🧪 Công Dụng:</span> <strong>Tẩy điểm tiềm năng</strong></div>`;
        }

        tooltip.style.borderColor = rarity.border;
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-icon">${item.icon}</span>
                <div class="tooltip-meta">
                    <h4 class="tooltip-title" style="color: ${rarity.color}">${item.name}</h4>
                    <div class="tooltip-rarity-row">
                        <span class="tooltip-badge-pill" style="background:${rarity.bg}; color:${rarity.color}; border:1px solid ${rarity.border}">
                            ${rarity.name}
                        </span>
                        <span class="tooltip-slot-text">${slotNames[item.slot] || item.slot.toUpperCase()}</span>
                    </div>
                </div>
            </div>
            
            <div class="tooltip-stats-grid">
                ${statsHtml}
            </div>

            <p class="tooltip-desc">${item.desc}</p>

            <div class="tooltip-footer">
                <div class="tooltip-req">
                    Yêu cầu Cảnh Giới: <strong style="color:${isRealmOk ? '#4caf50' : '#ff7675'}">${reqRealmTitle}</strong>
                    ${!isRealmOk ? `<span style="color:#ff7675; font-size:10px;"> (Chưa đủ tu vi để mặc)</span>` : `<span style="color:#4caf50; font-size:10px;"> (Đủ điều kiện)</span>`}
                </div>
                <div class="tooltip-price">
                    <span>${item.currency === "hon_nguyen" ? "🌀" : "💎"} Giá bán lại: <strong>${this.formatNumber(item.sellPrice || 10)}</strong> ${item.currency === "hon_nguyen" ? "Hỗn Nguyên Thạch" : "Linh Thạch"}</span>
                </div>
            </div>
        `;

        tooltip.style.display = "flex";
        this.positionTooltip(e, tooltip);
    }

    moveItemTooltip(e) {
        const tooltip = document.getElementById("item-tooltip");
        if (tooltip && tooltip.style.display === "flex") {
            this.positionTooltip(e, tooltip);
        }
    }

    positionTooltip(e, tooltip) {
        if (!tooltip || !e) return;
        const offset = 14;
        const tipRect = tooltip.getBoundingClientRect();
        const width = tipRect.width || 300;
        const height = tipRect.height || 220;

        let x = e.clientX + offset;
        let y = e.clientY + offset;

        // Nếu chạm lề phải thì hiển thị sang bên trái con trỏ chuột
        if (x + width > window.innerWidth - 12) {
            x = e.clientX - width - offset;
        }
        // Nếu chạm lề dưới thì đẩy lên trên con trỏ chuột
        if (y + height > window.innerHeight - 12) {
            y = e.clientY - height - offset;
        }

        tooltip.style.left = `${Math.max(8, x)}px`;
        tooltip.style.top = `${Math.max(8, y)}px`;
    }

    hideItemTooltip() {
        const tooltip = document.getElementById("item-tooltip");
        if (tooltip) {
            tooltip.style.display = "none";
        }
    }

    showSkillTooltip(e, skillId) {
        const skill = SkillSystem.getSkillById(skillId);
        if (!skill) return;

        const tooltip = this.getOrCreateTooltip();

        const typeLabels = {
            vat_li: { label: "VẬT LÍ", color: "#ff7675", bg: "rgba(255, 118, 117, 0.15)", border: "#ff7675" },
            phep: { label: "PHÁP THUẬT", color: "#a29bfe", bg: "rgba(162, 155, 254, 0.15)", border: "#a29bfe" },
            ho_the: { label: "HỘ THỂ", color: "#ffd700", bg: "rgba(255, 215, 0, 0.15)", border: "#ffd700" },
            tri_lieu: { label: "TRỊ LIỆU", color: "#4ecca3", bg: "rgba(78, 204, 163, 0.15)", border: "#4ecca3" },
            dot_mau: { label: "ĐỐT MÁU CỰC ĐẠO", color: "#ff3838", bg: "rgba(255, 56, 56, 0.2)", border: "#ff3838" }
        };
        const typeInfo = typeLabels[skill.type] || { label: "KỸ NĂNG", color: "#fff", bg: "rgba(255,255,255,0.1)", border: "#fff" };

        const reqTitle = RealmSystem.getFullRealmTitle(skill.reqRealm, skill.reqTier);
        const canUse = SkillSystem.canUseSkill(this.player.realmIndex, this.player.tierIndex, skill.id);
        const equipSlotIdx = this.player.equippedSkills.indexOf(skill.id);
        const isEquipped = equipSlotIdx !== -1;

        let effectHtml = "";
        if (skill.type === "dot_mau" || skill.isBurnHp) {
            effectHtml = `<div class="tooltip-stat-badge"><span>🔥 Đốt Máu Boss:</span> <strong style="color:#ff3838;">${Math.round((skill.burnPct || 0.08) * 100)}% Máu Tối Đa (BỎ QUA KHIÊN & KIM THÂN)</strong></div>`;
        } else if (skill.multiplier) {
            if (skill.type === "vat_li") {
                effectHtml = `<div class="tooltip-stat-badge"><span>⚔️ Uy Lực Sát Thương:</span> <strong>${Math.round(skill.multiplier * 100)}% Công Vật Lí</strong></div>`;
            } else if (skill.type === "phep") {
                effectHtml = `<div class="tooltip-stat-badge"><span>🔮 Uy Lực Pháp Thuật:</span> <strong>${Math.round(skill.multiplier * 100)}% Công Phép</strong></div>`;
            } else if (skill.type === "ho_the") {
                effectHtml = `<div class="tooltip-stat-badge"><span>🛡️ Cương Khí Hộ Thể:</span> <strong>Khiên ${Math.round(skill.multiplier * 100)}% Máu Tối Đa</strong></div>`;
            } else if (skill.type === "tri_lieu") {
                const healDesc = skill.healFullHp ? "Hồi 100% Khí Huyết" : `${Math.round(skill.multiplier * 100)}% Công Phép`;
                const shieldDesc = skill.shieldMultiplier ? ` + Khiên ${Math.round(skill.shieldMultiplier * 100)}% Max HP` : "";
                effectHtml = `<div class="tooltip-stat-badge"><span>💚 Hiệu Quả Trị Liệu:</span> <strong>${healDesc}${shieldDesc}</strong></div>`;
            }
        }

        tooltip.style.borderColor = typeInfo.border;
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-icon">${skill.icon}</span>
                <div class="tooltip-meta">
                    <h4 class="tooltip-title" style="color: ${typeInfo.color}">${skill.name}</h4>
                    <div class="tooltip-rarity-row">
                        <span class="tooltip-badge-pill" style="background:${typeInfo.bg}; color:${typeInfo.color}; border:1px solid ${typeInfo.border}">
                            ${typeInfo.label}
                        </span>
                        <span class="tooltip-slot-text">BÍ KÍP VÕ HỌC</span>
                    </div>
                </div>
            </div>
            
            <div class="tooltip-stats-grid">
                <div class="tooltip-stat-badge"><span>⏳ Thời Gian Hồi Chiêu:</span> <strong>${skill.cooldown} giây</strong></div>
                ${effectHtml}
            </div>

            <p class="tooltip-desc">${skill.desc}</p>

            <div class="tooltip-footer">
                <div class="tooltip-req">
                    Yêu cầu Cảnh Giới: <strong style="color:${canUse ? '#4caf50' : '#ff7675'}">${reqTitle}</strong>
                    ${!canUse ? `<span style="color:#ff7675; font-size:10px;"> (Chưa đủ tu vi)</span>` : `<span style="color:#4caf50; font-size:10px;"> (Đủ điều kiện)</span>`}
                </div>
                <div class="tooltip-price" style="font-size:11px; display:flex; justify-content:space-between; align-items:center;">
                    <span>Trạng thái: <strong style="color:${isEquipped ? '#ffd700' : '#94a3b8'}">${isEquipped ? `✓ Đang Xuất Trận [Ô ${equipSlotIdx + 1}]` : 'Chưa gắn vào trận'}</strong></span>
                </div>
            </div>
        `;

        tooltip.style.display = "flex";
        this.positionTooltip(e, tooltip);
    }

}

if (typeof window !== "undefined") {
    window.UIController = UIController;
}
if (typeof global !== "undefined") {
    global.UIController = UIController;
}

// Tự động nạp các phân hệ tab giao diện khi chạy trên môi trường Node.js (Unit Test)
if (typeof require !== "undefined") {
    require("./tabs/ui-cultivate.js");
    require("./tabs/ui-character.js");
    require("./tabs/ui-stages.js");
    require("./tabs/ui-tower.js");
    require("./tabs/ui-skills.js");
    require("./tabs/ui-shop.js");
    require("./tabs/ui-gacha.js");
    require("./tabs/ui-pets.js");
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { UIController };
}