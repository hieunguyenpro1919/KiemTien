/**
 * PHÂN HỆ QUẢN LÝ HƯ KHÔNG THÁP & ĐÀI CẦU ĐẠO (PLAYER TOWER & GACHA)
 * Tách từ player.js - Gắn vào Player.prototype
 */

(function() {
    const target = (typeof Player !== "undefined") ? Player : (typeof global !== "undefined" && global.Player ? global.Player : null);
    if (!target) return;

    Object.assign(target.prototype, {
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
        },

        addGachaTickets(n = 1) {
            this.gachaTickets = Math.max(0, (this.gachaTickets || 0) + n);
            return this.gachaTickets;
        },

        addFortuneShards(n = 1) {
            this.fortuneShards = Math.max(0, (this.fortuneShards || 0) + n);
            let ticketsForged = 0;
            while (this.fortuneShards >= 10) {
                this.fortuneShards -= 10;
                this.gachaTickets = (this.gachaTickets || 0) + 1;
                ticketsForged++;
            }
            return { totalShards: this.fortuneShards, ticketsForged };
        },

        equipUltimate(id) {
            if (!id) {
                this.equippedUltimate = null;
                return { success: true, equipped: null };
            }
            if (!this.unlockedUltimates.includes(id)) {
                return { success: false, msg: "Chưa mở khóa Đại Thần Thông này!" };
            }
            this.equippedUltimate = id;
            return { success: true, equipped: id };
        },

        rollGacha(times = 1) {
            times = Math.max(1, Math.floor(times || 1));

            // Tự động quy đổi Vé Tầm Đạo từ túi đồ nếu gachaTickets chưa đủ
            const invTickets = this.inventory.filter(id => id === "ticket_tam_dao").length;
            if (this.gachaTickets < times && invTickets > 0) {
                const need = times - this.gachaTickets;
                const convertCount = Math.min(need, invTickets);
                for (let i = 0; i < convertCount; i++) {
                    const idx = this.inventory.indexOf("ticket_tam_dao");
                    if (idx !== -1) this.inventory.splice(idx, 1);
                }
                this.gachaTickets += convertCount;
            }

            if (this.gachaTickets < times) {
                return {
                    success: false,
                    msg: `Không đủ Vé Tầm Đạo! Cần ${times} vé (Hiện có: ${this.gachaTickets}).`
                };
            }

            this.gachaTickets -= times;
            const results = [];
            let newSkillsCount = 0;
            let dupesCount = 0;
            let shardsGained = 0;
            let ticketsForged = 0;

            for (let i = 0; i < times; i++) {
                this.pityThanCount = (this.pityThanCount || 0) + 1;
                this.pityThanhCount = (this.pityThanhCount || 0) + 1;

                const skill = (typeof UltimateSkillSystem !== "undefined")
                    ? UltimateSkillSystem.rollGachaDrop(this.pityThanCount, this.pityThanhCount)
                    : null;
                if (!skill) continue;

                if (skill.tier === "than") {
                    this.pityThanCount = 0;
                    this.pityThanhCount = 0;
                } else if (skill.tier === "thanh") {
                    this.pityThanhCount = 0;
                }

                if (skill.isPet) {
                    const petId = skill.petId || skill.id;
                    if (!this.pets) this.pets = (Player.getDefaultPets ? Player.getDefaultPets() : {
                        pet_tank: { unlocked: false, realm: 0, exp: 0, skillLevel: 1, shards: 0 },
                        pet_dps:  { unlocked: false, realm: 0, exp: 0, skillLevel: 1, shards: 0 },
                        pet_buff: { unlocked: false, realm: 0, exp: 0, skillLevel: 1, shards: 0 }
                    });
                    if (!this.pets[petId]) {
                        this.pets[petId] = { unlocked: false, realm: 0, exp: 0, skillLevel: 1, shards: 0 };
                    }
                    const isNew = !this.pets[petId].unlocked;
                    const petSys = (typeof PetSystem !== "undefined") ? PetSystem : (typeof require !== "undefined" ? require("../data/pets.js").PetSystem : null);
                    const petDef = (petSys && typeof petSys.getPetById === "function") ? petSys.getPetById(petId) : null;
                    const petPayload = {
                        id: petId,
                        petId,
                        name: (petDef && petDef.name) || skill.name,
                        icon: (petDef && petDef.icon) || skill.icon,
                        roleName: (petDef && petDef.roleName) || skill.roleName || "Thần Thú",
                        themeColor: (petDef && petDef.themeColor) || skill.themeColor || "#ffd700",
                        badgeBg: (petDef && petDef.badgeBg) || skill.badgeBg || "rgba(255, 215, 0, 0.2)"
                    };

                    if (isNew) {
                        this.pets[petId].unlocked = true;
                        if (!this.activePetId) {
                            this.activePetId = petId;
                        }
                        newSkillsCount++;
                        results.push({ item: skill, skill, pet: petPayload, isNew: true, isPet: true, petId });
                    } else {
                        // Trùng Thần Thú: Tự động phân giải thành Mảnh Thú Hồn đặc thù của con thú đó
                        this.pets[petId].shards = (this.pets[petId].shards || 0) + 1;
                        dupesCount++;
                        results.push({
                            item: skill,
                            skill,
                            pet: petPayload,
                            isNew: false,
                            isPet: true,
                            petId,
                            shardsGained: 1,
                            petShards: this.pets[petId].shards
                        });
                    }
                    continue;
                }

                const isNew = !this.unlockedUltimates.includes(skill.id);
                if (isNew) {
                    this.unlockedUltimates.push(skill.id);
                    // Nếu chưa trang bị chiêu nào, tự động trang bị chiêu đầu tiên vừa quay được
                    if (!this.equippedUltimate) {
                        this.equippedUltimate = skill.id;
                    }
                    newSkillsCount++;
                    results.push({ skill, isNew: true });
                } else {
                    // Trùng: Tự động phân giải thành 1 Mảnh Cơ Duyên
                    const forgeRes = this.addFortuneShards(1);
                    dupesCount++;
                    shardsGained++;
                    ticketsForged += forgeRes.ticketsForged;
                    results.push({ 
                        skill, 
                        isNew: false, 
                        shardsGained: 1, 
                        ticketsForged: forgeRes.ticketsForged 
                    });
                }
            }

            return {
                success: true,
                times,
                results,
                newSkillsCount,
                dupesCount,
                shardsGained,
                ticketsForged,
                remainingTickets: this.gachaTickets,
                currentShards: this.fortuneShards,
                pityThanCount: this.pityThanCount,
                pityThanhCount: this.pityThanhCount
            };
        }
    });
})();
