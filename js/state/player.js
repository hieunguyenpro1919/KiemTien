/**
 * QUẢN LÝ TRẠNG THÁI NHÂN VẬT (PLAYER STATE)
 * - 9 Cảnh Giới, 10 Tầng mỗi cảnh
 * - Mỗi lần thăng tầng nhận đúng 4 điểm tiềm năng
 * - 3 Ô Trang Bị: Nón, Giáp, Vũ Khí
 * - 3 Ô Kỹ Năng: Học từ Shop/NPC Tàng Kinh Các theo cảnh giới
 */

class Player {
    constructor() {
        this.name = "Tiêu Viêm";
        this.realmIndex = 0; // Tôi Khí (0) -> Đỉnh Cấp Ngai (8)
        this.tierIndex = 0;  // Tầng 1 (0) -> Đỉnh Phong (9)
        this.tuVi = 0;
        this.statPoints = 4; // Bắt đầu với 4 điểm ban đầu để cộng

        // Điểm thuộc tính tự do đã cộng
        this.statVatLi = 0;
        this.statPhep = 0;
        this.statMau = 0;

        // 3 Ô Trang Bị
        this.equipped = {
            non: null,   // itemId
            giap: null,  // itemId
            vukhi: null  // itemId
        };

        // 3 Ô Kỹ Năng trong trận
        this.equippedSkills = [
            "skill_toai_thach_quyen", // Ô 1
            "skill_dan_hoa_thuat",    // Ô 2
            null                      // Ô 3
        ];

        // Danh sách Kỹ năng đã học
        this.learnedSkills = [
            "skill_toai_thach_quyen",
            "skill_dan_hoa_thuat"
        ];

        // Túi đồ (Inventory)
        this.inventory = [
            "hat_01",
            "armor_01",
            "weapon_01",
            "pill_tu_khi_tieu",
            "pill_tu_khi_tieu",
            "item_rename_scroll"
        ];

        // Hệ thống Danh Hiệu (Titles)
        this.equippedTitle = "title_so_nhap";
        this.unlockedTitles = ["title_so_nhap"];

        // Tiền tệ: Linh Thạch
        this.linhThach = 200;

        // Danh sách ải đã vượt qua
        this.clearedStages = [];

        // Thời điểm online gần nhất (dùng tính tu vi treo máy ngoại tuyến)
        this.lastOnlineTime = Date.now();

        // Trạng thái chiến đấu
        this.currentHp = this.getMaxHp();
    }

    /**
     * Lấy Tu Vi tối đa của tầng hiện tại
     */
    getMaxTuVi() {
        return RealmSystem.getMaxTuVi(this.realmIndex, this.tierIndex);
    }

    /**
     * Kiểm tra có đủ điều kiện Đột Phá hay không
     * Từ Vô Thượng Lộ trở lên hoặc khi ở các cảnh giới cao, tầng tu vi có thể tăng vô hạn!
     */
    canBreakthrough() {
        return this.tuVi >= this.getMaxTuVi();
    }

    /**
     * Thêm Tu Vi (từ đả tọa, dùng đan dược, vượt ải)
     */
    addTuVi(amount) {
        amount = Number(amount);
        if (isNaN(amount) || amount <= 0) {
            return { added: 0, canBreakthrough: this.canBreakthrough() };
        }
        if (isNaN(this.tuVi) || typeof this.tuVi !== "number") {
            this.tuVi = 0;
        }
        this.tuVi += Math.floor(amount);
        return {
            added: Math.floor(amount),
            canBreakthrough: this.canBreakthrough()
        };
    }

