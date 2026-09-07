# TIÊN ĐẠO TRƯỜNG SINH (KIẾM TIÊN 2.0)
### Trò Chơi Tu Tiên 2D Nhàn Rỗi (Idle RPG) • Nghịch Thiên Tu Đạo

---

## 📖 1. TỔNG QUAN DỰ ÁN

**Tiên Đạo Trường Sinh** (phiên bản Kiếm Tiên 2.0) là một tựa game web RPG tu tiên nhàn rỗi (Idle RPG) được xây dựng hoàn toàn bằng công nghệ Web thuần túy (**HTML5, Vanilla CSS3, JavaScript ES6+**), không sử dụng bất kỳ thư viện hoặc framework bên thứ ba nào.

Trò chơi mô phỏng trọn vẹn lộ trình tu chân nghịch thiên cải mệnh: từ một phàm nhân ngưng tụ Tôi Khí, khai phá Linh Hải, vượt qua cửu đại thiên kiếp, vấn đạo hư không, cho đến khi bước chân lên đỉnh cao nhất của vũ trụ - **Đại Đạo Chí Cao Vô Thượng**.

### ✨ Điểm Nổi Bật Chính
* **Đồ Họa & Giao Diện Dark Fantasy**: Thiết kế hiện đại theo phong cách huyền huyễn Á Đông, tối ưu một màn hình dashboard trực quan, hiệu ứng phát sáng Neon, viền kim loại và kính mờ (Glassmorphism).
* **Hiệu Ứng Hạt Canvas (VFX Engine)**: Hệ thống canvas dựng linh khí đả tọa, kiếm khí vung chém, sấm sét lôi kiếp, hỏa cầu bùng nổ và hiệu ứng số sát thương nảy động (Floating Combat Text).
* **Bộ Máy Âm Thanh Độc Lập (Web Audio API Synth)**: Tổng hợp âm thanh chém kiếm, niệm phép, sét đánh, đột phá, chiến thắng/thất bại theo thời gian thực bằng thuật toán dao động âm, không phụ thuộc file MP3/WAV bên ngoài.
* **12 Đại Cảnh Giới Siêu Cấp & Cơ Chế Tầng Vô Hạn**: Phá bỏ giới hạn truyền thống với cơ chế vượt ải để thăng cảnh giới, tích lũy tầng tu vi vô hạn và tăng trưởng chỉ số không giới hạn.
* **Hệ Thống Chiến Đấu Sàn Đấu 2D Động**: Đấu trường thời gian thực với cơ chế tự động xuất chiêu (Auto), tự động lặp lại ải (Auto-Repeat), đòn đánh thường kết hợp 3 kỹ năng chủ động.
* **Túi Trữ Vật Thông Minh**: Hỗ trợ gộp số lượng (stacking), dùng nhanh hàng loạt (Dùng Hết) đan dược cùng loại chỉ với 1 cú nhấp chuột, tính năng bán nhanh (Bán Hết).
* **Hệ Thống Danh Hiệu & Đổi Tên**: Mở khóa danh hiệu từ trảm Boss và lĩnh ngộ bí kíp, mang lại hiệu ứng buff chỉ số mạnh mẽ; cho phép đổi đạo hiệu với Cuộn Giấy Đổi Tên.
* **Cơ Chế Treo Máy AFK Hoàn Hảo**: Tích lũy tu vi tự động khi online (có delta-time chống lag trình duyệt) và tính toán tu vi khi offline ngoại tuyến lên đến 24 giờ.

---

## 📁 2. CẤU TRÚC THƯ MỤC & MÃ NGUỒN

