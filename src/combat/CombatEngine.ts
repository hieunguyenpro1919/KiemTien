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
    baseScale: number;
    alpha: number;
    life: number;
    maxLife: number;
    isCrit?: boolean;
}

interface SparkParticle {
    graphics: Graphics;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: number;
    alpha: number;
    life: number;
    maxLife: number;
}

interface ArcSlashItem {
    graphics: Graphics;
    x: number;
    y: number;
    radius: number;
    startAngle: number;
    endAngle: number;
    color: number;
    coreColor: number;
    thickness: number;
    progress: number;
    duration: number;
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

interface GhostTrailItem {
    graphics: Graphics;
    x: number;
    y: number;
    alpha: number;
    life: number;
    maxLife: number;
}

export class CombatEngine {
    private app: Application | null = null;
    private container: HTMLElement | null = null;
    private isInitialized = false;
    private isDestroyed = false;

    // Layer Structure
    private rootContainer = new Container();
    private backgroundLayer = new Container();
    private formationLayer = new Container();
    private ghostLayer = new Container();
    private entityLayer = new Container();
    private swordLayer = new Container();
    private vfxLayer = new Container();
    private screenDimGraphics = new Graphics();
    private screenFlashGraphics = new Graphics();
    private uiLayer = new Container();

    // Background Elements
    private starsGraphics = new Graphics();
    private magicArenaGraphics = new Graphics();
    private stars: { x: number; y: number; size: number; speed: number; alpha: number }[] = [];

    // Entity Graphics & Avatars
    private playerFormationGraphics = new Graphics();
    private playerBodyGraphics = new Graphics();
    private playerFlyingSwordGraphics = new Graphics();
    private playerEmojiText: Text | null = null;

    private monsterFormationGraphics = new Graphics();
    private monsterBodyGraphics = new Graphics();
    private monsterKimThanShieldGraphics = new Graphics();
    private monsterEmojiText: Text | null = null;

    // Dimensional Rift VFX
    private dimensionalRiftGraphics = new Graphics();

    // UI Elements
    private bossHpBarBg = new Graphics();
    private bossHpBarFill = new Graphics();
    private bossNameText: Text | null = null;
    private bossHpText: Text | null = null;
    private kimThanBadgeText: Text | null = null;
    private enrageTimerText: Text | null = null;

    // VFX Pools
    private floatingTexts: FloatingTextItem[] = [];
    private sparks: SparkParticle[] = [];
    private arcSlashes: ArcSlashItem[] = [];
    private shockwaves: ShockwaveItem[] = [];
    private ghostTrails: GhostTrailItem[] = [];

    // Screen Shake & Camera
    private shakeIntensity = 0;
    private shakeDecay = 0.90;

    // Ultimate Skill Timeline
    private ultimateTimer = 0; // Đếm ngược hiệu ứng Nhất Niệm
    private screenDimAlpha = 0;
    private flashAlpha = 0;

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

    // Animation Variables
    private animTime = 0;
    private playerAttackProgress = 0; // 0 -> 1: Dash áp sát rồi giật lùi
    private monsterAttackProgress = 0; // 0 -> 1: Pounce cào rồi lùi
    private playerHitAnim = 0; // Recoil & Flash
    private monsterHitAnim = 0; // Recoil & Flash
    private ghostSpawnTimer = 0;

    // Callbacks
    public onStateUpdate?: (state: CombatEngineRuntimeState) => void;
    public onVictory?: (stage: StageDefinition) => void;
    public onDefeat?: (reason: string) => void;

    constructor() {}

    /**
     * Khởi tạo PixiJS v8 Application và gắn vào Container DOM an toàn
     */
    public async init(container: HTMLElement): Promise<boolean> {
        try {
            this.container = container;
            this.isDestroyed = false;

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
                backgroundColor: 0x050811,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true
            });

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

            // Thiết lập thứ tự tầng hiển thị (Layering)
            this.app.stage.addChild(this.rootContainer);
            this.rootContainer.addChild(this.backgroundLayer);
            this.rootContainer.addChild(this.formationLayer);
            this.rootContainer.addChild(this.ghostLayer);
            this.rootContainer.addChild(this.entityLayer);
            this.rootContainer.addChild(this.swordLayer);
            this.rootContainer.addChild(this.vfxLayer);
            this.rootContainer.addChild(this.screenDimGraphics);
            this.rootContainer.addChild(this.dimensionalRiftGraphics);
            this.rootContainer.addChild(this.screenFlashGraphics);
            this.rootContainer.addChild(this.uiLayer);

            // Background elements
            this.initBackgroundStars();
            this.backgroundLayer.addChild(this.starsGraphics);
            this.backgroundLayer.addChild(this.magicArenaGraphics);

            // Formation & Entities
            this.formationLayer.addChild(this.playerFormationGraphics);
            this.formationLayer.addChild(this.monsterFormationGraphics);

            this.entityLayer.addChild(this.playerBodyGraphics);
            this.entityLayer.addChild(this.monsterBodyGraphics);
            this.entityLayer.addChild(this.monsterKimThanShieldGraphics);

            this.swordLayer.addChild(this.playerFlyingSwordGraphics);

            // UI Layer
            this.uiLayer.addChild(this.bossHpBarBg);
            this.uiLayer.addChild(this.bossHpBarFill);

