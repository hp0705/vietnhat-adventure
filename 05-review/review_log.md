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
