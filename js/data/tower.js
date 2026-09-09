/**
 * HỆ THỐNG HƯ KHÔNG THÁP (ENDLESS TOWER SYSTEM)
 * Chế độ khiêu chiến vô tận độc lập với 21 Ải cốt truyện:
 * - Thuật toán sinh quái động (Procedural Scaling)
 * - Tầng Tinh Anh (chia hết cho 5), Tầng Boss Cổ Đại (chia hết cho 10)
 * - Cơ chế Kim Thân Hộ Thể (Damage Cap)
 * - Cơ chế Quét Nhanh (Sweep) khi đạt mốc Tầng 10 trở lên
 */

const TOWER_CONFIG = {
    BASE_HP: 150,
    BASE_ATK: 18,
    BASE_DEF: 5,
    BASE_EXP: 100,
    BASE_GOLD: 80,
    TIME_LIMIT: 60,            // Enrage Timer 60 giây
    MAX_DAILY_TICKETS: 3,      // 3 Lệnh Bài Hư Không miễn phí mỗi ngày
    get TICKET_PRICE() {
        // Đồng bộ trực tiếp từ item_tower_ticket trong items.js (Single Source of Truth: 5.000 🌀)
        if (typeof ItemSystem !== "undefined") {
            const item = ItemSystem.getItemById("item_tower_ticket");
            if (item && item.price) return item.price;
        }
        return 5000;
    },
    SWEEP_UNLOCK_FLOOR: 10     // Mở tính năng quét nhanh từ tầng 10
};

class TowerSystem {
    static PREFIXES = [
        "Hư Không", "U Minh", "Cổ Lão", "Thái Sơ", "U Ám", 
        "Hỗn Độn", "Ma Huyễn", "Huyết Lân", "Vực Thẳm", "Thôn Phệ", 
        "Cực Cảnh", "Hắc Ám", "Bất Diệt", "Thiết Bì", "Huyền Sát"
    ];

    static CREATURES = [
        "Dạ Xoa", "Ma Lang", "Cự Tích", "Điêu Vương", "Huyễn Điệp", 
        "Hắc Xà", "Quỷ Viên", "Độc Hạt", "Cương Thi", "Cốt Ma", 
        "Cự Hùng", "Kỳ Lân", "Ác Long", "Huyễn Trùng", "Tâm Ma"
    ];

    static BOSS_NAMES = [
        "Hư Không Ma Hoàng", "Cổ Ma Thôn Thiên", "Hắc Ám Chúa Tể", 
        "Hỗn Độn Ma Thần", "Vực Thẳm Ma Quân", "Thái Cổ Hung Thú", 
        "Vô Cực Ma Tổ", "U Minh Diêm Quân", "Cực Cảnh Cổ Long", "Hư Vô Thần Ma"
    ];

    static AVATARS_NORMAL = ["👾", "🦇", "🐺", "🕷️", "🦂", "🐍", "👹", "💀", "🦏", "🦅"];
    static AVATARS_ELITE = ["🗿", "🦑", "🦖", "🦁", "🐅", "🦈", "🦍"];
    static AVATARS_BOSS = ["🐉", "👁️", "🐲", "🌌", "👑", "🔥", "🔮", "⚛️"];

