/**
 * QUẢN LÝ TRẠNG THÁI NHÂN VẬT (PLAYER STATE)
 * - 9 Cảnh Giới, 10 Tầng mỗi cảnh
 * - Mỗi lần thăng tầng nhận đúng 4 điểm tiềm năng
 * - 3 Ô Trang Bị: Nón, Giáp, Vũ Khí
 * - 3 Ô Kỹ Năng: Học từ Shop/NPC Tàng Kinh Các theo cảnh giới
 */

class Player {
    /**
     * Khung mẫu dữ liệu mặc định (DEFAULT_PLAYER_DATA)
     * Đảm bảo mọi bản lưu (save data) cũ hoặc mới luôn có đầy đủ cấu trúc chuẩn
     */
    static getDefaultData() {
        return {
            saveVersion: 2,
            name: "Tiêu Viêm",
            realmIndex: 0, // Tôi Khí (0) -> Đỉnh Cấp Ngai (8) -> Vô Thượng Lộ...
            tierIndex: 0,  // Tầng 1 (0) -> Đỉnh Phong (9)
            tuVi: 0,
            statPoints: 4, // Bắt đầu với 4 điểm tiềm năng
            statVatLi: 0,
            statPhep: 0,
            statMau: 0,
            equipped: {
                non: null,   // itemId
                giap: null,  // itemId
                vukhi: null  // itemId
            },
            equippedSkills: [
                "skill_toai_thach_quyen", // Ô 1
                "skill_dan_hoa_thuat",    // Ô 2
                null                      // Ô 3
            ],
            learnedSkills: [
                "skill_toai_thach_quyen",
                "skill_dan_hoa_thuat"
            ],
            inventory: [
                "hat_01",
                "armor_01",
                "weapon_01",
                "pill_tu_khi_tieu",
                "pill_tu_khi_tieu",
                "item_rename_scroll"
            ],
            equippedTitle: "title_so_nhap",
            unlockedTitles: ["title_so_nhap"],
            hasHadRenameScroll: true,
            linhThach: 200,
            clearedStages: [],
            pillsConsumed: 0,
            lastOnlineTime: Date.now()
        };
    }

    constructor() {
        const d = Player.getDefaultData();
        this.name = d.name;
        this.realmIndex = d.realmIndex;
        this.tierIndex = d.tierIndex;
        this.tuVi = d.tuVi;
        this.statPoints = d.statPoints;
        this.statVatLi = d.statVatLi;
        this.statPhep = d.statPhep;
        this.statMau = d.statMau;
        this.equipped = { ...d.equipped };
        this.equippedSkills = [...d.equippedSkills];
        this.learnedSkills = [...d.learnedSkills];
        this.inventory = [...d.inventory];
        this.equippedTitle = d.equippedTitle;
        this.unlockedTitles = [...d.unlockedTitles];
        this.hasHadRenameScroll = true;
        this.linhThach = d.linhThach;
        this.clearedStages = [...d.clearedStages];
        this.pillsConsumed = d.pillsConsumed || 0;
        this.lastOnlineTime = d.lastOnlineTime;
        this.currentHp = this.getMaxHp();
    }

    /**
     * Lấy Tu Vi tối đa của tầng hiện tại
     */
    getMaxTuVi() {
        return RealmSystem.getMaxTuVi(this.realmIndex, this.tierIndex);
    }

