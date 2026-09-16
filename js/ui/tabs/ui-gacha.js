/**
 * PHÂN HỆ GIAO DIỆN TAB ĐÀI CẦU ĐẠO & ĐẠI THẦN THÔNG (UI GACHA & ULTIMATES TAB)
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
        renderEquippedUltimate() {
            const slotEl = document.getElementById("equipped-ultimate-slot");
            if (!slotEl) return;

            const ultId = this.player.equippedUltimate;
            if (!ultId || typeof UltimateSkillSystem === "undefined") {
                slotEl.innerHTML = `
                    <div class="ultimate-equipped-empty">
                        <p style="margin-bottom: 6px;">Chưa trang bị Đại Thần Thông trấn thân</p>
                        <button class="btn-xs btn-outline-gold" onclick="gameUI.switchTab('gacha')">🔮 Vào Đài Cầu Đạo</button>
                    </div>
                `;
                return;
            }

            const skill = UltimateSkillSystem.getSkill(ultId);
            if (!skill) {
                slotEl.innerHTML = `
                    <div class="ultimate-equipped-empty">
                        <p style="margin-bottom: 6px;">Kỹ năng không tồn tại</p>
                        <button class="btn-xs btn-outline-gold" onclick="gameUI.switchTab('gacha')">🔮 Vào Đài Cầu Đạo</button>
                    </div>
                `;
                return;
            }

            const tier = UltimateSkillSystem.getTier(skill.tier);
            slotEl.innerHTML = `
                <div class="ultimate-equipped-card" style="border-color: ${tier.border}; background: radial-gradient(circle at left, ${tier.bg} 0%, rgba(15, 23, 42, 0.85) 70%);">
                    <div class="ultimate-equipped-icon" style="filter: drop-shadow(0 0 6px ${tier.color});">${skill.icon}</div>
                    <div class="ultimate-equipped-meta">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span class="ultimate-equipped-name" style="color: ${tier.color};">${skill.name}</span>
                            <span class="codex-tier-badge" style="background: ${tier.bg}; color: ${tier.color}; border: 1px solid ${tier.border}; font-size: 9px; padding: 1px 6px;">${tier.name}</span>
                        </div>
                        <span class="ultimate-equipped-short">${skill.shortDesc}</span>
                        <span style="font-size: 10px; color: #ff9100; font-weight: 600;">Tiêu hao: ${skill.rageCost} Nộ Khí</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <button class="btn-xs btn-danger" onclick="gameUI.handleUnequipUltimate()" title="Tháo Đại Thần Thông">Gỡ Ra</button>
                        <button class="btn-xs btn-outline-gold" onclick="gameUI.switchTab('gacha')" title="Đổi chiêu khác">Đổi</button>
                    </div>
                </div>
            `;
        },

        renderGachaTab() {
            if (typeof UltimateSkillSystem === "undefined") return;

            // Tự động thu hồi và nạp toàn bộ Vé Tầm Đạo còn sót trong túi đồ (nếu có) vào quỹ Vé
            const invTickets = (this.player.inventory || []).filter(id => id === "ticket_tam_dao").length;
            if (invTickets > 0) {
                this.player.inventory = this.player.inventory.filter(id => id !== "ticket_tam_dao");
                this.player.addGachaTickets(invTickets);
                if (typeof StorageSystem !== "undefined") StorageSystem.save(this.player);
            }

            // Cập nhật số lượng vé và mảnh cơ duyên
            const ticketsEl = document.getElementById("gacha-tickets-count");
            if (ticketsEl) {
                ticketsEl.innerText = `${this.player.gachaTickets || 0} Vé`;
            }

            // Cập nhật nhãn nút Dùng Hết Vé
            const rollAllDesc = document.getElementById("gacha-roll-all-desc");
            if (rollAllDesc) {
                const curTickets = this.player.gachaTickets || 0;
                rollAllDesc.innerText = curTickets > 0 
                    ? `Tầm đạo toàn bộ (${curTickets > 50 ? 'Tối đa 50/' + curTickets : curTickets} vé)`
                    : `Hết vé (Mua tại Bảo Các)`;
            }

            const shardsEl = document.getElementById("gacha-shards-count");
            const shardsBar = document.getElementById("gacha-shards-bar");
            const shards = this.player.fortuneShards || 0;
            if (shardsEl) {
                shardsEl.innerText = `${shards % 10}/10 Mảnh (Tổng: ${shards})`;
            }
            if (shardsBar) {
                shardsBar.style.width = `${(shards % 10) * 10}%`;
            }

            // Render tiến độ Bảo Hiểm (Pity Trackers)
            const pityThanEl = document.getElementById("gacha-pity-than-count");
            const pityThanBar = document.getElementById("gacha-pity-than-bar");
            const pityThanhEl = document.getElementById("gacha-pity-thanh-count");
            const pityThanhBar = document.getElementById("gacha-pity-thanh-bar");

            const pityThan = this.player.pityThanCount || 0;
            const pityThanh = this.player.pityThanhCount || 0;

            if (pityThanEl) pityThanEl.innerText = `${pityThan} / 500`;
            if (pityThanBar) pityThanBar.style.width = `${Math.min(100, (pityThan / 500) * 100)}%`;

            if (pityThanhEl) pityThanhEl.innerText = `${pityThanh} / 100`;
            if (pityThanhBar) pityThanhBar.style.width = `${Math.min(100, (pityThanh / 100) * 100)}%`;

            // Render Codex 6 Đại Thần Thông
            const gridEl = document.getElementById("gacha-codex-grid");
            if (!gridEl) return;

            const allSkills = UltimateSkillSystem.getAllSkills();
            const unlockedList = this.player.unlockedUltimates || [];
            const equippedId = this.player.equippedUltimate;

            gridEl.innerHTML = allSkills.map(skill => {
                const isUnlocked = unlockedList.includes(skill.id);
                const isEquipped = equippedId === skill.id;
                const tier = UltimateSkillSystem.getTier(skill.tier);
                const tierClass = `tier-${(skill.tier || "linh").toLowerCase()}`;

                let actionBtn = "";
                if (!isUnlocked) {
                    actionBtn = `<button class="btn-xs" style="background: rgba(255,255,255,0.1); color: #64748b; border: 1px solid rgba(255,255,255,0.1); cursor: not-allowed;" disabled>🔒 Chưa Giác Ngộ</button>`;
                } else if (isEquipped) {
                    actionBtn = `<button class="btn-xs" style="background: rgba(255, 215, 0, 0.2); color: #ffd700; border: 1px solid #ffd700;" onclick="gameUI.handleUnequipUltimate()">✓ Đang Xuất Trận (Gỡ)</button>`;
                } else {
                    actionBtn = `<button class="btn-xs btn-primary" onclick="gameUI.handleEquipUltimate('${skill.id}')">⚡ Xuất Trận</button>`;
                }

                return `
                    <div class="codex-card ${tierClass} ${!isUnlocked ? 'is-locked' : ''} ${isEquipped ? 'is-equipped' : ''}">
                        <div class="codex-header">
                            <div class="codex-icon" style="border: 1px solid ${tier.border};">${skill.icon}</div>
                            <div class="codex-title-wrap">
                                <span class="codex-name" style="color: ${tier.color};">${skill.name}</span>
                                <span class="codex-tier-badge" style="background: ${tier.bg}; color: ${tier.color}; border: 1px solid ${tier.border};">${tier.name}</span>
                            </div>
                        </div>
                        <div class="codex-cost">🔥 Tiêu hao Nộ: <strong>${skill.rageCost} Nộ</strong></div>
                        <div class="codex-desc">${skill.detail}</div>
                        <div class="codex-footer">
                            <span style="font-size: 11px; color: ${isUnlocked ? '#4caf50' : '#94a3b8'};">
                                ${isUnlocked ? '✦ Đã Giác Ngộ' : '◇ Chưa Sở Hữu'}
                            </span>
                            ${actionBtn}
                        </div>
                    </div>
                `;
            }).join("");

            // Render Tam Đại Thần Thú Thượng Cổ trong Đài Cầu Đạo
            const petsGridEl = document.getElementById("gacha-pets-codex-grid");
            if (petsGridEl && typeof PetSystem !== "undefined") {
                const allPets = PetSystem.getAllPets();
                petsGridEl.innerHTML = allPets.map(p => {
                    const pData = this.player.pets ? this.player.pets[p.id] : null;
                    const isUnlocked = !!(pData && pData.unlocked);
                    const isActive = this.player.activePetId === p.id;
                    const realm = isUnlocked ? PetSystem.getRealm(pData.realm) : null;

                    let actionBtn = "";
                    if (!isUnlocked) {
                        actionBtn = `<button class="btn-xs" style="background: rgba(255,255,255,0.08); color: #94a3b8; border: 1px solid rgba(255,255,255,0.15); cursor: not-allowed;" disabled>🔒 Chưa Sở Hữu</button>`;
                    } else {
                        actionBtn = `<button class="btn-xs btn-outline-gold" onclick="gameUI.handleViewPetInTab('${p.id}')">🐾 Đến Tab Linh Thú</button>`;
                    }

                    return `
                        <div class="codex-card tier-than ${!isUnlocked ? 'is-locked' : ''} ${isActive ? 'is-equipped' : ''}" style="border-color: ${p.themeColor || '#ffd700'};">
                            <div class="codex-header">
                                <div class="codex-icon" style="border: 1px solid ${p.themeColor || '#ffd700'}; font-size: 28px; filter: drop-shadow(0 0 8px ${p.themeColor});">${p.icon}</div>
                                <div class="codex-title-wrap">
                                    <span class="codex-name" style="color: ${p.themeColor || '#ffd700'}; font-weight: bold;">${p.name}</span>
                                    <span class="codex-tier-badge" style="background: ${p.badgeBg}; color: ${p.themeColor || '#ffd700'}; border: 1px solid ${p.themeColor || '#ffd700'};">${p.roleName}</span>
                                </div>
                            </div>
                            <div class="codex-cost" style="color: #ffd700;">🌟 Phẩm Cấp: <strong>THẦN CẤP (0.2%)</strong> • Hệ: <strong>${p.element}</strong></div>
                            <div class="codex-desc" style="font-size: 12px; line-height: 1.4;">
                                <div style="margin-bottom: 5px;"><strong style="color: #ffd700;">${p.passive.icon} [${p.passive.name}]:</strong> ${p.passive.desc}</div>
                                <div><strong style="color: #00e676;">${p.skill.icon} [${p.skill.name}]:</strong> ${p.skill.desc}</div>
                            </div>
                            <div class="codex-footer">
                                <span style="font-size: 11px; color: ${isUnlocked ? '#4caf50' : '#94a3b8'};">
                                    ${isUnlocked ? `✦ Đã Triệu Hoán (${realm ? realm.name : ''} • ${pData.shards || 0} Mảnh)` : '◇ Chưa Triệu Hoán'}
                                </span>
                                ${actionBtn}
                            </div>
                        </div>
                    `;
                }).join("");
            }
        },

        handleViewPetInTab(petId) {
            this.selectedPetId = petId;
            this.switchTab("pets");
            this.sound.playClick();
        },

        handleEquipUltimate(skillId) {
            if (!this.player.unlockedUltimates.includes(skillId)) {
                this.showToast("Chưa giác ngộ Đại Thần Thông này, không thể xuất trận!", "error");
                return;
            }

            this.player.equipUltimate(skillId);
            const skill = UltimateSkillSystem.getSkill(skillId);
            if (typeof StorageSystem !== "undefined") StorageSystem.save(this.player);
            this.sound.playClick();
            this.showToast(`Đã xuất trận Đại Thần Thông: [${skill ? skill.name : skillId}]!`, "breakthrough");
            this.renderEquippedUltimate();
            this.renderGachaTab();
        },

        handleUnequipUltimate() {
            if (!this.player.equippedUltimate) return;
            this.player.equipUltimate(null);
            if (typeof StorageSystem !== "undefined") StorageSystem.save(this.player);
            this.sound.playClick();
            this.showToast("Đã tháo Đại Thần Thông trấn thân!", "info");
            this.renderEquippedUltimate();
            this.renderGachaTab();
        },

        handleGachaRoll(times = 1) {
            if (typeof UltimateSkillSystem === "undefined") return;

            // Kiểm tra vé
            // Tự động kiểm tra túi đồ xem có Vé Tầm Đạo không để nạp vào
            let availableTickets = this.player.gachaTickets || 0;
            const invTickets = this.player.inventory.filter(id => id === "ticket_tam_dao").length;
            availableTickets += invTickets;

            if (availableTickets < times) {
                this.sound.playFail();
                this.showToast(`Không đủ Vé Tầm Đạo! Cần ${times} vé (Hiện có: ${availableTickets}). Hãy leo Hư Không Tháp hoặc mua tại Bách Bảo Các.`, "error");
                return;
            }

            // Thực hiện rút
            const rollResult = this.player.rollGacha(times);
            if (typeof StorageSystem !== "undefined") StorageSystem.save(this.player);

            this.lastGachaTimes = times;
            this.sound.playBreakthrough();
            this.showGachaRevealModal(rollResult);
            this.renderGachaTab();
            this.renderEquippedUltimate();
            this.updateHeaderInfo();
        },

        handleGachaRollAll() {
            if (typeof UltimateSkillSystem === "undefined") return;

            // Tự động thu hồi Vé Tầm Đạo từ túi đồ nếu còn
            const invTickets = (this.player.inventory || []).filter(id => id === "ticket_tam_dao").length;
            if (invTickets > 0) {
                this.player.inventory = this.player.inventory.filter(id => id !== "ticket_tam_dao");
                this.player.addGachaTickets(invTickets);
                if (typeof StorageSystem !== "undefined") StorageSystem.save(this.player);
            }

            const totalTickets = this.player.gachaTickets || 0;
            if (totalTickets <= 0) {
                this.sound.playFail();
                this.showToast("Không có Vé Tầm Đạo nào! Hãy mua tại Bách Bảo Các hoặc leo Hư Không Tháp.", "error");
                return;
            }

            // Tối đa 50 lần quay một lúc để trải nghiệm mượt mà không quá tải
            const times = Math.min(totalTickets, 50);
            this.handleGachaRoll(times);
        },

        openShopForGachaTickets() {
            this.switchTab("shop");
            this.shopFilterType = "dan_duoc";
            this.shopFilterRealm = "all";
            this.shopFilterRarity = "all";
            this.shopSearchQuery = "Vé Tầm Đạo";

            document.querySelectorAll(".shop-type-btn").forEach(b => {
                b.classList.toggle("active", b.dataset.type === "dan_duoc");
            });
            const realmSel = document.getElementById("shop-realm-select");
            if (realmSel) realmSel.value = "all";
            const raritySel = document.getElementById("shop-rarity-select");
            if (raritySel) raritySel.value = "all";
            const searchInput = document.getElementById("shop-search-input");
            if (searchInput) searchInput.value = "Vé Tầm Đạo";
            const clearBtn = document.getElementById("btn-clear-shop-search");
            if (clearBtn) clearBtn.style.display = "block";

            this.renderShopTab();
        },

        handleGachaAgain() {
            const times = this.lastGachaTimes || 1;
            this.closeGachaRevealModal();
            setTimeout(() => {
                this.handleGachaRoll(times);
            }, 200);
        },

        showGachaRevealModal(rollResult) {
            const modal = document.getElementById("gacha-reveal-modal");
            const cardsEl = document.getElementById("gacha-reveal-cards");
            const summaryEl = document.getElementById("gacha-reveal-summary");
            if (!modal || !cardsEl || !summaryEl) return;

            const results = rollResult.results || [];
            cardsEl.innerHTML = results.map(res => {
                if (res.isPet) {
                    const pet = res.pet || ((typeof PetSystem !== "undefined") ? PetSystem.getPetById(res.petId) : null) || res.skill || {};
                    const tagHtml = res.isNew
                        ? `<span class="reveal-tag-new" style="background: linear-gradient(135deg, #ffd700, #ff9100); color: #000; font-weight: bold;">★ THẦN THÚ!</span>`
                        : `<span class="reveal-tag-dupe" style="background: #e91e63; color: #fff;">+1 THÚ HỒN</span>`;

                    return `
                        <div class="reveal-card-item tier-than pet-reveal-card" style="border-color: ${pet.themeColor || '#ffd700'};">
                            ${tagHtml}
                            <div class="reveal-icon" style="filter: drop-shadow(0 0 10px ${pet.themeColor || '#ffd700'}); font-size: 34px;">${pet.icon || '🐾'}</div>
                            <span class="reveal-name" style="color: ${pet.themeColor || '#ffd700'}; font-weight: bold;">${pet.name || 'Thần Thú'}</span>
                            <span class="reveal-badge" style="background: ${pet.badgeBg || 'rgba(255, 215, 0, 0.2)'}; color: ${pet.themeColor || '#ffd700'}; border: 1px solid ${pet.themeColor || '#ffd700'};">${pet.roleName || 'Hộ Vệ'}</span>
                        </div>
                    `;
                }

                const skill = res.skill;
                const tier = UltimateSkillSystem.getTier(skill.tier);
                const tierClass = `tier-${(skill.tier || "linh").toLowerCase()}`;

                const tagHtml = res.isNew
                    ? `<span class="reveal-tag-new">★ MỚI!</span>`
                    : `<span class="reveal-tag-dupe">+1 MẢNH</span>`;

                return `
                    <div class="reveal-card-item ${tierClass}">
                        ${tagHtml}
                        <div class="reveal-icon" style="filter: drop-shadow(0 0 6px ${tier.color});">${skill.icon}</div>
                        <span class="reveal-name" style="color: ${tier.color};">${skill.name}</span>
                        <span class="reveal-badge" style="background: ${tier.bg}; color: ${tier.color}; border: 1px solid ${tier.border};">${tier.name}</span>
                    </div>
                `;
            }).join("");

            const newSkills = results.filter(r => !r.isPet && r.isNew).length;
            const newPets = results.filter(r => r.isPet && r.isNew).length;
            const petShards = results.filter(r => r.isPet && !r.isNew).length;

            let summaryText = `Tầm Đạo thành công ${results.length} lần! `;
            if (newPets > 0) {
                summaryText += `🐾 Đã triệu hoán <strong>${newPets}</strong> Thần Thú Thượng Cổ (Khai mở Tab Linh Thú)! `;
            }
            if (newSkills > 0) {
                summaryText += `🎉 Giác ngộ <strong>${newSkills}</strong> Đại Thần Thông mới! `;
            }
            if (petShards > 0) {
                summaryText += `💎 Tích lũy <strong>+${petShards}</strong> Mảnh Thú Hồn! `;
            }
            if (rollResult.shardsGained > 0) {
                summaryText += `✨ Phân giải trùng nhận <strong>+${rollResult.shardsGained}</strong> Mảnh Cơ Duyên. `;
            }
            if (rollResult.ticketsForged > 0) {
                summaryText += `🎫 Đã tự động ngưng tụ thành <strong>+${rollResult.ticketsForged}</strong> Vé Tầm Đạo mới!`;
            }

            summaryEl.innerHTML = summaryText;
            modal.style.display = "flex";
        },

        closeGachaRevealModal() {
            const modal = document.getElementById("gacha-reveal-modal");
            if (modal) modal.style.display = "none";
        }
    });
})();
