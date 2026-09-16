/**
 * QUẢN LÝ TRẠNG THÁI NHÂN VẬT (PLAYER STATE) - BASE CLASS
 * - 9 Cảnh Giới cốt truyện, 3 Cảnh Giới vô hạn tầng
 * - Mỗi lần thăng tầng nhận đúng 4 điểm tiềm năng
 * - 3 Ô Trang Bị: Nón, Giáp, Vũ Khí
 * - 3 Ô Kỹ Năng: Học từ Shop/NPC Tàng Kinh Các theo cảnh giới
 * 
 * Các phân hệ chức năng mở rộng được tách thành các module trong cùng thư mục:
 * - player-stats.js: Quản lý điểm tiềm năng, chỉ số nhân vật (Vật lí, Phép, Máu, Thủ, Bạo)
 * - player-breakthrough.js: Quản lý Tu Vi, Tinh Nguyên, Bình Cảnh Ải 22/23 và Đột Phá
 * - player-inventory.js: Quản lý Túi đồ, Trang bị, Kỹ năng, Đan dược, Bách Bảo Các
 * - player-tower-gacha.js: Quản lý Hư Không Tháp & Đài Cầu Đạo (Gacha, Đại Thần Thông)
 * - player-pet.js: Quản lý Tam Đại Thần Thú (Nuôi dưỡng, Đột phá, Kỹ năng)
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
                "item_rename_scroll",
                "ticket_tam_dao"
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
            breakthroughBonusRate: 0,
            vanThienDiaMilestonesCleared: 0,
            towerData: {
                highestFloor: 0,
                currentFloor: 1,
                dailyTickets: 3,
                lastResetDate: ""
            },
            unlockedUltimates: [],
            equippedUltimate: null,
            gachaTickets: 1,
            fortuneShards: 0,
            pityThanCount: 0,
            pityThanhCount: 0,
            vocucPendingTuVi: 0,
            activePetId: null,
            pets: {
                pet_tank: { unlocked: false, realm: 0, exp: 0, skillLevel: 1, shards: 0 },
                pet_dps:  { unlocked: false, realm: 0, exp: 0, skillLevel: 1, shards: 0 },
                pet_buff: { unlocked: false, realm: 0, exp: 0, skillLevel: 1, shards: 0 }
            },
            lastOnlineTime: Date.now()
        };
    }

    static getDefaultPets() {
        return {
            pet_tank: { unlocked: false, realm: 0, exp: 0, skillLevel: 1, shards: 0 },
            pet_dps:  { unlocked: false, realm: 0, exp: 0, skillLevel: 1, shards: 0 },
            pet_buff: { unlocked: false, realm: 0, exp: 0, skillLevel: 1, shards: 0 }
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
        this.pillsConsumed = Number(d.pillsConsumed) || 0;
        this.breakthroughBonusRate = Number(d.breakthroughBonusRate) || 0;
        this.vanThienDiaMilestonesCleared = Number(d.vanThienDiaMilestonesCleared) || 0;
        this.towerData = { ...d.towerData };
        this.unlockedUltimates = [...d.unlockedUltimates];
        this.equippedUltimate = d.equippedUltimate;
        this.gachaTickets = Number(d.gachaTickets) || 0;
        // Tự động quy đổi Vé Tầm Đạo trong túi đồ vào quỹ Vé Đài Cầu Đạo
        const invTicketsInit = this.inventory.filter(id => id === "ticket_tam_dao").length;
        if (invTicketsInit > 0) {
            this.inventory = this.inventory.filter(id => id !== "ticket_tam_dao");
            this.gachaTickets += invTicketsInit;
        }
        this.fortuneShards = Number(d.fortuneShards) || 0;
        this.pityThanCount = Number(d.pityThanCount) || 0;
        this.pityThanhCount = Number(d.pityThanhCount) || 0;
        this.vocucPendingTuVi = Number(d.vocucPendingTuVi) || 0;
        this.activePetId = d.activePetId;
        this.pets = d.pets ? JSON.parse(JSON.stringify(d.pets)) : Player.getDefaultPets();
        this.lastOnlineTime = Date.now();
        this.currentHp = (typeof this.getMaxHp === "function") ? this.getMaxHp() : 150;
    }

    /**
     * Lấy danh xưng cảnh giới đầy đủ kèm danh hiệu thần thông
     */
    getFullTitle() {
        return (typeof RealmSystem !== "undefined")
            ? RealmSystem.getFullRealmTitle(this.realmIndex, this.tierIndex)
            : `Cảnh giới ${this.realmIndex} - Tầng ${this.tierIndex + 1}`;
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
        return (typeof RealmSystem !== "undefined")
            ? RealmSystem.getMaxTuVi(this.realmIndex, this.tierIndex)
            : 100;
    }

    /**
     * Lấy tốc độ nhận Tu Vi mỗi giây khi đả tọa treo máy (AFK)
     */
    getAfkTuViRate() {
        let rate = 1;
        if (typeof RealmSystem !== "undefined") {
            const realm = RealmSystem.getRealm(this.realmIndex);
            if (realm && realm.afkRate) rate = realm.afkRate;
        }
        // Thần thông buff danh hiệu
        if (this.equippedTitle && typeof TitleSystem !== "undefined") {
            const titleObj = TitleSystem.getTitleById(this.equippedTitle);
            if (titleObj && titleObj.buffs && titleObj.buffs.afkRateBonus) {
                rate = Math.round(rate * (1 + titleObj.buffs.afkRateBonus));
            }
        }
        // Buff 50% tốc độ tu luyện khi đạt Vô Cực
        if (this.isVoCuc) {
            rate = Math.floor(rate * 1.5);
        }
        return rate;
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
            breakthroughBonusRate: Number(this.breakthroughBonusRate) || 0,
            vanThienDiaMilestonesCleared: Number(this.vanThienDiaMilestonesCleared) || 0,
            towerData: {
                highestFloor: Number(this.towerData?.highestFloor) || 0,
                currentFloor: Math.max(1, Number(this.towerData?.currentFloor) || 1),
                dailyTickets: (typeof this.towerData?.dailyTickets === "number") ? this.towerData.dailyTickets : 3,
                lastResetDate: typeof this.towerData?.lastResetDate === "string" ? this.towerData.lastResetDate : ""
            },
            unlockedUltimates: Array.isArray(this.unlockedUltimates) ? [...this.unlockedUltimates] : [],
            equippedUltimate: this.equippedUltimate || null,
            gachaTickets: Number(this.gachaTickets) || 0,
            fortuneShards: Number(this.fortuneShards) || 0,
            pityThanCount: Number(this.pityThanCount) || 0,
            pityThanhCount: Number(this.pityThanhCount) || 0,
            vocucPendingTuVi: Number(this.vocucPendingTuVi) || 0,
            activePetId: this.activePetId || null,
            pets: this.pets ? JSON.parse(JSON.stringify(this.pets)) : Player.getDefaultPets(),
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
        this.breakthroughBonusRate = (typeof data.breakthroughBonusRate === "number" && !isNaN(data.breakthroughBonusRate)) ? Math.max(0, data.breakthroughBonusRate) : (defaults.breakthroughBonusRate || 0);
        this.vanThienDiaMilestonesCleared = (typeof data.vanThienDiaMilestonesCleared === "number" && !isNaN(data.vanThienDiaMilestonesCleared)) ? Math.max(0, data.vanThienDiaMilestonesCleared) : (defaults.vanThienDiaMilestonesCleared || 0);
        this.towerData = (data.towerData && typeof data.towerData === "object") ? {
            highestFloor: Number(data.towerData.highestFloor) || 0,
            currentFloor: Math.max(1, Number(data.towerData.currentFloor) || 1),
            dailyTickets: (typeof data.towerData?.dailyTickets === "number") ? Math.max(0, data.towerData.dailyTickets) : 3,
            lastResetDate: typeof data.towerData.lastResetDate === "string" ? data.towerData.lastResetDate : ""
        } : { highestFloor: 0, currentFloor: 1, dailyTickets: 3, lastResetDate: "" };

        if (typeof this.checkTowerReset === "function") {
            this.checkTowerReset();
        }

        this.unlockedUltimates = Array.isArray(data.unlockedUltimates) ? [...data.unlockedUltimates] : [...defaults.unlockedUltimates];
        this.equippedUltimate = (typeof data.equippedUltimate === "string" && data.equippedUltimate) ? data.equippedUltimate : defaults.equippedUltimate;
        this.gachaTickets = (typeof data.gachaTickets === "number" && !isNaN(data.gachaTickets)) ? Math.max(0, data.gachaTickets) : (defaults.gachaTickets || 0);
        
        // Tự động thu hồi và quy đổi toàn bộ Vé Tầm Đạo từ túi đồ cũ vào gachaTickets
        const invTicketsFromSave = Array.isArray(this.inventory) ? this.inventory.filter(id => id === "ticket_tam_dao").length : 0;
        if (invTicketsFromSave > 0) {
            this.inventory = this.inventory.filter(id => id !== "ticket_tam_dao");
            this.gachaTickets += invTicketsFromSave;
        }
        this.fortuneShards = (typeof data.fortuneShards === "number" && !isNaN(data.fortuneShards)) ? Math.max(0, data.fortuneShards) : (defaults.fortuneShards || 0);
        this.pityThanCount = (typeof data.pityThanCount === "number" && !isNaN(data.pityThanCount)) ? Math.max(0, data.pityThanCount) : 0;
        this.pityThanhCount = (typeof data.pityThanhCount === "number" && !isNaN(data.pityThanhCount)) ? Math.max(0, data.pityThanhCount) : 0;
        this.vocucPendingTuVi = (typeof data.vocucPendingTuVi === "number" && !isNaN(data.vocucPendingTuVi)) ? Math.max(0, data.vocucPendingTuVi) : 0;
        this.activePetId = data.activePetId || null;
        this.pets = data.pets ? JSON.parse(JSON.stringify(data.pets)) : Player.getDefaultPets();

        this.lastOnlineTime = (typeof data.lastOnlineTime === "number" && !isNaN(data.lastOnlineTime)) ? data.lastOnlineTime : Date.now();
        this.currentHp = (typeof this.getMaxHp === "function") ? this.getMaxHp() : 150;
    }
}

// Thiết lập Global cho Browser & Node.js
if (typeof window !== "undefined") {
    window.Player = Player;
}
if (typeof global !== "undefined") {
    global.Player = Player;
}

// Tự động nạp các prototype modules khi chạy trong môi trường Node.js (test runner)
if (typeof require !== "undefined") {
    require("./player-stats.js");
    require("./player-breakthrough.js");
    require("./player-inventory.js");
    require("./player-tower-gacha.js");
    require("./player-pet.js");
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = Player;
    module.exports.Player = Player;
}
