# TIÊN ĐẠO TRƯỜNG SINH (KIEMTIEN 3.0)
### Trò Chơi Tu Tiên 2D Nhàn Rỗi (Idle RPG) • Nghịch Thiên Tu Đạo

---

## 📖 1. TỔNG QUAN DỰ ÁN

**Tiên Đạo Trường Sinh** (phiên bản Kiemtien 3.0) là một tựa game web RPG tu tiên nhàn rỗi (Idle RPG) được xây dựng hoàn toàn bằng công nghệ Web thuần túy (**HTML5, Vanilla CSS3, JavaScript ES6+**), **Zero-dependency** (không dùng npm, framework hay bundler bên thứ ba). Trò chơi có khả năng hoạt động tĩnh và offline 100%, sẵn sàng lưu trữ trực tiếp trên GitHub Pages.

Trò chơi mô phỏng trọn vẹn lộ trình tu chân nghịch thiên cải mệnh: từ một phàm nhân ngưng tụ Tôi Khí, khai phá Linh Hải, vượt qua cửu đại thiên kiếp, vượt Hư Không Tháp, lĩnh ngộ Đại Thần Thông tại Đài Cầu Đạo, thuần dưỡng Tam Đại Thần Thú Thượng Cổ, cho đến khi bước chân lên đỉnh cao nhất của vũ trụ - **Đại Đạo Chí Cao Vô Thượng** và thăng hoa vào **Cảnh Giới Vô Cực**.

### ✨ Điểm Nổi Bật Chính
* **Đồ Họa & Giao Diện Dark Fantasy Đa Nền Tảng**: Thiết kế hiện đại theo phong cách huyền huyễn Á Đông, tối ưu layout dashboard trực quan, hiệu ứng phát sáng Neon, viền kim loại và kính mờ (Glassmorphism). Hỗ trợ responsive toàn diện trên Điện thoại, Máy tính bảng (Tablet) và PC.
* **Kiến Trúc Module Hóa Chuẩn Mực**: Hệ thống mã nguồn được module hóa thành 13 phân hệ chuyên trách (`js/state/player-*.js` và `js/ui/tabs/ui-*.js`) mở rộng qua Prototype Pattern, giữ code luôn gọn gàng, mạch lạc, dễ bảo trì.
* **Hệ Thống Tam Đại Thần Thú Thượng Cổ (Pet System)**: Đồng hành cùng 3 linh thú tối thượng (Hộ Vệ Côn Bằng, Thần Thú Huyết Nguyệt, Chí Tôn Hỗn Độn) với 12 cảnh giới tu vi chuẩn xác, cơ chế nuôi dưỡng bằng đan dược và thần thông 12 cấp độ.
* **Đài Cầu Đạo & 6 Đại Thần Thông Trấn Thân (Gacha System)**: Hệ thống chiêu thức tối thượng tiêu hao Nộ Khí, cơ chế quay Tầm Đạo với tỷ lệ chuẩn và hệ thống Bảo Hiểm Hard Pity (100 lần Thánh Cấp, 500 lần Thần Thú), tự động ngưng tụ mảnh cơ duyên thành vé mới.
* **Hư Không Tháp Vô Hạn Tầng (Endless Tower)**: Chế độ khiêu chiến vô tận độc lập, thuật toán sinh quái động, cơ chế Cuồng Nộ (Enrage Timer 60s), tính năng Quét Tháp (Sweep) và Tự Động Leo Tháp liên tục (3s).
* **Cơ Chế Kim Thân & Phá Kim Thân Cho Boss**: Cân bằng sát thương đỉnh cao: Boss sở hữu lớp Kim Thân khóa trần sát thương nhận vào (10% HP), đòn Bạo Kích hoặc Kỹ Năng thần thông kích hoạt hiệu ứng `PHÁ KIM THÂN` nới trần lên 30% - 40% HP.
* **Bình Cảnh Ải 22 & Cảnh Giới Vô Cực (🌌 Tinh Nguyên Đại Đạo)**: Khi đạt Tầng 100 Đại Đạo Chí Cao, người chơi phải trảm Boss tại **[Ải 22: Hư Vô Bản Nguyên Cảnh]** để bước vào Cảnh Giới Vô Cực. Đơn vị tu vi chuyển sang **🌌 Tinh Nguyên** ($1 \text{ 🌌} = 1.000.000.000 \text{ Tu Vi}$), loại bỏ hoàn toàn nguy cơ tràn số học của JavaScript ($9 \times 10^{15}$).
* **Hệ Thống Tiền Tệ Kép & Tiệm Quy Đổi**: **💎 Linh Thạch** và **🌀 Hỗn Nguyên Thạch** ($1 \text{ 🌀} = 1.000.000.000 \text{ 💎}$) tích hợp tiệm quy đổi 2 chiều và tính năng nén toàn bộ linh thạch chỉ với 1 chạm.
* **Bộ Máy Âm Thanh & Hạt VFX Thuần Web**: Tổng hợp âm thanh procedural bằng **Web Audio API** (không cần file âm thanh ngoài) kết hợp hệ thống **Canvas Particle VFX** cho linh khí, kiếm khí, sấm sét và số sát thương nảy động.
* **Tự Động Hóa & Tiện Ích Cao Cấp**: Tự động đánh lặp ải (Auto-Repeat), tùy chọn tốc độ trận đấu (x1, x2, x3), mua tối đa đan dược (Mua Hết), bán nhanh toàn bộ trang bị trùng lặp (Bán Đồ Trùng), dùng hết đan dược, treo máy AFK nhận tu vi offline lên đến 24h.
* **Bộ Kiểm Thử Tự Động Zero-Dependency**: Tích hợp sẵn bộ test runner thuần JS chạy qua Node.js (`scratch/run-all-tests.js`) với **18/18 tests** kiểm soát chặt chẽ toàn bộ logic và công thức game.

