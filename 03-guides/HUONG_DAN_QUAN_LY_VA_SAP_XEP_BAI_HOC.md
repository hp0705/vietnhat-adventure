# HƯỚNG DẪN QUẢN LÝ, SẮP XẾP LỘ TRÌNH VÀ CẬP NHẬT TỪ VỰNG

> **Dành cho:** Phụ huynh và người phát triển dự án *Việt Nhật Adventure* (Thư viện Bé Mây)  
> **Phiên bản áp dụng:** v2.8.2 trở lên

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG

Ứng dụng gồm **2 phân hệ học tập song song** với kho dữ liệu độc lập nhưng dùng chung bộ quy tắc đánh vần và trình phát âm thanh:

| Phân hệ | Màn hình | File dữ liệu gốc | File cấu hình bài học | File âm thanh |
| :--- | :--- | :--- | :--- | :--- |
| **Học từ mới** | Nhánh 1 (Từ vựng) | `01-vocabulary/vocabulary_vi_v2.json` | `app.js` (`buildVocabLessons`) | `06-assets/audio/vi/north-hanoi/` |
| **Tập đánh vần** | Nhánh 2 (Họ vần) | `01-vocabulary/spelling_practice_vi_v1.json` | `app.js` (`buildSpellingLessons`) | `06-assets/audio/spelling/words/` |
| **Dùng chung** | Đánh vần từng âm | `01-vocabulary/spelling_step_audio_map.json` | `danh-van.js`, `danh-van-speech.js` | `06-assets/audio/spelling/steps/` |

---

## 2. CÁCH SẮP XẾP THỨ TỰ TỪ HỌC TRƯỚC / HỌC SAU

### A. Phân hệ 2: "Tập đánh vần" (Dễ sắp xếp nhất)

Trong file `01-vocabulary/spelling_practice_vi_v1.json`, danh sách từ trong từng bài học hiển thị **chính xác 100% theo thứ tự các từ xuất hiện trong mảng `"items"`**.

#### Muốn từ nào học trước:
1. Mở file `01-vocabulary/spelling_practice_vi_v1.json`.
2. Tìm mảng `"items": [ ... ]`.
3. Cắt (Cut) khối dữ liệu của từ bạn muốn bé học trước và Dán (Paste) lên vị trí đầu tiên của nhóm vần đó.

*Ví dụ nhóm vần `ap` (Bài 1):*
```json
{
  "id": "sp_0001",
  "word": "sáp",
  "rhyme_family": "ap"
},
{
  "id": "sp_0002",
  "word": "tháp",
  "rhyme_family": "ap"
}
```
> Nếu muốn bé học từ **"tháp"** trước từ **"sáp"**, bạn chỉ cần đổi chỗ 2 object trên: đưa `sp_0002` lên trước `sp_0001`. Ứng dụng khi mở ra sẽ hiển thị "tháp" là từ đầu tiên!

---

### B. Phân hệ 1: "Học từ mới" (63 Bài học SGK)

Lộ trình Học từ mới được cấu hình trong hàm `buildVocabLessons()` tại file `app.js`:

1. **Bài 1 đến Bài 6 (60 từ cốt lõi đầu tiên):**
   - Được liệt kê danh sách ID trực tiếp trong mảng `old60Ids` ở dòng 712 của `app.js`.
   - Mỗi bài gồm 10 từ theo thứ tự:
     - Bài 1 (Gia đình): 10 ID đầu tiên (`vi_0001` đến `vi_0010`: ba, bà, bố, mẹ, bé, bò, mèo, gà, ca, vịt).
     - Bài 2 (Thiên nhiên): 10 ID tiếp theo (`vi_0011` đến `vi_0020`).
     - Bài 3, 4, 5, 6: Các ID tương ứng tiếp theo.
   - **Cách đổi thứ tự:** Bạn chỉ cần đổi vị trí các ID trong mảng `old60Ids`. Ví dụ muốn từ `vi_0005` (bé) học trước `vi_0001` (ba), chỉ cần đổi chỗ `vi_0005` lên đầu mảng.

2. **Bài 7 và Bài 8 (Từ ghép & nâng cao):**
   - Định nghĩa trong mảng `b7Ids` và `b8Ids` trong `app.js`.
   - Muốn đưa từ nào vào Bài 7, bạn chỉ cần thay mã ID trong mảng `b7Ids`.

3. **Bài 9 đến Bài 63 (Toàn bộ từ còn lại trong SGK):**
   - Tự động chia theo thứ tự xuất hiện của các từ còn lại trong `01-vocabulary/vocabulary_vi_v2.json` (mỗi bài 10 từ).
   - Muốn từ nào học ở Bài 9 thay vì Bài 15, bạn chỉ cần đổi vị trí từ đó lên trên trong file JSON.

---

## 3. CÁCH THÊM TỪ MỚI HOẶC SỬA TỪ HIỆN CÓ

Khi thêm một từ mới, bạn **KHÔNG CẦN TỰ GÕ CHUỖI ĐÁNH VẦN**. Hệ thống có thuật toán chuẩn hóa tự động sinh ra các bước chính xác 100%.

### Mẫu khai báo thêm từ vào `spelling_practice_vi_v1.json`:
```json
{
  "id": "sp_0114",
  "word": "bắp",
  "rhyme_family": "ăp",
  "compound_hint": "bắp ngô",
  "meaning_vi": "bắp ngô thơm ngon",
  "image": {
    "url": "06-assets/images/spelling/sp_0114.png"
  }
}
```