    /**
     * Đột Phá Cảnh Giới / Tăng Tầng Tu Vi
     * MỖI LẦN TĂNG TU VI SẼ CÓ 4 ĐIỂM TIỀM NĂNG
     */
    breakthrough() {
        if (!this.canBreakthrough()) return false;

        const maxTuVi = this.getMaxTuVi();
        this.tuVi = Math.max(0, this.tuVi - maxTuVi);

        let isMajor = false;
        let blockedReason = null;

        // Kiểm tra xem cảnh giới tiếp theo yêu cầu ải gì
        const nextRealmIndex = this.realmIndex + 1;
        const reqStageForNext = RealmSystem.getBreakthroughReqStage(nextRealmIndex);
        const hasClearedReqStage = !reqStageForNext || (this.clearedStages && this.clearedStages.includes(reqStageForNext));

        if (this.realmIndex < 8) {
            // Các cảnh giới thông thường (Tôi Khí -> Ngọc Điện: Realm 0 đến 7, mỗi cảnh giới 10 tầng)
            if (this.tierIndex < RealmSystem.getTierCount() - 1) {
                this.tierIndex++;
            } else {
                // Đã đạt Đỉnh Phong -> Đột phá đại cảnh giới tiếp theo
                this.realmIndex++;
                this.tierIndex = 0;
                isMajor = true;
            }
        } else {
            // Từ Đỉnh Cấp Ngai (Realm 8), Vô Thượng Lộ (Realm 9), Vạn Vì Tinh Tú (Realm 10)...
            // Quy tắc: Muốn đột phá lên đại cảnh giới tiếp theo thì BUỘC PHẢI đánh bại ẢI tương ứng!
            // Nếu chưa vượt ải tương ứng thì sẽ kẹt ở cảnh giới đó, tầng vẫn tăng và có thể đến vô hạn!
            if (this.realmIndex < RealmSystem.getRealmCount() - 1 && hasClearedReqStage) {
                // Đã vượt ải yêu cầu -> Đột phá đại cảnh giới thành công!
                this.realmIndex++;
                this.tierIndex = 0;
                isMajor = true;
            } else {
                // Chưa vượt ải tương ứng (hoặc đã ở cảnh giới chí cao vô thượng cuối cùng) -> Tầng tăng vô hạn!
                this.tierIndex++;
                if (reqStageForNext && !hasClearedReqStage) {
                    const reqStageObj = typeof StageSystem !== "undefined" ? StageSystem.getStageById(reqStageForNext) : null;
                    blockedReason = reqStageObj ? reqStageObj.name : reqStageForNext;
                }
            }
        }

        // CỘNG 4 ĐIỂM TIỀM NĂNG CHO NGƯỜI CHƠI
        this.statPoints += STAT_POINTS_PER_TIER;

        // Hồi đầy máu khi đột phá
        this.currentHp = this.getMaxHp();

        return {
            success: true,
            isMajor: isMajor,
            blockedReason: blockedReason,
            pointsAdded: STAT_POINTS_PER_TIER,
            newTitle: this.getFullTitle(),
            totalPoints: this.statPoints,
            realm: RealmSystem.getRealm(this.realmIndex)
        };
    }

    /**
     * Cộng điểm chỉ số (Vật lí, Phép, Máu)
     */
    allocateStat(type, amount = 1) {
        if (this.statPoints < amount || amount <= 0) return false;

        if (type === "vat_li") {
            this.statVatLi += amount;
            this.statPoints -= amount;
        } else if (type === "phep") {
            this.statPhep += amount;
            this.statPoints -= amount;
        } else if (type === "mau") {
            this.statMau += amount;
            this.statPoints -= amount;
            // Tăng máu tối đa đồng thời tăng máu hiện tại tương ứng
            this.currentHp += amount * 25;
        } else {
            return false;
        }

        return true;
    }

    /**
     * Tẩy Tủy: Trả lại toàn bộ điểm tiềm năng đã cộng
     */
    resetStats() {
        const totalPointsToReturn = this.statVatLi + this.statPhep + this.statMau;
        this.statPoints += totalPointsToReturn;
        this.statVatLi = 0;
        this.statPhep = 0;
        this.statMau = 0;
        this.currentHp = this.getMaxHp();
        return totalPointsToReturn;
    }

