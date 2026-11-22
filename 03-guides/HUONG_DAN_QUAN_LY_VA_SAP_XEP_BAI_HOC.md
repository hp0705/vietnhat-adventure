# HƯỚNG DẪN QUẢN LÝ, CẤU TRÚC FILE VÀ SẮP XẾP LỘ TRÌNH HỌC TẬP

> **Dành cho:** Phụ huynh và nhà phát triển dự án *Việt Nhật Adventure* (Thư viện Bé Mây)  
> **Phiên bản áp dụng:** v2.9.0 (Đầy đủ tính năng Ô Vần riêng, Bảng Vần tương tác, 100% âm thanh giọng Bắc chuẩn Hà Nội)  
> **Cập nhật lần cuối:** 22/11/2026

---

## 1. TỔNG QUAN KIẾN TRÚC & CÁC FILE CẦN DÙNG (CỐT LÕI)

Ứng dụng được tổ chức thành **2 phân hệ học tập song song**, cùng dùng chung bộ giải thuật đánh vần R7 và hệ thống phát âm:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           VIỆT NHẬT ADVENTURE (v2.9.0)                          │
├──────────────────────────────────────┬──────────────────────────────────────────┤
│    PHÂN HỆ 1: TẬP ĐÁNH VẦN           │    PHÂN HỆ 2: HỌC TỪ MỚI                 │
│    (state.activeModule = 'spelling') │    (state.activeModule = 'vocab')        │
│    - 14 bài học theo họ vần          │    - 20 bài học theo chủ đề đời sống     │
│    - Ô Vần riêng ở trên cùng thẻ từ  │    - 198 từ vựng mở rộng                │
│    - Màn hình Bảng vần tương tác     │    - Cụm từ gợi nghĩa cho bé             │
│    - 230 từ vựng có sẵn              │    - Tranh minh họa và câu ví dụ         │
└──────────────────────────────────────┴──────────────────────────────────────────┘
```

### Bảng tóm tắt các file cần dùng trong hệ thống:

| Nhóm chức năng | Tên file / Thư mục | Vai trò & Mục đích sử dụng |
| :--- | :--- | :--- |
| **Giao diện Web** | `index.html` | Cấu trúc HTML chính: Trạm học từ, Ô Vần, Bảng Vần, Bản đồ bài học, Mini game. |
| | `app.css` | Toàn bộ giao diện, hiệu ứng hoạt họa, màu sắc chuẩn (vần đỏ, phụ âm đầu xanh). |
| | `app.js` | Điều khiển toàn bộ ứng dụng: chuyển view, chọn bài, phát âm, quản lý trạng thái. |
| **Thuật toán Đánh vần** | `danh-van.js` | Thuật toán đánh vần R7 chuẩn SGK lớp 1 (sinh chuỗi âm thanh chính xác). |
| | `danh-van-speech.js` | Trình phân tách các bước đánh vần (Audio planner cho hàng chip). |
| | `danh-van.test.js` | Bộ bài test chuẩn cho thuật toán đánh vần. |
| **Dữ liệu bài học** | `01-vocabulary/spelling_practice_vi_v1.json` | **Dữ liệu Phân hệ 2 (Tập đánh vần):** 230 từ chia 14 bài học, đường dẫn âm thanh từ & câu ví dụ. |
| | `01-vocabulary/vocabulary_vi_v2.json` | **Dữ liệu Phân hệ 1 (Học từ mới):** 198 từ vựng, cụm gợi nghĩa, đường dẫn âm thanh từ & ví dụ. |
| | `01-vocabulary/rhyme_charts_vi_v1.json` | **Dữ liệu Bảng Vần:** Cấu trúc 2 hàng (sắc, nặng) hiển thị từ có phụ âm đầu và vần có dấu. |
| | `01-vocabulary/spelling_step_audio_map.json` | Bản đồ ánh xạ 944 âm tiết/bước đánh vần sang file mp3 tương ứng. |
| | `01-vocabulary/spelling_pictures.json` | Danh mục ánh xạ hình ảnh cho phân hệ đánh vần. |
| **Kho Âm thanh** | `06-assets/audio/spelling/words/` | 231 file mp3 đọc nguyên từ của Tập đánh vần (`sp_XXXX.mp3`). |
| | `06-assets/audio/spelling/examples/` | 230 file mp3 đọc câu ví dụ của Tập đánh vần (`sp_XXXX.mp3`). |
| | `06-assets/audio/spelling/steps/` | 944 file mp3 phát âm từng âm rời, vần và dấu thanh (chuẩn giọng Bắc Hoài My). |
| | `06-assets/audio/vi/north-hanoi/{id}/` | 198 thư mục từ vựng, mỗi thư mục gồm `word.mp3` (từ) và `example.mp3` (câu ví dụ). |
| **Kho Hình ảnh** | `06-assets/images/spelling/` | Hình ảnh minh họa cho các bài học đánh vần. |
| **Script cốt lõi** | `scripts/run_all_tests.py` | Kiểm tra tự động 34 trường hợp đặc biệt (Golden cases). |
| | `scripts/run_python_audit.py` | Kiểm toán độ chính xác thuật toán đánh vần trên 428 mục từ vựng. |
| | `scripts/generate_all_word_and_example_audio.py`| Tự động tạo âm thanh giọng Bắc (từ & câu ví dụ) bằng AI khi thêm từ mới. |
| | `scripts/test_danh_van_js.py` | Cầu nối thực thi và kiểm thử `danh-van.js` từ môi trường Python. |
| | `scripts/vietnamese_phonics_engine.py` | Bộ máy ngôn ngữ phân tích âm - vần - thanh tiếng Việt. |

---

## 2. CÁCH SẮP XẾP LỘ TRÌNH HỌC (TỪ HỌC TRƯỚC / HỌC SAU)

### A. Phân hệ "Tập đánh vần" (Dễ sắp xếp và trực quan nhất)

Toàn bộ 14 bài học được định nghĩa trong file `01-vocabulary/spelling_practice_vi_v1.json`:
- Trong file JSON, trường `"lessons"` chia các bài từ Bài 1 đến Bài 14:
  - Bài 1 đến 8: Các họ vần kết thúc bằng âm tắc `-p` (`-ap`, `-ăp`, `-âp`, `-ep`, `-êp`, `-ip`, `-op`, `-ôp`, `-ơp`, `-up`).
  - Bài 9 đến 14: Các họ vần kết thúc bằng âm tắc `-ch` (`-ach`, `-êch`, `-ich`).
- Thứ tự hiển thị từng từ trong bài học **tuân theo 100% thứ tự các từ trong mảng `"items"`**:
  - Muốn từ nào học trước trong một bài: Bạn chỉ cần mở file `01-vocabulary/spelling_practice_vi_v1.json`, tìm từ đó trong mảng `"items"`, di chuyển (Cut & Paste) khối object của từ đó lên vị trí đầu tiên của nhóm bài học đó.
  - Ví dụ nhóm vần `ap`: Nếu muốn học từ `"tháp"` (`sp_0002`) trước từ `"sáp"` (`sp_0001`), chỉ cần đổi chỗ `sp_0002` đứng trước `sp_0001`. Khi mở bài học, từ "tháp" sẽ hiện đầu tiên.

### B. Phân hệ "Học từ mới" (20 Bài học theo chủ đề)

Lộ trình được cấu hình trong hàm `buildVocabLessons()` tại file `app.js`:
- Toàn bộ 198 từ trong `01-vocabulary/vocabulary_vi_v2.json` được chia thành **20 bài học** (mỗi bài gồm 10 từ, bài cuối gồm 8 từ).
- **Cách đổi thứ tự từ trong bài:**
  1. Mở file `01-vocabulary/vocabulary_vi_v2.json`.
  2. Tìm từ muốn thay đổi trong mảng `"items"`.
  3. Di chuyển vị trí của từ đó lên trước hoặc ra sau. Khi app khởi động, `buildVocabLessons` sẽ nạp từ đúng theo thứ tự mới sắp xếp.

---

## 3. CÁCH THÊM TỪ MỚI HOẶC BẢNG VẦN

### A. Thêm từ mới vào "Tập đánh vần"
Mở `01-vocabulary/spelling_practice_vi_v1.json` và thêm một đối tượng từ mới vào mảng `"items"`:
```json
{
  "id": "sp_0231",
  "word": "tạp",
  "rhyme_family": "ap",
  "meaning_vi": "tạp chí nhiều hình đẹp",
  "example_vi": "Bé cùng mẹ đọc cuốn tạp chí sắc màu.",
  "image": {
    "url": "06-assets/images/spelling/sp_0231.png"
  }
}
```
*Lưu ý:* **Không cần tự gõ chuỗi đánh vần hay đường dẫn âm thanh**. Script tự động sẽ bổ sung cho bạn.

### B. Thêm Bảng Vần vào `rhyme_charts_vi_v1.json` (Phần B)
Khi có một vần mới muốn bé học qua bảng tổng hợp (như trang sách giáo khoa), khai báo vào `01-vocabulary/rhyme_charts_vi_v1.json`:
```json
{
  "rhyme": "âp",
  "picture_caption": "bài tập",
  "rows": [
    {
      "tone": "sắc",
      "rhyme_form": "ấp",
      "words": [
        { "word": "bấp", "onset": "b" },
        { "word": "cấp", "onset": "c" }
      ]
    },
    {
      "tone": "nặng",
      "rhyme_form": "ập",
      "words": [
        { "word": "bập", "onset": "b" },
        { "word": "đập", "onset": "đ" }
      ]
    }
  ]
}
```
*Khi bé bấm nút "📋 Bảng vần", màn hình sẽ tự động hiển thị bảng gồm 2 hàng (sắc và nặng), phụ âm đầu tô xanh (`#2563eb`), vần tô đen.*

