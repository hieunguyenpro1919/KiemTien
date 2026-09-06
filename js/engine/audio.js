/**
 * HỆ THỐNG ÂM THANH TIÊN HIỆP (WEB AUDIO API)
 * Tạo âm thanh huyền ảo trực tiếp bằng bộ tổng hợp dao động âm (Oscillator & Noise)
 * Không phụ thuộc tài nguyên ngoài, chạy mượt mà trên mọi trình duyệt
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.volume = 0.25;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    playTone(freq, duration, type = "sine", endFreq = null) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            if (endFreq) {
                osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), this.ctx.currentTime + duration);
            }

            gain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn("Audio error:", e);
        }
    }

    // Tiếng vung kiếm / Chém vật lí
    playSlash() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            // White noise burst + quick filter sweep
            const bufferSize = this.ctx.sampleRate * 0.15;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.setValueAtTime(1800, this.ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.15);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(this.volume * 1.2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start();
            this.playTone(320, 0.1, "triangle", 120);
        } catch (e) {}
    }

    // Tiếng thi triển Pháp thuật / Lửa
    playFireSpell() {
        this.playTone(480, 0.35, "sawtooth", 140);
        setTimeout(() => this.playTone(620, 0.2, "sine", 220), 80);
    }

    // Tiếng Thiên Lôi / Sấm sét
    playThunder() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const bufferSize = this.ctx.sampleRate * 0.4;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(800, this.ctx.currentTime);
            filter.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.4);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(this.volume * 2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start();
            this.playTone(90, 0.4, "sawtooth", 40);
        } catch (e) {}
    }

    // Tiếng Hộ Thể / Khiên Chắn
    playShield() {
        this.playTone(523, 0.4, "sine"); // C5
        setTimeout(() => this.playTone(659, 0.4, "sine"), 100); // E5
        setTimeout(() => this.playTone(783, 0.6, "sine"), 200); // G5
    }

    // Tiếng Trị Liệu / Hồi Sinh Lực
    playHeal() {
        const notes = [440, 554, 659, 880];
        notes.forEach((freq, idx) => {
            setTimeout(() => this.playTone(freq, 0.3, "sine"), idx * 70);
        });
    }

    // Tiếng Đột Phá Cảnh Giới (Tiên Nhạc Chúc Mừng)
    playBreakthrough() {
        const chords = [392, 523, 659, 783, 1046];
        chords.forEach((freq, idx) => {
            setTimeout(() => this.playTone(freq, 0.8, "triangle"), idx * 120);
        });
        setTimeout(() => {
            this.playTone(1318, 1.2, "sine");
            this.playTone(1046, 1.2, "sine");
        }, 650);
    }

    // Tiếng Chiến Thắng
    playVictory() {
        const fanfare = [523, 659, 783, 1046];
        fanfare.forEach((freq, idx) => {
            setTimeout(() => this.playTone(freq, 0.25, "square"), idx * 100);
        });
        setTimeout(() => this.playTone(1046, 0.6, "triangle"), 450);
    }

    // Tiếng Thất Bại
    playDefeat() {
        this.playTone(330, 0.3, "sawtooth", 220);
        setTimeout(() => this.playTone(220, 0.5, "sawtooth", 110), 250);
    }

    // Tiếng Click Nút
    playClick() {
        this.playTone(800, 0.04, "sine", 1200);
    }

    // Tiếng Mặc Đồ / Trang Bị
    playEquip() {
        this.playTone(400, 0.08, "triangle");
        setTimeout(() => this.playTone(600, 0.12, "sine"), 60);
    }
}

if (typeof window !== "undefined") {
    window.soundEngine = new SoundEngine();
}
