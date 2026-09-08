# TIÊN ĐẠO TRƯỜNG SINH (KIEMTIEN 3.0)
### Trò Chơi Tu Tiên 2D Nhàn Rỗi (Idle RPG) • Nghịch Thiên Tu Đạo

---

## 📖 1. TỔNG QUAN DỰ ÁN

**Tiên Đạo Trường Sinh** (phiên bản Kiemtien 3.0) là một tựa game web RPG tu tiên nhàn rỗi (Idle RPG) được xây dựng hoàn toàn bằng công nghệ Web thuần túy (**HTML5, Vanilla CSS3, JavaScript ES6+**), không sử dụng bất kỳ thư viện hoặc framework bên thứ ba nào.

Trò chơi mô phỏng trọn vẹn lộ trình tu chân nghịch thiên cải mệnh: từ một phàm nhân ngưng tụ Tôi Khí, khai phá Linh Hải, vượt qua cửu đại thiên kiếp, vấn đạo hư không, cho đến khi bước chân lên đỉnh cao nhất của vũ trụ - **Đại Đạo Chí Cao Vô Thượng**.

### ✨ Điểm Nổi Bật Chính
* **Đồ Họa & Giao Diện Dark Fantasy Đa Nền Tảng**: Thiết kế hiện đại theo phong cách huyền huyễn Á Đông, tối ưu một màn hình dashboard trực quan, hiệu ứng phát sáng Neon, viền kim loại và kính mờ (Glassmorphism). Hỗ trợ responsive toàn diện trên Điện thoại, Máy tính bảng (Tablet) mà vẫn bảo lưu 100% giao diện PC gốc.
* **Hệ Thống Tiền Tệ Cao Cấp Hỗn Nguyên Thạch**: Đột phá giải quyết triệt để nguy cơ tràn số học của JS bằng đơn vị tiền tệ cao cấp **🌀 Hỗn Nguyên Thạch** ($1 \text{ 🌀} = 1.000.000.000 \text{ 💎}$). Tích hợp Tiệm Quy Đổi 2 chiều và tính năng Nén Toàn Bộ Tỷ Linh Thạch trong 1 nốt nhạc.
* **Bình Cảnh Tầng 100 & Cảnh Giới Vô Cực (🌌 Tinh Nguyên Đại Đạo)**: Khi đạt Tầng 100 Đại Đạo Chí Cao, người chơi phải trảm sát **Boss Hư Vô Bản Nguyên tại [Ải 22: Hư Vô Bản Nguyên Cảnh]** để ngưng tụ Thần Cách, mở khóa Cảnh Giới Vô Cực. Đơn vị tu vi chuyển sang **🌌 Tinh Nguyên** ($1 \text{ 🌌} = 1 \text{ Tỷ Tu Vi}$), bảo toàn vĩnh cửu cơ chế vô hạn tầng tu vi mà số học luôn an toàn tuyệt đối.
* **Hệ Thống Hư Không Tháp (Endless Tower)**: Chế độ khiêu chiến vô tận độc lập với 22 ải cốt truyện, thuật toán sinh quái động (Procedural Scaling), cơ chế Enrage Timer 60s, hệ thống Lệnh Bài Hư Không không giới hạn (5.000 🌀 Hỗn Nguyên Thạch/vé), tính năng Quét Nhanh (Sweep) và Tự Động Leo Tháp liên tục (3s). Tháp tầng cao $\ge 100$ Tỷ tự động thưởng Hỗn Nguyên Thạch.
* **Cơ Chế Phá Kim Thân Cho Boss**: Khắc phục nhược điểm Boss quá trâu trước đây bằng cơ chế phá vỡ trần sát thương: đòn Bạo Kích hoặc Kỹ Năng thần thông sẽ kích hoạt hiệu ứng `PHÁ KIM THÂN`, nới rộng trần sát thương lên 30% - 40% máu tối đa.
* **Tùy Chọn Tốc Độ Trận Đấu (Speed Multiplier x1, x2, x3)**: Nút chuyển đổi tốc độ trận đấu linh hoạt, tăng tốc toàn bộ nhịp đánh, hồi chiêu và đếm ngược lặp ải, lưu trực tiếp vào `localStorage`.
* **Hiệu Ứng Hạt Canvas (VFX Engine)**: Hệ thống canvas dựng linh khí đả tọa, kiếm khí vung chém, sấm sét lôi kiếp, hỏa cầu bùng nổ, phá kim thân và hiệu ứng số sát thương nảy động (Floating Combat Text).
* **Bộ Máy Âm Thanh Độc Lập (Web Audio API Synth)**: Tổng hợp âm thanh chém kiếm, niệm phép, sét đánh, đột phá, chiến thắng/thất bại, bảo hộ khiên theo thời gian thực bằng thuật toán dao động âm, không phụ thuộc file MP3/WAV bên ngoài.
* **12 Đại Cảnh Giới Siêu Cấp & Cơ Chế Tầng Vô Hạn**: Phá bỏ giới hạn truyền thống với cơ chế vượt ải để thăng cảnh giới, tích lũy tầng tu vi vô hạn và tăng trưởng chỉ số không giới hạn.
* **Hệ Thống Chiến Đấu Sàn Đấu 2D Động**: Đấu trường thời gian thực với cơ chế tự động xuất chiêu (Auto), tự động lặp lại ải (Auto-Repeat), tự động leo tháp (Auto-Climb), đòn đánh thường kết hợp 3 kỹ năng chủ động, độ trễ 450ms hiển thị đòn kết liễu trực quan.
* **Túi Trữ Vật & Bán Nhanh Đồ Trùng**: Hỗ trợ gộp số lượng (stacking), dùng nhanh hàng loạt (Dùng Hết) đan dược, mua nhanh số lượng tối đa (Mua Hết), và tính năng phân tích bán toàn bộ trang bị trùng lặp (Bán Đồ Trùng) chỉ với 1 cú nhấp chuột.
* **Hệ Thống Danh Hiệu & Đổi Tên**: Mở khóa danh hiệu từ trảm Boss, danh hiệu ẩn bế quan tu luyện (Phê Cỏ - x5 tốc độ AFK), mang lại hiệu ứng buff chỉ số mạnh mẽ; cho phép đổi đạo hiệu với Cuộn Giấy Đổi Tên.
* **Cơ Chế Treo Máy AFK Hoàn Hảo**: Tích lũy tu vi tự động khi online (có delta-time chống lag trình duyệt) và tính toán tu vi khi offline ngoại tuyến lên đến 24 giờ.

---

## 📁 2. CẤU TRÚC THƯ MỤC & MÃ NGUỒN

