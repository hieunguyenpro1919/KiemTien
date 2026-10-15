import { Application, Container, Graphics, Text } from "pixi.js";
import { BigNumber, toBigNumber } from "../core/types/bignum";
import { StageDefinition } from "../core/constants/stages.data";
import { PlayerCombatStats } from "../core/types/player";
import { SkillDefinition, UltimateSkillDefinition } from "../core/constants/skills.data";
import { formatBigNumber } from "../core/utils/format";

export type CombatSpeed = 1 | 2 | 3;

export interface CombatEngineRuntimeState {
    playerCurrentHp: BigNumber;
    playerMaxHp: BigNumber;
    playerCurrentShield: BigNumber;
    playerRage: number; // 0 -> 100
    playerAttackCooldown: number;
    skillCooldowns: [number, number, number]; // giây còn lại
    ultimateCooldown: number;

    monsterName: string;
    monsterAvatar: string;
    monsterCurrentHp: BigNumber;
    monsterMaxHp: BigNumber;
    monsterAttackCooldown: number;
    hasKimThan: boolean;
    isKimThanBroken: boolean;

    enrageTimer: number; // Đếm ngược Cuồng Nộ (giây)
    isEnraged: boolean;
    isAutoCombat: boolean;
    speed: CombatSpeed;
    isFinished: boolean;
    victory: boolean;
}

interface FloatingTextItem {
    pixiText: Text;
    x: number;
    y: number;
    vy: number;
    alpha: number;
    scale: number;
    life: number;
    maxLife: number;
}

interface ShockwaveItem {
    graphics: Graphics;
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    color: number;
    alpha: number;
}

interface SlashItem {
    graphics: Graphics;
    x: number;
    y: number;
    progress: number;
    angle: number;
    color: number;
}

export class CombatEngine {
    private app: Application | null = null;
    private container: HTMLElement | null = null;
    private isInitialized = false;
    private isDestroyed = false;

    // Layers
    private rootContainer = new Container();
    private backgroundLayer = new Container();
    private entityLayer = new Container();
    private vfxLayer = new Container();
    private uiLayer = new Container();

    // Visual Objects
    private magicCircleGraphics = new Graphics();
    private playerGraphics = new Graphics();
    private playerAura = new Graphics();
    private playerEmojiText: Text | null = null;

    private monsterGraphics = new Graphics();
    private monsterAura = new Graphics();
    private monsterEmojiText: Text | null = null;
    private kimThanShieldGraphics = new Graphics();

    private screenFlashGraphics = new Graphics();

    // UI Pixi Elements
    private bossHpBarBg = new Graphics();
    private bossHpBarFill = new Graphics();
    private bossNameText: Text | null = null;
    private bossHpText: Text | null = null;
    private kimThanBadgeText: Text | null = null;
    private enrageTimerText: Text | null = null;

    // VFX Pools & State
    private floatingTexts: FloatingTextItem[] = [];
    private shockwaves: ShockwaveItem[] = [];
    private slashes: SlashItem[] = [];
    private stars: { x: number; y: number; size: number; speed: number; alpha: number }[] = [];
    private starsGraphics = new Graphics();

    // Shake
    private shakeIntensity = 0;
    private shakeDecay = 0.9;

    // Runtime Battle Data
    private stage: StageDefinition | null = null;
    private playerStats: PlayerCombatStats | null = null;
    private activeSkills: (SkillDefinition | null)[] = [null, null, null];
    private activeUltimate: UltimateSkillDefinition | null = null;

    private state: CombatEngineRuntimeState = {
        playerCurrentHp: toBigNumber(100),
        playerMaxHp: toBigNumber(100),
        playerCurrentShield: toBigNumber(0),
        playerRage: 0,
        playerAttackCooldown: 0.5,
        skillCooldowns: [0, 0, 0],
        ultimateCooldown: 0,
        monsterName: "Yêu Thú",
        monsterAvatar: "👾",
        monsterCurrentHp: toBigNumber(100),
        monsterMaxHp: toBigNumber(100),
        monsterAttackCooldown: 2.0,
        hasKimThan: false,
        isKimThanBroken: false,
        enrageTimer: 60,
        isEnraged: false,
        isAutoCombat: true,
        speed: 1,
        isFinished: false,
        victory: false
    };

    // Animation Timers
    private animTime = 0;
    private playerHitAnim = 0;
    private monsterHitAnim = 0;
    private playerAttackLunge = 0;
    private flashAlpha = 0;

    // Callbacks
    public onStateUpdate?: (state: CombatEngineRuntimeState) => void;
    public onVictory?: (stage: StageDefinition) => void;
    public onDefeat?: (reason: string) => void;

    constructor() {}

