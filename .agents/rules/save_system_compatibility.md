# KIEM TIEN - SAVE SYSTEM & DATA COMPATIBILITY SPECIFICATION

## 1. Mục tiêu (Objective)
Tài liệu này quy định các tiêu chuẩn bắt buộc khi phát triển, chỉnh sửa và cập nhật mã nguồn cho dự án web game Kiếm Tiên (localStorage-based).
**Mục tiêu tối thượng**: Tuyệt đối không làm crash game, không làm mất tiến trình hoặc phát sinh lỗi `undefined` đối với các bản lưu (save data) cũ của người chơi khi cập nhật phiên bản mới.

## 2. Kiến trúc lưu trữ hiện tại
- **Cơ chế**: Lưu trữ cục bộ qua Web Storage API (`localStorage`).
- **Định dạng**: JSON chuỗi hóa (Stringified JSON), hỗ trợ mã hóa Base64 khi Xuất/Nhập (Export/Import).
- **Vị trí xử lý**: `js/engine/storage.js` và `js/state/player.js`.
- **Khóa lưu trữ**:
  - Khóa chính: `tu_tien_2d_save_v1`
  - Khóa dự phòng (Auto-Backup): `tu_tien_2d_save_backup`
  - Phiên bản hiện tại: `CURRENT_SAVE_VERSION = 2`

## 3. Quy tắc phát triển bắt buộc (Strict Rules)

### Rule 1: Bất biến cấu trúc cũ (Schema Immutability)
- **KHÔNG ĐƯỢC PHÉP**: Đổi tên (rename) hoặc xóa (delete) bất kỳ thuộc tính cốt lõi nào đã tồn tại trong đối tượng `player` (ví dụ: `realmIndex`, `tierIndex`, `tuVi`, `inventory`, `equipped`, `linhThach`...).
- **ĐƯỢC PHÉP**: Thêm trường mới, nhưng trường mới bắt buộc phải có giá trị mặc định (fallback).

### Rule 2: Luôn sử dụng kỹ thuật Merge Default State khi nạp dữ liệu
Mọi thao tác đọc dữ liệu từ `localStorage` hoặc qua chuỗi Import phải luôn được hợp nhất (deep merge) với một khung mẫu mặc định chuẩn (`DEFAULT_PLAYER_DATA`).

### Rule 3: Quy trình Migration dữ liệu theo Version
Khi có bản cập nhật thay đổi cơ chế logic (chia lại bậc Cảnh giới, đổi hệ thống Tiền tệ, cơ cấu lại ID trang bị...):
1. Tăng hằng số `CURRENT_SAVE_VERSION` thêm 1.
2. Khai báo bước chuyển đổi tuần tự trong hàm `migrateSaveData(savedData)`.

### Rule 4: Tự động sao lưu dự phòng (Safe Write / Auto-Backup)
Trước khi ghi đè chuỗi dữ liệu mới vào khóa chính, luôn sao lưu lại chuỗi dữ liệu trước đó vào một khóa dự phòng `tu_tien_2d_save_backup` để phục hồi khi có sự cố. Khi nạp khóa chính bị lỗi JSON parse, tự động phục hồi từ backup.

### Rule 5: Kiểm tra an toàn trước khi truy xuất (Defensive Coding)
Mọi hàm tính toán (Combat, Skill, Inventory, Stats) khi truy xuất vào thuộc tính của `player` đều phải sử dụng toán tử gán phòng vệ (Default Operator) hoặc Optional Chaining (`?.`):
- `(player.linhThach || 0)`
- `player.equipped?.vukhi`
- `(player.inventory || [])`
- `(player.clearedStages || [])`

## 4. Checklist kiểm thử trước khi xác nhận code
Bất kỳ đoạn mã nào sinh ra phải vượt qua 3 câu hỏi kiểm tra:
1. File save từ phiên bản cũ khi chạy với code mới có bị lỗi `Cannot read properties of undefined` không?
2. Thuộc tính mới thêm vào có giá trị khởi tạo an toàn khi người chơi cũ mở game lên không?
3. Tính năng Export/Import Base64 có tiếp tục hoạt động tương thích với chuỗi mã xuất từ các phiên bản trước không?