```
d:/HOCTAP/TuDo/Kiemtien/
├── css/
│   ├── main.css            # Hệ thống biến CSS (Design Tokens), layout nền, typography, reset
│   ├── components.css      # Toàn bộ UI components: dashboard 3 cột, bảng điểm, túi đồ, tàng kinh các, Hư Không Tháp, tiệm đổi Hỗn Nguyên, modal, responsive
│   └── combat.css          # Giao diện sàn đấu 2D, thanh máu/khiên động, Enrage bar, đếm ngược lặp ải, tốc độ x1-x3
├── js/
│   ├── data/
│   │   ├── realms.js       # Dữ liệu 12 đại cảnh giới, công thức tu vi, tốc độ AFK, điều kiện vượt ải
│   │   ├── skills.js       # Dữ liệu toàn bộ bí kíp kỹ năng (Vật lí, Phép, Khiên, Hồi máu), logic so sánh sắp xếp
│   │   ├── items.js        # Dữ liệu trang bị (Nón, Giáp, Vũ khí), đan dược tu vi, Lệnh Bài Hư Không (5M 🌀), 7 bậc phẩm cấp
│   │   ├── titles.js       # Dữ liệu hệ thống Danh Hiệu Thần Thông & Danh hiệu Hư Vô Chúa Tể, Phê Cỏ, điều kiện mở khóa, chỉ số buff
│   │   ├── stages.js       # Dữ liệu 22 Ải cốt truyện (từ Ải 1 Thảo Dược Viên đến Ải 22 Hư Vô Bản Nguyên Cảnh)
│   │   └── tower.js        # Hệ thống Hư Không Tháp: thuật toán sinh quái động, Enrage Timer 60s, Quét Nhanh, thưởng Hỗn Nguyên, reset vé
│   ├── engine/
│   │   ├── audio.js        # Bộ máy tổng hợp âm thanh procedural qua Web Audio API (Synth)
│   │   ├── particles.js    # Canvas particle engine: linh khí, kiếm khí, sấm sét, nảy số sát thương, chí mạng, phá kim thân
│   │   ├── combat.js       # Bộ máy điều khiển chiến đấu 2D: tính sát thương, kích hoạt kỹ năng, Kim Thân & Phá Kim Thân, Enrage timer, tốc độ x1-x3
│   │   └── storage.js      # Lưu trữ LocalStorage, xuất/nhập mã sao lưu (Base64), đồng bộ dữ liệu an toàn
│   ├── state/
│   │   └── player.js       # Quản lý trạng thái nhân vật: tu vi, điểm tiềm năng, trang bị, danh hiệu, túi đồ, towerData, mua vé tháp
│   ├── ui/
│   │   └── ui.js           # Bộ điều khiển giao diện (UIController): render tab, modal, format số lớn, điều khiển tháp, tự động leo tầng, sự kiện
│   └── app.js              # Điểm khởi động game: khởi tạo các engine, vòng lặp AFK online/offline, autosave
├── index.html              # Trang chủ và cấu trúc DOM chính của ứng dụng
├── server.js               # Máy chủ HTTP Node.js tĩnh (Zero-dependency, cổng 3000)
├── start_game.bat          # File khởi chạy nhanh game trên Windows
├── README.md               # Bản tóm tắt dự án (tiêu chuẩn repository)
└── PROJECT_SUMMARY.md      # Tài liệu tổng hợp chi tiết toàn bộ dự án
```

---

## 🌌 3. HỆ THỐNG CẢNH GIỚI & ĐỘT PHÁ (REALM SYSTEM)

Hệ thống tu tiên gồm **12 Đại Cảnh Giới**:

| STT | Tên Cảnh Giới | Chữ Hán | Màu Nhận Diện | Yêu Cầu Đột Phá | Tốc Độ AFK Cơ Bản |
|:---:|:---|:---:|:---:|:---|:---:|
| 1 | **Tôi Khí** | 淬气 | `#a3b899` (Xám Xanh) | Đạt đủ Tu Vi tầng hiện tại | +2 Tu Vi/s |
| 2 | **Ngưng Khí** | 凝气 | `#4ecca3` (Xanh Ngọc Nhạt) | Đạt đủ Tu Vi tầng hiện tại | +5 Tu Vi/s |
| 3 | **Linh Hải** | 灵海 | `#00adb5` (Xanh Lam Biển) | Đạt đủ Tu Vi tầng hiện tại | +12 Tu Vi/s |
| 4 | **Tạo Đảo** | 造岛 | `#3f72af` (Xanh Thẫm) | Đạt đủ Tu Vi tầng hiện tại | +30 Tu Vi/s |
| 5 | **Nguyên Linh Thụ** | 元灵树 | `#16c79a` (Lục Bảo) | Đạt đủ Tu Vi tầng hiện tại | +75 Tu Vi/s |
| 6 | **Tạo Hóa Đài** | 造化台 | `#f39c12` (Cam Hổ Phách) | Đạt đủ Tu Vi tầng hiện tại | +180 Tu Vi/s |
| 7 | **Thông Thiên Trụ** | 通天柱 | `#e056fd` (Tím Lôi Đình) | Đạt đủ Tu Vi tầng hiện tại | +450 Tu Vi/s |
| 8 | **Ngọc Điện** | 玉殿 | `#f1c40f` (Vàng Ánh Kim) | Đạt đủ Tu Vi tầng hiện tại | +1,200 Tu Vi/s |
| 9 | **Đỉnh Cấp Ngai** | 顶级王座 | `#e74c3c` (Đỏ Huyết Sắc) | Đạt đủ Tu Vi tầng hiện tại | +3,000 Tu Vi/s |
| 10 | **Vô Thượng Lộ** | 无上路 | `#ff007f` (Hồng Neon) | **Buộc phải đánh bại Ải 17: Vấn Đạo** | +8,000 Tu Vi/s |
| 11 | **Vạn Vì Tinh Tú** | 万辰星宿 | `#00f2fe` (Xanh Tinh Hà) | **Buộc phải đánh bại Ải 18: Tinh Hà Thần Điện** | +25,000 Tu Vi/s |
| 12 | **Đại Đạo Chí Cao Vô Thượng** | 至高无上大道 | `#ffd700` (Vàng Kim Chí Tôn) | **Buộc phải đánh bại Ải 19: Đại Đạo Thần Cung** | +100,000 Tu Vi/s |

### ⚙️ Quy Tắc Đột Phá, Bình Cảnh Tầng 100 & Cảnh Giới Vô Cực (Infinite Tiers & Vo Cuc)
1. **Từ Tôi Khí đến Ngọc Điện (Cảnh giới 1 - 8)**:
   * Mỗi cảnh giới bao gồm **10 tầng chuẩn**: Tầng 1 ➔ Tầng 2 ➔ ... ➔ Tầng 9 ➔ Đỉnh Phong.
   * Khi ở Đỉnh Phong và tích lũy đủ Tu Vi, nhấn Đột Phá sẽ tiến lên cảnh giới kế tiếp (Tầng 1).
2. **Từ Đỉnh Cấp Ngai, Vô Thượng Lộ, Vạn Vì Tinh Tú**:
   * **Tầng Tu Vi Tăng Vô Hạn**: Không bị khống chế ở mốc 10 tầng. Người chơi có thể đột phá lên `Tầng 11`, `Tầng 12`, ..., `Tầng 100+`.
   * **Điều Kiện Khóa Cảnh Giới Bằng Ải**:
     * Đột phá từ *Đỉnh Cấp Ngai* lên *Vô Thượng Lộ*: **Bắt buộc vượt Ải 17 (Vấn Đạo)**.
     * Đột phá từ *Vô Thượng Lộ* lên *Vạn Vì Tinh Tú*: **Bắt buộc vượt Ải 18 (Tinh Hà Thần Điện)**.
     * Đột phá từ *Vạn Vì Tinh Tú* lên *Đại Đạo Chí Cao Vô Thượng*: **Bắt buộc vượt Ải 19 (Đại Đạo Thần Cung)**.
3. **Bình Cảnh Tầng 100 Đại Đạo Chí Cao & Khai Mở Cảnh Giới Vô Cực**:
   * Khi đạt **Đại Đạo Chí Cao - Tầng 100**, người chơi chạm đến **Bình Cảnh Tối Cao** của vũ trụ.
   * Để phá vỡ bình cảnh này, bắt buộc phải trảm sát **Boss Hư Vô Bản Nguyên tại [Ải 22: Hư Vô Bản Nguyên Cảnh]** (`stage_vo_cuc`).
   * Sau khi vượt Ải 22, nút đột phá mở khóa **🌌 THĂNG HOA CẢNH GIỚI VÔ CỰC**:
     * Kích hoạt trạng thái `isVoCuc = true`.
     * Toàn bộ tu vi dư thừa tự động nén quy đổi sang đơn vị tu luyện tối thượng: **🌌 Tinh Nguyên** ($1 \text{ Tinh Nguyên} = 1.000.000.000 \text{ Tu Vi}$).
     * Bước chân lên **Tầng 101 Vô Cực** (`tierIndex = 100`).
