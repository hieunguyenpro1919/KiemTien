/**
 * BỘ ĐIỀU KHIỂN CHIẾN ĐẤU 2D (2D COMBAT ENGINE)
 * Xử lý vòng lặp đánh, thi triển 3 kỹ năng chủ động, thanh máu động, số sát thương nảy, âm thanh
 */

class CombatEngine {
    constructor(player, particleSystem, soundEngine) {
        this.player = player;
        this.particles = particleSystem;
        this.sound = soundEngine;

        this.currentStage = null;
        this.monster = null;
        this.isActive = false;
        this.isAuto = true; // Mặc định bật tự động xuất chiêu cho tiện lợi

        this.playerHp = 0;
        this.playerMaxHp = 0;
        this.playerShield = 0;
        this.monsterHp = 0;
        this.monsterMaxHp = 0;

        // Thời gian hồi của 3 ô kỹ năng (giây còn lại)
        this.skillCooldowns = [0, 0, 0];

        // Bộ đếm đòn đánh thường
        this.playerAttackTimer = 0;
        this.monsterAttackTimer = 0;

        // Tốc độ trận đấu (x1, x2, x3)
        const savedSpeed = (typeof localStorage !== "undefined") ? parseInt(localStorage.getItem("tu_tien_combat_speed") || "1", 10) : 1;
        this.speedMultiplier = [1, 2, 3].includes(savedSpeed) ? savedSpeed : 1;

        this.combatInterval = null;
        this.onCombatEndCallback = null;
    }

    /**
     * Thay đổi tốc độ trận đấu (1, 2, 3)
     */
    setSpeedMultiplier(speed) {
        const val = parseInt(speed, 10);
        this.speedMultiplier = [1, 2, 3].includes(val) ? val : 1;
        if (typeof localStorage !== "undefined") {
            localStorage.setItem("tu_tien_combat_speed", String(this.speedMultiplier));
        }
        return this.speedMultiplier;
    }

    /**
     * Khởi động trận đấu với một Ải được chọn
     */
    startBattle(stage, onCombatEnd) {
        this.currentStage = stage;
        this.onCombatEndCallback = onCombatEnd;
        this.isActive = true;

        // Giới hạn chiến đấu: Danh hiệu "Phê Cỏ" chuyên bế quan cày cấp, cấm mang vào phó bản
        if (this.player.equippedTitle === "title_phe_co") {
            this.player.equippedTitle = null;
            if (typeof window !== "undefined" && window.gameUI) {
                window.gameUI.showToast("⚠️ Đang 'Phê Cỏ' không thể chiến đấu! Danh hiệu đã tự động tháo gỡ.", "warning");
                window.gameUI.renderCultivateTab();
            }
        }

        const pStats = this.player.getTotalStats();
        this.playerMaxHp = pStats.maxHp;
        this.playerHp = pStats.maxHp;
        this.playerShield = 0;

        // Tạo quái vật từ dữ liệu ải
        this.monster = {
            ...stage.monster,
            maxHp: stage.monster.hp,
            hp: stage.monster.hp,
            currentAttackTimer: 0
        };
        this.monsterMaxHp = stage.monster.hp;
        this.monsterHp = stage.monster.hp;

        this.skillCooldowns = [0, 0, 0];
        this.playerAttackTimer = 0;

        // Bắt đầu vòng lặp 100ms
        if (this.combatInterval) clearInterval(this.combatInterval);
        this.combatInterval = setInterval(() => this.tick(0.1), 100);

        this.updateUI();
        this.addCombatLog(`Bước vào [${stage.name}], tao ngộ [${stage.monster.name}]!`, "info");
        if (this.monster.isBoss) {
            const isSupreme = stage.number >= 16;
            const capPct = this.monster.damageCapPct !== undefined ? this.monster.damageCapPct : (isSupreme ? 0.20 : 0.25);
            const breakCapPct = this.monster.breakCapPct !== undefined ? this.monster.breakCapPct : (isSupreme ? 0.30 : 0.40);
            this.addCombatLog(`🛡️ [KIM THÂN HỘ THỂ] [${this.monster.name}] sở hữu Kim Thân! Đòn thường nhận tối đa ${Math.round(capPct * 100)}% Máu. Bạo kích & Kỹ năng phá trần ${Math.round(breakCapPct * 100)}% Máu!`, "kim-than");
        }
    }