    /**
     * Tính toán Tổng Chỉ Số Nhân Vật (Base + Thuộc Tính Cộng + 3 Ô Trang Bị)
     */
    getTotalStats() {
        // Chỉ số cơ sở từ cảnh giới và tầng
        const absTier = RealmSystem.getAbsoluteTier(this.realmIndex, this.tierIndex);
        const baseHp = 150 + absTier * 45;
        const baseVatLi = 15 + absTier * 5;
        const basePhep = 15 + absTier * 5;
        const basePhongThu = 5 + absTier * 3;
        const baseKhangPhep = 5 + absTier * 3;
        const baseBaoKich = 5;

        // Chỉ số cộng từ điểm tiềm năng
        // 1 điểm Máu = +25 HP
        // 1 điểm Vật Lí = +3 Sát Thương Vật Lí
        // 1 điểm Phép = +3 Sát Thương Phép
        const allocatedHp = this.statMau * 25;
        const allocatedVatLi = this.statVatLi * 3;
        const allocatedPhep = this.statPhep * 3;

        // Chỉ số cộng từ 3 Ô Trang Bị
        let equipHp = 0;
        let equipVatLi = 0;
        let equipPhep = 0;
        let equipPhongThu = 0;
        let equipKhangPhep = 0;
        let equipBaoKich = 0;

        ["non", "giap", "vukhi"].forEach(slot => {
            const itemId = this.equipped[slot];
            if (itemId) {
                const item = ItemSystem.getItemById(itemId);
                if (item && item.stats) {
                    if (item.stats.mau) equipHp += item.stats.mau;
                    if (item.stats.vatLi) equipVatLi += item.stats.vatLi;
                    if (item.stats.phep) equipPhep += item.stats.phep;
                    if (item.stats.phongThu) equipPhongThu += item.stats.phongThu;
                    if (item.stats.khangPhep) equipKhangPhep += item.stats.khangPhep;
                    if (item.stats.baoKich) equipBaoKich += item.stats.baoKich;
                }
            }
        });

        // Chỉ số cộng từ Danh Hiệu Đang Trang Bị
        let titleHp = 0;
        let titleVatLi = 0;
        let titlePhep = 0;
        let titlePhongThu = 0;
        let titleKhangPhep = 0;
        let titleBaoKich = 0;

        if (this.equippedTitle && typeof TitleSystem !== "undefined") {
            const titleObj = TitleSystem.getTitleById(this.equippedTitle);
            if (titleObj && titleObj.buffs) {
                if (titleObj.buffs.mau) titleHp += titleObj.buffs.mau;
                if (titleObj.buffs.vatLi) titleVatLi += titleObj.buffs.vatLi;
                if (titleObj.buffs.phep) titlePhep += titleObj.buffs.phep;
                if (titleObj.buffs.phongThu) titlePhongThu += titleObj.buffs.phongThu;
                if (titleObj.buffs.khangPhep) titleKhangPhep += titleObj.buffs.khangPhep;
                if (titleObj.buffs.baoKich) titleBaoKich += titleObj.buffs.baoKich;
            }
        }

        const maxHp = baseHp + allocatedHp + equipHp + titleHp;
        const totalVatLi = baseVatLi + allocatedVatLi + equipVatLi + titleVatLi;
        const totalPhep = basePhep + allocatedPhep + equipPhep + titlePhep;
        const totalPhongThu = basePhongThu + equipPhongThu + titlePhongThu;
        const totalKhangPhep = baseKhangPhep + equipKhangPhep + titleKhangPhep;
        const totalBaoKich = Math.min(75, baseBaoKich + equipBaoKich + titleBaoKich);

        return {
            maxHp,
            vatLi: totalVatLi,
            phep: totalPhep,
            phongThu: totalPhongThu,
            khangPhep: totalKhangPhep,
            baoKich: totalBaoKich,

            // Chi tiết đóng góp
            base: { hp: baseHp, vatLi: baseVatLi, phep: basePhep, phongThu: basePhongThu, khangPhep: baseKhangPhep },
            allocated: { hp: allocatedHp, vatLi: allocatedVatLi, phep: allocatedPhep },
            equipment: { hp: equipHp, vatLi: equipVatLi, phep: equipPhep, phongThu: equipPhongThu, khangPhep: equipKhangPhep, baoKich: equipBaoKich },
            title: { hp: titleHp, vatLi: titleVatLi, phep: titlePhep, phongThu: titlePhongThu, khangPhep: titleKhangPhep, baoKich: titleBaoKich }
        };
    }