4. **Cơ Chế Vô Cực & Tinh Nguyên Đại Đạo (Giải Quyết Tuyệt Đối Tràn Số JS)**:
   * **Công thức Tinh Nguyên cần để thăng tầng**:
     $$\text{maxTinhNguyen} = 100 + (\text{tierIndex} - 100) \times 10$$
     *(Ví dụ: Tầng 101 cần 100 🌌; Tầng 102 cần 110 🌌; Tầng 103 cần 120 🌌; ...).*
   * **Tích lũy Tu Vi trong Vô Cực**: Mọi nguồn Tu Vi tự nhiên (đả tọa AFK, đan dược) khi đạt đủ 1 Tỷ sẽ tự động nén thành Tinh Nguyên mà không bị thất thoát.
   * **Hiệu lực Đan Dược trong Vô Cực**: Các loại đan dược siêu cấp quy đổi trực tiếp thành Tinh Nguyên (ví dụ: *Thái Sơ Hỗn Độn Đan* cho ngay +60 🌌; *Vĩnh Hằng Bất Hủ Luân Hồi Đan* cho ngay +500 🌌).
   * **Thưởng Đột Phá**: Mỗi tầng Vô Cực tiếp tục ban thưởng đúng **+4 Điểm Tiềm Năng**, gia tăng HP, Sát Thương và Phòng Ngự vô hạn.

---

## 🌀 4. HỆ THỐNG TIỀN TỆ CAO CẤP: HỖN NGUYÊN THẠCH & QUY ĐỔI (CURRENCY SYSTEM)

Nhằm giải quyết triệt để nguy cơ tràn số học của JavaScript (`Number.MAX_SAFE_INTEGER` $\approx 9 \times 10^{15}$) khi người chơi tiến sâu vào cảnh giới cao và tầng tháp vô tận, trò chơi thiết lập hệ thống **Tiền Tệ Kép Siêu Cấp**:

### 💎 1. Linh Thạch (Tiền Tệ Phổ Thông)
* Đơn vị cơ bản nhận được từ trảm quái, vượt ải, quét tháp, bán vật phẩm.
* Sử dụng để mua sắm trang bị, bí kíp và đan dược thông thường tại Bách Bảo Các.

### 🌀 2. Hỗn Nguyên Thạch (Tiền Tệ Cao Cấp Tối Thượng)
* **Tỷ giá quy chuẩn thiên địa**:
  $$1 \text{ Hỗn Nguyên Thạch } (🌀) = 1.000.000.000 \text{ (1 Tỷ) Linh Thạch } (💎)$$
* **Tiệm Quy Đổi Hỗn Nguyên (Tại Bách Bảo Các)**:
  * **Đổi 1 🌀**: Tiêu hao 1 Tỷ Linh Thạch nhận 1 Hỗn Nguyên Thạch.
  * **Đổi 10 🌀**: Tiêu hao 10 Tỷ Linh Thạch nhận 10 Hỗn Nguyên Thạch.
  * **⚡ Nén Toàn Bộ (💎 ➔ 🌀)**: Tự động nén toàn bộ số dư hàng tỷ Linh Thạch thành Hỗn Nguyên Thạch chỉ với 1 cú nhấp chuột, bảo lưu số dư lẻ.
  * **Phân Giải 1 🌀 ➔ 1 Tỷ 💎**: Đổi ngược lại Linh Thạch bất kỳ lúc nào khi cần tiêu dùng phổ thông.
* **Hiển thị linh hoạt trên Header**: Header tự động xuất hiện ô `🌀 Hỗn Nguyên` khi người chơi có số dư Hỗn Nguyên, sở hữu trên 1 Tỷ Linh Thạch, hoặc đã bước vào Cảnh Giới Vô Cực.

---

## 📊 5. HỆ THỐNG ĐIỂM TIỀM NĂNG & THUỘC TÍNH (STATS SYSTEM)

### Quy Tắc Cộng Điểm & Cơ Chế Khuếch Đại Phần Trăm (%)
* Mỗi lần đột phá tăng 1 tầng tu vi (kể cả các tầng vô hạn), người chơi nhận đúng **+4 Điểm Tiềm Năng**.
* Áp dụng **Cơ Chế Khuếch Đại Phần Trăm (%) kết hợp Chỉ Số Phẳng**:
  * **Sát Thương Vật Lí (`statVatLi`)**: Mỗi điểm tăng **+5 Công Vật Lí phẳng** VÀ **+0.35% Tổng Sát Thương Vật Lí**. Mỗi 20 điểm tăng thêm **+1% Tỉ Lệ Bạo Kích**.
  * **Sát Thương Phép (`statPhep`)**: Mỗi điểm tăng **+5 Công Phép phẳng** VÀ **+0.35% Tổng Sát Thương Phép**. Mỗi 20 điểm tăng thêm **+1 Kháng Phép**.
  * **Sinh Mệnh (Máu - `statMau`)**: Mỗi điểm tăng **+30 HP phẳng** VÀ **+0.4% Tổng Máu Tối Đa**. Mỗi 10 điểm tăng thêm **+1 Phòng Ngự & +1 Kháng Phép**.
* Công thức tính tổng:
  $$\text{Tổng Sức Mạnh} = (\text{Chỉ Số Cơ Bản} + \text{Trang Bị} + \text{Danh Hiệu} + \text{Chỉ Số Phẳng}) \times (1 + \text{Điểm} \times \text{Hệ Số } \%)$$
* Nhờ cơ chế này, điểm tiềm năng vừa có giá trị tức thì ở đầu game nhờ chỉ số phẳng, vừa tự động khuếch đại bùng nổ hàng triệu đến hàng tỷ sức mạnh ở giai đoạn endgame khi kết hợp cùng trang bị phẩm cấp cao!
* Hỗ trợ cộng nhanh: `+1`, `+5`, và `Max (+Toàn Bộ)`.

### Chỉ Số Phụ Tự Động & Hưởng Lợi Từ Tiềm Năng
* **Phòng Ngự & Kháng Phép**: Tự động tăng theo cảnh giới + chỉ số từ Nón, Giáp, Vũ khí, Danh hiệu + điểm thưởng từ Thể Chất và Pháp Cường.
* **Tỉ Lệ Bạo Kích**: Mặc định 5%, tăng thêm từ trang bị, danh hiệu + điểm thưởng từ Lực Đạo (giới hạn tối đa 75%).

### Tẩy Tủy & Phân Bổ Lại
* Sử dụng vật phẩm **Tẩy Tủy Đan** để thu hồi 100% điểm tiềm năng đã cộng vào quỹ điểm khả dụng, cho phép thử nghiệm các lối build khác nhau.

---

## 🛡️ 5. HỆ THỐNG TRANG BỊ & PHẨM CẤP (EQUIPMENT SYSTEM)

### 3 Ô Trang Bị Đạo Thân
1. **Nón (Headgear)**: Tăng mạnh Sinh Mệnh (HP), Phòng Ngự và Kháng Phép.
2. **Giáp (Armor)**: Trụ cột phòng thủ, cung cấp lượng lớn Phòng Ngự, Kháng Phép và HP.
3. **Vũ Khí (Weapon)**: Nguồn sát thương chủ lực, tăng mạnh Sát Thương Vật Lí, Sát Thương Phép và Tỉ Lệ Bạo Kích.

### 8 Bậc Phẩm Cấp (Rarity)
Mỗi phẩm cấp có màu sắc, khung viền và hiệu ứng hào quang tương ứng:
* ⚪ **Phàm Phẩm** (`pham`): Trắng xám (`#b0bec5`)
* 🔵 **Linh Phẩm** (`linh`): Xanh lam (`#4fc3f7`)
* 🟣 **Huyền Phẩm** (`huyen`): Tím huyền bí (`#ba68c8`)
* 🟠 **Địa Phẩm** (`dia`): Cam kim quang (`#ffb74d`)
* 🔴 **Thiên Phẩm** (`thien`): Đỏ kim (`#ff5252`)
* 🟢 **Tiên Phẩm** (`tien`): Xanh ngọc lục bảo (`#00e676`)
* 🟡 **Thánh Phẩm** (`thanh`): Vàng kim chí tôn (`#ffd700`)
* 💖 **Cực Đạo** (`cuc_dao`): **Đỏ tím cực quang neon (`#ff2a85`)** - Phẩm cấp tối thượng mới, hiệu ứng ánh sáng rung chuyển chư thiên.

