# 🎮 GameVault - Quản lý Kho Game Cá Nhân

**GameVault** là một ứng dụng desktop mạnh mẽ được phát triển bằng **Electron** và **Vanilla Javascript/CSS**, sử dụng dữ liệu từ **RAWG API** giúp game thủ quản lý, theo dõi hành trình chơi game cá nhân và tự động đối chiếu cấu hình phần cứng của máy tính với yêu cầu của game.

---

## ✨ Các tính năng nổi bật

### 1. 🗂️ Quản lý Thư viện Game Cá nhân chuyên sâu
* Phân loại trạng thái game chi tiết:
  * **🎮 Đang chơi:** Đang cày (Currently Playing), Tạm dừng (On Hold), Game vô tận (Endless), Chơi lại (Replaying).
  * **📋 Muốn chơi (Backlog):** Chơi kế tiếp (Next in Line), Hàng chờ thường (Backlog), Chờ mua (Wishlist).
  * **🏆 Đã chơi:** Xong cốt truyện (Story Completed), Hoàn thành 100% (Platinum), Drop giữa chừng (Dropped).
* Theo dõi số giờ chơi thực tế, ngày bắt đầu và ngày hoàn thành game.
* Ghi chép nhật ký hành trình chơi game, đánh giá cá nhân (thang điểm 5 sao) và viết cảm nhận chi tiết về game.

### 2. 💻 Đối chiếu Cấu hình Tự động (DxDiag Specs Checker)
* Chỉ cần xuất file `dxdiag.txt` từ máy của bạn và tải lên phần **Cài đặt**.
* Hệ thống sẽ tự động phân tích phần cứng máy tính của bạn bao gồm: **Hệ điều hành, CPU, dung lượng RAM, dòng card đồ họa (GPU)**.
* Khi xem thông tin chi tiết một game PC, ứng dụng sẽ tự động đối chiếu phần cứng của bạn với **Yêu cầu tối thiểu** và **Yêu cầu đề nghị** của game, sau đó đưa ra bảng so sánh trực quan và kết luận xem máy bạn có chạy mượt game hay không.

### 3. 🔍 Khám phá thế giới game khổng lồ với RAWG API
* Xem thông tin đầy đủ về game: Tên gốc, nhà phát hành, hãng sản xuất, độ tuổi (ESRB), thời lượng chơi trung bình, trang chủ game.
* Biểu đồ trực quan thể hiện phân bố điểm đánh giá của cộng đồng RAWG.
* Duyệt danh sách các game tương tự, bản mở rộng (DLC/Additions), game gốc (Parent Games), thành tựu (Achievements), ảnh chụp màn hình chất lượng cao và trailer chính thức của game.
* Tìm đọc các bài đăng nổi bật trên Reddit, xem các kênh stream Twitch nổi tiếng hoặc video YouTube liên quan đến game đang xem.

### 4. 🧭 Bản đồ Khám phá liên kết (Interconnected Discover)
* **Duyệt game theo Thể loại (Genres):** Xem giới thiệu chi tiết từng thể loại và danh sách game nổi bật thuộc thể loại đó.
* **Duyệt game theo Nhãn (Tags):** Khám phá từ đám mây thẻ tag (Tag Cloud) phong phú.
* **Duyệt game theo Hãng phát triển (Developers) & Nhà sáng tạo (Creators):** Tìm hiểu thông tin chi tiết, tiểu sử và toàn bộ các tác phẩm game của từng studio sản xuất hoặc các tên tuổi nổi tiếng trong ngành thiết kế game (như Hideo Kojima, Shigeru Miyamoto, v.v.).
* **Liên kết điều hướng thông minh:** Tất cả các tag, genre, hay thành viên nhóm phát triển trong Modal chi tiết game đều có thể click được để chuyển hướng trực tiếp sang bộ lọc tìm kiếm tương ứng trong tab Khám phá.

### 5. 🎨 Giao diện Đỉnh cao & Trải nghiệm Mượt mà
* Thiết kế Glassmorphism hiện đại với các dải màu HSL tinh tế, tương thích tốt với Dark Mode.
* Sidebar thông minh có thể **thu nhỏ / mở rộng** (lưu trạng thái vào `localStorage`), có hiển thị Tooltip trực quan khi ở trạng thái thu nhỏ.
* Giao diện modal co giãn hoàn toàn tương thích (Responsive), các biểu mẫu tự động xếp chồng (Wrap) và các nút bấm tự dồn dòng khi chiều ngang bị thu hẹp, tránh tuyệt đối lỗi tràn nội dung.
* Hoạt ảnh micro-animations mượt mà giúp trải nghiệm thêm phần sống động.
* Hỗ trợ Xuất/Nhập (Export/Import) dữ liệu thư viện dưới dạng tệp tin JSON hoặc khôi phục dữ liệu gốc bất cứ lúc nào.

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### Yêu cầu hệ thống
* Đã cài đặt **Node.js** (Khuyên dùng bản LTS mới nhất).

### Các bước thực hiện

1. **Tải mã nguồn dự án** về máy tính của bạn.
2. Mở thư mục dự án trong Terminal/CMD/PowerShell.
3. Cài đặt các thư viện phụ thuộc (bao gồm Electron):
   ```bash
   npm install
   ```
4. Khởi chạy ứng dụng:
   ```bash
   npm start
   ```

---

## 🔑 Hướng dẫn cấu hình RAWG API Key miễn phí

Để sử dụng đầy đủ các tính năng tải hình ảnh, thông tin chi tiết, trailer và tìm kiếm game từ RAWG, bạn cần cấu hình API Key:

1. Truy cập trang web [rawg.io](https://rawg.io/) và tạo một tài khoản miễn phí.
2. Sau khi đăng nhập, truy cập vào trang [rawg.io/apikeys](https://rawg.io/apikeys).
3. Nhấn vào nút **"Create key"** (Yêu cầu Key). Nhập tên dự án bất kỳ (ví dụ: *GameVault*) và chọn mục đích sử dụng cá nhân phi thương mại.
4. Sao chép API Key nhận được.
5. Mở ứng dụng GameVault, truy cập vào tab **Cài đặt** (Settings), dán key vào ô **RAWG API Key** và nhấn **Lưu cấu hình**. Bạn có thể dùng nút **Kiểm tra kết nối** để xác nhận kết nối thành công.

---

## 💻 Cách xuất và sử dụng file DxDiag cấu hình máy tính

Để ứng dụng tự động đối chiếu cấu hình chơi game:

1. Trên bàn phím Windows, nhấn tổ hợp phím `Windows + R` để mở hộp thoại Run.
2. Nhập lệnh `dxdiag` và nhấn **Enter**.
3. Chờ công cụ DirectX Diagnostic Tool chạy xong thanh tiến trình, nhấn nút **"Save All Information..."** (Lưu tất cả thông tin) ở góc dưới.
4. Lưu tệp tin dưới tên `dxdiag.txt` vào một thư mục bất kỳ.
5. Mở tab **Cài đặt** trong ứng dụng GameVault, nhấn nút **"Chọn file dxdiag.txt"** ở mục *Cấu hình Hệ thống* và tải lên tệp tin vừa lưu.
6. Ứng dụng sẽ hiển thị bản tóm tắt cấu hình máy của bạn (Hệ điều hành, CPU, RAM, GPU). Kể từ đây, mỗi khi bạn click xem chi tiết một game PC, hệ thống tự động chấm điểm cấu hình máy của bạn đối với game đó!