---

## 📁 2. CẤU TRÚC THƯ MỤC & MÃ NGUỒN

Dự án áp dụng kiến trúc tách lớp rõ ràng: Dữ Liệu (`data`) $\to$ Động Cơ (`engine`) $\to$ Trạng Thái (`state`) $\to$ Giao Diện (`ui`):

```
d:/HOCTAP/TuDo/Kiemtien/
├── css/
│   ├── main.css                  # Design Tokens, layout nền, typography, reset CSS
│   ├── components.css            # UI components: dashboard, túi đồ, tàng kinh các, tháp, gacha, linh thú, modal
│   └── combat.css                # Giao diện sàn đấu 2D, thanh máu/khiên động, enrage bar, nút tốc độ x1-x3
├── js/
│   ├── data/
│   │   ├── realms.js             # Dữ liệu 12 đại cảnh giới, công thức tu vi, tốc độ AFK, điều kiện vượt ải
│   │   ├── skills.js             # Dữ liệu bí kíp kỹ năng (Vật lí, Phép, Hộ thể, Trị liệu, Đốt máu cực đạo)
│   │   ├── skills_ultimate.js    # Dữ liệu 6 Đại Thần Thông trấn thân, tiêu hao Nộ Khí, phẩm cấp & mô tả
│   │   ├── items.js              # Dữ liệu trang bị (Nón, Giáp, Vũ khí), đan dược, Lệnh Bài Hư Không, 7 bậc phẩm cấp
│   │   ├── titles.js             # Dữ liệu danh hiệu (Trảm Boss, Lĩnh Ngộ, Phê Cỏ...), điều kiện và buff stats
│   │   ├── stages.js             # Dữ liệu 23 Ải cốt truyện (từ Ải 1 Thảo Dược Viên đến Ải 23 Vấn Thiên Địa)
│   │   ├── tower.js              # Hệ thống Hư Không Tháp: thuật toán sinh quái động, Enrage Timer, Quét Tháp
│   │   └── pets.js               # Dữ liệu Tam Đại Thần Thú, 12 cảnh giới thú, nội tại, thần thông 12 cấp độ
│   ├── engine/
│   │   ├── audio.js              # Bộ máy tổng hợp âm thanh procedural qua Web Audio API Synth
│   │   ├── particles.js          # Canvas particle VFX: linh khí, kiếm khí, sấm sét, phá kim thân, nảy số sát thương
│   │   ├── combat.js             # Bộ máy điều khiển chiến đấu 2D: sát thương, nộ khí, kim thân, phá kim thân, tốc độ x1-x3
│   │   └── storage.js            # Lưu trữ LocalStorage, xuất/nhập mã sao lưu Base64, auto-save, auto-migration
│   ├── state/
│   │   ├── player.js             # Base Class Player: constructor, schema, serialization toJSON/fromJSON
│   │   ├── player-stats.js       # Phân hệ điểm tiềm năng & công thức tính chỉ số chiến đấu
│   │   ├── player-breakthrough.js# Phân hệ tu vi, tinh nguyên, tỉ lệ độ kiếp, cổng bình cảnh Ải 22/23 & đột phá
│   │   ├── player-inventory.js   # Phân hệ túi đồ, trang bị, học chiêu, dùng/bán đồ, mua max đan, bán đồ trùng
│   │   ├── player-tower-gacha.js # Phân hệ vé Hư Không Tháp, Đài Cầu Đạo, Pity Tracker & roll Gacha
│   │   └── player-pet.js         # Phân hệ Tam Đại Thần Thú: xuất trận, bồi dưỡng tu vi, đột phá & thăng cấp chiêu
│   ├── ui/
│   │   ├── ui.js                 # UIController Core: điều phối tab, header, toast popups, tooltip động
│   │   └── tabs/
│   │       ├── ui-cultivate.js   # Tab Tu Luyện & Đột Phá cảnh giới
│   │       ├── ui-character.js   # Tab Nhân Vật, Túi Đồ, Bán Nhanh Đồ Trùng, Đổi Tên, Danh Hiệu
│   │       ├── ui-stages.js      # Tab Phó Bản, Sàn Đấu 2D, Tự Động Lặp Ải, Tốc Độ Đấu
│   │       ├── ui-tower.js       # Tab Hư Không Tháp, Mua Vé, Tự Động Leo & Quét Tháp
│   │       ├── ui-skills.js      # Tab Tàng Kinh Các & Gán Kỹ Năng
│   │       ├── ui-shop.js        # Tab Bách Bảo Các, Mua Hết Đan & Tiệm Đổi Hỗn Nguyên Thạch
│   │       ├── ui-gacha.js       # Tab Đài Cầu Đạo, Rút Gacha & Hiệu Ứng Mở Thần Thông
│   │       └── ui-pets.js        # Tab Tam Đại Thần Thú, Bồi Dưỡng Tu Vi, Thăng Cấp Thần Thông
│   └── app.js                    # Khởi động ứng dụng, nạp controller, vòng lặp AFK online/offline
├── scratch/
│   └── run-all-tests.js          # Bộ kiểm thử tự động toàn diện (18/18 tests qua 8 suites)
├── index.html                    # Cấu trúc DOM chính của ứng dụng
├── server.js                     # Máy chủ HTTP Node.js tĩnh phục vụ chạy cục bộ
├── start_game.bat                # Phím tắt khởi chạy game nhanh trên Windows
├── README.md                     # Bản tóm tắt dự án chuẩn mực
└── PROJECT_SUMMARY.md            # Tài liệu tổng hợp kiến trúc kỹ thuật chuyên sâu
```