### 6 Món Trang Bị Cực Đạo Tối Thượng Mới (Giai Đoạn Endgame / Đại Đạo Chí Cao)
Được bày bán tại Bách Bảo Các bằng **🌀 Hỗn Nguyên Thạch**:
1. **👑 Cực Đạo Vô Lượng Thần Quán (Nón - Thiên Thủ)**: +2.5 Tỷ HP, +80 Tr Phòng Thủ, +35 Tr Kháng Phép (12.000 🌀).
2. **🪞 Cực Đạo Hư Không Minh Miện (Nón - Thiên Kháng)**: +2.5 Tỷ HP, +35 Tr Phòng Thủ, +80 Tr Kháng Phép (12.000 🌀).
3. **🛡️ Cực Đạo Bất Diệt Thánh Giáp (Giáp - Thiên Thủ)**: +4.5 Tỷ HP, +120 Tr Phòng Thủ, +50 Tr Kháng Phép (18.000 🌀).
4. **👘 Cực Đạo Hỗn Độn Tiên Bào (Giáp - Thiên Kháng)**: +4.5 Tỷ HP, +50 Tr Phòng Thủ, +120 Tr Kháng Phép (18.000 🌀).
5. **⚔️ Cực Đạo Tru Tiên Thần Kiếm (Vũ Khí - Vật Lí)**: +120 Tr Công Vật Lí, +25 Tr Công Phép, +85 Bạo Kích (15.000 🌀).
6. **🪄 Cực Đạo Hỗn Độn Thần Trượng (Vũ Khí - Phép)**: +25 Tr Công Vật Lí, +135 Tr Công Phép, +85 Bạo Kích (15.000 🌀).

### Thuật Toán Sắp Xếp Tự Động Chuẩn Mực
Tất cả danh sách vật phẩm trong túi đồ, cửa hàng Bách Bảo Các và Tàng Kinh Các đều được sắp xếp chặt chẽ theo thứ tự:
$$\text{Cảnh Giới Yêu Cầu} \longrightarrow \text{Phẩm Cấp / Tầng} \longrightarrow \text{Giá Bán} \longrightarrow \text{Tên ABC}$$

### Tính Năng Bán Nhanh Trang Bị Trùng Lặp (`⚡ Bán Nhanh Đồ Trùng`)
* **Bán trên từng thẻ trang bị**: Khi có từ 2 món trở lên (`count > 1`), bổ sung các nút `Bán 1`, `Bán Trùng` (giữ lại 1 bản an toàn trong túi, bán sạch các bản thừa) và `Bán Hết`.
* **Bán Nhanh Toàn Diện (`💰 Bán Nhanh Đồ Trùng`)**: Quét toàn bộ nón, giáp, vũ khí trùng trong túi, hiển thị modal xem trước số lượng và tổng Linh Thạch thu về, kèm cơ chế an toàn giữ lại 1 bản cho mỗi loại trang bị chưa mặc trên người.
* **Bảo vệ tuyệt đối**: Trang bị đang mặc trên người không bao giờ bị bán; đan dược và bí kíp võ học không bị ảnh hưởng.

---

## 📜 6. HỆ THỐNG KỸ NĂNG & CƠ CHẾ ĐỐT MÁU BOSS (SKILL SYSTEM)

### 3 Ô Kỹ Năng Xuất Trận
Người chơi có thể tùy biến lắp đặt 3 kỹ năng chủ động vào 3 ô xuất trận để dùng trong Sàn Đấu 2D. Kỹ năng có thời gian hồi chiêu (Cooldown) độc lập.

### 5 Hệ Kỹ Năng Chuyên Biệt
1. **⚔️ Vật Lí**: Gây sát thương dựa trên % Sát Thương Vật Lí của nhân vật, trừ bớt một phần giáp của mục tiêu. Có khả năng kích hoạt đòn đánh chí mạng (Bạo kích) và kích hoạt hiệu ứng Phá Kim Thân.
2. **🔮 Pháp Thuật**: Gây sát thương dựa trên % Sát Thương Phép, trừ kháng phép quái vật, đi kèm hiệu ứng hoạt họa hỏa cầu, lôi đình hoặc hắc động thiên thạch; luôn kích hoạt Phá Kim Thân.
3. **🛡️ Hộ Thể (Khiên)**: Tạo lớp giáp bảo hộ hấp thụ sát thương dựa trên % Máu tối đa của nhân vật. Lớp khiên hiển thị trực tiếp trên thanh máu của nhân vật.
4. **💚 Trị Liệu**: Khôi phục sinh mệnh tức thì bằng công thức: $\text{Phép} \times \text{Hệ số} + 15\% \text{ Max HP}$.
5. **🔥 Đốt Máu Cực Đạo (`skill_cuc_dao_dot_mau` - Cực Đạo Hồng Mông Thôn Huyết Quyết)**:
   * Tuyệt kỹ tối cao tiêu hao sinh lực địch thủ.
   * **Cơ Chế Độc Nhất**: Thiêu đốt trực tiếp 8% Máu tối đa của Boss kèm sát thương khuếch đại.
   * **HOÀN TOÀN BỎ QUA KIM THÂN HỘ THỂ (Damage Cap)**: Không bị khống chế bởi bất kỳ trần sát thương nào.
   * **HOÀN TOÀN BỎ QUA KHIÊN HỘ THỂ CỦA BOSS**: Bỏ qua lớp khiên của Boss, trừ trực tiếp thẳng vào máu gốc!

### Bộ 4 Kỹ Năng Độc Quyền Dành Riêng Cho Boss (Quái Thường Không Sở Hữu)
Nhằm tăng thử thách và tính chiến thuật cho các trận quyết đấu đỉnh cao, tất cả quái vật mang danh hiệu Boss (`isBoss: true`) được trang bị chu kỳ xuất chiêu (mỗi 6.5 giây) với 4 tuyệt kỹ hung hiểm:
1. **💫 Cực Áp Định Thân (Choáng / Stun 2.0s)**:
   * Khiến người chơi rơi vào trạng thái Choáng trong 2.0 giây.
   * Khóa hoàn toàn đòn đánh thường và ngăn chặn xuất chiêu kỹ năng (cả Auto lẫn thủ công).
   * Hiển thị huy hiệu `💫 CHOÁNG` nhấp nháy trên avatar đạo hữu.
2. **⚡ Diệt Thế Thần Nộ (Sốc Sát Thương / Burst Damage)**:
   * Boss tụ kình lực bộc phát đòn đánh giáng sát thương bằng $2.5 \times$ công kích cơ bản.
   * Hấp thụ bởi khiên người chơi trước khi trừ vào máu.
3. **🛡️ Hỗn Độn Hộ Thể (Tạo Khiên / Boss Shield)**:
   * Boss tạo ra lớp khiên hộ thể bằng 15% Máu tối đa của Boss.
   * Hiển thị thanh khiên phát sáng trực quan trên thanh máu của quái vật.
   * Toàn bộ đòn đánh thường và kỹ năng thông thường của người chơi phải phá vỡ lớp khiên này trước khi gây sát thương vào máu Boss (ngoại trừ kỹ năng Đốt Máu Cực Đạo xuyên thủng khiên).
4. **🩸 Thôn Thiên Ma Công (Hút Máu / Life Steal)**:
   * Boss hút trực tiếp tối đa 10% Máu tối đa của người chơi (**HOÀN TOÀN BỎ QUA KHIÊN của người chơi**).
   * Chuyển hóa và hồi phục tương ứng 10% Máu tối đa cho Boss.

