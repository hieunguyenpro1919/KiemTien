# TIÊN ĐẠO TRƯỜNG SINH (KIEMTIEN 3.0)
### Tài Liệu Tổng Hợp Kiến Trúc Kỹ Thuật & Thiết Kế Trò Chơi Toàn Diện

---

## 📖 1. TỔNG QUAN DỰ ÁN

**Tiên Đạo Trường Sinh** (phiên bản Kiemtien 3.0) là một tựa game web RPG tu tiên nhàn rỗi (Idle RPG) được xây dựng hoàn toàn bằng công nghệ Web thuần túy (**HTML5, Vanilla CSS3, JavaScript ES6+**), **Zero-dependency** (không cài đặt bất kỳ thư viện, npm package hay bundler bên thứ ba nào). Toàn bộ dự án có thể chạy trực tiếp khi mở file `index.html` hoặc triển khai tĩnh trên GitHub Pages.

Trò chơi mô phỏng trọn vẹn lộ trình tu chân nghịch thiên cải mệnh: từ một phàm nhân ngưng tụ Tôi Khí, khai phá Linh Hải, vượt qua cửu đại thiên kiếp, vượt Hư Không Tháp, lĩnh ngộ Đại Thần Thông tại Đài Cầu Đạo, thuần dưỡng Tam Đại Thần Thú Thượng Cổ, cho đến khi bước chân lên đỉnh cao nhất của vũ trụ - **Đại Đạo Chí Cao Vô Thượng** và thăng hoa vào **Cảnh Giới Vô Cực**.

### ✨ Điểm Nổi Bật Chính
* **Đồ Họa & Giao Diện Dark Fantasy Đa Nền Tảng**: Thiết kế hiện đại theo phong cách huyền huyễn Á Đông, tối ưu một màn hình dashboard trực quan, hiệu ứng phát sáng Neon, viền kim loại và kính mờ (Glassmorphism). Hỗ trợ responsive toàn diện trên Điện thoại, Máy tính bảng (Tablet) mà vẫn bảo lưu 100% giao diện PC gốc.
* **Kiến Trúc Module Hóa Chuẩn Mực (Giai Đoạn 2)**: Toàn bộ hai khối mã nguồn khổng lồ (`player.js` và `ui.js`) với hơn 6.500 dòng code đã được bóc tách thành **13 module đơn nhiệm** theo mẫu thiết kế Prototype Extension (`Player.prototype` & `UIController.prototype`), đạt tính mạch lạc, dễ mở rộng và tương thích kép (Browser + Node.js test runner).
* **Hệ Thống Tam Đại Thần Thú Thượng Cổ (Pet System)**: Đồng hành cùng 3 linh thú tối thượng (Hộ Vệ Côn Bằng, Thần Thú Huyết Nguyệt, Chí Tôn Hỗn Độn) với 12 cảnh giới tu vi chuẩn xác, cơ chế nuôi dưỡng bằng đan dược và thần thông 12 cấp độ.
* **Đài Cầu Đạo & 6 Đại Thần Thông Trấn Thân (Gacha System)**: Hệ thống chiêu thức tối thượng tiêu hao Nộ Khí, cơ chế quay Tầm Đạo với tỷ lệ chuẩn và hệ thống Bảo Hiểm Hard Pity (100 lần Thánh Cấp, 500 lần Thần Thú), tự động ngưng tụ mảnh cơ duyên thành vé mới.
* **Hư Không Tháp Vô Hạn Tầng (Endless Tower)**: Chế độ khiêu chiến vô tận độc lập, thuật toán sinh quái động, cơ chế Cuồng Nộ (Enrage Timer 60s), tính năng Quét Tháp (Sweep) và Tự Động Leo Tháp liên tục (3s).
* **Cơ Chế Kim Thân & Phá Kim Thân Cho Boss**: Cân bằng sát thương đỉnh cao: Boss sở hữu lớp Kim Thân khóa trần sát thương nhận vào (10% HP), đòn Bạo Kích hoặc Kỹ Năng thần thông kích hoạt hiệu ứng `PHÁ KIM THÂN` nới trần lên 30% - 40% HP.
* **Bình Cảnh Ải 22, Ải 23 & Cảnh Giới Vô Cực (🌌 Tinh Nguyên Đại Đạo)**: Khi đạt Tầng 100 Đại Đạo Chí Cao, người chơi phải trảm Boss tại **[Ải 22: Hư Vô Bản Nguyên Cảnh]** để bước vào Cảnh Giới Vô Cực. Đơn vị tu vi chuyển sang **🌌 Tinh Nguyên** ($1 \text{ 🌌} = 1.000.000.000 \text{ Tu Vi}$), loại bỏ hoàn toàn nguy cơ tràn số học của JavaScript ($9 \times 10^{15}$).
* **Hệ Thống Tiền Tệ Kép & Tiệm Quy Đổi**: **💎 Linh Thạch** và **🌀 Hỗn Nguyên Thạch** ($1 \text{ 🌀} = 1.000.000.000 \text{ 💎}$) tích hợp tiệm quy đổi 2 chiều và tính năng nén toàn bộ linh thạch chỉ với 1 chạm.
* **Bộ Máy Âm Thanh & Hạt VFX Thuần Web**: Tổng hợp âm thanh procedural bằng **Web Audio API** (không cần file âm thanh ngoài) kết hợp hệ thống **Canvas Particle VFX** cho linh khí, kiếm khí, sấm sét và số sát thương nảy động.
* **Bộ Kiểm Thử Tự Động Zero-Dependency**: Tích hợp sẵn bộ test runner thuần JS chạy qua Node.js (`scratch/run-all-tests.js`) với **18/18 tests** kiểm soát chặt chẽ toàn bộ logic và công thức game.