```
d:/HOCTAP/TuDo/Kiemtien/
├── css/
│   ├── main.css            # Hệ thống biến CSS (Design Tokens), layout nền, typography, reset
│   ├── components.css      # Toàn bộ UI components: dashboard 3 cột, bảng điểm, túi đồ, tàng kinh các, modal
│   └── combat.css          # Giao diện sàn đấu 2D, thanh máu/khiên động, nút kỹ năng, nhật ký chiến đấu
├── js/
│   ├── data/
│   │   ├── realms.js       # Dữ liệu 12 đại cảnh giới, công thức tu vi, tốc độ AFK, điều kiện vượt ải
│   │   ├── skills.js       # Dữ liệu toàn bộ bí kíp kỹ năng (Vật lí, Phép, Khiên, Hồi máu), logic so sánh sắp xếp
│   │   ├── items.js        # Dữ liệu trang bị (Nón, Giáp, Vũ khí), đan dược, 7 bậc phẩm cấp, logic sắp xếp
│   │   ├── titles.js       # Dữ liệu hệ thống Danh Hiệu Thần Thông, điều kiện mở khóa, chỉ số buff
│   │   └── stages.js       # Dữ liệu 19 Ải chiến đấu (từ Ải 1 Thảo Dược Viên đến Ải 19 Đại Đạo Thần Cung)
│   ├── engine/
│   │   ├── audio.js        # Bộ máy tổng hợp âm thanh procedural qua Web Audio API (Synth)
│   │   ├── particles.js    # Canvas particle engine: linh khí, kiếm khí, sấm sét, nảy số sát thương, chí mạng
│   │   ├── combat.js       # Bộ máy điều khiển chiến đấu 2D: tính sát thương, kích hoạt kỹ năng, kết quả ải
│   │   └── storage.js      # Lưu trữ LocalStorage, xuất/nhập mã sao lưu (Base64), đồng bộ dữ liệu
│   ├── state/
│   │   └── player.js       # Quản lý trạng thái nhân vật: tu vi, điểm tiềm năng, trang bị, danh hiệu, túi đồ
│   ├── ui/
│   │   └── ui.js           # Bộ điều khiển giao diện (UIController): render các tab, modal, format số lớn, sự kiện
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

### ⚙️ Quy Tắc Đột Phá & Cơ Chế Tầng Vô Hạn (Infinite Tiers)
1. **Từ Tôi Khí đến Ngọc Điện (Cảnh giới 1 - 8)**:
   * Mỗi cảnh giới bao gồm **10 tầng chuẩn**: Tầng 1 ➔ Tầng 2 ➔ ... ➔ Tầng 9 ➔ Đỉnh Phong.
   * Khi ở Đỉnh Phong và tích lũy đủ Tu Vi, nhấn Đột Phá sẽ tiến lên cảnh giới kế tiếp (Tầng 1).
2. **Từ Đỉnh Cấp Ngai, Vô Thượng Lộ, Vạn Vì Tinh Tú, Đại Đạo Chí Cao**:
   * **Tầng Tu Vi Tăng Vô Hạn**: Không bị khống chế ở mốc 10 tầng. Người chơi có thể đột phá lên `Tầng 11`, `Tầng 12`, ..., `Tầng 100+`.
   * **Điều Kiện Khóa Cảnh Giới Bằng Ải**:
     * Đột phá từ *Đỉnh Cấp Ngai* lên *Vô Thượng Lộ*: **Bắt buộc vượt Ải 17 (Vấn Đạo)**.
     * Đột phá từ *Vô Thượng Lộ* lên *Vạn Vì Tinh Tú*: **Bắt buộc vượt Ải 18 (Tinh Hà Thần Điện)**.
     * Đột phá từ *Vạn Vì Tinh Tú* lên *Đại Đạo Chí Cao Vô Thượng*: **Bắt buộc vượt Ải 19 (Đại Đạo Thần Cung)**.
   * **Nếu chưa vượt ải yêu cầu**: Đột phá vẫn thành công, nhận trọn vẹn điểm tiềm năng và tăng chỉ số cơ bản, nhưng tầng tu vi sẽ tiếp tục tăng lũy tiến trong cảnh giới hiện tại.
   * **Nếu đã vượt ải yêu cầu**: Đột phá sẽ thăng hoa lên Đại Cảnh Giới tiếp theo!

---

## 📊 4. HỆ THỐNG ĐIỂM TIỀM NĂNG & THUỘC TÍNH (STATS SYSTEM)

### Quy Tắc Cộng Điểm & Cơ Chế Khuếch Đại Phần Trăm (%)
* Mỗi lần đột phá tăng 1 tầng tu vi (kể cả các tầng vô hạn), người chơi nhận đúng **+4 Điểm Tiềm Năng**.
* Áp dụng **Phương Án 1: Cơ Chế Khuếch Đại Phần Trăm (%) kết hợp Chỉ Số Phẳng**:
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

### 7 Bậc Phẩm Cấp (Rarity)
Mỗi phẩm cấp có màu sắc, khung viền và hiệu ứng hào quang tương ứng:
* ⚪ **Phàm Phẩm** (`pham`): Trắng xám (`#b0bec5`)
* 🔵 **Linh Phẩm** (`linh`): Xanh lam (`#4fc3f7`)
* 🟣 **Huyền Phẩm** (`huyen`): Tím huyền bí (`#ba68c8`)
* 🟠 **Địa Phẩm** (`dia`): Cam kim quang (`#ffb74d`)
* 🔴 **Thiên Phẩm** (`thien`): Đỏ kim (`#ff5252`)
* 🟢 **Tiên Phẩm** (`tien`): Xanh ngọc lục bảo (`#00e676`)
* 🟡 **Thánh Phẩm** (`thanh`): Vàng kim chí tôn (`#ffd700`)