### Tàng Kinh Các (NPC Truyền Công)
* Cho phép mua bí kíp bằng Linh Thạch khi đạt đủ điều kiện Cảnh giới & Tầng tu vi.
* Trang bị bộ lọc trực quan: lọc theo Hệ kỹ năng, lọc theo Cảnh giới, lọc theo trạng thái (Có thể học / Chưa học / Đã học), ô tìm kiếm tên bí kíp.

---

## 🗺️ 7. HỆ THỐNG 21 ẢI CHIẾN ĐẤU & ĐẠI BOSS (STAGES DATABASE)

| Ải | Tên Ải | Khu Vực | Yêu Cầu | Boss / Quái | HP Boss | Sát Thương | Phần Thưởng Chính |
|:---:|:---|:---|:---:|:---|:---:|:---:|:---|
| 1 | Thảo Dược Viên Ngoại Vi | Thanh Vân Ngoại Vi | Tôi Khí T1 | Linh Thảo Thỏ Yêu | 220 | 16 | 120 Tu Vi • 50 Linh Thạch |
| 2 | Bích Lạc Khê Cốc | Thanh Vân Ngoại Vi | Tôi Khí T3 | Hắc Thủy Xà | 550 | 38 | 300 Tu Vi • 120 Linh Thạch |
| 3 | Hắc Sa Động Phủ | Thanh Vân Ngoại Vi | Tôi Khí T6 | Cuồng Bạo Ma Hùng 👑 | 1,400 | 85 | 800 Tu Vi • 300 Linh Thạch |
| 4 | Phong Lôi Lãm Nhai | Thanh Vân Ngoại Vi | Tôi Khí Đỉnh | Thiết Vũ Điêu Vương 👑 | 3,200 | 180 | 2,000 Tu Vi • 750 Linh Thạch |
| 5 | Cổ Thụ Lạc Lối | Vạn Thú Ma Lâm | Ngưng Khí T1 | U Minh Bạch Lang | 5,800 | 280 | 4,500 Tu Vi • 1,600 Linh Thạch |
| 6 | Xích Hỏa Diễm Đàm | Vạn Thú Ma Lâm | Ngưng Khí T4 | Xích Diễm Ma Viên 👑 | 12,500 | 520 | 10,000 Tu Vi • 4,000 Linh Thạch |
| 7 | Vạn Thú Tế Đàn | Vạn Thú Ma Lâm | Ngưng Khí Đỉnh | Huyết Lân Cự Mãng Vương 👑 | 26,000 | 980 | 25,000 Tu Vi • 9,500 Linh Thạch |
| 8 | U Lam Hàn Hải | Trầm Uyên Linh Hải | Linh Hải T1 | Bích Hải Kình Ngư | 55,000 | 1,800 | 55,000 Tu Vi • 22,000 Linh Thạch |
| 9 | Đoạn Long Thủy Phủ | Trầm Uyên Linh Hải | Linh Hải T8 | Hắc Thủy Bát Đầu Giao 👑 | 120,000 | 3,400 | 140,000 Tu Vi • 55,000 Linh Thạch |
| 10 | Hoang Khư Tàn Tích | Cổ Đảo Hoang Khư | Tạo Đảo T1 | Cổ Đảo Cự Thạch Tướng | 280,000 | 7,200 | 320,000 Tu Vi • 130,000 Linh Thạch |
| 11 | Phong Ma Tiên Trận | Cổ Đảo Hoang Khư | Tạo Đảo Đỉnh | Viễn Cổ Ma Thần Tàn Hồn 👑 | 600,000 | 14,000 | 800,000 Tu Vi • 350,000 Linh Thạch |
| 12 | Thần Thụ Tầng Dưới | Nguyên Linh Thánh Địa | Nguyên Linh Thụ | Cổ Thụ Hộ Vệ Thần | 1.3 Tr | 28,000 | 2 Tr Tu Vi • 850,000 Linh Thạch |
| 13 | Cửu Thiên Lôi Trì | Tạo Hóa Lôi Sơn | Tạo Hóa Đài | Cửu Tiêu Lôi Kỳ Lân 👑 | 3.2 Tr | 62,000 | 5.5 Tr Tu Vi • 2.4 Tr Linh Thạch |
| 14 | Kình Thiên Đỉnh Giới | Thông Thiên Ma Giới | Thông Thiên Trụ | Hư Không Cự Ma 👑 | 8.5 Tr | 140,000 | 16 Tr Tu Vi • 6.5 Tr Linh Thạch |
| 15 | Bạch Ngọc Tiên Môn | Ngọc Hư Tiên Cung | Ngọc Điện | Ngọc Hư Chiến Thần 👑 | 22 Tr | 320,000 | 45 Tr Tu Vi • 18 Tr Linh Thạch |
| 16 | Đỉnh Cấp Vương Tọa | Cửu Trọng Thiên Đỉnh | Đỉnh Cấp Ngai | Hỗn Độn Chúa Tể 👑 | 60 Tr | 850,000 | 130 Tr Tu Vi • 75 Tr Linh Thạch |
| 17 | **Vấn Đạo** | **Thiên Ngoại Hư Không** | **Đỉnh Cấp Ngai** | **Hóa Thân Vấn Đạo 👑** | **100 Tỷ** | **10 Triệu** | **350 Tr Tu Vi • 3.5 Tỷ Linh Thạch** |
| 18 | **Tinh Hà Thần Điện** | **Vô Thượng Tinh Vực** | **Vô Thượng Lộ** | **Tinh Hà Thần Long 👑** | **250 Tỷ** | **25 Triệu** | **1.8 Tỷ Tu Vi • 18 Tỷ Linh Thạch** |
| 19 | **Đại Đạo Thần Cung** | **Chí Cao Vĩnh Hằng** | **Vạn Vì Tinh Tú** | **Hư Vô Thần Đế 👑** | **2.500 Tỷ** | **120 Triệu** | **7.5 Tỷ Tu Vi • 85 Tỷ Linh Thạch** |
| 20 | **Thái Sơ Hỗn Độn Đàm** | **Bản Nguyên Khởi Nguyên** | **Đại Đạo Chí Cao T11** | **Thái Sơ Cổ Thần 👑** | **15.000 Tỷ** | **450 Triệu** | **35 Tỷ Tu Vi • 350 Tỷ Linh Thạch** |
| 21 | **Vĩnh Hằng Luân Hồi Kính** | **Bản Nguyên Khởi Nguyên** | **Đại Đạo Chí Cao T31** | **Chí Cao Tâm Ma 👑** | **80.000 Tỷ** | **1.8 Tỷ** | **180 Tỷ Tu Vi • 1.8 Nghìn Tỷ Linh Thạch** |

### 🛡️ Cơ Chế Phá Kim Thân (Boss Damage Cap & Cap-Break)
* Toàn bộ Boss trong ải chiến đấu được trang bị cơ chế **Kim Thân Hộ Thể** kết hợp **Phá Kim Thân**:
  * **Boss Thường (Ải 3, 4, 6, 7, 9, 11, 13, 14, 15)**:
    * **Đòn đánh thường (không crit)**: Trần sát thương nhận vào tối đa **25% Máu tối đa**.
    * **Đòn Bạo Kích & Kỹ Năng Thần Thông (Phá Kim Thân)**: Xé rách Kim Thân, trần sát thương nới rộng lên tới **40% Máu tối đa**.
  * **Đại Boss Tối Cao (Ải 16, 17, 18, 19, 20, 21)**:
    * **Đòn đánh thường (không crit)**: Trần sát thương nhận vào tối đa **20% Máu tối đa**.
    * **Đòn Bạo Kích & Kỹ Năng Thần Thông (Phá Kim Thân)**: Xé rách Kim Thân, trần sát thương nới rộng lên tới **30% Máu tối đa**.
