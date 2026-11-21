# Review log

## v2.0.0
- Tạo lại cấu trúc thư viện P01.
- Thêm quy chuẩn đánh vần theo âm và ghép dần.
- Ghi nhận chuỗi “đánh” do người dùng xác nhận.
- Phân biệt rõ “đau” (đờ + au) và “sau” (sờ + au).
- 32 mục từ khởi đầu; các mục chưa có chuỗi đánh vần đều được đánh dấu chờ duyệt.
- Chưa có file audio hoặc ảnh sản phẩm.

## v2.1.0 (2026-11-21)
- Trích từ khoá, từ ứng dụng, từ ôn tập từ "Thuyết minh bản mẫu SGK Tiếng Việt 1" (NXB GDVN, 6/2019), phần Âm và chữ (tuần 2-5) và Vần (tuần 6-22).
- Thêm 600 mục mới (vi_0033 – vi_0632), trạng thái `source_extracted_needs_authoring`: chưa có nghĩa, câu ví dụ, chủ đề; chưa có chuỗi đánh vần; mọi review = pending.
- 32 mục cũ giữ nguyên ID và nội dung; chỉ bổ sung trường mới (entry_type, syllable_count, content_status, source_refs, appears_in_source_words).
- Trường mới cho mọi mục: `source_refs` (tuần, bài, vai trò từ), `entry_type` (tieng/tu/cum_tu/proper_noun), `syllable_count`.
- Một số mục có `source_note` (chuẩn hoá lỗi trích PDF, rút gọn cụm từ). Cần đối chiếu sách gốc.
- Không đưa phần Luyện tập tổng hợp (tuần 23-35) vì tài liệu chỉ nêu tên bài đọc.
- Vai trò từ khoá/từ ứng dụng được suy ra từ vị trí cột, chưa xác nhận.

## v2.2.0 (2026-11-21)
- Người dùng (chủ dự án) xác nhận chuỗi đánh vần cho 4 mục từ cơ bản:
  - `vi_0001` (ba): `bờ → a → ba`
  - `vi_0002` (bà): `bờ → a → ba → ba huyền bà`
  - `vi_0005` (bé): `bờ → e → be → be sắc bé`
  - `vi_0006` (bò): `bờ → o → bo → bo huyền bò`
- Nâng tổng số từ có chuỗi đánh vần được người dùng xác nhận (`user_confirmed`) lên 5 mục (kèm `vi_0029` "đánh").
- Sửa lỗi schema: cập nhật trường cấp cao `phonics.status` cho `vi_0029` ("user_confirmed"), `vi_0031` và `vi_0032` ("editorial_correction").
- Thêm các bước mẫu vào `02-pronunciation/pronunciation_examples.json`.
- Thêm script kiểm tra tự động `tests/validate_library.py`.

## v2.3.0 (2026-11-21)
- **Cải tiến giao diện Trạm học đánh vần:**
  - Lược bỏ hoàn toàn các thẻ bước chữ rườm rà (Bước 1, Bước 2, Bước 3).
  - Thay bằng một nút duy nhất `[▶️ Cách đánh vần]`: Bé chạm vào để nghe cô đọc cách đánh vần liền mạch, tự nhiên và dễ tiếp thu cho trẻ 4-6 tuổi.
- **Quy chuẩn Thử thách ghép hình theo bài học (10 câu/bài):**
  - Mỗi vòng thử thách gồm chính xác 10 câu hỏi tương ứng với 10 từ của bài học.
  - Điều kiện qua bài: Bé phải đạt tối thiểu **8/10 câu đúng** (80%) mới hoàn thành và mở khóa Bài tiếp theo.
  - Các bài học chưa mở khóa hiển thị biểu tượng ổ khóa `🔒` trên thanh lộ trình.
- **Trải nghiệm âm thanh và hình ảnh tương tác phản hồi (Feedback Loop):**
  - *Khi bé làm đúng:* Kích hoạt pháo hoa rực rỡ, hợp âm chuông chiến thắng (C5-E5-G5-C6) và ngẫu nhiên 1 trong 8 mẫu lời khen ngợi hào hứng (cả hiển thị và đọc thành tiếng: *"Đúng rồi! Bé giỏi quá! 🌟"*, *"Hoan hô bé! Bé thông minh tuyệt vời! 🎉"*, *"Chính xác luôn! Bé đỉnh thật đấy! 🚀"*, ...).
  - *Khi bé làm sai:* Phát âm thanh hài hước "bà bư bư" (3 nốt trầm giảm dần), hiển thị dấu `❌` đỏ lớn rung lắc rồi tự động mờ biến mất sau ~800ms, kèm 1 trong 6 mẫu câu động viên nhẹ nhàng (cả hiển thị và đọc: *"Bé ơi cố lên, cùng thử lại nhé! 💪"*, *"Chưa chính xác rồi, bé nhìn kỹ lại nào! 👀"*, ...).
- **Cơ chế chuyển tiếp từ chưa đúng (Spaced Repetition / Carry-over):**
  - Tối đa 2 từ làm sai ở bài trước sẽ tự động được chuyển tiếp vào bài sau trong vòng thử thách ghép hình (với huy hiệu `⭐ Ôn lại từ cũ`).
  - Đảm bảo bé được ôn tập củng cố những từ còn yếu trước khi tiến xa hơn.
- **Mở rộng cơ sở dữ liệu hình ảnh, emoji và tên gọi trực quan:**
  - Bổ sung dữ liệu hình ảnh, biểu tượng và nhãn tên gọi cho toàn bộ 32 từ khởi đầu (Bài 1, Bài 2, Bài 3) và hơn 50 từ trong các bài học SGK tiếp theo.
  - Tích hợp thuật toán suy luận thông minh `getPictureDataForWord` đảm bảo 100% từ vựng đều có hình minh họa sinh động và đáp án gây nhiễu hợp lý.