    /**
     * Tốc độ nhận Tu Vi tự nhiên khi đả tọa (mỗi giây), áp dụng buff danh hiệu nếu có
     */
    getAfkTuViRate() {
        let rate = RealmSystem.getAfkTuViRate(this.realmIndex, this.tierIndex);
        if (this.equippedTitle === "title_phe_co") {
            rate = Math.floor(rate * 1.5);
        }
        return rate;
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
            if (this.currentHp !== undefined) {
                this.currentHp = Math.min(this.getMaxHp(), this.currentHp + amount * 30);
            }
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
     * Áp dụng Phương Án 1: Cơ chế khuếch đại Phần Trăm (%) kết hợp Chỉ Số Phẳng
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

        // Chỉ số cộng từ điểm tiềm năng (Phương án 1: Scale Phần Trăm + Chỉ Số Phẳng)
        // 1 điểm Máu = +30 HP phẳng VÀ +0.4% Tổng HP
        // 1 điểm Vật Lí = +5 Sát Thương Vật Lí phẳng VÀ +0.35% Tổng Sát Thương Vật Lí
        // 1 điểm Phép = +5 Sát Thương Phép phẳng VÀ +0.35% Tổng Sát Thương Phép
        const allocatedHp = (this.statMau || 0) * 30;
        const allocatedVatLi = (this.statVatLi || 0) * 5;
        const allocatedPhep = (this.statPhep || 0) * 5;

        // Hệ số nhân phần trăm (%) khuếch đại
        const hpMultiplier = 1 + (this.statMau || 0) * 0.004;
        const vatLiMultiplier = 1 + (this.statVatLi || 0) * 0.0035;
        const phepMultiplier = 1 + (this.statPhep || 0) * 0.0035;

        // Chỉ số cộng từ 3 Ô Trang Bị
        let equipHp = 0;
        let equipVatLi = 0;
        let equipPhep = 0;
        let equipPhongThu = 0;
        let equipKhangPhep = 0;
        let equipBaoKich = 0;

        const equippedMap = this.equipped || {};
        ["non", "giap", "vukhi"].forEach(slot => {
            const itemId = equippedMap[slot];
            if (itemId && typeof ItemSystem !== "undefined") {
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

        // Tổng chỉ số trước khi nhân hệ số phần trăm
        const rawHp = baseHp + allocatedHp + equipHp + titleHp;
        const rawVatLi = baseVatLi + allocatedVatLi + equipVatLi + titleVatLi;
        const rawPhep = basePhep + allocatedPhep + equipPhep + titlePhep;

        // Áp dụng hệ số nhân phần trăm khuếch đại
        const maxHp = Math.round(rawHp * hpMultiplier);
        const totalVatLi = Math.round(rawVatLi * vatLiMultiplier);
        const totalPhep = Math.round(rawPhep * phepMultiplier);

        // Chỉ số phụ hưởng lợi từ điểm tiềm năng:
        // - Mỗi 10 điểm Thể Chất (Máu): +1 Phòng Ngự & +1 Kháng Phép
        // - Mỗi 20 điểm Pháp Cường (Phép): +1 Kháng Phép
        // - Mỗi 20 điểm Lực Đạo (Vật Lí): +1% Tỉ Lệ Bạo Kích
        const bonusDefFromMau = Math.floor((this.statMau || 0) / 10);
        const bonusResFromPhep = Math.floor((this.statPhep || 0) / 20);
        const bonusCritFromVatLi = Math.floor((this.statVatLi || 0) / 20);

        const totalPhongThu = basePhongThu + equipPhongThu + titlePhongThu + bonusDefFromMau;
        const totalKhangPhep = baseKhangPhep + equipKhangPhep + titleKhangPhep + bonusDefFromMau + bonusResFromPhep;
        const totalBaoKich = Math.min(75, baseBaoKich + equipBaoKich + titleBaoKich + bonusCritFromVatLi);

        return {
            maxHp,
            vatLi: totalVatLi,
            phep: totalPhep,
            phongThu: totalPhongThu,
            khangPhep: totalKhangPhep,
            baoKich: totalBaoKich,
            // Thống kê chi tiết
            hpMultiplier,
            vatLiMultiplier,
            phepMultiplier,
            allocatedHp,
            allocatedVatLi,
            allocatedPhep,
            bonusHpPct: ((this.statMau || 0) * 0.4).toFixed(1),
            bonusVatLiPct: ((this.statVatLi || 0) * 0.35).toFixed(1),
            bonusPhepPct: ((this.statPhep || 0) * 0.35).toFixed(1),
            bonusDefFromMau,
            bonusCritFromVatLi,
            titleHp,
            titleVatLi,
            titlePhep,
            titlePhongThu,
            titleKhangPhep,
            titleBaoKich
        };
    }

    /**
     * Lấy Máu tối đa
     */
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
    }

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
    }

    // ================= XỬ LÝ KỸ NĂNG (3 Ô) =================

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
            this.pillsConsumed = (this.pillsConsumed || 0) + 1;
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
            this.pillsConsumed = (this.pillsConsumed || 0) + count;
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

    /**
     * Mua số lượng tối đa có thể của một loại đan dược dựa theo số dư Linh Thạch
     */
    buyMaxPill(itemId) {
        const item = (typeof ItemSystem !== "undefined") ? ItemSystem.getItemById(itemId) : null;
        if (!item || !item.price || item.price <= 0) {
            return { success: false, reason: "invalid_item", msg: "Vật phẩm không hợp lệ!" };
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

        // Tính số lượng tối đa có thể mua theo số dư Linh Thạch
        const maxAffordable = Math.floor(this.linhThach / item.price);
        if (maxAffordable <= 0) {
            return { success: false, reason: "not_enough_money", msg: "Không đủ Linh Thạch để mua!" };
        }

        const totalCost = maxAffordable * item.price;
        this.linhThach -= totalCost;

        // Đẩy hàng loạt vào túi đồ
        for (let i = 0; i < maxAffordable; i++) {
            this.inventory.push(itemId);
        }

        return {
            success: true,
            count: maxAffordable,
            totalCost: totalCost,
            item: item,
            msg: `Đã mua thành công ${maxAffordable}x [${item.name}]!`
        };
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
    }

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

        const duplicates = [];
        let totalCount = 0;
        let totalGain = 0;

        counts.forEach((count, id) => {
            const item = ItemSystem.getItemById(id);
            if (!item) return;

            const isEquipped = (this.equipped?.non === id || this.equipped?.giap === id || this.equipped?.vukhi === id);
            const keepCount = (keepOneUnused && !isEquipped) ? 1 : 0;
            const dupsCount = Math.max(0, count - keepCount);

            if (dupsCount > 0) {
                const gain = (item.sellPrice || 10) * dupsCount;
                totalCount += dupsCount;
                totalGain += gain;
                duplicates.push({
                    item,
                    inInvCount: count,
                    dupsCount,
                    keepCount,
                    isEquipped,
                    unitPrice: item.sellPrice || 10,
                    totalGain: gain
                });
            }
        });

        // Sắp xếp danh sách từ thấp đến cao (cảnh giới, phẩm cấp, giá)
        if (typeof ItemSystem !== "undefined" && ItemSystem.compareItems) {
            duplicates.sort((a, b) => ItemSystem.compareItems(a.item, b.item));
        }

        return {
            duplicates,
            totalCount,
            totalGain
        };
    }

    /**
     * Bán toàn bộ trang bị trùng lặp trong túi đồ (Nón, Giáp, Vũ khí)
     * @param {boolean} keepOneUnused - Giữ lại 1 bản cho mỗi loại trang bị chưa mặc trên người (mặc định: true)
     */
    sellAllDuplicateEquipment(keepOneUnused = true) {
        const summary = this.getDuplicateEquipmentSummary(keepOneUnused);
        if (summary.totalCount === 0) {
            return {
                success: false,
                msg: "Không có trang bị trùng lặp nào trong túi!",
                totalCount: 0,
                totalGain: 0,
                summary
            };
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

    // ================= LƯU & TẢI TRẠNG THÁI =================

    toJSON() {
        return {
            saveVersion: (typeof StorageSystem !== "undefined" && StorageSystem.CURRENT_SAVE_VERSION) ? StorageSystem.CURRENT_SAVE_VERSION : 2,
            name: (typeof this.name === "string" && this.name.trim()) ? this.name.trim() : "Tiêu Viêm",
            equippedTitle: this.equippedTitle || "title_so_nhap",
            unlockedTitles: (Array.isArray(this.unlockedTitles) && this.unlockedTitles.length > 0) ? [...this.unlockedTitles] : ["title_so_nhap"],
            realmIndex: Number(this.realmIndex) || 0,
            tierIndex: Number(this.tierIndex) || 0,
            tuVi: isNaN(this.tuVi) ? 0 : Number(this.tuVi),
            statPoints: isNaN(this.statPoints) ? 0 : Number(this.statPoints),
            statVatLi: Number(this.statVatLi) || 0,
            statPhep: Number(this.statPhep) || 0,
            statMau: Number(this.statMau) || 0,
            equipped: {
                non: this.equipped?.non || null,
                giap: this.equipped?.giap || null,
                vukhi: this.equipped?.vukhi || null
            },
            equippedSkills: Array.isArray(this.equippedSkills)
                ? [this.equippedSkills[0] || null, this.equippedSkills[1] || null, this.equippedSkills[2] || null]
                : ["skill_toai_thach_quyen", "skill_dan_hoa_thuat", null],
            learnedSkills: Array.isArray(this.learnedSkills) ? [...this.learnedSkills] : ["skill_toai_thach_quyen", "skill_dan_hoa_thuat"],
            inventory: Array.isArray(this.inventory) ? [...this.inventory] : [],
            hasHadRenameScroll: true,
            linhThach: isNaN(this.linhThach) ? 0 : Number(this.linhThach),
            clearedStages: Array.isArray(this.clearedStages) ? [...this.clearedStages] : [],
            pillsConsumed: Number(this.pillsConsumed) || 0,
            lastOnlineTime: Date.now()
        };
    }

    fromJSON(data) {
        if (!data || typeof data !== "object") return;
        const defaults = Player.getDefaultData();

        this.name = (typeof data.name === "string" && data.name.trim()) ? data.name.trim() : (this.name || defaults.name);
        this.equippedTitle = (typeof data.equippedTitle === "string" && data.equippedTitle) ? data.equippedTitle : defaults.equippedTitle;
        this.unlockedTitles = (Array.isArray(data.unlockedTitles) && data.unlockedTitles.length > 0) ? [...data.unlockedTitles] : [...defaults.unlockedTitles];
        this.realmIndex = (typeof data.realmIndex === "number" && !isNaN(data.realmIndex)) ? data.realmIndex : defaults.realmIndex;
        this.tierIndex = (typeof data.tierIndex === "number" && !isNaN(data.tierIndex)) ? data.tierIndex : defaults.tierIndex;
        this.tuVi = (typeof data.tuVi === "number" && !isNaN(data.tuVi)) ? Math.max(0, data.tuVi) : defaults.tuVi;
        this.statPoints = (typeof data.statPoints === "number" && !isNaN(data.statPoints)) ? Math.max(0, data.statPoints) : defaults.statPoints;
        this.statVatLi = (typeof data.statVatLi === "number" && !isNaN(data.statVatLi)) ? Math.max(0, data.statVatLi) : defaults.statVatLi;
        this.statPhep = (typeof data.statPhep === "number" && !isNaN(data.statPhep)) ? Math.max(0, data.statPhep) : defaults.statPhep;
        this.statMau = (typeof data.statMau === "number" && !isNaN(data.statMau)) ? Math.max(0, data.statMau) : defaults.statMau;

        this.equipped = {
            non: data.equipped?.non ?? null,
            giap: data.equipped?.giap ?? null,
            vukhi: data.equipped?.vukhi ?? null
        };

        this.equippedSkills = Array.isArray(data.equippedSkills)
            ? [data.equippedSkills[0] ?? null, data.equippedSkills[1] ?? null, data.equippedSkills[2] ?? null]
            : [...defaults.equippedSkills];

        this.learnedSkills = Array.isArray(data.learnedSkills)
            ? [...data.learnedSkills]
            : [...defaults.learnedSkills];

        this.inventory = Array.isArray(data.inventory)
            ? [...data.inventory]
            : [...defaults.inventory];

        // Tặng 1 Cuộn Giấy Đổi Tên cho người chơi nếu chưa từng nhận
        if (!this.inventory.includes("item_rename_scroll") && !data.hasHadRenameScroll) {
            this.inventory.push("item_rename_scroll");
        }
        this.hasHadRenameScroll = true;

        this.linhThach = (typeof data.linhThach === "number" && !isNaN(data.linhThach)) ? Math.max(0, data.linhThach) : defaults.linhThach;
        this.clearedStages = Array.isArray(data.clearedStages) ? [...data.clearedStages] : [];
        this.pillsConsumed = (typeof data.pillsConsumed === "number" && !isNaN(data.pillsConsumed)) ? Math.max(0, data.pillsConsumed) : (defaults.pillsConsumed || 0);
        this.lastOnlineTime = (typeof data.lastOnlineTime === "number" && !isNaN(data.lastOnlineTime)) ? data.lastOnlineTime : Date.now();
        this.currentHp = this.getMaxHp();
    }
}

if (typeof window !== "undefined") {
    window.Player = Player;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = Player;
}