---

## 🌌 3. HỆ THỐNG CẢNH GIỚI, BÌNH CẢNH & CẢNH GIỚI VÔ CỰC

### 12 Đại Cảnh Giới Cốt Truyện

| STT | Tên Cảnh Giới | Chữ Hán | Màu Nhận Diện | Điều Kiện Thăng Đại Cảnh Giới | Tốc Độ AFK Cơ Bản |
|:---:|:---|:---:|:---:|:---|:---:|
| 1 | **Tôi Khí** | 淬气 | `#a3b899` | Tích lũy đủ Tu Vi Tầng Đỉnh Phong | +2 Tu Vi/s |
| 2 | **Ngưng Khí** | 凝气 | `#4ecca3` | Tích lũy đủ Tu Vi Tầng Đỉnh Phong | +5 Tu Vi/s |
| 3 | **Linh Hải** | 灵海 | `#00adb5` | Tích lũy đủ Tu Vi Tầng Đỉnh Phong | +12 Tu Vi/s |
| 4 | **Tạo Đảo** | 造岛 | `#3f72af` | Tích lũy đủ Tu Vi Tầng Đỉnh Phong | +30 Tu Vi/s |
| 5 | **Nguyên Linh Thụ** | 元灵树 | `#16c79a` | Tích lũy đủ Tu Vi Tầng Đỉnh Phong | +75 Tu Vi/s |
| 6 | **Tạo Hóa Đài** | 造化台 | `#f39c12` | Tích lũy đủ Tu Vi Tầng Đỉnh Phong | +180 Tu Vi/s |
| 7 | **Thông Thiên Trụ** | 通天柱 | `#e056fd` | Tích lũy đủ Tu Vi Tầng Đỉnh Phong | +450 Tu Vi/s |
| 8 | **Ngọc Điện** | 玉殿 | `#f1c40f` | Tích lũy đủ Tu Vi Tầng Đỉnh Phong | +1,200 Tu Vi/s |
| 9 | **Đỉnh Cấp Ngai** | 顶级王座 | `#e74c3c` | **Buộc phải đánh bại Ải 17: Vấn Đạo** | +3,000 Tu Vi/s |
| 10 | **Vô Thượng Lộ** | 无上路 | `#ff007f` | **Buộc phải đánh bại Ải 18: Tinh Hà Thần Điện** | +8,000 Tu Vi/s |
| 11 | **Vạn Vì Tinh Tú** | 万辰星宿 | `#00f2fe` | **Buộc phải đánh bại Ải 19: Đại Đạo Thần Cung** | +25,000 Tu Vi/s |
| 12 | **Đại Đạo Chí Cao Vô Thượng** | 至高无上大道 | `#ffd700` | **Đạt Tầng 100 & Trảm Boss Ải 22** | +100,000 Tu Vi/s |

