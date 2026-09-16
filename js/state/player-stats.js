/**
 * PHÂN HỆ QUẢN LÝ CHỈ SỐ NHÂN VẬT & ĐIỂM TIỀM NĂNG (PLAYER STATS)
 * Tách từ player.js - Gắn vào Player.prototype
 */

(function() {
    const target = (typeof Player !== "undefined") ? Player : (typeof global !== "undefined" && global.Player ? global.Player : null);
    if (!target) return;

    Object.assign(target.prototype, {
        /**
         * Cộng điểm chỉ số (Vật lí, Phép, Máu)
         */
        allocateStat(type, amount = 1) {
            if (this.statPoints < amount || amount <= 0) return false;

            if (type === "vat_li" || type === "vatLi") {
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
        },

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
        },

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
        },

        /**
         * Lấy Máu tối đa
         */
        getMaxHp() {
            return this.getTotalStats().maxHp;
        }
    });
})();