---

## 📁 2. KIẾN TRÚC THƯ MỤC & MÃ NGUỒN MODULE HÓA (KIEMTIEN 3.0)

Sau đợt tái cấu trúc quy mô lớn ở Giai Đoạn 2, dự án sở hữu cấu trúc thư mục module hóa tối ưu:

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

## 🌌 3. HỆ THỐNG CẢNH GIỚI, ĐỘ KIẾP & CẢNH GIỚI VÔ CỰC (REALM SYSTEM)

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

### ⚙️ Quy Tắc Đột Phá, Bình Cảnh Ải 22 & Cảnh Giới Vô Cực
1. **Từ Tôi Khí đến Ngọc Điện (Cảnh giới 1 - 8)**: Gồm 10 tầng chuẩn (Tầng 1 ➔ Tầng 9 ➔ Đỉnh Phong).
2. **Từ Đỉnh Cấp Ngai trở lên**: Tầng tu vi tăng trưởng vô hạn (`Tầng 11, 12... 100+`), mỗi lần thăng tầng nhận đúng **+4 Điểm Tiềm Năng**.
3. **Bình Cảnh Tầng 100 Đại Đạo Chí Cao (Ải 22)**:
   - Khi đạt Tầng 100, nút đột phá bị khóa bởi Bình Cảnh Tối Cao.
   - Bắt buộc phải đánh bại **Boss Hư Vô Bản Nguyên tại [Ải 22: Hư Vô Bản Nguyên Cảnh]** (`stage_vo_cuc`).
   - Sau khi thắng Ải 22, người chơi đột phá mở khóa **🌌 CẢNH GIỚI VÔ CỰC** (`isVoCuc = true`), bước lên **Tầng 101 Vô Cực** (`tierIndex = 100`).
4. **Cơ Chế Tinh Nguyên Đại Đạo (Chống Tràn Số Học)**:
   - Toàn bộ tu vi ở Cảnh Giới Vô Cực được tích lũy theo tỷ lệ:
     $$1 \text{ 🌌 Tinh Nguyên Đại Đạo} = 1.000.000.000 \text{ Tu Vi}$$
   - Mọi nguồn nhận tu vi (đan dược, quét tháp, thắng trận, AFK) đều tự động gom tích lũy đủ 1 Tỷ Tu Vi để ngưng tụ thành 1 Tinh Nguyên, đảm bảo số học luôn nằm trong ngưỡng an toàn tuyệt đối.