---

## 4. QUY TRÌNH 1-CLICK: TỰ ĐỘNG SINH ÂM THANH & KIỂM THỬ

Mỗi khi bạn thêm từ mới hoặc sửa đổi nội dung câu ví dụ, chỉ cần chạy 2 lệnh sau:

### Bước 1: Tạo tự động toàn bộ file âm thanh còn thiếu (Giọng Bắc chuẩn)
```bash
python scripts/generate_all_word_and_example_audio.py
```
- Tự động phát hiện bất kỳ từ hoặc câu ví dụ nào chưa có file âm thanh.
- Sử dụng giọng chuẩn Bắc `vi-VN-HoaiMyNeural` tạo file `.mp3` chất lượng cao, tự động lưu vào đúng thư mục (`words/`, `examples/`).
- Tự động cập nhật metadata `audio` vào 2 file JSON (`vocabulary_vi_v2.json` và `spelling_practice_vi_v1.json`).

### Bước 2: Kiểm thử tự động đảm bảo chất lượng 100%
```bash
python scripts/run_all_tests.py
python scripts/run_python_audit.py
```
- Kiểm tra toàn bộ 34 trường hợp đánh vần phức tạp (Golden Cases).
- Kiểm toán toàn diện 428 mục từ vựng, đảm bảo không có bất kỳ từ nào bị lỗi phát âm hay câm tiếng.

