/**
 * HỆ THỐNG HIỆU ỨNG LINH QUANG & HẠT CHIẾN ĐẤU (PARTICLES)
 * Render hạt linh khí tụ hội khi đả tọa, kiếm quang khi chém, lôi đình, khiên quang, đột phá
 */

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
        this.particles = [];
        this.floatingTexts = [];
        this.isRunning = false;
        this.lastTime = 0;

        if (this.canvas) {
            this.resize();
            window.addEventListener("resize", () => this.resize());
        }
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    stop() {
        this.isRunning = false;
    }

    // Thêm số nảy lên (Floating Combat Text)
    addFloatingText(text, x, y, color = "#fff", isCrit = false) {
        this.floatingTexts.push({
            text: String(text),
            x: x + (Math.random() * 20 - 10),
            y: y,
            vx: (Math.random() * 2 - 1) * 0.8,
            vy: isCrit ? -2.5 : -1.6,
            color: color,
            alpha: 1,
            size: isCrit ? 26 : 18,
            isCrit: isCrit,
            life: 1.0
        });
    }

    // Hiệu ứng linh khí tụ hội (Đả Tọa)
    emitMeditationQi(centerX, centerY, color = "#4ecca3") {
        for (let i = 0; i < 2; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 70 + Math.random() * 40;
            this.particles.push({
                x: centerX + Math.cos(angle) * dist,
                y: centerY + Math.sin(angle) * dist,
                vx: -Math.cos(angle) * (1.2 + Math.random()),
                vy: -Math.sin(angle) * (1.2 + Math.random()),
                size: 2 + Math.random() * 3,
                color: color,
                alpha: 0.8,
                decay: 0.02
            });
        }
    }

    // Hiệu ứng Chém Kiếm / Vật Lí
    emitSlash(x, y, color = "#e0e6ed") {
        for (let i = 0; i < 18; i++) {
            const angle = (Math.PI / 4) + (Math.random() * 0.6 - 0.3);
            const speed = 3 + Math.random() * 6;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
                vy: Math.sin(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
                size: 2 + Math.random() * 4,
                color: color,
                alpha: 1,
                decay: 0.04
            });
        }
    }

    // Hiệu ứng Bùng Lửa / Ma Pháp
    emitFire(x, y) {
        const colors = ["#ff7043", "#ffa726", "#ffca28", "#d32f2f"];
        for (let i = 0; i < 25; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 5;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                size: 3 + Math.random() * 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: 0.035
            });
        }
    }

    // Hiệu ứng Sét / Lôi Đình
    emitThunder(x, y) {
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: x + (Math.random() * 40 - 20),
                y: y + (Math.random() * 40 - 20),
                vx: (Math.random() * 8 - 4),
                vy: (Math.random() * 8 - 4),
                size: 2 + Math.random() * 3,
                color: "#e056fd",
                alpha: 1,
                decay: 0.05
            });
        }
    }

    // Hiệu ứng Đột Phá Hào Quang
    emitBreakthrough(x, y) {
        const colors = ["#ffd700", "#fffa65", "#00d2d3", "#ff9ff3", "#54a0ff"];
        for (let i = 0; i < 80; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 8;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: 0.018
            });
        }
    }

    loop(currentTime) {
        if (!this.isRunning) return;
        const dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Cập nhật và vẽ hạt
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= p.decay;

                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }

                this.ctx.save();
                this.ctx.globalAlpha = Math.max(0, p.alpha);
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }

            // Cập nhật và vẽ chữ nảy số sát thương
            for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
                const ft = this.floatingTexts[i];
                ft.x += ft.vx;
                ft.y += ft.vy;
                ft.life -= dt * 1.4;

                if (ft.life <= 0) {
                    this.floatingTexts.splice(i, 1);
                    continue;
                }

                this.ctx.save();
                this.ctx.globalAlpha = Math.max(0, ft.life);
                this.ctx.font = `${ft.isCrit ? "bold " : ""}${ft.size}px 'Cinzel', 'Noto Serif SC', sans-serif`;
                this.ctx.fillStyle = ft.color;
                this.ctx.shadowColor = "#000";
                this.ctx.shadowBlur = 6;
                this.ctx.textAlign = "center";
                this.ctx.fillText(ft.text, ft.x, ft.y);
                this.ctx.restore();
            }
        }

        requestAnimationFrame((t) => this.loop(t));
    }
}

if (typeof window !== "undefined") {
    window.ParticleSystem = ParticleSystem;
}