* **Cân bằng hoàn hảo**: Boss không còn bị trâu lì hay kéo dài trận đấu quá lâu (chỉ cần 3 - 4 đòn đánh chất lượng là hạ gục Boss), nhưng vẫn triệt tiêu hoàn toàn lỗi One-Hit kill.
* **Hiệu ứng thị giác & âm thanh phong phú**:
  * Đánh thường chạm trần: Nảy chữ vàng kim `KIM THÂN!`, nhật ký log màu vàng `🛡️ [KIM THÂN]`.
  * Bạo kích hoặc Thần thông phá trần: Nảy chữ màu cam rực rỡ `PHÁ KIM THÂN!` (`#ff9100`), nhật ký log màu cam phát sáng `💥 [PHÁ KIM THÂN]`.
  * Âm thanh bảo hộ `playShield()` khi kích hoạt hộ thể.

---

## 🗼 8. HỆ THỐNG HƯ KHÔNG THÁP (ENDLESS TOWER SYSTEM)

Hệ thống **Hư Không Tháp** là chế độ khiêu chiến vô tận độc lập hoàn toàn với các ải cốt truyện, được thiết kế để thử thách cực hạn đạo hạnh của người chơi.

### ⚙️ Thuật Toán Sinh Quái Động (Procedural Scaling)
Chỉ số quái vật và phần thưởng được tính toán động theo số tầng $f$:
* $\text{Máu Quái (HP)} = 150 \times 1.08^f \times \text{Hệ số Boss/Tinh Anh}$
* $\text{Sát Thương (ATK)} = 18 \times 1.065^f \times \text{Hệ số Boss/Tinh Anh}$
* $\text{Phòng Thủ (DEF)} = 5 \times (1 + f \times 0.12)$
* $\text{Tu Vi Thưởng} = 100 \times 1.10^f$
* $\text{Linh Thạch Thưởng} = 80 \times 1.09^f$

### 👑 Phân Cấp Tầng Khiêu Chiến
* **Tầng Thường**: Dị Thú Hư Không tiêu chuẩn, tốc đánh 2.0s/đòn.
* **Tầng Tinh Anh** (chia hết cho 5): Thủ Lĩnh Hư Không (HP x1.5, ATK x1.3, tốc đánh 1.7s), sở hữu Kim Thân thường trần 25%, phá trần 40%.
* **Tầng Boss Cổ Đại** (chia hết cho 10): Trấn Tháp Cổ Ma (HP x2.5, ATK x1.8, tốc đánh 1.4s), sở hữu Kim Thân cổ đại trần 20%, phá trần 30%.

### ⏳ Cơ Chế Enrage Timer 60 Giây
* Mỗi trận đấu tháp có bộ đếm ngược **60.0 giây**.
* Nếu sau 60 giây quái chưa bị tiêu diệt, hư không cuồng bạo sẽ cắn nuốt người chơi, tự động xử thua do hết giờ (`isEnrageTimeout = true`).
* Thanh Enrage Bar hiển thị trực tiếp trên Sàn Đấu 2D, đổi màu đỏ nhấp nháy khi thời gian còn dưới 15 giây.

### 🎫 Cơ Chế Vé Ngày & Mua Vé Giá Cao Không Giới Hạn
* **Hồi phục miễn phí**: Mỗi ngày cấp lại 3 vé miễn phí nếu số vé hiện có $< 3$.
* **Bảo toàn vé đã mua**: Nếu người chơi đã mua nhiều hơn 3 vé (ví dụ 10 vé), khi sang ngày mới **không bị trừ** mà bảo lưu nguyên vẹn 10 vé.
* **Mua vé bằng Hỗn Nguyên Thạch**: Có thể mua thêm **Lệnh Bài Hư Không** không giới hạn với giá **5.000 🌀 Hỗn Nguyên Thạch (5.000 🌀)/vé** (đồng bộ tự động từ `item_tower_ticket` trong `items.js` làm Single Source of Truth):
  * Mua nhanh trên header Tab Tháp qua nút `➕ Mua Vé (5.000 🌀)`.
  * Hỗ trợ cơ chế tự động nén từ Linh Thạch: Nếu thiếu Hỗn Nguyên nhưng có đủ Linh Thạch tương đương (5 Nghìn Tỷ 💎), hệ thống sẽ tự động chuyển đổi giúp người chơi mua vé mượt mà.
  * Tự động hỏi mua vé khi người chơi bấm Khiêu Chiến hoặc Quét Nhanh lúc hết vé.

### ⚡ Tính Năng Quét Nhanh (Sweep) & Thưởng Hỗn Nguyên Tầng Cao
* Tự động mở khóa khi người chơi vượt qua **Tầng 10** trở lên.
* Tiêu hao 1 Lệnh Bài Hư Không để nhận ngay toàn bộ phần thưởng Tu Vi, Linh Thạch & Hỗn Nguyên từ Tầng 1 đến Tầng $\text{highestFloor} - 5$.
* **Cơ chế nén Hỗn Nguyên Tháp Tầng Cao**: Đối với các tầng tháp siêu cao khi phần thưởng đạt từ **100 Tỷ Linh Thạch** trở lên, hệ thống sẽ tự động trao thưởng bằng **🌀 Hỗn Nguyên Thạch** ($1 \text{ 🌀} = 1 \text{ Tỷ } 💎$), loại bỏ hoàn toàn nguy cơ tràn số học của JS khi tháp leo đến hàng trăm, hàng ngàn tầng!
* **Tình trạng rơi vật phẩm**: Hiện tại Hư Không Tháp tập trung chuyên sâu vào phần thưởng Tu Vi (hoặc Tinh Nguyên) và Linh Thạch (hoặc Hỗn Nguyên Thạch), tỷ lệ rơi vật phẩm tạm thời là `dropChance: 0` (chưa có trang bị/item rơi từ tháp).

### ⚔️ Trực Quan Hóa Sàn Đấu 2D & Tự Động Leo Tháp
* Người chơi theo dõi trọn vẹn trận đấu trong Sàn Đấu 2D mà không bị giật tab.
* Khi quái chết, thanh máu rút về 0% và có độ trễ 450ms để người chơi kịp nhìn thấy đòn đánh kết liễu.
* Bổ sung tính năng **`🔁 Tự Động Leo Tháp (3s)`**: Tự đếm ngược 3 giây để tiến thẳng lên tầng tiếp theo mà không cần bấm tay.
* Khi rút lui trong trận đấu tháp, hệ thống tự động đưa người chơi trở về đúng tab Hư Không Tháp.

---

## 🎖️ 10. HỆ THỐNG DANH HIỆU THẦN THÔNG & DANH HIỆU ẨN (TITLES SYSTEM)

Danh hiệu được mở khóa khi người chơi hoàn thành các chiến tích hiển hách. Khi trang bị, nhân vật nhận được các chỉ số buff vĩnh viễn:

