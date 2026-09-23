# Tài liệu hướng dẫn hoàn thiện đồ án cuối khóa
## Môn: JavaScript thuần và ES6+ — Dự án nền: Kiemtien 3.0 (Tiên Đạo Trường Sinh)

---

## 0. Nguyên tắc thực hiện

Tài liệu này được soạn theo đúng 3 ràng buộc đã thống nhất:

1. **Không sửa, không đụng vào bất kỳ code nào đang có sẵn** trong dự án Kiemtien hiện tại (engine, combat, player, data cảnh giới/vật phẩm/kỹ năng...). Toàn bộ phần game hiện tại giữ nguyên 100%.
2. **Chỉ thêm phần mới**, tách biệt hoàn toàn khỏi phần game lõi, để không ảnh hưởng đến cân bằng gameplay và không có rủi ro làm hỏng phần đang chạy tốt.
3. Phần thêm mới phải lấp đúng những khoảng trống còn thiếu so với yêu cầu đề bài, mà không phá vỡ tiêu chí gốc của dự án: **thuần JS, chạy tĩnh/offline, host trên GitHub Pages, không cần tài khoản/đăng nhập thật**.

Tài liệu không chứa code mẫu để copy — chỉ mô tả **cần làm gì, vì sao cần, và cần đạt được điều gì**. Việc viết code cụ thể là bước tiếp theo, làm riêng.

---

## 1. Đối chiếu hiện trạng với yêu cầu đề bài

| Nhóm yêu cầu (theo đề bài) | Hiện trạng Kiemtien | Kết luận |
|---|---|---|
| A. Phân tích & thiết kế (10đ) | Có tài liệu README/PROJECT_SUMMARY mô tả rõ hệ thống | Đạt, không cần sửa |
| B. Giao diện/UX, Responsive (10đ) | Có CSS riêng, có giao diện nhiều tab | Đạt phần lớn, không cần sửa |
| C. JavaScript & DOM (15đ) | Có thao tác DOM phong phú (tạo/xóa/ẩn/hiện phần tử) | Đạt, không cần sửa |
| D. Quản lý dữ liệu & CRUD (15đ) | Dữ liệu game (vật phẩm, kỹ năng...) là dữ liệu tĩnh, người chơi không tự Thêm/Sửa/Xóa được | **Thiếu — cần bổ sung** |
| E. Tìm kiếm/Lọc/Sắp xếp/Thống kê (10đ) | Đã có ô tìm kiếm và bộ lọc thật ở tab túi đồ, kỹ năng, cửa hàng | Đạt, không cần sửa |
| F. Form & Validation (10đ) | Không có thẻ `<form>` nào, không có luồng nhập liệu người dùng | **Thiếu — cần bổ sung** |
| G. LocalStorage & quản lý trạng thái (10đ) | Đã có save/load/backup/migration bài bản | Đạt, không cần sửa |
| H. ES6+ & tổ chức mã nguồn (10đ) | Có `class`, arrow function, template literal, spread operator; **chưa có** `import`/`export`, destructuring, default parameter rõ ràng | **Thiếu một phần — cần bổ sung** |
| I. Hoàn thiện & bảo vệ (10đ) | Phụ thuộc vào việc tác giả giải thích được toàn bộ code | Cần chuẩn bị riêng, xem Phần 7 |
| Cấu trúc nhiều trang (mục 6.1) | Hiện chỉ có 1 file `index.html` dạng SPA | **Thiếu — cần bổ sung** |

**Tóm lại:** cần bổ sung đúng 2 mảng chức năng mới: **(1) Hệ thống Hồ sơ Nhân vật** (giải quyết CRUD + Form + Multi-page) và **(2) một lớp module hóa ES6+** đi kèm mảng đó (giải quyết phần H còn thiếu). Không cần đụng gì khác.

---

## 2. Phần bổ sung số 1: Hệ thống "Hồ sơ Nhân vật" (Character Profile Management)

### 2.1. Vì sao cần bổ sung phần này

Đề bài đòi hỏi người dùng phải **tự tạo, sửa, xóa dữ liệu thật** qua **form thật có kiểm tra hợp lệ**, và trải nghiệm này phải nằm trên **nhiều trang riêng biệt**. Trong khi đó, dữ liệu gameplay của Kiemtien (vật phẩm, kỹ năng, quái vật, cảnh giới...) là dữ liệu **thiết kế sẵn**, không thể để người chơi tự tạo/sửa (nếu cho tự tạo trang bị mạnh tùy ý, game sẽ mất cân bằng — đây là lý do đã thống nhất trước đó). Vì vậy, thay vì CRUD trên dữ liệu gameplay, ta chuyển hướng sang CRUD trên **một loại dữ liệu không ảnh hưởng đến cân bằng game**: hồ sơ đại diện cho mỗi lượt chơi.

