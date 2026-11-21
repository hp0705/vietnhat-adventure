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

## spelling_practice v1.0.0 (2026-11-21)
- Tạo thư viện tập đánh vần: 41 mục, 15 họ vần (ap, anh, ach, au, ăp, âp, ep, êp, ip, op, ôp, ơp, up, êch, ich), 28 tình huống (19 đã có từ minh họa, 9 chưa làm).
- Họ vần lấy theo các trang 64, 65, 67 sách của người dùng; từ do dự án chọn (vài từ thiết thực mỗi vần), không sao chép bảng trong sách.
- Chuỗi đánh vần sinh theo quy tắc từ mẫu "đánh" đã xác nhận; 38 mục ở trạng thái `proposed_rule_based_pending_review`. "đánh" giữ `user_confirmed`; "đau", "sau" giữ `editorial_correction`.
- Thêm `validate_spelling.py` (kiểm tra ID, từ trùng, nội dung trống, chuỗi, chính tả c/k g/gh ng/ngh, thanh của vần tắc, tài sản giả, vocab_ref) và `SPELLING_PRACTICE_SPEC.md`.
- Chưa có âm thanh/hình ảnh; chưa làm giao diện.

## spelling_practice v1.1.0 (2026-11-21)
- Mở rộng từ 41 lên 113 từ đơn (sp_0042 – sp_0113); thêm 110 từ ghép / cụm từ (spc_0001 – spc_0110), 18 cái đọc được hoàn toàn bằng các tiếng đã có chuỗi.
- Chia lại thành 4 bài theo âm cuối: bài p (ap, ăp, âp, ep, êp, ip, op, ôp, ơp, up), bài ch (ach, êch, ich), bài nh (anh), bài u (au). Mỗi bài có thứ tự học: từng vần, cặp khác nguyên âm, từ ghép.
- Không có vần "ưp" trong tiếng Việt nên không thêm. iêp, uôp, ươp (nguyên âm đôi) chờ giai đoạn sau.
- Thêm 21 cặp khác nguyên âm (gặp/gập, chóp/chớp, lạch/lệch/lịch...). Cặp cũ (đau/sau, cặp/gặp, sáp/tháp, gạch/lạch) giữ nguyên.
- 41 mục cũ giữ nguyên ID, chuỗi, nghĩa, ví dụ, trạng thái duyệt. Chỉ đổi `order_hint` (theo thứ tự bài mới) và thêm `lesson_id`, thêm tag `WORD_VOWEL_CONTRAST` cho mục nằm trong cặp mới.
- 72 từ đơn mới đều ở `proposed_rule_based_pending_review`; mọi review = pending. Nghĩa, câu ví dụ do dự án soạn, cần giáo viên và người bản ngữ rà.
- Từ bỏ có chủ ý: "cọp", "bắp" (ngô) vì là từ miền Nam; chuẩn Hà Nội dùng "hổ", "ngô". "bắp" chỉ giữ trong "bắp cải".
- `validate_spelling.py` thêm kiểm tra: bài và âm cuối, từ ghép (item_ref, vị trí đặt bài, ví dụ chứa từ), cặp khác nguyên âm, case_tags, stats, covered_by.
- Vẫn chưa có âm thanh/hình ảnh; chưa làm giao diện.