* **Sơ Nhập Đạo Môn** (`title_so_nhap`): Bắt đầu tu tiên (HP +80, Vật lí +10, Phép +10).
* **Trảm Hùng Dũng Sĩ** (`title_tram_hung`): Trảm sát Cuồng Bạo Ma Hùng - Ải 3 (HP +300, Vật lí +35, Thủ +15).
* **Phong Lôi Kiếm Khách** (`title_phong_loi`): Trảm sát Thiết Vũ Điêu Vương - Ải 4 (Vật lí +75, Phép +45, Bạo +3%).
* **Liệt Diễm Chân Nhân** (`title_liet_diem`): Trảm sát Xích Diễm Ma Viên - Ải 6 (Phép +130, Kháng phép +40, HP +600).
* **Đồ Mãng Chân Quân** (`title_do_mang`): Trảm sát Huyết Lân Cự Mãng - Ải 7 (HP +1,800, Vật lí +160, Thủ +65, Kháng +65).
* **Hàng Long Tôn Giả** (`title_hang_long`): Trảm sát Hắc Thủy Bát Đầu Giao - Ải 9 (HP +4,500, Công +420, Bạo +5%).
* **Trảm Ma Thần Tướng** (`title_tram_ma`): Trảm sát Viễn Cổ Ma Thần - Ải 11 (HP +15,000, Công +1,300, Thủ/Kháng +350, Bạo +8%).
* **Ngọc Hư Tiên Quân** (`title_ngoc_hu`): Trảm sát Ngọc Hư Chiến Thần - Ải 15 (HP +1.2M, Công +50k, Thủ/Kháng +25k, Bạo +15%).
* **Hỗn Độn Chí Tôn** (`title_chi_ton`): Trảm sát Hỗn Độn Chúa Tể - Ải 16 (HP +5M, Công +150k, Thủ/Kháng +60k, Bạo +20%).
* **Vấn Đạo Thần Tôn** (`title_van_dao`): Vượt Ải 17 Vấn Đạo (HP +20M, Công +500k, Thủ/Kháng +200k, Bạo +25%).
* **Tinh Hà Chi Chủ** (`title_tinh_ha`): Vượt Ải 18 Tinh Hà Thần Điện (HP +80M, Công +1.5M, Thủ/Kháng +600k, Bạo +30%).
* **Đại Đạo Quy Nhất** (`title_dai_dao`): Vượt Ải 19 Đại Đạo Thần Cung (HP +300M, Công +5M, Thủ/Kháng +2M, Bạo +40%).
* **Thái Sơ Thần Quân** (`title_thai_so`): Vượt Ải 20 Thái Sơ Hỗn Độn Đàm (HP +1.2 Tỷ, Công +25M, Thủ/Kháng +10M, Bạo +45%).
* **Bất Hủ Đại Đạo Tối Thượng** (`title_bat_hu_dai_dao`): Vượt Ải 21 Vĩnh Hằng Luân Hồi Kính (HP +5 Tỷ, Công +100M, Thủ/Kháng +40M, Bạo +50%).
* **Hư Vô Chúa Tể** (`title_hu_vo`): Vượt [Ải 22: Hư Vô Bản Nguyên Cảnh], mở khóa Cảnh Giới Vô Cực (HP +20 Tỷ, Công +500M, Thủ/Kháng +200M, Bạo +55%).
* **Thông Huyền Kiếm Sĩ** (`title_dac_dao`): Lĩnh ngộ từ 5 bí kíp trở lên (Vật lí +70, Phép +70, Bạo +3%).
* **Vạn Pháp Thông Tri** (`title_van_phap`): Lĩnh ngộ toàn bộ bí kíp trong Tàng Kinh Các (HP +500k, Công +25k, Thủ/Kháng +12k, Bạo +10%).
* **Bất Hủ Chân Nhân** (`title_bat_hu`): Đạt cảnh giới Tạo Đảo trở lên (HP +3,500, Công +300, Thủ/Kháng +120).
* **🌿 Phê Cỏ (Cần Đạo Chân Nhân)** (`title_phe_co`): Danh hiệu ẩn chuyên bế quan tu luyện, **tăng tốc độ đả tọa AFK gấp 5 lần** (+500% tốc độ tu vi tự nhiên), nhưng cấm mang vào phó bản/khiêu chiến (tự động tháo khi vào trận).

---

## 🎒 11. TÚI TRỮ VẬT CÀN KHÔN & ĐAN DƯỢC SIÊU CẤP

1. **Gộp Số Lượng Vật Phẩm (Stacking)**: Đan dược cùng ID được gộp thành 1 ô duy nhất kèm huy hiệu số lượng (ví dụ: `x25`).
2. **Tính Năng Dùng Nhanh (Dùng Hết)**: Với các đan dược tu vi, người chơi có thể nhấn **Dùng Hết** để lập tức tiêu thụ toàn bộ đan dược cùng loại trong túi chỉ với 1 thao tác an toàn.
3. **Tính Năng Mua Hết Đan Dược (`⚡ Mua Hết`)**: Trên mỗi thẻ đan dược tại Bách Bảo Các, bổ sung nút `⚡ Mua Hết` cho phép người chơi dùng toàn bộ Linh Thạch hoặc Hỗn Nguyên hiện có mua số lượng tối đa chỉ với 1 cú nhấp chuột.
4. **Đan Dược Siêu Cấp Chí Tôn & Quy Đổi Tinh Nguyên**:
   * **Thái Sơ Hỗn Độn Đan** (`pill_thai_so_hon_don`): Yêu cầu Đại Đạo Chí Cao, tăng ngay **+60 Tỷ Tu Vi** (ở Vô Cực quy đổi thành **+60 🌌 Tinh Nguyên**). Giá: 120 Tỷ Linh Thạch.
   * **Vĩnh Hằng Bất Hủ Luân Hồi Đan** (`pill_bat_hu_luan_hoi`): Yêu cầu Đại Đạo Chí Cao, tăng ngay **+500 Tỷ Tu Vi** (ở Vô Cực quy đổi thành **+500 🌌 Tinh Nguyên**). Giá: 500 Tỷ Linh Thạch.
5. **Lệnh Bài Hư Không (`item_tower_ticket`)**: Dùng để khiêu chiến Hư Không Tháp, mua với giá **5.000 🌀 Hỗn Nguyên Thạch (5.000 🌀)**, hỗ trợ nút Dùng (+1) và Dùng Hết (+toàn bộ) trong túi đồ. Giá vé được đồng bộ động khắp hệ thống Tháp.
6. **Cuộn Giấy Đổi Tên (`item_rename_scroll`)**: Cho phép người chơi đặt lại đạo hiệu nhân vật tùy thích (tối đa 20 ký tự) trên Thiên Đạo Bia.
7. **Tẩy Tủy Đan (`pill_tay_tuy`)**: Thu hồi 100% điểm tiềm năng để phân bổ lại, giá bán 5,000 Linh Thạch và tỉ lệ rơi cực hiếm (3%) khi đánh Boss.

---

## ⚔️ 12. SÀN ĐẤU 2D & ĐỘNG CƠ CHIẾN ĐẤU (COMBAT ENGINE)

* **Vòng Lặp Chiến Đấu 100ms (Tick Rate 10Hz)**: Đảm bảo độ mượt mà, tính toán sát thương, thời gian hồi chiêu và nhịp xuất chiêu chuẩn xác.
* **Tính Năng Tăng Tốc Độ Trận Đấu (Speed Multiplier: x1, x2, x3)**: Chuyển đổi tốc độ đánh quái nhanh gấp 1, 2 hoặc 3 lần thông qua nút `⚡ Tốc Độ: x1 / x2 / x3`. Tăng tốc đồng bộ nhịp đánh, hồi chiêu, Enrage timer và rút ngắn thời gian đếm ngược lặp ải, lưu trạng thái vào `localStorage`.
* **Độ Trễ Đòn Kết Liễu (450ms)**: Khi quái vật hoặc người chơi cạn máu (`<= 0`), thanh máu lập tức rút về 0% và đòn đánh bộc phát trọn vẹn, sau 450ms (có điều chỉnh theo tốc độ trận đấu) modal kết quả mới xuất hiện giúp người chơi quan sát rõ ràng diễn biến.
* **Cơ Chế Tự Động (Auto Combat)**: Tự động kích hoạt các kỹ năng đã hồi chiêu, ưu tiên từ trái sang phải.
* **Tự Đánh Lại (Auto-Repeat Ải Thường)**: Tự động đếm ngược 3s và lặp lại khiêu chiến ải vừa đánh thắng.
* **Tự Động Leo Tháp (Auto-Climb Hư Không Tháp)**: Tự động đếm ngược 3s và tiến lên tầng tháp tiếp theo liên tục.
* **Hệ Thống Thanh Máu Kép (HP & Shield)**: Hiển thị thanh máu chính màu đỏ/xanh lá và thanh khiên bảo hộ màu xanh ngọc xếp chồng trực quan.
* **Cơ Chế Kim Thân Chống One-Hit & Phá Kim Thân**: Tích hợp thuật toán `applyDamageCap()` trực tiếp vào vòng lặp chiến đấu cho cả đánh thường và kỹ năng pháp thuật/vật lí, kèm nhật ký chiến đấu `[KIM THÂN]` và `[PHÁ KIM THÂN]`.
* **Định Dạng Số Lớn Tối Tân (`formatNumber` & `formatHp`)**: Tự động rút gọn các con số hàng triệu, hàng tỷ, hàng nghìn tỷ (`Tr`, `Tỷ`, `Nghìn Tỷ`) với độ chính xác cao, ngăn chặn tràn số làm vỡ giao diện.

