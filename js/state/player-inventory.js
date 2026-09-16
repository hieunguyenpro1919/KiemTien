/**
 * PHÂN HỆ QUẢN LÝ TÚI ĐỒ, TRANG BỊ, KỸ NĂNG & KINH TẾ (PLAYER INVENTORY & ECONOMY)
 * Tách từ player.js - Gắn vào Player.prototype
 */

(function() {
    const target = (typeof Player !== "undefined") ? Player : (typeof global !== "undefined" && global.Player ? global.Player : null);
    if (!target) return;

    Object.assign(target.prototype, {
        /**
         * Mặc trang bị vào ô chỉ định (nón, giáp, vũ khí)
         */
        equipItem(itemId) {
            if (!this.equipped) {
                this.equipped = { non: null, giap: null, vukhi: null };
            }
            if (!Array.isArray(this.inventory)) {
                this.inventory = [];
            }

            const item = (typeof ItemSystem !== "undefined") ? ItemSystem.getItemById(itemId) : null;
            if (!item || !["non", "giap", "vukhi"].includes(item.slot)) return false;

            // Kiểm tra yêu cầu cảnh giới của trang bị
            if (this.realmIndex < item.reqRealm) {
                const reqName = (typeof RealmSystem !== "undefined" && RealmSystem.getRealm(item.reqRealm)) ? RealmSystem.getRealm(item.reqRealm).name : `Cảnh giới ${item.reqRealm}`;
                return { success: false, msg: `Cần cảnh giới ${reqName} mới có thể trang bị!` };
            }

            // Tìm trong túi đồ
            const invIndex = this.inventory.indexOf(itemId);
            if (invIndex === -1) return { success: false, msg: "Không có vật phẩm này trong túi!" };

            // Tháo vật phẩm cũ (nếu có) vào lại túi
            const oldItem = this.equipped[item.slot];
            if (oldItem) {
                this.inventory.push(oldItem);
            }

            // Xóa vật phẩm mới khỏi túi và lắp vào ô
            this.inventory.splice(invIndex, 1);
            this.equipped[item.slot] = itemId;

            // Điều chỉnh máu hiện tại theo máu tối đa mới
            this.currentHp = Math.min(this.currentHp, this.getMaxHp());

            return { success: true, item };
        },

        /**
         * Tháo trang bị chuyển về túi
         */
        unequipItem(slot) {
            if (!["non", "giap", "vukhi"].includes(slot)) return false;
            if (!this.equipped) {
                this.equipped = { non: null, giap: null, vukhi: null };
            }
            if (!Array.isArray(this.inventory)) {
                this.inventory = [];
            }

            const currentItem = this.equipped[slot];
            if (!currentItem) return false;

            this.inventory.push(currentItem);
            this.equipped[slot] = null;
            this.currentHp = Math.min(this.currentHp, this.getMaxHp());

            return true;
        },

        /**
         * Học kỹ năng từ Shop / NPC Tàng Kinh Các
         */
        learnSkill(skillId) {
            if (!Array.isArray(this.learnedSkills)) {
                this.learnedSkills = [];
            }
            if (!Array.isArray(this.equippedSkills)) {
                this.equippedSkills = [null, null, null];
            }

            const skill = SkillSystem.getSkillById(skillId);
            if (!skill) return { success: false, msg: "Bí kíp không tồn tại!" };

            if (this.learnedSkills.includes(skillId)) {
                return { success: false, msg: "Đã học bí kíp này rồi!" };
            }

            // Kiểm tra điều kiện cảnh giới cho phép học
            if (!SkillSystem.canUseSkill(this.realmIndex, this.tierIndex, skillId)) {
                return { success: false, msg: `Chưa đạt cảnh giới yêu cầu để lĩnh ngộ (${RealmSystem.getFullRealmTitle(skill.reqRealm, skill.reqTier)})!` };
            }

            // Kiểm tra tiền tệ (Hỗn Nguyên Thạch hoặc Linh Thạch)
            const isHonNguyen = skill.currency === "hon_nguyen";
            if (isHonNguyen) {
                const currentHN = this.honNguyen || 0;
                if (currentHN >= skill.price) {
                    this.honNguyen -= skill.price;
                } else {
                    // Tự động nén từ Linh Thạch nếu có đủ (1 Tỷ Linh Thạch = 1 Hỗn Nguyên)
                    const needHN = skill.price - currentHN;
                    const needLT = needHN * 1000000000;
                    if ((this.linhThach || 0) >= needLT) {
                        this.linhThach -= needLT;
                        this.honNguyen = 0;
                    } else {
                        return { 
                            success: false, 
                            msg: `Không đủ Hỗn Nguyên Thạch! Cần ${skill.price.toLocaleString()} 🌀 (hoặc ${(skill.price * 1000000000).toLocaleString("vi-VN")} 💎 Linh Thạch).` 
                        };
                    }
                }
            } else {
                if (this.linhThach < skill.price) {
                    return { success: false, msg: "Không đủ Linh Thạch để thỉnh bí tịch!" };
                }
                this.linhThach -= skill.price;
            }

            this.learnedSkills.push(skillId);

            // Tự động trang bị vào ô trống nếu còn slot
            for (let i = 0; i < 3; i++) {
                if (!this.equippedSkills[i]) {
                    this.equippedSkills[i] = skillId;
                    break;
                }
            }

            return { success: true, skill };
        },

        /**
         * Gắn kỹ năng vào 1 trong 3 ô chiến đấu
         */
        equipSkill(skillId, slotIndex) {
            if (slotIndex < 0 || slotIndex > 2) return false;
            if (!this.learnedSkills.includes(skillId)) return false;

            // Nếu kỹ năng đã gắn ở ô khác thì hoán đổi
            const existingIndex = this.equippedSkills.indexOf(skillId);
            if (existingIndex !== -1) {
                this.equippedSkills[existingIndex] = this.equippedSkills[slotIndex];
            }

            this.equippedSkills[slotIndex] = skillId;
            return true;
        },

        /**
         * Gỡ kỹ năng khỏi ô chiến đấu
         */
        unequipSkill(slotIndex) {
            if (slotIndex < 0 || slotIndex > 2) return false;
            this.equippedSkills[slotIndex] = null;
            return true;
        },

        /**
         * Sử dụng đan dược / vật phẩm tiêu hao
         */
        useConsumable(itemOrId) {
            const itemId = (typeof itemOrId === "object" && itemOrId !== null) ? itemOrId.id : itemOrId;
            const item = (typeof itemOrId === "object" && itemOrId !== null && itemOrId.slot) ? itemOrId : ItemSystem.getItemById(itemId);
            if (!item || item.slot !== "dan_duoc") return { success: false, msg: "Vật phẩm không hợp lệ!" };

            // Kiểm tra yêu cầu Cảnh Giới của đan dược
            if (item.reqRealm !== undefined && this.realmIndex < item.reqRealm) {
                const reqRealmObj = RealmSystem.getRealm(item.reqRealm);
                const reqRealmName = reqRealmObj ? reqRealmObj.name : `Cảnh giới ${item.reqRealm}`;
                return {
                    success: false,
                    msg: `Chưa đủ cảnh giới để phục dụng! Cần đạt [${reqRealmName}] trở lên mới có thể hấp thụ linh khí của [${item.name}].`
                };
            }

            const invIndex = this.inventory.indexOf(itemId);
            if (invIndex === -1) return { success: false, msg: "Không có đan dược này trong túi!" };

            // Nếu là Cuộn Giấy Đổi Tên, không xóa ngay mà trả về cờ isRename để UI mở modal nhập tên
            if (item.isRenameScroll) {
                return { success: true, item, isRename: true, msg: "Mở giao diện đặt lại đạo hiệu!" };
            }

            this.inventory.splice(invIndex, 1);

            if (item.tinhNguyenGain) {
                this.pillsConsumed = (this.pillsConsumed || 0) + 1;
                const tinhGain = item.tinhNguyenGain;
                this.addTinhNguyen(tinhGain);
                return {
                    success: true,
                    item,
                    gainAmount: tinhGain,
                    isTinhNguyen: true,
                    isVoCucToast: true,
                    msg: `Đã dùng 1x ${item.name}, tiếp nhận +${tinhGain.toLocaleString("vi-VN")} Tinh Nguyên Đại Đạo!`
                };
            } else if (item.tuViGain) {
                this.pillsConsumed = (this.pillsConsumed || 0) + 1;
                const res = this.addTuVi(item.tuViGain);
                if (this.isVoCuc) {
                    return {
                        success: true,
                        item,
                        gainAmount: res.added,
                        isTinhNguyen: true,
                        msg: res.added > 0
                            ? `Đã dùng 1x ${item.name}, ngưng tụ được +${res.added} Tinh Nguyên Đại Đạo!`
                            : `Đã dùng 1x ${item.name}, linh khí tích lũy vào đan điền Vô Cực (${(this.vocucPendingTuVi || 0).toLocaleString("vi-VN")} / 1.000.000.000 Tu Vi)!`
                    };
                }
                return { success: true, item, gainAmount: item.tuViGain, isTinhNguyen: false, msg: `Đã dùng 1x ${item.name}, nhận được +${item.tuViGain} điểm Tu Vi!` };
            } else if (item.isResetPill) {
                const points = this.resetStats();
                return { success: true, item, msg: `Đã tẩy tủy thành công! Thu hồi lại ${points} điểm tiềm năng.` };
            } else if (itemId === "pill_chung_dao_tinh_nguyen" || item.rateGain) {
                const gain = item.rateGain || 10;
                this.breakthroughBonusRate = (this.breakthroughBonusRate || 0) + gain;
                const currentRate = this.getBreakthroughRate().totalRate;
                return {
                    success: true,
                    item,
                    msg: `Đã dùng 1x ${item.name}! Tỉ lệ độ kiếp tăng thêm +${gain}% (Tỉ lệ hiện tại: ${currentRate}%)!`
                };
            } else if (itemId === "item_tower_ticket") {
                if (!this.towerData) {
                    this.towerData = { highestFloor: 0, currentFloor: 1, dailyTickets: 3, lastResetDate: "" };
                }
                this.towerData.dailyTickets = (this.towerData.dailyTickets || 0) + 1;
                return { success: true, item, msg: `Đã dùng 1x ${item.name}, nhận được +1 Lệnh Bài Hư Không (Hiện có: ${this.towerData.dailyTickets})!` };
            } else if (itemId === "ticket_tam_dao") {
                this.addGachaTickets(1);
                return { 
                    success: true, 
                    item, 
                    isGachaTicket: true,
                    msg: `Đã kích hoạt 1x ${item.name}, nạp thành công +1 Vé Tầm Đạo (Hiện có: ${this.gachaTickets} vé tại Đài Cầu Đạo)!` 
                };
            }

            return { success: true, item, msg: `Đã sử dụng 1x ${item.name}!` };
        },

        /**
         * Đổi tên nhân vật bằng Cuộn Giấy Đổi Tên
         */
        changeName(newName) {
            const trimmed = (newName || "").trim();
            if (!trimmed) {
                return { success: false, msg: "Đạo hiệu không được để trống!" };
            }
            if (trimmed.length > 20) {
                return { success: false, msg: "Đạo hiệu quá dài (tối đa 20 ký tự)!" };
            }
            const invIndex = this.inventory.indexOf("item_rename_scroll");
            if (invIndex === -1) {
                return { success: false, msg: "Cần có [Cuộn Giấy Đổi Tên] trong túi đồ mới có thể đổi tên!" };
            }

            // Tiêu hao 1 cuộn giấy đổi tên
            this.inventory.splice(invIndex, 1);
            const oldName = this.name;
            this.name = trimmed;

            return { success: true, oldName, newName: trimmed, msg: `Đã đổi đạo hiệu thành công thành [${trimmed}]!` };
        },

        /**
         * Dùng toàn bộ đan dược cùng loại trong túi đồ (Dùng nhanh 1 lần)
         */
        useAllConsumables(itemOrId) {
            const itemId = (typeof itemOrId === "object" && itemOrId !== null) ? itemOrId.id : itemOrId;
            const item = (typeof itemOrId === "object" && itemOrId !== null && itemOrId.slot) ? itemOrId : ItemSystem.getItemById(itemId);
            if (!item || item.slot !== "dan_duoc") return { success: false, msg: "Vật phẩm không hợp lệ!" };

            // Kiểm tra yêu cầu Cảnh Giới của đan dược
            if (item.reqRealm !== undefined && this.realmIndex < item.reqRealm) {
                const reqRealmObj = RealmSystem.getRealm(item.reqRealm);
                const reqRealmName = reqRealmObj ? reqRealmObj.name : `Cảnh giới ${item.reqRealm}`;
                return {
                    success: false,
                    msg: `Chưa đủ cảnh giới để phục dụng! Cần đạt [${reqRealmName}] trở lên mới có thể hấp thụ linh khí của [${item.name}].`
                };
            }

            // Không hỗ trợ dùng hết cho Tẩy Tủy Đan và Cuộn Giấy Đổi Tên
            if (item.isResetPill || item.isRenameScroll) {
                return this.useConsumable(itemId);
            }

            // Tính chính xác số lượng vật phẩm trong túi trước khi xóa
            const count = this.inventory.filter(id => id === itemId).length;
            if (count === 0) {
                return { success: false, msg: "Không có đan dược này trong túi!" };
            }

            // Xóa toàn bộ số lượng vật phẩm này khỏi túi đồ
            this.inventory = this.inventory.filter(id => id !== itemId);

            // Cộng dồn toàn bộ Tinh Nguyên hoặc Tu Vi
            if (item.tinhNguyenGain) {
                this.pillsConsumed = (this.pillsConsumed || 0) + count;
                const totalTinhNguyen = item.tinhNguyenGain * count;
                this.addTinhNguyen(totalTinhNguyen);
                return {
                    success: true,
                    count: count,
                    totalTuVi: totalTinhNguyen,
                    isTinhNguyen: true,
                    isVoCucToast: true,
                    item: item,
                    msg: `Đã dùng hết ${count}x [${item.name}], tiếp nhận +${totalTinhNguyen.toLocaleString("vi-VN")} Tinh Nguyên Đại Đạo!`
                };
            } else if (item.tuViGain) {
                this.pillsConsumed = (this.pillsConsumed || 0) + count;
                const totalTuVi = item.tuViGain * count;
                const res = this.addTuVi(totalTuVi);
                if (this.isVoCuc) {
                    return {
                        success: true,
                        count: count,
                        totalTuVi: res.added,
                        isTinhNguyen: true,
                        item: item,
                        msg: res.added > 0
                            ? `Đã dùng hết ${count}x [${item.name}], ngưng tụ được +${res.added} Tinh Nguyên Đại Đạo!`
                            : `Đã dùng hết ${count}x [${item.name}], linh khí tích lũy vào đan điền Vô Cực (${(this.vocucPendingTuVi || 0).toLocaleString("vi-VN")} / 1.000.000.000 Tu Vi)!`
                    };
                }
                return {
                    success: true,
                    count: count,
                    totalTuVi: totalTuVi,
                    isTinhNguyen: false,
                    item: item,
                    msg: `Đã dùng hết ${count}x [${item.name}], nhận được +${totalTuVi} Tu Vi!`
                };
            } else if (itemId === "pill_chung_dao_tinh_nguyen" || item.rateGain) {
                const gainPerPill = item.rateGain || 10;
                const totalGain = gainPerPill * count;
                this.breakthroughBonusRate = (this.breakthroughBonusRate || 0) + totalGain;
                const currentRate = this.getBreakthroughRate().totalRate;
                return {
                    success: true,
                    count: count,
                    item: item,
                    msg: `Đã dùng hết ${count}x [${item.name}], tỉ lệ độ kiếp tăng thêm +${totalGain}% (Tỉ lệ hiện tại: ${currentRate}%)!`
                };
            } else if (itemId === "item_tower_ticket") {
                if (!this.towerData) {
                    this.towerData = { highestFloor: 0, currentFloor: 1, dailyTickets: 3, lastResetDate: "" };
                }
                this.towerData.dailyTickets = (this.towerData.dailyTickets || 0) + count;
                return {
                    success: true,
                    count: count,
                    item: item,
                    msg: `Đã dùng hết ${count}x [${item.name}], nhận được +${count} Lệnh Bài Hư Không (Hiện có: ${this.towerData.dailyTickets})!`
                };
            } else if (itemId === "ticket_tam_dao") {
                this.addGachaTickets(count);
                return {
                    success: true,
                    count: count,
                    item: item,
                    isGachaTicket: true,
                    msg: `Đã kích hoạt ${count}x [${item.name}], nạp thành công +${count} Vé Tầm Đạo (Hiện có: ${this.gachaTickets} vé tại Đài Cầu Đạo)!`
                };
            }

            return { success: true, count: count, item: item, msg: `Đã dùng hết ${count}x [${item.name}]!` };
        },

        /**
         * Mua vật phẩm từ tiệm Bách Bảo Các
         */
        buyItem(itemId, quantity = 1) {
            const item = ItemSystem.getItemById(itemId);
            if (!item || item.notForSale || !item.price || item.price <= 0) {
                return { success: false, msg: "Vật phẩm này là chiến lợi phẩm độc quyền, không bán trong Bách Bảo Các!" };
            }
            const totalCost = item.price * quantity;

            if (item.currency === "hon_nguyen") {
                if ((this.honNguyen || 0) < totalCost) {
                    const neededHonNguyen = totalCost - (this.honNguyen || 0);
                    const neededLinhThach = neededHonNguyen * 1000000000;
                    if (this.linhThach < neededLinhThach) {
                        return { success: false, msg: `Không đủ Hỗn Nguyên Thạch! Cần ${totalCost.toLocaleString("vi-VN")} 🌀 Hỗn Nguyên.` };
                    }
                    this.linhThach -= neededLinhThach;
                    this.honNguyen = 0;
                } else {
                    this.honNguyen -= totalCost;
                }
            } else {
                if (this.linhThach < totalCost) return { success: false, msg: "Không đủ Linh Thạch!" };
                this.linhThach -= totalCost;
            }

            // Vé Tầm Đạo nạp trực tiếp vào quỹ Đài Cầu Đạo để tiện dụng
            if (itemId === "ticket_tam_dao") {
                this.addGachaTickets(quantity);
                return {
                    success: true,
                    item,
                    quantity,
                    totalCost,
                    isGachaTicket: true,
                    msg: `Đã mua ${quantity}x [${item.name}], nạp thẳng ${quantity} vé vào Đài Cầu Đạo (Hiện có: ${this.gachaTickets} vé)!`
                };
            }

            for (let i = 0; i < quantity; i++) {
                this.inventory.push(itemId);
            }
            return { success: true, item, quantity, totalCost };
        },

        /**
         * Mua số lượng tối đa có thể của một loại đan dược dựa theo số dư Linh Thạch
         */
        buyMaxPill(itemId) {
            const item = (typeof ItemSystem !== "undefined") ? ItemSystem.getItemById(itemId) : null;
            if (!item || item.notForSale || !item.price || item.price <= 0) {
                return { success: false, reason: "invalid_item", msg: "Vật phẩm này không bán trong tiệm!" };
            }

            // Chỉ áp dụng cho đan dược thông thường, không áp dụng cho trang bị, Tẩy Tủy Đan hoặc Cuộn Giấy Đổi Tên
            if (item.slot !== "dan_duoc" || item.isResetPill || item.isRenameScroll) {
                return { success: false, reason: "not_supported", msg: "Tính năng mua hết chỉ áp dụng cho đan dược tu vi!" };
            }

            // Kiểm tra điều kiện Cảnh Giới
            if (item.reqRealm !== undefined && this.realmIndex < item.reqRealm) {
                const reqRealmObj = (typeof RealmSystem !== "undefined") ? RealmSystem.getRealm(item.reqRealm) : null;
                const reqRealmName = reqRealmObj ? reqRealmObj.name : `Cảnh giới ${item.reqRealm}`;
                return {
                    success: false,
                    reason: "realm_locked",
                    reqRealm: item.reqRealm,
                    msg: `Chưa đủ cảnh giới để mua! Cần đạt [${reqRealmName}] trở lên.`
                };
            }

            // Tính số lượng tối đa có thể mua theo số dư Linh Thạch / Hỗn Nguyên (có hỗ trợ tự động nén Linh Thạch)
            const isHonNguyen = item.currency === "hon_nguyen";
            let maxAffordable = 0;
            if (isHonNguyen) {
                const totalHonNguyenEquivalent = (this.honNguyen || 0) + Math.floor((this.linhThach || 0) / 1000000000);
                maxAffordable = Math.floor(totalHonNguyenEquivalent / item.price);
            } else {
                maxAffordable = Math.floor((this.linhThach || 0) / item.price);
            }

            if (maxAffordable <= 0) {
                return {
                    success: false,
                    reason: "not_enough_money",
                    msg: isHonNguyen ? "Không đủ Hỗn Nguyên Thạch (hoặc Linh Thạch tương đương) để mua!" : "Không đủ Linh Thạch để mua!"
                };
            }

            const totalCost = maxAffordable * item.price;
            if (isHonNguyen) {
                if ((this.honNguyen || 0) < totalCost) {
                    const neededHonNguyen = totalCost - (this.honNguyen || 0);
                    const neededLinhThach = neededHonNguyen * 1000000000;
                    this.linhThach -= neededLinhThach;
                    this.honNguyen = 0;
                } else {
                    this.honNguyen -= totalCost;
                }
            } else {
                this.linhThach -= totalCost;
            }

            // Mua tối đa Vé Tầm Đạo nạp trực tiếp vào quỹ Đài Cầu Đạo
            if (itemId === "ticket_tam_dao") {
                this.addGachaTickets(maxAffordable);
                return {
                    success: true,
                    count: maxAffordable,
                    totalCost: totalCost,
                    currency: isHonNguyen ? "hon_nguyen" : "linh_thach",
                    item: item,
                    isGachaTicket: true,
                    msg: `Đã mua tối đa ${maxAffordable}x [${item.name}], nạp thẳng ${maxAffordable} vé vào Đài Cầu Đạo (Hiện có: ${this.gachaTickets} vé)!`
                };
            }

            // Đẩy hàng loạt vào túi đồ
            for (let i = 0; i < maxAffordable; i++) {
                this.inventory.push(itemId);
            }

            return {
                success: true,
                count: maxAffordable,
                totalCost: totalCost,
                currency: isHonNguyen ? "hon_nguyen" : "linh_thach",
                item: item,
                msg: `Đã mua thành công ${maxAffordable}x [${item.name}]!`
            };
        },

        /**
         * Đổi Linh Thạch sang Hỗn Nguyên Thạch (1 Tỷ Linh Thạch = 1 Hỗn Nguyên)
         */
        exchangeLinhThachToHonNguyen(amount = 1) {
            amount = Math.max(1, parseInt(amount, 10) || 1);
            const cost = amount * 1000000000;
            if (this.linhThach < cost) {
                return {
                    success: false,
                    msg: `Không đủ Linh Thạch! Cần ${cost.toLocaleString("vi-VN")} Linh Thạch để đổi ${amount} Hỗn Nguyên Thạch.`
                };
            }
            this.linhThach -= cost;
            this.honNguyen = (this.honNguyen || 0) + amount;
            return {
                success: true,
                amount: amount,
                msg: `Đã quy đổi thành công ${cost.toLocaleString("vi-VN")} Linh Thạch thành +${amount} 🌀 Hỗn Nguyên Thạch!`
            };
        },

        /**
         * Đổi Hỗn Nguyên Thạch sang Linh Thạch (1 Hỗn Nguyên = 1 Tỷ Linh Thạch)
         */
        exchangeHonNguyenToLinhThach(amount = 1) {
            amount = Math.max(1, parseInt(amount, 10) || 1);
            if ((this.honNguyen || 0) < amount) {
                return {
                    success: false,
                    msg: `Không đủ Hỗn Nguyên Thạch! Hiện chỉ có ${this.honNguyen || 0} 🌀 Hỗn Nguyên.`
                };
            }
            const gain = amount * 1000000000;
            this.honNguyen -= amount;
            this.linhThach = (this.linhThach || 0) + gain;
            return {
                success: true,
                amount: amount,
                gain: gain,
                msg: `Đã đổi thành công ${amount} 🌀 Hỗn Nguyên thành +${gain.toLocaleString("vi-VN")} 💎 Linh Thạch!`
            };
        },

        /**
         * Quy đổi toàn bộ Linh Thạch khả dụng thành Hỗn Nguyên Thạch (Nén Tỷ Linh Thạch)
         */
        exchangeAllLinhThachToHonNguyen() {
            const canExchange = Math.floor((this.linhThach || 0) / 1000000000);
            if (canExchange <= 0) {
                return {
                    success: false,
                    msg: `Chưa đủ 1 Tỷ Linh Thạch để quy đổi sang Hỗn Nguyên Thạch (Cần tối thiểu 1.000.000.000 💎).`
                };
            }
            const cost = canExchange * 1000000000;
            this.linhThach -= cost;
            this.honNguyen = (this.honNguyen || 0) + canExchange;
            return {
                success: true,
                amount: canExchange,
                cost: cost,
                msg: `Đã nén quy đổi toàn bộ ${cost.toLocaleString("vi-VN")} Linh Thạch thành +${canExchange.toLocaleString("vi-VN")} 🌀 Hỗn Nguyên Thạch!`
            };
        },

        /**
         * Mua Lệnh Bài Hư Không trực tiếp bằng Hỗn Nguyên Thạch (hoặc tự động đổi từ Linh Thạch)
         */
        buyTowerTicket(quantity = 1) {
            quantity = Math.max(1, parseInt(quantity, 10) || 1);
            let ticketPriceHonNguyen = 5000;
            if (typeof ItemSystem !== "undefined") {
                const item = ItemSystem.getItemById("item_tower_ticket");
                if (item && item.price) ticketPriceHonNguyen = item.price;
            } else if (typeof TOWER_CONFIG !== "undefined" && TOWER_CONFIG.TICKET_PRICE) {
                ticketPriceHonNguyen = TOWER_CONFIG.TICKET_PRICE;
            }
            const totalCostHonNguyen = ticketPriceHonNguyen * quantity;

            if ((this.honNguyen || 0) >= totalCostHonNguyen) {
                this.honNguyen -= totalCostHonNguyen;
            } else {
                const neededHonNguyen = totalCostHonNguyen - (this.honNguyen || 0);
                const neededLinhThach = neededHonNguyen * 1000000000;
                if (this.linhThach < neededLinhThach) {
                    return {
                        success: false,
                        msg: `Không đủ Hỗn Nguyên Thạch! Cần ${totalCostHonNguyen.toLocaleString("vi-VN")} 🌀 Hỗn Nguyên để mua ${quantity} Lệnh Bài Hư Không.`
                    };
                }
                this.linhThach -= neededLinhThach;
                this.honNguyen = 0;
            }

            if (!this.towerData) {
                this.towerData = { highestFloor: 0, currentFloor: 1, dailyTickets: 3, lastResetDate: "" };
            }
            this.towerData.dailyTickets = (this.towerData.dailyTickets || 0) + quantity;
            return {
                success: true,
                quantity: quantity,
                totalCost: totalCostHonNguyen,
                tickets: this.towerData.dailyTickets,
                msg: `Đã mua thành công ${quantity} Lệnh Bài Hư Không với giá ${totalCostHonNguyen.toLocaleString("vi-VN")} 🌀 Hỗn Nguyên!`
            };
        },

        /**
         * Bán 1 vật phẩm khỏi túi đồ
         */
        sellItem(itemId) {
            const invIndex = this.inventory.indexOf(itemId);
            if (invIndex === -1) return false;

            const item = ItemSystem.getItemById(itemId);
            const sellVal = item ? item.sellPrice : 10;

            this.inventory.splice(invIndex, 1);
            if (item && item.currency === "hon_nguyen") {
                this.honNguyen = (this.honNguyen || 0) + sellVal;
            } else {
                this.linhThach += sellVal;
            }
            return { success: true, item, gain: sellVal };
        },

        /**
         * Bán toàn bộ vật phẩm cùng loại trong túi đồ
         */
        sellAllItems(itemId) {
            const item = ItemSystem.getItemById(itemId);
            if (!item) return false;

            const count = this.inventory.filter(id => id === itemId).length;
            if (count === 0) return false;

            const unitSellPrice = item.sellPrice || 10;
            const totalGain = unitSellPrice * count;

            this.inventory = this.inventory.filter(id => id !== itemId);
            if (item && item.currency === "hon_nguyen") {
                this.honNguyen = (this.honNguyen || 0) + totalGain;
            } else {
                this.linhThach += totalGain;
            }

            return { success: true, count: count, totalGain: totalGain, item: item };
        },

        /**
         * Bán các bản trùng lặp của 1 loại trang bị trong túi đồ
         * @param {string} itemId - ID trang bị
         * @param {number|null} keepCount - Số lượng giữ lại trong túi (nếu null: giữ 0 nếu đang mặc, giữ 1 nếu chưa mặc)
         */
        sellItemDuplicates(itemId, keepCount = null) {
            const item = (typeof ItemSystem !== "undefined") ? ItemSystem.getItemById(itemId) : null;
            if (!item) return { success: false, msg: "Trang bị không tồn tại!" };

            const equipSlots = ["non", "giap", "vukhi"];
            if (!equipSlots.includes(item.slot)) {
                return { success: false, msg: "Vật phẩm này không phải là trang bị!" };
            }

            const isEquipped = (this.equipped?.non === itemId || this.equipped?.giap === itemId || this.equipped?.vukhi === itemId);
            const targetKeep = (keepCount !== null) ? keepCount : (isEquipped ? 0 : 1);

            const totalInInv = (this.inventory || []).filter(id => id === itemId).length;
            const sellCount = Math.max(0, totalInInv - targetKeep);

            if (sellCount <= 0) {
                return {
                    success: false,
                    msg: `Không có bản trùng lặp nào của [${item.name}] để bán!`
                };
            }

            let removed = 0;
            const newInv = [];
            for (const id of (this.inventory || [])) {
                if (id === itemId && removed < sellCount) {
                    removed++;
                } else {
                    newInv.push(id);
                }
            }
            this.inventory = newInv;

            const unitSellPrice = item.sellPrice || 10;
            const totalGain = unitSellPrice * sellCount;
            this.linhThach = (this.linhThach || 0) + totalGain;

            return {
                success: true,
                item,
                soldCount: sellCount,
                keptCount: totalInInv - sellCount,
                totalGain
            };
        },

        /**
         * Phân tích và lấy danh sách tổng hợp toàn bộ trang bị trùng lặp trong túi đồ
         * @param {boolean} keepOneUnused - Giữ lại 1 bản cho mỗi loại trang bị chưa mặc trên người (mặc định: true)
         */
        getDuplicateEquipmentSummary(keepOneUnused = true) {
            const equipSlots = ["non", "giap", "vukhi"];
            const counts = new Map();

            (this.inventory || []).forEach(id => {
                const item = (typeof ItemSystem !== "undefined") ? ItemSystem.getItemById(id) : null;
                if (item && equipSlots.includes(item.slot)) {
                    counts.set(id, (counts.get(id) || 0) + 1);
                }
            });

            const equippedIds = new Set([
                this.equipped?.non,
                this.equipped?.giap,
                this.equipped?.vukhi
            ].filter(Boolean));

            const duplicates = [];
            let totalCount = 0;
            let totalGain = 0;

            counts.forEach((count, id) => {
                const isEquipped = equippedIds.has(id);
                const keepCount = isEquipped ? 0 : (keepOneUnused ? 1 : 0);
                const dupsCount = Math.max(0, count - keepCount);

                if (dupsCount > 0) {
                    const item = ItemSystem.getItemById(id);
                    const unitPrice = item ? (item.sellPrice || 10) : 10;
                    const gain = unitPrice * dupsCount;

                    duplicates.push({
                        item,
                        isEquipped,
                        keepCount,
                        totalInInv: count,
                        dupsCount,
                        unitPrice,
                        totalGain: gain
                    });

                    totalCount += dupsCount;
                    totalGain += gain;
                }
            });

            return {
                duplicates,
                totalCount,
                totalGain
            };
        },

        /**
         * Bán nhanh toàn bộ trang bị trùng lặp trong túi đồ
         * @param {boolean} keepOneUnused - Giữ lại 1 bản cho mỗi loại trang bị chưa mặc trên người
         */
        sellAllDuplicateEquipment(keepOneUnused = true) {
            const summary = this.getDuplicateEquipmentSummary(keepOneUnused);
            if (summary.totalCount === 0) {
                return { success: false, msg: "Không có trang bị trùng lặp để bán!" };
            }

            const toRemoveMap = new Map();
            summary.duplicates.forEach(d => {
                toRemoveMap.set(d.item.id, d.dupsCount);
            });

            let actuallyRemoved = 0;
            const newInventory = [];
            for (const id of (this.inventory || [])) {
                const needRemove = toRemoveMap.get(id) || 0;
                if (needRemove > 0) {
                    toRemoveMap.set(id, needRemove - 1);
                    actuallyRemoved++;
                } else {
                    newInventory.push(id);
                }
            }

            this.inventory = newInventory;
            this.linhThach = (this.linhThach || 0) + summary.totalGain;

            return {
                success: true,
                totalCount: actuallyRemoved,
                totalGain: summary.totalGain,
                summary
            };
        }
    });
})();