5. **Bình Cảnh Ải 23 (Vấn Thiên Địa)**:
   - Cứ mỗi chu kỳ **100 tầng trong Cảnh Giới Vô Cực** (Tầng 200, 300, 400...), người chơi chạm phải Bình Cảnh Thiên Địa.
   - Bắt buộc phải khiêu chiến vượt qua **[Ải 23: Vấn Thiên Địa]** mới có thể tiếp tục đột phá các tầng tiếp theo.
6. **Cơ Chế Tỉ Lệ Độ Kiếp & Thất Bại Lôi Kiếp**:
   - **Cảnh Giới 0 - 8**: Mỗi tầng giảm -5% tỉ lệ thành công ($100\% \to 55\%$). Thăng cảnh giới mới hồi về 100%.
   - **Cảnh Giới 9 - 11**: Mỗi tầng giảm -0.5% ($100\% \to 50.5\%$). Chu kỳ 100 tầng hồi về 100%.
   - Thất bại bị chấn động đan điền (-20% tu vi của tầng) và ngắt Đột Phá Nhanh.
   - Dùng đan dược **Chứng Đạo Tinh Nguyên** (+10% vĩnh viễn) và **Luận Đạo Tinh Nguyên** (+1% đan dược) để tăng tỉ lệ.

---

## 🐾 4. HỆ THỐNG TAM ĐẠI THẦN THÚ THƯỢNG CỔ (PET SYSTEM)

Hệ thống Thần Thú được tích hợp trực tiếp vào chiến đấu 2D, hỗ trợ người chơi vượt qua các thử thách cam go nhất:

### Chi Tiết Tam Đại Thần Thú

| Thần Thú | Phẩm Cấp | Nguyên Tố | Vai Trò | Nội Tại Vĩnh Cửu | Thần Thông Trợ Chiến |
|---|:---:|:---:|:---:|---|---|
| **Hộ Vệ Côn Bằng** (`pet_tank`) | 🌟 Thần Cấp | ⚡ Lôi Đình | 🛡️ Hộ Vệ / Đỡ Đòn | **Kình Lôi Bất Diệt**: Phản lại sát thương bằng $10\% - 30\%$ công kích nhận vào của kẻ địch. | **Bát Hoang Cương Khí**: Tạo khiên hộ thể tương đương **200% HP Thần Thú** bảo vệ chủ nhân. |
| **Thần Thú Huyết Nguyệt** (`pet_dps`) | 🌟 Thần Cấp | 🩸 Huyết Ám | ⚔️ Trảm Boss / DPS | **Huyết Nguyệt Chi Nhãn**: Toàn bộ sát thương của Thần Thú là **Sát Thương Chuẩn 100%**, bỏ qua giáp và lớp Kim Thân. | **Thôn Phệ Tinh Huyết**: Tước đoạt trực tiếp **$1\% - 6\%$ Máu Tối Đa** của Boss mỗi nhịp hồi chiêu. |
| **Chí Tôn Hỗn Độn** (`pet_buff`) | 🌟 Thần Cấp | 🌌 Hỗn Độn | 👑 Cường Hóa / Hỗ Trợ | **Hỗn Độn Đồng Thể**: Tăng vĩnh viễn **+100% Tổng Sát Thương (x2)** cho chủ nhân khi xuất trận. | **Đại Đạo Cuồng Nộ**: Kích hoạt trạng thái cuồng bạo, tăng **10x tốc độ đánh** và cho phép đòn đánh của chủ nhân xuyên qua Kim Thân. |

### Bảng 12 Cảnh Giới Thần Thú & Yêu Cầu Tu Vi
Cảnh giới của Thần Thú được đồng bộ hoàn toàn với 12 Cảnh Giới game:

| Cấp | Tên Cảnh Giới Thú | Tu Vi Yêu Cầu | Màu Nhận Diện |
|:---:|:---|:---:|:---:|
| 0 | Tôi Khí Cảnh | 500 Tu Vi | `#a3b899` |
| 1 | Ngưng Khí Cảnh | 3.000 Tu Vi | `#4ecca3` |
| 2 | Linh Hải Cảnh | 20.000 Tu Vi | `#00adb5` |
| 3 | Tạo Đảo Cảnh | 150.000 Tu Vi | `#3f72af` |
| 4 | Nguyên Linh Thụ | 1.000.000 Tu Vi | `#16c79a` |
| 5 | Tạo Hóa Đài | 8.000.000 Tu Vi | `#f39c12` |
| 6 | Thông Thiên Trụ | 60.000.000 Tu Vi | `#e056fd` |
| 7 | Ngọc Điện Cảnh | 500.000.000 Tu Vi | `#f1c40f` |
| 8 | Đỉnh Cấp Ngai | 4.000.000.000 Tu Vi | `#e74c3c` |
| 9 | Vô Thượng Lộ | 30.000.000.000 Tu Vi | `#ff007f` |
| 10 | Vạn Vì Tinh Tú | 200.000.000.000 Tu Vi | `#00f2fe` |
| 11 | Đại Đạo Chí Cao Vô Thượng | 1.500.000.000.000 Tu Vi | `#ffd700` |

### Điều Kiện & Nguyên Liệu Nâng Cấp Thần Thông (Cấp 1 $\to$ 12)
* **Cấp 2 (Ngưng Khí)**: 1 Mảnh Thú Hồn, 5.000 Linh Thạch, 1x Đại Tụ Khí Đan (`pill_tu_khi_dai`).
* **Cấp 3 (Linh Hải)**: 2 Mảnh Thú Hồn, 25.000 Linh Thạch, 1x Đại Tụ Khí Đan (`pill_tu_khi_dai`).
* **Cấp 4 (Tạo Đảo)**: 3 Mảnh Thú Hồn, 150.000 Linh Thạch, 1x Ngọc Linh Đan (`pill_ngoc_linh`).
* **Cấp 5 (Nguyên Linh Thụ)**: 5 Mảnh Thú Hồn, 1.000.000 Linh Thạch, 1x Tiên Linh Đan (`pill_tien_linh`).
* **Cấp 6 (Tạo Hóa Đài)**: 8 Mảnh Thú Hồn, 5.000.000 Linh Thạch, 1x Tiên Linh Đan (`pill_tien_linh`).
* **Cấp 7 (Thông Thiên Trụ)**: 12 Mảnh Thú Hồn, 25.000.000 Linh Thạch, 1x Cửu Diệu Bất Tử Dược (`pill_cuu_dieu`).
* **Cấp 8 (Ngọc Điện Cảnh)**: 16 Mảnh Thú Hồn, 100.000.000 Linh Thạch, 1x Cửu Diệu Bất Tử Dược (`pill_cuu_dieu`).
* **Cấp 9 (Đỉnh Cấp Ngai)**: 20 Mảnh Thú Hồn, 500 🌀 Hỗn Nguyên, 1x Cửu Chuyển Thánh Đan (`pill_thanh_chuyen`).
* **Cấp 10 (Vô Thượng Lộ)**: 25 Mảnh Thú Hồn, 2.000 🌀 Hỗn Nguyên, 1x Vĩnh Hằng Thánh Đan (`pill_thanh_01`).
* **Cấp 11 (Vạn Vì Tinh Tú)**: 30 Mảnh Thú Hồn, 10.000 🌀 Hỗn Nguyên, 1x Cửu Diệu Thần Tinh Đan (`pill_tinh_tu`).
* **Cấp 12 (Đại Đạo Chí Cao)**: 40 Mảnh Thú Hồn, 50.000 🌀 Hỗn Nguyên, 1x Đại Đạo Khởi Nguyên Đan (`pill_khoi_nguyen_thanh_dan`).

