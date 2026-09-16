/**
 * PHÂN HỆ QUẢN LÝ TAM ĐẠI THẦN THÚ (PLAYER PET SYSTEM)
 * Tách từ player.js - Gắn vào Player.prototype
 */

(function() {
    const target = (typeof Player !== "undefined") ? Player : (typeof global !== "undefined" && global.Player ? global.Player : null);
    if (!target) return;

    // Phương thức tĩnh
    target.getDefaultPets = function() {
        return {
            pet_tank: { unlocked: false, realm: 0, exp: 0, skillLevel: 1, shards: 0 },
            pet_dps:  { unlocked: false, realm: 0, exp: 0, skillLevel: 1, shards: 0 },
            pet_buff: { unlocked: false, realm: 0, exp: 0, skillLevel: 1, shards: 0 }
        };
    };

    Object.assign(target.prototype, {
        hasAnyPetUnlocked() {
            if (!this.pets) return false;
            return Object.values(this.pets).some(p => p && p.unlocked);
        },

        setActivePet(petId) {
            if (!petId) {
                this.activePetId = null;
                return { success: true, activePetId: null };
            }
            if (!this.pets || !this.pets[petId] || !this.pets[petId].unlocked) {
                return { success: false, msg: "Thần Thú chưa được mở khóa!" };
            }
            this.activePetId = petId;
            return { success: true, activePetId: petId };
        },

        getPetStats(petId) {
            if (!this.pets || !this.pets[petId]) return null;
            const petData = this.pets[petId];
            const petSys = (typeof PetSystem !== "undefined") ? PetSystem : (typeof require !== "undefined" ? require("../data/pets.js").PetSystem : null);
            if (!petSys) return null;
            return petSys.calculatePetStats(petId, petData.realm);
        },

        feedPetPill(petId, pillId, count = 1) {
            if (!this.pets || !this.pets[petId] || !this.pets[petId].unlocked) {
                return { success: false, msg: "Thần Thú chưa mở khóa!" };
            }
            const pet = this.pets[petId];
            const petSys = (typeof PetSystem !== "undefined") ? PetSystem : (typeof require !== "undefined" ? require("../data/pets.js").PetSystem : null);
            if (!petSys) return { success: false, msg: "Không tìm thấy hệ thống Thần Thú!" };

            const realmInfo = petSys.getRealm(pet.realm);
            if (pet.realm >= petSys.getMaxRealm() && pet.exp >= realmInfo.reqExp) {
                return { success: false, msg: "Thần Thú đã đạt Cảnh Giới Vô Thượng tối đa!" };
            }

            const itemSys = (typeof ItemSystem !== "undefined") ? ItemSystem : (typeof require !== "undefined" ? require("../data/items.js").ItemSystem : null);
            const item = itemSys ? itemSys.getItemById(pillId) : null;
            if (!item || (!item.tuViGain && !item.tinhNguyenGain)) {
                return { success: false, msg: "Vật phẩm này không phải đan dược tu luyện!" };
            }

            // Đếm số lượng đan dược trong túi đồ
            let availableCount = 0;
            this.inventory.forEach(id => {
                if (id === pillId) availableCount++;
            });

            if (availableCount < count) {
                return { success: false, msg: `Không đủ đan dược! Có ${availableCount}, cần ${count}.` };
            }

            // Trừ đan dược khỏi túi đồ
            let removed = 0;
            for (let i = this.inventory.length - 1; i >= 0; i--) {
                if (this.inventory[i] === pillId && removed < count) {
                    this.inventory.splice(i, 1);
                    removed++;
                }
            }

            const expPerPill = (item.tuViGain || 0) + (item.tinhNguyenGain ? item.tinhNguyenGain * 1000000000 : 0);
            const totalExp = expPerPill * count;
            pet.exp = (pet.exp || 0) + totalExp;

            return {
                success: true,
                pillName: item.name,
                count: count,
                expGained: totalExp,
                currentExp: pet.exp,
                reqExp: realmInfo.reqExp,
                canBreakthrough: pet.exp >= realmInfo.reqExp && pet.realm < petSys.getMaxRealm()
            };
        },

        feedPetMax(petId) {
            if (!this.pets || !this.pets[petId] || !this.pets[petId].unlocked) {
                return { success: false, msg: "Thần Thú chưa mở khóa!" };
            }
            const pet = this.pets[petId];
            const petSys = (typeof PetSystem !== "undefined") ? PetSystem : (typeof require !== "undefined" ? require("../data/pets.js").PetSystem : null);
            const itemSys = (typeof ItemSystem !== "undefined") ? ItemSystem : (typeof require !== "undefined" ? require("../data/items.js").ItemSystem : null);
            if (!petSys || !itemSys) return { success: false, msg: "Lỗi nạp hệ thống!" };

            let totalExp = 0;
            let totalPills = 0;

            for (let i = this.inventory.length - 1; i >= 0; i--) {
                const itemId = this.inventory[i];
                const item = itemSys.getItemById(itemId);
                if (item && item.slot === "dan_duoc" && (item.tuViGain || item.tinhNguyenGain)) {
                    const exp = (item.tuViGain || 0) + (item.tinhNguyenGain ? item.tinhNguyenGain * 1000000000 : 0);
                    totalExp += exp;
                    totalPills++;
                    this.inventory.splice(i, 1);
                }
            }

            if (totalPills === 0) {
                return { success: false, msg: "Túi đồ không còn đan dược tu luyện nào!" };
            }

            pet.exp = (pet.exp || 0) + totalExp;
            const realmInfo = petSys.getRealm(pet.realm);

            return {
                success: true,
                totalPills,
                totalExp,
                currentExp: pet.exp,
                reqExp: realmInfo.reqExp,
                canBreakthrough: pet.exp >= realmInfo.reqExp && pet.realm < petSys.getMaxRealm()
            };
        },

        breakthroughPet(petId) {
            if (!this.pets || !this.pets[petId] || !this.pets[petId].unlocked) {
                return { success: false, msg: "Thần Thú chưa mở khóa!" };
            }
            const pet = this.pets[petId];
            const petSys = (typeof PetSystem !== "undefined") ? PetSystem : (typeof require !== "undefined" ? require("../data/pets.js").PetSystem : null);
            if (!petSys) return { success: false, msg: "Lỗi nạp hệ thống!" };

            if (pet.realm >= petSys.getMaxRealm()) {
                return { success: false, msg: "Thần Thú đã đạt Cảnh Giới Vô Thượng tối đa!" };
            }

            const realmInfo = petSys.getRealm(pet.realm);
            if (pet.exp < realmInfo.reqExp) {
                return { success: false, msg: `Tu Vi chưa đầy! Cần ${realmInfo.reqExp.toLocaleString("vi-VN")} điểm Tu Vi.` };
            }

            pet.exp -= realmInfo.reqExp;
            pet.realm += 1;
            const newRealmInfo = petSys.getRealm(pet.realm);

            return {
                success: true,
                newRealm: pet.realm,
                newRealmName: newRealmInfo.name,
                petStats: petSys.calculatePetStats(petId, pet.realm)
            };
        },

        upgradePetSkill(petId) {
            if (!this.pets || !this.pets[petId] || !this.pets[petId].unlocked) {
                return { success: false, msg: "Thần Thú chưa mở khóa!" };
            }
            const pet = this.pets[petId];
            const petSys = (typeof PetSystem !== "undefined") ? PetSystem : (typeof require !== "undefined" ? require("../data/pets.js").PetSystem : null);
            if (!petSys) return { success: false, msg: "Lỗi nạp hệ thống!" };

            const currentLvl = pet.skillLevel || 1;
            if (currentLvl >= 12) {
                return { success: false, msg: "Thần Thông đã đạt Cấp 12 Tối Thượng!" };
            }

            // Điều kiện: Cảnh giới mở trần cấp (Ví dụ Cảnh giới 0 mở Cấp 1, Cảnh giới 1 mở Cấp 2, ...)
            if (currentLvl >= pet.realm + 1) {
                const nextReqRealm = petSys.getRealm(currentLvl);
                return { 
                    success: false, 
                    msg: `Cần Thần Thú đột phá lên [${nextReqRealm ? nextReqRealm.name : "Cảnh Giới Kế Tiếp"}] mới mở trần nâng cấp Cấp ${currentLvl + 1}!` 
                };
            }

            const cost = petSys.getSkillUpgradeCost(petId, currentLvl);
            if (!cost) return { success: false, msg: "Không tìm thấy công thức nâng cấp!" };

            // 1. Kiểm tra Mảnh Thú Hồn
            if ((pet.shards || 0) < cost.shards) {
                return { 
                    success: false, 
                    msg: `Không đủ Mảnh Thú Hồn! Cần ${cost.shards} Mảnh (Hiện có: ${pet.shards || 0}). Hãy rút tại Đài Cầu Đạo để nhận thêm.` 
                };
            }

            // 2. Kiểm tra Linh Thạch
            if (cost.linhThach > 0 && (this.linhThach || 0) < cost.linhThach) {
                return { 
                    success: false, 
                    msg: `Không đủ Linh Thạch! Cần ${cost.linhThach.toLocaleString("vi-VN")} 💎.` 
                };
            }

            // 3. Kiểm tra Hỗn Nguyên Thạch
            if (cost.honNguyen > 0 && (this.honNguyen || 0) < cost.honNguyen) {
                return { 
                    success: false, 
                    msg: `Không đủ Hỗn Nguyên Thạch! Cần ${cost.honNguyen.toLocaleString()} 🌀.` 
                };
            }

            // 4. Kiểm tra Đan Dược mốc (nếu có)
            if (cost.pillId) {
                const pillIdx = this.inventory.indexOf(cost.pillId);
                if (pillIdx === -1) {
                    return { 
                        success: false, 
                        msg: `Cần 1x [${cost.pillName || cost.pillId}] làm dược dẫn nâng cấp!` 
                    };
                }
                // Trừ đan dược
                this.inventory.splice(pillIdx, 1);
            }

            // Trừ tài nguyên
            pet.shards -= cost.shards;
            if (cost.linhThach > 0) this.linhThach -= cost.linhThach;
            if (cost.honNguyen > 0) this.honNguyen -= cost.honNguyen;

            pet.skillLevel = currentLvl + 1;
            const skillInfo = petSys.getSkillInfo(petId, pet.skillLevel);

            return {
                success: true,
                newLevel: pet.skillLevel,
                skillInfo
            };
        }
    });
})();