    stopBattle() {
        this.isActive = false;
        if (this.combatInterval) {
            clearInterval(this.combatInterval);
            this.combatInterval = null;
        }
    }

    /**
     * Vòng lặp mỗi 100ms
     */
    tick(dt) {
        if (!this.isActive) return;

        // Nhân hệ số tốc độ trận đấu (x1, x2, x3)
        const effectiveDt = dt * (this.speedMultiplier || 1);

        // Giảm thời gian hồi chiêu của 3 kỹ năng
        for (let i = 0; i < 3; i++) {
            if (this.skillCooldowns[i] > 0) {
                this.skillCooldowns[i] = Math.max(0, this.skillCooldowns[i] - effectiveDt);
            }
        }

        // Tự động dùng chiêu nếu bật Auto
        if (this.isAuto) {
            for (let i = 0; i < 3; i++) {
                if (this.player.equippedSkills[i] && this.skillCooldowns[i] <= 0) {
                    this.useSkill(i);
                    break;
                }
            }
        }

        // Đòn đánh thường của người chơi (mỗi 1.5 giây)
        this.playerAttackTimer += effectiveDt;
        if (this.playerAttackTimer >= 1.5) {
            this.playerAttackTimer = 0;
            this.playerBasicAttack();
        }

        // Đòn đánh của Quái vật
        this.monster.currentAttackTimer += effectiveDt;
        if (this.monster.currentAttackTimer >= (this.monster.attackSpeed || 2.0)) {
            this.monster.currentAttackTimer = 0;
            this.monsterAttack();
        }

        this.updateUI();
    }

    /**
     * Áp dụng cơ chế Kim Thân Hộ Thể (Damage Cap) nếu mục tiêu là Boss
     * Hỗ trợ Cơ chế Phá Kim Thân:
     * - isSpecial = false (Đòn đánh thường không crit): Ngưỡng trần thường (25% máu, 20% Boss tối cao)
     * - isSpecial = true (Đòn Bạo Kích hoặc Kỹ Năng): Ngưỡng trần phá Kim Thân (40% máu, 30% Boss tối cao)
     * Trả về { damage, isCapped, isBreak, originalDamage, capPct }
     */
    applyDamageCap(rawDmg, isSpecial = false) {
        if (!this.monster || !this.monster.isBoss) {
            return { damage: rawDmg, isCapped: false, isBreak: false };
        }

        const isSupreme = this.currentStage && this.currentStage.number >= 16;
        let capPct;

        if (isSpecial) {
            capPct = this.monster.breakCapPct !== undefined 
                ? this.monster.breakCapPct 
                : (isSupreme ? 0.30 : 0.40);
        } else {
            capPct = this.monster.damageCapPct !== undefined 
                ? this.monster.damageCapPct 
                : (isSupreme ? 0.20 : 0.25);
        }

        const maxAllowedDmg = Math.max(1, Math.floor(this.monsterMaxHp * capPct));
        if (rawDmg > maxAllowedDmg) {
            return {
                damage: maxAllowedDmg,
                isCapped: true,
                isBreak: !!isSpecial,
                originalDamage: rawDmg,
                capPct: capPct
            };
        }

        return { damage: rawDmg, isCapped: false, isBreak: false, capPct: capPct };
    }