    /**
     * Lấy chuỗi ngày YYYY-MM-DD theo giờ địa phương
     */
    static getTodayDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const date = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${date}`;
    }

    /**
     * Kiểm tra và tự động phục hồi Lệnh Bài Hư Không khi sang ngày mới
     * Nếu số vé hiện tại < 3 thì hồi phục lên 3 vé miễn phí. Nếu đã mua vé > 3 thì giữ nguyên.
     */
    static checkDailyReset(towerData) {
        if (!towerData) return false;
        const today = this.getTodayDateString();
        if (towerData.lastResetDate !== today) {
            if ((towerData.dailyTickets || 0) < TOWER_CONFIG.MAX_DAILY_TICKETS) {
                towerData.dailyTickets = TOWER_CONFIG.MAX_DAILY_TICKETS;
            }
            towerData.lastResetDate = today;
            return true;
        }
        return false;
    }

    /**
     * Tính toán lượng Tinh Nguyên thưởng cân bằng cho cảnh giới Vô Cực theo tầng:
     * - Tầng 1 - 50: 1 Tinh Nguyên / tầng
     * - Tầng 51 - 100: 2 Tinh Nguyên / tầng
     * - Tầng 101 - 200: 4 Tinh Nguyên / tầng
     * - Tầng 201 - 300: 8 Tinh Nguyên / tầng
     * - Tầng 301 - 400: 15 Tinh Nguyên / tầng
     * - Tầng 401+: 25 + Math.floor((floor - 400) * 1.5) Tinh Nguyên / tầng
     * - Boss (chia hết cho 10): +50% thưởng
     * - Tinh Anh (chia hết cho 5): +25% thưởng
     */
    static getFloorTinhNguyen(floor) {
        floor = Math.max(1, parseInt(floor, 10) || 1);
        let base = 1;
        if (floor <= 50) {
            base = 1;
        } else if (floor <= 100) {
            base = 2;
        } else if (floor <= 200) {
            base = 4;
        } else if (floor <= 300) {
            base = 8;
        } else if (floor <= 400) {
            base = 15;
        } else {
            base = 25 + Math.floor((floor - 400) * 1.5);
        }

        const isBoss = (floor % 10 === 0);
        const isElite = (!isBoss && floor % 5 === 0);
        if (isBoss) {
            return Math.floor(base * 1.5);
        } else if (isElite) {
            return Math.floor(base * 1.25);
        }
        return base;
    }

    /**
     * Sinh quái vật Hư Không Tháp theo tầng (Procedural Scaling)
     */
    static generateTowerStage(floor) {
        floor = Math.max(1, parseInt(floor, 10) || 1);

        const isBoss = (floor % 10 === 0);
        const isElite = (!isBoss && floor % 5 === 0);

        // Sinh tên và avatar phù hợp theo loại tầng
        let monsterName = "";
        let avatar = "👾";

        if (isBoss) {
            const bossIndex = (Math.floor(floor / 10) - 1) % this.BOSS_NAMES.length;
            monsterName = `${this.BOSS_NAMES[bossIndex]} (Tầng ${floor})`;
            avatar = this.AVATARS_BOSS[(Math.floor(floor / 10) - 1) % this.AVATARS_BOSS.length];
        } else if (isElite) {
            const pIdx = (floor * 3) % this.PREFIXES.length;
            const cIdx = (floor * 7) % this.CREATURES.length;
            monsterName = `[Thủ Lĩnh] ${this.PREFIXES[pIdx]} ${this.CREATURES[cIdx]}`;
            avatar = this.AVATARS_ELITE[(floor) % this.AVATARS_ELITE.length];
        } else {
            const pIdx = (floor * 2) % this.PREFIXES.length;
            const cIdx = (floor * 5) % this.CREATURES.length;
            monsterName = `${this.PREFIXES[pIdx]} ${this.CREATURES[cIdx]}`;
            avatar = this.AVATARS_NORMAL[(floor) % this.AVATARS_NORMAL.length];
        }

        // Áp dụng công thức tăng tiến chỉ số (Chuẩn hóa tránh tràn số)
        const hpMultiplier = isBoss ? 2.5 : (isElite ? 1.5 : 1.0);
        const atkMultiplier = isBoss ? 1.8 : (isElite ? 1.3 : 1.0);

        const rawHp = TOWER_CONFIG.BASE_HP * Math.pow(1.08, floor) * hpMultiplier;
        const rawAtk = TOWER_CONFIG.BASE_ATK * Math.pow(1.065, floor) * atkMultiplier;
        const rawDef = TOWER_CONFIG.BASE_DEF * (1 + floor * 0.12);

        // Đảm bảo an toàn không vượt quá số an toàn trong JS
        const monsterHp = Math.min(1e16, Math.floor(rawHp));
        const monsterAtk = Math.min(1e14, Math.floor(rawAtk));
        const monsterDef = Math.min(1e12, Math.floor(rawDef));
        const attackSpeed = isBoss ? 1.4 : (isElite ? 1.7 : 2.0);

        // Phần thưởng Tu Vi (cho tiền Vô Cực) & Tinh Nguyên (cho cảnh giới Vô Cực)
        const tuVi = Math.min(2000000000, Math.floor(TOWER_CONFIG.BASE_EXP * Math.pow(1.06, floor)));
        const tinhNguyen = this.getFloorTinhNguyen(floor);

        let linhThach = Math.floor(TOWER_CONFIG.BASE_GOLD * Math.pow(1.09, floor));
        let honNguyen = 0;

        if (linhThach >= 100000000000) {
            honNguyen = Math.floor(linhThach / 1000000000);
            linhThach = linhThach % 1000000000;
        }

        // Mốc tầng lớn (50, 100, 150...): Thưởng Vé Tầm Đạo quý hiếm
        let gachaTickets = 0;
        if (floor % 50 === 0) {
            gachaTickets = floor >= 300 ? 2 : 1;
        }

        // Cơ chế Kim Thân Hộ Thể (Damage Cap)
        const hasDamageCap = isBoss || isElite;
        const damageCapPct = isBoss ? 0.20 : (isElite ? 0.25 : undefined);
        const breakCapPct = isBoss ? 0.30 : (isElite ? 0.40 : undefined);

        return {
            id: `tower_floor_${floor}`,
            number: floor,
            isTower: true,
            name: `Hư Không Tháp - Tầng ${floor}`,
            area: isBoss ? "Hư Không Cổ Điện" : (isElite ? "Hư Không Thâm Uyên" : "Vực Vô Tận"),
            difficulty: isBoss ? "Boss Cổ Đại" : (isElite ? "Tinh Anh" : "Thường"),
            diffColor: isBoss ? "#e040fb" : (isElite ? "#ff9800" : "#9c27b0"),
            timeLimit: TOWER_CONFIG.TIME_LIMIT,
            monster: {
                name: monsterName,
                title: isBoss ? `Trấn Tháp Cổ Ma` : (isElite ? `Thủ Lĩnh Hư Không` : `Dị Thú Hư Không`),
                avatar: avatar,
                hp: monsterHp,
                attack: monsterAtk,
                defense: monsterDef,
                attackSpeed: attackSpeed,
                isBoss: hasDamageCap,
                damageCapPct: damageCapPct,
                breakCapPct: breakCapPct
            },
            rewards: {
                tuVi: tuVi,
                tinhNguyen: tinhNguyen,
                linhThach: linhThach,
                honNguyen: honNguyen,
                gachaTickets: gachaTickets,
                dropChance: 0,
                possibleDrops: []
            }
        };
    }

    /**
     * Tính toán tài nguyên khi Quét Nhanh (Sweep)
     * Thưởng từ Tầng 1 đến Tầng (highestFloor - 5)
     * - Phân lập rõ ràng: Người chơi Vô Cực chỉ nhận Tinh Nguyên (totalTuVi = 0)
     *   Người chơi tiền Vô Cực chỉ nhận Tu Vi (totalTinhNguyen = 0)
     */
    static calculateSweepRewards(highestFloor, isVoCuc = false) {
        if (!highestFloor || highestFloor < TOWER_CONFIG.SWEEP_UNLOCK_FLOOR) {
            return null;
        }

        const maxSweepFloor = highestFloor - 5;
        let totalTuVi = 0;
        let totalTinhNguyen = 0;
        let totalLinhThach = 0;

        for (let f = 1; f <= maxSweepFloor; f++) {
            if (isVoCuc) {
                totalTinhNguyen += this.getFloorTinhNguyen(f);
            } else {
                const exp = Math.min(2000000000, Math.floor(TOWER_CONFIG.BASE_EXP * Math.pow(1.06, f)));
                totalTuVi += exp;
            }
            const gold = Math.min(1e15, Math.floor(TOWER_CONFIG.BASE_GOLD * Math.pow(1.09, f)));
            totalLinhThach += gold;
        }

        let totalHonNguyen = 0;
        if (totalLinhThach >= 100000000000) {
            totalHonNguyen = Math.floor(totalLinhThach / 1000000000);
            totalLinhThach = totalLinhThach % 1000000000;
        }

        return {
            fromFloor: 1,
            toFloor: maxSweepFloor,
            isVoCuc: Boolean(isVoCuc),
            totalTuVi: Math.floor(totalTuVi),
            totalTinhNguyen: Math.floor(totalTinhNguyen),
            totalLinhThach: Math.floor(totalLinhThach),
            totalHonNguyen: totalHonNguyen
        };
    }

    /**
     * Lấy dữ liệu ải tương ứng tầng tháp
     */
    static getStage(floor) {
        return this.generateTowerStage(floor);
    }

    /**
     * Tạo văn bản chia sẻ chiến tích (Brag Card)
     */
    static getShareText(floor) {
        return `🗡️ Ta vừa đột phá Hư Không Tháp Tầng ${floor} trong Kiemtien 3.0! Ngươi dám khiêu chiến không?`;
    }
}

if (typeof window !== "undefined") {
    window.TOWER_CONFIG = TOWER_CONFIG;
    window.TowerSystem = TowerSystem;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { TOWER_CONFIG, TowerSystem };
}