> **Lưu ý quy tắc gợi nghĩa:** Với từ 1 tiếng dễ nhầm lẫn hoặc khó hiểu với bé (như *đa*, *na*, *đá*, *bắp*), luôn thêm `compound_hint` (ví dụ: *cây đa*, *quả na*, *cục đá*, *bắp ngô*) để tranh minh họa và câu hỏi hiển thị rõ nghĩa nhất.

---

## 4. QUY TRÌNH 1-CLICK: TỰ ĐỘNG ĐỒNG BỘ VÀ KIỂM TRA

Mỗi khi bạn thêm từ mới, đổi thứ tự bài học hoặc sửa đổi nội dung, bạn chỉ cần chạy **DUY NHẤT 1 LỆNH**:

```bash
python scripts/quan_ly_tu_vung.py
```

### Lệnh này tự động thực hiện 4 tác vụ:
1. **Tạo quy tắc đánh vần chuẩn R7**: Phân tích từ và tạo chuỗi đánh vần (ví dụ `hoa` -> `hờ - o - a - oa - hờ - oa - hoa`) mà không sợ sai chính tả.
2. **Cập nhật kho âm thanh**: Quét và tự động ghi nhớ đường dẫn file âm thanh tương ứng vào `spelling_step_audio_map.json`.
3. **Tải âm thanh nếu thiếu**: Nếu phát hiện âm thanh nào chưa có, tự động tải file chuẩn tiếng Việt để đảm bảo không bị câm tiếng.
4. **Kiểm tra 34 Golden Cases & Kiểm toán 745 từ**: Đảm bảo toàn bộ hệ thống đạt 100% chuẩn chất lượng trước khi bạn đưa lên web.

---

## 5. DANH SÁCH FILE CẦN XÓA / DỌN DẸP

Để thư mục dự án sạch sẽ, không bị phân tán hoặc gây nhầm lẫn khi chỉnh sửa, dưới đây là danh sách phân loại chi tiết:

### A. Nhóm 1: File rác / File tạm ở thư mục gốc (NÊN XÓA NGAY)
1. `gui-gemini.zip` — File nén đã giải nén xong, không còn tác dụng.
2. `audio-can-thu.txt` — File văn bản nháp tạm thời xuất danh sách âm cần thu.
3. `tu-can-duyet.md` — File nháp ghi chép tạm trước đây.
4. `danh-van_test.js` — File trùng lặp tên gạch dưới (đã có bản chuẩn là `danh-van.test.js`).
5. `kiem-tra-du-lieu.js` — Script kiểm tra cũ bằng Node.js (đã thay bằng script Python).

### B. Nhóm 2: Thư mục trùng lặp dữ liệu (NÊN XÓA HOẶC LƯU TRỮ)
- Thư mục `function 2/`:
  - Đây là thư mục nhánh làm việc cũ khi tạo tính năng Tập đánh vần.
  - Bên trong chứa: `spelling_practice_vi_v1.json`, `expanded_rime_reference_vi_v1.csv`, `DATA_SCHEMA.md`...
  - **Lý do xóa:** Dữ liệu thực tế đang chạy trên app là `01-vocabulary/spelling_practice_vi_v1.json`. Để thư mục này rất dễ gây sửa nhầm file không có tác dụng.

- Thư mục `gui-gemini/`:
  - Thư mục chứa code mẫu do bạn cung cấp để nâng cấp R1–R7.
  - Toàn bộ nội dung trong này (`danh-van.js`, `danh-van-speech.js`, `nghe-thu.html`) đã được tích hợp 100% vào thư mục gốc. Bạn có thể xóa đi để tránh trùng file.

### C. Nhóm 3: Các script vá lỗi 1 lần trong `scripts/` (NÊN LƯU VÀO `scripts/archive/`)
Các script sau đây đã hoàn thành nhiệm vụ lịch sử (sửa từ "bút", tạo ảnh một lần, vá lư đá...) và không còn chạy nữa:
- `align_words_clean.py`, `apply_phonics_engine_to_dataset.py`, `author_20_words.py`, `author_lessons_7_8.py`
- `find_but_in_app.py`, `update_but_audio.py`, `test_but_steps.py`
- `fix_lu_da_and_na.py`, `fix_spelling_steps_clean.py`
- `patch_app_pictures.py`, `patch_app_storage.py`, `patch_app_ui.py`, `patch_loader.py`
- `test_ach_candidates.py`, `test_tts_lap.py`, `verify_b7_b8.py`

### D. Nhóm 4: Các script CỐT LÕI (BẮT BUỘC GIỮ LẠI)
- `scripts/quan_ly_tu_vung.py` — Script chính để đồng bộ dữ liệu 1-Click.
- `scripts/vietnamese_phonics_engine.py` — Bộ máy thuật toán đánh vần tiếng Việt.
- `scripts/run_all_tests.py` — Bộ kiểm thử 34 Golden Cases.
- `scripts/run_python_audit.py` — Bộ kiểm toán dữ liệu 745 từ.
- `scripts/build_complete_audio_map.py` — Trình xây dựng bản đồ âm thanh.
- `scripts/test_danh_van_js.py` — Module ánh xạ Python của `danh-van.js`.
