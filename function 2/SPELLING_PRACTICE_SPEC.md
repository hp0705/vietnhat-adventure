# Tính năng "Tập đánh vần" — đặc tả dữ liệu (v1.1.0)

Giai đoạn hiện tại: **chỉ thư viện dữ liệu**. Chưa làm giao diện (theo GEMINI_MASTER_PROMPT: chờ chủ dự án duyệt thư viện).

## 1. Cách tập
Chế độ duy nhất: `listen_and_repeat`. Với mỗi bước trong `phonics.steps`:
1. Làm nổi bật bước hiện tại.
2. Phát âm thanh của bước (bản thu thật, không dùng TTS cho bản cuối).
3. Hiện lời nhắc "Bé đọc theo nhé!".
4. Chờ bé đọc (mặc định 2,5 giây, chỉnh được), rồi sang bước tiếp.

Sau bước cuối: phát từ đọc tự nhiên, rồi câu ví dụ. **Không chấm điểm, không nhận dạng giọng nói.**
Cấu hình mặc định nằm ở `practice_config` trong JSON.

## 1b. Cách chia bài (từ v1.1.0)
Bài gom theo **âm cuối**, không theo từng vần lẻ:
| Bài | Vần |
|---|---|
| p | ap, ăp, âp, ep, êp, ip, op, ôp, ơp, up |
| ch | ach, êch, ich |
| nh | anh |
| u | au |
Trong mỗi bài học theo thứ tự: (1) từng vần, từ đơn trước; (2) cặp khác nguyên âm để phân biệt các vần cùng âm cuối (gặp/gập, chóp/chớp, lạch/lệch/lịch); (3) từ ghép. Từ ghép được xếp vào vần của tiếng học sau cùng, nên bé luôn gặp từ ghép sau khi đã tập mọi tiếng có chuỗi. Không có vần "ưp" trong tiếng Việt.

Từ ghép: với mỗi tiếng có `item_ref` thì phát chuỗi đánh vần của tiếng đó; tiếng chưa có `item_ref` đọc nguyên một lần; sau đó đọc cả từ và câu ví dụ.

## 2. File
- `spelling_practice_vi_v1.json`: nguồn chính (113 từ đơn, 110 từ ghép, 4 bài, 15 họ vần, 21 cặp khác nguyên âm, 30 tình huống).
- `spelling_practice_vi_v1.csv`: từ đơn, để rà soát.
- `spelling_practice_compounds_vi_v1.csv`: từ ghép, để rà soát.
- `validate_spelling.py`: bộ kiểm tra; phải chạy sạch trước khi nhập dữ liệu.

## 3. Mô hình dữ liệu
- `sound_inventory`: tên âm của âm đầu, âm cuối, thanh (đề xuất, chưa duyệt).
- `rhyme_families`: mỗi họ vần có thanh cho phép (vần kết thúc p, t, c, ch chỉ có sắc/nặng), số bài SGK, trang sách của người dùng.
- `items[]`: `phonics.steps` có thứ tự và loại bước (onset, rime_part, rime_blend, onset_rime_blend, tone_and_final); `case_tags`; `review_flags`; `vocab_ref` liên kết `vocabulary_vi_v2_1.json` khi trùng từ.
- `case_catalog`: danh sách tình huống, trạng thái `covered` (đã có từ minh họa) hoặc `planned` (chưa làm).
- `contrast_pairs`: cặp dễ lẫn (đau/sau, cặp/gặp, sáp/tháp, gạch/lạch). `vowel_contrast_pairs`: cặp khác nguyên âm trong cùng bài.
- `lessons`, `compounds`: xem DATA_SCHEMA.md.

## 4. Quy tắc sinh chuỗi (theo mẫu "đánh" đã xác nhận)
`âm đầu → nguyên âm → âm cuối → vần → âm đầu+vần → "<âm tiết> <thanh> <từ>"`
- Không có âm đầu: bỏ hai bước âm đầu (ếch: `ê → chờ → êch → êch sắc ếch`).
- Thanh ngang: không có bước thanh (đau).
- Tên chữ cái (bê, xê...) không được dùng thay cho âm.

## 5. Tiêu chí chọn từ
Đơn âm tiết, quen với trẻ 4–6 tuổi, gặp trong đời sống, nghĩa ngắn và cụ thể, câu ví dụ an toàn. Từ đa nghĩa chọn một nghĩa chính (ghi ở `source_note`). Tiếng chỉ có trong từ ghép (búp bê, lắp ráp, lấp lánh) đánh dấu `syllable_in_compound` kèm `context_phrase`. Dùng từ chuẩn Hà Nội (ngô, hổ), không dùng từ riêng miền Nam.

## 6. Trạng thái và duyệt
`proposed_rule_based_pending_review` → (giáo viên + người bản ngữ xác nhận) → ghi âm → `approved`.
Chỉ "đánh" là `user_confirmed`; "đau", "sau" là `editorial_correction`. Mục khác chưa được xác nhận.

## 7. Câu hỏi cần giáo viên chốt (xem `review_flags`)
1. `CONFIRM_FINAL_CH_SOUND`: ach, êch, ich dùng âm cuối "chờ" theo mẫu "anh – nhờ". Có đúng không?
2. `CONFIRM_VOWEL_NAME_AA`: ă, â đọc thế nào khi đánh vần?
3. `CONFIRM_ONSET_NAME_HANOI_MERGE`: s/x, d/gi/r, tr/ch đọc giống nhau ở Hà Nội; tên âm và cách phân biệt trong lúc dạy.
4. `SHOW_WRITTEN_LETTER_WITH_SOUND`: c/k, g/gh cùng một âm; giao diện phải hiện chữ viết bên cạnh tên âm.

## 8. Tình huống chưa làm (planned)
ngh, qu, gi, vần đơn (ba, bé), nguyên âm đôi (ia, ua), vần có âm đệm (oa, uy), vần ba âm (iêng), vị trí dấu thanh ở vần phức. Bộ kiểm tra từ chối các vần này cho tới khi quy tắc được duyệt.
