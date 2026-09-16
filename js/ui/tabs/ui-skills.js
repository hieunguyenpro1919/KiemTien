/**
 * PHÂN HỆ GIAO DIỆN TAB KỸ NĂNG & TÀNG KINH CÁC (UI SKILLS & TANG KINH CAC TAB)
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
        },

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
        },

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
                        <span class="skill-price">${skill.currency === "hon_nguyen" ? `🌀 ${this.formatNumber(skill.price)} Hỗn Nguyên` : `💎 ${this.formatNumber(skill.price)} Linh Thạch`}</span>
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
        },

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
        },

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
        },

        unequipSkill(slotIndex) {
            this.player.unequipSkill(slotIndex);
            this.sound.playClick();
            this.renderCharacterTab();
            this.renderSkillsTab();
            StorageSystem.save(this.player);
        },

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
        },

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
    });
})();