---

## 5. DANH SÁCH FILE VÀ THƯ MỤC CẦN XÓA / DỌN DẸP

Để dự án luôn gọn gàng, tránh việc chỉnh sửa nhầm file cũ gây lỗi tính năng, dưới đây là danh sách phân loại chi tiết các file **CẦN XÓA HOẶC LƯU TRỮ**:

### A. Thư mục và file trùng lặp tại thư mục gốc (NÊN XÓA NGAY)

| Tên file / Thư mục | Lý do cần xóa |
| :--- | :--- |
| `update/` (thư mục) | **Rất nguy hiểm:** Chứa file `app.js` và `spelling_practice_vi_v1.json` bản cũ lúc chưa tích hợp âm thanh câu ví dụ và Bảng vần. Giữ lại dễ gây copy đè làm hỏng code mới. |
| `HUONG_DAN_QUAN_LY_VA_SAP_XEP_BAI_HOC.md` (ở root) | File trùng lặp ở thư mục gốc (bản chuẩn đầy đủ và mới nhất đã nằm tại `03-guides/HUONG_DAN_QUAN_LY_VA_SAP_XEP_BAI_HOC.md`). |
| `DANH_SACH_TU_TAP_DANH_VAN.md` (ở root) | Bản danh sách từ cũ xuất ra để xem tạm. Dữ liệu thực tế đang chạy là `01-vocabulary/spelling_practice_vi_v1.json`. |
| `tu-can-duyet.md` | File nháp ghi chép các từ cần duyệt từ giai đoạn trước, đã duyệt xong. |
| `nghe-thu.html` | Trang HTML thử nghiệm âm thanh lúc phát triển thuật toán R7, không còn dùng trên app chính. |

