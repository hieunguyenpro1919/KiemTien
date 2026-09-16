/**
 * PHÂN HỆ QUẢN LÝ ĐỘT PHÁ, TU VI & CẢNH GIỚI (PLAYER BREAKTHROUGH)
 * Tách từ player.js - Gắn vào Player.prototype
 */

(function() {
    const target = (typeof Player !== "undefined") ? Player : (typeof global !== "undefined" && global.Player ? global.Player : null);
    if (!target) return;

    Object.assign(target.prototype, {
        /**
         * Tính toán tỉ lệ thành công của Vấn Đạo Độ Kiếp (%)
         * - 9 Cảnh giới cốt truyện (Realm 0..8, 10 tầng/cảnh giới):
         *   Mỗi tầng -5% tỉ lệ độ kiếp (Tầng 1 = 100%, Tầng 2 = 95%, ..., Đỉnh phong = 55%). Tối thiểu 10%.
         * - 3 Cảnh giới vô hạn tầng (Realm 9..11: Vô Thượng Lộ, Vạn Vì Tinh Tú, Đại Đạo Chí Cao Vô Thượng):
         *   Mỗi tầng -0.5% tỉ lệ độ kiếp (Tầng 1 = 100%, Tầng 2 = 99.5%, ..., Tầng 100 = 50.5%). Tối thiểu 10%.
         *   Cứ mỗi 100 tầng (tierIndex % 100) làm mới lại 100%.
         * - Cộng dồn với breakthroughBonusRate từ đan dược trong cảnh giới / chu kỳ 100 tầng hiện tại.
         *   Khi thăng đại cảnh giới mới hoặc qua chu kỳ 100 tầng thì làm mới lại cùng bản thân.
         */
        getBreakthroughRate() {
            let baseRate = 100;
            if (this.realmIndex <= 8) {
                baseRate = Math.max(10, 100 - ((this.tierIndex || 0) * 5));
            } else {
                const cycleTier = (this.tierIndex || 0) % 100;
                baseRate = Math.max(10, +(100 - cycleTier * 0.5).toFixed(1));
            }
            const bonus = Math.max(0, Number(this.breakthroughBonusRate) || 0);
            const totalRate = Math.min(100, Math.max(10, +(baseRate + bonus).toFixed(1)));
            return {
                baseRate,
                bonusRate: bonus,
                totalRate
            };
        },

        /**
         * Kiểm tra các cổng bình cảnh (Gates) chặn đột phá
         * Trả về { blocked: boolean, reason: string|null, isVoCucBlocked: boolean, isVanThienDiaBlocked: boolean, milestone: number, reqStageId: string|null, msg: string|null }
         */
        getBreakthroughGate() {
            // 1. Bình cảnh Ải 22: Tầng 100 Đại Đạo Chí Cao Vô Thượng (chưa bước vào Vô Cực và chưa vượt Ải 22)
            if (!this.isVoCuc && this.realmIndex >= 11 && this.tierIndex >= 99) {
                const hasClearedVoCuc = this.clearedStages && this.clearedStages.includes("stage_vo_cuc");
                if (!hasClearedVoCuc) {
                    return {
                        blocked: true,
                        reason: "stage_22",
                        isVoCucBlocked: true,
                        isVanThienDiaBlocked: false,
                        milestone: 0,
                        reqStageId: "stage_vo_cuc",
                        msg: "Cần đánh bại [Ải 22: Hư Vô Bản Nguyên Cảnh] mới có thể tiếp tục đột phá!"
                    };
                }
            }

            // 2. Bình cảnh Ải 23: Cảnh Giới Vô Cực sau mỗi 100 tầng đột phá (Tầng 200, 300, 400...)
            if (this.isVoCuc && (this.tierIndex + 1) % 100 === 0) {
                const milestone = Math.floor((this.tierIndex + 1) / 100);
                if ((this.vanThienDiaMilestonesCleared || 0) < milestone) {
                    return {
                        blocked: true,
                        reason: "stage_23",
                        isVoCucBlocked: false,
                        isVanThienDiaBlocked: true,
                        milestone: milestone,
                        reqStageId: "stage_van_thien_dia",
                        msg: `Cần trảm sát Boss [Ải 23: Vấn Thiên Địa] (Mốc ${milestone * 100} Tầng) để phá vỡ bình cảnh thiên địa!`
                    };
                }
            }

            return {
                blocked: false,
                reason: null,
                isVoCucBlocked: false,
                isVanThienDiaBlocked: false,
                milestone: 0,
                reqStageId: null,
                msg: null
            };
        },

        /**
         * Kiểm tra có đủ điều kiện Đột Phá hay không
         */
        canBreakthrough() {
            const gate = this.getBreakthroughGate();
            if (gate.blocked) return false;

            const maxTuVi = this.getMaxTuVi();
            if (this.isVoCuc) {
                return (this.tinhNguyen || 0) >= maxTuVi;
            }
            return (this.tuVi || 0) >= maxTuVi;
        },

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
        },

        /**
         * Thêm Tu Vi (từ đả tọa, dùng đan dược, vượt ải)
         * Nếu ở Cảnh Giới Vô Cực: Tích lũy đủ 1 Tỷ Tu Vi = 1 Tinh Nguyên (chống bug 1:1)
         */
        addTuVi(amount) {
            amount = Number(amount);
            if (isNaN(amount) || amount <= 0) {
                return { added: 0, canBreakthrough: this.canBreakthrough() };
            }
            if (this.isVoCuc) {
                this.vocucPendingTuVi = (this.vocucPendingTuVi || 0) + amount;
                if (this.vocucPendingTuVi >= 1000000000) {
                    const tinhGain = Math.floor(this.vocucPendingTuVi / 1000000000);
                    this.vocucPendingTuVi = this.vocucPendingTuVi % 1000000000;
                    return this.addTinhNguyen(tinhGain);
                }
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
        },

        /**
         * Đột Phá Cảnh Giới / Tăng Tầng Tu Vi
         * MỖI LẦN TĂNG TU VI SẼ CÓ 4 ĐIỂM TIỀM NĂNG
         * Hợp đồng trả về: Luôn trả về object { success: boolean, msg: string, ... }, không bao giờ trả về bare false.
         */
        breakthrough() {
            const maxTuVi = this.getMaxTuVi();

            // 1. Kiểm tra cổng bình cảnh dùng chung (Ải 22, Ải 23)
            const gate = this.getBreakthroughGate();
            if (gate.blocked) {
                return {
                    success: false,
                    isVoCucBlocked: gate.isVoCucBlocked,
                    isVanThienDiaBlocked: gate.isVanThienDiaBlocked,
                    milestone: gate.milestone,
                    reason: gate.reason,
                    msg: gate.msg
                };
            }

            // 2. Đang ở Cảnh Giới Vô Cực (Tầng 101+)
            if (this.isVoCuc) {
                if ((this.tinhNguyen || 0) < maxTuVi) {
                    return {
                        success: false,
                        isNotEnoughResource: true,
                        isVoCuc: true,
                        current: this.tinhNguyen || 0,
                        required: maxTuVi,
                        msg: `Chưa đủ Tinh Nguyên để đột phá! Cần ${maxTuVi} Tinh Nguyên (Hiện có: ${this.tinhNguyen || 0} 🌌).`
                    };
                }

                // Kiểm tra tỉ lệ độ kiếp thành công
                const rateInfo = this.getBreakthroughRate();
                const roll = Math.random() * 100;
                if (roll > rateInfo.totalRate) {
                    const penalty = Math.max(1, Math.floor(maxTuVi * 0.2));
                    this.tinhNguyen = Math.max(0, (this.tinhNguyen || 0) - penalty);
                    return {
                        success: false,
                        isFailedRate: true,
                        rate: rateInfo.totalRate,
                        penaltyText: `-${penalty} Tinh Nguyên`,
                        msg: `⚡ [ĐỘ KIẾP THẤT BẠI] Lôi kiếp chấn động đan điền! Đột phá thất bại (Tỉ lệ: ${rateInfo.totalRate}%), hao tổn 20% linh lực (-${penalty} 🌌).`
                    };
                }

                this.tinhNguyen = Math.max(0, (this.tinhNguyen || 0) - maxTuVi);
                this.tierIndex = (this.tierIndex || 100) + 1;
                if (this.tierIndex % 100 === 0) {
                    this.breakthroughBonusRate = 0; // Làm mới cùng chu kỳ 100 tầng
                }
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
                if ((this.tuVi || 0) < maxTuVi) {
                    return {
                        success: false,
                        isNotEnoughResource: true,
                        isVoCuc: false,
                        current: this.tuVi || 0,
                        required: maxTuVi,
                        msg: `Chưa tích tụ đủ Tu Vi để thăng hoa Vô Cực! Cần ${maxTuVi.toLocaleString("vi-VN")} Tu Vi.`
                    };
                }

                const rateInfo = this.getBreakthroughRate();
                const roll = Math.random() * 100;
                if (roll > rateInfo.totalRate) {
                    const penalty = Math.max(1, Math.floor(maxTuVi * 0.2));
                    this.tuVi = Math.max(0, (this.tuVi || 0) - penalty);
                    return {
                        success: false,
                        isFailedRate: true,
                        rate: rateInfo.totalRate,
                        penaltyText: `-${penalty.toLocaleString("vi-VN")} Tu Vi`,
                        msg: `⚡ [ĐỘ KIẾP THẤT BẠI] Lôi kiếp chấn động đan điền! Đột phá thất bại (Tỉ lệ: ${rateInfo.totalRate}%), hao tổn 20% linh lực.`
                    };
                }

                const excessTuVi = Math.max(0, this.tuVi - maxTuVi);
                this.isVoCuc = true;
                this.tuVi = 0;
                this.tinhNguyen = Math.floor(excessTuVi / 1000000000);
                this.tierIndex = 100; // Thăng hoa lên Tầng 101
                this.breakthroughBonusRate = 0; // Làm mới khi thăng hoa bước vào Cảnh Giới Vô Cực
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

            // 4. Đột phá thông thường (Cảnh giới 0 đến 10 hoặc Đại Đạo Chí Cao < Tầng 100)
            if ((this.tuVi || 0) < maxTuVi) {
                return {
                    success: false,
                    isNotEnoughResource: true,
                    isVoCuc: false,
                    current: this.tuVi || 0,
                    required: maxTuVi,
                    msg: `Chưa tích tụ đủ linh lực để đột phá! Cần ${maxTuVi.toLocaleString("vi-VN")} Tu Vi.`
                };
            }

            const rateInfo = this.getBreakthroughRate();
            const roll = Math.random() * 100;
            if (roll > rateInfo.totalRate) {
                const penalty = Math.max(1, Math.floor(maxTuVi * 0.2));
                this.tuVi = Math.max(0, (this.tuVi || 0) - penalty);
                return {
                    success: false,
                    isFailedRate: true,
                    rate: rateInfo.totalRate,
                    penaltyText: `-${penalty.toLocaleString("vi-VN")} Tu Vi`,
                    msg: `⚡ [ĐỘ KIẾP THẤT BẠI] Lôi kiếp chấn động đan điền! Đột phá thất bại (Tỉ lệ: ${rateInfo.totalRate}%), hao tổn 20% linh lực.`
                };
            }

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
                    this.breakthroughBonusRate = 0; // Thăng đại cảnh giới mới: làm mới tỉ lệ cùng bản thân
                }
            } else {
                if (this.realmIndex < RealmSystem.getRealmCount() - 1 && hasClearedReqStage) {
                    this.realmIndex++;
                    this.tierIndex = 0;
                    isMajor = true;
                    this.breakthroughBonusRate = 0; // Thăng đại cảnh giới mới: làm mới tỉ lệ cùng bản thân
                } else {
                    this.tierIndex++;
                    if (this.tierIndex % 100 === 0) {
                        this.breakthroughBonusRate = 0; // Qua mốc 100 tầng: làm mới tỉ lệ cùng bản thân
                    }
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
        },

        /**
         * Đột Phá Nhanh: Tự động đột phá lên tầng cao nhất có thể trong 1 lần nhấn
         */
        quickBreakthrough(maxIterations = 1000) {
            let successCount = 0;
            let stopReason = null;
            let lastResult = null;
            const startTitle = this.getFullTitle();

            for (let i = 0; i < maxIterations; i++) {
                // 1. Kiểm tra cổng bình cảnh dùng chung
                const gate = this.getBreakthroughGate();
                if (gate.blocked) {
                    stopReason = gate.reason === "stage_22" ? "blocked_stage_22" : "blocked_stage_23";
                    lastResult = { success: false, ...gate };
                    break;
                }

                if (!this.canBreakthrough()) {
                    stopReason = "not_enough_resource";
                    break;
                }

                const res = this.breakthrough();
                if (res && res.success) {
                    successCount++;
                    lastResult = res;
                } else if (res && res.isFailedRate) {
                    stopReason = "failed_rate";
                    lastResult = res;
                    break;
                } else if (res && res.isVoCucBlocked) {
                    stopReason = "blocked_stage_22";
                    lastResult = res;
                    break;
                } else if (res && res.isVanThienDiaBlocked) {
                    stopReason = "blocked_stage_23";
                    lastResult = res;
                    break;
                } else {
                    stopReason = "not_enough_resource";
                    lastResult = res;
                    break;
                }
            }

            return {
                success: successCount > 0,
                successCount,
                totalPoints: successCount * STAT_POINTS_PER_TIER,
                stopReason,
                lastResult,
                startTitle,
                newTitle: this.getFullTitle(),
                currentPoints: this.statPoints
            };
        }
    });
})();