    /**
     * Đòn đánh cơ bản của người chơi
     */
    playerBasicAttack() {
        if (!this.isActive || this.monsterHp <= 0) return;

        const pStats = this.player.getTotalStats();
        const isCrit = Math.random() * 100 < pStats.baoKich;

        // Sát thương = max(1, (Vật lí + Phép * 0.3) - Giáp quái)
        let baseDmg = pStats.vatLi + Math.floor(pStats.phep * 0.3);
        let actualDmg = Math.max(1, baseDmg - Math.floor(this.monster.defense * 0.4));
        if (isCrit) actualDmg = Math.floor(actualDmg * 1.65);

        // Áp dụng Kim Thân Hộ Thể (isCrit kích hoạt Phá Kim Thân)
        const capResult = this.applyDamageCap(actualDmg, isCrit);
        actualDmg = capResult.damage;

        this.monsterHp = Math.max(0, this.monsterHp - actualDmg);

        // Hiệu ứng và âm thanh
        this.sound.playSlash();
        if (capResult.isCapped) {
            this.sound.playShield();
        }
        this.shakeElement("monster-avatar-box");

        if (this.particles) {
            const mPos = this.getMonsterCenter();
            this.particles.emitSlash(mPos.x, mPos.y);
            this.particles.addFloatingText(isCrit ? `BẠO! -${actualDmg}` : `-${actualDmg}`, mPos.x, mPos.y - 20, isCrit ? "#ffca28" : "#fff", isCrit);
            if (capResult.isCapped) {
                if (capResult.isBreak) {
                    this.particles.addFloatingText("PHÁ KIM THÂN!", mPos.x, mPos.y - 48, "#ff9100", true);
                } else {
                    this.particles.addFloatingText("KIM THÂN!", mPos.x, mPos.y - 48, "#ffd700", true);
                }
            }
        }

        if (capResult.isCapped) {
            if (capResult.isBreak) {
                this.addCombatLog(`💥 [PHÁ KIM THÂN] Đòn bạo kích xé rách Kim Thân của [${this.monster.name}], gây ${actualDmg.toLocaleString()} sát thương (Trần ${Math.round(capResult.capPct * 100)}% Máu)!`, "pha-kim-than");
            } else {
                this.addCombatLog(`🛡️ [KIM THÂN] Boss kích hoạt hộ thể hóa giải sát thương vượt ngưỡng! Gây ${actualDmg.toLocaleString()} sát thương (Trần ${Math.round(capResult.capPct * 100)}% Máu)!`, "kim-than");
            }
        } else {
            this.addCombatLog(`Đạo hữu vung kiếm trúng [${this.monster.name}], gây ${actualDmg} sát thương!`, isCrit ? "crit" : "normal");
        }

        if (this.monsterHp <= 0) {
            this.handleVictory();
        }
    }

