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
    }

    renderAll() {
        this.updateHeaderInfo();
        this.renderCultivateTab();
        this.renderStagesTab();
        this.renderCharacterTab();
        this.renderSkillsTab();
        this.renderShopTab();
        this.renderTowerTab();
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
    }

    // ================= TAB TU LUYỆN (CULTIVATION) =================

    renderCultivateTab() {
        const realm = RealmSystem.getRealm(this.player.realmIndex);
        const tierName = RealmSystem.getTierName(this.player.tierIndex, this.player.realmIndex);
        const maxTuVi = this.player.getMaxTuVi();
        const afkRate = this.player.getAfkTuViRate();

        const realmNameEl = document.getElementById("cultivate-realm-name");
        const realmHanziEl = document.getElementById("cultivate-realm-hanzi");
        const realmDescEl = document.getElementById("cultivate-realm-desc");
        const afkRateEl = document.getElementById("cultivate-afk-rate");
        const tuViTextEl = document.getElementById("cultivate-tu-vi-text");
        const progressBarEl = document.getElementById("cultivate-progress-bar");
        const btnBreakthrough = document.getElementById("btn-breakthrough");
        const btnQuickBreakthrough = document.getElementById("btn-quick-breakthrough");

        // Cập nhật hiển thị Tỉ Lệ Độ Kiếp
        const tribulationEl = document.getElementById("cultivate-tribulation-rate");
        if (tribulationEl) {
            const rateInfo = this.player.getBreakthroughRate();
            let color = "#00e676";
            if (rateInfo.totalRate < 60) color = "#ff5252";
            else if (rateInfo.totalRate < 90) color = "#ffab00";

            tribulationEl.innerHTML = `⚡ Tỉ Lệ Độ Kiếp: <strong style="color:${color}; font-size:14px;">${rateInfo.totalRate}%</strong>`;
        }

        // Kiểm tra điều kiện vượt ải để thăng cảnh giới tiếp theo
        const nextRealmIndex = this.player.realmIndex + 1;
        const reqStageId = RealmSystem.getBreakthroughReqStage(nextRealmIndex);
        let reqStageNote = "";
        if (reqStageId) {
            const hasCleared = this.player.clearedStages && this.player.clearedStages.includes(reqStageId);
            const reqStageObj = typeof StageSystem !== "undefined" ? StageSystem.getStageById(reqStageId) : null;
            const stageName = reqStageObj ? reqStageObj.name : reqStageId;
            if (hasCleared) {
                reqStageNote = `<div style="font-size:12px; color:#00e676; margin-top:4px;">✨ Đã đánh bại [${stageName}], đủ điều kiện đột phá đại cảnh giới tiếp theo!</div>`;
            } else {
                reqStageNote = `<div style="font-size:12px; color:#ffab00; margin-top:4px;">⚠️ Chưa đánh bại [${stageName}], đột phá sẽ tiếp tục tăng tầng tu vi vô hạn.</div>`;
            }
        }

        // Trường hợp đặc biệt: Cảnh Giới Vô Cực hoặc Bình Cảnh Tầng 100
        const isAtVoCucBottleneck = !this.player.isVoCuc && this.player.realmIndex >= 11 && this.player.tierIndex >= 99;
        const hasClearedVoCuc = this.player.clearedStages && this.player.clearedStages.includes("stage_vo_cuc");

        // Bình cảnh Ải 23: Cảnh Giới Vô Cực sau mỗi 100 tầng đột phá (Tầng 200, 300, 400...)
        const isAtVanThienDiaBottleneck = this.player.isVoCuc && (this.player.tierIndex + 1) % 100 === 0;
        const currentMilestone = isAtVanThienDiaBottleneck ? Math.floor((this.player.tierIndex + 1) / 100) : 0;
        const hasClearedVanThienDia = !isAtVanThienDiaBottleneck || ((this.player.vanThienDiaMilestonesCleared || 0) >= currentMilestone);

        if (this.player.isVoCuc) {
            let reqVoCucNote = "";
            if (!hasClearedVoCuc) {
                reqVoCucNote = `<div style="font-size:12px; color:#ff3d00; margin-top:4px; font-weight:bold; background:rgba(255,61,0,0.1); padding:6px 10px; border-radius:6px; border:1px solid rgba(255,61,0,0.3);">⚠️ BÌNH CẢNH: Cần trảm sát [Ải 22: Hư Vô Bản Nguyên Cảnh] mới có thể tiếp tục đột phá!</div>`;
            } else if (isAtVanThienDiaBottleneck && !hasClearedVanThienDia) {
                reqVoCucNote = `<div style="font-size:12px; color:#ff007f; margin-top:4px; font-weight:bold; background:rgba(255,0,127,0.1); padding:6px 10px; border-radius:6px; border:1px solid rgba(255,0,127,0.3);">⚠️ BÌNH CẢNH THIÊN ĐỊA: Cần trảm sát Boss [Ải 23: Vấn Thiên Địa] (Mốc ${currentMilestone * 100} Tầng) mới có thể tiếp tục đột phá!</div>`;
            }

            if (realmNameEl) {
                realmNameEl.innerText = this.player.getFullTitle();
                realmNameEl.style.color = "#c084fc";
            }
            if (realmHanziEl) realmHanziEl.innerText = realm.hanzi || "大道至高";
            if (realmDescEl) {
                realmDescEl.innerHTML = `
                    <div style="color: #a5b4fc; font-weight: 500;">
                        🌌 <strong>Đại Đạo Vô Thượng:</strong> Tu vi đã hóa thành Tinh Nguyên, vượt thoát trần thế, ngạo thị hoàn vũ. Mỗi 1 🌌 Tinh Nguyên tương đương 1.000.000.000 (1 Tỷ) Tu Vi.
                    </div>${reqVoCucNote}
                `;
            }
            if (afkRateEl) {
                const isPheCo = this.player.equippedTitle === "title_phe_co";
                afkRateEl.innerText = `+${this.formatNumber(afkRate)} Tu Vi/giây ${isPheCo ? "(🌿 +50% Phê Cỏ)" : "(Tự nhiên)"} • Tự nén thành Tinh Nguyên khi đủ 1 Tỷ`;
            }

            const currentTinhNguyen = this.player.tinhNguyen || 0;
            const percent = Math.min(100, (currentTinhNguyen / maxTuVi) * 100);
            if (tuViTextEl) {
                tuViTextEl.innerText = `🌌 Tiến Độ Tinh Nguyên: ${this.formatNumber(currentTinhNguyen)} / ${this.formatNumber(maxTuVi)} (${percent.toFixed(1)}%)`;
            }
            if (progressBarEl) progressBarEl.style.width = `${percent}%`;

            if (btnBreakthrough) {
                if (!hasClearedVoCuc) {
                    btnBreakthrough.disabled = false;
                    btnBreakthrough.classList.add("glow-btn");
                    btnBreakthrough.innerText = "⚔️ KHIÊU CHIẾN ẢI ĐỘT PHÁ (ẢI 22)";
                } else if (isAtVanThienDiaBottleneck && !hasClearedVanThienDia) {
                    btnBreakthrough.disabled = false;
                    btnBreakthrough.classList.add("glow-btn");
                    btnBreakthrough.innerText = `⚔️ KHIÊU CHIẾN ẢI 23 (MỐC ${currentMilestone * 100} TẦNG)`;
                } else {
                    const can = this.player.canBreakthrough();
                    btnBreakthrough.disabled = !can;
                    btnBreakthrough.classList.toggle("glow-btn", can);
                    btnBreakthrough.innerText = can 
                        ? `⚡ ĐỘT PHÁ (TẦNG ${this.player.tierIndex + 2}) (+4 ĐIỂM) ⚡` 
                        : `Tích Lũy Tinh Nguyên Để Đột Phá (Cần ${this.formatNumber(maxTuVi)} 🌌)`;
                }
            }
        } else if (isAtVoCucBottleneck) {
            if (realmNameEl) {
                realmNameEl.innerText = `${realm.name} - ${tierName}`;
                realmNameEl.style.color = realm.color;
            }
            if (realmHanziEl) realmHanziEl.innerText = realm.hanzi;

            if (hasClearedVoCuc) {
                reqStageNote = `<div style="font-size:12px; color:#00e676; margin-top:4px; font-weight:bold;">✨ ĐÃ TRẢM SÁT HƯ VÔ BẢN NGUYÊN! Đủ điều kiện thăng hoa Tầng 101!</div>`;
            } else {
                reqStageNote = `<div style="font-size:12px; color:#ff3d00; margin-top:4px; font-weight:bold; background:rgba(255,61,0,0.1); padding:6px 10px; border-radius:6px; border:1px solid rgba(255,61,0,0.3);">⚠️ BÌNH CẢNH TẦNG 100: Cần trảm sát [Ải 22: Hư Vô Bản Nguyên Cảnh] mới có thể tiếp tục đột phá!</div>`;
            }

            if (realmDescEl) {
                realmDescEl.innerHTML = `${realm.desc}${reqStageNote}`;
            }
            if (afkRateEl) {
                const isPheCo = this.player.equippedTitle === "title_phe_co";
                afkRateEl.innerText = `+${this.formatNumber(afkRate)} Tu Vi/giây ${isPheCo ? "(🌿 +50% Phê Cỏ)" : "(Tự nhiên)"}`;
            }

            const percent = Math.min(100, (this.player.tuVi / maxTuVi) * 100);
            if (tuViTextEl) tuViTextEl.innerText = `${this.formatNumber(this.player.tuVi)} / ${this.formatNumber(maxTuVi)} (${percent.toFixed(1)}%)`;
            if (progressBarEl) progressBarEl.style.width = `${percent}%`;

            if (btnBreakthrough) {
                if (!hasClearedVoCuc) {
                    btnBreakthrough.disabled = false;
                    btnBreakthrough.classList.add("glow-btn");
                    btnBreakthrough.innerText = "⚔️ KHIÊU CHIẾN ẢI ĐỘT PHÁ (ẢI 22)";
                } else {
                    const can = this.player.canBreakthrough();
                    btnBreakthrough.disabled = !can;
                    btnBreakthrough.classList.toggle("glow-btn", can);
                    btnBreakthrough.innerText = can ? "⚡ ĐỘT PHÁ TẦNG 101 (+4 ĐIỂM) ⚡" : "Tích Lũy Tu Vi Để Đột Phá";
                }
            }
        } else {
            if (realmNameEl) {
                realmNameEl.innerText = `${realm.name} - ${tierName}`;
                realmNameEl.style.color = realm.color;
            }
            if (realmHanziEl) realmHanziEl.innerText = realm.hanzi;
            if (realmDescEl) {
                realmDescEl.innerHTML = `${realm.desc}${reqStageNote}`;
            }
            if (afkRateEl) {
                const isPheCo = this.player.equippedTitle === "title_phe_co";
                afkRateEl.innerText = `+${this.formatNumber(afkRate)} Tu Vi/giây ${isPheCo ? "(🌿 +50% Phê Cỏ)" : "(Tự nhiên)"}`;
            }

            const percent = Math.min(100, (this.player.tuVi / maxTuVi) * 100);
            if (tuViTextEl) tuViTextEl.innerText = `${this.formatNumber(this.player.tuVi)} / ${this.formatNumber(maxTuVi)} (${percent.toFixed(1)}%)`;
            if (progressBarEl) progressBarEl.style.width = `${percent}%`;

            if (btnBreakthrough) {
                const can = this.player.canBreakthrough();
                btnBreakthrough.disabled = !can;
                btnBreakthrough.classList.toggle("glow-btn", can);
                btnBreakthrough.innerText = can ? "⚡ ĐỘT PHÁ CẢNH GIỚI (+4 ĐIỂM) ⚡" : "Tích Lũy Tu Vi Để Đột Phá";
            }
        }

        // Cập nhật trạng thái nút Đột Phá Nhanh
        if (btnQuickBreakthrough) {
            const canQuick = this.player.canBreakthrough() && (!isAtVoCucBottleneck || hasClearedVoCuc) && (!isAtVanThienDiaBottleneck || hasClearedVanThienDia);
            btnQuickBreakthrough.disabled = !canQuick;
            btnQuickBreakthrough.classList.toggle("glow-btn", canQuick);
        }

        // Render Tên Nhân Vật và Danh Hiệu
        const charNameEl = document.getElementById("character-display-name");
        if (charNameEl) charNameEl.innerText = this.player.name;

        const titleBadgeEl = document.getElementById("character-title-badge");
        if (titleBadgeEl) {
            if (this.player.equippedTitle && typeof TitleSystem !== "undefined") {
                const title = TitleSystem.getTitleById(this.player.equippedTitle);
                if (title) {
                    titleBadgeEl.className = `character-title-tag title-rarity-${title.rarity}`;
                    titleBadgeEl.innerHTML = `<span>${title.icon}</span> <span>${title.name}</span>`;
                    titleBadgeEl.title = `Danh hiệu: ${title.name}\n${title.desc}\nHiệu ứng: ${TitleSystem.formatBuffsText(title.buffs)}\n(Nhấp để đổi danh hiệu)`;
                } else {
                    titleBadgeEl.className = `character-title-tag title-rarity-pham`;
                    titleBadgeEl.innerHTML = `<span>🎖️</span> <span>Chọn Danh Hiệu</span>`;
                }
            } else {
                titleBadgeEl.className = `character-title-tag title-rarity-pham`;
                titleBadgeEl.innerHTML = `<span>🎖️</span> <span>Chọn Danh Hiệu</span>`;
            }
        }
    }

    handleBreakthrough() {
        if (this.player.realmIndex >= 11 && this.player.tierIndex >= 99 && !this.player.isVoCuc) {
            const hasClearedVoCuc = this.player.clearedStages && this.player.clearedStages.includes("stage_vo_cuc");
            if (!hasClearedVoCuc) {
                this.showToast("⚠️ Cần đánh bại [Ải 22: Hư Vô Bản Nguyên Cảnh] mới có thể tiếp tục đột phá!", "warning", "toast-breakthrough");
                this.switchTab("stages");
                return;
            }
        }

        if (this.player.isVoCuc && (this.player.tierIndex + 1) % 100 === 0) {
            const milestone = Math.floor((this.player.tierIndex + 1) / 100);
            if ((this.player.vanThienDiaMilestonesCleared || 0) < milestone) {
                this.showToast(`⚠️ BÌNH CẢNH: Cần đánh bại [Ải 23: Vấn Thiên Địa] (Mốc ${milestone * 100} Tầng) mới có thể đột phá tiếp!`, "warning", "toast-breakthrough");
                this.switchTab("stages");
                return;
            }
        }

        const avatarBox = document.getElementById("cultivate-avatar-box");
        const btnBox = document.getElementById("btn-breakthrough");
        const avatarRect = (avatarBox && typeof avatarBox.getBoundingClientRect === "function") ? avatarBox.getBoundingClientRect() : null;
        const btnRect = (btnBox && typeof btnBox.getBoundingClientRect === "function") ? btnBox.getBoundingClientRect() : null;
        const floatX = avatarRect ? (avatarRect.left + avatarRect.width / 2) : (btnRect ? (btnRect.left + btnRect.width / 2) : (window.innerWidth / 2));
        const floatY = avatarRect ? (avatarRect.top + avatarRect.height / 3) : (btnRect ? (btnRect.top - 20) : (window.innerHeight / 2 - 40));

        const result = this.player.breakthrough();
        if (result && result.success) {
            this.sound.playBreakthrough();
            if (this.particles) {
                this.particles.emitBreakthrough(floatX, floatY);
                this.particles.addFloatingText("✨ +4 Tiềm Năng", floatX, floatY, "#ffd700", true);
            }
            if (result.isVoCuc && result.isMajor) {
                this.showToast(`🌌 THĂNG HOA THÀNH CÔNG! Chúc mừng đạo hữu đạt [${result.newTitle}]! Tu vi hóa thành Tinh Nguyên, nhận 4 ĐIỂM TIỀM NĂNG!`, "breakthrough", "toast-breakthrough");
            } else if (result.isMajor) {
                this.showToast(`🌌 ĐỘT PHÁ ĐẠI CẢNH GIỚI! Chúc mừng đạo hữu bước vào [${result.realm.name}], nhận 4 ĐIỂM TIỀM NĂNG!`, "breakthrough", "toast-breakthrough");
            } else if (result.blockedReason) {
                this.showToast(`⚡ Thăng lên [${result.newTitle}], nhận 4 ĐIỂM TIỀM NĂNG! (Cần vượt [${result.blockedReason}] để thăng đại cảnh giới)`, "info", "toast-breakthrough");
            } else {
                this.showToast(`🎉 Đột phá thành công! Đạt [${result.newTitle}] (+4 Tiềm Năng)`, "breakthrough", "toast-breakthrough");
            }
            this.updateHeaderInfo();
            this.renderCultivateTab();
            this.renderCharacterTab();
            StorageSystem.save(this.player);
        } else if (result && result.isFailedRate) {
            this.sound.playDefeat();
            if (this.particles) {
                this.particles.addFloatingText("⚡ ĐỘ KIẾP THẤT BẠI!", floatX, floatY, "#ff5252", true);
            }
            this.showToast(result.msg, "error", "toast-breakthrough");
            this.updateHeaderInfo();
            this.renderCultivateTab();
            this.renderCharacterTab();
            StorageSystem.save(this.player);
        } else if (result && result.isVoCucBlocked) {
            this.showToast(result.msg, "warning", "toast-breakthrough");
            this.switchTab("stages");
        } else if (result && result.isVanThienDiaBlocked) {
            this.showToast(result.msg, "warning", "toast-breakthrough");
            this.switchTab("stages");
        } else {
            this.showToast("Chưa tích tụ đủ linh lực để đột phá!", "warning", "toast-breakthrough");
        }
    }

    handleQuickBreakthrough() {
        if (this.player.realmIndex >= 11 && this.player.tierIndex >= 99 && !this.player.isVoCuc) {
            const hasClearedVoCuc = this.player.clearedStages && this.player.clearedStages.includes("stage_vo_cuc");
            if (!hasClearedVoCuc) {
                this.showToast("⚠️ Cần đánh bại [Ải 22: Hư Vô Bản Nguyên Cảnh] mới có thể tiếp tục đột phá!", "warning");
                this.switchTab("stages");
                return;
            }
        }

        if (this.player.isVoCuc && (this.player.tierIndex + 1) % 100 === 0) {
            const milestone = Math.floor((this.player.tierIndex + 1) / 100);
            if ((this.player.vanThienDiaMilestonesCleared || 0) < milestone) {
                this.showToast(`⚠️ BÌNH CẢNH: Cần đánh bại [Ải 23: Vấn Thiên Địa] (Mốc ${milestone * 100} Tầng) mới có thể đột phá tiếp!`, "warning");
                this.switchTab("stages");
                return;
            }
        }

        if (!this.player.canBreakthrough()) {
            this.showToast("Chưa tích tụ đủ linh lực để đột phá!", "warning");
            return;
        }

        const result = this.player.quickBreakthrough();
        if (result && result.success) {
            this.sound.playBreakthrough();
            const avatarBox = document.getElementById("cultivate-avatar-box");
            const avatarRect = (avatarBox && typeof avatarBox.getBoundingClientRect === "function") ? avatarBox.getBoundingClientRect() : null;
            const floatX = avatarRect ? (avatarRect.left + avatarRect.width / 2) : (window.innerWidth / 2);
            const floatY = avatarRect ? (avatarRect.top + avatarRect.height / 3) : (window.innerHeight / 2 - 40);

            if (this.particles) {
                this.particles.emitBreakthrough(floatX, floatY);
                this.particles.addFloatingText(`✨ +${result.totalPoints} Tiềm Năng`, floatX, floatY, "#ffd700", true);
            }

            let extraMsg = "";
            if (result.stopReason === "blocked_stage_22") {
                extraMsg = " (Dừng lại do chạm bình cảnh Ải 22)";
            } else if (result.stopReason === "blocked_stage_23") {
                extraMsg = " (Dừng lại do chạm bình cảnh Ải 23: Vấn Thiên Địa)";
            } else if (result.stopReason === "failed_rate") {
                extraMsg = " (Dừng lại do gặp kiếp nạn độ kiếp thất bại)";
            }

            this.showToast(`⚡ [ĐỘT PHÁ NHANH] Đã thăng liên tục ${result.successCount} tầng! Đạt [${result.newTitle}], thu hoạch +${result.totalPoints} Điểm Tiềm Năng!${extraMsg}`, "breakthrough", "toast-breakthrough");
            this.updateHeaderInfo();
            this.renderCultivateTab();
            this.renderCharacterTab();
            StorageSystem.save(this.player);
        } else if (result && result.stopReason === "failed_rate") {
            this.sound.playDefeat();
            const avatarBox = document.getElementById("cultivate-avatar-box");
            const avatarRect = avatarBox?.getBoundingClientRect();
            const floatX = avatarBox ? (avatarBox.left + avatarBox.width / 2) : (window.innerWidth / 2);
            const floatY = avatarBox ? (avatarBox.top + avatarBox.height / 3) : (window.innerHeight / 2 - 40);
            if (this.particles) {
                this.particles.addFloatingText("⚡ ĐỘ KIẾP THẤT BẠI!", floatX, floatY, "#ff5252", true);
            }
            this.showToast(result.lastResult?.msg || "Độ kiếp thất bại do lôi kiếp chấn động!", "error", "toast-breakthrough");
            this.updateHeaderInfo();
            this.renderCultivateTab();
            this.renderCharacterTab();
            StorageSystem.save(this.player);
        } else if (result && result.stopReason === "blocked_stage_22") {
            this.showToast("⚠️ Cần đánh bại [Ải 22: Hư Vô Bản Nguyên Cảnh] mới có thể tiếp tục đột phá!", "warning", "toast-breakthrough");
            this.switchTab("stages");
        } else if (result && result.stopReason === "blocked_stage_23") {
            this.showToast("⚠️ Cần đánh bại [Ải 23: Vấn Thiên Địa] mới có thể phá vỡ bình cảnh!", "warning", "toast-breakthrough");
            this.switchTab("stages");
        } else {
            this.showToast("Chưa tích tụ đủ linh lực để đột phá!", "warning", "toast-breakthrough");
        }
    }

    // ================= TAB NHÂN VẬT & CỘNG ĐIỂM (CHARACTER) =================

    renderCharacterTab() {
        // Cập nhật phần Tu Luyện ở Cột 1
        this.renderCultivateTab();

        const pStats = this.player.getTotalStats();

        // Điểm tiềm năng khả dụng
        const pointsAvailEl = document.getElementById("stat-points-available");
        if (pointsAvailEl) pointsAvailEl.innerText = this.player.statPoints;

        // Chỉ số Vật Lí
        const vatLiValEl = document.getElementById("stat-vat-li-val");
        const vatLiAddedEl = document.getElementById("stat-vat-li-added");
        if (vatLiValEl) vatLiValEl.innerText = this.formatNumber(pStats.vatLi);
        const vatLiPts = this.player.statVatLi || 0;
        const vatLiFlat = vatLiPts * 5;
        const vatLiPct = pStats.bonusVatLiPct || (vatLiPts * 0.35).toFixed(1);
        if (vatLiAddedEl) {
            vatLiAddedEl.innerText = vatLiPts > 0
                ? `(+${this.formatNumber(vatLiFlat)} • +${vatLiPct}% từ ${vatLiPts}đ)`
                : `(+0 từ 0đ)`;
            vatLiAddedEl.title = `Mỗi điểm: +5 Công Vật Lí & +0.35% Tổng Sát Thương VL. Mỗi 20 điểm: +1% Bạo Kích.`;
        }

        // Chỉ số Phép
        const phepValEl = document.getElementById("stat-phep-val");
        const phepAddedEl = document.getElementById("stat-phep-added");
        if (phepValEl) phepValEl.innerText = this.formatNumber(pStats.phep);
        const phepPts = this.player.statPhep || 0;
        const phepFlat = phepPts * 5;
        const phepPct = pStats.bonusPhepPct || (phepPts * 0.35).toFixed(1);
        if (phepAddedEl) {
            phepAddedEl.innerText = phepPts > 0
                ? `(+${this.formatNumber(phepFlat)} • +${phepPct}% từ ${phepPts}đ)`
                : `(+0 từ 0đ)`;
            phepAddedEl.title = `Mỗi điểm: +5 Công Phép & +0.35% Tổng Sát Thương Phép. Mỗi 20 điểm: +1 Kháng Phép.`;
        }

        // Chỉ số Máu
        const mauValEl = document.getElementById("stat-mau-val");
        const mauAddedEl = document.getElementById("stat-mau-added");
        if (mauValEl) mauValEl.innerText = this.formatNumber(pStats.maxHp);
        const mauPts = this.player.statMau || 0;
        const mauFlat = mauPts * 30;
        const mauPct = pStats.bonusHpPct || (mauPts * 0.4).toFixed(1);
        if (mauAddedEl) {
            mauAddedEl.innerText = mauPts > 0
                ? `(+${this.formatNumber(mauFlat)} HP • +${mauPct}% từ ${mauPts}đ)`
                : `(+0 HP từ 0đ)`;
            mauAddedEl.title = `Mỗi điểm: +30 HP & +0.4% Tổng Máu Tối Đa. Mỗi 10 điểm: +1 Phòng Ngự & +1 Kháng Phép.`;
        }

        // Phòng thủ & Bạo kích
        const defValEl = document.getElementById("stat-def-val");
        const critValEl = document.getElementById("stat-crit-val");
        if (defValEl) defValEl.innerText = `${this.formatNumber(pStats.phongThu)} (Vật) / ${this.formatNumber(pStats.khangPhep)} (Phép)`;
        if (critValEl) critValEl.innerText = `${pStats.baoKich}%`;

        // Các nút cộng điểm (+1, +5, Max)
        this.renderStatButtons();

        // 3 Ô Trang Bị (Nón, Giáp, Vũ Khí)
        this.renderEquipmentSlots();

        // 3 Ô Kỹ Năng Xuất Trận
        this.renderEquippedSkills();

        // Túi đồ (Inventory)
        this.renderInventory();
    }

    renderStatButtons() {
        const types = ["vat_li", "phep", "mau"];
        const hasCleared22 = (this.player.clearedStages && this.player.clearedStages.includes("stage_vo_cuc")) || this.player.isVoCuc;
        types.forEach(type => {
            const container = document.getElementById(`stat-btns-${type}`);
            if (!container) return;

            if (hasCleared22) {
                container.innerHTML = `
                    <button class="btn-sm btn-stat" onclick="gameUI.allocateStat('${type}', 100)" ${this.player.statPoints < 100 ? "disabled" : ""}>+100</button>
                    <button class="btn-sm btn-stat" onclick="gameUI.allocateStat('${type}', 500)" ${this.player.statPoints < 500 ? "disabled" : ""}>+500</button>
                    <button class="btn-sm btn-stat" onclick="gameUI.allocateStat('${type}', ${this.player.statPoints})" ${this.player.statPoints < 1 ? "disabled" : ""}>Max</button>
                `;
            } else {
                container.innerHTML = `
                    <button class="btn-sm btn-stat" onclick="gameUI.allocateStat('${type}', 1)" ${this.player.statPoints < 1 ? "disabled" : ""}>+1</button>
                    <button class="btn-sm btn-stat" onclick="gameUI.allocateStat('${type}', 5)" ${this.player.statPoints < 5 ? "disabled" : ""}>+5</button>
                    <button class="btn-sm btn-stat" onclick="gameUI.allocateStat('${type}', ${this.player.statPoints})" ${this.player.statPoints < 1 ? "disabled" : ""}>Max</button>
                `;
            }
        });
    }

    allocateStat(type, amount) {
        const success = this.player.allocateStat(type, amount);
        if (success) {
            this.sound.playClick();
            this.renderCharacterTab();
            this.updateHeaderInfo();
            StorageSystem.save(this.player);
        }
    }

    renderEquipmentSlots() {
        const slots = [
            { id: "non", label: "Nón", icon: "👒" },
            { id: "giap", label: "Giáp", icon: "🥋" },
            { id: "vukhi", label: "Vũ Khí", icon: "🗡️" }
        ];

        slots.forEach(slot => {
            const el = document.getElementById(`equip-slot-${slot.id}`);
            if (!el) return;

            const itemId = this.player.equipped[slot.id];
            if (itemId) {
                const item = ItemSystem.getItemById(itemId);
                const rarity = ItemSystem.getRarity(item.rarity);
                el.innerHTML = `
                    <div class="equip-item-card rarity-${item.rarity}" 
                         style="border-color: ${rarity.border}; background: ${rarity.bg}; cursor: pointer;"
                         onmouseenter="gameUI.showItemTooltip(event, '${item.id}')"
                         onmousemove="gameUI.moveItemTooltip(event)"
                         onmouseleave="gameUI.hideItemTooltip()">
                        <span class="equip-icon">${item.icon}</span>
                        <div class="equip-meta">
                            <span class="equip-name" style="color: ${rarity.color}">${item.name}</span>
                            <span class="equip-slot-tag">${slot.label} • ${rarity.name}</span>
                        </div>
                        <button class="btn-sm btn-danger unequip-btn" onclick="event.stopPropagation(); gameUI.unequipItem('${slot.id}')">Tháo</button>
                    </div>
                `;
            } else {
                el.innerHTML = `
                    <div class="equip-empty-card" onclick="gameUI.showEquipSelectModal('${slot.id}')">
                        <span class="empty-icon">${slot.icon}</span>
                        <span class="empty-text">Chưa Trang Bị [${slot.label}] (Click để mặc)</span>
                    </div>
                `;
            }
        });
    }

    unequipItem(slot) {
        this.hideItemTooltip(); // Cưỡng chế ẩn tooltip
        if (this.player.unequipItem(slot)) {
            this.sound.playEquip();
            this.showToast("Đã tháo trang bị cất vào túi đồ!", "info");
            this.renderCharacterTab();
            this.updateHeaderInfo();
            StorageSystem.save(this.player);
        }
    }

    showEquipSelectModal(slot) {
        const slotNames = { non: "NÓN", giap: "GIÁP", vukhi: "VŨ KHÍ" };
        const matchingItemIds = this.player.inventory.filter(id => {
            const it = ItemSystem.getItemById(id);
            return it && it.slot === slot;
        });

        if (matchingItemIds.length === 0) {
            this.showToast(`Trong túi không có [${slotNames[slot] || slot}] phù hợp! Hãy ghé Bách Bảo Các hoặc vượt ải để tìm kiếm.`, "warning");
            return;
        }

        const modal = document.getElementById("skill-select-modal");
        const titleEl = modal.querySelector("h3");
        const listEl = document.getElementById("skill-select-modal-list");
        if (!modal || !listEl) return;

        if (titleEl) titleEl.innerText = `CHỌN [${slotNames[slot] || slot}] ĐỂ TRANG BỊ`;
        listEl.innerHTML = "";

        matchingItemIds.forEach(itemId => {
            const item = ItemSystem.getItemById(itemId);
            const rarity = ItemSystem.getRarity(item.rarity);
            const itemEl = document.createElement("div");
            itemEl.className = "skill-select-modal-item";
            itemEl.style.display = "flex";
            itemEl.style.justifyContent = "space-between";
            itemEl.style.alignItems = "center";
            itemEl.style.padding = "10px";
            itemEl.style.background = "rgba(255,255,255,0.05)";
            itemEl.style.borderRadius = "6px";
            itemEl.style.cursor = "pointer";

            let statParts = [];
            if (item.stats.mau) statParts.push(`HP +${item.stats.mau}`);
            if (item.stats.vatLi) statParts.push(`V.Lí +${item.stats.vatLi}`);
            if (item.stats.phep) statParts.push(`Phép +${item.stats.phep}`);
            if (item.stats.phongThu) statParts.push(`Thủ +${item.stats.phongThu}`);

            itemEl.innerHTML = `
                <div>
                    <strong style="color: ${rarity.color}">${item.icon} ${item.name}</strong>
                    <div style="font-size: 11px; color: #4ecca3;">${statParts.join(", ")}</div>
                </div>
                <button class="btn-sm btn-primary">Mặc</button>
            `;
            itemEl.addEventListener("click", () => {
                this.equipItem(item.id);
                modal.style.display = "none";
            });
            listEl.appendChild(itemEl);
        });

        modal.style.display = "flex";
    }

    setInventoryFilter(filterType) {
        this.invFilter = filterType;
        document.querySelectorAll(".inv-filter-btn").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.filter === filterType);
        });
        this.renderInventory();
    }

    handleInventorySearch(query) {
        this.invSearchQuery = (query || "").trim().toLowerCase();
        this.renderInventory();
    }

    renderInventory() {
        const invListEl = document.getElementById("inventory-item-list");
        if (!invListEl) return;

        // Gom nhóm vật phẩm theo ID để tính số lượng (Stacking)
        const itemMap = new Map(); // id -> { item, count }
        this.player.inventory.forEach(id => {
            const it = ItemSystem.getItemById(id);
            if (!it) return;
            if (itemMap.has(id)) {
                itemMap.get(id).count++;
            } else {
                itemMap.set(id, { item: it, count: 1 });
            }
        });

        // Tính toán số lượng theo từng danh mục
        const invItems = this.player.inventory.map(id => ItemSystem.getItemById(id)).filter(Boolean);
        const learnedSkills = this.player.learnedSkills.map(id => SkillSystem.getSkillById(id)).filter(Boolean);

        const countEquip = invItems.filter(item => ["non", "giap", "vukhi"].includes(item.slot)).length;
        const countDan = invItems.filter(item => item.slot === "dan_duoc").length;
        const countSkills = learnedSkills.length;
        const countAll = invItems.length + countSkills;

        // Cập nhật số lượng trên các nút lọc
        const elCountAll = document.getElementById("inv-count-all");
        const elCountEquip = document.getElementById("inv-count-equip");
        const elCountSkill = document.getElementById("inv-count-skill");
        const elCountDan = document.getElementById("inv-count-dan");

        if (elCountAll) elCountAll.innerText = countAll;
        if (elCountEquip) elCountEquip.innerText = countEquip;
        if (elCountSkill) elCountSkill.innerText = countSkills;
        if (elCountDan) elCountDan.innerText = countDan;

        // Tổng hợp danh sách hiển thị
        let displayEntries = [];

        // Thêm vật phẩm đã gom nhóm nếu bộ lọc phù hợp
        if (this.invFilter === "all" || this.invFilter === "equip" || this.invFilter === "dan_duoc") {
            itemMap.forEach(({ item, count }) => {
                const isEquip = ["non", "giap", "vukhi"].includes(item.slot);
                const isDan = item.slot === "dan_duoc";

                if (this.invFilter === "equip" && !isEquip) return;
                if (this.invFilter === "dan_duoc" && !isDan) return;

                // Kiểm tra từ khóa tìm kiếm
                if (this.invSearchQuery) {
                    const matchName = item.name.toLowerCase().includes(this.invSearchQuery);
                    const matchDesc = (item.desc || "").toLowerCase().includes(this.invSearchQuery);
                    const matchSlot = (item.slot || "").toLowerCase().includes(this.invSearchQuery);
                    if (!matchName && !matchDesc && !matchSlot) return;
                }

                displayEntries.push({ type: "item", data: item, count: count });
            });
        }

        // Thêm kỹ năng nếu bộ lọc phù hợp
        if (this.invFilter === "all" || this.invFilter === "skill") {
            learnedSkills.forEach(skill => {
                // Kiểm tra từ khóa tìm kiếm
                if (this.invSearchQuery) {
                    const matchName = skill.name.toLowerCase().includes(this.invSearchQuery);
                    const matchDesc = (skill.desc || "").toLowerCase().includes(this.invSearchQuery);
                    const matchType = (skill.type || "").toLowerCase().includes(this.invSearchQuery);
                    if (!matchName && !matchDesc && !matchType) return;
                }

                displayEntries.push({ type: "skill", data: skill, count: 1 });
            });
        }

        // Tự động sắp xếp từ thấp đến cao (Cảnh giới, Phẩm cấp, Giá)
        displayEntries.sort((a, b) => {
            if (a.type === "item" && b.type === "item") {
                return ItemSystem.compareItems(a.data, b.data);
            }
            if (a.type === "skill" && b.type === "skill") {
                return SkillSystem.compareSkills(a.data, b.data);
            }
            const realmA = a.data.reqRealm !== undefined ? a.data.reqRealm : 0;
            const realmB = b.data.reqRealm !== undefined ? b.data.reqRealm : 0;
            if (realmA !== realmB) return realmA - realmB;
            return a.type === "item" ? -1 : 1;
        });

        if (displayEntries.length === 0) {
            invListEl.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 32px 16px; color: var(--text-muted);">
                    <div style="font-size: 32px; margin-bottom: 8px;">📭</div>
                    <div>Không tìm thấy vật phẩm hay bí kíp nào phù hợp trong túi!</div>
                </div>
            `;
            return;
        }

        invListEl.innerHTML = "";
        displayEntries.forEach(entry => {
            if (entry.type === "item") {
                const item = entry.data;
                const count = entry.count || 1;
                const rarity = ItemSystem.getRarity(item.rarity);
                const isEquip = ["non", "giap", "vukhi"].includes(item.slot);
                const isDan = item.slot === "dan_duoc";

                const card = document.createElement("div");
                card.className = `inv-item-card rarity-${item.rarity}`;
                card.style.borderColor = rarity.border;
                card.style.background = rarity.bg;
                card.style.cursor = "pointer";
                card.setAttribute("onmouseenter", `gameUI.showItemTooltip(event, '${item.id}')`);
                card.setAttribute("onmousemove", `gameUI.moveItemTooltip(event)`);
                card.setAttribute("onmouseleave", `gameUI.hideItemTooltip()`);

                const isRealmOk = item.reqRealm === undefined || this.player.realmIndex >= item.reqRealm;
                const reqRealmObj = item.reqRealm !== undefined ? RealmSystem.getRealm(item.reqRealm) : null;
                const reqRealmName = reqRealmObj ? reqRealmObj.name : `Cảnh giới ${item.reqRealm}`;

                const currIcon = item.currency === "hon_nguyen" ? "🌀" : "💎";
                const currName = item.currency === "hon_nguyen" ? "Hỗn Nguyên" : "Linh Thạch";

                let statsDisplay = "";
                if (item.stats) {
                    const parts = [];
                    if (item.stats.mau) parts.push(`HP +${item.stats.mau}`);
                    if (item.stats.vatLi) parts.push(`V.Lí +${item.stats.vatLi}`);
                    if (item.stats.phep) parts.push(`Phép +${item.stats.phep}`);
                    if (item.stats.phongThu) parts.push(`Thủ +${item.stats.phongThu}`);
                    if (item.stats.baoKich) parts.push(`Bạo +${item.stats.baoKich}%`);
                    statsDisplay = parts.join(", ");
                } else if (item.tinhNguyenGain) {
                    if (count > 1) {
                        statsDisplay = `🌌 <strong>+${this.formatNumber(item.tinhNguyenGain * count)} Tinh Nguyên</strong> <small style="opacity:0.8; font-size:10px;">(+${this.formatNumber(item.tinhNguyenGain)}/viên)</small>`;
                    } else {
                        statsDisplay = `🌌 +${this.formatNumber(item.tinhNguyenGain)} Tinh Nguyên`;
                    }
                } else if (item.tuViGain) {
                    if (count > 1) {
                        statsDisplay = `✨ <strong>+${this.formatNumber(item.tuViGain * count)} Tu Vi</strong> <small style="opacity:0.8; font-size:10px;">(+${this.formatNumber(item.tuViGain)}/viên)</small>`;
                    } else {
                        statsDisplay = `✨ +${this.formatNumber(item.tuViGain)} Tu Vi`;
                    }
                } else if (item.isResetPill) {
                    statsDisplay = `🧪 Tẩy toàn bộ điểm tiềm năng`;
                } else if (item.isRenameScroll) {
                    statsDisplay = `📜 Đổi lại đạo hiệu danh xưng nhân vật`;
                }

                if (!isRealmOk && reqRealmName) {
                    statsDisplay += `<div style="color: #ff7675; font-size: 11px; margin-top: 3px; font-weight: 600;">🔒 Yêu cầu: ${reqRealmName} (Chưa đủ cảnh giới)</div>`;
                }

                // Nút hành động
                let actionBtns = "";
                if (isEquip) {
                    const isEquipped = (this.player.equipped?.non === item.id || this.player.equipped?.giap === item.id || this.player.equipped?.vukhi === item.id);
                    const equipBtn = !isRealmOk
                        ? `<button class="btn-sm btn-disabled" disabled title="Cần đạt cảnh giới ${reqRealmName} mới có thể trang bị">🔒 Cần ${reqRealmName}</button>`
                        : `<button class="btn-sm btn-primary" onclick="event.stopPropagation(); gameUI.equipItem('${item.id}')">${isEquipped ? "Đổi" : "Trang Bị"}</button>`;

                    if (count > 1) {
                        if (isEquipped) {
                            actionBtns = `
                                ${equipBtn}
                                <button class="btn-sm btn-secondary" onclick="event.stopPropagation(); gameUI.sellItem('${item.id}')" title="Bán 1 món">Bán 1 (${item.sellPrice} ${currIcon})</button>
                                <button class="btn-sm btn-warning" onclick="event.stopPropagation(); gameUI.sellAllItems('${item.id}')" title="Bán toàn bộ ${count} bản trong túi đồ (vẫn giữ bản đang mặc trên người)">⚡ Bán Trùng (${count}) (${this.formatNumber(item.sellPrice * count)} ${currIcon})</button>
                            `;
                        } else {
                            const dupsCount = count - 1;
                            const dupsGain = item.sellPrice * dupsCount;
                            actionBtns = `
                                ${equipBtn}
                                <button class="btn-sm btn-secondary" onclick="event.stopPropagation(); gameUI.sellItem('${item.id}')" title="Bán 1 món">Bán 1 (${item.sellPrice} ${currIcon})</button>
                                <button class="btn-sm btn-warning" onclick="event.stopPropagation(); gameUI.sellItemDuplicates('${item.id}')" title="Giữ lại 1 bản trong túi đồ, bán nhanh ${dupsCount} bản trùng">Bán Trùng (${dupsCount}) (${this.formatNumber(dupsGain)} ${currIcon})</button>
                                <button class="btn-sm btn-secondary" onclick="event.stopPropagation(); gameUI.sellAllItems('${item.id}')" title="Bán toàn bộ ${count} món trong túi">Bán Hết (${this.formatNumber(item.sellPrice * count)} ${currIcon})</button>
                            `;
                        }
                    } else {
                        actionBtns = `
                            ${equipBtn}
                            <button class="btn-sm btn-secondary" onclick="event.stopPropagation(); gameUI.sellItem('${item.id}')">Bán (${item.sellPrice} ${currIcon})</button>
                        `;
                    }
                } else if (isDan) {
                    if (!isRealmOk) {
                        if (count > 1) {
                            actionBtns = `
                                <button class="btn-sm btn-disabled" disabled title="Cần đạt cảnh giới ${reqRealmName} trở lên mới có thể sử dụng">🔒 Cần ${reqRealmName}</button>
                                <button class="btn-sm btn-secondary" onclick="event.stopPropagation(); gameUI.sellItem('${item.id}')" title="Bán 1 viên">Bán 1 (${item.sellPrice} ${currIcon})</button>
                                <button class="btn-sm btn-secondary" onclick="event.stopPropagation(); gameUI.sellAllItems('${item.id}')" title="Bán hết ${count} viên">Bán Hết (${this.formatNumber(item.sellPrice * count)} ${currIcon})</button>
                            `;
                        } else {
                            actionBtns = `
                                <button class="btn-sm btn-disabled" disabled title="Cần đạt cảnh giới ${reqRealmName} trở lên mới có thể sử dụng">🔒 Cần ${reqRealmName}</button>
                                <button class="btn-sm btn-secondary" onclick="event.stopPropagation(); gameUI.sellItem('${item.id}')">Bán (${item.sellPrice} ${currIcon})</button>
                            `;
                        }
                    } else if (item.isResetPill) {
                        if (count > 1) {
                            actionBtns = `
                                <button class="btn-sm btn-success" onclick="event.stopPropagation(); gameUI.useConsumable('${item.id}')">Tẩy Tủy</button>
                                <button class="btn-sm btn-secondary" onclick="event.stopPropagation(); gameUI.sellItem('${item.id}')">Bán 1 (${item.sellPrice} ${currIcon})</button>
                                <button class="btn-sm btn-secondary" onclick="event.stopPropagation(); gameUI.sellAllItems('${item.id}')" title="Bán toàn bộ ${count} viên">Bán Hết (${this.formatNumber(item.sellPrice * count)} ${currIcon})</button>
                            `;
                        } else {
                            actionBtns = `
                                <button class="btn-sm btn-success" onclick="event.stopPropagation(); gameUI.useConsumable('${item.id}')">Tẩy Tủy</button>
                                <button class="btn-sm btn-secondary" onclick="event.stopPropagation(); gameUI.sellItem('${item.id}')">Bán (${item.sellPrice} ${currIcon})</button>
                            `;
                        }
                    } else if (item.isRenameScroll) {
                        actionBtns = `
                            <button class="btn-sm btn-primary" onclick="event.stopPropagation(); gameUI.openRenameModal()">Đổi Tên</button>
                            <button class="btn-sm btn-secondary" onclick="event.stopPropagation(); gameUI.sellItem('${item.id}')">Bán (${item.sellPrice} ${currIcon})</button>
                        `;
                    } else if (count > 1) {
                        const gainDesc = item.tinhNguyenGain 
                            ? `+${this.formatNumber(item.tinhNguyenGain * count)} Tinh Nguyên Đại Đạo` 
                            : `+${this.formatNumber((item.tuViGain || 0) * count)} Tu Vi`;
                        actionBtns = `
                            <button class="btn-sm btn-success" onclick="event.stopPropagation(); gameUI.useConsumable('${item.id}')" title="Dùng 1 viên">Dùng 1</button>
                            <button class="btn-sm btn-warning btn-use-all" onclick="event.stopPropagation(); gameUI.useAllConsumables('${item.id}')" title="Dùng hết toàn bộ ${count} viên nhận ${gainDesc}">⚡ Dùng Hết (${count})</button>
                            <button class="btn-sm btn-secondary" onclick="event.stopPropagation(); gameUI.sellItem('${item.id}')" title="Bán 1 viên">Bán 1 (${item.sellPrice} ${currIcon})</button>
                            <button class="btn-sm btn-secondary" onclick="event.stopPropagation(); gameUI.sellAllItems('${item.id}')" title="Bán hết ${count} viên">Bán Hết (${this.formatNumber(item.sellPrice * count)} ${currIcon})</button>
                        `;
                    } else {
                        actionBtns = `
                            <button class="btn-sm btn-success" onclick="event.stopPropagation(); gameUI.useConsumable('${item.id}')">Sử Dụng</button>
                            <button class="btn-sm btn-secondary" onclick="event.stopPropagation(); gameUI.sellItem('${item.id}')">Bán (${item.sellPrice} ${currIcon})</button>
                        `;
                    }
                } else {
                    actionBtns = `
                        <button class="btn-sm btn-secondary" onclick="event.stopPropagation(); gameUI.sellItem('${item.id}')">Bán (${item.sellPrice} ${currIcon})</button>
                    `;
                }

                card.innerHTML = `
                    <div class="inv-item-top">
                        <div class="inv-icon-wrapper">
                            <span class="inv-icon">${item.icon}</span>
                            ${count > 1 ? `<span class="inv-stack-badge">x${count}</span>` : ""}
                        </div>
                        <div class="inv-info">
                            <strong style="color: ${rarity.color}">
                                ${item.name}
                                ${count > 1 ? `<span style="font-size:11px; opacity:0.85; margin-left:4px;">(x${count})</span>` : ""}
                            </strong>
                            <small class="rarity-badge">${rarity.name} • ${item.slot === "dan_duoc" ? "Đan Dược" : item.slot.toUpperCase()}</small>
                        </div>
                    </div>
                    <div class="inv-stats">${statsDisplay}</div>
                    <div class="inv-actions">
                        ${actionBtns}
                    </div>
                `;
                invListEl.appendChild(card);
            } else if (entry.type === "skill") {
                const skill = entry.data;
                const equipSlotIdx = this.player.equippedSkills.indexOf(skill.id);
                const isEquipped = equipSlotIdx !== -1;

                const typeNames = {
                    vat_li: "VẬT LÍ",
                    phep: "PHÁP THUẬT",
                    ho_the: "HỘ THỂ",
                    tri_lieu: "TRỊ LIỆU",
                    dot_mau: "ĐỐT MÁU"
                };

                let effectText = "";
                if (skill.type === "vat_li") effectText = `⚔️ ${Math.round(skill.multiplier * 100)}% Công Vật Lí`;
                else if (skill.type === "phep") effectText = `🔮 ${Math.round(skill.multiplier * 100)}% Công Phép`;
                else if (skill.type === "ho_the") effectText = `🛡️ Khiên ${Math.round(skill.multiplier * 100)}% Máu`;
                else if (skill.type === "tri_lieu") effectText = `💚 Hồi ${Math.round(skill.multiplier * 100)}% Công Phép`;
                else if (skill.type === "dot_mau" || skill.isBurnHp) effectText = `🔥 Đốt ${Math.round((skill.burnPct || 0.08) * 100)}% Máu Boss (Xuyên Khiên & Kim Thân)`;

                const card = document.createElement("div");
                card.className = `inv-skill-card ${isEquipped ? "equipped-active" : ""}`;
                card.setAttribute("onmouseenter", `gameUI.showSkillTooltip(event, '${skill.id}')`);
                card.setAttribute("onmousemove", `gameUI.moveItemTooltip(event)`);
                card.setAttribute("onmouseleave", `gameUI.hideItemTooltip()`);

                card.innerHTML = `
                    <div class="inv-item-top">
                        <span class="inv-icon">${skill.icon}</span>
                        <div class="inv-info">
                            <strong style="color: #4ecca3;">
                                ${skill.name}
                                ${isEquipped ? `<span class="badge-equipped-tag">Ô ${equipSlotIdx + 1}</span>` : ""}
                            </strong>
                            <small class="rarity-badge">${typeNames[skill.type] || "BÍ KÍP"} • ⏳ ${skill.cooldown}s</small>
                        </div>
                    </div>
                    <div class="inv-stats">${effectText}</div>
                    <div class="inv-actions">
                        ${isEquipped
                        ? `<button class="btn-sm btn-danger" onclick="event.stopPropagation(); gameUI.unequipSkill(${equipSlotIdx})">Tháo Trận</button>`
                        : `<button class="btn-sm btn-primary" onclick="event.stopPropagation(); gameUI.quickEquipSkill('${skill.id}')">Xuất Trận</button>`
                    }
                    </div>
                `;
                invListEl.appendChild(card);
            }
        });
    }

    equipItem(itemId) {
        this.hideItemTooltip(); // Cưỡng chế ẩn tooltip
        const res = this.player.equipItem(itemId);
        if (res && res.success) {
            this.sound.playEquip();
            this.showToast(`Đã mặc [${res.item.name}]!`, "success");
            this.renderCharacterTab();
            this.updateHeaderInfo();
            StorageSystem.save(this.player);
        } else {
            this.showToast(res ? res.msg : "Không thể trang bị!", "error");
        }
    }

    useConsumable(itemId) {
        this.hideItemTooltip(); // Cưỡng chế ẩn tooltip
        const item = ItemSystem.getItemById(itemId);
        if (item && item.isRenameScroll) {
            this.openRenameModal();
            return;
        }

        if (item && item.isResetPill) {
            if (!confirm("Đạo hữu có chắc chắn muốn dùng [Tẩy Tủy Đan] để thanh lọc kinh mạch, tẩy toàn bộ điểm tiềm năng đã cộng không?")) {
                return;
            }
        }

        const res = this.player.useConsumable(itemId);
        if (res && res.success) {
            this.sound.playHeal();
            if (this.particles && res.item && (res.item.tuViGain || res.item.tinhNguyenGain)) {
                const rect = document.getElementById("cultivate-avatar-box")?.getBoundingClientRect();
                if (rect) {
                    this.particles.emitMeditationQi(
                        rect.left + rect.width / 2,
                        rect.top + rect.height / 2,
                        res.isTinhNguyen ? "#e040fb" : RealmSystem.getRealmColor(this.player.realmIndex)
                    );
                    const gainTxt = res.isTinhNguyen 
                        ? `+${this.formatNumber(res.gainAmount)} 🌌 Tinh Nguyên` 
                        : `+${this.formatNumber(res.gainAmount || res.item.tuViGain)} Tu Vi`;
                    this.particles.addFloatingText(gainTxt, rect.left + rect.width / 2, rect.top - 20, res.isTinhNguyen ? "#e040fb" : "#2ecc71");
                }
            }
            const toastType = res.isVoCucToast ? "vo-cuc" : (res.isTinhNguyen ? "breakthrough" : "success");
            this.showToast(res.msg, toastType);

            // Kiểm tra mở khóa danh hiệu (đặc biệt: Phê Cỏ khi đạt 10.000 viên)
            if (typeof TitleSystem !== "undefined") {
                const newTitles = TitleSystem.checkAndUnlockTitles(this.player);
                if (newTitles.length > 0) {
                    newTitles.forEach(t => {
                        this.showToast(`🎖️ CHÚC MỪNG! Đạo hữu đã đạt Danh Hiệu: [${t.name}]!`, "breakthrough");
                    });
                }
            }

            this.renderCharacterTab();
            this.renderCultivateTab();
            this.updateHeaderInfo();
            StorageSystem.save(this.player);
        } else {
            this.showToast(res ? res.msg : "Không thể sử dụng đan dược!", "error");
        }
    }

    /**
     * Dùng toàn bộ đan dược cùng loại một lúc
     */
    useAllConsumables(itemId) {
        this.hideItemTooltip(); // Cưỡng chế ẩn tooltip
        const item = ItemSystem.getItemById(itemId);
        if (!item || item.slot !== "dan_duoc") return;

        if (item.isResetPill) {
            this.useConsumable(itemId);
            return;
        }

        const count = this.player.inventory.filter(id => id === itemId).length;
        if (count === 0) return;

        const res = this.player.useAllConsumables(itemId);
        if (res && res.success) {
            this.sound.playHeal();
            if (this.particles && (res.totalTuVi || res.item.tuViGain || res.item.tinhNguyenGain)) {
                const rect = document.getElementById("cultivate-avatar-box")?.getBoundingClientRect();
                if (rect) {
                    this.particles.emitMeditationQi(
                        rect.left + rect.width / 2,
                        rect.top + rect.height / 2,
                        res.isTinhNguyen ? "#e040fb" : RealmSystem.getRealmColor(this.player.realmIndex)
                    );
                    const gainTxt = res.isTinhNguyen 
                        ? `+${this.formatNumber(res.totalTuVi)} 🌌 Tinh Nguyên` 
                        : `+${this.formatNumber(res.totalTuVi)} Tu Vi`;
                    this.particles.addFloatingText(gainTxt, rect.left + rect.width / 2, rect.top - 20, res.isTinhNguyen ? "#e040fb" : "#2ecc71");
                }
            }

            const unitMsg = res.isTinhNguyen ? "🌌 Tinh Nguyên Đại Đạo" : "Tu Vi";
            const toastType = res.isVoCucToast ? "vo-cuc" : "breakthrough";
            this.showToast(`✨ Đã dùng toàn bộ ${res.count}x [${res.item.name}], tăng +${this.formatNumber(res.totalTuVi)} ${unitMsg}!`, toastType);

            // Kiểm tra mở khóa danh hiệu (đặc biệt: Phê Cỏ khi đạt 10.000 viên)
            if (typeof TitleSystem !== "undefined") {
                const newTitles = TitleSystem.checkAndUnlockTitles(this.player);
                if (newTitles.length > 0) {
                    newTitles.forEach(t => {
                        this.showToast(`🎖️ CHÚC MỪNG! Đạo hữu đã đạt Danh Hiệu: [${t.name}]!`, "breakthrough");
                    });
                }
            }

            this.renderCharacterTab();
            this.renderCultivateTab();
            this.updateHeaderInfo();
            StorageSystem.save(this.player);
        } else {
            this.showToast(res ? res.msg : "Không thể sử dụng đan dược!", "error");
        }
    }

    sellItem(itemId) {
        this.hideItemTooltip(); // Cưỡng chế ẩn tooltip
        const res = this.player.sellItem(itemId);
        if (res && res.success) {
            this.sound.playClick();
            this.showToast(`Đã bán 1x [${res.item ? res.item.name : 'vật phẩm'}], thu về ${res.gain} Linh Thạch!`, "info");
            this.renderCharacterTab();
            this.updateHeaderInfo();
            StorageSystem.save(this.player);
        }
    }

    /**
     * Bán toàn bộ vật phẩm cùng loại một lúc
     */
    sellAllItems(itemId) {
        this.hideItemTooltip(); // Cưỡng chế ẩn tooltip
        const item = ItemSystem.getItemById(itemId);
        if (!item) return;

        const count = this.player.inventory.filter(id => id === itemId).length;
        if (count === 0) return;

        const res = this.player.sellAllItems(itemId);
        if (res && res.success) {
            this.sound.playClick();
            this.showToast(`Đã bán toàn bộ ${res.count}x [${res.item.name}], thu về ${this.formatNumber(res.totalGain)} Linh Thạch!`, "info");
            this.renderCharacterTab();
            this.updateHeaderInfo();
            StorageSystem.save(this.player);
        }
    }

    /**
     * Bán nhanh các bản sao trùng lặp của 1 trang bị cụ thể (giữ lại 1 bản an toàn nếu chưa mặc)
     */
    sellItemDuplicates(itemId) {
        this.hideItemTooltip(); // Cưỡng chế ẩn tooltip
        const res = this.player.sellItemDuplicates(itemId);
        if (res && res.success) {
            this.sound.playClick();
            this.showToast(`Đã bán ${res.soldCount}x bản trùng của [${res.item.name}], giữ lại ${res.keptCount} bản, thu về +${this.formatNumber(res.totalGain)} Linh Thạch!`, "info");
            this.renderCharacterTab();
            this.updateHeaderInfo();
            StorageSystem.save(this.player);
        } else {
            this.showToast(res ? res.msg : "Không thể bán bản trùng!", "error");
        }
    }

    // ================= MODAL BÁN NHANH TRANG BỊ TRÙNG LẶP =================

    openQuickSellDupsModal() {
        const modal = document.getElementById("quick-sell-dups-modal");
        if (!modal) return;

        const summary = this.player.getDuplicateEquipmentSummary(this.quickSellKeepOne);
        if (summary.totalCount === 0) {
            this.sound.playClick();
            this.showToast("Không tìm thấy trang bị trùng lặp nào trong túi!", "info");
            return;
        }

        this.renderQuickSellDupsModal();
        modal.style.display = "flex";
        this.sound.playClick();
    }

    closeQuickSellDupsModal() {
        const modal = document.getElementById("quick-sell-dups-modal");
        if (modal) modal.style.display = "none";
    }

    toggleQuickSellKeepOne(checked) {
        this.quickSellKeepOne = !!checked;
        this.renderQuickSellDupsModal();
    }

    renderQuickSellDupsModal() {
        const modal = document.getElementById("quick-sell-dups-modal");
        const bannerEl = document.getElementById("quick-sell-stat-banner");
        const listEl = document.getElementById("quick-sell-list-container");
        const btnConfirm = document.getElementById("btn-confirm-quick-sell");
        const chkKeepOne = document.getElementById("chk-keep-one-unused");

        if (!modal || !bannerEl || !listEl) return;

        if (chkKeepOne) {
            chkKeepOne.checked = this.quickSellKeepOne;
        }

        const summary = this.player.getDuplicateEquipmentSummary(this.quickSellKeepOne);

        bannerEl.innerHTML = `
            <div class="quick-sell-stat-col">
                <span class="quick-sell-stat-label">🛡️ Trang bị trùng thanh lý</span>
                <span class="quick-sell-stat-val">${summary.totalCount} món</span>
            </div>
            <div class="quick-sell-stat-col">
                <span class="quick-sell-stat-label">💎 Linh Thạch thu về</span>
                <span class="quick-sell-stat-val">+${this.formatNumber(summary.totalGain)} 💎</span>
            </div>
        `;

        if (summary.totalCount === 0) {
            listEl.innerHTML = `
                <div style="text-align:center; padding: 24px 10px; color: var(--text-muted);">
                    <div style="font-size: 28px; margin-bottom: 6px;">✨</div>
                    <div>Túi đồ gọn gàng! Không có trang bị trùng nào theo tiêu chí này.</div>
                </div>
            `;
            if (btnConfirm) {
                btnConfirm.disabled = true;
                btnConfirm.classList.add("btn-disabled");
                btnConfirm.innerText = "Không Có Trang Bị Trùng";
            }
            return;
        }

        if (btnConfirm) {
            btnConfirm.disabled = false;
            btnConfirm.classList.remove("btn-disabled");
            btnConfirm.innerText = `⚡ Xác Nhận Bán Nhanh (${summary.totalCount} Món)`;
        }

        listEl.innerHTML = "";
        summary.duplicates.forEach(d => {
            const item = d.item;
            const rarity = ItemSystem.getRarity(item.rarity);
            const slotName = item.slot === "non" ? "NÓN" : (item.slot === "giap" ? "GIÁP" : "VŨ KHÍ");

            const row = document.createElement("div");
            row.className = "quick-sell-row-item";
            row.innerHTML = `
                <div class="quick-sell-item-left">
                    <span class="quick-sell-item-icon">${item.icon}</span>
                    <div class="quick-sell-item-details">
                        <strong class="quick-sell-item-name" style="color: ${rarity.color}">${item.name}</strong>
                        <div class="quick-sell-item-meta">
                            <span style="color: ${rarity.color}">${rarity.name}</span> • <span>${slotName}</span> •
                            ${d.isEquipped
                    ? `<span style="color: #ffd700; font-weight:600;">(Đang mặc • Bán hết ${d.dupsCount} bản túi)</span>`
                    : `<span style="color: #a0aec0;">(Chưa mặc • Bán ${d.dupsCount}, giữ ${d.keepCount} bản)</span>`}
                        </div>
                    </div>
                </div>
                <div class="quick-sell-item-right">
                    <span class="quick-sell-sell-count">Bán x${d.dupsCount}</span>
                    <span class="quick-sell-gain-price">+${this.formatNumber(d.totalGain)} 💎</span>
                </div>
            `;
            listEl.appendChild(row);
        });
    }

    confirmQuickSellDups() {
        const res = this.player.sellAllDuplicateEquipment(this.quickSellKeepOne);
        if (res && res.success) {
            this.sound.playClick();
            this.closeQuickSellDupsModal();
            this.showToast(`🎉 Bán nhanh thành công ${res.totalCount} trang bị trùng, thu về +${this.formatNumber(res.totalGain)} Linh Thạch!`, "success");
            this.renderCharacterTab();
            this.updateHeaderInfo();
            StorageSystem.save(this.player);
        } else {
            this.showToast(res ? res.msg : "Không có trang bị trùng để bán!", "info");
        }
    }

    // ================= MODAL ĐỔI TÊN (CUỘN GIẤY ĐỔI TÊN) =================

    openRenameModal() {
        const modal = document.getElementById("rename-modal");
        const statusEl = document.getElementById("rename-scroll-status");
        const inputEl = document.getElementById("rename-input-field");
        const btnConfirm = document.getElementById("btn-confirm-rename");
        if (!modal) return;

        const count = this.player.inventory.filter(id => id === "item_rename_scroll").length;
        if (statusEl) {
            statusEl.innerHTML = `
                <span>📜 Cuộn Giấy Đổi Tên trong túi: <strong style="color:${count > 0 ? '#4caf50' : '#ff5252'}; font-weight:700;">${count} cuộn</strong></span>
                ${count === 0 ? `<button class="btn-xs btn-outline-gold" onclick="gameUI.closeRenameModal(); gameUI.switchTab('shop');">Đến Bách Bảo Các Mua</button>` : ""}
            `;
        }

        if (inputEl) {
            inputEl.value = this.player.name;
        }

        if (btnConfirm) {
            btnConfirm.disabled = count === 0;
            btnConfirm.innerText = count > 0 ? "Xác Nhận Đổi Tên" : "Thiếu Cuộn Giấy (0)";
        }

        modal.style.display = "flex";
        this.sound.playClick();
        setTimeout(() => inputEl?.focus(), 50);
    }

    closeRenameModal() {
        const modal = document.getElementById("rename-modal");
        if (modal) modal.style.display = "none";
    }

    confirmRename() {
        const inputEl = document.getElementById("rename-input-field");
        if (!inputEl) return;
        const newName = inputEl.value;

        const res = this.player.changeName(newName);
        if (res && res.success) {
            this.sound.playBreakthrough();
            this.showToast(`✨ Đạo hiệu mới của đạo hữu đã khắc lên Thiên Đạo Bia: [${res.newName}]!`, "breakthrough");
            this.closeRenameModal();
            this.renderCharacterTab();
            this.updateHeaderInfo();
            StorageSystem.save(this.player);
        } else {
            this.sound.playClick();
            this.showToast(res ? res.msg : "Đổi tên thất bại!", "error");
        }
    }

    // ================= MODAL DANH HIỆU THẦN THÔNG =================

    openTitleModal() {
        const modal = document.getElementById("title-modal");
        if (!modal) return;

        // Tự động kiểm tra mở khóa các danh hiệu mới
        if (typeof TitleSystem !== "undefined") {
            const newlyUnlocked = TitleSystem.checkAndUnlockTitles(this.player);
            if (newlyUnlocked.length > 0) {
                newlyUnlocked.forEach(t => {
                    this.showToast(`🎖️ Đã mở khóa Danh Hiệu mới: [${t.name}]!`, "breakthrough");
                });
            }
        }

        this.renderTitleModal();
        modal.style.display = "flex";
        this.sound.playClick();
    }

    closeTitleModal() {
        const modal = document.getElementById("title-modal");
        if (modal) modal.style.display = "none";
    }

    renderTitleModal() {
        const curBar = document.getElementById("title-current-equipped-bar");
        const listEl = document.getElementById("title-grid-list");
        if (!listEl) return;

        // Render Thanh Danh Hiệu Hiện Tại
        if (curBar) {
            if (this.player.equippedTitle && typeof TitleSystem !== "undefined") {
                const cur = TitleSystem.getTitleById(this.player.equippedTitle);
                if (cur) {
                    curBar.innerHTML = `
                        <div>
                            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 2px;">DANH HIỆU ĐANG TRANG BỊ:</div>
                            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <span class="character-title-tag title-rarity-${cur.rarity}" style="font-size: 12px; cursor: default;">${cur.icon} ${cur.name}</span>
                                <span style="font-size: 11.5px; color: #4ecca3; font-weight: 600;">(${TitleSystem.formatBuffsText(cur.buffs)})</span>
                            </div>
                        </div>
                        <button class="btn-sm btn-secondary" onclick="gameUI.unequipTitle()">Tháo Danh Hiệu</button>
                    `;
                } else {
                    curBar.innerHTML = `
                        <div style="color: var(--text-muted); font-size: 12px;">Chưa trang bị danh hiệu nào. Hãy chọn một danh hiệu bên dưới để nhận buff!</div>
                    `;
                }
            } else {
                curBar.innerHTML = `
                    <div style="color: var(--text-muted); font-size: 12px;">Chưa trang bị danh hiệu nào. Hãy chọn một danh hiệu bên dưới để nhận buff!</div>
                `;
            }
        }

        // Render Danh Sách Danh Hiệu
        listEl.innerHTML = "";
        const allTitles = TitleSystem.getAllTitles();

        allTitles.forEach(title => {
            const isUnlocked = this.player.unlockedTitles && this.player.unlockedTitles.includes(title.id);
            const isEquipped = this.player.equippedTitle === title.id;
            const rarity = ItemSystem.getRarity(title.rarity);

            const card = document.createElement("div");
            card.className = `title-card ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : ''}`;
            card.style.borderColor = isEquipped ? '#ffd700' : rarity.border;

            card.innerHTML = `
                <div class="title-card-top">
                    <span class="title-card-icon">${title.icon}</span>
                    <div class="title-card-name-box">
                        <strong class="title-card-name" style="color: ${rarity.color}">${title.name}</strong>
                        <small style="color: var(--text-muted); font-size: 10px;">${rarity.name} • ${title.category === "boss" ? "Trảm Boss" : title.category === "skill" ? "Bí Tịch" : "Đặc Biệt"}</small>
                    </div>
                </div>

                <div class="title-buffs-box">
                    ⚡ <strong>Hiệu Ứng:</strong> ${TitleSystem.formatBuffsText(title.buffs)}
                </div>

                <div class="title-condition-text">
                    ${isUnlocked
                    ? `✅ <em>Đã đạt được:</em> ${title.conditionDesc}`
                    : `🔒 <em>Điều kiện:</em> ${title.conditionDesc}${title.id === "title_phe_co" ? ` <span style="color:#00e676; font-weight:600;">(Đã cắn: ${this.formatNumber(this.player.pillsConsumed || 0)}/10.000 viên)</span>` : ""}`
                }
                </div>

                <div class="title-card-footer">
                    <span style="font-size: 11px; color: ${isEquipped ? '#ffd700' : isUnlocked ? '#4caf50' : '#94a3b8'}; font-weight: 600;">
                        ${isEquipped ? '⭐ Đang Trang Bị' : isUnlocked ? 'Đã Mở Khóa' : 'Chưa Mở Khóa'}
                    </span>
                    ${isEquipped
                    ? `<button class="btn-sm btn-disabled" disabled style="opacity: 0.7;">Đang Dùng</button>`
                    : isUnlocked
                        ? `<button class="btn-sm btn-primary" onclick="gameUI.equipTitle('${title.id}')">Trang Bị</button>`
                        : `<button class="btn-sm btn-disabled" disabled title="${title.conditionDesc}">🔒 Khóa</button>`
                }
                </div>
            `;
            listEl.appendChild(card);
        });
    }

    equipTitle(titleId) {
        const res = TitleSystem.equipTitle(this.player, titleId);
        if (res && res.success) {
            this.sound.playEquip();
            this.showToast(`Đã trang bị danh hiệu [${res.title.name}], kích hoạt hiệu ứng buff!`, "success");
            this.renderTitleModal();
            this.renderCharacterTab();
            this.updateHeaderInfo();
            StorageSystem.save(this.player);
        } else {
            this.showToast(res ? res.msg : "Không thể trang bị danh hiệu!", "error");
        }
    }

    unequipTitle() {
        TitleSystem.unequipTitle(this.player);
        this.sound.playClick();
        this.showToast("Đã tháo danh hiệu!", "info");
        this.renderTitleModal();
        this.renderCharacterTab();
        this.updateHeaderInfo();
        StorageSystem.save(this.player);
    }

    // ================= TAB BẢN ĐỒ CHỌN ẢI (STAGES) =================

    renderStagesTab() {
        const stageListEl = document.getElementById("stage-grid-list");
        if (!stageListEl) return;

        stageListEl.innerHTML = "";
        const allStages = StageSystem.getAllStages();

        allStages.forEach(rawStage => {
            let stage = rawStage;
            if (stage.id === "stage_23" || stage.id === "stage_van_thien_dia") {
                stage = StageSystem.generateVanThienDiaStage(this.player);
            }
            const unlocked = StageSystem.isStageUnlocked(this.player.realmIndex, this.player.tierIndex, stage, this.player);
            const isCleared = this.player.clearedStages.includes(stage.id);
            const reqTitle = RealmSystem.getFullRealmTitle(stage.reqRealm, stage.reqTier);

            const card = document.createElement("div");
            card.className = `stage-card ${unlocked ? "unlocked" : "locked"} ${isCleared ? "cleared" : ""}`;

            card.innerHTML = `
                <div class="stage-header">
                    <span class="stage-number">ẢI ${stage.number}</span>
                    <span class="stage-diff-badge" style="background:${stage.diffColor}22; color:${stage.diffColor}; border: 1px solid ${stage.diffColor};">
                        ${stage.difficulty}
                    </span>
                </div>
                <h3 class="stage-title">${stage.name}</h3>
                <div class="stage-area-name">📍 ${stage.area}</div>
                <p class="stage-desc">${stage.desc}</p>

                <div class="stage-monster-info">
                    <span class="monster-avatar">${stage.monster.avatar}</span>
                    <div class="monster-meta">
                        <strong>${stage.monster.name} ${stage.monster.isBoss ? `<span class="boss-badge">👑 BOSS (Kim Thân ${Math.round((stage.monster.damageCapPct || (stage.number >= 16 ? 0.20 : 0.25)) * 100)}% • Phá ${Math.round((stage.monster.breakCapPct || (stage.number >= 16 ? 0.30 : 0.40)) * 100)}%)</span>` : ""}</strong>
                        <small>HP: ${this.formatNumber(stage.monster.hp)} | Công: ${this.formatNumber(stage.monster.attack)}${stage.monster.isBoss ? ` | Kim Thân: Thường ${Math.round((stage.monster.damageCapPct || (stage.number >= 16 ? 0.20 : 0.25)) * 100)}% • Phá ${Math.round((stage.monster.breakCapPct || (stage.number >= 16 ? 0.30 : 0.40)) * 100)}% HP` : ""}</small>
                    </div>
                </div>

                <div class="stage-rewards">
                    ${stage.rewards.tinhNguyen 
                        ? `<span style="color:#c084fc;">🌌 +${this.formatNumber(stage.rewards.tinhNguyen)} Tinh Nguyên</span>` 
                        : (stage.rewards.tuVi ? `<span>✨ +${this.formatNumber(stage.rewards.tuVi)} Tu Vi</span>` : '')
                    }
                    ${stage.rewards.honNguyen 
                        ? `<span style="color:#c7d2fe;">🌀 +${this.formatNumber(stage.rewards.honNguyen)} Hỗn Nguyên</span>` 
                        : (stage.rewards.linhThach ? `<span>💎 +${this.formatNumber(stage.rewards.linhThach)} Linh Thạch</span>` : '')
                    }
                    ${stage.rewards.dropChance && stage.rewards.possibleDrops && stage.rewards.possibleDrops.length > 0
                        ? `<span style="color:#ffd700;">🎁 Rơi 100%: ${stage.rewards.possibleDrops.map(id => {
                            const it = typeof ItemSystem !== 'undefined' ? ItemSystem.getItemById(id) : null;
                            return it ? it.name : id;
                        }).join(', ')}</span>`
                        : ''
                    }
                </div>

                <div class="stage-req">
                    Yêu cầu Tu Vi: <strong style="color:${unlocked ? '#4caf50' : '#ff5252'}">${reqTitle}</strong>
                </div>

                <div class="stage-action">
                    ${unlocked
                    ? `<button class="btn-primary btn-block btn-battle" onclick="gameUI.startBattle('${stage.id}')">
                             ⚔️ KHIÊU CHIẾN ${isCleared ? "(Đã Vượt)" : ""}
                           </button>`
                    : `<button class="btn-disabled btn-block" disabled>🔒 BỊ PHONG ẤN (Tu Vi Chưa Đủ)</button>`
                }
                </div>
            `;
            stageListEl.appendChild(card);
        });
    }

    // ================= TAB HƯ KHÔNG THÁP (ENDLESS TOWER) =================

    renderTowerTab() {
        this.player.checkTowerReset();

        const highestFloorEl = document.getElementById("tower-highest-floor");
        const ticketsEl = document.getElementById("tower-tickets-count");
        const currentCardBox = document.getElementById("tower-current-card-box");
        const sweepStatusEl = document.getElementById("tower-sweep-status");
        const sweepPreviewEl = document.getElementById("tower-sweep-preview");
        const btnSweep = document.getElementById("btn-tower-sweep");
        const sharePreviewText = document.getElementById("tower-share-preview-text");

        const tower = this.player.towerData || { highestFloor: 0, currentFloor: 1, dailyTickets: 3, lastResetDate: "" };

        if (highestFloorEl) highestFloorEl.innerText = `Tầng ${tower.highestFloor || 0}`;
        if (ticketsEl) ticketsEl.innerText = `${tower.dailyTickets ?? 3} Lệnh Bài`;

        // Đồng bộ giá vé động từ ItemSystem / TOWER_CONFIG (5.000.000 Hỗn Nguyên)
        const ticketPrice = this.getTowerTicketPrice();
        const formattedTicketPrice = this.formatNumber(ticketPrice);
        const btnBuyTicket = document.getElementById("btn-buy-tower-ticket");
        if (btnBuyTicket) {
            btnBuyTicket.innerText = `➕ Mua Vé (${formattedTicketPrice} 🌀)`;
            btnBuyTicket.title = `Mua thêm Lệnh Bài Hư Không với giá ${ticketPrice.toLocaleString("vi-VN")} Hỗn Nguyên Thạch (hỗ trợ tự động nén từ Linh Thạch)`;
        }

        // Render quái tầng hiện tại
        const floor = tower.currentFloor || 1;
        const stage = typeof TowerSystem !== "undefined" ? TowerSystem.generateTowerStage(floor) : null;

        if (currentCardBox && stage) {
            const isBoss = (floor % 10 === 0);
            const isElite = (!isBoss && floor % 5 === 0);
            const badgeClass = isBoss ? "boss" : (isElite ? "elite" : "normal");
            const badgeText = isBoss ? "👑 BOSS CỔ ĐẠI" : (isElite ? "⚔️ TINH ANH" : "🛡️ THƯỜNG");

            let specialMechanicHtml = "";
            if (isBoss) {
                specialMechanicHtml = `
                    <div class="tower-special-mechanic">
                        🛡️ <strong>Kim Thân Boss:</strong> Đòn thường nhận tối đa 20% Máu. Đòn Bạo Kích & Kỹ Năng phá trần 30% Máu!
                    </div>
                `;
            } else if (isElite) {
                specialMechanicHtml = `
                    <div class="tower-special-mechanic" style="border-left-color: #ff9800; color: #fed7aa; background: rgba(255, 152, 0, 0.1);">
                        🛡️ <strong>Kim Thân Tinh Anh:</strong> Đòn thường nhận tối đa 25% Máu. Đòn Bạo Kích & Kỹ Năng phá trần 40% Máu!
                    </div>
                `;
            }

            const canBattle = tower.dailyTickets > 0;
            const battleBtnText = canBattle 
                ? `⚔️ Khiêu Chiến Tầng ${floor}` 
                : `➕ Mua Vé (${formattedTicketPrice} 🌀) & Khiêu Chiến Tầng ${floor}`;

            currentCardBox.innerHTML = `
                <div class="tower-stage-card ${badgeClass}">
                    <div class="tower-card-header">
                        <span class="tower-card-title">
                            <span>🗼 TẦNG ${floor}</span>
                            <span style="font-size: 13px; color: var(--text-muted); font-weight: normal;">(${stage.area})</span>
                        </span>
                        <span class="tower-badge ${badgeClass}">${badgeText}</span>
                    </div>

                    <div class="tower-monster-row">
                        <div class="tower-monster-avatar-box">
                            <span>${stage.monster.avatar}</span>
                        </div>
                        <div class="tower-monster-details">
                            <span class="tower-monster-name" style="color: ${stage.diffColor}">${stage.monster.name}</span>
                            <span class="tower-monster-title">${stage.monster.title}</span>
                            <span style="font-size: 11px; color: #ff5252;">⏳ Thời gian Enrage: 60 Giây</span>
                        </div>
                    </div>

                    <div class="tower-stats-grid">
                        <div class="tower-stat-item"><span>Sinh Mệnh:</span> <strong>${this.formatNumber(stage.monster.hp)}</strong></div>
                        <div class="tower-stat-item"><span>Sát Thương:</span> <strong>${this.formatNumber(stage.monster.attack)}</strong></div>
                        <div class="tower-stat-item"><span>Phòng Thủ:</span> <strong>${this.formatNumber(stage.monster.defense)}</strong></div>
                        <div class="tower-stat-item"><span>Tốc Đánh:</span> <strong>${stage.monster.attackSpeed}s/đòn</strong></div>
                    </div>

                    ${specialMechanicHtml}

                    <div class="tower-rewards-box">
                        <span style="color: var(--text-gold); font-weight: 600;">🎁 Thưởng Tầng:</span>
                        ${stage.rewards.tinhNguyen 
                            ? `<span style="color:#c084fc;">🌌 +${this.formatNumber(stage.rewards.tinhNguyen)} Tinh Nguyên</span>` 
                            : `<span>✨ +${this.formatNumber(stage.rewards.tuVi)} Tu Vi</span>`
                        }
                        ${stage.rewards.honNguyen 
                            ? `<span style="color:#c7d2fe;">🌀 +${this.formatNumber(stage.rewards.honNguyen)} Hỗn Nguyên</span>`
                            : `<span>💎 +${this.formatNumber(stage.rewards.linhThach)} Linh Thạch</span>`
                        }
                    </div>

                    <button class="btn-tower-battle" onclick="gameUI.startTowerBattle(${floor})">
                        ${battleBtnText}
                    </button>
                </div>
            `;
        }

        // Render Quét Nhanh (Sweep)
        const canSweep = (tower.highestFloor || 0) >= 10;
        if (sweepStatusEl) {
            sweepStatusEl.innerText = canSweep ? "✅ Khả Dụng" : `Yêu cầu Tầng 10+ (Đã đạt: Tầng ${tower.highestFloor || 0})`;
            sweepStatusEl.className = `sweep-badge ${canSweep ? "active" : ""}`;
        }

        if (btnSweep) {
            btnSweep.disabled = !canSweep;
            if (!canSweep) {
                btnSweep.innerText = "🔒 Chưa Đủ Cấp Tầng (Cần Tầng 10+)";
            } else if (tower.dailyTickets <= 0) {
                btnSweep.innerText = `⚡ Mua Vé & Quét Nhanh (${formattedTicketPrice} 🌀)`;
            } else {
                btnSweep.innerText = "⚡ Quét Nhanh Ngay (Tốn 1 Lệnh Bài)";
            }
        }

        if (sweepPreviewEl) {
            if (canSweep && typeof TowerSystem !== "undefined") {
                const sweepData = TowerSystem.calculateSweepRewards(tower.highestFloor);
                if (sweepData) {
                    sweepPreviewEl.style.display = "block";
                    let sweepLinhThachText = "";
                    if (sweepData.totalHonNguyen > 0) {
                        sweepLinhThachText = `<strong>+${this.formatNumber(sweepData.totalHonNguyen)} 🌀 Hỗn Nguyên</strong> • <strong>+${this.formatNumber(sweepData.totalLinhThach)} 💎 Linh Thạch</strong>`;
                    } else {
                        sweepLinhThachText = `<strong>+${this.formatNumber(sweepData.totalLinhThach)} Linh Thạch</strong>`;
                    }

                    let sweepExpText = "";
                    if (sweepData.totalTinhNguyen > 0) {
                        sweepExpText = `<strong style="color:#c084fc;">+${this.formatNumber(sweepData.totalTinhNguyen)} 🌌 Tinh Nguyên</strong>`;
                        if (sweepData.totalTuVi > 0) {
                            sweepExpText += ` • <strong>+${this.formatNumber(sweepData.totalTuVi)} ✨ Tu Vi</strong>`;
                        }
                    } else {
                        sweepExpText = `<strong>+${this.formatNumber(sweepData.totalTuVi)} Tu Vi</strong>`;
                    }

                    sweepPreviewEl.innerHTML = `
                        ✨ Quét Tầng 1 -> ${sweepData.toFloor}: 
                        ${sweepExpText} • 
                        ${sweepLinhThachText}
                    `;
                } else {
                    sweepPreviewEl.style.display = "none";
                }
            } else {
                sweepPreviewEl.style.display = "none";
            }
        }

        // Cập nhật chia sẻ
        if (sharePreviewText && typeof TowerSystem !== "undefined") {
            sharePreviewText.innerText = TowerSystem.getShareText(tower.highestFloor || 1);
        }
    }

    /**
     * Lấy giá mua Lệnh Bài Hư Không (Single Source of Truth từ items.js - 5.000 🌀)
     */
    getTowerTicketPrice() {
        if (typeof ItemSystem !== "undefined") {
            const item = ItemSystem.getItemById("item_tower_ticket");
            if (item && item.price) return item.price;
        }
        if (typeof TOWER_CONFIG !== "undefined" && TOWER_CONFIG.TICKET_PRICE) {
            return TOWER_CONFIG.TICKET_PRICE;
        }
        return 5000;
    }

    /**
     * Mua trực tiếp Lệnh Bài Hư Không trong tab Tháp (5.000 Hỗn Nguyên Thạch)
     */
    handleBuyTowerTicket() {
        const ticketPrice = this.getTowerTicketPrice();
        const formattedPrice = this.formatNumber(ticketPrice);
        const totalHN = (this.player.honNguyen || 0) + Math.floor((this.player.linhThach || 0) / 1000000000);
        if (totalHN < ticketPrice) {
            this.showToast(`⚠️ Không đủ Hỗn Nguyên Thạch! Cần ${ticketPrice.toLocaleString("vi-VN")} (${formattedPrice}) 🌀 Hỗn Nguyên (hoặc Linh Thạch tương đương) để mua 1 Lệnh Bài Hư Không.`, "error");
            return;
        }

        if (confirm(`Đạo hữu có chắc muốn tiêu hao ${ticketPrice.toLocaleString("vi-VN")} (${formattedPrice}) 🌀 Hỗn Nguyên (hoặc tự động nén từ Linh Thạch) để mua thêm 1 Lệnh Bài Hư Không?`)) {
            const res = this.player.buyTowerTicket(1);
            if (res.success) {
                this.sound.playClick();
                this.showToast(`🎫 ${res.msg}`, "success");
                this.renderTowerTab();
                this.updateHeaderInfo();
                StorageSystem.save(this.player);
            } else {
                this.showToast(res.msg, "error");
            }
        }
    }

    /**
     * Tự động hỏi mua vé khi hết vé và bắt đầu khiêu chiến
     */
    promptBuyTicketAndBattle(floor) {
        const ticketPrice = this.getTowerTicketPrice();
        const formattedPrice = this.formatNumber(ticketPrice);
        const totalHN = (this.player.honNguyen || 0) + Math.floor((this.player.linhThach || 0) / 1000000000);
        if (totalHN < ticketPrice) {
            this.showToast(`⚠️ Đạo hữu đã hết Lệnh Bài Hư Không và không đủ ${ticketPrice.toLocaleString("vi-VN")} (${formattedPrice}) 🌀 Hỗn Nguyên (hoặc Linh Thạch tương đương) để mua thêm!`, "error");
            return;
        }

        if (confirm(`⚠️ Đạo hữu đã hết Lệnh Bài Hư Không miễn phí.\n\nĐạo hữu có muốn tiêu hao ${ticketPrice.toLocaleString("vi-VN")} (${formattedPrice}) 🌀 Hỗn Nguyên để mua 1 Lệnh Bài và khiêu chiến Tầng ${floor} ngay không?`)) {
            const res = this.player.buyTowerTicket(1);
            if (res.success) {
                this.sound.playClick();
                this.showToast(`🎫 ${res.msg}`, "success");
                this.updateHeaderInfo();
                StorageSystem.save(this.player);
                this.startTowerBattle(floor);
            } else {
                this.showToast(res.msg, "error");
            }
        }
    }

    startTowerBattle(floor) {
        this.clearAutoRepeatTimer();
        this.clearTowerAutoClimbTimer();
        this.player.checkTowerReset();

        if (this.player.towerData.dailyTickets <= 0) {
            this.promptBuyTicketAndBattle(floor);
            return;
        }

        const stage = TowerSystem.generateTowerStage(floor);
        if (!stage) return;

        // Giới hạn chiến đấu: Tự động tháo danh hiệu Phê Cỏ khi khiêu chiến
        if (this.player.equippedTitle === "title_phe_co") {
            this.player.equippedTitle = null;
            this.showToast("⚠️ Đang 'Phê Cỏ' không thể chiến đấu! Danh hiệu đã tự động tháo gỡ.", "warning");
            this.renderCultivateTab();
            this.renderCharacterTab();
            this.updateHeaderInfo();
            StorageSystem.save(this.player);
        }

        this.sound.playSlash();
        this.switchTab("combat");

        // Thiết lập giao diện đấu trường
        const mNameEl = document.getElementById("combat-monster-name");
        const mAvatarEl = document.getElementById("combat-monster-avatar");
        const pAvatarEl = document.getElementById("combat-player-avatar");
        const pNameEl = document.getElementById("combat-player-name");
        const stageTitleEl = document.getElementById("combat-stage-title");

        if (mNameEl) {
            const isBoss = (floor % 10 === 0);
            const isElite = (!isBoss && floor % 5 === 0);
            const bossCapStr = isBoss ? " 👑 (BOSS CỔ ĐẠI - Kim Thân 20% • Phá 30%)" : (isElite ? " ⚔️ (TINH ANH - Kim Thân 25% • Phá 40%)" : "");
            mNameEl.innerText = `${stage.monster.name}${bossCapStr}`;
        }
        if (mAvatarEl) mAvatarEl.innerText = stage.monster.avatar;
        if (pAvatarEl) pAvatarEl.innerText = "🧘‍♂️";
        if (pNameEl) {
            let titlePrefix = "";
            if (this.player.equippedTitle && typeof TitleSystem !== "undefined") {
                const title = TitleSystem.getTitleById(this.player.equippedTitle);
                if (title) titlePrefix = `[${title.name}] `;
            }
            pNameEl.innerText = `${titlePrefix}${this.player.name} (${this.player.getFullTitle()})`;
        }
        if (stageTitleEl) stageTitleEl.innerText = stage.name;

        // Render 3 nút kỹ năng trong trận
        this.renderCombatSkillsUI();

        // Xóa log cũ
        const logBox = document.getElementById("combat-log-list");
        if (logBox) logBox.innerHTML = "";

        // Bắt đầu trận
        this.combat.startBattle(stage, (result) => {
            this.handleBattleEnd(result);
        });
    }

    /**
     * Chuyển tiếp ngay sang Tầng Tháp tiếp theo mà không bị giật về tab Tháp
     */
    nextTowerBattle(floor) {
        this.clearTowerAutoClimbTimer();
        const modal = document.getElementById("battle-result-modal");
        if (modal) modal.style.display = "none";

        if (this.player.towerData.dailyTickets <= 0) {
            this.promptBuyTicketAndBattle(floor);
            return;
        }

        this.startTowerBattle(floor);
    }

    /**
     * Đánh lại tầng tháp hiện tại sau thất bại
     */
    retryTowerBattle(floor) {
        this.clearTowerAutoClimbTimer();
        const modal = document.getElementById("battle-result-modal");
        if (modal) modal.style.display = "none";

        if (this.player.towerData.dailyTickets <= 0) {
            this.promptBuyTicketAndBattle(floor);
            return;
        }

        this.startTowerBattle(floor);
    }

    /**
     * Đóng modal kết quả và quay về tab Hư Không Tháp
     */
    closeTowerBattle() {
        this.clearTowerAutoClimbTimer();
        const modal = document.getElementById("battle-result-modal");
        if (modal) modal.style.display = "none";
        this.switchTab("tower");
    }

    /**
     * Bật / Tắt chế độ tự động leo tháp tiếp theo (3s)
     */
    toggleTowerAutoClimb(forceState = null) {
        if (forceState !== null) {
            this.isTowerAutoClimb = forceState;
        } else {
            this.isTowerAutoClimb = !this.isTowerAutoClimb;
        }

        if (this.isTowerAutoClimb) {
            this.sound.playClick();
            this.showToast("Đã BẬT tự động leo tháp tiếp theo trong 3s!", "info");
            const modal = document.getElementById("battle-result-modal");
            if (modal && modal.style.display === "flex") {
                const nextFloor = (this.combat?.currentStage?.number || 1) + 1;
                this.startTowerAutoClimbCountdown(nextFloor);
            }
        } else {
            this.sound.playClick();
            this.showToast("Đã TẮT tự động leo tháp!", "info");
            this.clearTowerAutoClimbTimer();
            const container = document.getElementById("tower-auto-climb-countdown-container");
            if (container && this.combat?.currentStage) {
                const nextFloor = (this.combat.currentStage.number || 1) + 1;
                container.innerHTML = `
                    <div class="modal-actions mt-3">
                        <button class="btn-primary" onclick="gameUI.nextTowerBattle(${nextFloor})">⚔️ Leo Tiếp Tầng ${nextFloor}</button>
                        <button class="btn-secondary" onclick="gameUI.toggleTowerAutoClimb(true)">🔁 Tự Động Leo Tiếp (3s)</button>
                        <button class="btn-secondary" onclick="gameUI.closeTowerBattle()">🏰 Quay Về Tháp</button>
                    </div>
                `;
            }
        }
    }

    clearTowerAutoClimbTimer() {
        if (this.towerAutoClimbInterval) {
            clearInterval(this.towerAutoClimbInterval);
            this.towerAutoClimbInterval = null;
        }
    }

    startTowerAutoClimbCountdown(nextFloor) {
        this.clearTowerAutoClimbTimer();
        const container = document.getElementById("tower-auto-climb-countdown-container");
        if (!container) return;

        const speed = this.combat?.speedMultiplier || 1;
        const totalTime = Math.max(1.0, +(3.0 / speed).toFixed(1));
        let timeLeft = totalTime;

        container.innerHTML = `
            <div class="auto-repeat-countdown-box" style="border-color: rgba(224, 64, 251, 0.5); background: rgba(74, 20, 140, 0.2);">
                <div class="countdown-header" style="color: #e040fb;">
                    <span class="countdown-spinner">🗼</span>
                    <span>Tự động leo <strong>Tầng ${nextFloor}</strong> sau: <strong class="countdown-timer" id="tower-autoclimb-timer" style="color: #f5d0fe;">${totalTime.toFixed(1)}</strong>s</span>
                </div>
                <div class="countdown-bar-outer">
                    <div class="countdown-bar-fill" id="tower-autoclimb-bar" style="width: 100%; background: linear-gradient(90deg, #7b1fa2, #e040fb); box-shadow: 0 0 8px rgba(224, 64, 251, 0.6);"></div>
                </div>
                <div class="countdown-actions">
                    <button class="btn-sm btn-warning" onclick="gameUI.nextTowerBattle(${nextFloor})">⚡ Leo Ngay</button>
                    <button class="btn-sm btn-secondary" onclick="gameUI.toggleTowerAutoClimb(false)">🛑 Dừng Tự Động</button>
                    <button class="btn-sm btn-secondary" onclick="gameUI.closeTowerBattle()">🏰 Về Tháp</button>
                </div>
            </div>
        `;

        const timerEl = document.getElementById("tower-autoclimb-timer");
        const barEl = document.getElementById("tower-autoclimb-bar");

        const updateInterval = 100;
        this.towerAutoClimbInterval = setInterval(() => {
            timeLeft -= (updateInterval / 1000);
            if (timeLeft <= 0) {
                this.clearTowerAutoClimbTimer();
                if (timerEl) timerEl.innerText = "0.0";
                if (barEl) barEl.style.width = "0%";
                this.nextTowerBattle(nextFloor);
            } else {
                if (timerEl) timerEl.innerText = Math.max(0, timeLeft).toFixed(1);
                if (barEl) {
                    const percent = Math.max(0, (timeLeft / totalTime) * 100);
                    barEl.style.width = `${percent}%`;
                }
            }
        }, updateInterval);
    }

    handleTowerSweep() {
        this.player.checkTowerReset();
        if (!this.player.towerData || (this.player.towerData.highestFloor || 0) < 10) {
            this.showToast("⚠️ Cần vượt qua tối thiểu Tầng 10 mới có thể mở khóa tính năng Quét Nhanh!", "warning");
            return;
        }

        if (this.player.towerData.dailyTickets <= 0) {
            const ticketPrice = this.getTowerTicketPrice();
            const formattedPrice = this.formatNumber(ticketPrice);
            const totalHN = (this.player.honNguyen || 0) + Math.floor((this.player.linhThach || 0) / 1000000000);
            if (totalHN < ticketPrice) {
                this.showToast(`⚠️ Đạo hữu đã hết Lệnh Bài Hư Không và không đủ ${ticketPrice.toLocaleString("vi-VN")} (${formattedPrice}) 🌀 Hỗn Nguyên (hoặc Linh Thạch tương đương) để mua thêm!`, "error");
                return;
            }
            if (!confirm(`⚠️ Đạo hữu đã hết Lệnh Bài Hư Không.\n\nCó muốn tiêu hao ${ticketPrice.toLocaleString("vi-VN")} (${formattedPrice}) 🌀 Hỗn Nguyên để mua 1 Lệnh Bài và Quét Nhanh ngay không?`)) {
                return;
            }
            const buyRes = this.player.buyTowerTicket(1);
            if (!buyRes.success) {
                this.showToast(buyRes.msg, "error");
                return;
            }
            this.showToast(`🎫 ${buyRes.msg}`, "success");
        }

        const sweepData = TowerSystem.calculateSweepRewards(this.player.towerData.highestFloor);
        if (!sweepData) return;

        let rewardPrompt = "";
        if (sweepData.totalTinhNguyen > 0) {
            rewardPrompt += `🌌 Tinh Nguyên: +${this.formatNumber(sweepData.totalTinhNguyen)}\n`;
        }
        if (sweepData.totalTuVi > 0) {
            rewardPrompt += `✨ Tu Vi: +${this.formatNumber(sweepData.totalTuVi)}\n`;
        }
        if (sweepData.totalHonNguyen > 0) {
            rewardPrompt += `🌀 Hỗn Nguyên: +${this.formatNumber(sweepData.totalHonNguyen)}\n`;
        }
        rewardPrompt += `💎 Linh Thạch: +${this.formatNumber(sweepData.totalLinhThach)}`;

        if (!confirm(`Đạo hữu có chắc muốn tiêu hao 1 Lệnh Bài Hư Không để quét nhanh từ Tầng 1 đến Tầng ${sweepData.toFloor}?\n\nPhần thưởng ước tính:\n${rewardPrompt}`)) {
            return;
        }

        this.player.towerData.dailyTickets = Math.max(0, this.player.towerData.dailyTickets - 1);
        if (sweepData.totalTinhNguyen > 0) {
            this.player.addTinhNguyen(sweepData.totalTinhNguyen);
        }
        if (sweepData.totalTuVi > 0) {
            this.player.addTuVi(sweepData.totalTuVi);
        }
        this.player.linhThach = (this.player.linhThach || 0) + sweepData.totalLinhThach;
        if (sweepData.totalHonNguyen) {
            this.player.honNguyen = (this.player.honNguyen || 0) + sweepData.totalHonNguyen;
        }

        this.sound.playVictory();
        let toastMsg = `⚡ Quét nhanh thành công Tầng 1 -> ${sweepData.toFloor}! Nhận `;
        if (sweepData.totalTinhNguyen > 0) {
            toastMsg += `+${this.formatNumber(sweepData.totalTinhNguyen)} 🌌 Tinh Nguyên, `;
        }
        if (sweepData.totalTuVi > 0) {
            toastMsg += `+${this.formatNumber(sweepData.totalTuVi)} Tu Vi, `;
        }
        if (sweepData.totalHonNguyen > 0) {
            toastMsg += `+${this.formatNumber(sweepData.totalHonNguyen)} 🌀 Hỗn Nguyên, `;
        }
        toastMsg += `+${this.formatNumber(sweepData.totalLinhThach)} 💎 Linh Thạch!`;
        this.showToast(toastMsg, "breakthrough");
        this.renderTowerTab();
        this.updateHeaderInfo();
        StorageSystem.save(this.player);
    }

    handleTowerShare() {
        const text = TowerSystem.getShareText(this.player.towerData?.highestFloor || 1);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast("📋 Đã sao chép chiến tích Hư Không Tháp vào bộ nhớ tạm!", "success");
            }).catch(() => {
                prompt("Sao chép chiến tích này:", text);
            });
        } else {
            prompt("Sao chép chiến tích này:", text);
        }
    }

    startBattle(stageId) {
        this.clearAutoRepeatTimer();
        const stage = StageSystem.getStageById(stageId, this.player);
        if (!stage) return;

        if (!StageSystem.isStageUnlocked(this.player.realmIndex, this.player.tierIndex, stage, this.player)) {
            this.showToast("Tu vi chưa đủ, tiến vào sẽ tan xương nát thịt!", "error");
            return;
        }

        // Giới hạn chiến đấu: Tự động tháo danh hiệu Phê Cỏ khi khiêu chiến
        if (this.player.equippedTitle === "title_phe_co") {
            this.player.equippedTitle = null;
            this.showToast("⚠️ Đang 'Phê Cỏ' không thể chiến đấu! Danh hiệu đã tự động tháo gỡ.", "warning");
            this.renderCultivateTab();
            this.renderCharacterTab();
            this.updateHeaderInfo();
            StorageSystem.save(this.player);
        }

        this.sound.playSlash();
        this.switchTab("combat");

        // Thiết lập giao diện đấu trường
        const mNameEl = document.getElementById("combat-monster-name");
        const mAvatarEl = document.getElementById("combat-monster-avatar");
        const pAvatarEl = document.getElementById("combat-player-avatar");
        const pNameEl = document.getElementById("combat-player-name");
        const stageTitleEl = document.getElementById("combat-stage-title");

        if (mNameEl) {
            const isSupreme = stage.number >= 16;
            const capPct = Math.round((stage.monster.damageCapPct || (isSupreme ? 0.20 : 0.25)) * 100);
            const breakPct = Math.round((stage.monster.breakCapPct || (isSupreme ? 0.30 : 0.40)) * 100);
            const bossCapStr = stage.monster.isBoss ? ` 👑 (BOSS - Kim Thân ${capPct}% • Phá ${breakPct}%)` : "";
            mNameEl.innerText = `${stage.monster.name}${bossCapStr}`;
        }
        if (mAvatarEl) mAvatarEl.innerText = stage.monster.avatar;
        if (pAvatarEl) pAvatarEl.innerText = "🧘‍♂️";
        if (pNameEl) {
            let titlePrefix = "";
            if (this.player.equippedTitle && typeof TitleSystem !== "undefined") {
                const title = TitleSystem.getTitleById(this.player.equippedTitle);
                if (title) titlePrefix = `[${title.name}] `;
            }
            pNameEl.innerText = `${titlePrefix}${this.player.name} (${this.player.getFullTitle()})`;
        }
        if (stageTitleEl) stageTitleEl.innerText = stage.name;

        // Render 3 nút kỹ năng trong trận
        this.renderCombatSkillsUI();

        // Xóa log cũ
        const logBox = document.getElementById("combat-log-list");
        if (logBox) logBox.innerHTML = "";

        // Bắt đầu trận
        this.combat.startBattle(stage, (result) => {
            this.handleBattleEnd(result);
        });
    }

    renderCombatSkillsUI() {
        for (let i = 0; i < 3; i++) {
            const btn = document.getElementById(`combat-skill-btn-${i}`);
            const iconEl = document.getElementById(`combat-skill-icon-${i}`);
            const nameEl = document.getElementById(`combat-skill-name-${i}`);
            const skillId = this.player.equippedSkills[i];

            if (btn && iconEl && nameEl) {
                if (skillId) {
                    const skill = SkillSystem.getSkillById(skillId);
                    iconEl.innerText = skill.icon;
                    nameEl.innerText = skill.name;
                    btn.style.opacity = "1";
                    btn.title = skill.desc;
                } else {
                    iconEl.innerText = "➕";
                    nameEl.innerText = `Ô ${i + 1} Trống`;
                    btn.style.opacity = "0.5";
                    btn.title = "Chưa gắn kỹ năng";
                }
            }
        }
    }

    handleBattleEnd(result) {
        this.clearAutoRepeatTimer();

        const modal = document.getElementById("battle-result-modal");
        const titleEl = document.getElementById("battle-result-title");
        const contentEl = document.getElementById("battle-result-content");

        if (!modal || !titleEl || !contentEl) return;

        // Xử lý kết thúc trận Hư Không Tháp (Endless Tower)
        if (result.isTower) {
            if (result.victory) {
                titleEl.innerText = `🗼 ĐẠI THẮNG TẦNG ${result.stage.number}!`;
                titleEl.style.color = "#e040fb";

                contentEl.innerHTML = `
                    <p style="color: #c084fc; font-weight: 600;">Đạo hữu đã dũng mãnh trảm sát ma vật Hư Không, phá tan cấm chế tiến lên tầng cao hơn!</p>
                    <div class="result-rewards-box" style="border-color: rgba(224, 64, 251, 0.4); background: rgba(74, 20, 140, 0.15);">
                        <div>${result.tinhNguyenGain > 0 ? `🌌 Tinh Nguyên: <strong style="color: #c084fc;">+${this.formatNumber(result.tinhNguyenGain)}</strong>` : `✨ Tu Vi Nhận Được: <strong>+${this.formatNumber(result.tuViGain)}</strong>`}</div>
                        ${result.honNguyenGain > 0 ? `<div>🌀 Hỗn Nguyên: <strong style="color: #c7d2fe;">+${this.formatNumber(result.honNguyenGain)}</strong></div>` : ""}
                        <div>💎 Linh Thạch: <strong>+${this.formatNumber(result.linhThachGain)}</strong></div>
                        <div>🏆 Kỷ Lục Đạt Được: <strong>Tầng ${this.player.towerData.highestFloor}</strong></div>
                    </div>
                    <div id="tower-auto-climb-countdown-container">
                        <div class="modal-actions mt-3">
                            <button class="btn-primary" onclick="gameUI.nextTowerBattle(${result.stage.number + 1})">⚔️ Leo Tiếp Tầng ${result.stage.number + 1}</button>
                            <button class="btn-secondary" onclick="gameUI.toggleTowerAutoClimb(true)">🔁 Tự Động Leo Tiếp (3s)</button>
                            <button class="btn-secondary" onclick="gameUI.closeTowerBattle()">🏰 Quay Về Tháp</button>
                        </div>
                    </div>
                `;
            } else {
                titleEl.innerText = result.isEnrageTimeout ? "⏳ HẾT THỜI GIAN ENRAGE (60s)!" : "💀 KHIÊU CHIẾN THẤT BẠI!";
                titleEl.style.color = "#ff5252";

                const failMsg = result.isEnrageTimeout
                    ? "Cuồng bạo hư không nuốt chửng khiêu chiến! Đạo hữu không thể hạ gục quái vật trong vòng 60 giây."
                    : "Đạo hữu kiệt sức trước uy áp ma vật Hư Không!";

                contentEl.innerHTML = `
                    <p>${failMsg}</p>
                    <div class="result-rewards-box" style="border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.08);">
                        <div style="color: #f87171;">⚠️ Tổn thất: <strong>1 Lệnh Bài Hư Không</strong></div>
                        <div>🎫 Lệnh Bài Còn Lại: <strong>${this.player.towerData.dailyTickets} Lệnh Bài</strong></div>
                    </div>
                    <div class="modal-actions mt-3">
                        ${this.player.towerData.dailyTickets > 0
                        ? `<button class="btn-primary" onclick="gameUI.retryTowerBattle(${result.stage.number})">⚔️ Thử Lại Tầng Này</button>`
                        : `<button class="btn-warning" onclick="gameUI.promptBuyTicketAndBattle(${result.stage.number})">➕ Mua Vé (${this.formatNumber(this.getTowerTicketPrice())} 🌀) & Đánh Lại</button>`}
                        <button class="btn-secondary" onclick="gameUI.closeTowerBattle()">🏰 Quay Về Tháp</button>
                    </div>
                `;
            }
            modal.style.display = "flex";
            this.updateHeaderInfo();
            StorageSystem.save(this.player);

            // Nếu đang bật Tự Động Leo Tiếp (và chiến thắng), kích hoạt đếm ngược 3s
            if (this.isTowerAutoClimb && result.victory) {
                this.startTowerAutoClimbCountdown(result.stage.number + 1);
            }
            return;
        }

        if (result.victory) {
            titleEl.innerText = "🏆 ĐẠI THẮNG VƯỢT ẢI!";
            titleEl.style.color = "#ffd700";

            let dropHtml = "Không rơi vật phẩm.";
            if (result.droppedItem) {
                const r = ItemSystem.getRarity(result.droppedItem.rarity);
                if (result.droppedItem.id === "pill_tay_tuy") {
                    dropHtml = `<span style="color: ${r.color}; font-weight: bold; text-shadow: 0 0 10px rgba(255, 183, 77, 0.8);">✨ 🌟 ${result.droppedItem.icon} ${result.droppedItem.name} (${r.name} - Cực Kỳ Quý Hiếm!)</span>`;
                } else {
                    dropHtml = `<span style="color: ${r.color}"><strong>${result.droppedItem.icon} ${result.droppedItem.name}</strong> (${r.name})</span>`;
                }
            }

            let titleHtml = "";
            if (result.newTitles && result.newTitles.length > 0) {
                const titleNames = result.newTitles.map(t => `<span style="color:#ffd700; font-weight:bold;">[${t.icon} ${t.name}]</span>`).join(", ");
                titleHtml = `<div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed rgba(255,215,0,0.3); color: #ffd700;">🎖️ <strong>Mở Khóa Danh Hiệu:</strong> ${titleNames}</div>`;
            }

            contentEl.innerHTML = `
                <p>Đạo hữu đã uy phong trảm sát yêu tà!</p>
                <div class="result-rewards-box">
                    ${result.tuViGain > 0 ? `<div>✨ Tu Vi Nhận Được: <strong>+${this.formatNumber(result.tuViGain)}</strong></div>` : ""}
                    ${result.tinhNguyenGain > 0 ? `<div>🌌 Tinh Nguyên: <strong style="color: #67e8f9;">+${this.formatNumber(result.tinhNguyenGain)}</strong></div>` : ""}
                    ${result.honNguyenGain > 0 ? `<div>🌀 Hỗn Nguyên: <strong style="color: #c7d2fe;">+${this.formatNumber(result.honNguyenGain)}</strong></div>` : ""}
                    <div>💎 Linh Thạch: <strong>+${this.formatNumber(result.linhThachGain)}</strong></div>
                    <div>🎁 Chiến Lợi Phẩm: ${dropHtml}</div>
                    ${titleHtml}
                </div>
                <div id="auto-repeat-countdown-container">
                    <div class="modal-actions mt-3">
                        <button class="btn-primary" onclick="gameUI.closeBattleResult(true)">Tiếp Tục Tu Luyện</button>
                        <button class="btn-secondary" onclick="gameUI.replayBattle()">Đánh Lại Ải Này</button>
                        <button class="btn-secondary" onclick="gameUI.toggleAutoRepeat(true)">🔁 Bật Lặp Ải (3s)</button>
                    </div>
                </div>
            `;
        } else {
            titleEl.innerText = "💀 THẤT BẠI TRỌNG THƯƠNG!";
            titleEl.style.color = "#ff5252";
            contentEl.innerHTML = `
                <p>Tu vi hoặc trang bị chưa đủ để chống cự yêu ma cấp này. Hãy đả tọa tu luyện, cường hóa thuộc tính hoặc thỉnh bí tịch mới rồi phục thù!</p>
                <div id="auto-repeat-countdown-container">
                    <div class="modal-actions mt-3">
                        <button class="btn-primary" onclick="gameUI.closeBattleResult(false)">Lui Về Dưỡng Thương</button>
                        <button class="btn-secondary" onclick="gameUI.replayBattle()">Thử Lại Ngay</button>
                    </div>
                </div>
            `;
        }

        modal.style.display = "flex";
        this.updateHeaderInfo();
        StorageSystem.save(this.player);

        // Nếu đang bật Tự Động Đánh Lại (và chiến thắng), kích hoạt đếm ngược 3s
        if (this.isAutoRepeat && result.victory) {
            this.startAutoRepeatCountdown();
        }
    }

    closeBattleResult(gotoStages = false) {
        this.clearAutoRepeatTimer();
        this.clearTowerAutoClimbTimer();
        const modal = document.getElementById("battle-result-modal");
        if (modal) modal.style.display = "none";
        if (this.combat.isTowerBattle) {
            this.switchTab("tower");
        } else {
            this.switchTab(gotoStages ? "stages" : "character");
        }
    }

    replayBattle() {
        this.clearAutoRepeatTimer();
        const modal = document.getElementById("battle-result-modal");
        if (modal) modal.style.display = "none";
        if (this.combat.currentStage) {
            if (this.combat.isTowerBattle) {
                this.startTowerBattle(this.combat.currentStage.number);
            } else {
                this.startBattle(this.combat.currentStage.id);
            }
        }
    }

    // ================= TỰ ĐỘNG ĐÁNH LẠI ẢI (AUTO REPEAT) =================

    toggleAutoRepeat(forceState = null) {
        if (forceState !== null) {
            this.isAutoRepeat = forceState;
        } else {
            this.isAutoRepeat = !this.isAutoRepeat;
        }

        localStorage.setItem("tu_tien_auto_repeat", this.isAutoRepeat ? "true" : "false");
        this.updateAutoRepeatBtnUI();

        if (this.isAutoRepeat) {
            this.sound.playClick();
            this.showToast("Đã BẬT tự động đánh lại ải trong vòng 3s!", "info");
            // Nếu modal kết quả trận đấu đang mở, kích hoạt đếm ngược 3s ngay
            const modal = document.getElementById("battle-result-modal");
            if (modal && modal.style.display === "flex") {
                this.startAutoRepeatCountdown();
            }
        } else {
            this.sound.playClick();
            this.showToast("Đã TẮT tự động đánh lại ải!", "info");
            this.clearAutoRepeatTimer();
            // Cập nhật lại các nút trong modal kết quả nếu đang hiển thị
            const container = document.getElementById("auto-repeat-countdown-container");
            if (container) {
                container.innerHTML = `
                    <div class="modal-actions mt-3">
                        <button class="btn-primary" onclick="gameUI.closeBattleResult(true)">Tiếp Tục Tu Luyện</button>
                        <button class="btn-secondary" onclick="gameUI.replayBattle()">Đánh Lại Ải Này</button>
                        <button class="btn-secondary" onclick="gameUI.toggleAutoRepeat(true)">🔁 Bật Lặp Ải (3s)</button>
                    </div>
                `;
            }
        }
    }

    updateAutoRepeatBtnUI() {
        const btn = document.getElementById("btn-combat-autorepeat");
        if (!btn) return;

        if (this.isAutoRepeat) {
            btn.classList.add("active");
            btn.innerText = "🔁 Tự Đánh Lại: BẬT";
            btn.title = "Đang BẬT tự động đánh lại ải trong 3s. Bấm để TẮT.";
        } else {
            btn.classList.remove("active");
            btn.innerText = "🔁 Tự Đánh Lại: TẮT";
            btn.title = "Đang TẮT tự động đánh lại ải. Bấm để BẬT.";
        }
    }

    clearAutoRepeatTimer() {
        if (this.autoRepeatInterval) {
            clearInterval(this.autoRepeatInterval);
            this.autoRepeatInterval = null;
        }
    }

    startAutoRepeatCountdown() {
        this.clearAutoRepeatTimer();
        const container = document.getElementById("auto-repeat-countdown-container");
        if (!container) return;

        const speed = this.combat?.speedMultiplier || 1;
        const totalTime = Math.max(1.0, +(3.0 / speed).toFixed(1));
        let timeLeft = totalTime;

        container.innerHTML = `
            <div class="auto-repeat-countdown-box">
                <div class="countdown-header">
                    <span class="countdown-spinner">⏳</span>
                    <span>Tự động đánh lại ải sau: <strong class="countdown-timer" id="auto-repeat-timer">${totalTime.toFixed(1)}</strong>s</span>
                </div>
                <div class="countdown-bar-outer">
                    <div class="countdown-bar-fill" id="auto-repeat-bar" style="width: 100%;"></div>
                </div>
                <div class="countdown-actions">
                    <button class="btn-sm btn-warning" onclick="gameUI.replayBattle()">⚡ Đánh Lại Ngay</button>
                    <button class="btn-sm btn-secondary" onclick="gameUI.cancelAutoRepeat()">🛑 Dừng Tự Động</button>
                    <button class="btn-sm btn-secondary" onclick="gameUI.closeBattleResult(false)">🏠 Về Động Phủ</button>
                </div>
            </div>
        `;

        const timerEl = document.getElementById("auto-repeat-timer");
        const barEl = document.getElementById("auto-repeat-bar");

        const updateInterval = 100;
        this.autoRepeatInterval = setInterval(() => {
            timeLeft -= (updateInterval / 1000);
            if (timeLeft <= 0) {
                this.clearAutoRepeatTimer();
                if (timerEl) timerEl.innerText = "0.0";
                if (barEl) barEl.style.width = "0%";
                this.replayBattle();
            } else {
                if (timerEl) timerEl.innerText = Math.max(0, timeLeft).toFixed(1);
                if (barEl) {
                    const percent = Math.max(0, (timeLeft / totalTime) * 100);
                    barEl.style.width = `${percent}%`;
                }
            }
        }, updateInterval);
    }

    cancelAutoRepeat() {
        this.toggleAutoRepeat(false);
    }

    // ================= ĐIỀU KHIỂN TỐC ĐỘ TRẬN ĐẤU (x1, x2, x3) =================

    toggleCombatSpeed() {
        const current = this.combat?.speedMultiplier || 1;
        let next = 1;
        if (current === 1) next = 2;
        else if (current === 2) next = 3;
        else next = 1;

        if (this.combat) {
            this.combat.setSpeedMultiplier(next);
        } else {
            localStorage.setItem("tu_tien_combat_speed", String(next));
        }

        this.sound?.playClick();
        this.updateCombatSpeedBtnUI();
        this.showToast(`⚡ Tốc độ chiến đấu: x${next}`, "info");
    }

    updateCombatSpeedBtnUI() {
        const btn = document.getElementById("btn-combat-speed");
        if (!btn) return;

        const speed = this.combat?.speedMultiplier || parseInt(localStorage.getItem("tu_tien_combat_speed") || "1", 10);
        btn.classList.remove("speed-x1", "speed-x2", "speed-x3");
        btn.classList.add(`speed-x${speed}`);
        btn.innerText = `⚡ Tốc Độ: x${speed}`;
        btn.title = `Tốc độ trận đấu: x${speed} (Bấm để đổi x1 -> x2 -> x3)`;
    }

    // ================= TAB KỸ NĂNG & TÀNG KINH CÁC (SKILLS) =================

    renderEquippedSkills() {
        // 3 Ô Kỹ Năng Đang Gắn Trong Trận
        for (let i = 0; i < 3; i++) {
            const slotEl = document.getElementById(`equipped-skill-slot-${i}`);
            if (!slotEl) continue;

            const skillId = this.player.equippedSkills[i];
            if (skillId) {
                const skill = SkillSystem.getSkillById(skillId);
                slotEl.innerHTML = `
                    <div class="skill-slot-card active"
                         style="cursor: pointer;"
                         onmouseenter="gameUI.showSkillTooltip(event, '${skill.id}')"
                         onmousemove="gameUI.moveItemTooltip(event)"
                         onmouseleave="gameUI.hideItemTooltip()">
                        <span class="skill-icon">${skill.icon}</span>
                        <div class="skill-meta">
                            <strong>${skill.name}</strong>
                            <small>${skill.type === "vat_li" ? "Vật Lí" : skill.type === "phep" ? "Pháp Thuật" : skill.type === "ho_the" ? "Hộ Thể" : skill.type === "dot_mau" ? "Đốt Máu" : "Trị Liệu"} • Hồi ${skill.cooldown}s</small>
                        </div>
                        <button class="btn-sm btn-danger" onclick="event.stopPropagation(); gameUI.unequipSkill(${i})">Gỡ</button>
                    </div>
                `;
            } else {
                slotEl.innerHTML = `
                    <div class="skill-slot-card empty" onclick="gameUI.openSkillSelectModal(${i})">
                        <span class="skill-icon">➕</span>
                        <div class="skill-meta">
                            <strong>Ô Kỹ Năng ${i + 1}</strong>
                            <small>Bấm để gán bí tịch</small>
                        </div>
                    </div>
                `;
            }
        }
    }

    renderSkillsTab() {
        this.renderEquippedSkills();

        // Danh Sách Kỹ Năng Đã Học
        const learnedListEl = document.getElementById("learned-skill-list");
        if (learnedListEl) {
            learnedListEl.innerHTML = "";
            this.player.learnedSkills.forEach(skillId => {
                const skill = SkillSystem.getSkillById(skillId);
                if (!skill) return;

                const card = document.createElement("div");
                card.className = "skill-card-item";
                card.style.cursor = "pointer";
                card.setAttribute("onmouseenter", `gameUI.showSkillTooltip(event, '${skill.id}')`);
                card.setAttribute("onmousemove", `gameUI.moveItemTooltip(event)`);
                card.setAttribute("onmouseleave", `gameUI.hideItemTooltip()`);
                const isEquipped = this.player.equippedSkills.includes(skillId);

                card.innerHTML = `
                    <div class="skill-card-top">
                        <span class="skill-icon-big">${skill.icon}</span>
                        <div>
                            <strong>${skill.name}</strong>
                            <div class="skill-badges">
                                <span class="badge-${skill.type}">${skill.type.toUpperCase()}</span>
                                <span class="badge-cd">⏳ ${skill.cooldown}s</span>
                            </div>
                        </div>
                    </div>
                    <p class="skill-desc">${skill.desc}</p>
                    <div class="skill-actions">
                        ${isEquipped
                        ? `<span class="badge-equipped">✓ Đang Trang Bị</span>`
                        : `<button class="btn-sm btn-primary" onclick="gameUI.quickEquipSkill('${skill.id}')">Gắn Vào Trận</button>`
                    }
                    </div>
                `;
                learnedListEl.appendChild(card);
            });
        }

        // TÀNG KINH CÁC (NPC BÁN BÍ KÍP)
        this.renderTangKinhCac();
    }

    renderTangKinhCac() {
        const npcShopEl = document.getElementById("npc-skill-shop-list");
        if (!npcShopEl) return;

        const allSkills = SkillSystem.getAllSkills();

        // Lọc kỹ năng theo các tiêu chí
        const filteredSkills = allSkills.filter(skill => {
            // Lọc theo Loại / Hệ Kỹ Năng
            if (this.skillFilterType !== "all" && skill.type !== this.skillFilterType) {
                return false;
            }

            // Lọc theo Cấp Độ / Cảnh Giới
            if (this.skillFilterRealm !== "all") {
                if (this.skillFilterRealm === "current") {
                    if (skill.reqRealm > this.player.realmIndex) return false;
                } else {
                    if (skill.reqRealm !== parseInt(this.skillFilterRealm, 10)) return false;
                }
            }

            // Lọc theo Trạng Thái
            const learned = this.player.learnedSkills.includes(skill.id);
            const canLearn = SkillSystem.canUseSkill(this.player.realmIndex, this.player.tierIndex, skill.id);

            if (this.skillFilterStatus === "learned" && !learned) return false;
            if (this.skillFilterStatus === "unlearned" && learned) return false;
            if (this.skillFilterStatus === "can_learn" && (learned || !canLearn)) return false;

            // Lọc theo Ô Tìm Kiếm
            if (this.skillSearchQuery) {
                const q = this.skillSearchQuery.toLowerCase();
                const matchName = skill.name.toLowerCase().includes(q);
                const matchDesc = (skill.desc || "").toLowerCase().includes(q);
                if (!matchName && !matchDesc) return false;
            }

            return true;
        });

        // Cập nhật số lượng hiển thị
        const counterEl = document.getElementById("skill-counter-text");
        if (counterEl) {
            counterEl.innerText = `Đang hiển thị: ${filteredSkills.length} / ${allSkills.length} bí kíp`;
        }

        if (filteredSkills.length === 0) {
            npcShopEl.innerHTML = `
                <div class="shop-empty-state">
                    <div class="shop-empty-icon">📜</div>
                    <div class="shop-empty-title">Không tìm thấy bí kíp phù hợp!</div>
                    <div class="shop-empty-desc">Thử điều chỉnh lại bộ lọc hệ, cảnh giới hoặc từ khóa tìm kiếm.</div>
                    <button class="btn-sm btn-primary" onclick="gameUI.resetSkillFilters()">Đặt Lại Bộ Lọc</button>
                </div>
            `;
            return;
        }

        npcShopEl.innerHTML = "";
        filteredSkills.sort((a, b) => SkillSystem.compareSkills(a, b));
        filteredSkills.forEach(skill => {
            const learned = this.player.learnedSkills.includes(skill.id);
            const canLearn = SkillSystem.canUseSkill(this.player.realmIndex, this.player.tierIndex, skill.id);
            const reqTitle = RealmSystem.getFullRealmTitle(skill.reqRealm, skill.reqTier);

            const typeNames = {
                vat_li: "Vật Lí",
                phep: "Pháp Thuật",
                ho_the: "Hộ Thể",
                tri_lieu: "Trị Liệu"
            };

            const card = document.createElement("div");
            card.className = `skill-shop-card ${learned ? "learned" : canLearn ? "available" : "locked"}`;
            card.setAttribute("onmouseenter", `gameUI.showSkillTooltip(event, '${skill.id}')`);
            card.setAttribute("onmousemove", `gameUI.moveItemTooltip(event)`);
            card.setAttribute("onmouseleave", `gameUI.hideItemTooltip()`);
            card.style.cursor = "pointer";

            card.innerHTML = `
                <div class="skill-shop-header">
                    <span class="skill-shop-icon">${skill.icon}</span>
                    <div>
                        <h4 class="skill-shop-name">${skill.name}</h4>
                        <span class="badge-${skill.type}">${typeNames[skill.type] || skill.type.toUpperCase()}</span>
                    </div>
                </div>
                <p class="skill-shop-desc">${skill.desc}</p>
                <div class="skill-shop-req">
                    Yêu cầu Cảnh Giới: <strong style="color: ${canLearn ? '#4caf50' : '#ff5252'}">${reqTitle}</strong>
                </div>
                <div class="skill-shop-footer">
                    <span class="skill-price">💎 ${this.formatNumber(skill.price)} Linh Thạch</span>
                    ${learned
                    ? `<button class="btn-sm btn-disabled" disabled>Đã Lĩnh Ngộ</button>`
                    : canLearn
                        ? `<button class="btn-sm btn-success" onclick="event.stopPropagation(); gameUI.buySkill('${skill.id}')">Học Bí Kíp</button>`
                        : `<button class="btn-sm btn-disabled" disabled>Cảnh Giới Chưa Đủ</button>`
                }
                </div>
            `;
            npcShopEl.appendChild(card);
        });
    }

    resetSkillFilters() {
        this.skillFilterType = "all";
        this.skillFilterRealm = "all";
        this.skillFilterStatus = "all";
        this.skillSearchQuery = "";

        document.querySelectorAll("#skill-type-buttons .shop-type-btn").forEach(b => {
            b.classList.toggle("active", b.dataset.skilltype === "all");
        });

        const realmSelect = document.getElementById("skill-realm-select");
        if (realmSelect) realmSelect.value = "all";

        const statusSelect = document.getElementById("skill-status-select");
        if (statusSelect) statusSelect.value = "all";

        const searchInput = document.getElementById("skill-search-input");
        if (searchInput) searchInput.value = "";

        const clearBtn = document.getElementById("btn-clear-skill-search");
        if (clearBtn) clearBtn.style.display = "none";

        this.sound.playClick();
        this.renderTangKinhCac();
    }

    buySkill(skillId) {
        this.hideItemTooltip(); // Cưỡng chế ẩn tooltip
        const res = this.player.learnSkill(skillId);
        if (res && res.success) {
            this.sound.playBreakthrough();
            this.showToast(`Chúc mừng! Đã lĩnh ngộ bí kíp [${res.skill.name}]!`, "success");

            // Kiểm tra mở khóa danh hiệu kỹ năng (ví dụ: Vạn Pháp Thông Tri)
            if (typeof TitleSystem !== "undefined") {
                const newTitles = TitleSystem.checkAndUnlockTitles(this.player);
                if (newTitles.length > 0) {
                    newTitles.forEach(t => {
                        this.showToast(`🎖️ CHÚC MỪNG! Đạo hữu đã đạt Danh Hiệu: [${t.name}]!`, "breakthrough");
                    });
                }
            }

            this.renderSkillsTab();
            this.updateHeaderInfo();
            StorageSystem.save(this.player);
        } else {
            this.showToast(res ? res.msg : "Không thể học bí kíp!", "error");
        }
    }

    unequipSkill(slotIndex) {
        this.player.unequipSkill(slotIndex);
        this.sound.playClick();
        this.renderCharacterTab();
        this.renderSkillsTab();
        StorageSystem.save(this.player);
    }

    quickEquipSkill(skillId) {
        // Tìm ô trống đầu tiên
        let emptyIdx = this.player.equippedSkills.indexOf(null);
        if (emptyIdx === -1) emptyIdx = 0; // Thay ô 1 nếu đầy

        this.player.equipSkill(skillId, emptyIdx);
        this.sound.playEquip();
        this.showToast(`Đã gắn bí tịch vào Ô ${emptyIdx + 1}!`, "success");
        this.renderCharacterTab();
        this.renderSkillsTab();
        StorageSystem.save(this.player);
    }

    openSkillSelectModal(slotIndex) {
        this.selectedSkillSlot = slotIndex;
        const modal = document.getElementById("skill-select-modal");
        const listEl = document.getElementById("skill-select-modal-list");
        if (!modal || !listEl) return;

        listEl.innerHTML = "";
        const userSkills = this.player.learnedSkills
            .map(skillId => SkillSystem.getSkillById(skillId))
            .filter(Boolean)
            .sort((a, b) => SkillSystem.compareSkills(a, b));

        userSkills.forEach(skill => {
            const itemEl = document.createElement("div");
            itemEl.className = "skill-select-modal-item";
            itemEl.innerHTML = `
                <span>${skill.icon} ${skill.name} (${skill.type.toUpperCase()})</span>
                <button class="btn-sm btn-primary">Chọn</button>
            `;
            itemEl.addEventListener("click", () => {
                this.player.equipSkill(skill.id, this.selectedSkillSlot);
                this.sound.playEquip();
                modal.style.display = "none";
                this.renderSkillsTab();
                StorageSystem.save(this.player);
            });
            listEl.appendChild(itemEl);
        });

        modal.style.display = "flex";
    }

    // ================= TAB BÁCH BẢO CÁC (SHOP TRANG BỊ & ĐAN DƯỢC) =================

    resetShopFilters() {
        this.shopFilterType = "all";
        this.shopFilterRealm = "all";
        this.shopFilterRarity = "all";
        this.shopSearchQuery = "";

        // Reset UI controls
        document.querySelectorAll(".shop-type-btn").forEach(b => {
            b.classList.toggle("active", b.dataset.type === "all");
        });
        const realmSel = document.getElementById("shop-realm-select");
        if (realmSel) realmSel.value = "all";
        const raritySel = document.getElementById("shop-rarity-select");
        if (raritySel) raritySel.value = "all";
        const searchInput = document.getElementById("shop-search-input");
        if (searchInput) searchInput.value = "";
        const clearBtn = document.getElementById("btn-clear-shop-search");
        if (clearBtn) clearBtn.style.display = "none";

        this.sound.playClick();
        this.renderShopTab();
    }

    renderShopTab() {
        const shopListEl = document.getElementById("shop-item-list");
        if (!shopListEl) return;

        const allItems = ITEM_DATABASE;
        const filtered = allItems.filter(item => {
            // 0. Không bán các vật phẩm rơi độc quyền hoặc không có giá mua
            if (item.notForSale || !item.price || item.price <= 0) {
                return false;
            }

            // 1. Lọc theo Loại item (vukhi, giap, non, dan_duoc)
            if (this.shopFilterType !== "all" && item.slot !== this.shopFilterType) {
                return false;
            }

            // 2. Lọc theo Cấp độ / Cảnh giới yêu cầu
            if (this.shopFilterRealm === "current") {
                // Phù hợp cảnh giới hiện tại và lân cận
                if (item.reqRealm > this.player.realmIndex + 1) return false;
            } else if (this.shopFilterRealm !== "all") {
                if (item.reqRealm !== parseInt(this.shopFilterRealm, 10)) return false;
            }

            // 3. Lọc theo Phẩm cấp
            if (this.shopFilterRarity !== "all" && item.rarity !== this.shopFilterRarity) {
                return false;
            }

            // 4. Lọc theo Ô tìm kiếm
            if (this.shopSearchQuery && this.shopSearchQuery.trim()) {
                const q = this.shopSearchQuery.trim().toLowerCase();
                const matchName = item.name.toLowerCase().includes(q);
                const matchDesc = (item.desc || "").toLowerCase().includes(q);
                if (!matchName && !matchDesc) return false;
            }

            return true;
        });

        // Cập nhật số lượng vật phẩm đang hiển thị
        const counterEl = document.getElementById("shop-counter-text");
        if (counterEl) {
            counterEl.innerText = `Đang hiển thị: ${filtered.length} / ${allItems.length} vật phẩm`;
        }

        shopListEl.innerHTML = "";

        if (filtered.length === 0) {
            shopListEl.innerHTML = `
                <div class="shop-empty-state">
                    <div class="shop-empty-icon">📭</div>
                    <div class="shop-empty-title">Không tìm thấy linh bảo nào!</div>
                    <div class="shop-empty-desc">Không có vật phẩm nào khớp với bộ lọc hiện tại. Thử chọn loại khác hoặc đặt lại bộ lọc.</div>
                    <button type="button" class="btn-sm btn-primary" onclick="gameUI.resetShopFilters()">🔄 Đặt Lại Bộ Lọc</button>
                </div>
            `;
            return;
        }

        const slotNames = { non: "NÓN", giap: "GIÁP", vukhi: "VŨ KHÍ", dan_duoc: "ĐAN DƯỢC" };

        filtered.sort((a, b) => ItemSystem.compareItems(a, b));
        filtered.forEach(item => {
            const rarity = ItemSystem.getRarity(item.rarity);
            const isHonNguyen = item.currency === "hon_nguyen";
            const canAfford = isHonNguyen ? (this.player.honNguyen || 0) >= item.price : (this.player.linhThach >= item.price);
            const reqRealmObj = RealmSystem.getRealm(item.reqRealm);
            const reqRealmTitle = reqRealmObj ? reqRealmObj.name : "Phàm Nhân";
            const isRealmOk = this.player.realmIndex >= item.reqRealm;

            const card = document.createElement("div");
            card.className = `shop-item-card rarity-${item.rarity}`;
            card.style.borderColor = rarity.border;

            let statsDesc = "";
            if (item.stats) {
                const parts = [];
                if (item.stats.mau) parts.push(`HP +${item.stats.mau}`);
                if (item.stats.vatLi) parts.push(`V.Lí +${item.stats.vatLi}`);
                if (item.stats.phep) parts.push(`Phép +${item.stats.phep}`);
                if (item.stats.phongThu) parts.push(`Thủ +${item.stats.phongThu}`);
                if (item.stats.khangPhep) parts.push(`K.Phép +${item.stats.khangPhep}`);
                if (item.stats.baoKich) parts.push(`Bạo +${item.stats.baoKich}%`);
                statsDesc = parts.join(", ");
            } else if (item.rateGain) {
                statsDesc = `+${item.rateGain}% Tỉ Lệ Độ Kiếp (Cảnh giới hiện tại)`;
            } else if (item.tinhNguyenGain) {
                statsDesc = `+${this.formatNumber(item.tinhNguyenGain)} 🌌 Tinh Nguyên Đại Đạo`;
            } else if (item.tuViGain) {
                statsDesc = `+${this.formatNumber(item.tuViGain)} Tu Vi tức thì`;
            } else if (item.isResetPill) {
                statsDesc = "Tẩy lại toàn bộ điểm tiềm năng";
            }

            const currIcon = isHonNguyen ? "🌀" : "💎";
            const currName = isHonNguyen ? "Hỗn Nguyên" : "Linh Thạch";

            let buyActionsHtml = "";
            if (item.slot === "dan_duoc" && !item.isResetPill && !item.isRenameScroll) {
                const balance = isHonNguyen ? (this.player.honNguyen || 0) : this.player.linhThach;
                const canAfford5 = balance >= (item.price * 5);
                const canAfford10 = balance >= (item.price * 10);
                const maxAffordable = Math.floor(balance / item.price);
                buyActionsHtml = `
                    <div class="shop-pill-actions" style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap;">
                        <button class="btn-sm btn-primary" onclick="gameUI.buyShopItem('${item.id}', 1)" ${canAfford ? "" : "disabled"} title="${canAfford ? 'Mua 1 viên' : 'Thiếu ' + currName}">
                            ${canAfford ? "Mua 1" : "Thiếu " + currIcon}
                        </button>
                        <button class="btn-sm btn-secondary" onclick="gameUI.buyShopItem('${item.id}', 10)" ${canAfford10 ? "" : "disabled"} title="${canAfford10 ? 'Mua 10 viên (' + this.formatNumber(item.price * 10) + ' ' + currIcon + ')' : 'Không đủ ' + currName + ' mua 10'}">
                            x10
                        </button>
                        <button class="btn-sm btn-gold btn-buy-max" onclick="gameUI.handleBuyMaxPill('${item.id}')" ${canAfford ? "" : "disabled"} title="${canAfford ? 'Mua tối đa ' + this.formatNumber(maxAffordable) + ' viên với số dư hiện có' : 'Không đủ ' + currName}">
                            ⚡ Mua Hết
                        </button>
                    </div>
                `;
            } else {
                buyActionsHtml = `
                    <button class="btn-sm btn-primary" onclick="gameUI.buyShopItem('${item.id}', 1)" ${canAfford ? "" : "disabled"} title="${canAfford ? 'Mua vật phẩm này' : 'Không đủ ' + currName}">
                        ${canAfford ? "Mua" : "Thiếu " + currIcon}
                    </button>
                `;
            }

            card.innerHTML = `
                    <div class="shop-card-top">
                        <span class="shop-item-icon">${item.icon}</span>
                        <div style="flex: 1;">
                            <strong style="color: ${rarity.color}">${item.name}</strong>
                            <div class="rarity-tag" style="display: flex; gap: 6px; align-items: center; margin-top: 2px;">
                                <span style="color:${rarity.color}">${rarity.name}</span>
                                <span>•</span>
                                <span style="color:#94a3b8">${slotNames[item.slot] || item.slot.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                    <div class="shop-item-stats">${statsDesc}</div>
                    <p class="shop-item-desc">${item.desc}</p>
                    <div class="shop-item-req">
                        Yêu cầu: <strong style="color:${isRealmOk ? '#4caf50' : '#ff7675'}">${reqRealmTitle}</strong>
                        ${!isRealmOk ? `<span style="color:#ff7675; font-size:10px; margin-left:4px;">(Chưa đủ tu vi mặc)</span>` : ""}
                    </div>
                    <div class="shop-card-bottom">
                        <span class="price-tag" ${isHonNguyen ? 'style="color: #c7d2fe;"' : ''}>${currIcon} ${this.formatNumber(item.price)} ${currName}</span>
                        ${buyActionsHtml}
                    </div>
                `;
            shopListEl.appendChild(card);
        });
    }

    buyShopItem(itemId, quantity = 1) {
        this.hideItemTooltip(); // Cưỡng chế ẩn tooltip
        const res = this.player.buyItem(itemId, quantity);
        if (res && res.success) {
            this.sound.playEquip();
            if (quantity > 1) {
                this.showToast(`Đã mua ${quantity}x [${res.item.name}], cất vào túi đồ!`, "success");
            } else {
                this.showToast(`Đã mua [${res.item.name}], cất vào túi đồ!`, "success");
            }
            this.renderShopTab();
            this.updateHeaderInfo();
            StorageSystem.save(this.player);
        } else {
            this.showToast(res ? res.msg : "Giao dịch thất bại!", "error");
        }
    }

    handleBuyMaxPill(itemId) {
        this.hideItemTooltip();
        const res = this.player.buyMaxPill(itemId);
        if (res && res.success) {
            this.sound.playEquip();
            const currencyName = res.currency === "hon_nguyen" ? "🌀 Hỗn Nguyên Thạch" : "💎 Linh Thạch";
            this.showToast(`Đã mua tối đa ${this.formatNumber(res.count)}x [${res.item.name}], tiêu hao ${this.formatNumber(res.totalCost)} ${currencyName}!`, "success");
            this.renderShopTab();
            this.updateHeaderInfo();
            if (typeof StorageSystem !== "undefined") {
                StorageSystem.save(this.player);
            }
        } else {
            this.showToast(res ? res.msg : "Không thể mua hết đan dược!", "error");
        }
    }

    // ================= TIỆM QUY ĐỔI HỖN NGUYÊN THẠCH =================

    handleExchangeLinhThach(amount = 1) {
        const res = this.player.exchangeLinhThachToHonNguyen(amount);
        if (res.success) {
            this.sound.playBreakthrough();
            this.showToast(res.msg, "success");
            this.updateHeaderInfo();
            this.renderShopTab();
            StorageSystem.save(this.player);
        } else {
            this.showToast(res.msg, "warning");
        }
    }

    handleExchangeHonNguyen(amount = 1) {
        const res = this.player.exchangeHonNguyenToLinhThach(amount);
        if (res.success) {
            this.sound.playEquip();
            this.showToast(res.msg, "success");
            this.updateHeaderInfo();
            this.renderShopTab();
            StorageSystem.save(this.player);
        } else {
            this.showToast(res.msg, "warning");
        }
    }

    handleExchangeAllLinhThach() {
        const res = this.player.exchangeAllLinhThachToHonNguyen();
        if (res.success) {
            this.sound.playBreakthrough();
            this.showToast(res.msg, "success");
            this.updateHeaderInfo();
            this.renderShopTab();
            StorageSystem.save(this.player);
        } else {
            this.showToast(res.msg, "warning");
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
                effectHtml = `<div class="tooltip-stat-badge"><span>💚 Hiệu Quả Hồi Máu:</span> <strong>${Math.round(skill.multiplier * 100)}% Công Phép</strong></div>`;
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
