/**
 * PHÂN HỆ GIAO DIỆN TAB TAM ĐẠI THẦN THÚ & NUÔI DƯỠNG (UI PETS TAB)
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
        renderPetsTab() {
            if (typeof PetSystem === "undefined") return;

            const allPets = PetSystem.getAllPets();
            const activePetId = this.player.activePetId;

            // Nếu chưa chọn Thần Thú nào để xem chi tiết, ưu tiên pet đang xuất trận hoặc pet đầu tiên đã mở
            if (!this.selectedPetId || !allPets.some(p => p.id === this.selectedPetId)) {
                if (activePetId) {
                    this.selectedPetId = activePetId;
                } else {
                    const unlocked = allPets.find(p => this.player.pets && this.player.pets[p.id] && this.player.pets[p.id].unlocked);
                    this.selectedPetId = unlocked ? unlocked.id : allPets[0].id;
                }
            }

            // 1. Header Active Status
            const statusEl = document.getElementById("pets-header-active-status");
            if (statusEl) {
                if (activePetId) {
                    const activePetDef = PetSystem.getPetById(activePetId);
                    const activePetData = this.player.pets ? this.player.pets[activePetId] : null;
                    const activeRealm = activePetData ? PetSystem.getRealm(activePetData.realm) : null;
                    statusEl.innerHTML = `
                        <div class="pet-active-badge-bar">
                            <span class="active-pulse-dot"></span>
                            <span>Đang Xuất Trận:</span>
                            <strong style="color: ${activePetDef ? activePetDef.themeColor : '#ffd700'}; font-size: 14px;">
                                ${activePetDef ? activePetDef.icon : '🐾'} ${activePetDef ? activePetDef.name : activePetId}
                            </strong>
                            <span class="pet-realm-chip" style="color: ${activeRealm ? activeRealm.titleColor : '#aaa'}; border-color: ${activeRealm ? activeRealm.titleColor : '#aaa'};">
                                ${activeRealm ? activeRealm.name : ''}
                            </span>
                            <button class="btn-xs btn-danger" style="margin-left: 8px;" onclick="gameUI.handleToggleActivePet('${activePetId}')">Thu Hồi</button>
                        </div>
                    `;
                } else {
                    statusEl.innerHTML = `
                        <div class="pet-inactive-badge-bar">
                            <span>🐾 Chưa xuất trận Thần Thú nào. Hãy chọn và kích hoạt Thần Thú để cùng tham chiến!</span>
                        </div>
                    `;
                }
            }

            // 2. Render 3 Selector Cards
            const selectorGridEl = document.getElementById("pet-selector-grid");
            if (selectorGridEl) {
                selectorGridEl.innerHTML = allPets.map(p => {
                    const pData = this.player.pets ? this.player.pets[p.id] : null;
                    const isUnlocked = !!(pData && pData.unlocked);
                    const isActive = activePetId === p.id;
                    const isSelected = this.selectedPetId === p.id;
                    const realm = isUnlocked ? PetSystem.getRealm(pData.realm) : null;

                    let cardStatusHtml = "";
                    if (isActive) {
                        cardStatusHtml = `<span class="pet-card-status-badge badge-active">⚔️ ĐANG XUẤT TRẬN</span>`;
                    } else if (isUnlocked) {
                        cardStatusHtml = `<span class="pet-card-status-badge badge-unlocked">✨ ${realm ? realm.name : ''}</span>`;
                    } else {
                        cardStatusHtml = `<span class="pet-card-status-badge badge-locked">🔒 Chưa Giác Ngộ</span>`;
                    }

                    const shardsText = isUnlocked 
                        ? `<div class="pet-card-shards">💎 Mảnh Thú Hồn: <strong>${pData.shards || 0}</strong></div>`
                        : `<div class="pet-card-shards text-muted">Có thể nhận tại Đài Cầu Đạo</div>`;

                    return `
                        <div class="pet-selector-card ${isSelected ? 'is-selected' : ''} ${isActive ? 'is-active' : ''} ${!isUnlocked ? 'is-locked' : ''}"
                             style="--pet-theme: ${p.themeColor};"
                             onclick="gameUI.handleSelectPet('${p.id}')">
                            <div class="pet-card-glow"></div>
                            <div class="pet-card-top">
                                <div class="pet-card-icon-box" style="filter: drop-shadow(0 0 8px ${p.themeColor});">
                                    ${p.icon}
                                </div>
                                <div class="pet-card-meta">
                                    <span class="pet-card-name" style="color: ${p.themeColor};">${p.name}</span>
                                    <span class="pet-card-role" style="background: ${p.badgeBg}; color: ${p.themeColor}; border: 1px solid ${p.themeColor};">${p.roleName}</span>
                                </div>
                            </div>
                            <div class="pet-card-mid">
                                ${cardStatusHtml}
                                ${shardsText}
                            </div>
                            ${isUnlocked ? `
                                <div class="pet-card-quick-stats">
                                    <span>Cấp Kỹ Năng: <strong>${pData.skillLevel || 1}/12</strong></span>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join("");
            }

            // 3. Render Pet Details Layout
            const detailsEl = document.getElementById("pet-details-layout");
            if (!detailsEl) return;

            const selDef = PetSystem.getPetById(this.selectedPetId);
            const selData = this.player.pets ? this.player.pets[this.selectedPetId] : null;

            if (!selDef) return;

            if (!selData || !selData.unlocked) {
                // Hiển thị giao diện chưa mở khóa (Locked Showcase)
                detailsEl.innerHTML = `
                    <div class="pet-locked-showcase panel">
                        <div class="pet-locked-avatar-wrap">
                            <div class="pet-locked-icon">${selDef.icon}</div>
                            <div class="pet-locked-overlay-icon">🔒</div>
                        </div>
                        <div class="pet-locked-info">
                            <h3 class="pet-locked-title" style="color: ${selDef.themeColor};">${selDef.name}</h3>
                            <div class="pet-locked-tags">
                                <span class="pet-tag" style="background: ${selDef.badgeBg}; color: ${selDef.themeColor}; border: 1px solid ${selDef.themeColor};">${selDef.roleName}</span>
                                <span class="pet-tag" style="background: rgba(255,255,255,0.08); color: #cbd5e1;">Hệ: ${selDef.element}</span>
                                <span class="pet-tag" style="background: rgba(255, 215, 0, 0.15); color: #ffd700; border: 1px solid #ffd700;">Phẩm Cấp: THẦN CẤP</span>
                            </div>
                            <p class="pet-locked-lore">${selDef.lore}</p>
                            
                            <div class="pet-locked-previews">
                                <div class="preview-box">
                                    <strong style="color: #ffd700;">${selDef.passive.icon} Nội Tại: ${selDef.passive.name}</strong>
                                    <p>${selDef.passive.desc}</p>
                                </div>
                                <div class="preview-box">
                                    <strong style="color: #00e676;">${selDef.skill.icon} Thần Thông: ${selDef.skill.name}</strong>
                                    <p>${selDef.skill.desc}</p>
                                </div>
                            </div>

                            <div class="pet-locked-actions">
                                <p style="color: #fbbf24; font-size: 13px; margin-bottom: 10px;">
                                    🌟 Thần Thú thượng cổ có tỉ lệ xuất hiện trong pool quay Thần Cấp (0.2%) tại Đài Cầu Đạo hoặc kích hoạt qua bảo hiểm 500 lần!
                                </p>
                                <button class="btn btn-primary" onclick="gameUI.switchTab('gacha')">
                                    🔮 Đến Đài Cầu Đạo Thượng Cổ
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }

            // Đã mở khóa: Render 2 cột chi tiết
            const curRealm = PetSystem.getRealm(selData.realm);
            const nextRealm = selData.realm < PetSystem.getMaxRealm() ? PetSystem.getRealm(selData.realm + 1) : null;
            const stats = PetSystem.calculatePetStats(selDef.id, selData.realm);
            const skillInfo = PetSystem.getSkillInfo(selDef.id, selData.skillLevel || 1);
            const skillCost = PetSystem.getSkillUpgradeCost(selDef.id, selData.skillLevel || 1);
            const isActive = activePetId === selDef.id;

            // Tính toán đan dược có thể cho ăn từ túi đồ
            const itemSys = typeof ItemSystem !== "undefined" ? ItemSystem : null;
            const availablePillsMap = new Map();
            if (itemSys) {
                this.player.inventory.forEach(itemId => {
                    const item = itemSys.getItemById(itemId);
                    if (item && item.slot === "dan_duoc" && (item.tuViGain || item.tinhNguyenGain)) {
                        const existing = availablePillsMap.get(itemId);
                        if (existing) {
                            existing.count++;
                        } else {
                            availablePillsMap.set(itemId, { item, count: 1 });
                        }
                    }
                });
            }
            const availablePills = Array.from(availablePillsMap.values());

            const expPercent = Math.min(100, Math.floor(((selData.exp || 0) / curRealm.reqExp) * 100));
            const canBreakthrough = (selData.exp || 0) >= curRealm.reqExp && selData.realm < PetSystem.getMaxRealm();

            detailsEl.innerHTML = `
                <!-- CỘT TRÁI: HỒ SƠ THẦN THÚ, CẢNH GIỚI & NUÔI DƯỠNG -->
                <div class="pet-col-left">
                    <!-- Thẻ Tổng Quan & Nút Xuất Trận -->
                    <div class="panel pet-profile-card" style="border-top: 3px solid ${selDef.themeColor};">
                        <div class="pet-profile-top">
                            <div class="pet-avatar-stage" style="filter: drop-shadow(0 0 16px ${selDef.themeColor});">
                                <span class="pet-avatar-icon">${selDef.icon}</span>
                            </div>
                            <div class="pet-profile-meta">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <h3 class="pet-profile-name" style="color: ${selDef.themeColor};">${selDef.name}</h3>
                                    <span class="pet-tag" style="background: ${selDef.badgeBg}; color: ${selDef.themeColor}; border: 1px solid ${selDef.themeColor};">${selDef.roleName}</span>
                                </div>
                                <span class="pet-profile-element" style="color: var(--text-muted); font-size: 12px;">Nguyên Tố: ${selDef.element}</span>
                                <div class="pet-profile-shards" style="margin-top: 6px;">
                                    <span>💎 Mảnh Thú Hồn: <strong style="color: #ffd700;">${selData.shards || 0}</strong> Mảnh</span>
                                </div>
                            </div>
                        </div>

                        <p class="pet-profile-desc">${selDef.lore}</p>

                        <div class="pet-deploy-action-wrap">
                            ${isActive ? `
                                <button class="btn btn-danger btn-block" onclick="gameUI.handleToggleActivePet('${selDef.id}')">
                                    🛡️ Thu Hồi Về Không Gian Linh Thú
                                </button>
                            ` : `
                                <button class="btn btn-primary btn-block" style="background: linear-gradient(135deg, ${selDef.themeColor}, #0284c7);" onclick="gameUI.handleToggleActivePet('${selDef.id}')">
                                    ⚔️ Xuất Trận Trợ Chiến Cùng Chủ Nhân
                                </button>
                            `}
                        </div>
                    </div>

                    <!-- Thẻ Tiến Trình Cảnh Giới -->
                    <div class="panel pet-realm-panel">
                        <div class="panel-header">
                            <h4 class="panel-title" style="font-size: 15px;">
                                <span>🌟</span> CẢNH GIỚI: 
                                <strong style="color: ${curRealm.titleColor}; margin-left: 4px;">${curRealm.name}</strong>
                                <small style="color: var(--text-muted); margin-left: 6px;">(Tầng ${selData.realm + 1}/12)</small>
                            </h4>
                        </div>

                        <div class="pet-exp-container">
                            <div class="pet-exp-meta">
                                <span>Tu Vi Tích Lũy:</span>
                                <strong>${this.formatNumber(selData.exp || 0)} / ${this.formatNumber(curRealm.reqExp)} (${expPercent}%)</strong>
                            </div>
                            <div class="pet-exp-bar-outer">
                                <div class="pet-exp-bar-fill" style="width: ${expPercent}%; background: linear-gradient(90deg, ${curRealm.titleColor}, ${selDef.themeColor});"></div>
                            </div>
                        </div>

                        <div class="pet-breakthrough-wrap" style="margin-top: 14px;">
                            ${selData.realm >= PetSystem.getMaxRealm() ? `
                                <div class="pet-max-badge">👑 ĐÃ ĐẠT CẢNH GIỚI ĐẠI ĐẠO CHÍ CAO VÔ THƯỢNG</div>
                            ` : canBreakthrough ? `
                                <button class="btn btn-breakthrough-pet pulse-btn btn-block" onclick="gameUI.handleBreakthroughPet('${selDef.id}')">
                                    ⚡ Đột Phá Lên [${nextRealm ? nextRealm.name : ''}] Ngay!
                                </button>
                            ` : `
                                <button class="btn btn-disabled btn-block" disabled>
                                    Chưa Đủ Tu Vi Để Đột Phá (Còn thiếu ${this.formatNumber(curRealm.reqExp - (selData.exp || 0))} Tu Vi)
                                </button>
                            `}
                        </div>
                    </div>

                    <!-- Thẻ Nuôi Dưỡng Tu Vi Bằng Đan Dược -->
                    <div class="panel pet-feed-panel">
                        <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 class="panel-title" style="font-size: 15px;">
                                <span>💊</span> NUÔI DƯỠNG TU VI
                            </h4>
                            <button class="btn-xs btn-outline-gold" onclick="gameUI.handleFeedPetMax('${selDef.id}')" title="Cho ăn tất cả đan dược tu luyện đang có">
                                ⚡ Nuôi Tất Cả (Max)
                            </button>
                        </div>

                        <div class="pet-feed-list">
                            ${availablePills.length === 0 ? `
                                <div class="pet-feed-empty">
                                    <p style="color: var(--text-muted); font-size: 13px; margin: 10px 0;">
                                        Túi đồ hiện không có Đan Dược tu luyện! Hãy chế luyện hoặc mua tại Bách Bảo Các để bồi dưỡng Thần Thú.
                                    </p>
                                    <button class="btn-xs btn-outline" onclick="gameUI.switchTab('shop')">Đến Bách Bảo Các</button>
                                </div>
                            ` : availablePills.map(({ item, count }) => {
                                const gainStr = item.tinhNguyenGain 
                                    ? `+${this.formatNumber(item.tinhNguyenGain * 1000000000)} Tu Vi (🌌)` 
                                    : `+${this.formatNumber(item.tuViGain)} Tu Vi`;
                                return `
                                    <div class="pet-feed-pill-item">
                                        <div class="feed-pill-info">
                                            <span class="feed-pill-icon">${item.icon || '💊'}</span>
                                            <div class="feed-pill-texts">
                                                <strong class="feed-pill-name" style="color: ${item.color || '#fff'};">${item.name}</strong>
                                                <span class="feed-pill-gain">${gainStr} • Có: <strong>${count}</strong></span>
                                            </div>
                                        </div>
                                        <div class="feed-pill-actions">
                                            <button class="btn-feed-btn" onclick="gameUI.handleFeedPet('${selDef.id}', '${item.id}', 1)">Ăn 1</button>
                                            ${count >= 10 ? `<button class="btn-feed-btn" onclick="gameUI.handleFeedPet('${selDef.id}', '${item.id}', 10)">x10</button>` : ''}
                                            ${count >= 100 ? `<button class="btn-feed-btn" onclick="gameUI.handleFeedPet('${selDef.id}', '${item.id}', 100)">x100</button>` : ''}
                                        </div>
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    </div>
                </div>

                <!-- CỘT PHẢI: BẢNG CHỈ SỐ, NỘI TẠI & THẦN THÔNG 12 CẤP -->
                <div class="pet-col-right">
                    <!-- Bảng Thuộc Tính Thần Thú -->
                    <div class="panel pet-stats-panel">
                        <div class="panel-header">
                            <h4 class="panel-title" style="font-size: 15px;">
                                <span>📊</span> BẢNG THUỘC TÍNH CHIẾN ĐẤU (THEO CẢNH GIỚI)
                            </h4>
                        </div>

                        <div class="pet-stats-grid">
                            <div class="pet-stat-item">
                                <span class="stat-label">❤️ Sinh Lực (HP):</span>
                                <strong class="stat-value text-green">${this.formatNumber(stats.maxHp)}</strong>
                            </div>
                            <div class="pet-stat-item">
                                <span class="stat-label">⚔️ Công Vật Lí:</span>
                                <strong class="stat-value text-red">${this.formatNumber(stats.vatLi)}</strong>
                            </div>
                            <div class="pet-stat-item">
                                <span class="stat-label">🔮 Công Phép:</span>
                                <strong class="stat-value text-purple">${this.formatNumber(stats.phep)}</strong>
                            </div>
                            <div class="pet-stat-item">
                                <span class="stat-label">🛡️ Phòng Thủ:</span>
                                <strong class="stat-value text-blue">${this.formatNumber(stats.phongThu)}</strong>
                            </div>
                            <div class="pet-stat-item">
                                <span class="stat-label">⚡ Tốc Độ Đánh:</span>
                                <strong class="stat-value text-gold">${stats.attackSpeed}s / đòn</strong>
                            </div>
                            ${selDef.id === "pet_tank" ? `
                                <div class="pet-stat-item highlight-stat">
                                    <span class="stat-label">💥 Phản Sát Thương:</span>
                                    <strong class="stat-value" style="color: #ffd700;">${skillInfo.reflectPct}%</strong>
                                </div>
                                <div class="pet-stat-item highlight-stat">
                                    <span class="stat-label">🛡️ Lớp Khiên Hộ Chủ:</span>
                                    <strong class="stat-value" style="color: #00d2d3;">200% HP (${this.formatNumber(stats.maxHp * 2)})</strong>
                                </div>
                            ` : selDef.id === "pet_dps" ? `
                                <div class="pet-stat-item highlight-stat">
                                    <span class="stat-label">⚡ Sát Thương Chuẩn:</span>
                                    <strong class="stat-value" style="color: #ff3838;">100% (Bỏ qua Kim Thân & Giáp)</strong>
                                </div>
                                <div class="pet-stat-item highlight-stat">
                                    <span class="stat-label">🩸 Tước Đoạt Máu:</span>
                                    <strong class="stat-value" style="color: #ff3838;">${skillInfo.drainPct}% Máu Boss / ${skillInfo.cooldown}s</strong>
                                </div>
                            ` : `
                                <div class="pet-stat-item highlight-stat">
                                    <span class="stat-label">👑 Khuếch Đại Chủ Nhân:</span>
                                    <strong class="stat-value" style="color: #ffd700;">+100% Tổng Sát Thương (x2)</strong>
                                </div>
                                <div class="pet-stat-item highlight-stat">
                                    <span class="stat-label">🔥 Đại Đạo Cuồng Nộ:</span>
                                    <strong class="stat-value" style="color: #ffd700;">10x Tốc Đánh & Xuyên Kim Thân</strong>
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- Thẻ Nội Tại Vĩnh Cửu (Fixed Passive) -->
                    <div class="panel pet-passive-panel" style="border-left: 3px solid ${selDef.themeColor};">
                        <div class="pet-passive-header">
                            <span class="passive-icon" style="filter: drop-shadow(0 0 6px ${selDef.themeColor});">${selDef.passive.icon}</span>
                            <div>
                                <span class="passive-badge">NỘI TẠI VĨNH CỬU</span>
                                <h4 class="passive-title" style="color: ${selDef.themeColor};">${selDef.passive.name}</h4>
                            </div>
                        </div>
                        <p class="passive-desc">${selDef.passive.desc}</p>
                    </div>

                    <!-- Thẻ Thần Thông Nâng Cấp 12 Cấp -->
                    <div class="panel pet-skill-upgrade-panel">
                        <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 class="panel-title" style="font-size: 15px;">
                                <span>✨</span> THẦN THÔNG: <strong style="color: ${selDef.themeColor};">${skillInfo.name}</strong>
                            </h4>
                            <span class="pet-skill-level-badge" style="background: rgba(255, 215, 0, 0.15); color: #ffd700; border: 1px solid #ffd700; font-weight: bold; padding: 2px 8px; border-radius: 4px;">
                                Cấp ${skillInfo.level} / 12
                            </span>
                        </div>

                        <!-- Hiệu ứng hiện tại -->
                        <div class="skill-current-box">
                            <span class="skill-box-label">Hiệu Quả Hiện Tại (Cấp ${skillInfo.level}):</span>
                            <p class="skill-box-desc">${skillInfo.desc}</p>
                        </div>

                        <!-- Khu vực nâng cấp cấp kế tiếp -->
                        ${skillCost ? `
                            <div class="skill-upgrade-section">
                                <div class="skill-next-box">
                                    <span class="skill-box-label" style="color: #38bdf8;">Xem Trước Cấp Kế Tiếp (Cấp ${skillCost.targetLevel}):</span>
                                    <p class="skill-box-desc">${PetSystem.getSkillInfo(selDef.id, skillCost.targetLevel)?.desc || ''}</p>
                                </div>

                                <!-- Điều kiện & Chi phí -->
                                <div class="skill-cost-checklist">
                                    <span class="checklist-title">Điều Kiện & Chi Phí Nâng Cấp:</span>

                                    <!-- 1. Điều kiện Cảnh giới -->
                                    <div class="cost-item ${selData.realm >= skillCost.reqRealm ? 'is-met' : 'is-unmet'}">
                                        <span class="cost-status-icon">${selData.realm >= skillCost.reqRealm ? '✓' : '✗'}</span>
                                        <span>Yêu Cầu Cảnh Giới: <strong>${PetSystem.getRealm(skillCost.reqRealm)?.name || ''}</strong></span>
                                        <small>(${selData.realm >= skillCost.reqRealm ? 'Đã Đạt' : 'Cần Đột Phá Thần Thú'})</small>
                                    </div>

                                    <!-- 2. Mảnh Thú Hồn -->
                                    <div class="cost-item ${(selData.shards || 0) >= skillCost.shards ? 'is-met' : 'is-unmet'}">
                                        <span class="cost-status-icon">${(selData.shards || 0) >= skillCost.shards ? '✓' : '✗'}</span>
                                        <span>Mảnh Thú Hồn: <strong>${selData.shards || 0} / ${skillCost.shards} Mảnh</strong></span>
                                        <small>(${(selData.shards || 0) >= skillCost.shards ? 'Đủ' : 'Nhận thêm tại Đài Cầu Đạo'})</small>
                                    </div>

                                    <!-- 3. Tiền tệ -->
                                    ${skillCost.linhThach > 0 ? `
                                        <div class="cost-item ${(this.player.linhThach || 0) >= skillCost.linhThach ? 'is-met' : 'is-unmet'}">
                                            <span class="cost-status-icon">${(this.player.linhThach || 0) >= skillCost.linhThach ? '✓' : '✗'}</span>
                                            <span>Linh Thạch: <strong>${this.formatNumber(skillCost.linhThach)} 💎</strong></span>
                                            <small>(Hiện có: ${this.formatNumber(this.player.linhThach || 0)})</small>
                                        </div>
                                    ` : ''}

                                    ${skillCost.honNguyen > 0 ? `
                                        <div class="cost-item ${(this.player.honNguyen || 0) >= skillCost.honNguyen ? 'is-met' : 'is-unmet'}">
                                            <span class="cost-status-icon">${(this.player.honNguyen || 0) >= skillCost.honNguyen ? '✓' : '✗'}</span>
                                            <span>Hỗn Nguyên Thạch: <strong>${this.formatNumber(skillCost.honNguyen)} 🌀</strong></span>
                                            <small>(Hiện có: ${this.formatNumber(this.player.honNguyen || 0)})</small>
                                        </div>
                                    ` : ''}

                                    <!-- 4. Đan dược mốc (nếu có) -->
                                    ${skillCost.pillId ? `
                                        <div class="cost-item ${this.player.inventory.includes(skillCost.pillId) ? 'is-met' : 'is-unmet'}">
                                            <span class="cost-status-icon">${this.player.inventory.includes(skillCost.pillId) ? '✓' : '✗'}</span>
                                            <span>Dược Dẫn: <strong>1x ${skillCost.pillName}</strong></span>
                                            <small>(${this.player.inventory.includes(skillCost.pillId) ? 'Có Trong Túi' : 'Chưa Có'})</small>
                                        </div>
                                    ` : ''}
                                </div>

                                <button class="btn btn-primary btn-block btn-upgrade-skill" 
                                        style="margin-top: 14px; background: linear-gradient(135deg, #ffd700, #ff9100); color: #000; font-weight: bold;"
                                        onclick="gameUI.handleUpgradePetSkill('${selDef.id}')">
                                    ⚡ Nâng Cấp Thần Thông Lên Cấp ${skillCost.targetLevel}
                                </button>
                            </div>
                        ` : `
                            <div class="skill-max-badge" style="margin-top: 14px; text-align: center; padding: 16px; background: rgba(255, 215, 0, 0.1); border: 1px solid #ffd700; border-radius: 8px;">
                                <strong style="color: #ffd700; font-size: 15px;">👑 THẦN THÔNG ĐÃ ĐẠT CẤP 12 TỐI THƯỢNG VIÊN MÃN!</strong>
                                <p style="color: var(--text-muted); font-size: 12px; margin-top: 4px;">Uy lực thấu triệt chư thiên vạn giới, không thể tăng thêm.</p>
                            </div>
                        `}
                    </div>
                </div>
            `;
        },

        handleSelectPet(petId) {
            this.selectedPetId = petId;
            this.sound.playClick();
            this.renderPetsTab();
        },

        handleToggleActivePet(petId) {
            if (this.player.activePetId === petId) {
                this.player.setActivePet(null);
                this.sound.playClick();
                this.showToast("Đã thu hồi Thần Thú về không gian linh thú!", "info");
            } else {
                const res = this.player.setActivePet(petId);
                if (res && res.success) {
                    const petDef = PetSystem.getPetById(petId);
                    this.sound.playBreakthrough();
                    this.showToast(`🐾 Đã xuất trận Thần Thú: [${petDef ? petDef.name : petId}] trợ chiến!`, "breakthrough");
                } else {
                    this.sound.playFail();
                    this.showToast(res ? res.msg : "Không thể xuất trận!", "error");
                }
            }
            if (typeof StorageSystem !== "undefined") StorageSystem.save(this.player);
            this.renderPetsTab();
            this.updateHeaderInfo();
        },

        handleFeedPet(petId, pillId, count = 1) {
            const res = this.player.feedPetPill(petId, pillId, count);
            if (res && res.success) {
                this.sound.playHeal();
                this.showToast(`🐾 [${res.pillName}] x${res.count}: Thần Thú nhận +${this.formatNumber(res.expGained)} Tu Vi!`, "success");
                if (res.canBreakthrough) {
                    this.showToast("⚡ Thần Thú Tu Vi đã viên mãn, có thể đột phá Cảnh Giới!", "breakthrough");
                }
                if (typeof StorageSystem !== "undefined") StorageSystem.save(this.player);
                this.renderPetsTab();
                this.updateHeaderInfo();
            } else {
                this.sound.playFail();
                this.showToast(res ? res.msg : "Không thể cho ăn!", "error");
            }
        },

        handleFeedPetMax(petId) {
            const res = this.player.feedPetMax(petId);
            if (res && res.success) {
                this.sound.playHeal();
                this.showToast(`🐾 Thần Thú đã hấp thu toàn bộ ${res.totalPills} đan dược, nhận +${this.formatNumber(res.totalExp)} Tu Vi!`, "breakthrough");
                if (res.canBreakthrough) {
                    this.showToast("⚡ Thần Thú Tu Vi đã viên mãn, hãy đột phá Cảnh Giới kế tiếp!", "breakthrough");
                }
                if (typeof StorageSystem !== "undefined") StorageSystem.save(this.player);
                this.renderPetsTab();
                this.updateHeaderInfo();
            } else {
                this.sound.playFail();
                this.showToast(res ? res.msg : "Túi đồ không có đan dược tu luyện!", "error");
            }
        },

        handleBreakthroughPet(petId) {
            const res = this.player.breakthroughPet(petId);
            if (res && res.success) {
                const petDef = PetSystem.getPetById(petId);
                this.sound.playBreakthrough();
                this.showToast(`🎉 CHÚC MỪNG! [${petDef ? petDef.name : petId}] đã đột phá thăng hoa lên [${res.newRealmName}]!`, "breakthrough");
                if (typeof StorageSystem !== "undefined") StorageSystem.save(this.player);
                this.renderPetsTab();
                this.updateHeaderInfo();
            } else {
                this.sound.playFail();
                this.showToast(res ? res.msg : "Chưa thể đột phá!", "error");
            }
        },

        handleUpgradePetSkill(petId) {
            const res = this.player.upgradePetSkill(petId);
            if (res && res.success) {
                this.sound.playBreakthrough();
                this.showToast(`✨ Thần Thông [${res.skillInfo.name}] đã thăng cấp thành công lên Cấp ${res.newLevel}!`, "breakthrough");
                if (typeof StorageSystem !== "undefined") StorageSystem.save(this.player);
                this.renderPetsTab();
                this.updateHeaderInfo();
            } else {
                this.sound.playFail();
                this.showToast(res ? res.msg : "Không thể nâng cấp Thần Thông!", "error");
            }
        }
    });
})();
