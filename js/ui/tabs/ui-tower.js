/**
 * PHÂN HỆ GIAO DIỆN TAB HƯ KHÔNG THÁP (UI TOWER TAB)
 * Tách từ ui.js - Gắn vào UIController.prototype
 */

(function() {
    const target = (typeof window !== "undefined" && window.UIController)
        ? window.UIController
        : (typeof global !== "undefined" && global.UIController
            ? global.UIController
            : (typeof UIController !== "undefined" ? UIController : null));
    if (!target) return;

    Object.assign(target.prototype, {
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

            // Đồng bộ giá vé động từ ItemSystem / TOWER_CONFIG (5.000 Hỗn Nguyên)
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
                    const sweepData = TowerSystem.calculateSweepRewards(tower.highestFloor, this.player.isVoCuc);
                    if (sweepData) {
                        sweepPreviewEl.style.display = "block";
                        let sweepLinhThachText = "";
                        if (sweepData.totalHonNguyen > 0) {
                            sweepLinhThachText = `<strong>+${this.formatNumber(sweepData.totalHonNguyen)} 🌀 Hỗn Nguyên</strong> • <strong>+${this.formatNumber(sweepData.totalLinhThach)} 💎 Linh Thạch</strong>`;
                        } else {
                            sweepLinhThachText = `<strong>+${this.formatNumber(sweepData.totalLinhThach)} Linh Thạch</strong>`;
                        }

                        let sweepExpText = "";
                        if (this.player.isVoCuc) {
                            sweepExpText = `<strong style="color:#c084fc;">+${this.formatNumber(sweepData.totalTinhNguyen)} 🌌 Tinh Nguyên</strong>`;
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
        },

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
        },

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
        },

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
        },

        startTowerBattle(floor) {
            if (typeof this.clearAutoRepeatTimer === "function") {
                this.clearAutoRepeatTimer();
            }
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
            if (typeof this.renderCombatSkillsUI === "function") {
                this.renderCombatSkillsUI();
            }

            // Xóa log cũ
            const logBox = document.getElementById("combat-log-list");
            if (logBox) logBox.innerHTML = "";

            // Bắt đầu trận
            this.combat.startBattle(stage, (result) => {
                if (typeof this.handleBattleEnd === "function") {
                    this.handleBattleEnd(result);
                }
            });
        },

        nextTowerBattle(floor) {
            this.clearTowerAutoClimbTimer();
            const modal = document.getElementById("battle-result-modal");
            if (modal) modal.style.display = "none";

            if (this.player.towerData.dailyTickets <= 0) {
                this.promptBuyTicketAndBattle(floor);
                return;
            }

            this.startTowerBattle(floor);
        },

        retryTowerBattle(floor) {
            this.clearTowerAutoClimbTimer();
            const modal = document.getElementById("battle-result-modal");
            if (modal) modal.style.display = "none";

            if (this.player.towerData.dailyTickets <= 0) {
                this.promptBuyTicketAndBattle(floor);
                return;
            }

            this.startTowerBattle(floor);
        },

        closeTowerBattle() {
            this.clearTowerAutoClimbTimer();
            const modal = document.getElementById("battle-result-modal");
            if (modal) modal.style.display = "none";
            this.switchTab("tower");
        },

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
        },

        clearTowerAutoClimbTimer() {
            if (this.towerAutoClimbInterval) {
                clearInterval(this.towerAutoClimbInterval);
                this.towerAutoClimbInterval = null;
            }
        },

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
        },

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

            const sweepData = TowerSystem.calculateSweepRewards(this.player.towerData.highestFloor, this.player.isVoCuc);
            if (!sweepData) return;

            let rewardPrompt = "";
            if (this.player.isVoCuc) {
                rewardPrompt += `🌌 Tinh Nguyên: +${this.formatNumber(sweepData.totalTinhNguyen)}\n`;
            } else {
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
            if (this.player.isVoCuc) {
                this.player.addTinhNguyen(sweepData.totalTinhNguyen);
            } else {
                this.player.addTuVi(sweepData.totalTuVi);
            }
            this.player.linhThach = (this.player.linhThach || 0) + sweepData.totalLinhThach;
            if (sweepData.totalHonNguyen) {
                this.player.honNguyen = (this.player.honNguyen || 0) + sweepData.totalHonNguyen;
            }

            this.sound.playVictory();
            let toastMsg = `⚡ Quét nhanh thành công Tầng 1 -> ${sweepData.toFloor}! Nhận `;
            if (this.player.isVoCuc) {
                toastMsg += `+${this.formatNumber(sweepData.totalTinhNguyen)} 🌌 Tinh Nguyên, `;
            } else {
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
        },

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
    });
})();