### ⚙️ Bình Cảnh Ải 22, Ải 23 & Cảnh Giới Vô Cực
1. **Từ Tôi Khí đến Ngọc Điện (Cảnh giới 1 - 8)**: Gồm 10 tầng chuẩn (Tầng 1 ➔ Tầng 9 ➔ Đỉnh Phong).
2. **Từ Đỉnh Cấp Ngai trở lên**: Tầng tu vi tăng trưởng vô hạn (`Tầng 11, 12... 100+`), mỗi lần thăng tầng nhận đúng **+4 Điểm Tiềm Năng**.
3. **Bình Cảnh Tầng 100 Đại Đạo Chí Cao (Ải 22)**:
   - Khi đạt Tầng 100, nút đột phá bị khóa bởi Bình Cảnh Tối Cao.
   - Bắt buộc phải đánh bại **Boss Hư Vô Bản Nguyên tại [Ải 22: Hư Vô Bản Nguyên Cảnh]**.
   - Sau khi thắng Ải 22, người chơi đột phá mở khóa **🌌 CẢNH GIỚI VÔ CỰC** (`isVoCuc = true`), bước lên **Tầng 101 Vô Cực**.
4. **Cơ Chế Tinh Nguyên Đại Đạo (Chống Tràn Số Học)**:
   - Toàn bộ tu vi ở Cảnh Giới Vô Cực được tích lũy theo tỷ lệ:
     $$1 \text{ 🌌 Tinh Nguyên Đại Đạo} = 1.000.000.000 \text{ Tu Vi}$$
   - Mọi nguồn nhận tu vi (đan dược, quét tháp, thắng trận, AFK) đều tự động gom tích lũy đủ 1 Tỷ Tu Vi để ngưng tụ thành 1 Tinh Nguyên, đảm bảo số học luôn nằm trong ngưỡng an toàn tuyệt đối.
5. **Bình Cảnh Ải 23 (Vấn Thiên Địa)**:
   - Cứ mỗi chu kỳ **100 tầng trong Cảnh Giới Vô Cực** (Tầng 200, 300, 400...), người chơi chạm phải Bình Cảnh Thiên Địa.
   - Bắt buộc phải khiêu chiến vượt qua **[Ải 23: Vấn Thiên Địa]** mới có thể tiếp tục đột phá các tầng tiếp theo.

---

## 🐾 4. HỆ THỐNG TAM ĐẠI THẦN THÚ THƯỢNG CỔ (PET SYSTEM)

Người chơi có thể triệu hoán và xuất trận 1 Thần Thú để đồng hành trong mọi trận chiến (Phó bản & Hư Không Tháp):

### 3 Thần Thú Thượng Cổ

| Thần Thú | Vai Trò | Hệ | Nội Tại Vĩnh Cửu | Thần Thông Trợ Chiến |
|---|:---:|:---:|---|---|
| **Hộ Vệ Côn Bằng** (`pet_tank`) | 🛡️ Hộ Vệ / Đỡ Đòn | Lôi Đình | **Kình Lôi Bất Diệt**: Phản lại sát thương bằng $10\% - 30\%$ công kích nhận vào. | **Bát Hoang Cương Khí**: Tạo khiên hộ thể tương đương **200% HP Thần Thú** bảo vệ chủ nhân. |
| **Thần Thú Huyết Nguyệt** (`pet_dps`) | ⚔️ Trảm Boss / DPS | Huyết Ám | **Huyết Nguyệt Chi Nhãn**: Toàn bộ sát thương của Thần Thú là **Sát Thương Chuẩn 100%**, bỏ qua giáp và lớp Kim Thân. | **Thôn Phệ Tinh Huyết**: Tước đoạt trực tiếp **$1\% - 6\%$ Máu Tối Đa** của Boss mỗi nhịp hồi chiêu. |
| **Chí Tôn Hỗn Độn** (`pet_buff`) | 👑 Cường Hóa / Hỗ Trợ | Hỗn Độn | **Hỗn Độn Đồng Thể**: Tăng vĩnh viễn **+100% Tổng Sát Thương (x2)** cho chủ nhân khi xuất trận. | **Đại Đạo Cuồng Nộ**: Kích hoạt trạng thái cuồng bạo, tăng **10x tốc độ đánh** và cho phép đòn đánh của chủ nhân xuyên qua Kim Thân. |