---

## 🔮 5. ĐÀI CẦU ĐẠO & 6 ĐẠI THẦN THÔNG TRẤN THÂN (GACHA & ULTIMATES)

### Cơ Chế Tích Lũy Nộ Khí Trong Trận Đấu
* Nhân vật sở hữu thanh Nộ Khí (Rage) tối đa 100 điểm.
* Đánh thường trúng đích: **+4 Nộ**
* Thi triển kỹ năng chủ động: **+20 Nộ**
* Khi nhận đòn tấn công từ quái: **+4 Nộ**
* Đạt đủ Nộ Khí, Đại Thần Thông trấn thân xuất kích xoay chuyển càn khôn!

### 6 Đại Thần Thông Trấn Thân

| Thần Thông | Phẩm Cấp | Nộ Khí | Hiệu Quả Tuyệt Đối |
|---|:---:|:---:|---|
| **Nhất Niệm Tiêu Dao** | 🌟 Thần Cấp | 100 Nộ | Vung kiếm hư vô, chém sụp **80% Máu Hiện Tại** của Boss, **bỏ qua hoàn toàn Giáp & Kim Thân**. |
| **Tuế Nguyệt Quy Linh** | 🌟 Thần Cấp | 80 Nộ | Nghịch chuyển thời gian, lập tức **hồi chiêu toàn bộ 3 kỹ năng chủ động** ngay tức khắc. |
| **Ý Chí Bất Tận** | 🌟 Thần Cấp | 90 Nộ | Vung cự kiếm hủy diệt gây **8.000% Sát Thương Vật Lí**, xuyên qua toàn bộ khiên chắn đánh thẳng vào sinh mệnh đối thủ. |
| **Vô Tổn Thể** | ⚡ Thánh Cấp | 70 Nộ | Ngưng tụ thiên đạo cương khí, tạo khiên chắn tương đương **150% Máu Tối Đa** của đạo thân. |
| **Bất Kham Nhập Thể** | ⚡ Thánh Cấp | 60 Nộ | Cố định sát thương nhận vào: Trong 8 giây, mọi đòn tấn công của đối thủ chỉ có thể gây tối đa **5% Máu Tối Đa** của người chơi. |
| **Huyết Tế Cuồng Loạn** | ⚡ Thánh Cấp | 75 Nộ | Tự trừ 50% máu hiện tại để bộc phát đòn đánh cuồng nộ gây **5.000% Sát Thương Phép Xuyên Kim Thân**. |

### Tỷ Lệ Gacha & Cơ Chế Hard Pity
* **Tỷ Lệ Cơ Sở**:
  * 🌟 **Thần Cấp (0.2%)**: Tam Đại Thần Thú Thượng Cổ & Đại Thần Thông Thần Cấp.
  * ⚡ **Thánh Cấp (2.0%)**: Đại Thần Thông Thánh Cấp.
  * 💠 **Linh Cấp (97.8%)**: Đan dược cao cấp, linh tài quý hiếm.
* **Bảo Hiểm Hard Pity**:
  * **Pity 100 lượt**: Lần thứ 100 chắc chắn nhận Đại Thần Thông Thánh Cấp (nếu chưa ra).
  * **Pity 500 lượt**: Lần thứ 500 chắc chắn nhận Thần Thú Thượng Cổ hoặc Thần Thông Thần Cấp.
* **Cơ Chế Mảnh Cơ Duyên**: Rút trùng Đại Thần Thông sẽ tự động phân giải thành Mảnh Cơ Duyên. Cứ tích lũy **10 Mảnh** sẽ tự động ngưng tụ thành **1 Vé Tầm Đạo** mới!

---

## 🗼 6. HƯ KHÔNG THÁP (ENDLESS TOWER)

