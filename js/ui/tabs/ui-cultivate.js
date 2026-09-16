/**
 * PHÂN HỆ GIAO DIỆN TAB TU LUYỆN (UI CULTIVATION TAB)
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
            const gate = this.player.getBreakthroughGate ? this.player.getBreakthroughGate() : { blocked: false };
            const hasClearedVoCuc = this.player.clearedStages && this.player.clearedStages.includes("stage_vo_cuc");
            const isAtVoCucBottleneck = gate.isVoCucBlocked;
            const isAtVanThienDiaBottleneck = gate.isVanThienDiaBlocked;
            const currentMilestone = gate.milestone || 0;

            if (this.player.isVoCuc) {
                let reqVoCucNote = "";
                if (!hasClearedVoCuc) {
                    reqVoCucNote = `<div style="font-size:12px; color:#ff5252; margin-top:6px;">🛑 <strong>BÌNH CẢNH:</strong> Đạo hạnh đã chạm trần cảnh giới thế tục! Phải khiêu chiến và đánh bại [Ải 22: Hư Vô Bản Nguyên Cảnh] mới có thể bước vào Vô Cực.</div>`;
                } else if (isAtVanThienDiaBottleneck) {
                    reqVoCucNote = `<div style="font-size:12px; color:#ff5252; margin-top:6px;">🛑 <strong>THIÊN ĐỊA BÌNH CẢNH:</strong> Đạo hữu đã đạt mốc Tầng ${currentMilestone * 100}! Phải trảm sát Boss [Ải 23: Vấn Thiên Địa] (Mốc ${currentMilestone * 100} Tầng) để phá vỡ gông cùm thiên địa mới có thể tiếp tục tăng tầng.</div>`;
                } else {
                    const nextMilestoneTier = (Math.floor(this.player.tierIndex / 100) + 1) * 100;
                    reqVoCucNote = `<div style="font-size:12px; color:#00e676; margin-top:6px;">🌌 <strong>ĐẠI THÀNH VÔ CỰC:</strong> Đã giải trừ gông cùm thiên đạo! Mỗi lần đột phá cần Tinh Nguyên Đại Đạo. (Bình cảnh kế tiếp: Tầng ${nextMilestoneTier})</div>`;
                }
                const progressPct = Math.min(100, Math.floor(((this.player.tinhNguyen || 0) / maxTuVi) * 100));

                if (realmNameEl) realmNameEl.innerText = `🌌 Vô Cực - Tầng ${this.player.tierIndex + 1}`;
                if (realmHanziEl) realmHanziEl.innerText = "无极";
                if (realmDescEl) {
                    realmDescEl.innerHTML = `Vượt thoát khỏi luân hồi 9 cảnh giới, tu vi hóa thành Tinh Nguyên Đại Đạo vô tận.${reqVoCucNote}`;
                }
                if (afkRateEl) {
                    afkRateEl.innerHTML = `Linh Khí Treo Máy: <strong>+${this.formatNumber(afkRate)}</strong> Tu Vi/giây <br><small style="color:var(--text-muted); font-size:11px;">(Tích lũy 1 Tỷ Tu Vi tự động ngưng tụ thành +1 Tinh Nguyên: ${(this.player.vocucPendingTuVi || 0).toLocaleString("vi-VN")} / 1.000.000.000)</small>`;
                }
                if (tuViTextEl) {
                    tuViTextEl.innerHTML = `Tinh Nguyên Đại Đạo: <strong>${(this.player.tinhNguyen || 0).toLocaleString("vi-VN")}</strong> / ${maxTuVi.toLocaleString("vi-VN")} 🌌`;
                }
                if (progressBarEl) {
                    progressBarEl.style.width = `${progressPct}%`;
                    progressBarEl.style.background = "linear-gradient(90deg, #9c27b0, #00e5ff)";
                }
                if (btnBreakthrough) {
                    const can = this.player.canBreakthrough();
                    btnBreakthrough.disabled = !can;
                    if (isAtVoCucBottleneck && !hasClearedVoCuc) {
                        btnBreakthrough.innerText = "🔒 Bình Cảnh Ải 22 (Chưa Mở)";
                        btnBreakthrough.className = "btn-primary btn-cultivate btn-blocked";
                    } else if (isAtVanThienDiaBottleneck) {
                        btnBreakthrough.innerText = `🔒 Chặn Mốc Tầng ${currentMilestone * 100} (Cần Hạ Ải 23)`;
                        btnBreakthrough.className = "btn-primary btn-cultivate btn-blocked";
                    } else {
                        btnBreakthrough.innerText = can ? "🌌 Thăng Hoa Vô Cực" : "Tích Tụ Tinh Nguyên";
                        btnBreakthrough.className = "btn-primary btn-cultivate";
                    }
                }
            } else if (this.player.realmIndex >= 11 && this.player.tierIndex >= 99) {
                let reqVoCucNote = "";
                if (!hasClearedVoCuc) {
                    reqVoCucNote = `<div style="font-size:12px; color:#ff5252; margin-top:6px;">🛑 <strong>BÌNH CẢNH TU LAO:</strong> Đã đạt Đỉnh Phong Tầng 100! Phải đánh bại [Ải 22: Hư Vô Bản Nguyên Cảnh] mới có thể thăng hoa bước vào Cảnh Giới Vô Cực.</div>`;
                } else {
                    reqVoCucNote = `<div style="font-size:12px; color:#00e676; margin-top:6px;">✨ <strong>ĐÃ QUA KHẢO NGHIỆM:</strong> Đã hạ gục Bản Nguyên Chi Linh Ải 22, có thể thăng hoa bước vào Cảnh Giới Vô Cực!</div>`;
                }
                const progressPct = Math.min(100, Math.floor((this.player.tuVi / maxTuVi) * 100));

                if (realmNameEl) realmNameEl.innerText = `${realm.name} - ${tierName}`;
                if (realmHanziEl) realmHanziEl.innerText = realm.hanzi;
                if (realmDescEl) {
                    realmDescEl.innerHTML = `${realm.desc}${reqVoCucNote}`;
                }
                if (afkRateEl) afkRateEl.innerHTML = `Tốc Độ Đả Tọa: <strong>+${this.formatNumber(afkRate)}</strong> Tu Vi/giây`;
                if (tuViTextEl) {
                    tuViTextEl.innerHTML = `Tu Vi: <strong>${this.formatNumber(this.player.tuVi)}</strong> / ${this.formatNumber(maxTuVi)}`;
                }
                if (progressBarEl) {
                    progressBarEl.style.width = `${progressPct}%`;
                    progressBarEl.style.background = "linear-gradient(90deg, var(--gold), #ff7675)";
                }
                if (btnBreakthrough) {
                    const can = this.player.canBreakthrough();
                    btnBreakthrough.disabled = !can;
                    if (!hasClearedVoCuc) {
                        btnBreakthrough.innerText = "🔒 Chặn Bình Cảnh Ải 22";
                        btnBreakthrough.className = "btn-primary btn-cultivate btn-blocked";
                    } else {
                        btnBreakthrough.innerText = can ? "🌌 Thăng Hoa Vô Cực" : "Tu Vi Chưa Đủ";
                        btnBreakthrough.className = "btn-primary btn-cultivate";
                    }
                }
            } else {
                const progressPct = Math.min(100, Math.floor((this.player.tuVi / maxTuVi) * 100));

                if (realmNameEl) realmNameEl.innerText = `${realm.name} - ${tierName}`;
                if (realmHanziEl) realmHanziEl.innerText = realm.hanzi;
                if (realmDescEl) {
                    realmDescEl.innerHTML = `${realm.desc}${reqStageNote}`;
                }
                if (afkRateEl) afkRateEl.innerHTML = `Tốc Độ Đả Tọa: <strong>+${this.formatNumber(afkRate)}</strong> Tu Vi/giây`;
                if (tuViTextEl) {
                    tuViTextEl.innerHTML = `Tu Vi: <strong>${this.formatNumber(this.player.tuVi)}</strong> / ${this.formatNumber(maxTuVi)}`;
                }
                if (progressBarEl) {
                    progressBarEl.style.width = `${progressPct}%`;
                    progressBarEl.style.background = "linear-gradient(90deg, var(--gold), #00e676)";
                }
                if (btnBreakthrough) {
                    const can = this.player.canBreakthrough();
                    btnBreakthrough.disabled = !can;
                    btnBreakthrough.innerText = can ? "Đột Phá Cảnh Giới" : "Tu Vi Chưa Đủ";
                    btnBreakthrough.className = "btn-primary btn-cultivate";
                }
            }

            // Đồng bộ trạng thái nút Đột Phá Nhanh
            if (btnQuickBreakthrough) {
                const canQuick = this.player.canBreakthrough() && (!isAtVoCucBottleneck || hasClearedVoCuc) && (!isAtVanThienDiaBottleneck);
                btnQuickBreakthrough.disabled = !canQuick;
            }

            // Hiển thị Danh hiệu hiện tại ở Badge bên dưới tên cảnh giới
            const titleBadgeEl = document.getElementById("cultivate-title-badge");
            if (titleBadgeEl) {
                if (this.player.equippedTitle && typeof TitleSystem !== "undefined") {
                    const titleObj = TitleSystem.getTitleById(this.player.equippedTitle);
                    if (titleObj) {
                        const rarity = titleObj.rarity || "pham";
                        titleBadgeEl.className = `character-title-tag title-rarity-${rarity}`;
                        titleBadgeEl.innerHTML = `<span>${titleObj.icon || "🎖️"}</span> <span>${titleObj.name}</span>`;
                    } else {
                        titleBadgeEl.className = `character-title-tag title-rarity-pham`;
                        titleBadgeEl.innerHTML = `<span>🎖️</span> <span>Chọn Danh Hiệu</span>`;
                    }
                } else {
                    titleBadgeEl.className = `character-title-tag title-rarity-pham`;
                    titleBadgeEl.innerHTML = `<span>🎖️</span> <span>Chọn Danh Hiệu</span>`;
                }
            }
        },

        handleBreakthrough() {
            const gate = this.player.getBreakthroughGate();
            if (gate.blocked) {
                this.showToast(`⚠️ ${gate.msg}`, "warning", "toast-breakthrough");
                this.switchTab("stages");
                return;
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
                this.showToast(result && result.msg ? result.msg : "Chưa tích tụ đủ linh lực để đột phá!", "warning", "toast-breakthrough");
            }
        },

        handleQuickBreakthrough() {
            const gate = this.player.getBreakthroughGate();
            if (gate.blocked) {
                this.showToast(`⚠️ ${gate.msg}`, "warning");
                this.switchTab("stages");
                return;
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
    });
})();
