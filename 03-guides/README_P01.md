# P01 — Bộ thư viện tiếng Việt cho dự án Việt–Nhật

## Mục tiêu
Xây thư viện dữ liệu từ vựng, nghĩa, câu ví dụ, quy trình đánh vần/đọc, âm thanh và hình minh họa trước khi lập trình trò chơi. Người viết code là **Google Gemini**; ChatGPT chuẩn bị đặc tả dữ liệu, nội dung và prompt bàn giao.

## Phạm vi bản v2
- 32 mục từ/tiếng khởi đầu.
- Giọng đọc mục tiêu: miền Bắc, tham chiếu Hà Nội.
- Độ tuổi mục tiêu: trẻ nhỏ khoảng 4–6 tuổi.
- Chưa phải thư viện hoàn chỉnh; chưa có file âm thanh/hình ảnh thật.
- Chỉ “đánh” có chuỗi đánh vần được người dùng xác nhận trực tiếp; “đau/sau” được đưa vào để ghi rõ sự khác nhau giữa âm đầu đờ và sờ. Các mục còn lại đang chờ thẩm định.

## Cấu trúc thư mục
- `01-vocabulary/`: JSON nguồn chính và CSV để rà soát.
- `02-pronunciation/`: quy chuẩn đánh vần/đọc.
- `03-guides/`: quy trình dữ liệu và kiểm duyệt.
- `04-prompts/`: prompt bàn giao cho Gemini.
- `05-review/`: biểu mẫu rà soát.
- `06-assets/`: quy ước tổ chức file âm thanh/hình ảnh.

## Nguồn dữ liệu
Không tự nhận bộ từ đã đầy đủ. Mỗi mục cần kiểm tra:
1. Từ điển tiếng Việt đáng tin cậy.
2. Cách đánh vần theo phương pháp dạy học tiếng Việt hiện hành.
3. Người bản ngữ miền Bắc nghe duyệt.
4. Giáo viên tiểu học/giáo viên dạy đọc duyệt.
5. Nghĩa và câu ví dụ phù hợp trẻ nhỏ.

## Quy tắc dữ liệu
JSON là nguồn dữ liệu chính; CSV chỉ để rà soát/trao đổi. Không sửa CSV rồi quên cập nhật JSON.
Mọi thay đổi cần tăng version và ghi log trong `05-review/review_log.md`.
