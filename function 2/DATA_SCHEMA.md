# Data schema notes

- JSON `items[]` is the canonical vocabulary list.
- `phonics.status` is one of: `user_confirmed`, `editorial_correction`, `user_pattern_interpreted`, `pending_native_teacher_review`.
- `phonics.sequence` is ordered and learner-facing. Preserve exact order.
- `audio.*` and `image.*` remain null until real assets are recorded and checked.
- Review fields must not be changed to approved without evidence of review.
- Use stable `id`; never use array index as an ID.

# Spelling practice (spelling_practice_vi_v1.json)
- Thêm giá trị `phonics.status`: `proposed_rule_based_pending_review` (chuỗi do quy tắc sinh, chưa duyệt).
- `items[].id` có dạng `sp_NNNN`, ổn định; `vocab_ref` trỏ tới `vocabulary_vi_v2_1.json` khi trùng từ.
- `phonics.steps[]` có `order`, `type`, `display`; `phonics.sequence` là danh sách chuỗi hiển thị cho người học, giữ đúng thứ tự.
- `case_tags` lấy từ `case_catalog`; `review_flags` là câu hỏi mở cho người thẩm định.
- Chạy `python3 validate_spelling.py` sau mỗi thay đổi.

## v1.1.0: bài học, từ ghép, cặp khác nguyên âm
- `lessons[]`: bài gom theo âm cuối (`final`). Mỗi bài có `units[]` (một đơn vị cho mỗi họ vần, kèm `word_ids`, `compound_ids`), `vowel_contrast_pair_ids`, `study_order`, `pair_with` (bài đi cặp trong SGK). Một họ vần chỉ thuộc một bài; mọi vần trong bài phải cùng âm cuối.
- `items[].lesson_id` và `rhyme_families[].lesson_id` trỏ tới `lessons[].id`. `order_hint` đánh số liên tục theo thứ tự bài rồi họ vần.
- `vowel_contrast_pairs[]` (`vc_NN`): cùng âm đầu, cùng thanh, cùng âm cuối, khác nguyên âm. Khác với `contrast_pairs` (cùng vần, khác âm đầu).
- `compounds[]` (`spc_NNNN`): từ ghép / cụm từ từ 2 tiếng trở lên.
  - `syllables[]`: `{text, item_ref}`; `item_ref` null nghĩa là tiếng đó chưa thuộc phạm vi v1 và chỉ đọc nguyên.
  - `fully_decodable`: true khi mọi tiếng đều có `item_ref`.
  - `rhyme_family`, `lesson_id`: đặt ở họ vần của tiếng học **sau cùng** (để mọi tiếng đã có chuỗi trước khi gặp từ ghép); `related_families` liệt kê mọi họ vần liên quan.
  - `entry_type`: `tu_ghep`, `tu_lay`, `cum_tu`, `proper_noun`.
  - Tiếng có `lexical_role = syllable_in_compound` phải có `context_phrase` trùng một `compounds[].text`.
- Dùng `item_ref`, không sao chép chuỗi đánh vần vào từ ghép.