    /**
     * Khởi tạo PixiJS v8 Application và gắn vào Container DOM
     */
    public async init(container: HTMLElement): Promise<boolean> {
        try {
            this.container = container;
            this.isDestroyed = false;

            // Đảm bảo container có width & height hợp lệ
            let w = container.clientWidth;
            let h = container.clientHeight;
            if (!w || !h || w <= 0 || h <= 0) {
                w = w > 0 ? w : 800;
                h = h > 0 ? h : 450;
            }

            this.app = new Application();

            // Patch phòng ngừa lỗi PixiJS v8 _cancelResize khi destroy sớm
            (this.app as any)._cancelResize = () => {};

            await this.app.init({
                width: w,
                height: h,
                backgroundColor: 0x060913,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true
            });

            // Patch lại sau khi init đề phòng Pixi gán undefined
            if (this.app && typeof (this.app as any)._cancelResize !== "function") {
                (this.app as any)._cancelResize = () => {};
            }

            if (this.isDestroyed) {
                this.cleanupPixiApp();
                return false;
            }

            if (this.app?.canvas && container && !container.contains(this.app.canvas)) {
                container.appendChild(this.app.canvas);
            }

            // Thiết lập cấu trúc tầng (Layer Hierarchy)
            this.app.stage.addChild(this.rootContainer);
            this.rootContainer.addChild(this.backgroundLayer);
            this.rootContainer.addChild(this.entityLayer);
            this.rootContainer.addChild(this.vfxLayer);
            this.rootContainer.addChild(this.uiLayer);

            // Background elements
            this.initBackgroundStars();
            this.backgroundLayer.addChild(this.starsGraphics);
            this.backgroundLayer.addChild(this.magicCircleGraphics);

            // Entity Layer
            this.entityLayer.addChild(this.playerAura);
            this.entityLayer.addChild(this.playerGraphics);
            this.entityLayer.addChild(this.monsterAura);
            this.entityLayer.addChild(this.monsterGraphics);
            this.entityLayer.addChild(this.kimThanShieldGraphics);

            // UI Layer
            this.uiLayer.addChild(this.bossHpBarBg);
            this.uiLayer.addChild(this.bossHpBarFill);

            // Fullscreen flash on VFX layer
            this.vfxLayer.addChild(this.screenFlashGraphics);

            this.initTexts();

            // Ticker loop
            this.app.ticker.add((ticker) => {
                this.update(ticker.deltaTime / 60); // Đổi về đơn vị giây thực tế
            });

            this.isInitialized = true;
            this.resize();
            return true;
        } catch (err) {
            console.error("Pixi Init Error:", err);
            return false;
        }
    }