### Thuật Toán Sắp Xếp Tự Động Chuẩn Mực
Tất cả danh sách vật phẩm trong túi đồ, cửa hàng Bách Bảo Các và Tàng Kinh Các đều được sắp xếp chặt chẽ theo thứ tự:
$$\text{Cảnh Giới Yêu Cầu} \longrightarrow \text{Phẩm Cấp / Tầng} \longrightarrow \text{Giá Bán} \longrightarrow \text{Tên ABC}$$

### Tính Năng Bán Nhanh Trang Bị Trùng Lặp
* **Bán trên từng thẻ trang bị**: Khi có từ 2 món trở lên (`count > 1`), bổ sung các nút `Bán 1`, `Bán Trùng` (giữ lại 1 bản an toàn trong túi, bán sạch các bản thừa) và `Bán Hết`.
* **Bán Nhanh Toàn Diện (`⚡ Bán Đồ Trùng`)**: Quét toàn bộ nón, giáp, vũ khí trùng trong túi, hiển thị modal xem trước số lượng và tổng Linh Thạch thu về, kèm cơ chế an toàn giữ lại 1 bản cho mỗi loại trang bị chưa mặc.
* **Bảo vệ tuyệt đối**: Trang bị đang mặc trên người không bao giờ bị bán; đan dược và bí kíp võ học không bị ảnh hưởng.

---

## 📜 6. HỆ THỐNG KỸ NĂNG & TÀNG KINH CÁC (SKILL SYSTEM)

### 3 Ô Kỹ Năng Xuất Trận
Người chơi có thể tùy biến lắp đặt 3 kỹ năng chủ động vào 3 ô xuất trận để dùng trong Sàn Đấu 2D. Kỹ năng có thời gian hồi chiêu (Cooldown) độc lập.

### 4 Hệ Kỹ Năng Chuyên Biệt
1. **⚔️ Vật Lí**: Gây sát thương dựa trên % Sát Thương Vật Lí của nhân vật, trừ bớt một phần giáp của mục tiêu. Có khả năng kích hoạt đòn đánh chí mạng (Bạo kích).
2. **🔮 Pháp Thuật**: Gây sát thương dựa trên % Sát Thương Phép, trừ kháng phép quái vật, đi kèm hiệu ứng hoạt họa hỏa cầu, lôi đình hoặc hắc động thiên thạch.
3. **🛡️ Hộ Thể (Khiên)**: Tạo lớp giáp bảo hộ hấp thụ sát thương dựa trên % Máu tối đa của nhân vật. Lớp khiên hiển thị trực tiếp trên thanh máu của nhân vật.
4. **💚 Trị Liệu**: Khôi phục sinh mệnh tức thì bằng công thức: $\text{Phép} \times \text{Hệ số} + 15\% \text{ Max HP}$.

### Tàng Kinh Các (NPC Truyền Công)
* Cho phép mua bí kíp bằng Linh Thạch khi đạt đủ điều kiện Cảnh giới & Tầng tu vi.
* Trang bị bộ lọc trực quan: lọc theo Hệ kỹ năng, lọc theo Cảnh giới, lọc theo trạng thái (Có thể học / Chưa học / Đã học), ô tìm kiếm tên bí kíp.

---

## 🗺️ 7. HỆ THỐNG 19 ẢI CHIẾN ĐẤU & ĐẠI BOSS (STAGES DATABASE)

