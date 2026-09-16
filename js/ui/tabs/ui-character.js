/**
 * PHÂN HỆ GIAO DIỆN TAB NHÂN VẬT, TÚI ĐỒ & MODALS (UI CHARACTER & INVENTORY)
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
            if (typeof this.renderEquippedSkills === "function") {
                this.renderEquippedSkills();
            }

            // Ô Đại Thần Thông Trấn Thân
            if (typeof this.renderEquippedUltimate === "function") {
                this.renderEquippedUltimate();
            }

            // Túi đồ (Inventory)
            this.renderInventory();
        },

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
        },

        allocateStat(type, amount) {
            const success = this.player.allocateStat(type, amount);
            if (success) {
                this.sound.playClick();
                this.renderCharacterTab();
                this.updateHeaderInfo();
                StorageSystem.save(this.player);
            }
        },

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
        },

        unequipItem(slot) {
            this.hideItemTooltip(); // Cưỡng chế ẩn tooltip
            if (this.player.unequipItem(slot)) {
                this.sound.playEquip();
                this.showToast("Đã tháo trang bị cất vào túi đồ!", "info");
                this.renderCharacterTab();
                this.updateHeaderInfo();
                StorageSystem.save(this.player);
            }
        },

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
        },

        setInventoryFilter(filterType) {
            this.invFilter = filterType;
            document.querySelectorAll(".inv-filter-btn").forEach(btn => {
                btn.classList.toggle("active", btn.dataset.filter === filterType);
            });
            this.renderInventory();
        },

        handleInventorySearch(query) {
            this.invSearchQuery = (query || "").trim().toLowerCase();
            this.renderInventory();
        },

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
                    } else if (item.id === "ticket_tam_dao") {
                        statsDisplay = `🎫 <strong>${count}x Vé Tầm Đạo</strong> <small style="color:#ffd700;">(Đài Cầu Đạo)</small>`;
                    } else if (item.id === "item_tower_ticket") {
                        statsDisplay = `🗼 <strong>${count}x Lệnh Bài Hư Không</strong> <small style="color:#00e5ff;">(Hư Không Tháp)</small>`;
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
                            const gainDesc = item.id === "ticket_tam_dao"
                                ? `+${count} Vé Tầm Đạo (Đài Cầu Đạo)`
                                : item.id === "item_tower_ticket"
                                ? `+${count} Lệnh Bài Hư Không (Tháp)`
                                : item.tinhNguyenGain 
                                ? `+${this.formatNumber(item.tinhNguyenGain * count)} Tinh Nguyên Đại Đạo` 
                                : `+${this.formatNumber((item.tuViGain || 0) * count)} Tu Vi`;
                            actionBtns = `
                                <button class="btn-sm btn-success" onclick="event.stopPropagation(); gameUI.useConsumable('${item.id}')" title="Dùng 1">Dùng 1</button>
                                <button class="btn-sm btn-warning btn-use-all" onclick="event.stopPropagation(); gameUI.useAllConsumables('${item.id}')" title="Dùng hết toàn bộ ${count} nhận ${gainDesc}">⚡ Dùng Hết (${count})</button>
                                <button class="btn-sm btn-secondary" onclick="event.stopPropagation(); gameUI.sellItem('${item.id}')" title="Bán 1">Bán 1 (${item.sellPrice} ${currIcon})</button>
                                <button class="btn-sm btn-secondary" onclick="event.stopPropagation(); gameUI.sellAllItems('${item.id}')" title="Bán hết ${count}">Bán Hết (${this.formatNumber(item.sellPrice * count)} ${currIcon})</button>
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
        },

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
        },

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
                if (typeof this.renderGachaTab === "function") {
                    this.renderGachaTab();
                }
                this.updateHeaderInfo();
                StorageSystem.save(this.player);
            } else {
                this.showToast(res ? res.msg : "Không thể sử dụng đan dược!", "error");
            }
        },

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
                const toastType = (res.isGachaTicket || itemId === "ticket_tam_dao" || itemId === "item_tower_ticket") 
                    ? "breakthrough" 
                    : (res.isVoCucToast ? "vo-cuc" : (res.isTinhNguyen ? "breakthrough" : "success"));
                const toastMsg = res.msg || `✨ Đã dùng toàn bộ ${res.count}x [${res.item.name}], tăng +${this.formatNumber(res.totalTuVi)} ${unitMsg}!`;
                this.showToast(toastMsg, toastType);

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
                if (typeof this.renderGachaTab === "function") {
                    this.renderGachaTab();
                }
                this.updateHeaderInfo();
                StorageSystem.save(this.player);
            } else {
                this.showToast(res ? res.msg : "Không thể sử dụng đan dược!", "error");
            }
        },

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
        },

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
        },

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
        },

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
        },

        closeQuickSellDupsModal() {
            const modal = document.getElementById("quick-sell-dups-modal");
            if (modal) modal.style.display = "none";
        },

        toggleQuickSellKeepOne(checked) {
            this.quickSellKeepOne = !!checked;
            this.renderQuickSellDupsModal();
        },

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
        },

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
        },

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
        },

        closeRenameModal() {
            const modal = document.getElementById("rename-modal");
            if (modal) modal.style.display = "none";
        },

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
        },

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
        },

        closeTitleModal() {
            const modal = document.getElementById("title-modal");
            if (modal) modal.style.display = "none";
        },

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
        },

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
        },

        unequipTitle() {
            TitleSystem.unequipTitle(this.player);
            this.sound.playClick();
            this.showToast("Đã tháo danh hiệu!", "info");
            this.renderTitleModal();
            this.renderCharacterTab();
            this.updateHeaderInfo();
            StorageSystem.save(this.player);
        }
    });
})();