---

## 📱 13. HỆ THỐNG GIAO DIỆN ĐA NỀN TẢNG (RESPONSIVE SYSTEM)

Trò chơi áp dụng nguyên tắc **Responsive Mobile & Tablet Preservation**:
* **Bảo Toàn 100% Giao Diện PC**: Trên màn hình máy tính để bàn và laptop lớn (> 1024px), giao diện giữ nguyên bố cục 3 cột kinh điển hoàn hảo.
* **Tối Ưu Máy Tính Bảng (Tablet <= 1024px)**: Co giãn thông minh các lưới vật phẩm (Túi đồ, Bách Bảo Các, Tàng Kinh Các).
* **Tối Ưu Điện Thoại Di Động (Mobile <= 768px & Small <= 480px)**:
  * Bố cục 3 cột tự động xếp chồng theo chiều dọc một cách gọn gàng, liền mạch.
  * Bảng điểm cộng tiềm năng chuyển đổi sang dạng nút bấm ngón tay cái tối ưu cho thao tác chạm màn hình cảm ứng.
  * Vòng tròn đả tọa và avatar nhân vật co giãn kích thước hài hòa.
* **Xử Lý Cảm Ứng & Chống Kẹt Tooltip**: Tự động lắng nghe sự kiện chạm (`touchstart`) và cuộn trang (`scroll`) để ẩn dứt điểm popup tooltip vật phẩm/kỹ năng, ngăn ngừa hoàn toàn tình trạng tooltip bị đơ dính trên màn hình điện thoại.

---

## 💾 14. HỆ THỐNG LƯU TIẾN TRÌNH & SAVE MIGRATION VERSION 3 (STORAGE & AFK ENGINE)

1. **Chuẩn Bản Lưu Phiên Bản 3 (`saveVersion: 3`)**:
   * Bổ sung các thuộc tính độc lập: `honNguyen`, `tinhNguyen`, `isVoCuc`.
   * **Cơ chế di trú tự động (Auto-Migration V2 -> V3)**:
     * Người chơi cũ có bản lưu V1, V2 khi tải game sẽ tự động được nâng cấp lên V3 an toàn tuyệt đối.
     * **Cơ chế Phương án A**: Người chơi đã đạt hoặc vượt mốc Tầng 100 Đại Đạo Chí Cao Vô Thượng (`realmIndex >= 11 && tierIndex >= 99`) khi nạp save cũ sẽ giữ nguyên số tầng đã đạt, tu vi thừa tự động nén sang Tinh Nguyên để bảo toàn chống tràn số, nhưng **bị khóa đột phá** cho đến khi tiêu diệt thành công [Ải 22: Hư Vô Bản Nguyên Cảnh] nhằm bảo đảm trọn vẹn trải nghiệm thử thách mới.
2. **Tự Động Lưu (Auto-Save)**: Lưu toàn bộ trạng thái nhân vật vào `localStorage` mỗi 5 giây với cấu trúc bảo toàn dữ liệu (`deep-merge`) chống lỗi mất dữ liệu save cũ.
3. **Treo Máy Ngoại Tuyến (Offline AFK)**: Khi người chơi tắt máy hoặc rời game tối thiểu 10 giây (và tối đa 24 giờ), khi đăng nhập lại hệ thống sẽ tự động tính toán số Tu Vi nhận được dựa trên tốc độ AFK của cảnh giới và gửi thông báo chúc mừng.
4. **Chống Throttling Trình Duyệt**: Thuật toán Delta-time tính toán thời gian thực giữa các nhịp tick, đảm bảo tu vi không bị mất mát khi chuyển tab trình duyệt hoặc thu nhỏ cửa sổ.
5. **Sao Lưu Đám Mây Độc Lập (Export / Import Save String)**:
   * **Xuất mã lưu**: Mã hóa toàn bộ dữ liệu người chơi thành chuỗi ký tự Base64 an toàn để người chơi lưu trữ vào notepad.
   * **Nhập mã lưu**: Giải mã chuỗi Base64 và khôi phục tiến trình ngay lập tức trên bất kỳ máy tính hoặc trình duyệt nào khác.

---

## 🚀 15. HƯỚNG DẪN CÀI ĐẶT & TRẢI NGHIỆM

Game hoàn toàn độc lập và không yêu cầu cài đặt môi trường phức tạp (không cần npm install, không cần build step).

### Cách 1: Chạy Trực Tiếp (Khuyến nghị cho người chơi)
1. Mở thư mục `d:/HOCTAP/TuDo/Kiemtien/`.
2. Nhấp đúp chuột vào file **`start_game.bat`** (hoặc mở trực tiếp file **`index.html`** bằng trình duyệt Chrome, Edge, Brave, Cốc Cốc, Firefox).
3. Thưởng thức game ngay lập tức!

### Cách 2: Chạy Qua Server Node.js Tĩnh (Khuyến nghị cho mạng LAN / Dev)
1. Mở PowerShell hoặc Terminal tại thư mục game:
   ```powershell
   cd d:\HOCTAP\TuDo\Kiemtien
   node server.js
   ```
2. Truy cập trình duyệt tại địa chỉ:
   ```
   http://127.0.0.1:3000
   ```

---

## 🎯 16. ĐỊNH HƯỚNG META CHIẾN THUẬT (GAMEPLAY META BUILDS)

Nhờ hệ thống điểm tiềm năng khuếch đại %, 4 hệ kỹ năng và cơ chế giáp/kháng phép độc lập, trò chơi hỗ trợ 3 trường phái Meta rõ rệt:

1. **⚔️ Kiếm Tu / Thể Tu (Physical Burst & Crit)**:
   * Dồn 100% điểm vào **Vật Lí** (+5 Công, +0.35% Sát thương, mỗi 20đ +1% Bạo kích).
   * Lắp 3 chiêu Vật Lí, bạo kích liên tục kích hoạt `PHÁ KIM THÂN`, dọn quái và leo Hư Không Tháp thần tốc.
2. **🔮 Pháp Tu / Thần Thông Đại Đạo (Magic Caster & Sustain)**:
   * Dồn 100% điểm vào **Phép** (+5 Công Phép, +0.35% Sát thương, mỗi 20đ +1 Kháng phép).
   * Kỹ năng hồi máu scale trực tiếp theo Công Phép, sốc sát thương phép bỏ qua giáp vật lí của quái và tự hồi máu đầy bình.
3. **🛡️ Bất Diệt Kim Thân / Thể Phách Vô Song (Tanker & Shield)**:
   * Dồn 100% điểm vào **Máu** (+30 HP, +0.4% Tổng Máu, mỗi 10đ +1 Thủ & +1 Kháng).
   * Kỹ năng hộ thể tạo khiên tính theo % Max HP, biến người chơi thành pháo đài bất tử trước mọi đòn sốc sát thương của Boss Cổ Đại.

Người chơi có thể tự do dùng **Tẩy Tủy Đan** để hoán chuyển giữa các Meta này bất kỳ lúc nào!

---

*Chúc các vị đạo hữu sớm đắc đạo phi thăng, ngự trị trên đỉnh cao nhất của Đại Đạo Chí Cao Vô Thượng!*