### 12 Cảnh Giới Thần Thú
Cảnh giới Thần Thú được đồng bộ hoàn toàn với 12 Cảnh Giới của người chơi:
1. Tôi Khí Cảnh (Cần 500 Tu Vi)
2. Ngưng Khí Cảnh (Cần 3.000 Tu Vi)
3. Linh Hải Cảnh (Cần 20.000 Tu Vi)
4. Tạo Đảo Cảnh (Cần 150.000 Tu Vi)
5. Nguyên Linh Thụ (Cần 1.000.000 Tu Vi)
6. Tạo Hóa Đài (Cần 8.000.000 Tu Vi)
7. Thông Thiên Trụ (Cần 60.000.000 Tu Vi)
8. Ngọc Điện Cảnh (Cần 500.000.000 Tu Vi)
9. Đỉnh Cấp Ngai (Cần 4 Tỷ Tu Vi)
10. Vô Thượng Lộ (Cần 30 Tỷ Tu Vi)
11. Vạn Vì Tinh Tú (Cần 200 Tỷ Tu Vi)
12. Đại Đạo Chí Cao Vô Thượng (Cần 1.500 Tỷ Tu Vi)

### Cơ Chế Bồi Dưỡng & Nâng Cấp Thần Thông 12 Cấp
* **Nuôi Dưỡng Tu Vi**: Cho Thần Thú ăn các loại đan dược tu luyện có trong túi đồ (hỗ trợ nút **Nuôi Tất Cả (Max)**).
* **Nâng Cấp Thần Thông (Cấp 1 $\to$ 12)**: Yêu cầu đạt Cảnh Giới Thần Thú tương ứng, tích lũy **Mảnh Thú Hồn** (từ Đài Cầu Đạo), Linh Thạch/Hỗn Nguyên Thạch và Đan dược dược dẫn mốc (Đại Tụ Khí Đan, Ngọc Linh Đan, Tiên Linh Đan, Cửu Diệu Bất Tử Dược, Cửu Chuyển Thánh Đan, Vĩnh Hằng Thánh Đan, Cửu Diệu Thần Tinh Đan, Đại Đạo Khởi Nguyên Đan).

---

## 🔮 5. ĐÀI CẦU ĐẠO & 6 ĐẠI THẦN THÔNG TRẤN THÂN (GACHA)

### Cơ Chế Nộ Khí Trong Chiến Đấu
Nhân vật tích lũy Nộ Khí khi tham chiến (tối đa 100 điểm):
* Tấn công thường: **+4 Nộ**
* Thi triển kỹ năng thông thường: **+20 Nộ**
* Khi nhận sát thương từ đối thủ: **+4 Nộ**
* Khi đạt đủ Nộ Khí, Đại Thần Thông trấn thân sẽ tự động hoặc cho phép kích hoạt đòn đánh hủy thiên diệt địa.

### Danh Sách 6 Đại Thần Thông

| Thần Thông | Phẩm Cấp | Tiêu Hao | Hiệu Quả Chiến Đấu |
|---|:---:|:---:|---|
| **Nhất Niệm Tiêu Dao** | 🌟 Thần Cấp | 100 Nộ | Chém ra kiếm khí hư vô, đánh sụp **80% Máu Hiện Tại** của Boss, **bỏ qua hoàn toàn Giáp & Kim Thân**. |
| **Tuế Nguyệt Quy Linh** | 🌟 Thần Cấp | 80 Nộ | Nghịch chuyển thời gian, lập tức **hồi chiêu toàn bộ 3 kỹ năng chủ động** ngay trong tích tắc. |
| **Ý Chí Bất Tận** | 🌟 Thần Cấp | 90 Nộ | Vung cự kiếm hủy diệt gây **8.000% Sát Thương Vật Lí**, xuyên qua toàn bộ khiên chắn đánh thẳng vào sinh mệnh đối thủ. |
| **Vô Tổn Thể** | ⚡ Thánh Cấp | 70 Nộ | Ngưng tụ thiên đạo cương khí, tạo khiên chắn tương đương **150% Máu Tối Đa** của đạo thân. |
| **Bất Kham Nhập Thể** | ⚡ Thánh Cấp | 60 Nộ | Cố định sát thương nhận vào: Trong 8 giây, mọi đòn tấn công của đối thủ chỉ có thể gây tối đa **5% Máu Tối Đa** của người chơi. |
| **Huyết Tế Cuồng Loạn** | ⚡ Thánh Cấp | 75 Nộ | Tự trừ 50% máu hiện tại để bộc phát đòn đánh cuồng nộ gây **5.000% Sát Thương Phép Xuyên Kim Thân**. |

