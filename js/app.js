/**
 * ĐIỂM KHỞI ĐẦU CHÍNH CỦA GAME (MAIN APPLICATION)
 * Khởi tạo dữ liệu, bộ máy âm thanh, hiệu ứng hạt, vòng lặp đả tọa tu vi tự động (AFK online & offline)
 */

window.addEventListener("DOMContentLoaded", () => {
    // 1. Khởi tạo đối tượng người chơi
    const player = new Player();

    // 2. Tải tiến trình đã lưu (nếu có)
    const hasSave = StorageSystem.load(player);
    if (hasSave) {
        console.log("Đã tải tiến trình tu tiên thành công!");
    } else {
        console.log("Bắt đầu cuộc hành trình tu tiên mới!");
    }

    // 3. Khởi tạo hiệu ứng hạt linh quang
    const particles = new ParticleSystem("canvas-vfx");
    particles.start();

    // 4. Khởi tạo bộ máy âm thanh
    const sound = window.soundEngine || new SoundEngine();

    // 5. Khởi tạo cỗ máy chiến đấu 2D
    const combat = new CombatEngine(player, particles, sound);

    // 6. Khởi tạo bộ điều khiển giao diện UI
    const ui = new UIController(player, combat, particles, sound);
    window.gameUI = ui;
    window.gamePlayer = player;
    window.gameCombat = combat;

    ui.init();

    // 7. TÍNH TU VI TREO MÁY NGOẠI TUYẾN (OFFLINE AFK)
    if (hasSave && player.lastOnlineTime) {
        const now = Date.now();
        const offlineSec = Math.floor((now - player.lastOnlineTime) / 1000);
        // Nếu người chơi rời game trên 10 giây (giới hạn tối đa 24 giờ = 86,400 giây)
        if (offlineSec >= 10) {
            const cappedSec = Math.min(86400, offlineSec);
            const afkRate = RealmSystem.getAfkTuViRate(player.realmIndex, player.tierIndex);
            const offlineTuVi = cappedSec * afkRate;
            player.addTuVi(offlineTuVi);

            // Định dạng thời gian rời game
            let timeStr = "";
            if (cappedSec < 60) {
                timeStr = `${cappedSec} giây`;
            } else if (cappedSec < 3600) {
                const mins = Math.floor(cappedSec / 60);
                const secs = cappedSec % 60;
                timeStr = `${mins} phút ${secs > 0 ? secs + 's' : ''}`;
            } else {
                const hours = Math.floor(cappedSec / 3600);
                const mins = Math.floor((cappedSec % 3600) / 60);
                timeStr = `${hours} giờ ${mins > 0 ? mins + 'p' : ''}`;
            }

            setTimeout(() => {
                ui.showToast(`🧘‍♂️ Đạo hữu đả tọa ngoại tuyến [${timeStr}], nhận được +${ui.formatNumber(offlineTuVi)} Tu Vi!`, "breakthrough");
                ui.updateHeaderInfo();
                ui.renderCultivateTab();
            }, 800);
        }
        player.lastOnlineTime = now;
    }

    // 8. TƯƠNG TÁC NHẤP VÀO NHÂN VẬT ĐỂ ĐẢ TỌA NHANH (+TU VI)
    const avatarBox = document.getElementById("cultivate-avatar-box");
    if (avatarBox) {
        avatarBox.style.cursor = "pointer";
        avatarBox.title = "Nhấp liên tục để gia tốc đả tọa ngưng tụ tu vi!";
        avatarBox.addEventListener("click", (e) => {
            const afkRate = RealmSystem.getAfkTuViRate(player.realmIndex, player.tierIndex);
            player.addTuVi(afkRate);
            sound.playClick();
            
            const rect = avatarBox.getBoundingClientRect();
            particles.emitMeditationQi(
                rect.left + rect.width / 2, 
                rect.top + rect.height / 2, 
                RealmSystem.getRealmColor(player.realmIndex)
            );
            particles.addFloatingText(`+${afkRate} Tu Vi`, e.clientX || (rect.left + rect.width / 2), (e.clientY || rect.top) - 15, "#00cec9");

            ui.renderCultivateTab();
            ui.updateHeaderInfo();
        });
    }

    // 9. VÒNG LẶP ĐẢ TỌA TU VI TỰ ĐỘNG (AFK ONLINE CÓ DELTA-TIME CHỐNG LAG/THROTTLING)
    let lastTick = Date.now();
    setInterval(() => {
        const now = Date.now();
        // Tính số giây thực tế trôi qua (bảo toàn tu vi kể cả khi tab bị trình duyệt đưa vào nền)
        const elapsedSec = Math.max(1, Math.min(300, Math.floor((now - lastTick) / 1000)));
        lastTick = now;
        player.lastOnlineTime = now;

        const afkRate = RealmSystem.getAfkTuViRate(player.realmIndex, player.tierIndex);
        player.addTuVi(afkRate * elapsedSec);

        // Hiệu ứng hạt linh khí và cập nhật thanh tiến độ nếu đang ở tab nhân vật / động phủ
        if (ui.currentTab === "character" || ui.currentTab === "cultivate") {
            const avatarBox = document.getElementById("cultivate-avatar-box");
            if (avatarBox) {
                const rect = avatarBox.getBoundingClientRect();
                particles.emitMeditationQi(
                    rect.left + rect.width / 2, 
                    rect.top + rect.height / 2, 
                    RealmSystem.getRealmColor(player.realmIndex)
                );
            }
            ui.renderCultivateTab();
        }

        ui.updateHeaderInfo();
    }, 1000);

    // Bắt sự kiện khi người chơi chuyển tab quay lại game -> Ngay lập tức cập nhật tu vi
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            const now = Date.now();
            const elapsedSec = Math.floor((now - lastTick) / 1000);
            if (elapsedSec >= 2) {
                lastTick = now;
                player.lastOnlineTime = now;
                const afkRate = RealmSystem.getAfkTuViRate(player.realmIndex, player.tierIndex);
                player.addTuVi(afkRate * Math.min(3600, elapsedSec));
                ui.updateHeaderInfo();
                if (ui.currentTab === "character" || ui.currentTab === "cultivate") {
                    ui.renderCultivateTab();
                }
            }
        }
    });

    // 10. TỰ ĐỘNG LƯU TIẾN TRÌNH MỖI 5 GIÂY
    setInterval(() => {
        player.lastOnlineTime = Date.now();
        StorageSystem.save(player);
    }, 5000);

    // Thông báo chào mừng
    setTimeout(() => {
        ui.showToast(`Đạo hữu bước vào con đường nghịch thiên tu tiên! Cảnh giới hiện tại: ${player.getFullTitle()}`, "info");
    }, 500);
});