    /**
     * Thi triển 1 trong 3 kỹ năng được trang bị
     */
    useSkill(slotIndex) {
        if (!this.isActive || this.monsterHp <= 0) return false;

        const skillId = this.player.equippedSkills[slotIndex];
        if (!skillId) return false;

        if (this.skillCooldowns[slotIndex] > 0) {
            return false;
        }

        const skill = SkillSystem.getSkillById(skillId);
        if (!skill) return false;

        const pStats = this.player.getTotalStats();
        this.skillCooldowns[slotIndex] = skill.cooldown;

        const mPos = this.getMonsterCenter();
        const pPos = this.getPlayerCenter();

        if (skill.type === "vat_li") {
            const isCrit = Math.random() * 100 < pStats.baoKich;
            let rawDmg = Math.floor(pStats.vatLi * skill.multiplier);
            let finalDmg = Math.max(1, rawDmg - Math.floor(this.monster.defense * 0.3));
            if (isCrit) finalDmg = Math.floor(finalDmg * 1.7);

            // Áp dụng Kim Thân Hộ Thể (Kỹ năng luôn kích hoạt Phá Kim Thân)
            const capResult = this.applyDamageCap(finalDmg, true);
            finalDmg = capResult.damage;

            this.monsterHp = Math.max(0, this.monsterHp - finalDmg);
            this.sound.playSlash();
            if (capResult.isCapped) {
                this.sound.playShield();
            }
            this.shakeElement("monster-avatar-box");

            if (this.particles) {
                const slashColor = skill.vfx === "grass_sword" ? "#00e676" : "#ffd700";
                this.particles.emitSlash(mPos.x, mPos.y, slashColor);
                this.particles.addFloatingText(isCrit ? `CHÍ MẠNG! -${finalDmg}` : `-${finalDmg}`, mPos.x, mPos.y - 30, slashColor, isCrit);
                if (capResult.isCapped) {
                    this.particles.addFloatingText("PHÁ KIM THÂN!", mPos.x, mPos.y - 58, "#ff9100", true);
                }
            }

            if (capResult.isCapped) {
                this.addCombatLog(`💥 [PHÁ KIM THÂN] Thần thông bộc phá xé rách Kim Thân của [${this.monster.name}], gây ${finalDmg.toLocaleString()} sát thương Vật Lí (Trần ${Math.round(capResult.capPct * 100)}% Máu)!`, "pha-kim-than");
            } else {
                this.addCombatLog(`Thi triển [${skill.name}]! Gây ${finalDmg} sát thương Vật Lí!`, "skill");
            }

        } else if (skill.type === "phep") {
            const isCrit = Math.random() * 100 < pStats.baoKich;
            let rawDmg = Math.floor(pStats.phep * skill.multiplier);
            const mResist = this.monster.magicResist !== undefined ? this.monster.magicResist : Math.floor(this.monster.defense * 0.7);
            let finalDmg = Math.max(1, rawDmg - Math.floor(mResist * 0.3));
            if (isCrit) finalDmg = Math.floor(finalDmg * 1.7);

            // Áp dụng Kim Thân Hộ Thể (Kỹ năng luôn kích hoạt Phá Kim Thân)
            const capResult = this.applyDamageCap(finalDmg, true);
            finalDmg = capResult.damage;

            this.monsterHp = Math.max(0, this.monsterHp - finalDmg);

            if (skill.vfx === "divine_thunder" || skill.vfx === "cosmic_crush") {
                this.sound.playThunder();
                if (this.particles) this.particles.emitThunder(mPos.x, mPos.y);
            } else if (skill.vfx === "black_hole") {
                this.sound.playThunder();
                if (this.particles) {
                    this.particles.emitMeditationQi(mPos.x, mPos.y, "#9c27b0");
                    this.particles.emitThunder(mPos.x, mPos.y);
                }
            } else {
                this.sound.playFireSpell();
                if (this.particles) this.particles.emitFire(mPos.x, mPos.y);
            }

            if (capResult.isCapped) {
                this.sound.playShield();
            }

            this.shakeElement("monster-avatar-box");
            if (this.particles) {
                this.particles.addFloatingText(isCrit ? `PHÁP BẠO! -${finalDmg}` : `-${finalDmg}`, mPos.x, mPos.y - 30, "#ff5722", isCrit);
                if (capResult.isCapped) {
                    this.particles.addFloatingText("PHÁ KIM THÂN!", mPos.x, mPos.y - 58, "#ff9100", true);
                }
            }

            if (capResult.isCapped) {
                this.addCombatLog(`💥 [PHÁ KIM THÂN] Thần thông bộc phá xé rách Kim Thân của [${this.monster.name}], gây ${finalDmg.toLocaleString()} sát thương Phép (Trần ${Math.round(capResult.capPct * 100)}% Máu)!`, "pha-kim-than");
            } else {
                this.addCombatLog(`Thi triển [${skill.name}]! Pháp thuật bùng nổ gây ${finalDmg} sát thương!`, "skill");
            }

        } else if (skill.type === "ho_the") {
            const shieldAmount = Math.floor(this.playerMaxHp * skill.multiplier);
            this.playerShield = Math.min(Math.floor(this.playerMaxHp * 1.2), this.playerShield + shieldAmount);
            this.sound.playShield();

            if (this.particles) {
                this.particles.emitMeditationQi(pPos.x, pPos.y, "#00d2d3");
                this.particles.addFloatingText(`+${shieldAmount} Khiên`, pPos.x, pPos.y - 20, "#00d2d3");
            }
            this.addCombatLog(`Thi triển [${skill.name}]! Nhận lớp khiên hộ thể ${shieldAmount} HP!`, "buff");

        } else if (skill.type === "tri_lieu") {
            const healAmount = Math.floor(pStats.phep * skill.multiplier + this.playerMaxHp * 0.15);
            this.playerHp = Math.min(this.playerMaxHp, this.playerHp + healAmount);
            this.sound.playHeal();

            if (this.particles) {
                this.particles.emitMeditationQi(pPos.x, pPos.y, "#2ecc71");
                this.particles.addFloatingText(`+${healAmount} HP`, pPos.x, pPos.y - 20, "#2ecc71");
            }
            this.addCombatLog(`Thi triển [${skill.name}]! Khôi phục ${healAmount} sinh lực!`, "heal");
        }

        if (this.monsterHp <= 0) {
            this.handleVictory();
        }

        this.updateUI();
        return true;
    }

    /**
     * Quái vật xuất chiêu tấn công người chơi
     */
    monsterAttack() {
        if (!this.isActive || this.playerHp <= 0) return;

        const pStats = this.player.getTotalStats();
        let rawDmg = this.monster.attack;
        let actualDmg = Math.max(1, rawDmg - Math.floor(pStats.phongThu * 0.5));

        // Hấp thụ bằng khiên trước
        if (this.playerShield > 0) {
            if (this.playerShield >= actualDmg) {
                this.playerShield -= actualDmg;
                if (this.particles) {
                    const pPos = this.getPlayerCenter();
                    this.particles.addFloatingText(`Chắn -${actualDmg}`, pPos.x, pPos.y - 20, "#00d2d3");
                }
                actualDmg = 0;
            } else {
                actualDmg -= this.playerShield;
                this.playerShield = 0;
            }
        }

        if (actualDmg > 0) {
            this.playerHp = Math.max(0, this.playerHp - actualDmg);
            this.shakeElement("player-avatar-box");
            if (this.particles) {
                const pPos = this.getPlayerCenter();
                this.particles.addFloatingText(`-${actualDmg}`, pPos.x, pPos.y - 20, "#ff5252");
            }
        }

        this.addCombatLog(`[${this.monster.name}] ra đòn, đánh trúng đạo hữu ${actualDmg} sát thương!`, "damage");

        if (this.playerHp <= 0) {
            this.handleDefeat();
        }
    }