### Tỷ Lệ Rút Thưởng & Cơ Chế Bảo Hiểm (Hard Pity)
* **Tỷ lệ cơ sở**:
  * 🌟 **Thần Cấp (0.2%)**: Tam Đại Thần Thú Thượng Cổ & Đại Thần Thông Thần Cấp.
  * ⚡ **Thánh Cấp (2.0%)**: Đại Thần Thông Thánh Cấp.
  * 💠 **Linh Cấp (97.8%)**: Đan dược cao cấp, linh tài quý hiếm.
* **Bảo Hiểm Hard Pity**:
  * Đạt **100 lượt quay** chưa có Thánh Cấp: Lần thứ 100 **chắc chắn nhận Đại Thần Thông Thánh Cấp**.
  * Đạt **500 lượt quay** chưa có Thần Cấp: Lần thứ 500 **chắc chắn nhận Thần Thú Thượng Cổ hoặc Thần Thông Thần Cấp**.
* **Ngưng Tụ Mảnh Cơ Duyên**: Rút trùng Đại Thần Thông tự động quy đổi thành **Mảnh Cơ Duyên**. Cứ tích lũy **10 Mảnh** sẽ tự động ngưng tụ thành **1 Vé Tầm Đạo** mới!

---

## 🗼 6. HƯ KHÔNG THÁP (ENDLESS TOWER)

* **Khiêu Chiến Vô Tận**: Chế độ leo tháp độc lập không giới hạn số tầng với thuật toán sinh quái động tăng dần theo cấp số nhân.
* **Cơ Chế Cuồng Nộ (Enrage Timer 60s)**: Người chơi có 60 giây để hạ gục Hư Không Thủ Hộ Giả. Khi hết thời gian, quái vật sẽ cuồng bạo tăng 1.000% sát thương.
* **Vé Khiêu Chiến & Mua Vé**: Mỗi ngày tặng miễn phí vé leo tháp; người chơi có thể mua thêm Lệnh Bài Hư Không không giới hạn với giá 5.000 🌀 Hỗn Nguyên Thạch/vé.
* **Quét Tháp (Sweep)**: Sau khi qua ngày mới, nhấn **Quét Nhanh** để lập tức nhận toàn bộ tài nguyên (Tu Vi/Tinh Nguyên, Linh Thạch, Hỗn Nguyên Thạch) từ Tầng 1 đến tầng cao nhất từng vượt qua.
* **Tự Động Leo Tháp (Auto-Climb 3s)**: Tự động đếm ngược 3 giây và khiêu chiến tầng tiếp theo sau mỗi trận thắng.
* **Thưởng Vé Tầm Đạo**: Cứ mỗi mốc **50 tầng tháp** (Tầng 50, 100, 150...) thưởng thẳng Vé Tầm Đạo nạp vào Đài Cầu Đạo.

---

## 🗺️ 7. DANH SÁCH 23 ẢI CỐT TRUYỆN & CƠ CHẾ KIM THÂN

### Cơ Chế Kim Thân Boss & Phá Kim Thân
* Mọi Boss từ Ải 15 trở lên đều sở hữu nội tại **Kim Thân Hộ Thể**: Giới hạn sát thương tối đa nhận vào từ mỗi đòn đánh thường không vượt quá **10% HP tối đa của Boss**.
* **Kích Hoạt Phá Kim Thân**: Khi nhân vật tung đòn **Bạo Kích (Chí mạng)** hoặc thi triển **Kỹ Năng Bí Kíp**, đòn đánh sẽ phá vỡ kết cấu kim thân, mở rộng ngưỡng trần sát thương lên tới **30% - 40% HP của Boss**, tạo điều kiện cho các lối build bạo kích dồn damage kết liễu nhanh.