| Ải | Tên Ải | Khu Vực | Yêu Cầu | Boss / Quái | HP Boss | Sát Thương | Phần Thưởng Chính |
|:---:|:---|:---|:---:|:---|:---:|:---:|:---|
| 1 | Thảo Dược Viên Ngoại Vi | Thanh Vân Ngoại Vi | Tôi Khí T1 | Linh Thảo Thỏ Yêu | 220 | 16 | 35 Tu Vi • 15 Linh Thạch |
| 2 | Bích Lạc Khê Cốc | Thanh Vân Ngoại Vi | Tôi Khí T3 | Hắc Thủy Xà | 550 | 38 | 90 Tu Vi • 35 Linh Thạch |
| 3 | Hắc Sa Động Phủ | Thanh Vân Ngoại Vi | Tôi Khí T6 | Cuồng Bạo Ma Hùng 👑 | 1,400 | 85 | 220 Tu Vi • 80 Linh Thạch |
| 4 | Phong Lôi Lãm Nhai | Thanh Vân Ngoại Vi | Tôi Khí Đỉnh | Thiết Vũ Điêu Vương 👑 | 3,200 | 180 | 500 Tu Vi • 180 Linh Thạch |
| 5 | Tử Trúc Lâm Uyên | U Minh Cốc | Ngưng Khí T1 | U Minh Lang Vực | 6,500 | 320 | 1,100 Tu Vi • 400 Linh Thạch |
| 6 | Hỏa Vân Động | U Minh Cốc | Ngưng Khí T4 | Xích Diễm Ma Viên 👑 | 15,000 | 680 | 2,400 Tu Vi • 900 Linh Thạch |
| 7 | Vạn Thú Tế Đàn | U Minh Cốc | Ngưng Khí Đỉnh | Huyết Lân Cự Mãng 👑 | 35,000 | 1,450 | 5,500 Tu Vi • 2,000 Linh Thạch |
| 8 | Bích Hải Triều Sinh | Vô Tận Linh Hải | Linh Hải T1 | Thủy Tinh Cự Hạt | 85,000 | 3,200 | 12,000 Tu Vi • 4,500 Linh Thạch |
| 9 | Đoạn Long Thủy Phủ | Vô Tận Linh Hải | Linh Hải Đỉnh | Hắc Thủy Bát Đầu Giao 👑 | 300,000 | 9,800 | 45,000 Tu Vi • 15,000 Linh Thạch |
| 10 | Phù Không Cổ Đảo | Cổ Đảo Bí Cảnh | Tạo Đảo T1 | Cổ Giáp Nham Thạch Thú | 850,000 | 26,000 | 120k Tu Vi • 45k Linh Thạch |
| 11 | Trấn Ma Phong Ấn | Cổ Đảo Bí Cảnh | Tạo Đảo Đỉnh | Viễn Cổ Ma Thần Tàn Hồn 👑 | 2.8 Tr | 75,000 | 350k Tu Vi • 150k Linh Thạch |
| 12 | Thần Mộc Sâm Lâm | Nguyên Linh Cấm Địa | Nguyên Linh Thụ | Huyết Đằng Yêu Thụ 👑 | 10 Tr | 220,000 | 1.2 Tr Tu Vi • 500k Linh Thạch |
| 13 | Lôi Đình Tế Đàn | Tạo Hóa Tiên Cảnh | Tạo Hóa Đài | Diệt Thế Cửu Thiên Lôi Thú 👑 | 35 Tr | 650,000 | 4.5 Tr Tu Vi • 1.8 Tr Linh Thạch |
| 14 | Thông Thiên Đỉnh | Thông Thiên Cực Cảnh | Thông Thiên Trụ | Kình Thiên Thần Tướng 👑 | 140 Tr | 2.2 Tr | 18 Tr Tu Vi • 7 Tr Linh Thạch |
| 15 | Bạch Ngọc Tiên Cung | Cửu Tiêu Ngọc Điện | Ngọc Điện | Ngọc Hư Chiến Thần 👑 | 600 Tr | 7.5 Tr | 75 Tr Tu Vi • 30 Tr Linh Thạch |
| 16 | Cửu Trọng Ngai Vàng | Đỉnh Cấp Tiên Giới | Đỉnh Cấp Ngai | Hỗn Độn Chúa Tể 👑 | 3.5 Tỷ | 35 Tr | 350 Tr Tu Vi • 150 Tr Linh Thạch |
| 17 | **Vấn Đạo** | **Thiên Ngoại Hư Không** | **Đỉnh Cấp Ngai** | **Hóa Thân Vấn Đạo 👑** | **100 Tỷ** | **10 Triệu** | **100 Tr Tu Vi • 1 Tỷ Linh Thạch** |
| 18 | **Tinh Hà Thần Điện** | **Vô Thượng Tinh Vực** | **Vô Thượng Lộ** | **Tinh Hà Thần Long 👑** | **500 Tỷ** | **35 Triệu** | **500 Tr Tu Vi • 5 Tỷ Linh Thạch** |
| 19 | **Đại Đạo Thần Cung** | **Chí Cao Vĩnh Hằng** | **Vạn Vì Tinh Tú** | **Hư Vô Thần Đế 👑** | **2.500 Tỷ** | **120 Triệu** | **2 Tỷ Tu Vi • 25 Tỷ Linh Thạch** |