Bản chất: giống hệt cơ chế "nhiều ô lưu game" (save slot) quen thuộc trong các game offline — mỗi hồ sơ là một "nhãn" gắn với 1 bộ save riêng, không phải hệ thống tài khoản có đăng nhập/xác thực.

### 2.2. Mục tiêu cần đạt (đối chiếu thang điểm đề bài)

- Đáp ứng đủ số trang tối thiểu ở mục 6.1 của đề (trang chủ/danh sách, chi tiết, thêm dữ liệu, chỉnh sửa dữ liệu, trang quản lý dữ liệu).
- Có Thêm/Đọc/Sửa/Xóa thật (mục D, 15đ) trên hồ sơ nhân vật.
- Có form nhập liệu thật với validate rõ ràng (mục F, 10đ).
- Có dashboard thống kê (mục 13): tổng số hồ sơ, hồ sơ có cảnh giới cao nhất, tổng thời gian chơi cộng dồn.
- Toàn bộ vẫn chạy tĩnh/offline, không cần server, không có khái niệm đăng nhập.

### 2.3. Các trang cần thêm

| Trang | Vai trò | Ghi chú |
|---|---|---|
| Trang chọn hồ sơ (đóng vai "trang chủ/danh sách") | Liệt kê toàn bộ hồ sơ đã tạo, mỗi hồ sơ hiển thị tên, cảnh giới hiện tại, lần chơi gần nhất | Đây là màn hình đầu tiên hiện ra khi mở game, thay cho việc vào thẳng game như hiện tại |
| Trang chi tiết hồ sơ | Xem đầy đủ thông tin 1 hồ sơ: ngày tạo, tổng thời gian chơi, cảnh giới, thành tựu nổi bật | Chỉ đọc, không chỉnh sửa chỉ số ở đây |
| Trang tạo hồ sơ mới | Form nhập: tên nhân vật, chọn avatar có sẵn, ghi chú | Sau khi tạo xong, chuyển thẳng vào game với save trống ứng với hồ sơ đó |
| Trang chỉnh sửa hồ sơ | Form sửa: đổi tên, đổi avatar, sửa ghi chú | Không cho sửa cảnh giới/tu vi/trang bị ở đây |
| Trang quản lý hồ sơ (đóng vai "trang quản lý dữ liệu" + dashboard) | Danh sách đầy đủ kèm nút Sửa/Xóa từng hồ sơ, khu vực thống kê tổng hợp | Đây là nơi thao tác Xóa, cần có bước xác nhận rõ ràng |
| Trang giới thiệu | Giới thiệu ngắn về đồ án, tên sinh viên, hướng dẫn cách chơi | Đáp ứng "trang liên hệ/thông tin" của đề |

Có thể triển khai dưới dạng nhiều file `.html` riêng biệt (đúng tinh thần ví dụ cấu trúc trong đề bài: `index.html`, `products.html`, `detail.html`...) hoặc dưới dạng nhiều "view" trong cùng 1 trang nếu có định tuyến rõ ràng bằng JS — miễn là thể hiện được rành mạch từng trang khi bảo vệ. Cách làm nhiều file `.html` riêng được khuyến nghị vì bám sát đúng chữ nghĩa của đề bài hơn, tránh bị hỏi vặn lúc bảo vệ.

### 2.4. Dữ liệu cần quản lý cho mỗi hồ sơ

Mỗi hồ sơ chỉ nên chứa thông tin **định danh và mô tả**, không chứa số liệu sức mạnh:

- Tên nhân vật (người chơi tự đặt)
- Avatar (chọn từ danh sách biểu tượng có sẵn, không upload ảnh tự do)
- Ghi chú cá nhân (tùy chọn)
- Thời điểm tạo và thời điểm chơi gần nhất (do hệ thống tự ghi, không phải người nhập)
- Một mã liên kết tới đúng bộ save game thật của nhân vật đó (bộ save game thật vẫn dùng nguyên cơ chế đang có, không đổi)

Nói cách khác: hồ sơ chỉ là "nhãn dán" gắn với 1 bộ save có sẵn, tách biệt hoàn toàn khỏi toàn bộ dữ liệu tu luyện/trang bị/kỹ năng thật.

### 2.5. Yêu cầu validate khi tạo/sửa hồ sơ