* **Khiêu Chiến Vô Tận**: Leo tháp độc lập không giới hạn số tầng với thuật toán sinh quái động:
  * $\text{HP} = 150 \times 1.08^f \times \text{Hệ số}$
  * $\text{ATK} = 18 \times 1.065^f \times \text{Hệ số}$
  * $\text{Tu Vi} = 100 \times 1.10^f$ (Tầng $\ge 400$ chuyển thành Tinh Nguyên)
  * $\text{Linh Thạch} = 80 \times 1.09^f$ (Tầng $\ge 100$ Tỷ tự động nén sang Hỗn Nguyên)
* **Enrage Timer 60s**: Đếm ngược 60 giây; nếu hết giờ đối thủ cuồng nộ tăng 1.000% ATK xử thua.
* **Quét Tháp (Sweep)**: Tiêu hao 1 Lệnh Bài Hư Không, lập tức nhận toàn bộ tài nguyên từ Tầng 1 đến tầng cao nhất từng vượt qua.
* **Tự Động Leo Tháp (Auto-Climb 3s)**: Tự đếm ngược 3 giây và tiến lên tầng tháp tiếp theo sau mỗi trận thắng.
* **Thưởng Vé Tầm Đạo**: Cứ mỗi mốc **50 tầng tháp** (Tầng 50, 100, 150...) thưởng thẳng Vé Tầm Đạo nạp vào Đài Cầu Đạo.

---

## 🗺️ 7. HỆ THỐNG 23 ẢI CHIẾN ĐẤU & CƠ CHẾ KIM THÂN

### Cơ Chế Kim Thân Boss & Phá Kim Thân
* Boss từ Ải 15 trở lên được trang bị nội tại **Kim Thân Hộ Thể**: Giới hạn sát thương tối đa nhận vào từ mỗi đòn đánh thường không vượt quá **10% HP tối đa của Boss**.
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

## 🧪 8. HỆ THỐNG KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST SUITE)

Dự án sở hữu bộ kiểm thử tự động toàn diện viết bằng JavaScript thuần, không cần bất kỳ framework hay thư viện bên ngoài:

```powershell
node scratch/run-all-tests.js
```

### Kết Quả 18/18 Tests Đạt 100% Qua 8 Suites Trọng Yếu:
1. **Suite 1: Chỉ Số Nhân Vật & Điểm Tiềm Năng**: Khởi tạo chuẩn, phân bổ điểm, trang bị nón/giáp/vũ khí, tẩy tủy đan.
2. **Suite 2: Điều Kiện Đột Phá & Bình Cảnh (Gates)**: Kiểm tra chặn Ải 22 ở Tầng 100 Đại Đạo Chí Cao và Ải 23 định kỳ mỗi 100 tầng Vô Cực.
3. **Suite 3: Chuẩn Hóa Hợp Đồng Trả Về**: Loại bỏ hoàn toàn bare `false`, `breakthrough()` luôn trả về object tường minh, `quickBreakthrough()` dừng minh bạch.
4. **Suite 4: Tỉ Lệ Độ Kiếp & Khấu Trừ Thất Bại**: Tỉ lệ giảm dần theo tầng và buff từ đan dược.
5. **Suite 5: Sát Thương & Trần Kim Thân Boss**: Khóa trần 10% HP và phá Kim Thân với đòn bạo kích.
6. **Suite 6: Tam Đại Thần Thú & 12 Cảnh Giới**: Đồng bộ 12 cảnh giới tu vi, tăng trưởng chỉ số và giới hạn Cảnh Giới 11.
7. **Suite 7: Lưu Trữ, Tương Thích Ngược & Tinh Nguyên**: Tích lũy 1 Tỷ Tu Vi = 1 Tinh Nguyên, auto-migration nạp save cũ an toàn (V4).
8. **Suite 8: Kiến Trúc Module Hóa (Giai Đoạn 2)**: Kiểm tra tính toàn vẹn của 5 domain module `Player` và 8 tab module `UIController` (103/103 methods nguyên vẹn).

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
