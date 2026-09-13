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
        this.playerStunTimer = 0; // Thời gian bị Choáng còn lại của người chơi (giây)
        this.monsterHp = 0;
        this.monsterMaxHp = 0;
        this.monsterShield = 0; // Khiên bảo hộ của Boss
        this.bossSkillTimer = 0; // Bộ đếm hồi chiêu kỹ năng Boss
        this.bossSkillIndex = 0; // Luân chuyển kỹ năng Boss
        this.monsterBurnDuration = 0; // Thời gian hiệu ứng Đốt Máu còn lại (giây)
        this.monsterBurnTickTimer = 0; // Bộ đếm nhịp đốt 1 giây
        this.monsterBurnPctPerTick = 0.03; // % máu đốt mỗi giây
        this.monsterBurnBonus = 0; // Sát thương cộng thêm từ chỉ số người chơi

        // Thời gian hồi của 3 ô kỹ năng (giây còn lại)
        this.skillCooldowns = [0, 0, 0];

        // Bộ đếm đòn đánh thường
        this.playerAttackTimer = 0;
        this.monsterAttackTimer = 0;

        // Thần Thú Trợ Chiến
        this.pet = null;
        this.petStats = null;
        this.petHp = 0;
        this.petMaxHp = 0;
        this.petShield = 0;
        this.petAttackTimer = 0;
        this.petSkillTimer = 0;
        this.isPetBuffDoubleDmg = false;
        this.petRageBuffTimer = 0;

        // Tốc độ trận đấu (x1, x2, x3)
        const savedSpeed = (typeof localStorage !== "undefined") ? parseInt(localStorage.getItem("tu_tien_combat_speed") || "1", 10) : 1;
        this.speedMultiplier = [1, 2, 3].includes(savedSpeed) ? savedSpeed : 1;

        this.combatInterval = null;
        this.onCombatEndCallback = null;

        // Trạng thái Hư Không Tháp (Endless Tower)
        this.isTowerBattle = false;
        this.towerTimer = 60.0;
        this.towerTimeLimit = 60.0;
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

        this.isTowerBattle = !!stage.isTower;
        this.towerTimeLimit = stage.timeLimit || 60.0;
        this.towerTimer = this.towerTimeLimit;

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
        this.playerStunTimer = 0;
        this.monsterShield = 0;
        this.bossSkillTimer = 0;
        this.bossSkillIndex = 0;
        this.monsterBurnDuration = 0;
        this.monsterBurnTickTimer = 0;
        this.monsterBurnPctPerTick = 0.03;
        this.monsterBurnBonus = 0;

        // Khởi tạo Thần Thú Trợ Chiến
        this.pet = null;
        this.petStats = null;
        this.petHp = 0;
        this.petMaxHp = 0;
        this.petShield = 0;
        this.petAttackTimer = 0;
        this.petSkillTimer = 0;
        this.isPetBuffDoubleDmg = false;
        this.petRageBuffTimer = 0;

        if (this.player.activePetId && this.player.pets && this.player.pets[this.player.activePetId]?.unlocked) {
            const petId = this.player.activePetId;
            const petData = this.player.pets[petId];
            const petSys = (typeof PetSystem !== "undefined") ? PetSystem : (typeof require !== "undefined" ? require("../data/pets.js").PetSystem : null);
            if (petSys) {
                const petDef = petSys.getPetById(petId);
                const calcStats = petSys.calculatePetStats(petId, petData.realm);
                const sInfo = petSys.getSkillInfo(petId, petData.skillLevel);
                this.pet = {
                    ...petDef,
                    realm: petData.realm,
                    skillLevel: petData.skillLevel,
                    stats: calcStats,
                    skillInfo: sInfo
                };
                this.petStats = calcStats;
                this.petHp = calcStats.maxHp;
                this.petMaxHp = calcStats.maxHp;
                this.petShield = 0;

                // Kích hoạt Nội tại Thần Thú khi vào trận:
                if (petId === "pet_tank") {
                    // Tank [Bá Thể Bất Diệt]: Tăng 20% Máu tối đa cho cả Chủ & Thú, Thú nhận khiên 200% Max HP
                    this.playerMaxHp = Math.floor(this.playerMaxHp * 1.2);
                    this.playerHp = this.playerMaxHp;
                    this.petMaxHp = Math.floor(this.petMaxHp * 1.2);
                    this.petHp = this.petMaxHp;
                    this.petShield = Math.floor(this.petMaxHp * 2.0);
                    this.addCombatLog(`🐢 [HỘ VỆ] [${this.pet.name}] xuất chiến! Kích hoạt [Bá Thể Bất Diệt]: Tăng 20% Máu cho chủ và thú, ngưng kết ${this.petShield.toLocaleString()} Khiên Hộ Thể!`, "buff");
                } else if (petId === "pet_buff") {
                    // Buff [Vĩnh Kiếp]: Sát thương của chủ nhân vĩnh viễn tăng gấp 2 lần (+100% Total DMG)
                    this.isPetBuffDoubleDmg = true;
                    this.addCombatLog(`🦅 [PHỤ TRỢ] [${this.pet.name}] xuất chiến! Kích hoạt [Vĩnh Kiếp]: Toàn bộ sát thương của Đạo Hữu tăng gấp 2 lần (+100% Total DMG)!`, "buff");
                } else if (petId === "pet_dps") {
                    this.addCombatLog(`🐉 [KÍCH SÁT] [${this.pet.name}] xuất chiến! Kích hoạt [Hủy Thiên Diệt Địa]: Mọi đòn đánh xé toạc chân thân, bỏ qua Giáp & Kim Thân!`, "buff");
                }
            }
        }

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

        // Nộ khí & Đại thần thông
        this.playerRage = 0;
        this.playerMaxRage = (this.player.equippedUltimate === "ult_thanh_tue_nguyet") ? 200 : 100;
        this.ultimateBuffYChi = 0;
        this.ultimateBuffBatKham = 0;

        // Bắt đầu vòng lặp 100ms
        if (this.combatInterval) clearInterval(this.combatInterval);
        this.combatInterval = setInterval(() => this.tick(0.1), 100);

        this.updateUI();
        if (this.isTowerBattle) {
            this.addCombatLog(`🗼 Bước vào [${stage.name}], tao ngộ [${stage.monster.name}]! (⏳ Enrage Timer: ${this.towerTimeLimit}s)`, "info");
        } else {
            this.addCombatLog(`Bước vào [${stage.name}], tao ngộ [${stage.monster.name}]!`, "info");
        }
        if (this.monster.isBoss) {
            const isSupreme = stage.number >= 16;
            const capPct = this.monster.damageCapPct !== undefined ? this.monster.damageCapPct : (isSupreme ? 0.20 : 0.25);
            const breakCapPct = this.monster.breakCapPct !== undefined ? this.monster.breakCapPct : (isSupreme ? 0.30 : 0.40);
            this.addCombatLog(`🛡️ [KIM THÂN HỘ THỂ] [${this.monster.name}] sở hữu Kim Thân! Đòn thường nhận tối đa ${Math.round(capPct * 100)}% Máu. Bạo kích & Kỹ năng phá trần ${Math.round(breakCapPct * 100)}% Máu!`, "kim-than");
        }
    }

    stopBattle() {
        this.isActive = false;
        this.playerStunTimer = 0;
        this.bossSkillTimer = 0;
        this.monsterBurnDuration = 0;
        this.monsterBurnTickTimer = 0;
        this.ultimateBuffYChi = 0;
        this.ultimateBuffBatKham = 0;
        this.isPetBuffDoubleDmg = false;
        this.petRageBuffTimer = 0;
        if (this.combatInterval) {
            clearInterval(this.combatInterval);
            this.combatInterval = null;
        }
    }

    /**
     * Tích lũy Nộ Khí chiến đấu
     */
    addRage(amount) {
        if (!this.isActive || !this.player || !this.player.equippedUltimate) return;
        const oldRage = this.playerRage || 0;
        const maxRage = this.playerMaxRage || 100;
        this.playerRage = Math.min(maxRage, oldRage + amount);
        if (oldRage < maxRage && this.playerRage >= maxRage) {
            if (this.particles) {
                const pPos = this.getPlayerCenter();
                this.particles.emitMeditationQi(pPos.x, pPos.y, "#ff3d00");
                this.particles.addFloatingText("🔥 NỘ KHÍ ĐẦY!", pPos.x, pPos.y - 35, "#ff3d00", true);
            }
            this.addCombatLog(`🔥 [NỘ KHÍ ĐẦY] Đại Thần Thông đã sẵn sàng khai phóng!`, "buff");
        }
    }

    /**
     * Vòng lặp mỗi 100ms
     */
    tick(dt) {
        if (!this.isActive) return;

        // Nhân hệ số tốc độ trận đấu (x1, x2, x3)
        const effectiveDt = dt * (this.speedMultiplier || 1);

        // Đếm lùi thời gian Enrage Timer cho Hư Không Tháp
        if (this.isTowerBattle && this.isActive) {
            this.towerTimer -= effectiveDt;
            if (this.towerTimer <= 0) {
                this.towerTimer = 0;
                this.handleDefeat(true); // true = Enrage timeout
                return;
            }
        }

        // Xử lý đếm lùi thời gian Bị Choáng của Người Chơi
        if (this.playerStunTimer > 0) {
            this.playerStunTimer = Math.max(0, this.playerStunTimer - effectiveDt);
        }

        // Xử lý hiệu ứng Đốt Máu định kỳ cứ mỗi 1 giây lên Quái/Boss (BỎ QUA KIM THÂN & KHIÊN)
        if (this.monsterBurnDuration > 0 && this.monsterHp > 0) {
            this.monsterBurnDuration = Math.max(0, this.monsterBurnDuration - effectiveDt);
            this.monsterBurnTickTimer += effectiveDt;
            while (this.monsterBurnTickTimer >= 1.0 && this.monsterHp > 0) {
                this.monsterBurnTickTimer -= 1.0;
                this.applyMonsterBurnTick();
            }
            if (this.monsterHp <= 0) return; // Quái chết do đốt máu thì dừng chu kỳ tick hiện tại
        } else {
            this.monsterBurnTickTimer = 0;
        }

        // Xử lý đếm lùi buff của Đại Thần Thông & Thần Thú
        if (this.ultimateBuffYChi > 0) {
            this.ultimateBuffYChi = Math.max(0, this.ultimateBuffYChi - effectiveDt);
        }
        if (this.ultimateBuffBatKham > 0) {
            this.ultimateBuffBatKham = Math.max(0, this.ultimateBuffBatKham - effectiveDt);
        }
        if (this.petRageBuffTimer > 0) {
            this.petRageBuffTimer = Math.max(0, this.petRageBuffTimer - effectiveDt);
        }

        // Giảm thời gian hồi chiêu của 3 kỹ năng
        for (let i = 0; i < 3; i++) {
            if (this.skillCooldowns[i] > 0) {
                this.skillCooldowns[i] = Math.max(0, this.skillCooldowns[i] - effectiveDt);
            }
        }

        // Tự động dùng chiêu nếu bật Auto và KHÔNG bị Choáng
        if (this.isAuto && this.playerStunTimer <= 0) {
            // Tự động xuất Đại Thần Thông khi nộ khí đã đầy
            if (this.player.equippedUltimate && (this.playerRage || 0) >= (this.playerMaxRage || 100)) {
                this.useUltimate();
            }
            for (let i = 0; i < 3; i++) {
                if (this.player.equippedSkills[i] && this.skillCooldowns[i] <= 0) {
                    this.useSkill(i);
                    break;
                }
            }
        }

        // Đòn đánh thường của người chơi (mỗi 1.5 giây, tăng 300% tốc đánh khi kích hoạt Ý Chí Bất Tận, tăng 10x khi Cuồng Nộ)
        if (this.playerStunTimer <= 0) {
            let atkSpeedMult = (this.ultimateBuffYChi > 0) ? 4.0 : 1.0;
            if (this.petRageBuffTimer > 0) {
                atkSpeedMult = Math.max(atkSpeedMult, 10.0);
            }
            this.playerAttackTimer += effectiveDt * atkSpeedMult;
            if (this.playerAttackTimer >= 1.5) {
                this.playerAttackTimer = 0;
                this.playerBasicAttack();
            }
        }

        // Xử lý hành động của Thần Thú Trợ Chiến
        if (this.pet && this.monsterHp > 0 && this.playerHp > 0) {
            if (this.pet.id === "pet_dps") {
                // Thần Thú DPS tung chiêu Tước Đoạt
                this.petSkillTimer += effectiveDt;
                const skillCd = this.pet.skillInfo?.cooldown || 20;
                if (this.petSkillTimer >= skillCd) {
                    this.petSkillTimer = 0;
                    this.petCastDpsSkill();
                }

                // Thần Thú DPS đánh thường (Sát thương chuẩn)
                this.petAttackTimer += effectiveDt;
                const petAtkSpd = this.petStats?.attackSpeed || 1.6;
                if (this.petAttackTimer >= petAtkSpd) {
                    this.petAttackTimer = 0;
                    this.petDpsAttack();
                }
            } else if (this.pet.id === "pet_buff") {
                // Thần Thú Buff tung chiêu Đại Đạo Cuồng Nộ
                this.petSkillTimer += effectiveDt;
                const skillCd = this.pet.skillInfo?.cooldown || 25;
                if (this.petSkillTimer >= skillCd) {
                    this.petSkillTimer = 0;
                    this.petCastBuffSkill();
                }
            }
        }

        // Kỹ năng đặc biệt của BOSS (Chỉ riêng Boss, quái thường không sở hữu)
        if (this.monster && this.monster.isBoss && this.monsterHp > 0 && this.playerHp > 0) {
            this.bossSkillTimer += effectiveDt;
            if (this.bossSkillTimer >= 6.5) {
                this.bossSkillTimer = 0;
                this.bossCastSkill();
            }
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

        this.addRage(4); // Đánh thường +4 Nộ Khí

        const pStats = this.player.getTotalStats();
        const isCrit = Math.random() * 100 < pStats.baoKich;
        const isYChi = (this.ultimateBuffYChi > 0);

        let actualDmg = 0;
        let capResult = { damage: 0, isCapped: false, isBreak: false, capPct: 0 };

        if (isYChi) {
            // Hiệu ứng "Ý Chí Bất Tận":
            // 1. Tăng mạnh hệ số scale: 800% Công Vật Lí!
            // 2. SÁT THƯƠNG CHUẨN XUYÊN GIÁP & XUYÊN KHIÊN BOSS (đánh thẳng vào máu)
            // 3. KHÔNG BỎ QUA KIM THÂN: Vẫn tuân thủ Damage Cap của Kim Thân (trừ khi có buff Cuồng Nộ)
            let baseDmg = Math.floor(pStats.vatLi * 80.0);
            if (this.isPetBuffDoubleDmg) baseDmg *= 2;
            actualDmg = Math.max(1, baseDmg);
            if (isCrit) actualDmg = Math.floor(actualDmg * 1.75);

            // Áp dụng Kim Thân Hộ Thể (Trừ khi có buff Cuồng Nộ từ Thần Thú Buff)
            if (this.petRageBuffTimer > 0) {
                capResult = { damage: actualDmg, isCapped: false, isBreak: true, capPct: 1 };
            } else {
                capResult = this.applyDamageCap(actualDmg, isCrit);
            }
            actualDmg = capResult.damage;

            // ĐÁNH THẲNG VÀO MÁU: BỎ QUA HOÀN TOÀN KHIÊN CỦA BOSS!
            this.monsterHp = Math.max(0, this.monsterHp - actualDmg);
        } else {
            // Sát thương = max(1, (Vật lí + Phép * 0.3) - Giáp quái)
            let baseDmg = pStats.vatLi + Math.floor(pStats.phep * 0.3);
            if (this.isPetBuffDoubleDmg) baseDmg *= 2;
            actualDmg = Math.max(1, baseDmg - Math.floor(this.monster.defense * 0.4));
            if (isCrit) actualDmg = Math.floor(actualDmg * 1.65);

            // Áp dụng Kim Thân Hộ Thể (Trừ khi có buff Cuồng Nộ từ Thần Thú Buff: Bỏ qua Kim Thân)
            if (this.petRageBuffTimer > 0) {
                capResult = { damage: actualDmg, isCapped: false, isBreak: true, capPct: 1 };
            } else {
                capResult = this.applyDamageCap(actualDmg, isCrit);
            }
            actualDmg = capResult.damage;

            // Bào mòn khiên Boss trước nếu Boss có khiên
            if (this.monsterShield > 0) {
                if (this.monsterShield >= actualDmg) {
                    this.monsterShield -= actualDmg;
                    if (this.particles) {
                        const mPos = this.getMonsterCenter();
                        this.particles.addFloatingText(`Khiên Boss -${actualDmg}`, mPos.x, mPos.y - 25, "#00d2d3");
                    }
                    actualDmg = 0;
                } else {
                    const absorbed = this.monsterShield;
                    actualDmg -= this.monsterShield;
                    this.monsterShield = 0;
                    if (this.particles) {
                        const mPos = this.getMonsterCenter();
                        this.particles.addFloatingText(`Vỡ Khiên Boss -${absorbed}`, mPos.x, mPos.y - 25, "#00d2d3");
                    }
                }
            }

            if (actualDmg > 0) {
                this.monsterHp = Math.max(0, this.monsterHp - actualDmg);
            }
        }

        // Hiệu ứng và âm thanh
        this.sound.playSlash();
        if (capResult.isCapped) {
            this.sound.playShield();
        }
        this.shakeElement("monster-avatar-box");

        if (this.particles) {
            const mPos = this.getMonsterCenter();
            this.particles.emitSlash(mPos.x, mPos.y);
            if (isYChi) {
                const hadShield = (this.monsterShield > 0);
                const tag = hadShield ? " (XUYÊN KHIÊN)!" : "!";
                this.particles.addFloatingText(isCrit ? `⚔️ BẠO KÍCH CHUẨN${tag} -${actualDmg}` : `⚔️ SÁT THƯƠNG CHUẨN${tag} -${actualDmg}`, mPos.x, mPos.y - 25, "#ff3d00", true);
                if (capResult.isCapped) {
                    if (capResult.isBreak) {
                        this.particles.addFloatingText("PHÁ KIM THÂN!", mPos.x, mPos.y - 48, "#ff9100", true);
                    } else {
                        this.particles.addFloatingText("KIM THÂN!", mPos.x, mPos.y - 48, "#ffd700", true);
                    }
                }
            } else {
                this.particles.addFloatingText(isCrit ? `BẠO! -${actualDmg}` : `-${actualDmg}`, mPos.x, mPos.y - 20, isCrit ? "#ffca28" : "#fff", isCrit);
                if (capResult.isCapped) {
                    if (capResult.isBreak) {
                        this.particles.addFloatingText("PHÁ KIM THÂN!", mPos.x, mPos.y - 48, "#ff9100", true);
                    } else {
                        this.particles.addFloatingText("KIM THÂN!", mPos.x, mPos.y - 48, "#ffd700", true);
                    }
                }
            }
        }

        if (isYChi) {
            if (capResult.isCapped) {
                this.addCombatLog(`⚔️ [Ý CHÍ BẤT TẬN] Quyền kình xé toạc hư không, XUYÊN KHIÊN giáng đòn SÁT THƯƠNG CHUẨN ${actualDmg.toLocaleString()} HP thẳng vào máu [${this.monster.name}] (Chạm trần Kim Thân ${Math.round(capResult.capPct * 100)}% Máu)!`, "pha-kim-than");
            } else {
                this.addCombatLog(`⚔️ [Ý CHÍ BẤT TẬN] Quyền kình xé toạc hư không, XUYÊN KHIÊN giáng đòn SÁT THƯƠNG CHUẨN ${actualDmg.toLocaleString()} HP thẳng vào máu [${this.monster.name}]!`, "pha-kim-than");
            }
        } else if (capResult.isCapped) {
            if (capResult.isBreak) {
                this.addCombatLog(`💥 [PHÁ KIM THÂN] Đòn bạo kích xé rách Kim Thân của [${this.monster.name}], gây ${actualDmg.toLocaleString()} sát thương (Trần ${Math.round(capResult.capPct * 100)}% Máu)!`, "pha-kim-than");
            } else {
                this.addCombatLog(`🛡️ [KIM THÂN] Boss kích hoạt hộ thể hóa giải sát thương vượt ngưỡng! Gây ${actualDmg.toLocaleString()} sát thương (Trần ${Math.round(capResult.capPct * 100)}% Máu)!`, "kim-than");
            }
        } else {
            this.addCombatLog(`Đạo hữu vung kiếm trúng [${this.monster.name}], gây ${actualDmg} sát thương!`, isCrit ? "crit" : "normal");
        }

        if (this.monsterHp <= 0) {
            this.updateUI();
            this.stopBattle();
            const delay = Math.max(180, Math.round(450 / (this.speedMultiplier || 1)));
            setTimeout(() => {
                this.handleVictory();
            }, delay);
            return;
        }
    }

    /**
     * Đòn đánh thường của Thần Thú Kích Sát (DPS - Cửu U Ma Long)
     * HOÀN TOÀN BỎ QUA KIM THÂN VÀ HỘ GIÁP & KHIÊN CỦA BOSS (Sát thương chuẩn đánh thẳng vào máu!)
     */
    petDpsAttack() {
        if (!this.isActive || this.monsterHp <= 0 || !this.pet) return;

        // Sát thương chuẩn = Công Vật Lí + Công Phép của Thần Thú
        const dmg = Math.max(1, (this.petStats?.vatLi || 0) + (this.petStats?.phep || 0));

        // Trừ trực tiếp vào máu Boss (bỏ qua Kim Thân, Giáp và Khiên)
        this.monsterHp = Math.max(0, this.monsterHp - dmg);

        if (this.sound && typeof this.sound.playThunder === "function") this.sound.playThunder();
        this.shakeElement("monster-avatar-box");

        if (this.particles) {
            const mPos = this.getMonsterCenter();
            if (typeof this.particles.emitThunder === "function") this.particles.emitThunder(mPos.x, mPos.y);
            if (typeof this.particles.addFloatingText === "function") {
                this.particles.addFloatingText(`🐉 -${dmg.toLocaleString()} (CHUẨN)`, mPos.x, mPos.y - 35, "#ff3838", true);
            }
        }
        this.addCombatLog(`🐉 [${this.pet.name}] vung vuốt xé toạc hư không, gây ${dmg.toLocaleString()} sát thương chuẩn (XUYÊN KIM THÂN & GIÁP)!`, "crit");

        if (this.monsterHp <= 0) {
            this.updateUI();
            this.stopBattle();
            const delay = Math.max(180, Math.round(450 / (this.speedMultiplier || 1)));
            setTimeout(() => {
                this.handleVictory();
            }, delay);
        }
    }

    /**
     * Thi triển Thần Thông [Tước Đoạt Sinh Mệnh] của Thần Thú DPS
     * Đoạt % Máu hiện tại của Boss và hồi máu đồng thời cho cả Thần Thú và Chủ Nhân
     */
    petCastDpsSkill() {
        if (!this.isActive || this.monsterHp <= 0 || !this.pet) return;

        const drainPct = (this.pet.skillInfo?.drainPct || 20) / 100;
        const drained = Math.max(1, Math.floor(this.monsterHp * drainPct));

        // Trừ trực tiếp máu Boss
        this.monsterHp = Math.max(0, this.monsterHp - drained);

        // Hồi phục đồng thời cho Thần Thú và Chủ Nhân
        const oldPlayerHp = this.playerHp;
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + drained);
        const playerHealed = this.playerHp - oldPlayerHp;

        this.petHp = Math.min(this.petMaxHp, (this.petHp || 0) + drained);

        if (this.sound && typeof this.sound.playHeal === "function") this.sound.playHeal();
        this.shakeElement("monster-avatar-box");

        if (this.particles) {
            const mPos = this.getMonsterCenter();
            const pPos = this.getPlayerCenter();
            if (typeof this.particles.emitFire === "function") this.particles.emitFire(mPos.x, mPos.y);
            if (typeof this.particles.addFloatingText === "function") {
                this.particles.addFloatingText(`🩸 TƯỚC ĐOẠT -${drained.toLocaleString()}`, mPos.x, mPos.y - 35, "#ff1744", true);
                this.particles.addFloatingText(`+${playerHealed.toLocaleString()} HP`, pPos.x, pPos.y - 20, "#2ecc71");
            }
        }

        this.addCombatLog(`🩸 [${this.pet.name}] thi triển [${this.pet.skillInfo?.name || "Tước Đoạt"}]! Cưỡng chế đoạt ${drained.toLocaleString()} Máu của [${this.monster.name}], hồi phục cho Thần Thú và Đạo Hữu!`, "heal");

        if (this.monsterHp <= 0) {
            this.updateUI();
            this.stopBattle();
            const delay = Math.max(180, Math.round(450 / (this.speedMultiplier || 1)));
            setTimeout(() => {
                this.handleVictory();
            }, delay);
        }
    }

    /**
     * Thi triển Thần Thông [Đại Đạo Cuồng Nộ] của Thần Thú Buff (Cửu Thiên Phượng Hoàng)
     * Tăng 10x tốc đánh và đòn đánh xuyên Kim Thân cho chủ nhân
     */
    petCastBuffSkill() {
        if (!this.isActive || this.monsterHp <= 0 || !this.pet) return;

        const duration = this.pet.skillInfo?.duration || 5.0;
        this.petRageBuffTimer = duration;

        if (this.sound && typeof this.sound.playFireSpell === "function") this.sound.playFireSpell();

        if (this.particles) {
            const pPos = this.getPlayerCenter();
            this.particles.emitMeditationQi(pPos.x, pPos.y, "#ffd700");
            this.particles.addFloatingText("🔥 ĐẠI ĐẠO CUỒNG NỘ (10x SPD)!", pPos.x, pPos.y - 45, "#ffd700", true);
        }

        this.addCombatLog(`🔥 [${this.pet.name}] khai mở [Đại Đạo Cuồng Nộ]! Chủ Nhân nhận gấp 10 lần Tốc độ đánh và ĐÒN ĐÁNH XUYÊN KIM THÂN trong ${duration}s!`, "buff");
    }

    /**
     * Thi triển 1 trong 3 kỹ năng được trang bị
     */
    useSkill(slotIndex) {
        if (!this.isActive || this.monsterHp <= 0) return false;

        // Nếu người chơi đang bị Choáng thì không thể xuất chiêu
        if (this.playerStunTimer > 0) {
            return false;
        }

        const skillId = this.player.equippedSkills[slotIndex];
        if (!skillId) return false;

        if (this.skillCooldowns[slotIndex] > 0) {
            return false;
        }

        const skill = SkillSystem.getSkillById(skillId);
        if (!skill) return false;

        const pStats = this.player.getTotalStats();
        this.skillCooldowns[slotIndex] = skill.cooldown;
        this.addRage(20); // Tung skill +20 Nộ Khí

        const mPos = this.getMonsterCenter();
        const pPos = this.getPlayerCenter();

        if (skill.type === "vat_li") {
            const isCrit = Math.random() * 100 < pStats.baoKich;
            let rawDmg = Math.floor(pStats.vatLi * skill.multiplier);
            if (this.isPetBuffDoubleDmg) rawDmg *= 2;
            let finalDmg = Math.max(1, rawDmg - Math.floor(this.monster.defense * 0.3));
            if (isCrit) finalDmg = Math.floor(finalDmg * 1.7);

            // Áp dụng Kim Thân Hộ Thể (Kỹ năng luôn kích hoạt Phá Kim Thân)
            const capResult = this.applyDamageCap(finalDmg, true);
            finalDmg = capResult.damage;

            // Bào mòn khiên Boss trước nếu Boss có khiên
            if (this.monsterShield > 0) {
                if (this.monsterShield >= finalDmg) {
                    this.monsterShield -= finalDmg;
                    if (this.particles) {
                        this.particles.addFloatingText(`Khiên Boss -${finalDmg}`, mPos.x, mPos.y - 25, "#00d2d3");
                    }
                    finalDmg = 0;
                } else {
                    const absorbed = this.monsterShield;
                    finalDmg -= this.monsterShield;
                    this.monsterShield = 0;
                    if (this.particles) {
                        this.particles.addFloatingText(`Vỡ Khiên Boss -${absorbed}`, mPos.x, mPos.y - 25, "#00d2d3");
                    }
                }
            }

            if (finalDmg > 0) {
                this.monsterHp = Math.max(0, this.monsterHp - finalDmg);
            }
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
            if (this.isPetBuffDoubleDmg) rawDmg *= 2;
            const mResist = this.monster.magicResist !== undefined ? this.monster.magicResist : Math.floor(this.monster.defense * 0.7);
            let finalDmg = Math.max(1, rawDmg - Math.floor(mResist * 0.3));
            if (isCrit) finalDmg = Math.floor(finalDmg * 1.7);

            // Áp dụng Kim Thân Hộ Thể (Kỹ năng luôn kích hoạt Phá Kim Thân)
            const capResult = this.applyDamageCap(finalDmg, true);
            finalDmg = capResult.damage;

            // Bào mòn khiên Boss trước nếu Boss có khiên
            if (this.monsterShield > 0) {
                if (this.monsterShield >= finalDmg) {
                    this.monsterShield -= finalDmg;
                    if (this.particles) {
                        this.particles.addFloatingText(`Khiên Boss -${finalDmg}`, mPos.x, mPos.y - 25, "#00d2d3");
                    }
                    finalDmg = 0;
                } else {
                    const absorbed = this.monsterShield;
                    finalDmg -= this.monsterShield;
                    this.monsterShield = 0;
                    if (this.particles) {
                        this.particles.addFloatingText(`Vỡ Khiên Boss -${absorbed}`, mPos.x, mPos.y - 25, "#00d2d3");
                    }
                }
            }

            if (finalDmg > 0) {
                this.monsterHp = Math.max(0, this.monsterHp - finalDmg);
            }

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

        } else if (skill.type === "dot_mau" || skill.isBurnHp) {
            // CƠ CHẾ ĐỐT MÁU BOSS ĐỊNH KỲ: CỨ MỖI 1S ĐỐT %HP BOSS, HOÀN TOÀN BỎ QUA KIM THÂN VÀ KHIÊN
            const duration = skill.burnDuration || 5.0;
            const pct = skill.burnPctPerTick || 0.03;
            this.monsterBurnDuration = duration;
            this.monsterBurnTickTimer = 0.0;
            this.monsterBurnPctPerTick = pct;
            this.monsterBurnBonus = Math.floor((pStats.phep + pStats.vatLi) * 20);

            this.sound.playFireSpell();
            this.shakeElement("monster-avatar-box");

            if (this.particles) {
                this.particles.emitFire(mPos.x, mPos.y);
                this.particles.addFloatingText(`🔥 THIÊU ĐỐT (${duration}s)!`, mPos.x, mPos.y - 35, "#ff3838", true);
                this.particles.addFloatingText("BỎ QUA KHIÊN & KIM THÂN!", mPos.x, mPos.y - 62, "#ff9f43", true);
            }

            this.addCombatLog(`🔥 [ĐỐT MÁU CỰC ĐẠO] Thi triển [${skill.name}]! Lửa thiêng hồng mông bám chặt lên [${this.monster.name}], liên tục thiêu đốt ${Math.round(pct * 100)}% Máu mỗi giây trong ${duration}s (HOÀN TOÀN BỎ QUA KHIÊN & KIM THÂN)!`, "dot-mau");

        } else if (skill.type === "ho_the") {
            const shieldAmount = Math.floor(this.playerMaxHp * skill.multiplier);
            const maxShieldCap = Math.max(Math.floor(this.playerMaxHp * 1.2), Math.floor(this.playerMaxHp * (skill.multiplier || 1.2)));
            this.playerShield = Math.min(maxShieldCap, (this.playerShield || 0) + shieldAmount);
            if (this.sound && typeof this.sound.playShield === "function") {
                this.sound.playShield();
            }

            if (this.particles) {
                this.particles.emitMeditationQi(pPos.x, pPos.y, "#00d2d3");
                this.particles.addFloatingText(`+${shieldAmount.toLocaleString()} Khiên`, pPos.x, pPos.y - 20, "#00d2d3");
            }
            this.addCombatLog(`Thi triển [${skill.name}]! Nhận lớp khiên hộ thể ${shieldAmount.toLocaleString()} HP!`, "buff");

        } else if (skill.type === "tri_lieu") {
            let healAmount = Math.floor(pStats.phep * skill.multiplier + this.playerMaxHp * 0.15);
            if (skill.healFullHp) {
                healAmount = Math.max(healAmount, this.playerMaxHp);
            }
            this.playerHp = Math.min(this.playerMaxHp, this.playerHp + healAmount);
            if (this.sound && typeof this.sound.playHeal === "function") {
                this.sound.playHeal();
            }

            let addedShield = 0;
            if (skill.shieldMultiplier) {
                addedShield = Math.floor(this.playerMaxHp * skill.shieldMultiplier);
                const maxShieldCap = Math.max(Math.floor(this.playerMaxHp * 1.5), (this.playerShield || 0) + addedShield);
                this.playerShield = Math.min(maxShieldCap, (this.playerShield || 0) + addedShield);
            }

            if (this.particles) {
                this.particles.emitMeditationQi(pPos.x, pPos.y, "#2ecc71");
                this.particles.addFloatingText(`+${healAmount.toLocaleString()} HP`, pPos.x, pPos.y - 20, "#2ecc71");
                if (addedShield > 0) {
                    this.particles.addFloatingText(`+${addedShield.toLocaleString()} Khiên`, pPos.x, pPos.y - 45, "#00d2d3");
                }
            }
            const shieldMsg = addedShield > 0 ? ` và nhận thêm ${addedShield.toLocaleString()} Khiên Hộ Mệnh` : "";
            this.addCombatLog(`Thi triển [${skill.name}]! Khôi phục ${healAmount.toLocaleString()} sinh lực${shieldMsg}!`, "heal");
        }

        if (this.monsterHp <= 0) {
            this.updateUI();
            this.stopBattle();
            const delay = Math.max(180, Math.round(450 / (this.speedMultiplier || 1)));
            setTimeout(() => {
                this.handleVictory();
            }, delay);
            return true;
        }

        this.updateUI();
        return true;
    }

    /**
     * Quái vật xuất chiêu tấn công người chơi
     */
    monsterAttack() {
        if (!this.isActive || this.playerHp <= 0) return;

        // Nếu Thần Thú Hộ Vệ (Tank) còn sống: Quái sẽ tấn công Thần Thú trước (Bia thịt hộ chủ)
        if (this.pet && this.pet.id === "pet_tank" && this.petHp > 0) {
            let petRawDmg = this.monster.attack;
            let petActualDmg = Math.max(1, petRawDmg - Math.floor((this.petStats?.phongThu || 0) * 0.5));

            // Khiên Thần Thú hấp thụ trước
            if (this.petShield > 0) {
                if (this.petShield >= petActualDmg) {
                    this.petShield -= petActualDmg;
                    if (this.particles) {
                        const pPos = this.getPlayerCenter();
                        this.particles.addFloatingText(`Huyền Vũ Chắn -${petActualDmg}`, pPos.x - 30, pPos.y - 20, "#00d2d3");
                    }
                    petActualDmg = 0;
                } else {
                    petActualDmg -= this.petShield;
                    this.petShield = 0;
                }
            }

            if (petActualDmg > 0) {
                this.petHp = Math.max(0, this.petHp - petActualDmg);
                if (this.particles) {
                    const pPos = this.getPlayerCenter();
                    this.particles.addFloatingText(`Huyền Vũ -${petActualDmg}`, pPos.x - 30, pPos.y - 20, "#ff5252");
                }
            }

            // Kích hoạt Phản Sát: Phản ngược % sát thương về phía Boss
            const reflectPct = (this.pet.skillInfo?.reflectPct || 10) / 100;
            const reflectedDmg = Math.max(1, Math.floor(petRawDmg * reflectPct));
            this.monsterHp = Math.max(0, this.monsterHp - reflectedDmg);

            if (this.particles) {
                const mPos = this.getMonsterCenter();
                this.particles.emitSlash(mPos.x, mPos.y, "#ffd700");
                this.particles.addFloatingText(`💥 PHẢN -${reflectedDmg.toLocaleString()}`, mPos.x, mPos.y - 30, "#ffd700", true);
            }
            if (this.sound && typeof this.sound.playShield === "function") this.sound.playShield();
            this.shakeElement("monster-avatar-box");
            this.addCombatLog(`🐢 [PHẢN SÁT] [${this.pet.name}] gánh ${petRawDmg} sát thương và phản ngược ${reflectedDmg.toLocaleString()} sát thương về phía [${this.monster.name}]!`, "damage");

            if (this.petHp <= 0) {
                this.petHp = 0;
                this.addCombatLog(`⚠️ [${this.pet.name}] đã kiệt sức trọng thương! Kẻ địch chuyển mục tiêu sang Đạo Hữu!`, "warning");
            }

            if (this.monsterHp <= 0) {
                this.updateUI();
                this.stopBattle();
                const delay = Math.max(180, Math.round(450 / (this.speedMultiplier || 1)));
                setTimeout(() => {
                    this.handleVictory();
                }, delay);
                return;
            }
            return; // Quái đã ra đòn xong lượt này vào Thú
        }

        this.addRage(4); // Bị đánh +4 Nộ Khí

        const pStats = this.player.getTotalStats();
        let rawDmg = this.monster.attack;
        let actualDmg = Math.max(1, rawDmg - Math.floor(pStats.phongThu * 0.5));

        // Nếu có buff "Bất Kham", sát thương không vượt quá 5% Máu tối đa của người chơi
        if (this.ultimateBuffBatKham > 0) {
            const maxAllowed = Math.max(1, Math.floor(this.playerMaxHp * 0.05));
            if (actualDmg > maxAllowed) {
                actualDmg = maxAllowed;
                if (this.particles) {
                    const pPos = this.getPlayerCenter();
                    this.particles.addFloatingText("⚡ BẤT KHAM (<=5% HP)!", pPos.x, pPos.y - 35, "#00e676", true);
                }
            }
        }

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
            this.updateUI();
            this.stopBattle();
            const delay = Math.max(180, Math.round(450 / (this.speedMultiplier || 1)));
            setTimeout(() => {
                this.handleDefeat();
            }, delay);
            return;
        }
    }

    /**
     * Kích hoạt 1 nhịp Đốt Máu định kỳ (cứ mỗi 1 giây sau khi tung chiêu)
     * HOÀN TOÀN BỎ QUA KIM THÂN VÀ KHIÊN HỘ THỂ CỦA BOSS!
     */
    applyMonsterBurnTick() {
        if (!this.isActive || !this.monster || this.monsterHp <= 0) return;

        const pct = this.monsterBurnPctPerTick || 0.03;
        const tickBase = Math.floor(this.monsterMaxHp * pct);
        const tickDmg = Math.max(1, tickBase + (this.monsterBurnBonus || 0));

        // Trừ trực tiếp vào máu quái/Boss, bỏ qua Kim Thân và Khiên Hộ Thể
        this.monsterHp = Math.max(0, this.monsterHp - tickDmg);

        if (this.sound) this.sound.playFireSpell();
        this.shakeElement("monster-avatar-box");

        const mPos = this.getMonsterCenter();
        if (this.particles) {
            this.particles.emitFire(mPos.x, mPos.y);
            this.particles.addFloatingText(`🔥 -${tickDmg} (ĐỐT MÁU)`, mPos.x, mPos.y - 30, "#ff3838", true);
        }

        const remainSeconds = Math.ceil(this.monsterBurnDuration);
        const remainText = remainSeconds > 0 ? ` (Còn ${remainSeconds}s)` : " (Hết)";
        this.addCombatLog(`🔥 [ĐỐT MÁU] Lửa thiêng thiêu đốt, [${this.monster.name}] mất ${tickDmg.toLocaleString()} Máu (BỎ QUA KHIÊN & KIM THÂN)${remainText}!`, "dot-mau");

        if (this.monsterHp <= 0) {
            this.updateUI();
            this.stopBattle();
            const delay = Math.max(180, Math.round(450 / (this.speedMultiplier || 1)));
            setTimeout(() => {
                this.handleVictory();
            }, delay);
        }
    }

    /**
     * Kỹ năng độc quyền chỉ dành riêng cho Boss (Quái thường không sở hữu)
     * Bộ 4 cơ chế: Choáng, Sốc sát thương, Tạo khiên, Hút máu (10% HP người chơi bỏ qua khiên thành 10% HP cho Boss)
     */
    bossCastSkill() {
        if (!this.isActive || !this.monster || !this.monster.isBoss || this.monsterHp <= 0 || this.playerHp <= 0) return;

        const skills = ["stun", "burst", "shield", "lifesteal"];
        const skillType = skills[this.bossSkillIndex % skills.length];
        this.bossSkillIndex++;

        const pPos = this.getPlayerCenter();
        const mPos = this.getMonsterCenter();
        const pStats = this.player.getTotalStats();

        if (skillType === "stun") {
            // Cơ chế 1: Choáng (2.0s)
            this.playerStunTimer = 2.0;
            this.sound.playThunder();
            this.shakeElement("player-avatar-box");
            if (this.particles) {
                this.particles.emitMeditationQi(pPos.x, pPos.y, "#ffd700");
                this.particles.addFloatingText("💫 CHOÁNG! (2.0s)", pPos.x, pPos.y - 30, "#ffd700", true);
            }
            this.addCombatLog(`💫 [BOSS CHOÁNG] [${this.monster.name}] thi triển [Cực Áp Định Thân]! Đạo hữu bị CHOÁNG trong 2.0s, phong tỏa hoàn toàn đòn đánh và xuất chiêu!`, "boss-skill");

        } else if (skillType === "burst") {
            // Cơ chế 2: Sốc Sát Thương (2.5x đòn công kích)
            const rawDmg = Math.floor(this.monster.attack * 2.5);
            let actualDmg = Math.max(1, rawDmg - Math.floor(pStats.phongThu * 0.45));

            if (this.ultimateBuffBatKham > 0) {
                const maxAllowed = Math.max(1, Math.floor(this.playerMaxHp * 0.05));
                if (actualDmg > maxAllowed) {
                    actualDmg = maxAllowed;
                }
            }

            // Hấp thụ bằng khiên người chơi nếu có
            if (this.playerShield > 0) {
                if (this.playerShield >= actualDmg) {
                    this.playerShield -= actualDmg;
                    if (this.particles) {
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
                    this.particles.emitThunder(pPos.x, pPos.y);
                    this.particles.addFloatingText(`⚡ SỐC SÁT THƯƠNG! -${actualDmg}`, pPos.x, pPos.y - 30, "#ff1744", true);
                }
            }

            this.sound.playThunder();
            this.addCombatLog(`⚡ [BOSS SỐC SÁT THƯƠNG] [${this.monster.name}] cuồng nộ giáng [Diệt Thế Thần Nộ], gây ${actualDmg.toLocaleString()} sát thương bộc phát cực mạnh!`, "boss-skill");

            if (this.playerHp <= 0) {
                this.updateUI();
                this.stopBattle();
                const delay = Math.max(180, Math.round(450 / (this.speedMultiplier || 1)));
                setTimeout(() => this.handleDefeat(), delay);
                return;
            }

        } else if (skillType === "shield") {
            // Cơ chế 3: Tạo Khiên (15% Máu tối đa của Boss)
            const shieldAmount = Math.floor(this.monsterMaxHp * 0.15);
            this.monsterShield = (this.monsterShield || 0) + shieldAmount;
            this.sound.playShield();

            if (this.particles) {
                this.particles.emitMeditationQi(mPos.x, mPos.y, "#00d2d3");
                this.particles.addFloatingText(`+${shieldAmount} Khiên Boss`, mPos.x, mPos.y - 30, "#00d2d3", true);
            }
            this.addCombatLog(`🛡️ [BOSS TẠO KHIÊN] [${this.monster.name}] ngưng tụ [Hỗn Độn Hộ Thể], nhận lớp khiên bảo hộ ${shieldAmount.toLocaleString()} HP!`, "boss-skill");

        } else if (skillType === "lifesteal") {
            // Cơ chế 4: Hút Máu (Tối đa 10% HP người chơi BỎ QUA KHIÊN thành 10% HP cho Boss)
            let drainHp = Math.min(this.playerHp, Math.max(1, Math.floor(this.playerMaxHp * 0.10)));
            if (this.ultimateBuffBatKham > 0) {
                const maxAllowed = Math.max(1, Math.floor(this.playerMaxHp * 0.05));
                drainHp = Math.min(drainHp, maxAllowed);
            }
            // Trừ trực tiếp vào máu người chơi, bỏ qua hoàn toàn khiên!
            this.playerHp = Math.max(0, this.playerHp - drainHp);

            // Boss hồi phục đúng 10% HP tối đa của bản thân
            const healBoss = Math.max(1, Math.floor(this.monsterMaxHp * 0.10));
            this.monsterHp = Math.min(this.monsterMaxHp, this.monsterHp + healBoss);

            this.sound.playHeal();
            this.shakeElement("player-avatar-box");

            if (this.particles) {
                this.particles.emitMeditationQi(mPos.x, mPos.y, "#2ecc71");
                this.particles.addFloatingText(`🩸 BỊ HÚT MÁU! -${drainHp}`, pPos.x, pPos.y - 30, "#ff3838", true);
                this.particles.addFloatingText(`💚 HỒI PHỤC +${healBoss}`, mPos.x, mPos.y - 30, "#2ecc71", true);
            }
            this.addCombatLog(`🩸 [BOSS HÚT MÁU] [${this.monster.name}] thi triển [Thôn Thiên Ma Công]! Hút ${drainHp.toLocaleString()} HP của đạo hữu (BỎ QUA KHIÊN) và hồi phục ${healBoss.toLocaleString()} HP cho bản thân!`, "boss-skill");

            if (this.playerHp <= 0) {
                this.updateUI();
                this.stopBattle();
                const delay = Math.max(180, Math.round(450 / (this.speedMultiplier || 1)));
                setTimeout(() => this.handleDefeat(), delay);
                return;
            }
        }

        this.updateUI();
    }

    /**
     * Xử lý khi Đạo Hữu Chiến Thắng
     */
    handleVictory() {
        this.stopBattle();
        if (this.sound && typeof this.sound.playVictory === "function") {
            this.sound.playVictory();
        }

        const stage = this.currentStage;
        const rewards = stage.rewards || { tuVi: 0, linhThach: 0 };
        if (this.isTowerBattle) {
            if (this.player.isVoCuc) {
                const tinh = rewards.tinhNguyen || (typeof TowerSystem !== "undefined" ? TowerSystem.getFloorTinhNguyen(stage.number) : 1);
                this.player.addTinhNguyen(tinh);
            } else {
                this.player.addTuVi(rewards.tuVi || 0);
            }
        } else {
            if (rewards.tinhNguyen) {
                this.player.addTinhNguyen(rewards.tinhNguyen);
            } else {
                this.player.addTuVi(rewards.tuVi || 0);
            }
        }
        this.player.linhThach = (this.player.linhThach || 0) + (rewards.linhThach || 0);
        if (rewards.honNguyen) {
            this.player.honNguyen = (this.player.honNguyen || 0) + rewards.honNguyen;
        }
        if (rewards.gachaTickets) {
            this.player.addGachaTickets(rewards.gachaTickets);
        }

        if (this.isTowerBattle) {
            if (!this.player.towerData) {
                this.player.towerData = { highestFloor: 0, currentFloor: 1, dailyTickets: 3, lastResetDate: "" };
            }
            this.player.towerData.highestFloor = Math.max(this.player.towerData.highestFloor || 0, stage.number);
            this.player.towerData.currentFloor = stage.number + 1;
        } else if (stage) {
            if (!this.player.clearedStages.includes(stage.id)) {
                this.player.clearedStages.push(stage.id);
            }
            // Ghi nhận mốc vượt bình cảnh Ải 23: Vấn Thiên Địa
            if (stage.id === "stage_23" || stage.id === "stage_van_thien_dia") {
                const milestone = Math.max(1, Math.floor(((this.player.tierIndex || 0) + 1) / 100));
                this.player.vanThienDiaMilestonesCleared = Math.max(this.player.vanThienDiaMilestonesCleared || 0, milestone);
            }
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

        const monsterName = (this.monster && this.monster.name) ? this.monster.name : (stage && stage.name ? stage.name : "Kẻ Địch");
        if (droppedItem && droppedItem.id === "pill_tay_tuy") {
            this.addCombatLog(`🌟 [KỲ DUYÊN] Trảm sát [${monsterName}], phát hiện Nghịch Thiên Linh Bảo [Tẩy Tủy Đan] cực hiếm!`, "victory");
        } else {
            this.addCombatLog(`Đại thắng! Trảm sát [${monsterName}]!`, "victory");
        }

        if (rewards.gachaTickets) {
            this.addCombatLog(`🎫 [CHIẾN LỢI PHẨM] Thu hoạch +${rewards.gachaTickets} Vé Tầm Đạo từ mốc Hư Không Tháp!`, "victory");
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
            const actualTinhGain = (this.isTowerBattle && this.player.isVoCuc)
                ? (rewards.tinhNguyen || (typeof TowerSystem !== "undefined" ? TowerSystem.getFloorTinhNguyen(stage.number) : 1))
                : (rewards.tinhNguyen || 0);
            const actualTuViGain = (this.isTowerBattle && this.player.isVoCuc) ? 0 : (rewards.tuVi || 0);

            this.onCombatEndCallback({
                victory: true,
                stage: stage,
                isTower: this.isTowerBattle,
                tuViGain: actualTuViGain,
                tinhNguyenGain: actualTinhGain,
                linhThachGain: rewards.linhThach,
                honNguyenGain: rewards.honNguyen || 0,
                droppedItem: droppedItem,
                newTitles: newTitles
            });
        }
    }

    /**
     * Xử lý khi Đạo Hữu Thất Bại
     */
    handleDefeat(isEnrageTimeout = false) {
        this.stopBattle();
        if (this.sound && typeof this.sound.playDefeat === "function") {
            this.sound.playDefeat();
        }

        if (this.isTowerBattle) {
            if (!this.player.towerData) {
                this.player.towerData = { highestFloor: 0, currentFloor: 1, dailyTickets: 3, lastResetDate: "" };
            }
            this.player.towerData.dailyTickets = Math.max(0, (this.player.towerData.dailyTickets || 0) - 1);

            if (isEnrageTimeout) {
                this.addCombatLog(`⏳ HẾT THỜI GIAN (60s)! Cuồng bạo hư không cắn nuốt, khiêu chiến thất bại! Tổn thất 1 Lệnh Bài (Còn: ${this.player.towerData.dailyTickets} Lệnh Bài).`, "defeat");
            } else {
                this.addCombatLog(`Đạo hữu trọng thương kiệt sức, khiêu chiến tháp thất bại! Tổn thất 1 Lệnh Bài (Còn: ${this.player.towerData.dailyTickets} Lệnh Bài).`, "defeat");
            }
        } else {
            this.addCombatLog(`Đạo hữu trọng thương kiệt sức, lui về trị thương!`, "defeat");
        }

        if (this.onCombatEndCallback) {
            this.onCombatEndCallback({
                victory: false,
                stage: this.currentStage,
                isTower: this.isTowerBattle,
                isEnrageTimeout: isEnrageTimeout
            });
        }
    }

    // ================= TIỆN ÍCH GIAO DIỆN CHIẾN ĐẤU =================

    /**
     * Thi triển Đại Thần Thông (Ultimate Skill)
     */
    useUltimate() {
        if (!this.isActive || this.monsterHp <= 0) return false;
        if (this.playerStunTimer > 0) return false;

        const ultId = this.player.equippedUltimate;
        if (!ultId) return false;

        const maxRage = this.playerMaxRage || 100;
        if ((this.playerRage || 0) < maxRage) return false;

        const ultSkill = (typeof UltimateSkillSystem !== "undefined")
            ? UltimateSkillSystem.getSkillById(ultId)
            : null;
        if (!ultSkill) return false;

        // Tiêu hao toàn bộ nộ khí
        this.playerRage = 0;

        const pStats = this.player.getTotalStats();
        const mPos = this.getMonsterCenter();
        const pPos = this.getPlayerCenter();

        if (this.sound && typeof this.sound.playThunder === "function") {
            this.sound.playThunder();
        }

        switch (ultId) {
            case "ult_than_nhat_niem": {
                // Thần Cấp: "Nhất Niệm"
                // Trừ thẳng 80% Máu Boss, BỎ QUA KIM THÂN VÀ GIÁP (Sát thương chuẩn True Damage)
                const trueDmg = Math.max(1, Math.floor(this.monsterMaxHp * 0.8));
                this.monsterHp = Math.max(0, this.monsterHp - trueDmg);

                this.shakeElement("monster-avatar-box");
                if (this.particles) {
                    this.particles.emitBreakthrough(mPos.x, mPos.y);
                    this.particles.addFloatingText(`🌌 NHẤT NIỆM! -${trueDmg.toLocaleString()}`, mPos.x, mPos.y - 40, "#ffd700", true);
                    this.particles.addFloatingText("BỎ QUA KIM THÂN & GIÁP (80% HP)!", mPos.x, mPos.y - 65, "#ff1744", true);
                }

                this.addCombatLog(`🌌 [ĐẠI THẦN THÔNG - NHẤT NIỆM] Nhất niệm khai thiên, vạn cổ giai không! Giáng đòn sát thương chuẩn ${trueDmg.toLocaleString()} HP (80% Máu Boss) HOÀN TOÀN BỎ QUA KIM THÂN & GIÁP!`, "dot-mau");
                break;
            }

            case "ult_thanh_tue_nguyet": {
                // Thánh Cấp: "Tuế Nguyệt"
                // Lập tức hồi mọi kỹ năng thường của bản thân
                this.skillCooldowns = [0, 0, 0];

                if (this.particles) {
                    this.particles.emitMeditationQi(pPos.x, pPos.y, "#e040fb");
                    this.particles.addFloatingText("⏳ TUẾ NGUYỆT: HỒI MỌI CHIÊU!", pPos.x, pPos.y - 35, "#e040fb", true);
                }

                this.addCombatLog(`⏳ [ĐẠI THẦN THÔNG - TUẾ NGUYỆT] Luân chuyển thời không, nghịch hồi nhân quả! Lập tức HỒI TOÀN BỘ 3 KỸ NĂNG thường để xả skill liên hoàn!`, "buff");
                break;
            }

            case "ult_thanh_y_chi_bat_tan": {
                // Thánh Cấp: "Ý Chí Bất Tận"
                // +200% tốc đánh, đánh thường thành sát thương chuẩn scale theo vật lí (8s)
                this.ultimateBuffYChi = 8.0;

                if (this.particles) {
                    this.particles.emitSlash(pPos.x, pPos.y, "#ff3d00");
                    this.particles.addFloatingText("⚔️ Ý CHÍ BẤT TẬN (8s)!", pPos.x, pPos.y - 35, "#ff9100", true);
                    this.particles.addFloatingText("+300% TỐC ĐÁNH & SÁT THƯƠNG CHUẨN XUYÊN KHIÊN!", pPos.x, pPos.y - 60, "#ffd700", true);
                }

                this.addCombatLog(`⚔️ [ĐẠI THẦN THÔNG - Ý CHÍ BẤT TẬN] Quyền ý vô song! Trong 8s nhận +300% Tốc Đánh và đòn đánh thường hóa thành SÁT THƯƠNG CHUẨN (800% Vật Lí) ĐÁNH THẲNG VÀO MÁU XUYÊN KHIÊN!`, "buff");
                break;
            }

            case "ult_linh_vo_ton": {
                // Linh Cấp: "Vô Tổn"
                // Khiên hộ thể cực dày: 600% Công Phép + 30% Max HP
                const shieldAmount = Math.floor(pStats.phep * 6 + this.playerMaxHp * 0.3);
                this.playerShield = (this.playerShield || 0) + shieldAmount;

                if (this.sound && typeof this.sound.playShield === "function") {
                    this.sound.playShield();
                }
                if (this.particles) {
                    this.particles.emitMeditationQi(pPos.x, pPos.y, "#00e676");
                    this.particles.addFloatingText(`🛡️ KHIÊN VÔ TỔN +${shieldAmount.toLocaleString()}`, pPos.x, pPos.y - 35, "#00e676", true);
                }

                this.addCombatLog(`🛡️ [ĐẠI THẦN THÔNG - VÔ TỔN] Hộ thể linh quang bao phủ! Nhận Khiên Vô Tổn cực dày trị giá ${shieldAmount.toLocaleString()} HP (600% Phép + 30% Max HP)!`, "buff");
                break;
            }

            case "ult_linh_bat_kham": {
                // Linh Cấp: "Bất Kham"
                // Trong 10s, Boss không thể gây sát thương vượt quá 5% Máu tối đa của bản thân
                this.ultimateBuffBatKham = 10.0;

                if (this.particles) {
                    this.particles.emitMeditationQi(pPos.x, pPos.y, "#00b0ff");
                    this.particles.addFloatingText("⚡ BẤT KHAM (10s)!", pPos.x, pPos.y - 35, "#00b0ff", true);
                    this.particles.addFloatingText("CHẶN MỌI ĐÒN <= 5% HP!", pPos.x, pPos.y - 60, "#00e676", true);
                }

                this.addCombatLog(`⚡ [ĐẠI THẦN THÔNG - BẤT KHAM] Kim thân bất toái! Trong 10 giây tới, đối thủ KHÔNG THỂ gây sát thương vượt quá 5% Máu tối đa của đạo hữu mỗi đòn!`, "buff");
                break;
            }

            case "ult_linh_huyet_te": {
                // Linh Cấp: "Huyết Tế"
                // Trừ 50% Máu bản thân, gây 45% Máu Boss (XUYÊN KIM THÂN, KHÔNG XUYÊN GIÁP)
                const selfHpLoss = Math.max(1, Math.floor(this.playerHp * 0.5));
                this.playerHp = Math.max(1, this.playerHp - selfHpLoss);

                const rawBossDmg = Math.floor(this.monsterMaxHp * 0.45);
                let finalBossDmg = Math.max(1, rawBossDmg - Math.floor(this.monster.defense * 0.5));

                // Bào mòn khiên Boss trước nếu có khiên
                if (this.monsterShield > 0) {
                    if (this.monsterShield >= finalBossDmg) {
                        this.monsterShield -= finalBossDmg;
                        finalBossDmg = 0;
                    } else {
                        finalBossDmg -= this.monsterShield;
                        this.monsterShield = 0;
                    }
                }

                if (finalBossDmg > 0) {
                    this.monsterHp = Math.max(0, this.monsterHp - finalBossDmg);
                }

                this.shakeElement("player-avatar-box");
                this.shakeElement("monster-avatar-box");

                if (this.particles) {
                    this.particles.emitFire(mPos.x, mPos.y);
                    this.particles.addFloatingText(`🩸 -${selfHpLoss.toLocaleString()} HP Bản Thân`, pPos.x, pPos.y - 30, "#ff1744", true);
                    this.particles.addFloatingText(`💥 HUYẾT TẾ! -${finalBossDmg.toLocaleString()}`, mPos.x, mPos.y - 40, "#ff5252", true);
                    this.particles.addFloatingText("XUYÊN KIM THÂN!", mPos.x, mPos.y - 65, "#ff9100", true);
                }

                this.addCombatLog(`🩸 [ĐẠI THẦN THÔNG - HUYẾT TẾ] Hiến tế ${selfHpLoss.toLocaleString()} HP bản thân, giáng đòn hủy diệt ${finalBossDmg.toLocaleString()} HP (45% Máu Boss, XUYÊN KIM THÂN, tính Giáp)!`, "pha-kim-than");
                break;
            }
        }

        if (this.monsterHp <= 0) {
            this.updateUI();
            this.stopBattle();
            const delay = Math.max(180, Math.round(450 / (this.speedMultiplier || 1)));
            setTimeout(() => {
                this.handleVictory();
            }, delay);
            return true;
        }

        this.updateUI();
        return true;
    }

    updateUI() {
        if (typeof document === "undefined") return;
        const formatHp = (val) => {
            if (val === undefined || val === null || isNaN(val)) return "0";
            if (val >= 1000000000000000) {
                const q = val / 1000000000000000;
                return (q % 1 === 0 ? q : q.toFixed(2)) + " Triệu Tỷ";
            }
            if (val >= 1000000000000) {
                const t = val / 1000000000000;
                return (t % 1 === 0 ? t : t.toFixed(2)) + " Nghìn Tỷ";
            }
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

        // Cập nhật trạng thái Choáng của người chơi
        const playerStatus = document.getElementById("combat-player-status");
        if (playerStatus) {
            if (this.playerStunTimer > 0) {
                playerStatus.style.display = "inline-block";
                playerStatus.innerText = `💫 CHOÁNG (${this.playerStunTimer.toFixed(1)}s)`;
            } else {
                playerStatus.style.display = "none";
            }
        }

        // Cập nhật thanh máu quái vật
        const monsterHpPercent = Math.max(0, Math.min(100, (this.monsterHp / this.monsterMaxHp) * 100));
        const monsterHpBar = document.getElementById("combat-monster-hp-bar");
        const monsterHpText = document.getElementById("combat-monster-hp-text");
        if (monsterHpBar) monsterHpBar.style.width = `${monsterHpPercent}%`;
        if (monsterHpText) {
            const shieldText = (this.monsterShield > 0) ? ` (+${formatHp(this.monsterShield)} 🛡️)` : "";
            monsterHpText.innerText = `${formatHp(this.monsterHp)} / ${formatHp(this.monsterMaxHp)}${shieldText}`;
        }

        // Cập nhật thanh khiên quái vật (Boss)
        const monsterShieldBar = document.getElementById("combat-monster-shield-bar");
        if (monsterShieldBar) {
            const mShieldPercent = Math.min(100, ((this.monsterShield || 0) / this.monsterMaxHp) * 100);
            monsterShieldBar.style.width = `${mShieldPercent}%`;
            monsterShieldBar.style.display = (this.monsterShield > 0) ? "block" : "none";
        }

        // Cập nhật trạng thái Thiêu Đốt / Đốt Máu của quái vật / Boss
        const monsterStatus = document.getElementById("combat-monster-status");
        if (monsterStatus) {
            if (this.monsterBurnDuration > 0 && this.monsterHp > 0) {
                monsterStatus.style.display = "inline-block";
                monsterStatus.innerText = `🔥 THIÊU ĐỐT (${this.monsterBurnDuration.toFixed(1)}s)`;
            } else {
                monsterStatus.style.display = "none";
            }
        }

        // Cập nhật 3 nút kỹ năng
        for (let i = 0; i < 3; i++) {
            const skillBtn = document.getElementById(`combat-skill-btn-${i}`);
            const cdOverlay = document.getElementById(`combat-skill-cd-${i}`);
            const skillId = this.player.equippedSkills[i];

            if (skillBtn) {
                if (skillId) {
                    const skill = SkillSystem.getSkillById(skillId);
                    skillBtn.disabled = (this.skillCooldowns[i] > 0) || (this.playerStunTimer > 0);
                    if (cdOverlay) {
                        if (this.playerStunTimer > 0) {
                            cdOverlay.style.display = "flex";
                            cdOverlay.innerText = `💫 ${this.playerStunTimer.toFixed(1)}s`;
                        } else if (this.skillCooldowns[i] > 0) {
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

        // Cập nhật thanh Nộ Khí người chơi
        const curRage = this.playerRage || 0;
        const maxRage = this.playerMaxRage || 100;
        const ragePercent = Math.max(0, Math.min(100, (curRage / maxRage) * 100));

        const rageBar = document.getElementById("combat-player-rage-bar");
        const rageText = document.getElementById("combat-player-rage-text");
        if (rageBar) rageBar.style.width = `${ragePercent}%`;
        if (rageText) rageText.innerText = `${curRage} / ${maxRage} Nộ`;

        // Cập nhật Nút Đại Thần Thông
        const ultBtn = document.getElementById("combat-ultimate-btn");
        const ultOverlay = document.getElementById("combat-ultimate-cd");
        const ultIcon = document.getElementById("combat-ultimate-icon");
        const ultName = document.getElementById("combat-ultimate-name");

        if (ultBtn) {
            const ultId = this.player.equippedUltimate;
            if (ultId && typeof UltimateSkillSystem !== "undefined") {
                const ultSkill = UltimateSkillSystem.getSkillById(ultId);
                if (ultSkill) {
                    ultBtn.style.display = "flex";
                    if (ultIcon) ultIcon.innerText = ultSkill.icon;
                    if (ultName) ultName.innerText = ultSkill.name;

                    const isReady = (curRage >= maxRage) && (this.playerStunTimer <= 0);
                    ultBtn.disabled = !isReady;
                    if (isReady) {
                        ultBtn.classList.add("ultimate-ready");
                    } else {
                        ultBtn.classList.remove("ultimate-ready");
                    }

                    if (ultOverlay) {
                        if (isReady) {
                            ultOverlay.style.display = "none";
                        } else {
                            ultOverlay.style.display = "flex";
                            ultOverlay.innerText = `${Math.floor(ragePercent)}%`;
                        }
                    }
                } else {
                    ultBtn.style.display = "none";
                }
            } else {
                ultBtn.style.display = "none";
            }
        }

        // Cập nhật thanh đếm lùi Enrage Timer (Hư Không Tháp)
        const enrageBox = document.getElementById("combat-enrage-box");
        const enrageText = document.getElementById("combat-enrage-timer");
        const enrageBar = document.getElementById("combat-enrage-bar");

        if (enrageBox) {
            if (this.isTowerBattle) {
                enrageBox.style.display = "flex";
                if (enrageText) {
                    enrageText.innerText = `⏳ ${this.towerTimer.toFixed(1)}s`;
                    enrageText.style.color = this.towerTimer <= 15 ? "#ff4757" : "#ffd700";
                }
                if (enrageBar) {
                    const pct = Math.max(0, Math.min(100, (this.towerTimer / (this.towerTimeLimit || 60)) * 100));
                    enrageBar.style.width = `${pct}%`;
                    enrageBar.style.backgroundColor = this.towerTimer <= 15 ? "#ff4757" : "#a855f7";
                }
            } else {
                enrageBox.style.display = "none";
            }
        }

        // Cập nhật hiển thị Thần Thú trong combat
        const petWidget = document.getElementById("combat-pet-widget");
        if (petWidget) {
            if (this.pet) {
                petWidget.style.display = "flex";
                const petIcon = document.getElementById("combat-pet-icon");
                const petName = document.getElementById("combat-pet-name");
                const petHpBar = document.getElementById("combat-pet-hp-bar");
                const petShieldBar = document.getElementById("combat-pet-shield-bar");
                const petHpText = document.getElementById("combat-pet-hp-text");
                const petStatus = document.getElementById("combat-pet-status");

                if (petIcon) petIcon.innerText = this.pet.icon || "🐾";
                if (petName) petName.innerText = this.pet.name || "Thần Thú";

                const petHpPct = Math.max(0, Math.min(100, (this.petHp / this.petMaxHp) * 100));
                if (petHpBar) petHpBar.style.width = `${petHpPct}%`;

                if (petShieldBar) {
                    const petShieldPct = Math.min(100, ((this.petShield || 0) / this.petMaxHp) * 100);
                    petShieldBar.style.width = `${petShieldPct}%`;
                    petShieldBar.style.display = (this.petShield > 0) ? "block" : "none";
                }

                if (petHpText) {
                    const shieldStr = (this.petShield > 0) ? ` (+${formatHp(this.petShield)} 🛡️)` : "";
                    petHpText.innerText = `${formatHp(this.petHp)} / ${formatHp(this.petMaxHp)}${shieldStr}`;
                }

                if (petStatus) {
                    if (this.petHp <= 0) {
                        petStatus.innerText = "Trọng Thương";
                        petStatus.style.color = "#ff5252";
                    } else if (this.petRageBuffTimer > 0) {
                        petStatus.innerText = `Cuồng Nộ (${this.petRageBuffTimer.toFixed(1)}s)`;
                        petStatus.style.color = "#ffd700";
                    } else {
                        petStatus.innerText = this.pet.roleName || "";
                        petStatus.style.color = this.pet.themeColor || "#fff";
                    }
                }
            } else {
                petWidget.style.display = "none";
            }
        }
    }

    shakeElement(elemId) {
        if (typeof document === "undefined") return;
        const el = document.getElementById(elemId);
        if (!el) return;
        el.classList.add("shake-anim");
        setTimeout(() => el.classList.remove("shake-anim"), 300);
    }

    getPlayerCenter() {
        if (typeof document === "undefined") return { x: 200, y: 300 };
        const el = document.getElementById("combat-player-box");
        if (el) {
            const r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
        return { x: 200, y: 300 };
    }

    getMonsterCenter() {
        if (typeof document === "undefined") return { x: 600, y: 300 };
        const el = document.getElementById("combat-monster-box");
        if (el) {
            const r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
        return { x: 600, y: 300 };
    }

    addCombatLog(msg, type = "normal") {
        if (typeof document === "undefined") return;
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

if (typeof module !== "undefined" && module.exports) {
    module.exports = CombatEngine;
    module.exports.CombatEngine = CombatEngine;
}