---

## 🎖️ 8. HỆ THỐNG DANH HIỆU THẦN THÔNG (TITLES SYSTEM)

Danh hiệu được mở khóa khi người chơi hoàn thành các chiến tích hiển hách (trảm sát Boss, lĩnh hội bí kíp, đạt cảnh giới cao). Khi trang bị danh hiệu, nhân vật nhận được các chỉ số buff vĩnh viễn:

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
* **Thông Huyền Kiếm Sĩ** (`title_dac_dao`): Lĩnh ngộ từ 5 bí kíp trở lên (Vật lí +70, Phép +70, Bạo +3%).
* **Vạn Pháp Thông Tri** (`title_van_phap`): Lĩnh ngộ toàn bộ bí kíp trong Tàng Kinh Các (HP +500k, Công +25k, Thủ/Kháng +12k, Bạo +10%).
* **Bất Hủ Chân Nhân** (`title_bat_hu`): Đạt cảnh giới Tạo Đảo trở lên (HP +3,500, Công +300, Thủ/Kháng +120).

---

## 🎒 9. TÚI TRỮ VẬT CÀN KHÔN & CƠ CHẾ ĐAN DƯỢC

1. **Gộp Số Lượng Vật Phẩm (Stacking)**: Các đan dược hoặc vật phẩm tiêu hao cùng ID được gộp thành 1 ô duy nhất kèm huy hiệu số lượng (ví dụ: `x25`), giúp túi đồ luôn tinh gọn.
2. **Tính Năng Dùng Nhanh (Dùng Hết)**: Với các đan dược tăng Tu Vi, người chơi có thể nhấn **Dùng Hết** để lập tức tiêu thụ toàn bộ đan dược cùng loại trong túi chỉ với 1 thao tác, thuật toán cộng gộp tu vi an toàn tuyệt đối, không gây lag giao diện.
3. **Tính Năng Bán Hết (Bán Nhanh)**: Cho phép thanh lý toàn bộ số lượng của một vật phẩm rác cùng lúc để thu hồi Linh Thạch nhanh chóng.
4. **Kiểm Tra Cảnh Giới Chặt Chẽ**: Đan dược cấp cao đòi hỏi cảnh giới tương xứng mới có thể hấp thụ linh khí. Nếu chưa đủ cảnh giới, hệ thống sẽ từ chối và thông báo rõ ràng yêu cầu.
5. **Cân Bằng Kinh Tế Tẩy Tủy Đan**:
   * Tăng giá bán trong tiệm lên 5,000 Linh Thạch.
   * Giảm tỷ lệ rơi từ các ải xuống mức cực hiếm (3% khi kích hoạt rơi đồ), giữ vững giá trị bảo vật quý giá cho người chơi.
6. **Cuộn Giấy Đổi Tên**: Pháp bảo đặc biệt cho phép người chơi đặt lại đạo hiệu nhân vật tùy thích (tối đa 20 ký tự) trên Thiên Đạo Bia.

---

## ⚔️ 10. SÀN ĐẤU 2D & ĐIỀU KHIỂN CHIẾN ĐẤU (COMBAT ENGINE)

