/**
 * PHÂN HỆ GIAO DIỆN TAB BÁCH BẢO CÁC & QUY ĐỔI HỖN NGUYÊN (UI SHOP & EXCHANGE TAB)
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
        },

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
        },

        buyShopItem(itemId, quantity = 1) {
            this.hideItemTooltip(); // Cưỡng chế ẩn tooltip
            const res = this.player.buyItem(itemId, quantity);
            if (res && res.success) {
                this.sound.playEquip();
                if (res.isGachaTicket) {
                    this.showToast(res.msg || `Đã mua ${quantity}x [${res.item.name}], nạp thẳng vào Đài Cầu Đạo!`, "breakthrough");
                    this.renderGachaTab();
                } else if (quantity > 1) {
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
        },

        handleBuyMaxPill(itemId) {
            this.hideItemTooltip();
            const res = this.player.buyMaxPill(itemId);
            if (res && res.success) {
                this.sound.playEquip();
                if (res.isGachaTicket) {
                    this.showToast(res.msg || `Đã mua tối đa ${this.formatNumber(res.count)}x [${res.item.name}], nạp thẳng vào Đài Cầu Đạo!`, "breakthrough");
                    this.renderGachaTab();
                } else {
                    const currencyName = res.currency === "hon_nguyen" ? "🌀 Hỗn Nguyên Thạch" : "💎 Linh Thạch";
                    this.showToast(`Đã mua tối đa ${this.formatNumber(res.count)}x [${res.item.name}], tiêu hao ${this.formatNumber(res.totalCost)} ${currencyName}!`, "success");
                }
                this.renderShopTab();
                this.updateHeaderInfo();
                if (typeof StorageSystem !== "undefined") {
                    StorageSystem.save(this.player);
                }
            } else {
                this.showToast(res ? res.msg : "Không thể mua hết đan dược!", "error");
            }
        },

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
        },

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
        },

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
    });
})();