    getMaxHp() {
        return this.getTotalStats().maxHp;
    }

    getFullTitle() {
        return RealmSystem.getFullRealmTitle(this.realmIndex, this.tierIndex);
    }

    // ================= XỬ LÝ TRANG BỊ (3 Ô) =================

    /**
     * Mặc trang bị vào ô chỉ định (nón, giáp, vũ khí)
     */
    equipItem(itemId) {
        const item = ItemSystem.getItemById(itemId);
        if (!item || !["non", "giap", "vukhi"].includes(item.slot)) return false;

        // Kiểm tra yêu cầu cảnh giới của trang bị
        if (this.realmIndex < item.reqRealm) {
            return { success: false, msg: `Cần cảnh giới ${RealmSystem.getRealm(item.reqRealm).name} mới có thể trang bị!` };
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
    }

    /**
     * Tháo trang bị chuyển về túi
     */
    unequipItem(slot) {
        if (!["non", "giap", "vukhi"].includes(slot)) return false;
        const currentItem = this.equipped[slot];
        if (!currentItem) return false;

        this.inventory.push(currentItem);
        this.equipped[slot] = null;
        this.currentHp = Math.min(this.currentHp, this.getMaxHp());

        return true;
    }

    // ================= XỬ LÝ KỸ NĂNG (3 Ô) =================

    /**
     * Học kỹ năng từ Shop / NPC Tàng Kinh Các
     */
    learnSkill(skillId) {
        const skill = SkillSystem.getSkillById(skillId);
        if (!skill) return { success: false, msg: "Bí kíp không tồn tại!" };

        if (this.learnedSkills.includes(skillId)) {
            return { success: false, msg: "Đã học bí kíp này rồi!" };
        }

        // Kiểm tra điều kiện cảnh giới cho phép học
        if (!SkillSystem.canUseSkill(this.realmIndex, this.tierIndex, skillId)) {
            return { success: false, msg: `Chưa đạt cảnh giới yêu cầu để lĩnh ngộ (${RealmSystem.getFullRealmTitle(skill.reqRealm, skill.reqTier)})!` };
        }

        // Kiểm tra tiền Linh Thạch
        if (this.linhThach < skill.price) {
            return { success: false, msg: "Không đủ Linh Thạch để thỉnh bí tịch!" };
        }

        this.linhThach -= skill.price;
        this.learnedSkills.push(skillId);

        // Tự động trang bị vào ô trống nếu còn slot
        for (let i = 0; i < 3; i++) {
            if (!this.equippedSkills[i]) {
                this.equippedSkills[i] = skillId;
                break;
            }
        }

        return { success: true, skill };
    }

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
    }

    /**
     * Gỡ kỹ năng khỏi ô chiến đấu
     */
    unequipSkill(slotIndex) {
        if (slotIndex < 0 || slotIndex > 2) return false;
        this.equippedSkills[slotIndex] = null;
        return true;
    }

    // ================= XỬ LÝ ĐAN DƯỢC & MUA BÁN =================

