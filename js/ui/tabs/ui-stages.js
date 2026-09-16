/**
 * PHÂN HỆ GIAO DIỆN TAB PHÓ BẢN / VƯỢT ẢI & SÀN ĐẤU 2D (UI STAGES & COMBAT VIEW)
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
        },

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
        },

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
        },

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
                            <div>${this.player.isVoCuc ? `🌌 Tinh Nguyên: <strong style="color: #c084fc;">+${this.formatNumber(result.tinhNguyenGain || (typeof TowerSystem !== "undefined" ? TowerSystem.getFloorTinhNguyen(result.stage.number) : 1))}</strong>` : `✨ Tu Vi Nhận Được: <strong>+${this.formatNumber(result.tuViGain)}</strong>`}</div>
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
        },

        closeBattleResult(gotoStages = false) {
            this.clearAutoRepeatTimer();
            if (typeof this.clearTowerAutoClimbTimer === "function") {
                this.clearTowerAutoClimbTimer();
            }
            const modal = document.getElementById("battle-result-modal");
            if (modal) modal.style.display = "none";
            if (this.combat.isTowerBattle) {
                this.switchTab("tower");
            } else {
                this.switchTab(gotoStages ? "stages" : "character");
            }
        },

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
        },

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
                const modal = document.getElementById("battle-result-modal");
                if (modal && modal.style.display === "flex") {
                    this.startAutoRepeatCountdown();
                }
            } else {
                this.sound.playClick();
                this.showToast("Đã TẮT tự động đánh lại ải!", "info");
                this.clearAutoRepeatTimer();
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
        },

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
        },

        clearAutoRepeatTimer() {
            if (this.autoRepeatInterval) {
                clearInterval(this.autoRepeatInterval);
                this.autoRepeatInterval = null;
            }
        },

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
        },

        cancelAutoRepeat() {
            this.toggleAutoRepeat(false);
        },

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
        },

        updateCombatSpeedBtnUI() {
            const btn = document.getElementById("btn-combat-speed");
            if (!btn) return;

            const speed = this.combat?.speedMultiplier || parseInt(localStorage.getItem("tu_tien_combat_speed") || "1", 10);
            btn.classList.remove("speed-x1", "speed-x2", "speed-x3");
            btn.classList.add(`speed-x${speed}`);
            btn.innerText = `⚡ Tốc Độ: x${speed}`;
            btn.title = `Tốc độ trận đấu: x${speed} (Bấm để đổi x1 -> x2 -> x3)`;
        }
    });
})();