    /**
     * Xử lý khi Đạo Hữu Chiến Thắng
     */
    handleVictory() {
        this.stopBattle();
        this.sound.playVictory();

        const stage = this.currentStage;
        const rewards = stage?.rewards || { tuVi: 0, linhThach: 0, dropChance: 0, possibleDrops: [] };

        // Nhận Tu Vi và Linh Thạch an toàn phòng vệ
        this.player.addTuVi(rewards.tuVi || 0);
        this.player.linhThach = (Number(this.player.linhThach) || 0) + (Number(rewards.linhThach) || 0);

        if (!Array.isArray(this.player.clearedStages)) {
            this.player.clearedStages = [];
        }
        if (stage?.id && !this.player.clearedStages.includes(stage.id)) {
            this.player.clearedStages.push(stage.id);
        }

        // Kiểm tra rơi vật phẩm
        let droppedItem = null;
        const possibleDrops = Array.isArray(rewards.possibleDrops) ? rewards.possibleDrops : [];
        if (rewards.dropChance && Math.random() < rewards.dropChance && possibleDrops.length > 0) {
            let selectedDropId = null;

            // Xử lý cơ chế rơi cực hiếm cho Tẩy Tủy Đan (chống lạm phát)
            if (possibleDrops.includes("pill_tay_tuy")) {
                const normalDrops = possibleDrops.filter(id => id !== "pill_tay_tuy");
                // Tẩy Tủy Đan chỉ có 3% cơ hội xuất hiện khi kích hoạt rơi đồ
                if (Math.random() < 0.03) {
                    selectedDropId = "pill_tay_tuy";
                } else if (normalDrops.length > 0) {
                    selectedDropId = normalDrops[Math.floor(Math.random() * normalDrops.length)];
                } else {
                    selectedDropId = "pill_tay_tuy";
                }
            } else {
                selectedDropId = possibleDrops[Math.floor(Math.random() * possibleDrops.length)];
            }

            if (selectedDropId) {
                if (!Array.isArray(this.player.inventory)) {
                    this.player.inventory = [];
                }
                this.player.inventory.push(selectedDropId);
                droppedItem = (typeof ItemSystem !== "undefined") ? ItemSystem.getItemById(selectedDropId) : null;
            }
        }

        if (this.particles) {
            const mPos = this.getMonsterCenter();
            this.particles.emitBreakthrough(mPos.x, mPos.y);
        }

        if (droppedItem && droppedItem.id === "pill_tay_tuy") {
            this.addCombatLog(`🌟 [KỲ DUYÊN] Trảm sát [${this.monster.name}], phát hiện Nghịch Thiên Linh Bảo [Tẩy Tủy Đan] cực hiếm!`, "victory");
        } else {
            this.addCombatLog(`Đại thắng! Trảm sát [${this.monster.name}]!`, "victory");
        }

        // Kiểm tra mở khóa Danh Hiệu mới từ chiến tích trảm Boss
        let newTitles = [];
        if (typeof TitleSystem !== "undefined") {
            newTitles = TitleSystem.checkAndUnlockTitles(this.player);
            if (newTitles.length > 0) {
                newTitles.forEach(t => {
                    this.addCombatLog(`🎖️ [DANH HIỆU MỚI] Đạo hữu đã chấn động chư thiên, đạt được Danh Hiệu [${t.name}]!`, "breakthrough");
                });
            }
        }

        if (this.onCombatEndCallback) {
            this.onCombatEndCallback({
                victory: true,
                stage: stage,
                tuViGain: rewards.tuVi,
                linhThachGain: rewards.linhThach,
                droppedItem: droppedItem,
                newTitles: newTitles
            });
        }
    }