    private initBackgroundStars(): void {
        const starCount = 45;
        this.stars = [];
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * 800,
                y: Math.random() * 450,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.3 + 0.1,
                alpha: Math.random() * 0.7 + 0.3
            });
        }
    }

    private initTexts(): void {
        // Player Emoji Avatar
        this.playerEmojiText = new Text({
            text: "🧙‍♂️",
            style: {
                fontSize: 38,
                align: "center"
            }
        });
        this.playerEmojiText.anchor.set(0.5);
        this.entityLayer.addChild(this.playerEmojiText);

        // Monster Emoji Avatar
        this.monsterEmojiText = new Text({
            text: "👾",
            style: {
                fontSize: 42,
                align: "center"
            }
        });
        this.monsterEmojiText.anchor.set(0.5);
        this.entityLayer.addChild(this.monsterEmojiText);

        // Boss UI Texts
        this.bossNameText = new Text({
            text: "Yêu Thú Bí Ẩn",
            style: {
                fontFamily: "serif",
                fontSize: 14,
                fontWeight: "bold",
                fill: 0xffd700
            }
        });
        this.bossNameText.anchor.set(0.5, 1);
        this.uiLayer.addChild(this.bossNameText);

        this.bossHpText = new Text({
            text: "HP: 100 / 100",
            style: {
                fontFamily: "monospace",
                fontSize: 11,
                fontWeight: "bold",
                fill: 0xffffff
            }
        });
        this.bossHpText.anchor.set(0.5, 0.5);
        this.uiLayer.addChild(this.bossHpText);

        this.kimThanBadgeText = new Text({
            text: "⛨ KIM THÂN HỘ THỂ (GIẢM 90% DMG THƯỜNG)",
            style: {
                fontFamily: "sans-serif",
                fontSize: 10,
                fontWeight: "bold",
                fill: 0xffe066
            }
        });
        this.kimThanBadgeText.anchor.set(0.5, 0);
        this.uiLayer.addChild(this.kimThanBadgeText);

        this.enrageTimerText = new Text({
            text: "⏱️ Cuồng Nộ: 60s",
            style: {
                fontFamily: "sans-serif",
                fontSize: 11,
                fontWeight: "bold",
                fill: 0xff6b6b
            }
        });
        this.enrageTimerText.anchor.set(1, 0.5);
        this.uiLayer.addChild(this.enrageTimerText);
    }

    /**
     * Bắt đầu trận chiến với Ải chỉ định và chỉ số nhân vật
     */
    public startBattle(
        stage: StageDefinition,
        playerStats: PlayerCombatStats,
        skills: (SkillDefinition | null)[],
        ultimate: UltimateSkillDefinition | null
    ): void {
        this.stage = stage;
        this.playerStats = playerStats;
        this.activeSkills = skills;
        this.activeUltimate = ultimate;

        const monster = stage.monster;
        const hasKimThan = !!monster.damageCapPct && monster.damageCapPct > 0;

        this.state = {
            ...this.state,
            playerCurrentHp: playerStats.maxHp,
            playerMaxHp: playerStats.maxHp,
            playerCurrentShield: toBigNumber(0),
            playerRage: 0,
            playerAttackCooldown: 0.6,
            skillCooldowns: [0, 0, 0],
            ultimateCooldown: 0,

            monsterName: monster.name,
            monsterAvatar: monster.avatar,
            monsterCurrentHp: monster.hp,
            monsterMaxHp: monster.hp,
            monsterAttackCooldown: monster.attackSpeed || 2.0,
            hasKimThan,
            isKimThanBroken: false,

            enrageTimer: monster.isBoss ? 60 : 90,
            isEnraged: false,
            isFinished: false,
            victory: false
        };

        if (this.monsterEmojiText) {
            this.monsterEmojiText.text = monster.avatar;
        }
        if (this.bossNameText) {
            this.bossNameText.text = `${monster.title ? `[${monster.title}] ` : ""}${monster.name}`;
        }

        this.notifyState();
    }

    public setSpeed(speed: CombatSpeed): void {
        this.state.speed = speed;
        this.notifyState();
    }

    public setAutoCombat(auto: boolean): void {
        this.state.isAutoCombat = auto;
        this.notifyState();
    }

    /**
     * Xuất chiêu Thần Thông Chủ Động (Slot 0, 1, 2)
     */
    public castSkill(slotIndex: 0 | 1 | 2): boolean {
        if (this.state.isFinished || !this.playerStats) return false;
        const skill = this.activeSkills[slotIndex];
        if (!skill) return false;
        if (this.state.skillCooldowns[slotIndex] > 0) return false;

        // Bắt đầu hồi chiêu
        this.state.skillCooldowns[slotIndex] = skill.cooldown;
        this.playerAttackLunge = 1.0;

        // Kỹ năng tăng Nộ Khí lớn (+25 nộ)
        this.addRage(25);

        // Xử lý hiệu ứng theo loại kỹ năng
        if (skill.type === "ho_the") {
            // Thiết Bố Sam: Nhận khiên hộ thể
            const shieldGained = this.state.playerMaxHp.times(skill.multiplier).round();
            this.state.playerCurrentShield = this.state.playerCurrentShield.plus(shieldGained);
            this.addShockwave(this.getPlayerPos().x, this.getPlayerPos().y, 0x00f2fe);
            this.addFloatingText(this.getPlayerPos().x, this.getPlayerPos().y - 40, `🛡️ Khiên +${formatBigNumber(shieldGained)}`, 0x00f2fe, 1.2);
            this.notifyState();
            return true;
        }

        if (skill.type === "tri_lieu") {
            // Quy Nguyên Khí: Hồi máu
            const healGained = this.playerStats.phep.times(skill.multiplier).round();
            const addedHp = this.state.playerCurrentHp.plus(healGained);
            const newHp = addedHp.gt(this.state.playerMaxHp) ? this.state.playerMaxHp : addedHp;
            this.state.playerCurrentHp = newHp;
            this.addShockwave(this.getPlayerPos().x, this.getPlayerPos().y, 0x10b981);
            this.addFloatingText(this.getPlayerPos().x, this.getPlayerPos().y - 40, `💚 Hồi +${formatBigNumber(healGained)}`, 0x10b981, 1.2);
            this.notifyState();
            return true;
        }

        // Tấn công: Sát thương Vật Lí / Phép
        const isPhysical = skill.type === "vat_li";
        const baseAtk = isPhysical ? this.playerStats.vatLi : this.playerStats.phep;
        let skillDmg = baseAtk.times(skill.multiplier).round();

        // Kỹ năng luôn có xác suất Phá Kim Thân cao
        const breaksKimThan = this.state.hasKimThan;
        if (breaksKimThan) {
            this.state.isKimThanBroken = true;
        }

        this.applyDamageToMonster(skillDmg, {
            isSkill: true,
            skillName: skill.name,
            breaksKimThan,
            isCrit: Math.random() * 100 < this.playerStats.baoKich,
            color: isPhysical ? 0xffb703 : 0xff4d6d
        });

        // VFX
        this.addSlash(this.getMonsterPos().x, this.getMonsterPos().y, isPhysical ? 0xffb703 : 0xff4d6d);
        this.triggerShake(7);

        return true;
    }

    /**
     * Kích hoạt Đại Thần Thông "Nhất Niệm" (100 Nộ Khí)
     */
    public castUltimate(): boolean {
        if (this.state.isFinished || this.state.playerRage < 100) return false;

        // Tiêu hao 100 Nộ Khí
        this.state.playerRage = 0;

        // Flash trắng lóa toàn màn hình
        this.flashAlpha = 0.95;

        // Rung chấn màn hình kịch liệt (Screen Shake cường độ cao)
        this.triggerShake(22);

        // Hiệu ứng nhiều nhát chém kiếm quang hư không cắt ngang màn hình
        const monsterPos = this.getMonsterPos();
        this.addSlash(monsterPos.x, monsterPos.y, 0x00f2fe, 0.4);
        this.addSlash(monsterPos.x, monsterPos.y, 0xa855f7, -0.4);
        this.addShockwave(monsterPos.x, monsterPos.y, 0x00f2fe, 120);

        // Cơ chế Nhất Niệm: Giáng thẳng vào 80% HP Max của Boss (Sát thương chuẩn Bỏ qua Kim Thân)
        const trueDamage = this.state.monsterMaxHp.times(0.80).round().max(1);

        this.state.monsterCurrentHp = this.state.monsterCurrentHp.minus(trueDamage);
        if (this.state.monsterCurrentHp.lte(0)) {
            this.state.monsterCurrentHp = toBigNumber(0);
        }

        const ultName = this.activeUltimate?.name || "Nhất Niệm";
        this.addFloatingText(
            monsterPos.x,
            monsterPos.y - 70,
            `🌌 [${ultName.toUpperCase()} KHAI THIÊN]!\n-${formatBigNumber(trueDamage)} (80% MÁU CHUẨN)`,
            0x38bdf8,
            1.8
        );

        this.monsterHitAnim = 0.5;

        if (this.state.monsterCurrentHp.lte(0)) {
            this.handleVictory();
        }

        this.notifyState();
        return true;
    }

    private addRage(amount: number): void {
        this.state.playerRage = Math.min(100, this.state.playerRage + amount);
    }

    private triggerShake(intensity: number): void {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    }

    private applyDamageToMonster(
        rawDmg: BigNumber,
        options: {
            isSkill?: boolean;
            skillName?: string;
            breaksKimThan?: boolean;
            isCrit?: boolean;
            color?: number;
        }
    ): void {
        let dmg = rawDmg;
        const monsterPos = this.getMonsterPos();

        // 1. Áp dụng Bạo Kích
        if (options.isCrit) {
            dmg = dmg.times(2.0).round();
        }

        // 2. Trừ Phòng Thủ Quái
        if (this.stage) {
            const def = this.stage.monster.defense;
            dmg = dmg.minus(def).max(1);
        }

        // 3. Cơ chế Kim Thân Hộ Thể (Cap Damage)
        let capped = false;
        if (this.state.hasKimThan && this.stage?.monster.damageCapPct) {
            const capPct = options.breaksKimThan
                ? (this.stage.monster.breakCapPct || 0.35)
                : this.stage.monster.damageCapPct;

            const maxAllowed = this.state.monsterMaxHp.times(capPct).round();
            if (dmg.gt(maxAllowed)) {
                dmg = maxAllowed;
                capped = true;
            }
        }

        // Trừ máu quái
        this.state.monsterCurrentHp = this.state.monsterCurrentHp.minus(dmg);
        if (this.state.monsterCurrentHp.lte(0)) {
            this.state.monsterCurrentHp = toBigNumber(0);
        }

        this.monsterHitAnim = 0.25;

        // Floating Damage Display
        let textStr = `-${formatBigNumber(dmg)}`;
        let textColor = options.color || 0xffffff;
        let textScale = 1.0;

        if (options.isCrit) {
            textStr = `💥 BẠO KÍCH! -${formatBigNumber(dmg)}`;
            textColor = 0xf59e0b;
            textScale = 1.35;
        }
        if (options.breaksKimThan) {
            textStr = `⚡ PHÁ KIM THÂN! ${textStr}`;
            textColor = 0xec4899;
            textScale = 1.45;
        } else if (capped) {
            textStr = `🛡️ [KIM THÂN CẢN] ${textStr}`;
            textColor = 0xfacc15;
        }

        this.addFloatingText(monsterPos.x + (Math.random() * 40 - 20), monsterPos.y - 30, textStr, textColor, textScale);

        if (this.state.monsterCurrentHp.lte(0)) {
            this.handleVictory();
        }
    }

    private applyDamageToPlayer(rawDmg: BigNumber): void {
        if (!this.playerStats) return;

        // Trừ giáp người chơi
        const def = this.playerStats.phongThu;
        let actualDmg = rawDmg.minus(def).max(1);

        // Trừ khiên trước nếu có
        if (this.state.playerCurrentShield.gt(0)) {
            if (this.state.playerCurrentShield.gte(actualDmg)) {
                this.state.playerCurrentShield = this.state.playerCurrentShield.minus(actualDmg);
                this.addFloatingText(this.getPlayerPos().x, this.getPlayerPos().y - 25, `⛨ Đỡ -${formatBigNumber(actualDmg)}`, 0x00f2fe, 1.0);
                actualDmg = toBigNumber(0);
            } else {
                actualDmg = actualDmg.minus(this.state.playerCurrentShield);
                this.state.playerCurrentShield = toBigNumber(0);
            }
        }

        if (actualDmg.gt(0)) {
            this.state.playerCurrentHp = this.state.playerCurrentHp.minus(actualDmg);
            this.playerHitAnim = 0.25;
            this.addFloatingText(this.getPlayerPos().x, this.getPlayerPos().y - 30, `-${formatBigNumber(actualDmg)}`, 0xef4444, 1.15);
        }

        if (this.state.playerCurrentHp.lte(0)) {
            this.state.playerCurrentHp = toBigNumber(0);
            this.handleDefeat("Đạo Hữu đã kiệt sức trước uy áp yêu quỷ!");
        }
    }

    private handleVictory(): void {
        this.state.isFinished = true;
        this.state.victory = true;
        this.addShockwave(this.getMonsterPos().x, this.getMonsterPos().y, 0xffd700, 160);
        this.triggerShake(14);

        if (this.stage && this.onVictory) {
            this.onVictory(this.stage);
        }
        this.notifyState();
    }

    private handleDefeat(reason: string): void {
        this.state.isFinished = true;
        this.state.victory = false;
        if (this.onDefeat) {
            this.onDefeat(reason);
        }
        this.notifyState();
    }

    /**
     * Vòng lặp cập nhật trận đấu mỗi frame (Battle Ticker)
     */
    private update(deltaSeconds: number): void {
        if (!this.isInitialized || this.isDestroyed) return;

        const effectiveDelta = deltaSeconds * this.state.speed;
        this.animTime += effectiveDelta;

        // 1. Cập nhật Rung Lắc Màn Hình (Screen Shake)
        if (this.shakeIntensity > 0.1) {
            const offsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
            const offsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.rootContainer.x = offsetX;
            this.rootContainer.y = offsetY;
            this.shakeIntensity *= Math.pow(this.shakeDecay, effectiveDelta * 60);
        } else {
            this.rootContainer.x = 0;
            this.rootContainer.y = 0;
            this.shakeIntensity = 0;
        }

        // 2. Cập nhật Fullscreen Flash
        if (this.flashAlpha > 0.01) {
            this.flashAlpha = Math.max(0, this.flashAlpha - effectiveDelta * 2.5);
            this.drawFlash();
        } else {
            this.screenFlashGraphics.clear();
        }

        // 3. Tiến trình chiến đấu nếu trận đấu đang diễn ra
        if (!this.state.isFinished && this.stage && this.playerStats) {
            // Đếm ngược Cuồng Nộ (Enrage Timer)
            this.state.enrageTimer -= effectiveDelta;
            if (this.state.enrageTimer <= 0) {
                this.state.enrageTimer = 0;
                this.state.isEnraged = true;
                this.handleDefeat("Hết thời gian! Yêu quái đã Cuồng Nộ đoạt mạng!");
                return;
            }

            // Hồi chiêu kỹ năng
            for (let i = 0; i < 3; i++) {
                if (this.state.skillCooldowns[i] > 0) {
                    this.state.skillCooldowns[i] = Math.max(0, this.state.skillCooldowns[i] - effectiveDelta);
                }
            }

            // Tự Động Kích Hoạt Kỹ Năng & Đại Thần Thông nếu bật Auto Combat
            if (this.state.isAutoCombat) {
                if (this.state.playerRage >= 100) {
                    this.castUltimate();
                } else {
                    for (let i = 0; i < 3; i++) {
                        if (this.activeSkills[i] && this.state.skillCooldowns[i] <= 0) {
                            this.castSkill(i as 0 | 1 | 2);
                            break;
                        }
                    }
                }
            }

            // Đòn đánh thường của Đạo Hữu
            this.state.playerAttackCooldown -= effectiveDelta;
            if (this.state.playerAttackCooldown <= 0) {
                this.state.playerAttackCooldown = 1.1; // Chu kỳ đánh thường
                this.playerAttackLunge = 0.8;
                this.addRage(12);

                const isCrit = Math.random() * 100 < this.playerStats.baoKich;
                this.applyDamageToMonster(this.playerStats.vatLi, { isCrit });
                this.addSlash(this.getMonsterPos().x, this.getMonsterPos().y, 0x38bdf8);
                this.triggerShake(isCrit ? 5 : 2);
            }

            // Đòn đánh của Quái Vật / Boss
            this.state.monsterAttackCooldown -= effectiveDelta;
            if (this.state.monsterAttackCooldown <= 0) {
                this.state.monsterAttackCooldown = this.stage.monster.attackSpeed || 2.0;
                let mobAtk = this.stage.monster.attack;
                if (this.state.isEnraged) {
                    mobAtk = mobAtk.times(10); // 1000% ATK khi Cuồng Nộ
                }
                this.applyDamageToPlayer(mobAtk);
                this.addSlash(this.getPlayerPos().x, this.getPlayerPos().y, 0xef4444);
                this.triggerShake(3);
            }

            this.notifyState();
        }

        // 4. Render các thực thể & VFX
        this.renderBackground();
        this.renderEntities();
        this.renderVfx(effectiveDelta);
        this.renderUi();
    }

    private drawFlash(): void {
        if (!this.app) return;
        const width = this.app.screen.width;
        const height = this.app.screen.height;

        this.screenFlashGraphics.clear();
        this.screenFlashGraphics.rect(0, 0, width, height).fill({ color: 0xffffff, alpha: this.flashAlpha });
    }

    private renderBackground(): void {
        if (!this.app) return;
        const width = this.app.screen.width;
        const height = this.app.screen.height;

        // Vẽ các vì sao trôi lơ lửng
        this.starsGraphics.clear();
        this.stars.forEach((s) => {
            s.y += s.speed;
            if (s.y > height) s.y = 0;
            this.starsGraphics.circle(s.x, s.y, s.size).fill({ color: 0x93c5fd, alpha: s.alpha });
        });

        // Vòng Trận Pháp Huyền Ảo dưới chân sàn đấu
        const centerY = height * 0.65;
        this.magicCircleGraphics.clear();

        // Elip sàn đấu chính
        this.magicCircleGraphics
            .ellipse(width * 0.5, centerY, width * 0.45, 45)
            .fill({ color: 0x0f172a, alpha: 0.6 })
            .stroke({ width: 2, color: 0x38bdf8, alpha: 0.35 });

        // Vòng tròn trung tâm với góc quay
        const rot = this.animTime * 0.5;
        this.magicCircleGraphics
            .ellipse(width * 0.5, centerY, width * 0.28, 25)
            .stroke({ width: 1.5, color: 0x00f2fe, alpha: 0.35 + Math.sin(rot) * 0.1 });
    }

    private renderEntities(): void {
        const playerPos = this.getPlayerPos();
        const monsterPos = this.getMonsterPos();

        // 1. Entity Player
        const pLunge = Math.sin(this.playerAttackLunge * Math.PI) * 20;
        this.playerAttackLunge = Math.max(0, this.playerAttackLunge - 0.05);

        const pX = playerPos.x + pLunge;
        const pY = playerPos.y;

        // Hào quang Đạo Hữu
        this.playerAura.clear();
        const auraAlpha = 0.25 + Math.sin(this.animTime * 3) * 0.1;
        this.playerAura.circle(pX, pY, 38).fill({ color: 0x00f2fe, alpha: auraAlpha });

        // Thân thể Đạo Hữu
        this.playerGraphics.clear();
        const pHitColor = this.playerHitAnim > 0 ? 0xff4d4d : 0x0284c7;
        this.playerHitAnim = Math.max(0, this.playerHitAnim - 0.05);

        this.playerGraphics.circle(pX, pY, 28).fill({ color: pHitColor }).stroke({ width: 2.5, color: 0x38bdf8 });

        if (this.playerEmojiText) {
            this.playerEmojiText.x = pX;
            this.playerEmojiText.y = pY;
        }

        // 2. Entity Monster / Boss
        const mX = monsterPos.x;
        const mY = monsterPos.y;

        // Hào quang Quái Vật
        this.monsterAura.clear();
        const mAuraColor = this.state.isEnraged ? 0xdc2626 : 0x9333ea;
        const mAuraAlpha = 0.25 + Math.cos(this.animTime * 3) * 0.1;
        this.monsterAura.circle(mX, mY, 44).fill({ color: mAuraColor, alpha: mAuraAlpha });

        // Thân thể Quái Vật
        this.monsterGraphics.clear();
        const mHitColor = this.monsterHitAnim > 0 ? 0xffffff : 0x4c1d95;
        this.monsterHitAnim = Math.max(0, this.monsterHitAnim - 0.05);

        this.monsterGraphics.circle(mX, mY, 32).fill({ color: mHitColor }).stroke({ width: 3, color: mAuraColor });

        if (this.monsterEmojiText) {
            this.monsterEmojiText.x = mX;
            this.monsterEmojiText.y = mY;
        }

        // Kim Thân Hộ Thể (Golden Shield Aura)
        this.kimThanShieldGraphics.clear();
        if (this.state.hasKimThan && !this.state.isKimThanBroken) {
            const shieldAlpha = 0.45 + Math.sin(this.animTime * 5) * 0.2;
            this.kimThanShieldGraphics
                .circle(mX, mY, 48)
                .stroke({ width: 3.5, color: 0xffd700, alpha: shieldAlpha });
        }
    }

    private renderVfx(deltaSeconds: number): void {
        // 1. Shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.radius += (sw.maxRadius - sw.radius) * deltaSeconds * 12;
            sw.alpha -= deltaSeconds * 1.5;

            sw.graphics.clear();
            if (sw.alpha <= 0.02 || sw.radius >= sw.maxRadius * 0.95) {
                this.vfxLayer.removeChild(sw.graphics);
                sw.graphics.destroy();
                this.shockwaves.splice(i, 1);
            } else {
                sw.graphics
                    .circle(sw.x, sw.y, sw.radius)
                    .stroke({ width: 3, color: sw.color, alpha: sw.alpha });
            }
        }

        // 2. Slashes (Kiếm quang)
        for (let i = this.slashes.length - 1; i >= 0; i--) {
            const s = this.slashes[i];
            s.progress += deltaSeconds * 4.5;
            s.graphics.clear();

            if (s.progress >= 1.0) {
                this.vfxLayer.removeChild(s.graphics);
                s.graphics.destroy();
                this.slashes.splice(i, 1);
            } else {
                const len = 70 * Math.sin(s.progress * Math.PI);
                const alpha = 1.0 - s.progress;
                s.graphics
                    .ellipse(s.x, s.y, len, 6)
                    .fill({ color: 0xffffff, alpha })
                    .stroke({ width: 3, color: s.color, alpha });
                s.graphics.rotation = s.angle;
            }
        }

        // 3. Floating Damage Texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.life += deltaSeconds;
            ft.y += ft.vy * deltaSeconds;
            ft.alpha = Math.max(0, 1 - ft.life / ft.maxLife);

            ft.pixiText.x = ft.x;
            ft.pixiText.y = ft.y;
            ft.pixiText.alpha = ft.alpha;

            if (ft.life >= ft.maxLife) {
                this.uiLayer.removeChild(ft.pixiText);
                ft.pixiText.destroy();
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    private renderUi(): void {
        if (!this.app) return;
        const width = this.app.screen.width;

        // Thanh Máu Boss (Boss HP Bar) nằm trang trọng phía trên
        const barWidth = Math.min(width * 0.75, 480);
        const barHeight = 16;
        const barX = (width - barWidth) / 2;
        const barY = 32;

        this.bossHpBarBg.clear();
        this.bossHpBarBg
            .roundRect(barX, barY, barWidth, barHeight, 6)
            .fill({ color: 0x1e293b, alpha: 0.9 })
            .stroke({ width: 2, color: 0x475569 });

        // Tỉ lệ máu quái vật
        let hpRatio = 0;
        if (this.state.monsterMaxHp.gt(0)) {
            hpRatio = this.state.monsterCurrentHp.div(this.state.monsterMaxHp).toNumber();
            hpRatio = Math.max(0, Math.min(1, hpRatio));
        }

        const fillColor = this.state.hasKimThan && !this.state.isKimThanBroken ? 0xf59e0b : 0xdc2626;
        this.bossHpBarFill.clear();
        if (hpRatio > 0) {
            this.bossHpBarFill
                .roundRect(barX + 2, barY + 2, (barWidth - 4) * hpRatio, barHeight - 4, 4)
                .fill({ color: fillColor });
        }

        // Update Text Positions
        if (this.bossNameText) {
            this.bossNameText.x = width / 2;
            this.bossNameText.y = barY - 4;
        }

        if (this.bossHpText) {
            this.bossHpText.x = width / 2;
            this.bossHpText.y = barY + barHeight / 2;
            this.bossHpText.text = `${formatBigNumber(this.state.monsterCurrentHp)} / ${formatBigNumber(this.state.monsterMaxHp)} (${(hpRatio * 100).toFixed(1)}%)`;
        }

        if (this.kimThanBadgeText) {
            this.kimThanBadgeText.x = width / 2;
            this.kimThanBadgeText.y = barY + barHeight + 4;
            this.kimThanBadgeText.visible = this.state.hasKimThan;
            if (this.state.isKimThanBroken) {
                this.kimThanBadgeText.text = "⚡ ĐÃ PHÁ KIM THÂN (GÂY SÁT THƯƠNG BỘC PHÁ)";
                this.kimThanBadgeText.style.fill = 0xf472b6;
            } else {
                this.kimThanBadgeText.text = "⛨ KIM THÂN HỘ THỂ (GIỚI HẠN SÁT THƯƠNG ĐÒN THƯỜNG)";
                this.kimThanBadgeText.style.fill = 0xffe066;
            }
        }

        if (this.enrageTimerText) {
            this.enrageTimerText.x = barX + barWidth;
            this.enrageTimerText.y = barY - 12;
            this.enrageTimerText.text = `⏱️ ${Math.ceil(this.state.enrageTimer)}s`;
        }
    }

    private addFloatingText(x: number, y: number, text: string, color: number, scale = 1.0): void {
        const pixiText = new Text({
            text,
            style: {
                fontFamily: "sans-serif",
                fontSize: 13,
                fontWeight: "bold",
                fill: color,
                stroke: { color: 0x000000, width: 3 },
                align: "center"
            }
        });
        pixiText.anchor.set(0.5);
        pixiText.scale.set(scale);
        this.uiLayer.addChild(pixiText);

        this.floatingTexts.push({
            pixiText,
            x,
            y,
            vy: -40,
            alpha: 1.0,
            scale,
            life: 0,
            maxLife: 1.1
        });
    }

    private addShockwave(x: number, y: number, color = 0x00f2fe, maxRadius = 90): void {
        const graphics = new Graphics();
        this.vfxLayer.addChild(graphics);
        this.shockwaves.push({
            graphics,
            x,
            y,
            radius: 8,
            maxRadius,
            color,
            alpha: 0.8
        });
    }

    private addSlash(x: number, y: number, color = 0x38bdf8, angle = 0.5): void {
        const graphics = new Graphics();
        this.vfxLayer.addChild(graphics);
        this.slashes.push({
            graphics,
            x,
            y,
            progress: 0,
            angle,
            color
        });
    }

    private getPlayerPos(): { x: number; y: number } {
        if (!this.app) return { x: 120, y: 220 };
        return {
            x: this.app.screen.width * 0.25,
            y: this.app.screen.height * 0.60
        };
    }

    private getMonsterPos(): { x: number; y: number } {
        if (!this.app) return { x: 380, y: 220 };
        return {
            x: this.app.screen.width * 0.75,
            y: this.app.screen.height * 0.60
        };
    }

    public resize(): void {
        if (!this.app || !this.container) return;
        const w = this.container.clientWidth || 800;
        const h = this.container.clientHeight || 450;
        this.app.renderer.resize(w, h);
    }

    private notifyState(): void {
        if (this.onStateUpdate) {
            this.onStateUpdate({ ...this.state });
        }
    }

    private cleanupPixiApp(): void {
        if (!this.app) return;
        try {
            if (this.app.canvas && this.app.canvas.parentElement) {
                try {
                    this.app.canvas.parentElement.removeChild(this.app.canvas);
                } catch (_) {}
            }
            if (typeof (this.app as any)._cancelResize !== "function") {
                (this.app as any)._cancelResize = () => {};
            }
            this.app.destroy(true, { children: true });
        } catch (err) {
            console.warn("Pixi App destroy warning:", err);
        } finally {
            this.app = null;
        }
    }

    /**
     * Dọn dẹp sạch sẽ tài nguyên PixiJS để tránh rò rỉ bộ nhớ khi rời tab
     */
    public destroy(_destroyRenderer = true): void {
        this.isDestroyed = true;
        this.isInitialized = false;

        try {
            // Dọn dẹp Text & Graphics
            this.floatingTexts.forEach((ft) => {
                try { ft.pixiText.destroy(); } catch (_) {}
            });
            this.floatingTexts = [];

            this.shockwaves.forEach((sw) => {
                try { sw.graphics.destroy(); } catch (_) {}
            });
            this.shockwaves = [];

            this.slashes.forEach((s) => {
                try { s.graphics.destroy(); } catch (_) {}
            });
            this.slashes = [];

            this.cleanupPixiApp();
        } catch (err) {
            console.error("CombatEngine destroy error:", err);
        } finally {
            this.container = null;
        }
    }
}
