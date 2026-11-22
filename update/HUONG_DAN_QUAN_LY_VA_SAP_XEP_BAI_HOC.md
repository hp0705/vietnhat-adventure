# HƯỚNG DẪN QUẢN LÝ, SẮP XẾP LỘ TRÌNH VÀ CẬP NHẬT TỪ VỰNG

> **Dành cho:** Phụ huynh và người phát triển dự án *Việt Nhật Adventure* (Thư viện Bé Mây)
> **Cập nhật:** 22/11/2026. Số liệu theo dữ liệu hiện tại, thay cho bản cũ ghi 745 từ / 63 bài.

---

## 1. TỔNG QUAN

| Phân hệ | Số từ | Số bài | File dữ liệu | Nơi chia bài |
| :--- | :--- | :--- | :--- | :--- |
| **Học từ mới** | 198 | 20 | `01-vocabulary/vocabulary_vi_v2.json` | `buildVocabLessons()` trong `app.js` (theo `path_group` 1-5, tối đa 10 từ/bài) |
| **Tập đánh vần** | 230 (140 trong bài + 90 dự phòng) | 14 | `01-vocabulary/spelling_practice_vi_v1.json` | trường `lesson_key` + `path_order` của từng từ; thứ tự bài trong `buildSpellingLessons()` (`app.js`) |
| Dùng chung | | | `spelling_step_audio_map.json` | `danh-van.js`, `danh-van-speech.js` |

Nếu `run_python_audit.py` còn kiểm tra đúng 745 từ thì cần sửa theo số mới: 198 + 230 = 428.

---

## 2. QUY TẮC ĐÁNH VẦN

Ví dụ "tập": `tờ - â - pờ - âp - tờ - âp - tâp - nặng - tập`
(âm đầu, từng chữ của vần, ghép vần, ghép âm đầu + vần, dấu thanh, cả từ.)
Tốc độ chỉnh bằng khoảng nghỉ giữa các bước (`wait_after_step_ms_default`, đề xuất 2500 ms), không cần sửa chuỗi. Chuỗi do script tự sinh, **không gõ tay**.

---

## 3. TẬP ĐÁNH VẦN: MỖI ÂM CUỐI = 1 BÀI, ~10 TỪ ĐẠI DIỆN

| Bài | Âm cuối | Số từ | Các vần có trong bài |
| :-- | :-- | :-- | :-- |
| 1 | Âm cuối P | 10 | ap, ăp, âp, ep, êp, ip, op, ôp, ơp, up |
| 2 | Âm cuối CH | 10 | ach, êch, ich |
| 3 | Âm cuối NH | 10 | anh, inh, ênh |
| 4 | Âm cuối U | 10 | au, âu, êu, iu, iêu, ưu, ươu |
| 5 | Âm cuối NG (1) - nhóm a, ă, â, e | 10 | ang, ăng, âng, eng |
| 6 | Âm cuối NG (2) - nhóm o, ô, u, ư | 10 | ong, ông, ung, ưng |
| 7 | Âm cuối NG (3) - nhóm vần đôi iê, uô, ươ | 10 | iêng, uông, ương |
| 8 | Âm cuối T | 10 | ăt, at, ât, êt, it, ut, ot, ôt, ơt, iêt |
| 9 | Âm cuối C | 10 | ac, ăc, âc, oc, ôc, uc, ưc, ươc, uôc |
| 10 | Âm cuối M | 10 | am, ăm, âm, em, êm, im, ôm, ơm |
| 11 | Âm cuối N | 10 | an, ăn, ân, en, ên, in, on, ôn, ơn, un |
| 12 | Âm cuối I | 10 | ai, oi, ôi, ơi, ui, ưi, ươi, uôi |
| 13 | Âm cuối Y | 10 | ay, ây |
| 14 | Âm cuối O | 10 | ao, eo |

Danh sách từng từ xem `DANH_SACH_TU_TAP_DANH_VAN.md`.

### Đổi từ trong một bài
Trong `spelling_practice_vi_v1.json`, mỗi từ có `"lesson_key"` (bài) và `"path_order"` (thứ tự 1-10). Muốn thay từ A bằng từ B: đặt B có `lesson_key` và `path_order` của A, rồi đặt A thành `"lesson_key": null` (về kho dự phòng). Mỗi bài nên giữ ~10 từ.

### Đổi thứ tự bài
Sửa thứ tự các dòng trong mảng `groups` của `buildSpellingLessons()` trong `app.js`. Lưu ý: tiến độ của bé lưu theo số thứ tự bài, nên đổi thứ tự sẽ làm tiến độ cũ lệch.

### Thêm âm cuối mới
1. Thêm ~10 từ vào `items`, đặt cùng một `lesson_key` mới (ví dụ `"x"`) và `path_order` 1-10.
2. Thêm 1 dòng vào `groups` trong `app.js`: `{ key: 'x', name: 'Âm cuối X', level: '...' }`.
3. Thêm emoji cho từ mới vào `spellingExtraPictures` trong `app.js`.
4. Chạy script đồng bộ (mục 5).

### Mẫu khai báo một từ
```json
{
  "id": "sp_0231",
  "word": "bắp",
  "rhyme_family": "ăp",
  "lesson_key": "x",
  "path_order": 1,
  "context_phrase": "bắp ngô",
  "meaning_vi_child": "bắp ngô thơm ngon",
  "example_vi": "Mẹ luộc bắp cho bé."
}
```
Với từ 1 tiếng dễ nhầm (đa, na, đá, bắp...) luôn thêm `context_phrase`.

---

## 4. HỌC TỪ MỚI (198 từ, 20 bài)

Từ đã xếp sẵn trong `vocabulary_vi_v2.json` theo 5 nhóm `path_group`: 1 = từ 1 tiếng 2 chữ cái, 2 = từ đôi mỗi tiếng 2 chữ cái, 3 = từ 1 tiếng 3 chữ cái, 4 = từ đôi 2-3 chữ cái, 5 = từ dài hơn. Muốn đổi thứ tự: đổi vị trí từ trong JSON (trong cùng nhóm). Các mảng `old60Ids`, `b7Ids`, `b8Ids` và "63 bài SGK" của bản cũ không còn dùng.

---

## 5. QUY TRÌNH 1-CLICK

```bash
python scripts/quan_ly_tu_vung.py
```

Đồng bộ chuỗi đánh vần, cập nhật bản đồ âm thanh, tự tải âm thanh còn thiếu (cần mạng) và chạy kiểm tra. **Các từ mới thêm chưa có file âm thanh**, cần chạy lệnh này một lần (có mạng) trước khi đưa lên web. Ảnh minh hoạ hiện dùng emoji, ảnh thật (`06-assets/images/spelling/`) chưa tạo.

---

## 6. DỌN DẸP THƯ MỤC

Giữ nguyên như bản trước: xoá `gui-gemini.zip`, `audio-can-thu.txt`, `tu-can-duyet.md`, `danh-van_test.js`, `kiem-tra-du-lieu.js`; xoá hoặc lưu trữ thư mục `function 2/` và `gui-gemini/`; chuyển các script vá lỗi 1 lần trong `scripts/` vào `scripts/archive/`. Script CỐT LÕI cần giữ: `quan_ly_tu_vung.py`, `vietnamese_phonics_engine.py`, `run_all_tests.py`, `run_python_audit.py`, `build_complete_audio_map.py`, `test_danh_van_js.py`.