    /**
     * Xử lý khi Đạo Hữu Thất Bại
     */
    handleDefeat() {
        this.stopBattle();
        this.sound.playDefeat();
        this.addCombatLog(`Đạo hữu trọng thương kiệt sức, lui về trị thương!`, "defeat");

        if (this.onCombatEndCallback) {
            this.onCombatEndCallback({
                victory: false,
                stage: this.currentStage
            });
        }
    }

    // ================= TIỆN ÍCH GIAO DIỆN CHIẾN ĐẤU =================

    updateUI() {
        const formatHp = (val) => {
            if (val === undefined || val === null || isNaN(val)) return "0";
            if (val >= 1000000000) {
                const b = val / 1000000000;
                return (b % 1 === 0 ? b : b.toFixed(2)) + " Tỷ";
            }
            if (val >= 1000000) {
                const m = val / 1000000;
                return (m % 1 === 0 ? m : m.toFixed(1)) + " Tr";
            }
            if (val >= 10000) {
                const k = val / 1000;
                return (k % 1 === 0 ? k : k.toFixed(1)) + "k";
            }
            return Math.ceil(val).toLocaleString("vi-VN");
        };

        // Cập nhật thanh máu người chơi
        const playerHpPercent = Math.max(0, Math.min(100, (this.playerHp / this.playerMaxHp) * 100));
        const playerHpBar = document.getElementById("combat-player-hp-bar");
        const playerHpText = document.getElementById("combat-player-hp-text");
        if (playerHpBar) playerHpBar.style.width = `${playerHpPercent}%`;
        if (playerHpText) playerHpText.innerText = `${formatHp(this.playerHp)} / ${formatHp(this.playerMaxHp)}`;

        // Khiên chắn
        const playerShieldBar = document.getElementById("combat-player-shield-bar");
        if (playerShieldBar) {
            const shieldPercent = Math.min(100, (this.playerShield / this.playerMaxHp) * 100);
            playerShieldBar.style.width = `${shieldPercent}%`;
        }

        // Cập nhật thanh máu quái vật
        const monsterHpPercent = Math.max(0, Math.min(100, (this.monsterHp / this.monsterMaxHp) * 100));
        const monsterHpBar = document.getElementById("combat-monster-hp-bar");
        const monsterHpText = document.getElementById("combat-monster-hp-text");
        if (monsterHpBar) monsterHpBar.style.width = `${monsterHpPercent}%`;
        if (monsterHpText) monsterHpText.innerText = `${formatHp(this.monsterHp)} / ${formatHp(this.monsterMaxHp)}`;

        // Cập nhật 3 nút kỹ năng
        for (let i = 0; i < 3; i++) {
            const skillBtn = document.getElementById(`combat-skill-btn-${i}`);
            const cdOverlay = document.getElementById(`combat-skill-cd-${i}`);
            const skillId = this.player.equippedSkills[i];

            if (skillBtn) {
                if (skillId) {
                    const skill = SkillSystem.getSkillById(skillId);
                    skillBtn.disabled = this.skillCooldowns[i] > 0;
                    if (cdOverlay) {
                        if (this.skillCooldowns[i] > 0) {
                            cdOverlay.style.display = "flex";
                            cdOverlay.innerText = this.skillCooldowns[i].toFixed(1) + "s";
                        } else {
                            cdOverlay.style.display = "none";
                        }
                    }
                } else {
                    skillBtn.disabled = true;
                    if (cdOverlay) cdOverlay.style.display = "none";
                }
            }
        }
    }

    shakeElement(elemId) {
        const el = document.getElementById(elemId);
        if (!el) return;
        el.classList.add("shake-anim");
        setTimeout(() => el.classList.remove("shake-anim"), 300);
    }

    getPlayerCenter() {
        const el = document.getElementById("combat-player-box");
        if (el) {
            const r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
        return { x: 200, y: 300 };
    }

    getMonsterCenter() {
        const el = document.getElementById("combat-monster-box");
        if (el) {
            const r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
        return { x: 600, y: 300 };
    }

    addCombatLog(msg, type = "normal") {
        const logBox = document.getElementById("combat-log-list");
        if (!logBox) return;

        const li = document.createElement("div");
        li.className = `combat-log-item log-${type}`;
        li.innerHTML = msg;
        logBox.appendChild(li);
        logBox.scrollTop = logBox.scrollHeight;

        // Giới hạn 40 dòng log
        while (logBox.children.length > 40) {
            logBox.removeChild(logBox.firstChild);
        }
    }
}

if (typeof window !== "undefined") {
    window.CombatEngine = CombatEngine;
}
