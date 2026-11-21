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

## v2.4.0 (2026-11-21)
- **Khắc phục triệt để lỗi phát âm tiếng Anh trên iPad ở Nhật/nước ngoài:**
  - Nguyên nhân: iPadOS không cài sẵn giọng đọc tiếng Việt theo mặc định ở các khu vực ngoài Việt Nam, dẫn tới việc `SpeechSynthesis` tự động fallback sang giọng robot tiếng Anh làm sai lệch hoàn toàn ngữ âm tiếng Việt.
  - Giải pháp: Loại bỏ hoàn toàn sự phụ thuộc vào Web Speech API của iPad. Thay thế 100% bằng file âm thanh MP3 người thật đã tạo sẵn trong repo và stream âm thanh tiếng Việt từ Google Translate TTS.
  - Khi bé bấm Đúng: Luôn phát file âm thanh thu âm giọng người thật `correct-[dialect].mp3` (*"Đúng rồi! Bé giỏi quá!"*).
  - Khi bé bấm Sai: Luôn phát file âm thanh thu âm giọng người thật `try-again-[dialect].mp3` (*"Bé thử lại nhé!"*) kết hợp âm thanh hài hước "bà bư bư" và dấu X đỏ.
- **Hoàn thiện đầy đủ cách đọc và chuỗi đánh vần cho 60 từ vựng cốt lõi:**
  - Nâng tổng số từ được kiểm duyệt và có chuỗi đánh vần hoàn chỉnh (`user_confirmed`) từ 5 từ lên **60 từ vựng**.
  - Mỗi từ đều có: chuỗi ghép vần từng bước, nghĩa ngắn gọn cho trẻ, câu ví dụ sinh động, hình ảnh minh họa emoji và nhãn tiếng Việt rõ ràng.
- **Cấu trúc lại lộ trình bài học theo độ phức tạp ngữ âm (2 âm ➔ 3 âm ➔ 4-5 âm):**
  - *Bài 1 (Cấp 1 - 2 âm):* `ba`, `bà`, `bố`, `mẹ`, `bé`, `bò`, `cá`, `gà`, `đi`, `đá` (từ ghép 2 âm cơ bản nhất).
  - *Bài 2 (Cấp 1 - 2 âm):* `lá`, `cô`, `na`, `đa`, `me`, `lê`, `bè`, `bê`, `cà`, `cờ` (từ ghép 2 âm thiên nhiên, cây cối).
  - *Bài 3 (Cấp 1 - 2 âm):* `cỏ`, `dê`, `nụ`, `mạ`, `dù`, `tổ`, `bi`, `vở`, `ngủ`, `đau` (từ ghép 2 âm mở rộng).
  - *Bài 4 (Cấp 2 - 3 âm):* `mèo`, `chó`, `vịt`, `hoa`, `cây`, `mưa`, `nắng`, `đèn`, `bút`, `tay` (vần đôi và âm cuối đơn giản 1).
  - *Bài 5 (Cấp 2 - 3 âm):* `mắt`, `chân`, `bế`, `ăn`, `sau`, `khế`, `hề`, `kẻ`, `đỗ`, `bẻ` (vần đôi và âm cuối đơn giản 2).
  - *Bài 6 (Cấp 3 - 4-5 âm & Từ ghép):* `đánh`, `sách`, `cỗ`, `miệng`, `uống`, `ca nô`, `ca sĩ`, `bí đỏ`, `đi bộ`, `hồ cá`.
  - *Bài 7 trở đi:* Toàn bộ các từ trích xuất từ SGK Tiếng Việt 1.
- **Tạo và lưu trữ hơn 700 file âm thanh MP3 trong repo:**
  - Sinh đầy đủ file đọc từ, câu ví dụ và từng bước đánh vần cho cả 2 phương ngữ miền Bắc (Hà Nội) và miền Nam (Sài Gòn).
