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
            honNguyen: 0,
            tinhNguyen: 0,
            isVoCuc: false,
            clearedStages: [],
            pillsConsumed: 0,
            towerData: {
                highestFloor: 0,
                currentFloor: 1,
                dailyTickets: 3,
                lastResetDate: ""
            },
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
        this.honNguyen = Number(d.honNguyen) || 0;
        this.tinhNguyen = Number(d.tinhNguyen) || 0;
        this.isVoCuc = Boolean(d.isVoCuc);
        this.clearedStages = [...d.clearedStages];
        this.pillsConsumed = d.pillsConsumed || 0;
        this.towerData = d.towerData ? { ...d.towerData } : { highestFloor: 0, currentFloor: 1, dailyTickets: 3, lastResetDate: "" };
        this.checkTowerReset();
        this.lastOnlineTime = d.lastOnlineTime;
        this.currentHp = this.getMaxHp();
    }

    getFullTitle() {
        return RealmSystem.getFullRealmTitle(this.realmIndex, this.tierIndex);
    }

    /**
     * Lấy Tu Vi (hoặc Tinh Nguyên) tối đa của tầng hiện tại
     */
    getMaxTuVi() {
        if (this.isVoCuc) {
            // Cảnh giới Vô Cực: Công thức Tinh Nguyên = 100 + (tierIndex - 100) * 10
            const extraTiers = Math.max(0, (this.tierIndex || 100) - 100);
            return 100 + extraTiers * 10;
        }
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
     * Kiểm tra và tự động phục hồi Lệnh Bài Hư Không khi sang ngày mới
     */
    checkTowerReset() {
        if (!this.towerData) {
            this.towerData = { highestFloor: 0, currentFloor: 1, dailyTickets: 3, lastResetDate: "" };
        }
        if (typeof TowerSystem !== "undefined") {
            return TowerSystem.checkDailyReset(this.towerData);
        }
        return false;
    }

    /**
     * Kiểm tra có đủ điều kiện Đột Phá hay không
     */
    canBreakthrough() {
        // Phương án A: Đối với toàn bộ người chơi ở Tầng >= 100 của Đại Đạo Chí Cao Vô Thượng,
        // bắt buộc phải đánh bại [Ải 22: Hư Vô Bản Nguyên Cảnh] mới được phép tiếp tục đột phá!
        if (this.realmIndex >= 11 && this.tierIndex >= 99) {
            const hasClearedVoCuc = this.clearedStages && this.clearedStages.includes("stage_vo_cuc");
            if (!hasClearedVoCuc) {
                return false;
            }
        }

        if (this.isVoCuc) {
            return (this.tinhNguyen || 0) >= this.getMaxTuVi();
        }
        return this.tuVi >= this.getMaxTuVi();
    }

    /**
     * Thêm Tinh Nguyên Đại Đạo (khi đã đạt Cảnh Giới Vô Cực)
     */
    addTinhNguyen(amount) {
        amount = Number(amount);
        if (isNaN(amount) || amount <= 0) {
            return { added: 0, canBreakthrough: this.canBreakthrough() };
        }
        if (isNaN(this.tinhNguyen) || typeof this.tinhNguyen !== "number") {
            this.tinhNguyen = 0;
        }
        this.tinhNguyen += Math.floor(amount);
        return {
            added: Math.floor(amount),
            canBreakthrough: this.canBreakthrough()
        };
    }

    /**
     * Thêm Tu Vi (từ đả tọa, dùng đan dược, vượt ải)
     */
    addTuVi(amount) {
        amount = Number(amount);
        if (isNaN(amount) || amount <= 0) {
            return { added: 0, canBreakthrough: this.canBreakthrough() };
        }
        // Nếu đã ở Cảnh Giới Vô Cực, tự động ngưng tụ thành Tinh Nguyên (1 Tỷ Tu Vi = 1 Tinh Nguyên)
        if (this.isVoCuc) {
            const tinhGain = Math.max(1, Math.floor(amount / 1000000000));
            return this.addTinhNguyen(tinhGain);
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
        const maxTuVi = this.getMaxTuVi();

        // 1. Kiểm tra điều kiện Ải 22 cho toàn bộ người chơi Tầng >= 100 Đại Đạo Chí Cao Vô Thượng (Phương án A)
        if (this.realmIndex >= 11 && this.tierIndex >= 99) {
            const hasClearedVoCuc = this.clearedStages && this.clearedStages.includes("stage_vo_cuc");
            if (!hasClearedVoCuc) {
                return {
                    success: false,
                    isVoCucBlocked: true,
                    msg: "Cần đánh bại [Ải 22: Hư Vô Bản Nguyên Cảnh] mới có thể tiếp tục đột phá!"
                };
            }
        }

        // 2. Đang ở Cảnh Giới Vô Cực (Tầng 101+)
        if (this.isVoCuc) {
            if ((this.tinhNguyen || 0) < maxTuVi) return false;
            this.tinhNguyen = Math.max(0, (this.tinhNguyen || 0) - maxTuVi);
            this.tierIndex = (this.tierIndex || 100) + 1;
            this.statPoints += STAT_POINTS_PER_TIER;
            this.currentHp = this.getMaxHp();
            return {
                success: true,
                isMajor: false,
                isVoCuc: true,
                blockedReason: null,
                pointsAdded: STAT_POINTS_PER_TIER,
                newTitle: this.getFullTitle(),
                totalPoints: this.statPoints,
                realm: RealmSystem.getRealm(this.realmIndex)
            };
        }

        // 3. Mốc Tầng 100 Đại Đạo Chí Cao (realmIndex 11, tierIndex == 99)
        if (this.realmIndex >= 11 && this.tierIndex >= 99) {
            if (this.tuVi < maxTuVi) return false;

            const excessTuVi = Math.max(0, this.tuVi - maxTuVi);
            this.isVoCuc = true;
            this.tuVi = 0;
            this.tinhNguyen = Math.floor(excessTuVi / 1000000000);
            this.tierIndex = 100; // Thăng hoa lên Tầng 101
            this.statPoints += STAT_POINTS_PER_TIER;
            this.currentHp = this.getMaxHp();
            return {
                success: true,
                isMajor: true,
                isVoCuc: true,
                blockedReason: null,
                pointsAdded: STAT_POINTS_PER_TIER,
                newTitle: this.getFullTitle(),
                totalPoints: this.statPoints,
                realm: RealmSystem.getRealm(this.realmIndex)
            };
        }

        // 3. Đột phá thông thường (Cảnh giới 0 đến 10 hoặc Đại Đạo Chí Cao < Tầng 100)
        if (!this.canBreakthrough()) return false;
        this.tuVi = Math.max(0, this.tuVi - maxTuVi);

        let isMajor = false;
        let blockedReason = null;

        const nextRealmIndex = this.realmIndex + 1;
        const reqStageForNext = RealmSystem.getBreakthroughReqStage(nextRealmIndex);
        const hasClearedReqStage = !reqStageForNext || (this.clearedStages && this.clearedStages.includes(reqStageForNext));

        if (this.realmIndex < 8) {
            if (this.tierIndex < RealmSystem.getTierCount() - 1) {
                this.tierIndex++;
            } else {
                this.realmIndex++;
                this.tierIndex = 0;
                isMajor = true;
            }
        } else {
            if (this.realmIndex < RealmSystem.getRealmCount() - 1 && hasClearedReqStage) {
                this.realmIndex++;
                this.tierIndex = 0;
                isMajor = true;
            } else {
                this.tierIndex++;
                if (reqStageForNext && !hasClearedReqStage) {
                    const reqStageObj = typeof StageSystem !== "undefined" ? StageSystem.getStageById(reqStageForNext) : null;
                    blockedReason = reqStageObj ? reqStageObj.name : reqStageForNext;
                }
            }
        }

        this.statPoints += STAT_POINTS_PER_TIER;
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
            if (this.isVoCuc) {
                const tinhGain = Math.max(1, Math.floor(item.tuViGain / 1000000000));
                this.addTinhNguyen(tinhGain);
                return { success: true, item, msg: `Đã dùng 1x ${item.name}, nhận được +${tinhGain} Tinh Nguyên Đại Đạo!` };
            }
            this.addTuVi(item.tuViGain);
            return { success: true, item, msg: `Đã dùng 1x ${item.name}, nhận được +${item.tuViGain} điểm Tu Vi!` };
        } else if (item.isResetPill) {
            const points = this.resetStats();
            return { success: true, item, msg: `Đã tẩy tủy thành công! Thu hồi lại ${points} điểm tiềm năng.` };
        } else if (itemId === "item_tower_ticket") {
            if (!this.towerData) {
                this.towerData = { highestFloor: 0, currentFloor: 1, dailyTickets: 3, lastResetDate: "" };
            }
            this.towerData.dailyTickets = (this.towerData.dailyTickets || 0) + 1;
            return { success: true, item, msg: `Đã dùng 1x ${item.name}, nhận được +1 Lệnh Bài Hư Không (Hiện có: ${this.towerData.dailyTickets})!` };
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

        // Cộng dồn toàn bộ Tu Vi (hoặc Tinh Nguyên nếu ở Cảnh Giới Vô Cực)
        if (item.tuViGain) {
            this.pillsConsumed = (this.pillsConsumed || 0) + count;
            if (this.isVoCuc) {
                const tinhGainPerPill = Math.max(1, Math.floor(item.tuViGain / 1000000000));
                const totalTinhNguyen = tinhGainPerPill * count;
                this.addTinhNguyen(totalTinhNguyen);
                return {
                    success: true,
                    count: count,
                    totalTuVi: totalTinhNguyen,
                    item: item,
                    msg: `Đã dùng hết ${count}x [${item.name}], nhận được +${totalTinhNguyen} Tinh Nguyên Đại Đạo!`
                };
            }
            const totalTuVi = item.tuViGain * count;
            this.addTuVi(totalTuVi);
            return {
                success: true,
                count: count,
                totalTuVi: totalTuVi,
                item: item,
                msg: `Đã dùng hết ${count}x [${item.name}], nhận được +${totalTuVi} Tu Vi!`
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
        }

        return { success: true, count: count, item: item, msg: `Đã dùng hết ${count}x [${item.name}]!` };
    }

    buyItem(itemId, quantity = 1) {
        const item = ItemSystem.getItemById(itemId);
        if (!item) return { success: false, msg: "Vật phẩm không tồn tại!" };
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

        // Tính số lượng tối đa có thể mua theo số dư Linh Thạch / Hỗn Nguyên
        const isHonNguyen = item.currency === "hon_nguyen";
        const currentBalance = isHonNguyen ? (this.honNguyen || 0) : (this.linhThach || 0);
        const maxAffordable = Math.floor(currentBalance / item.price);
        if (maxAffordable <= 0) {
            return { 
                success: false, 
                reason: "not_enough_money", 
                msg: isHonNguyen ? "Không đủ Hỗn Nguyên Thạch để mua!" : "Không đủ Linh Thạch để mua!" 
            };
        }

        const totalCost = maxAffordable * item.price;
        if (isHonNguyen) {
            this.honNguyen -= totalCost;
        } else {
            this.linhThach -= totalCost;
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
    }

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
    }

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
    }

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
    }

    /**
     * Mua Lệnh Bài Hư Không trực tiếp bằng Hỗn Nguyên Thạch (hoặc tự động đổi từ Linh Thạch)
     */
    buyTowerTicket(quantity = 1) {
        quantity = Math.max(1, parseInt(quantity, 10) || 1);
        const ticketPriceHonNguyen = 5000000;
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
    }

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

    // ================= LƯU & TẢI TRẠNG THÁI =================

    toJSON() {
        return {
            saveVersion: (typeof StorageSystem !== "undefined" && StorageSystem.CURRENT_SAVE_VERSION) ? StorageSystem.CURRENT_SAVE_VERSION : 3,
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
            honNguyen: isNaN(this.honNguyen) ? 0 : Number(this.honNguyen),
            tinhNguyen: isNaN(this.tinhNguyen) ? 0 : Number(this.tinhNguyen),
            isVoCuc: Boolean(this.isVoCuc),
            clearedStages: Array.isArray(this.clearedStages) ? [...this.clearedStages] : [],
            pillsConsumed: Number(this.pillsConsumed) || 0,
            towerData: {
                highestFloor: Number(this.towerData?.highestFloor) || 0,
                currentFloor: Math.max(1, Number(this.towerData?.currentFloor) || 1),
                dailyTickets: (typeof this.towerData?.dailyTickets === "number") ? this.towerData.dailyTickets : 3,
                lastResetDate: typeof this.towerData?.lastResetDate === "string" ? this.towerData.lastResetDate : ""
            },
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
        this.honNguyen = (typeof data.honNguyen === "number" && !isNaN(data.honNguyen)) ? Math.max(0, data.honNguyen) : (defaults.honNguyen || 0);
        this.tinhNguyen = (typeof data.tinhNguyen === "number" && !isNaN(data.tinhNguyen)) ? Math.max(0, data.tinhNguyen) : (defaults.tinhNguyen || 0);
        this.isVoCuc = Boolean(data.isVoCuc);

        this.clearedStages = Array.isArray(data.clearedStages) ? [...data.clearedStages] : [];
        this.pillsConsumed = (typeof data.pillsConsumed === "number" && !isNaN(data.pillsConsumed)) ? Math.max(0, data.pillsConsumed) : (defaults.pillsConsumed || 0);
        this.towerData = (data.towerData && typeof data.towerData === "object") ? {
            highestFloor: Number(data.towerData.highestFloor) || 0,
            currentFloor: Math.max(1, Number(data.towerData.currentFloor) || 1),
            dailyTickets: (typeof data.towerData?.dailyTickets === "number") ? Math.max(0, data.towerData.dailyTickets) : 3,
            lastResetDate: typeof data.towerData.lastResetDate === "string" ? data.towerData.lastResetDate : ""
        } : { highestFloor: 0, currentFloor: 1, dailyTickets: 3, lastResetDate: "" };
        this.checkTowerReset();
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