### Danh Sách 23 Ải Cốt Truyện

| Ải | Tên Ải | Khu Vực | Boss / Quái Vật 👑 | HP Boss | Phần Thưởng Chính |
|:---:|:---|:---|:---|:---:|:---|
| 1 | Thảo Dược Viên Ngoại Vi | Thanh Vân Ngoại Vi | Linh Thảo Thỏ Yêu | 220 | 35 Tu Vi • 15 Linh Thạch |
| 2 | Bích Lạc Khê Cốc | Thanh Vân Ngoại Vi | Hắc Thủy Xà | 550 | 90 Tu Vi • 35 Linh Thạch |
| 3 | Hắc Sa Động Phủ | Thanh Vân Ngoại Vi | Cuồng Bạo Ma Hùng 👑 | 1,400 | 220 Tu Vi • 80 Linh Thạch |
| 4 | Phong Lôi Lãm Nhai | Thanh Vân Ngoại Vi | Thiết Vũ Điêu Vương 👑 | 3,200 | 500 Tu Vi • 180 Linh Thạch |
| 5 | Tử Trúc Lâm Uyên | U Minh Cốc | U Minh Lang Vực | 6,500 | 1,100 Tu Vi • 400 Linh Thạch |
| 6 | Hỏa Vân Động | U Minh Cốc | Xích Diễm Ma Viên 👑 | 15,000 | 2,400 Tu Vi • 900 Linh Thạch |
| 7 | Vạn Thú Tế Đàn | U Minh Cốc | Huyết Lân Cự Mãng 👑 | 35,000 | 5,500 Tu Vi • 2,000 Linh Thạch |
| 8 | Bích Hải Triều Sinh | Vô Tận Linh Hải | Thủy Tinh Cự Hạt | 85,000 | 12,000 Tu Vi • 4,500 Linh Thạch |
| 9 | Đoạn Long Thủy Phủ | Vô Tận Linh Hải | Hắc Thủy Bát Đầu Giao 👑 | 300,000 | 45,000 Tu Vi • 15,000 Linh Thạch |
| 10 | Phù Không Cổ Đảo | Cổ Đảo Bí Cảnh | Cổ Giáp Nham Thạch Thú | 850,000 | 120k Tu Vi • 45k Linh Thạch |
| 11 | Trấn Ma Phong Ấn | Cổ Đảo Bí Cảnh | Viễn Cổ Ma Thần Tàn Hồn 👑 | 2.8 Tr | 350k Tu Vi • 150k Linh Thạch |
| 12 | Thần Mộc Sâm Lâm | Nguyên Linh Cấm Địa | Huyết Đằng Yêu Thụ 👑 | 10 Tr | 1.2 Tr Tu Vi • 500k Linh Thạch |
| 13 | Lôi Đình Tế Đàn | Tạo Hóa Tiên Cảnh | Diệt Thế Cửu Thiên Lôi Thú 👑 | 35 Tr | 4.5 Tr Tu Vi • 1.8 Tr Linh Thạch |
| 14 | Thông Thiên Đỉnh | Thông Thiên Cực Cảnh | Kình Thiên Thần Tướng 👑 | 140 Tr | 18 Tr Tu Vi • 7 Tr Linh Thạch |
| 15 | Bạch Ngọc Tiên Cung | Cửu Tiêu Ngọc Điện | Ngọc Hư Chiến Thần 👑 *(Kim Thân)* | 600 Tr | 75 Tr Tu Vi • 30 Tr Linh Thạch |
| 16 | Cửu Trọng Ngai Vàng | Đỉnh Cấp Tiên Giới | Hỗn Độn Chúa Tể 👑 *(Kim Thân)* | 3.5 Tỷ | 350 Tr Tu Vi • 150 Tr Linh Thạch |
| 17 | **Vấn Đạo** | **Thiên Ngoại Hư Không** | **Hóa Thân Vấn Đạo 👑** | **100 Tỷ** | **100 Tr Tu Vi • 1 Tỷ Linh Thạch** |
| 18 | **Tinh Hà Thần Điện** | **Vô Thượng Tinh Vực** | **Tinh Hà Thần Long 👑** | **500 Tỷ** | **500 Tr Tu Vi • 5 Tỷ Linh Thạch** |
| 19 | **Đại Đạo Thần Cung** | **Chí Cao Vĩnh Hằng** | **Hư Vô Thần Đế 👑** | **2.500 Tỷ** | **2 Tỷ Tu Vi • 25 Tỷ Linh Thạch** |
| 20 | **Vấn Đạo Độ Kiếp** | **Hỗn Độn Cực Cảnh** | **Hóa Thân Thiên Kiếp 👑** | **15.000 Tỷ** | **10 Tỷ Tu Vi • 100 Tỷ Linh Thạch** |
| 21 | **Hỗn Độn Thần Ma** | **Hỗn Độn Thâm Uyên** | **Hỗn Độn Cổ Ma 👑** | **100.000 Tỷ** | **50 Tỷ Tu Vi • 500 Tỷ Linh Thạch** |
| 22 | **Hư Vô Bản Nguyên** | **Căn Nguyên Vũ Trụ** | **Hư Vô Bản Nguyên 👑 (Mở Vô Cực)** | **1 Triệu Tỷ** | **100 🌌 Tinh Nguyên • 10.000 🌀 Hỗn Nguyên** |
| 23 | **Vấn Thiên Địa** | **Vô Cực Cực Đạo** | **Ý Chí Thiên Địa 👑 (Mỗi 100 Tầng)** | **Scale Động** | **Tinh Nguyên & Hỗn Nguyên Khổng Lồ** |