- Tên nhân vật: bắt buộc nhập, giới hạn độ dài hợp lý (ví dụ 3-20 ký tự), không được trùng với tên hồ sơ đã tồn tại, lọc bỏ ký tự có thể gây lỗi hiển thị.
- Giới hạn tổng số hồ sơ được tạo (ví dụ tối đa 5) — khi vượt giới hạn, form tạo mới phải báo lỗi rõ ràng thay vì tạo tràn lan.
- Ghi chú: không bắt buộc, nhưng cần giới hạn độ dài tối đa.
- Khi xóa hồ sơ: bắt buộc có bước xác nhận rõ ràng, nêu rõ hậu quả (mất toàn bộ tiến trình liên quan), và khi xác nhận thì xóa luôn cả bộ save game thật gắn với hồ sơ đó, tránh rác dữ liệu tồn đọng trong localStorage.

### 2.6. Cách tích hợp mà không đụng code cũ

- Phần lưu trữ hồ sơ nên dùng **một khóa localStorage hoàn toàn mới**, tách biệt với khóa save game hiện tại — không đọc/ghi đè lên khóa cũ.
- Bộ save game thật của từng hồ sơ vẫn dùng đúng cơ chế đọc/ghi hiện có, chỉ khác là mỗi hồ sơ ứng với **một khóa lưu trữ riêng** thay vì dùng chung 1 khóa duy nhất như hiện tại. Phần code đọc/ghi save hiện tại không cần viết lại logic bên trong, chỉ cần được gọi với đúng khóa tương ứng của hồ sơ đang chọn.
- Với người chơi đã có sẵn dữ liệu lưu từ trước khi có hệ thống hồ sơ: lần đầu mở bản cập nhật, hệ thống cần tự động tạo ra một hồ sơ mặc định và gán đúng dữ liệu save cũ vào hồ sơ đó, để không ai bị mất tiến trình đang chơi dở. Đây là một bước xử lý migration tương tự tinh thần nâng cấp phiên bản save đã có sẵn trong dự án, chỉ áp dụng logic đó sang tình huống mới này.

---

## 3. Phần bổ sung số 2: Hoàn thiện nhóm ES6+ còn thiếu

### 3.1. Vì sao cần bổ sung

Đề bài liệt kê rõ một số đặc điểm ES6+ là **tối thiểu phải thể hiện được** (mục 14), gồm cả `import`/`export` theo module, destructuring, và default parameter. Toàn bộ code hiện tại của Kiemtien dùng cách nạp nhiều thẻ `<script>` tuần tự, không dùng `import`/`export`; cũng chưa thấy dùng destructuring hay default parameter một cách rõ ràng ở đâu trong code hiện có. Đây là phần bị trừ điểm trực tiếp ở mục H nếu không bổ sung.

### 3.2. Mục tiêu cần đạt

Chứng minh được khả năng sử dụng đầy đủ các đặc điểm ES6+ theo đúng yêu cầu, mà **không cần và không nên** viết lại toàn bộ hệ thống `<script>` hiện tại (rủi ro cao, tốn công, dễ gây lỗi cho phần đang chạy ổn).

### 3.3. Hướng thực hiện

- Toàn bộ phần code mới cho hệ thống Hồ sơ Nhân vật (Phần 2 ở trên) nên được viết theo đúng chuẩn module ES6: mỗi file chức năng (ví dụ file xử lý lưu trữ hồ sơ, file xử lý hiển thị danh sách hồ sơ, file xử lý form tạo/sửa) tự `export` ra những hàm cần dùng, và nơi khác `import` vào để sử dụng, thay vì gán vào biến toàn cục như cách cũ.
- Các hàm xử lý trong phần hồ sơ mới nên tận dụng tự nhiên **destructuring** khi nhận dữ liệu đầu vào có nhiều trường (ví dụ khi nhận thông tin từ form gồm tên/avatar/ghi chú, nên tách trực tiếp từng trường ra biến thay vì truy cập qua từng thuộc tính một), và **default parameter** cho những giá trị có thể bỏ trống (ví dụ ghi chú không bắt buộc nên có giá trị mặc định là chuỗi rỗng khi không được cung cấp).
- Vì phần này là code hoàn toàn mới, độc lập, việc áp dụng chuẩn module không ảnh hưởng gì đến các file game hiện có — các file cũ vẫn tiếp tục hoạt động theo đúng cách nạp bằng thẻ `<script>` như trước.
- Lưu ý kỹ thuật khi triển khai: file dùng `import`/`export` cần được khai báo với thuộc tính `type="module"` trên thẻ `<script>` tương ứng trong HTML, và khi chạy thử trực tiếp bằng cách mở file `index.html` từ ổ đĩa (không qua server) có thể gặp giới hạn của trình duyệt với module — cần kiểm tra kỹ khi test, có thể cần chạy thử qua một server cục bộ đơn giản trong lúc phát triển (không ảnh hưởng gì đến việc triển khai cuối cùng lên GitHub Pages, vì GitHub Pages tự nó đã là môi trường phục vụ qua HTTP, không phải mở file trực tiếp).