* **Vòng Lặp Chiến Đấu 100ms (Tick Rate 10Hz)**: Đảm bảo độ mượt mà, tính toán sát thương, thời gian hồi chiêu và nhịp xuất chiêu chuẩn xác.
* **Cơ Chế Tự Động (Auto Combat)**: Tự động kích hoạt các kỹ năng đã hồi chiêu, ưu tiên từ trái sang phải.
* **Tự Đánh Lại (Auto-Repeat)**: Tự động đếm ngược 3 giây và lặp lại khiêu chiến ải vừa đánh thắng, hỗ trợ người chơi cày cấp và farm trang bị tiện lợi.
* **Hệ Thống Thanh Máu Kép (HP & Shield)**: Hiển thị thanh máu chính màu đỏ/xanh lá và thanh khiên bảo hộ màu xanh ngọc xếp chồng trực quan.
* **Định Dạng Số Lớn Tối Tân (`formatNumber` & `formatHp`)**: Tự động rút gọn các con số hàng triệu, hàng tỷ, hàng nghìn tỷ (`Tr`, `Tỷ`, `Nghìn Tỷ`) với độ chính xác cao, ngăn chặn hiện tượng tràn số làm hỏng bố cục CSS.

---

## 💾 11. HỆ THỐNG LƯU TIẾN TRÌNH (STORAGE & AFK ENGINE)

1. **Tự Động Lưu (Auto-Save)**: Lưu toàn bộ trạng thái nhân vật vào `localStorage` mỗi 5 giây.
2. **Treo Máy Ngoại Tuyến (Offline AFK)**: Khi người chơi tắt máy hoặc rời game tối thiểu 10 giây (và tối đa 24 giờ), khi đăng nhập lại hệ thống sẽ tự động tính toán số Tu Vi nhận được dựa trên tốc độ AFK của cảnh giới và gửi thông báo chúc mừng.
3. **Chống Throttling Trình Duyệt**: Thuật toán Delta-time tính toán thời gian thực giữa các nhịp tick, đảm bảo tu vi không bị mất mát khi chuyển tab trình duyệt hoặc thu nhỏ cửa sổ.
4. **Sao Lưu Đám Mây Độc Lập (Export / Import Save String)**:
   * **Xuất mã lưu**: Mã hóa toàn bộ dữ liệu người chơi thành chuỗi ký tự Base64 an toàn để người chơi lưu trữ vào notepad.
   * **Nhập mã lưu**: Giải mã chuỗi Base64 và khôi phục tiến trình ngay lập tức trên bất kỳ máy tính hoặc trình duyệt nào khác.

---

## 🚀 12. HƯỚNG DẪN CÀI ĐẶT & TRẢI NGHIỆM

Game hoàn toàn độc lập và không yêu cầu cài đặt môi trường phức tạp (không cần npm install, không cần build step).

### Cách 1: Chạy Trực Tiếp (Khuyến nghị cho người chơi)
1. Mở thư mục `d:/HOCTAP/TuDo/Kiemtien/`.
2. Nhấp đúp chuột vào file **`start_game.bat`** (hoặc mở trực tiếp file **`index.html`** bằng trình duyệt Chrome, Edge, Brave, Cốc Cốc, Firefox).
3. Thưởng thức game ngay lập tức!

### Cách 2: Chạy Qua Server Node.js Tĩnh (Khuyến nghị cho nhà phát triển)
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

## 📝 13. TỔNG KẾT & ĐỊNH HƯỚNG PHÁT TRIỂN

Dự án **Tiên Đạo Trường Sinh (Kiếm Tiên 2.0)** đã hoàn thiện toàn diện tất cả các khía cạnh của một tựa game tu tiên hiện đại:
* Lộ trình phát triển nhân vật liền mạch từ sơ cấp đến cực hạn vũ trụ.
* Hệ thống dữ liệu phong phú, cân bằng chỉ số tốt, logic mở khóa rõ ràng.
* Mã nguồn thuần khiết, sạch đẹp, phân tách mô-đun rõ ràng giữa Dữ liệu (`data`), Động cơ (`engine`), Trạng thái (`state`) và Giao diện (`ui`).

*Chúc các vị đạo hữu sớm đắc đạo phi thăng, ngự trị trên đỉnh cao nhất của Đại Đạo Chí Cao Vô Thượng!*