---

## 🧪 8. HƯỚNG DẪN KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST SUITE)

Dự án sở hữu bộ test runner trung tâm viết bằng JavaScript thuần, chạy trực tiếp trên Node.js mà **không cần cài đặt bất kỳ thư viện ngoài nào**:

```powershell
# Chạy toàn bộ 18 bài kiểm thử qua 8 Suites
node scratch/run-all-tests.js
```

### 8 Suites Kiểm Thử Trọng Yếu:
1. **Suite 1: Chỉ Số Nhân Vật & Điểm Tiềm Năng**: Khởi tạo chuẩn, phân bổ điểm, trang bị nón/giáp/vũ khí, tẩy tủy đan.
2. **Suite 2: Điều Kiện Đột Phá & Bình Cảnh (Gates)**: Kiểm tra chặn Ải 22 ở Tầng 100 Đại Đạo Chí Cao và Ải 23 định kỳ mỗi 100 tầng Vô Cực.
3. **Suite 3: Chuẩn Hóa Hợp Đồng Trả Về**: Loại bỏ hoàn toàn bare `false`, `breakthrough()` luôn trả về object tường minh, `quickBreakthrough()` dừng minh bạch.
4. **Suite 4: Tỉ Lệ Độ Kiếp & Khấu Trừ Thất Bại**: Tỉ lệ giảm dần theo tầng và buff từ đan dược.
5. **Suite 5: Sát Thương & Trần Kim Thân Boss**: Khóa trần 10% HP và phá Kim Thân với đòn bạo kích.
6. **Suite 6: Tam Đại Thần Thú & 12 Cảnh Giới**: Đồng bộ 12 cảnh giới tu vi, tăng trưởng chỉ số và giới hạn Cảnh Giới 11.
7. **Suite 7: Lưu Trữ, Tương Thích Ngược & Tinh Nguyên**: Tích lũy 1 Tỷ Tu Vi = 1 Tinh Nguyên, auto-migration nạp save cũ an toàn.
8. **Suite 8: Kiến Trúc Module Hóa**: Kiểm tra tính toàn vẹn của 5 domain module `Player` và 8 tab module `UIController` (103/103 methods nguyên vẹn).

---

## 🚀 9. HƯỚNG DẪN KHỞI CHẠY GAME

### Cách 1: Chạy Trực Tiếp (Khuyến nghị cho người chơi)
1. Mở thư mục dự án `d:/HOCTAP/TuDo/Kiemtien/`.
2. Nhấp đúp chuột vào file **`start_game.bat`** (hoặc mở trực tiếp file **`index.html`** trên trình duyệt Chrome, Edge, Brave, Firefox).
3. Thưởng thức game ngay lập tức mà không cần kết nối mạng hay cài đặt bất cứ phần mềm nào!

### Cách 2: Chạy Qua Máy Chủ Node.js Tĩnh (Khuyến nghị cho lập trình viên)
```powershell
cd d:\HOCTAP\TuDo\Kiemtien
node server.js
# Mở trình duyệt truy cập: http://127.0.0.1:3000
```

---

*Chúc các vị đạo hữu sớm đắc đạo phi thăng, thống ngự Tam Đại Thần Thú, chém rách Hư Không Tháp, bước chân lên Cảnh Giới Vô Cực Vĩnh Hằng!*