---

## 4. Những phần đã đáp ứng sẵn — không cần đụng vào

Để tự tin khi trình bày/bảo vệ, cần nắm rõ những phần sau đã đạt yêu cầu và không cần chỉnh sửa gì:

- Toàn bộ yêu cầu công nghệ (JS thuần, không dùng framework bị cấm).
- Thao tác DOM: tạo động, cập nhật, ẩn/hiện, đổi class — đã có rất nhiều trong hệ thống giao diện hiện tại.
- Xử lý sự kiện: click, mở/đóng, xác nhận trước thao tác quan trọng bằng `confirm()`.
- Tìm kiếm, lọc dữ liệu: đã có ô tìm kiếm và bộ lọc thật ở các tab túi đồ, kỹ năng, cửa hàng.
- Sắp xếp, xử lý mảng: đã dùng nhiều phương thức xử lý mảng phù hợp trong việc hiển thị dữ liệu.
- LocalStorage: đã lưu/đọc/backup và có cơ chế nâng cấp phiên bản save một cách bài bản — vượt mức yêu cầu tối thiểu của đề.
- Một phần ES6+: đã dùng `class`, arrow function, template literal, spread operator.

---

## 5. Việc cần làm về mặt thủ tục trước khi nộp

- Đề tài "website ứng dụng game" thuộc nhóm tự chọn, cần trình bày và xin giảng viên duyệt nội dung cụ thể trước khi chính thức làm theo hướng này. Nên trình bày rõ: đây là game có sẵn được bổ sung thêm module quản lý hồ sơ/CRUD/form để đáp ứng yêu cầu đồ án, không phải nộp nguyên xi một game không có phần nghiệp vụ nào.
- Khi xin duyệt, nên nêu rõ luôn phần bổ sung (Hồ sơ Nhân vật) để giảng viên thấy đồ án có đủ cấu phần theo đúng yêu cầu, tránh bị hiểu nhầm là chỉ nộp một game thuần túy không có CRUD/form.

---

## 6. Checklist tổng hợp theo thang điểm đề bài (sau khi hoàn thành Phần 2 và 3)

- [x] A. Phân tích & thiết kế — đã có sẵn
- [x] B. Giao diện/UX, Responsive — đã có sẵn
- [x] C. JavaScript & DOM — đã có sẵn
- [ ] D. Quản lý dữ liệu & CRUD — cần hoàn thành Phần 2
- [x] E. Tìm kiếm/Lọc/Sắp xếp/Thống kê — đã có sẵn
- [ ] F. Form & Validation — cần hoàn thành Phần 2
- [x] G. LocalStorage & quản lý trạng thái — đã có sẵn
- [ ] H. ES6+ & tổ chức mã nguồn — cần hoàn thành Phần 3
- [ ] I. Hoàn thiện & bảo vệ — cần chuẩn bị riêng, xem Phần 7
- [ ] Cấu trúc nhiều trang — cần hoàn thành Phần 2

---

## 7. Lưu ý khi chuẩn bị bảo vệ đồ án

- Đề bài cho phép giảng viên yêu cầu sửa trực tiếp một đoạn code bất kỳ trong buổi bảo vệ, và có thể trừ điểm nếu không giải thích được. Vì phần lớn code nền tảng của game được xây dựng với tốc độ rất nhanh (có khả năng có sự hỗ trợ đáng kể từ công cụ AI trong quá trình viết), cần dành thời gian tự đọc lại và hiểu kỹ các phần cốt lõi trước khi bảo vệ — đặc biệt là phần công thức tính chỉ số, điều kiện đột phá cảnh giới, và cơ chế chiến đấu — vì đây là những phần nhiều khả năng sẽ bị hỏi tới.
- Phần mới (Hồ sơ Nhân vật) nên được ưu tiên hiểu thật kỹ, vì đây chính là phần trực tiếp thể hiện các kỹ năng CRUD/Form/Validation/ES6+ module mà đề bài yêu cầu đánh giá — nhiều khả năng sẽ là trọng tâm câu hỏi của giảng viên.
- Chuẩn bị sẵn tình huống demo: tạo 1 hồ sơ mới, sửa thông tin hồ sơ, xóa 1 hồ sơ (có xác nhận), và giải thích được vì sao dữ liệu vẫn còn sau khi tải lại trang.

---

*Hết tài liệu.*