    useConsumable(itemId) {
        const item = ItemSystem.getItemById(itemId);
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

        if (item.tuViGain) {
            this.addTuVi(item.tuViGain);
            return { success: true, item, msg: `Đã dùng 1x ${item.name}, nhận được +${item.tuViGain} điểm Tu Vi!` };
        } else if (item.isResetPill) {
            const points = this.resetStats();
            return { success: true, item, msg: `Đã tẩy tủy thành công! Thu hồi lại ${points} điểm tiềm năng.` };
        }

        return { success: true, item, msg: `Đã sử dụng 1x ${item.name}!` };
    }

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
    }

    /**
     * Dùng toàn bộ đan dược cùng loại trong túi đồ (Dùng nhanh 1 lần)
     */
    useAllConsumables(itemId) {
        const item = ItemSystem.getItemById(itemId);
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

        // Xóa toàn bộ vật phẩm itemId khỏi túi đồ
        this.inventory = this.inventory.filter(id => id !== itemId);

        // Cộng dồn toàn bộ Tu Vi
        if (item.tuViGain) {
            const totalTuVi = item.tuViGain * count;
            this.addTuVi(totalTuVi);
            return {
                success: true,
                count: count,
                totalTuVi: totalTuVi,
                item: item,
                msg: `Đã dùng hết ${count}x [${item.name}], nhận được +${totalTuVi} Tu Vi!`
            };
        }

        return { success: true, count: count, item: item, msg: `Đã dùng hết ${count}x [${item.name}]!` };
    }

    buyItem(itemId, quantity = 1) {
        const item = ItemSystem.getItemById(itemId);
        if (!item) return { success: false, msg: "Vật phẩm không tồn tại!" };
        const totalCost = item.price * quantity;
        if (this.linhThach < totalCost) return { success: false, msg: "Không đủ Linh Thạch!" };

        this.linhThach -= totalCost;
        for (let i = 0; i < quantity; i++) {
            this.inventory.push(itemId);
        }
        return { success: true, item, quantity, totalCost };
    }

    sellItem(itemId) {
        const invIndex = this.inventory.indexOf(itemId);
        if (invIndex === -1) return false;

        const item = ItemSystem.getItemById(itemId);
        const sellVal = item ? item.sellPrice : 10;

        this.inventory.splice(invIndex, 1);
        this.linhThach += sellVal;
        return { success: true, item, gain: sellVal };
    }

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
        this.linhThach += totalGain;

        return { success: true, count: count, totalGain: totalGain, item: item };
    }

    // ================= LƯU & TẢI TRẠNG THÁI =================

    toJSON() {
        return {
            name: this.name,
            equippedTitle: this.equippedTitle,
            unlockedTitles: this.unlockedTitles,
            realmIndex: this.realmIndex,
            tierIndex: this.tierIndex,
            tuVi: isNaN(this.tuVi) ? 0 : this.tuVi,
            statPoints: this.statPoints,
            statVatLi: this.statVatLi,
            statPhep: this.statPhep,
            statMau: this.statMau,
            equipped: this.equipped,
            equippedSkills: this.equippedSkills,
            learnedSkills: this.learnedSkills,
            inventory: this.inventory,
            hasHadRenameScroll: true,
            linhThach: this.linhThach,
            clearedStages: this.clearedStages,
            lastOnlineTime: Date.now()
        };
    }

    fromJSON(data) {
        if (!data) return;
        this.name = data.name || this.name;
        this.equippedTitle = data.equippedTitle || "title_so_nhap";
        this.unlockedTitles = data.unlockedTitles || ["title_so_nhap"];
        this.realmIndex = data.realmIndex || 0;
        this.tierIndex = data.tierIndex || 0;
        this.tuVi = isNaN(data.tuVi) ? 0 : (data.tuVi || 0);
        this.statPoints = data.statPoints !== undefined ? data.statPoints : 4;
        this.statVatLi = data.statVatLi || 0;
        this.statPhep = data.statPhep || 0;
        this.statMau = data.statMau || 0;
        this.equipped = data.equipped || { non: null, giap: null, vukhi: null };
        this.equippedSkills = data.equippedSkills || ["skill_toai_thach_quyen", "skill_dan_hoa_thuat", null];
        this.learnedSkills = data.learnedSkills || ["skill_toai_thach_quyen", "skill_dan_hoa_thuat"];
        this.inventory = data.inventory || [];
        // Tặng 1 Cuộn Giấy Đổi Tên cho người chơi nếu chưa từng nhận
        if (!this.inventory.includes("item_rename_scroll") && !data.hasHadRenameScroll) {
            this.inventory.push("item_rename_scroll");
        }
        this.linhThach = data.linhThach !== undefined ? data.linhThach : 200;
        this.clearedStages = data.clearedStages || [];
        this.lastOnlineTime = data.lastOnlineTime || Date.now();
        this.currentHp = this.getMaxHp();
    }
}

if (typeof window !== "undefined") {
    window.Player = Player;
}