### B. Các script chạy 1 lần trong `scripts/` (NÊN XÓA HOẶC CHUYỂN VÀO `scripts/archive/`)

Các script sau đây được viết ra để sửa lỗi hoặc tạo dữ liệu tạm thời 1 lần ở các phiên bản trước (v2.0 - v2.7), hiện tại **không còn dùng trong quy trình vận hành**:

1. **Nhóm tạo dữ liệu 1 lần trong quá khứ:**
   - `scripts/author_20_words.py`, `scripts/author_lessons_7_8.py`
   - `scripts/enrich_all_552_words.py`, `scripts/find_fallback_ids.py`
   - `scripts/create_spelling_examples.py`, `scripts/create_spelling_pictures.py`
   - `scripts/gen_bemay_audio.py`, `scripts/gen_finish_bemay.py`, `scripts/gen_core_spelling_sounds.py`, `scripts/gen_encourage_4_5.py`
   - `scripts/synthesize_starter_tokens.py`

2. **Nhóm vá dữ liệu cũ:**
   - `scripts/align_words_clean.py`, `scripts/apply_phonics_engine_to_dataset.py`
   - `scripts/fix_spelling_steps_clean.py`, `scripts/repair_all_audio.py`
   - `scripts/update_p_to_pho.py`, `scripts/update_spelling_rules_pipes.py`
   - `scripts/patch_app_storage.py`, `scripts/patch_app_ui.py`, `scripts/patch_loader.py`

3. **Nhóm script test nháp / in thông tin tạm thời:**
   - `scripts/find_in_app.py`, `scripts/find_step.py`, `scripts/find_missing_audio.py`
   - `scripts/inspect_f2_lessons.py`, `scripts/list_by_rf.py`, `scripts/list_f2_words.py`
   - `scripts/print_all_authored.py`, `scripts/print_f2_meanings.py`, `scripts/print_others.py`, `scripts/print_vocab_60_85.py`
   - `scripts/test_batch_spelling.py`, `scripts/test_but_steps.py`, `scripts/test_golden_cases.py`, `scripts/test_lesson_builder.py`, `scripts/test_tts_lap.py`, `scripts/verify_b7_b8.py`
   - `scripts/audit_all_spelling_steps.py`, `scripts/check_f2_pic_mapping.py`
   - `scripts/gen_pho_step.py`, `scripts/gen_needed_audio.py`, `scripts/gen_spelling_steps_audio.py`, `scripts/gen_spelling_words_audio.py`, `scripts/generate_all_missing_spelling_steps.py`

### C. Các script CỐT LÕI trong `scripts/` (BẮT BUỘC GIỮ LẠI)

Chỉ cần giữ lại **6 script cốt lõi** này là hệ thống vận hành hoàn hảo 100%:
1. `scripts/run_all_tests.py` — Chạy test 34 Golden Cases chuẩn.
2. `scripts/run_python_audit.py` — Chạy kiểm toán toàn diện 428 mục từ vựng.
3. `scripts/generate_all_word_and_example_audio.py` — Tự động tạo âm thanh giọng Bắc (từ & câu ví dụ) khi thêm từ mới.
4. `scripts/vietnamese_phonics_engine.py` — Engine ngôn ngữ phân tích đánh vần tiếng Việt.
5. `scripts/build_complete_audio_map.py` — Tự động cập nhật file bản đồ âm thanh `spelling_step_audio_map.json`.
6. `scripts/test_danh_van_js.py` — Module cầu nối chạy `danh-van.js` phục vụ kiểm thử tự động.