            this.initTexts();

            // Ticker loop
            this.app.ticker.add((ticker) => {
                this.update(ticker.deltaTime / 60);
            });

            this.isInitialized = true;
            this.resize();
            return true;
        } catch (err) {
            console.error("Pixi Init Error in CombatEngine:", err);
            return false;
        }
    }

    private initBackgroundStars(): void {
        const starCount = 55;
        this.stars = [];
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * 900,
                y: Math.random() * 500,
                size: Math.random() * 2.2 + 0.8,
                speed: Math.random() * 0.25 + 0.08,
                alpha: Math.random() * 0.7 + 0.3
            });
        }
    }

    private initTexts(): void {
        // Player Avatar Text
        this.playerEmojiText = new Text({
            text: "🧙‍♂️",
            style: {
                fontSize: 34,
                align: "center"
            }
        });
        this.playerEmojiText.anchor.set(0.5);
        this.entityLayer.addChild(this.playerEmojiText);

        // Monster Avatar Text
        this.monsterEmojiText = new Text({
            text: "👾",
            style: {
                fontSize: 44,
                align: "center"
            }
        });
        this.monsterEmojiText.anchor.set(0.5);
        this.entityLayer.addChild(this.monsterEmojiText);

        // Boss Header Info
        this.bossNameText = new Text({
            text: "Yêu Thú Trấn Ải",
            style: {
                fontFamily: "serif",
                fontSize: 14,
                fontWeight: "bold",
                fill: 0xfbbf24,
                stroke: { color: 0x000000, width: 3 }
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
                fill: 0xffffff,
                stroke: { color: 0x000000, width: 2 }
            }
        });
        this.bossHpText.anchor.set(0.5, 0.5);
        this.uiLayer.addChild(this.bossHpText);

        this.kimThanBadgeText = new Text({
            text: "⛨ KIM THÂN HỘ THỂ (GIỚI HẠN SÁT THƯƠNG ĐÒN THƯỜNG)",
            style: {
                fontFamily: "sans-serif",
                fontSize: 10,
                fontWeight: "bold",
                fill: 0xffe066,
                stroke: { color: 0x000000, width: 2.5 }
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
                fill: 0xf87171,
                stroke: { color: 0x000000, width: 2 }
            }
        });
        this.enrageTimerText.anchor.set(1, 0.5);
        this.uiLayer.addChild(this.enrageTimerText);
    }

    /**
     * Khởi tạo trận chiến với Ải chỉ định và chỉ số người chơi
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

        this.state.skillCooldowns[slotIndex] = skill.cooldown;
        this.playerAttackProgress = 0.01; // Bắt đầu lướt tới
        this.addRage(25);

        const playerPos = this.getPlayerPos();
        const monsterPos = this.getMonsterPos();

        if (skill.type === "ho_the") {
            const shieldGained = this.state.playerMaxHp.times(skill.multiplier).round();
            this.state.playerCurrentShield = this.state.playerCurrentShield.plus(shieldGained);
            this.addShockwave(playerPos.x, playerPos.y, 0x38bdf8, 120);
            this.addFloatingText(playerPos.x, playerPos.y - 50, `🛡️ Khiên +${formatBigNumber(shieldGained)}`, 0x38bdf8, 1.3);
            this.notifyState();
            return true;
        }

        if (skill.type === "tri_lieu") {
            const healGained = this.playerStats.phep.times(skill.multiplier).round();
            const addedHp = this.state.playerCurrentHp.plus(healGained);
            this.state.playerCurrentHp = addedHp.gt(this.state.playerMaxHp) ? this.state.playerMaxHp : addedHp;
            this.addShockwave(playerPos.x, playerPos.y, 0x10b981, 120);
            this.addFloatingText(playerPos.x, playerPos.y - 50, `💚 Hồi +${formatBigNumber(healGained)}`, 0x10b981, 1.3);
            this.notifyState();
            return true;
        }

        // Tấn công: Arc Slash kiếm quang cỡ lớn
        const isPhysical = skill.type === "vat_li";
        const baseAtk = isPhysical ? this.playerStats.vatLi : this.playerStats.phep;
        const skillDmg = baseAtk.times(skill.multiplier).round();
        const breaksKimThan = this.state.hasKimThan;
        if (breaksKimThan) {
            this.state.isKimThanBroken = true;
        }

        // Kỹ năng tạo 2 vệt chém chữ X liên hoàn
        const slashColor = isPhysical ? 0xf59e0b : 0xa855f7;
        this.addArcSlash(monsterPos.x, monsterPos.y, 85, -0.7, 0.7, slashColor, 0xffffff, 24);
        setTimeout(() => {
            if (!this.isDestroyed) {
                this.addArcSlash(monsterPos.x, monsterPos.y, 85, 2.3, 3.8, slashColor, 0xffffff, 24);
            }
        }, 80);

        this.applyDamageToMonster(skillDmg, {
            isSkill: true,
            skillName: skill.name,
            breaksKimThan,
            isCrit: Math.random() * 100 < this.playerStats.baoKich,
            color: slashColor
        });

        this.triggerShake(9);
        return true;
    }

    /**
     * Kích hoạt Đại Thần Thông "Nhất Niệm" - KHAI THIÊN TRẢM (100 Nộ Khí)
     */
    public castUltimate(): boolean {
        if (this.state.isFinished || this.state.playerRage < 100) return false;

        this.state.playerRage = 0;
        this.ultimateTimer = 0.95; // Thời gian trình diễn chiêu thức
        this.screenDimAlpha = 0.88; // Tối sầm không gian màn hình
        this.triggerShake(30); // Rung chấn camera cực mạnh

        const monsterPos = this.getMonsterPos();

        // 1. Phóng chùm kiếm khí hư không
        this.addArcSlash(monsterPos.x, monsterPos.y, 110, -0.8, 0.8, 0x00f2fe, 0xffffff, 32);
        this.addArcSlash(monsterPos.x, monsterPos.y, 110, 2.3, 4.0, 0xd946ef, 0xffffff, 32);

        // 2. Chớp sáng màn hình toàn diện
        this.flashAlpha = 1.0;

        // 3. Cơ chế Nhất Niệm: Giáng thẳng vào 80% HP Max Boss (Sát Thương Chuẩn Vượt Kim Thân)
        const trueDamage = this.state.monsterMaxHp.times(0.80).round().max(1);
        this.state.monsterCurrentHp = this.state.monsterCurrentHp.minus(trueDamage);
        if (this.state.monsterCurrentHp.lte(0)) {
            this.state.monsterCurrentHp = toBigNumber(0);
        }

        // 4. Bùng nổ 40 mảnh tinh vân và số sát thương khổng lồ
        this.addHitSparks(monsterPos.x, monsterPos.y, 0x38bdf8, 35);
        this.addShockwave(monsterPos.x, monsterPos.y, 0x00f2fe, 180);

        const ultName = this.activeUltimate?.name || "Nhất Niệm";
        this.addFloatingText(
            monsterPos.x,
            monsterPos.y - 75,
            `🌌 [${ultName.toUpperCase()} KHAI THIÊN]!\n-${formatBigNumber(trueDamage)} (80% MÁU CHUẨN)`,
            0x38bdf8,
            2.2,
            true
        );

        this.monsterHitAnim = 0.6;

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

    /**
     * Tạo Vết Chém Kiếm Quang Hình Cung Uốn Lượn (Arc Slash)
     */
    public addArcSlash(
        x: number,
        y: number,
        radius: number,
        startAngle: number,
        endAngle: number,
        color: number,
        coreColor = 0xffffff,
        thickness = 18
    ): void {
        const graphics = new Graphics();
        this.vfxLayer.addChild(graphics);

        this.arcSlashes.push({
            graphics,
            x,
            y,
            radius,
            startAngle,
            endAngle,
            color,
            coreColor,
            thickness,
            progress: 0,
            duration: 0.22
        });
    }

    /**
     * Tạo Chùm Tia Sáng & Hạt Lửa Va Chạm (Hit Sparks Particles)
     */
    public addHitSparks(x: number, y: number, color: number, count = 18): void {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 260 + 80;
            const graphics = new Graphics();
            this.vfxLayer.addChild(graphics);

            this.sparks.push({
                graphics,
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3.5 + 1.5,
                color,
                alpha: 1.0,
                life: 0,
                maxLife: Math.random() * 0.25 + 0.15
            });
        }
    }

    /**
     * Tạo Sóng Xung Kích Hình Tròn / Elip
     */
    public addShockwave(x: number, y: number, color = 0x00f2fe, maxRadius = 90): void {
        const graphics = new Graphics();
        this.vfxLayer.addChild(graphics);
        this.shockwaves.push({
            graphics,
            x,
            y,
            radius: 10,
            maxRadius,
            color,
            alpha: 0.9
        });
    }

    /**
     * Tạo Số Sát Thương Nhảy Nảy Có Trọng Lực & Phóng To (Bouncing Floating Text)
     */
    public addFloatingText(
        x: number,
        y: number,
        text: string,
        color: number,
        scale = 1.3,
        isCrit = false
    ): void {
        const pixiText = new Text({
            text,
            style: {
                fontFamily: "monospace, serif",
                fontSize: isCrit ? 18 : 14,
                fontWeight: "900",
                fill: color,
                stroke: { color: 0x000000, width: isCrit ? 5 : 3.5 },
                align: "center"
            }
        });
        pixiText.anchor.set(0.5);
        pixiText.scale.set(scale * 1.5);
        this.uiLayer.addChild(pixiText);

        this.floatingTexts.push({
            pixiText,
            x,
            y,
            vy: isCrit ? -180 : -130, // Nhảy vọt lên cao
            baseScale: scale,
            alpha: 1.0,
            life: 0,
            maxLife: isCrit ? 1.4 : 1.1,
            isCrit
        });
    }

    /**
     * Tạo Tàn Ảnh Lướt Đi (Ghost Trail)
     */
    private addGhostTrail(x: number, y: number): void {
        const graphics = new Graphics();
        // Vẽ bóng mờ Đạo Sĩ
        graphics.ellipse(x, y + 16, 26, 32).fill({ color: 0x00f2fe, alpha: 0.4 });
        this.ghostLayer.addChild(graphics);

        this.ghostTrails.push({
            graphics,
            x,
            y,
            alpha: 0.45,
            life: 0,
            maxLife: 0.25
        });
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

        // Bạo kích x2
        if (options.isCrit) {
            dmg = dmg.times(2.0).round();
        }

        // Trừ thủ
        if (this.stage) {
            dmg = dmg.minus(this.stage.monster.defense).max(1);
        }

        // Cơ chế Kim Thân Hộ Thể
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

        this.state.monsterCurrentHp = this.state.monsterCurrentHp.minus(dmg);
        if (this.state.monsterCurrentHp.lte(0)) {
            this.state.monsterCurrentHp = toBigNumber(0);
        }

        this.monsterHitAnim = 0.35; // Giật lùi mục tiêu

        // Bung tia sáng tóe ra
        this.addHitSparks(monsterPos.x, monsterPos.y, options.color || 0x38bdf8, options.isCrit ? 26 : 14);

        // Số sát thương nảy
        let textStr = `-${formatBigNumber(dmg)}`;
        let textColor = options.color || 0xffffff;
        let textScale = 1.3;

        if (options.isCrit) {
            textStr = `💥 BẠO KÍCH! -${formatBigNumber(dmg)}`;
            textColor = 0xfbbf24;
            textScale = 1.7;
        }
        if (options.breaksKimThan) {
            textStr = `⚡ PHÁ KIM THÂN! ${textStr}`;
            textColor = 0xf472b6;
            textScale = 1.8;
        } else if (capped) {
            textStr = `🛡️ [CẢN KIM THÂN] ${textStr}`;
            textColor = 0xfde047;
        }

        this.addFloatingText(
            monsterPos.x + (Math.random() * 30 - 15),
            monsterPos.y - 45,
            textStr,
            textColor,
            textScale,
            !!options.isCrit
        );

        if (this.state.monsterCurrentHp.lte(0)) {
            this.handleVictory();
        }
    }

    private applyDamageToPlayer(rawDmg: BigNumber): void {
        if (!this.playerStats) return;

        const def = this.playerStats.phongThu;
        let actualDmg = rawDmg.minus(def).max(1);

        if (this.state.playerCurrentShield.gt(0)) {
            if (this.state.playerCurrentShield.gte(actualDmg)) {
                this.state.playerCurrentShield = this.state.playerCurrentShield.minus(actualDmg);
                this.addFloatingText(this.getPlayerPos().x, this.getPlayerPos().y - 40, `⛨ Đỡ -${formatBigNumber(actualDmg)}`, 0x00f2fe, 1.2);
                actualDmg = toBigNumber(0);
            } else {
                actualDmg = actualDmg.minus(this.state.playerCurrentShield);
                this.state.playerCurrentShield = toBigNumber(0);
            }
        }

        if (actualDmg.gt(0)) {
            this.state.playerCurrentHp = this.state.playerCurrentHp.minus(actualDmg);
            this.playerHitAnim = 0.35;
            this.addFloatingText(this.getPlayerPos().x, this.getPlayerPos().y - 45, `-${formatBigNumber(actualDmg)}`, 0xef4444, 1.4);
            this.addHitSparks(this.getPlayerPos().x, this.getPlayerPos().y, 0xef4444, 15);
        }

        if (this.state.playerCurrentHp.lte(0)) {
            this.state.playerCurrentHp = toBigNumber(0);
            this.handleDefeat("Đạo Hữu đã kiệt sức trước uy áp yêu quỷ!");
        }
    }

    private handleVictory(): void {
        this.state.isFinished = true;
        this.state.victory = true;
        this.addShockwave(this.getMonsterPos().x, this.getMonsterPos().y, 0xfbbf24, 200);
        this.triggerShake(16);

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
     * Vòng lặp cập nhật trận đấu mỗi frame (Battle Loop)
     */
    private update(deltaSeconds: number): void {
        if (!this.isInitialized || this.isDestroyed) return;

        const effectiveDelta = deltaSeconds * this.state.speed;
        this.animTime += effectiveDelta;

        // 1. Screen Shake Camera
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

        // 2. Fullscreen Flash & Screen Dim (Nhất Niệm)
        if (this.flashAlpha > 0.01) {
            this.flashAlpha = Math.max(0, this.flashAlpha - effectiveDelta * 3.5);
            this.drawFlash();
        } else {
            this.screenFlashGraphics.clear();
        }

        if (this.ultimateTimer > 0) {
            this.ultimateTimer -= effectiveDelta;
            this.screenDimAlpha = Math.max(0, this.screenDimAlpha - effectiveDelta * 1.2);
            this.drawDimAndDimensionalRift();
        } else {
            this.screenDimGraphics.clear();
            this.dimensionalRiftGraphics.clear();
        }

        // 3. Tiến trình chiến đấu nếu không trong trạng thái đóng băng thời gian
        if (!this.state.isFinished && this.stage && this.playerStats && this.ultimateTimer <= 0.6) {
            // Enrage Timer
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

            // Tự Động Kích Hoạt Kỹ Năng & Đại Thần Thông nếu bật Auto
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

            // Cập nhật hoạt ảnh lướt tới của Đạo Hữu
            if (this.playerAttackProgress > 0) {
                this.playerAttackProgress += effectiveDelta * 4.2;
                this.ghostSpawnTimer += effectiveDelta;
                if (this.ghostSpawnTimer >= 0.04) {
                    this.ghostSpawnTimer = 0;
                    const pPos = this.getCurrentPlayerVisualPos();
                    this.addGhostTrail(pPos.x, pPos.y);
                }

                if (this.playerAttackProgress >= 1.0) {
                    this.playerAttackProgress = 0;
                }
            }

            // Đòn đánh thường của Đạo Hữu
            this.state.playerAttackCooldown -= effectiveDelta;
            if (this.state.playerAttackCooldown <= 0) {
                this.state.playerAttackCooldown = 1.05;
                this.playerAttackProgress = 0.01; // Bắt đầu lướt chém
                this.addRage(12);

                const isCrit = Math.random() * 100 < this.playerStats.baoKich;
                const mPos = this.getMonsterPos();

                // Chém kiếm quang vòng cung
                this.addArcSlash(mPos.x, mPos.y, 72, -0.6, 0.6, isCrit ? 0xf59e0b : 0x00f2fe, 0xffffff, 20);

                this.applyDamageToMonster(this.playerStats.vatLi, { isCrit });
                this.triggerShake(isCrit ? 6 : 2.5);
            }

            // Cập nhật hoạt ảnh vồ cào của Quái Vật
            if (this.monsterAttackProgress > 0) {
                this.monsterAttackProgress += effectiveDelta * 3.8;
                if (this.monsterAttackProgress >= 1.0) {
                    this.monsterAttackProgress = 0;
                }
            }

            // Đòn đánh của Quái Vật
            this.state.monsterAttackCooldown -= effectiveDelta;
            if (this.state.monsterAttackCooldown <= 0) {
                this.state.monsterAttackCooldown = this.stage.monster.attackSpeed || 2.0;
                this.monsterAttackProgress = 0.01; // Bắt đầu vồ cào

                let mobAtk = this.stage.monster.attack;
                if (this.state.isEnraged) {
                    mobAtk = mobAtk.times(10);
                }

                const pPos = this.getPlayerPos();
                this.addArcSlash(pPos.x, pPos.y, 68, 2.4, 3.8, 0xef4444, 0xffffff, 22);
                this.applyDamageToPlayer(mobAtk);
                this.triggerShake(3.5);
            }

            this.notifyState();
        }

        // 4. Render các tầng đồ họa
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

    private drawDimAndDimensionalRift(): void {
        if (!this.app) return;
        const width = this.app.screen.width;
        const height = this.app.screen.height;

        // Màn hình tối sầm
        this.screenDimGraphics.clear();
        this.screenDimGraphics.rect(0, 0, width, height).fill({ color: 0x02040a, alpha: this.screenDimAlpha });

        // Vết rách không gian cắt ngang màn hình
        this.dimensionalRiftGraphics.clear();
        const mPos = this.getMonsterPos();

        // Đường nứt không gian chiếu qua tâm Boss
        this.dimensionalRiftGraphics
            .moveTo(mPos.x - 280, mPos.y - 180)
            .lineTo(mPos.x + 280, mPos.y + 180)
            .stroke({ width: 22, color: 0x38bdf8, alpha: 0.7 });

        this.dimensionalRiftGraphics
            .moveTo(mPos.x - 280, mPos.y - 180)
            .lineTo(mPos.x + 280, mPos.y + 180)
            .stroke({ width: 6, color: 0xffffff, alpha: 0.95 });
    }

    private renderBackground(): void {
        if (!this.app) return;
        const width = this.app.screen.width;
        const height = this.app.screen.height;

        // Sao trôi lơ lửng
        this.starsGraphics.clear();
        this.stars.forEach((s) => {
            s.y += s.speed;
            if (s.y > height) s.y = 0;
            this.starsGraphics.circle(s.x, s.y, s.size).fill({ color: 0x93c5fd, alpha: s.alpha });
        });

        // Vành đai trận pháp sàn đấu cổ phong
        const centerY = height * 0.65;
        this.magicArenaGraphics.clear();

        // Vòng elip hư không chính
        this.magicArenaGraphics
            .ellipse(width * 0.5, centerY, width * 0.46, 52)
            .fill({ color: 0x070c1a, alpha: 0.7 })
            .stroke({ width: 2, color: 0x38bdf8, alpha: 0.4 });

        // Vòng hào quang Thái Cực phụ trợ xoay tròn
        const rot = this.animTime * 0.4;
        this.magicArenaGraphics
            .ellipse(width * 0.5, centerY, width * 0.32, 32)
            .stroke({ width: 1.5, color: 0x00f2fe, alpha: 0.35 + Math.sin(rot) * 0.1 });
    }

    private getCurrentPlayerVisualPos(): { x: number; y: number } {
        const base = this.getPlayerPos();
        const monster = this.getMonsterPos();
        let dashOffset = 0;

        if (this.playerAttackProgress > 0) {
            // Lướt tới 65% khoảng cách rồi giật lùi
            dashOffset = Math.sin(this.playerAttackProgress * Math.PI) * (monster.x - base.x - 70);
        }

        // Bị giật lùi khi trúng đòn (Recoil)
        const recoil = this.playerHitAnim > 0 ? -12 * Math.sin(this.playerHitAnim * Math.PI) : 0;
        this.playerHitAnim = Math.max(0, this.playerHitAnim - 0.05);

        return {
            x: base.x + dashOffset + recoil,
            y: base.y
        };
    }

    private getCurrentMonsterVisualPos(): { x: number; y: number } {
        const base = this.getMonsterPos();
        let dashOffset = 0;

        if (this.monsterAttackProgress > 0) {
            dashOffset = -Math.sin(this.monsterAttackProgress * Math.PI) * 70;
        }

        // Bị giật lùi khi trúng đòn
        const recoil = this.monsterHitAnim > 0 ? 16 * Math.sin(this.monsterHitAnim * Math.PI) : 0;
        this.monsterHitAnim = Math.max(0, this.monsterHitAnim - 0.05);

        return {
            x: base.x + dashOffset + recoil,
            y: base.y
        };
    }

    private renderEntities(): void {
        const pPos = this.getCurrentPlayerVisualPos();
        const mPos = this.getCurrentMonsterVisualPos();

        // ==========================================
        // 1. THỰC THỂ TIÊN SĨ (ĐẠO HỮU)
        // ==========================================
        // Bệ Đỡ Trận Pháp Đạo Thân (Multi-layer Pedestal)
        this.playerFormationGraphics.clear();
        const pRot = this.animTime * 0.7;
        this.playerFormationGraphics
            .ellipse(pPos.x, pPos.y + 36, 46, 16)
            .stroke({ width: 2, color: 0x38bdf8, alpha: 0.5 });

        // Các điểm linh chú xoay tròn
        for (let i = 0; i < 6; i++) {
            const angle = pRot + (i * Math.PI * 2) / 6;
            const rx = pPos.x + Math.cos(angle) * 46;
            const ry = pPos.y + 36 + Math.sin(angle) * 16;
            this.playerFormationGraphics.circle(rx, ry, 2).fill({ color: 0x00f2fe, alpha: 0.8 });
        }

        // Cánh sen linh lực phát sáng
        this.playerFormationGraphics
            .ellipse(pPos.x, pPos.y + 36, 30, 11)
            .fill({ color: 0x00f2fe, alpha: 0.25 })
            .stroke({ width: 1.5, color: 0x00f2fe, alpha: 0.7 });

        // Thân Thể Đạo Hữu (Silhouette & Hào Quang Khí Hải)
        this.playerBodyGraphics.clear();

        // Trụ khí linh lực bốc lên
        const qiAlpha = 0.25 + Math.sin(this.animTime * 4) * 0.12;
        this.playerBodyGraphics
            .ellipse(pPos.x, pPos.y, 34, 44)
            .fill({ color: 0x00f2fe, alpha: qiAlpha });

        // Hào quang Kim Đan sau đầu
        this.playerBodyGraphics
            .circle(pPos.x, pPos.y - 28, 18)
            .fill({ color: 0xfde047, alpha: 0.35 })
            .stroke({ width: 2, color: 0x38bdf8, alpha: 0.8 });

        // Tấm áo choàng đạo bào uy nghi (Chân dung phong thái Tiên Sĩ)
        const hitColor = this.playerHitAnim > 0 ? 0xff4d4d : 0x0b1329;
        this.playerBodyGraphics
            .roundRect(pPos.x - 22, pPos.y - 20, 44, 46, 12)
            .fill({ color: hitColor })
            .stroke({ width: 2.5, color: 0x00f2fe });

        // Dải lụa tiên phong phất phới
        const scarfOffset = Math.sin(this.animTime * 5) * 8;
        this.playerBodyGraphics
            .moveTo(pPos.x - 18, pPos.y + 10)
            .lineTo(pPos.x - 30 + scarfOffset, pPos.y + 36)
            .stroke({ width: 3, color: 0x38bdf8, alpha: 0.7 });

        if (this.playerEmojiText) {
            this.playerEmojiText.x = pPos.x;
            this.playerEmojiText.y = pPos.y - 2;
        }

        // ==========================================
        // 2. BẢN MỆNH PHI KIẾM (FLOATING CELESTIAL SWORD)
        // ==========================================
        this.playerFlyingSwordGraphics.clear();
        let swordX = pPos.x - 36;
        let swordY = pPos.y - 24 + Math.sin(this.animTime * 4) * 7;
        let swordAngle = -0.3;

        // Khi tấn công: Phi kiếm phóng lên trước mũi lướt chém
        if (this.playerAttackProgress > 0) {
            swordX = pPos.x + 40;
            swordY = pPos.y;
            swordAngle = 1.2 + this.playerAttackProgress * 6; // Xoay vòng xoáy chém
        }

        this.playerFlyingSwordGraphics.x = swordX;
        this.playerFlyingSwordGraphics.y = swordY;
        this.playerFlyingSwordGraphics.rotation = swordAngle;

        // Lưỡi phi kiếm phát sáng
        this.playerFlyingSwordGraphics
            .moveTo(0, -26)
            .lineTo(5, 10)
            .lineTo(0, 16)
            .lineTo(-5, 10)
            .closePath()
            .fill({ color: 0xffffff })
            .stroke({ width: 2, color: 0x00f2fe });

        // Chuôi kiếm vàng kim
        this.playerFlyingSwordGraphics
            .rect(-8, 10, 16, 3)
            .fill({ color: 0xfbbf24 });

        // ==========================================
        // 3. THỰC THỂ MA QUỶ / YÊU THÚ
        // ==========================================
        // Ma Trận Huyết Quỷ (Demonic Pedestal)
        this.monsterFormationGraphics.clear();
        const mRot = this.animTime * -0.6;

        this.monsterFormationGraphics
            .ellipse(mPos.x, mPos.y + 38, 52, 18)
            .stroke({ width: 2.5, color: this.state.isEnraged ? 0xef4444 : 0x9333ea, alpha: 0.6 });

        // Các gai ma chú xoay tròn
        for (let i = 0; i < 6; i++) {
            const angle = mRot + (i * Math.PI * 2) / 6;
            const rx = mPos.x + Math.cos(angle) * 52;
            const ry = mPos.y + 38 + Math.sin(angle) * 18;
            this.monsterFormationGraphics.circle(rx, ry, 2.5).fill({ color: this.state.isEnraged ? 0xef4444 : 0xa855f7, alpha: 0.85 });
        }

        this.monsterFormationGraphics
            .ellipse(mPos.x, mPos.y + 38, 34, 12)
            .fill({ color: this.state.isEnraged ? 0xdc2626 : 0x7e22ce, alpha: 0.3 });

        // Thân Thể Yêu Thú (Ma Khí Hỗn Mang Cuồn Cuộn)
        this.monsterBodyGraphics.clear();
        const mHitColor = this.monsterHitAnim > 0 ? 0xffffff : 0x1f0b2e;
        const auraColor = this.state.isEnraged ? 0xdc2626 : 0x9333ea;

        // Vòng xoáy ma khí tà ác
        const miasmaAlpha = 0.3 + Math.sin(this.animTime * 6) * 0.15;
        this.monsterBodyGraphics
            .ellipse(mPos.x, mPos.y, 44, 48)
            .fill({ color: auraColor, alpha: miasmaAlpha });

        // Khối giáp hắc ám sắc nhọn
        this.monsterBodyGraphics
            .roundRect(mPos.x - 26, mPos.y - 24, 52, 54, 16)
            .fill({ color: mHitColor })
            .stroke({ width: 3, color: auraColor });

        // Cặp sừng ma tộc uy hiếp
        this.monsterBodyGraphics
            .moveTo(mPos.x - 22, mPos.y - 22)
            .lineTo(mPos.x - 36, mPos.y - 44)
            .stroke({ width: 4, color: auraColor });

        this.monsterBodyGraphics
            .moveTo(mPos.x + 22, mPos.y - 22)
            .lineTo(mPos.x + 36, mPos.y - 44)
            .stroke({ width: 4, color: auraColor });

        if (this.monsterEmojiText) {
            this.monsterEmojiText.x = mPos.x;
            this.monsterEmojiText.y = mPos.y;
        }

        // Kim Thân Hộ Thể (Kim Cương Hộ Thể 8 Cạnh)
        this.monsterKimThanShieldGraphics.clear();
        if (this.state.hasKimThan && !this.state.isKimThanBroken) {
            const shieldAlpha = 0.55 + Math.sin(this.animTime * 7) * 0.25;
            this.monsterKimThanShieldGraphics
                .circle(mPos.x, mPos.y, 56)
                .stroke({ width: 4, color: 0xfbbf24, alpha: shieldAlpha });

            // Kinh văn kim sắc hộ thể
            this.monsterKimThanShieldGraphics
                .ellipse(mPos.x, mPos.y, 64, 28)
                .stroke({ width: 1.5, color: 0xfde047, alpha: shieldAlpha * 0.8 });
        }
    }

    private renderVfx(deltaSeconds: number): void {
        // 1. Tàn Ảnh Lướt Đi (Ghost Trails)
        for (let i = this.ghostTrails.length - 1; i >= 0; i--) {
            const gt = this.ghostTrails[i];
            gt.life += deltaSeconds;
            gt.alpha = Math.max(0, 0.45 * (1 - gt.life / gt.maxLife));
            gt.graphics.alpha = gt.alpha;

            if (gt.life >= gt.maxLife) {
                this.ghostLayer.removeChild(gt.graphics);
                gt.graphics.destroy();
                this.ghostTrails.splice(i, 1);
            }
        }

        // 2. Vệt Chém Kiếm Quang Hình Cung (Arc Slashes)
        for (let i = this.arcSlashes.length - 1; i >= 0; i--) {
            const slash = this.arcSlashes[i];
            slash.progress += deltaSeconds / slash.duration;
            slash.graphics.clear();

            if (slash.progress >= 1.0) {
                this.vfxLayer.removeChild(slash.graphics);
                slash.graphics.destroy();
                this.arcSlashes.splice(i, 1);
            } else {
                const alpha = Math.sin(slash.progress * Math.PI);
                const currentRadius = slash.radius * (0.85 + slash.progress * 0.35);

                // Viền ánh kiếm năng lượng ngoài
                slash.graphics
                    .arc(slash.x, slash.y, currentRadius, slash.startAngle, slash.endAngle)
                    .stroke({ width: slash.thickness, color: slash.color, alpha: alpha * 0.85 });

                // Lõi lưỡi kiếm trắng sắc lẹm ở giữa
                slash.graphics
                    .arc(slash.x, slash.y, currentRadius, slash.startAngle, slash.endAngle)
                    .stroke({ width: 5, color: slash.coreColor, alpha: alpha });
            }
        }

        // 3. Tia Sáng & Hạt Lửa Va Chạm (Hit Sparks)
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const sp = this.sparks[i];
            sp.life += deltaSeconds;
            sp.x += sp.vx * deltaSeconds;
            sp.y += sp.vy * deltaSeconds;
            sp.vy += 180 * deltaSeconds; // Trọng lực nhẹ rơi xuống
            sp.vx *= 0.94; // Lực cản không khí
            sp.alpha = Math.max(0, 1 - sp.life / sp.maxLife);

            sp.graphics.clear();
            if (sp.life >= sp.maxLife) {
                this.vfxLayer.removeChild(sp.graphics);
                sp.graphics.destroy();
                this.sparks.splice(i, 1);
            } else {
                // Vẽ tia lửa dài nhọn theo hướng bay
                sp.graphics
                    .moveTo(sp.x, sp.y)
                    .lineTo(sp.x - sp.vx * 0.04, sp.y - sp.vy * 0.04)
                    .stroke({ width: sp.size, color: sp.color, alpha: sp.alpha });
            }
        }

        // 4. Sóng Xung Kích (Shockwaves)
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.radius += (sw.maxRadius - sw.radius) * deltaSeconds * 14;
            sw.alpha -= deltaSeconds * 1.8;

            sw.graphics.clear();
            if (sw.alpha <= 0.02 || sw.radius >= sw.maxRadius * 0.95) {
                this.vfxLayer.removeChild(sw.graphics);
                sw.graphics.destroy();
                this.shockwaves.splice(i, 1);
            } else {
                sw.graphics
                    .ellipse(sw.x, sw.y, sw.radius, sw.radius * 0.45)
                    .stroke({ width: 3.5, color: sw.color, alpha: sw.alpha });
            }
        }

        // 5. Số Sát Thương Nhảy Nảy Có Trọng Lực (Bouncing Floating Texts)
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.life += deltaSeconds;
            ft.y += ft.vy * deltaSeconds;
            ft.vy += 220 * deltaSeconds; // Trọng lực kéo rơi xuống sau khi nhảy vọt
            ft.alpha = Math.max(0, 1 - ft.life / ft.maxLife);

            // Hiệu ứng nảy đàn hồi (Bounce Scale)
            const bounce = ft.isCrit
                ? ft.baseScale * (1.0 + 0.35 * Math.sin(ft.life * 14))
                : ft.baseScale * Math.max(1.0, 1.4 - ft.life * 1.5);

            ft.pixiText.x = ft.x;
            ft.pixiText.y = ft.y;
            ft.pixiText.scale.set(bounce);
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

        // Thanh Máu Boss (Boss HP Bar)
        const barWidth = Math.min(width * 0.75, 480);
        const barHeight = 16;
        const barX = (width - barWidth) / 2;
        const barY = 32;

        this.bossHpBarBg.clear();
        this.bossHpBarBg
            .roundRect(barX, barY, barWidth, barHeight, 6)
            .fill({ color: 0x1e293b, alpha: 0.9 })
            .stroke({ width: 2, color: 0x475569 });

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

    private getPlayerPos(): { x: number; y: number } {
        if (!this.app) return { x: 140, y: 230 };
        return {
            x: this.app.screen.width * 0.25,
            y: this.app.screen.height * 0.60
        };
    }

    private getMonsterPos(): { x: number; y: number } {
        if (!this.app) return { x: 380, y: 230 };
        return {
            x: this.app.screen.width * 0.75,
            y: this.app.screen.height * 0.60
        };
    }

    public resize(): void {
        if (!this.app || !this.container || !this.app.renderer) return;
        try {
            const w = this.container.clientWidth || 800;
            const h = this.container.clientHeight || 450;
            this.app.renderer.resize(w, h);
        } catch (err) {
            console.warn("CombatEngine resize warning:", err);
        }
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
     * Dọn dẹp sạch sẽ tài nguyên PixiJS
     */
    public destroy(_destroyRenderer = true): void {
        this.isDestroyed = true;
        this.isInitialized = false;

        try {
            this.floatingTexts.forEach((ft) => {
                try { ft.pixiText.destroy(); } catch (_) {}
            });
            this.floatingTexts = [];

            this.sparks.forEach((sp) => {
                try { sp.graphics.destroy(); } catch (_) {}
            });
            this.sparks = [];

            this.arcSlashes.forEach((as) => {
                try { as.graphics.destroy(); } catch (_) {}
            });
            this.arcSlashes = [];

            this.shockwaves.forEach((sw) => {
                try { sw.graphics.destroy(); } catch (_) {}
            });
            this.shockwaves = [];

            this.ghostTrails.forEach((gt) => {
                try { gt.graphics.destroy(); } catch (_) {}
            });
            this.ghostTrails = [];

            this.cleanupPixiApp();
        } catch (err) {
            console.error("CombatEngine destroy error:", err);
        } finally {
            this.container = null;
        }
    }
}
