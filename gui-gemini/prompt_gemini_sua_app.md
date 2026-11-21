# PROMPT ĐƯA CHO GEMINI: SỬA APP DẠY ĐÁNH VẦN TIẾNG VIỆT

> **Cách dùng:** Mở Gemini, đính kèm các file sau rồi dán nguyên phần trong khung bên dưới.
> File cần đính kèm: `danh-van.js`, `danh-van-speech.js`, `danh-van.test.js`, `danh-van-speech.test.js`, `nghe-thu.html`
> và các file của app: `index.html`, `app.js`, `app.css`, cùng file dữ liệu từ vựng (thư mục `01-vocabulary`, `02-pronunciation`).

```
# VAI TRÒ
Bạn là kỹ sư web kiêm giáo viên tiểu học. Bạn sửa một web app tĩnh (HTML/CSS/JS thuần, chạy trên GitHub Pages) dùng để dạy con tôi (4-7 tuổi) học tiếng Việt: màn hình "Tập đánh vần" và màn hình "Học từ mới".

# NGUỒN CHÂN LÝ (BẮT BUỘC TUÂN THEO)
Tôi đính kèm các file đã được kiểm thử, ĐÚNG 100%:
- danh-van.js         : sinh đánh vần bằng code, có hàm kiểm tra auditWord / auditList
- danh-van-speech.js  : tạo kế hoạch đọc từng âm + trình phát (file âm thanh, thiếu thì dùng giọng máy)
- danh-van.test.js, danh-van-speech.test.js : bộ test (36 + 6 test đang đạt hết)
- nghe-thu.html       : trang để tôi nghe thử giọng đọc
KHÔNG được viết lại, đơn giản hóa hay "tối ưu" logic trong các file này. KHÔNG tự sinh đánh vần bằng AI hay bằng regex riêng. Mọi chuỗi đánh vần hiển thị và đọc trong app đều phải đến từ DanhVan.spellSyllable / DanhVan.spellWord.

# LỖI HIỆN TẠI CẦN SỬA
1. Đánh vần sai, đặc biệt ÂM ĐÔI/KÉP phía sau. Ví dụ đang là "cờ ây cây", đúng phải là "cờ - â - y - ây - cờ - ây - cây".
2. TỪ NHIỀU TIẾNG bị mất đoạn đánh vần. Ví dụ "nơ đỏ" đang đọc "nờ ơ nơ đỏ đo hỏi đỏ nơ đỏ" (tiếng "đỏ" mất "đờ - o"). Đúng phải là: nờ - ơ - nơ | đờ - o - đo - hỏi - đỏ | nơ đỏ. Tương tự "nhũ đá", "tu hú", "tê tê".
3. Màn "Học từ mới" KHÔNG đọc đánh vần (chỉ màn "Tập đánh vần" đọc). Cả hai màn phải đọc đánh vần giống hệt nhau.
4. Giọng đọc: vần như "ach", "êch", "iêng" bị đọc thành "a", "ê", "iê" vì bị đọc một hơi; dấu sắc nghe thành "sắt" hoặc không nghe được.
5. Từ vựng quá hiếm, xa đời sống trẻ (ví dụ "nhũ đá").

# YÊU CẦU SỬA (làm đủ, đúng thứ tự)

## R1. Một nguồn đánh vần duy nhất
- Nạp danh-van.js và danh-van-speech.js vào index.html (đặt trước app.js).
- Xóa/thay mọi chỗ trong app.js và file dữ liệu đang lưu sẵn hoặc tự tạo chuỗi đánh vần. Từ vựng chỉ cần lưu: từ (vd "nơ đỏ"), cụm gợi nghĩa nếu cần (vd "quả na"), hình/emoji. Chuỗi đánh vần luôn được TÍNH BẰNG CODE lúc chạy: DanhVan.spellWord(tu).
- Từ nào DanhVan báo lỗi không phân tích được thì ghi vào danh sách "từ lỗi" và báo cho tôi, KHÔNG tự đoán.

## R2. Quy tắc đánh vần (đã cài trong code, để bạn hiểu và hiển thị đúng)
- Một tiếng = [âm đầu] + [vần] + [thanh].
- Có âm đầu và vần nhiều chữ: [vần đánh vần từng bước] - [âm đầu] - [vần] - [tiếng không dấu] - [tên dấu nếu có] - [tiếng có dấu].
  Ví dụ: hoa = hờ - o - a - oa - hờ - oa - hoa ; cây = cờ - â - y - ây - cờ - ây - cây.
- Vần 1 chữ: [âm đầu] - [nguyên âm] - [tiếng không dấu] - [dấu] - [tiếng có dấu]. Ví dụ: hú = hờ - u - hu - sắc - hú.
- Từ nhiều tiếng: đánh vần ĐỦ từng tiếng (mỗi tiếng đầy đủ các bước trên, không bỏ tiếng nào), rồi đọc trơn cả từ. Ví dụ: tu hú = tờ - u - tu | hờ - u - hu - sắc - hú | tu hú.
- Từ ngắn khó hiểu thì thêm từ chỉ loại để hiển thị và hỏi trẻ ("quả na", "cây đa"), nhưng phần đánh vần chỉ đánh vần tiếng gốc.

## R3. Cả hai màn hình dùng chung một hàm đọc
- Tạo MỘT đối tượng player: const player = DanhVanSpeech.createPlayer({ audioBase: '06-assets/audio/', onItem: ... });
- Màn "Tập đánh vần" và màn "Học từ mới" đều gọi player.say(tu) khi bấm nút loa, và khi từ mới hiện ra (nếu app đang tự đọc).
- Khi chuyển câu/màn hình hoặc bấm lại: gọi player.stop() trước để không bị đọc chồng.
- Dùng onItem để tô sáng âm đang đọc trên màn hình (chữ to, tương phản rõ).
- KHÔNG gộp cả chuỗi đánh vần thành một câu rồi đưa cho speechSynthesis đọc một lần.

## R4. Âm thanh cho trẻ nghe rõ
- Giữ cơ chế: có file âm thanh thì phát file, thiếu thì dùng giọng máy vi-VN.
- Thêm nút/chỉnh tốc độ (chậm/vừa) vào cài đặt; mặc định chậm (rate khoảng 0.8 trở xuống).
- Thêm một script liệt kê file âm thanh cần thu: dùng DanhVanSpeech.neededAudio(tatCaTuVung), in ra danh sách { file, text }. Lưu thành audio-can-thu.txt để tôi thu âm hoặc tạo giọng.
- Không được kết luận "đã sửa xong âm thanh". Chỉ tôi nghe trên thiết bị thật mới xác nhận. Hãy ghi rõ phần này cần tôi kiểm tra bằng tai.

## R5. Chọn từ vựng sát đời sống
- Chỉ giữ từ mà trẻ 4-7 tuổi gặp hằng ngày, chỉ tay vào hoặc hình dung được ngay: đồ vật trong nhà, đồ ăn, con vật quen, cây cối, người thân, bộ phận cơ thể, màu sắc, hành động đơn giản.
- Không dùng từ chuyên môn, khoa học, văn chương hoặc Hán Việt hiếm. Ví dụ: "nhũ đá" => đổi thành "hòn đá".
- Với mỗi từ bạn đề xuất thay, KHÔNG tự xóa/đổi trong dữ liệu. Hãy tạo file tu-can-duyet.md gồm bảng: từ cũ | lý do | từ đề xuất, để tôi duyệt.

## R6. Kiểm tra dữ liệu tự động
- Viết script kiem-tra-du-lieu.js (Node) đọc toàn bộ từ vựng của app và với MỖI từ kiểm tra:
  a) DanhVan.spellWord(tu) không báo lỗi;
  b) với từ nhiều tiếng, số mục đánh vần = số tiếng, mỗi tiếng đều có đủ bước; cuối cùng có đọc trơn cả từ (dùng DanhVan.auditWord);
  c) nếu app còn dữ liệu đánh vần lưu sẵn từ trước, gọi DanhVan.auditList trên đó và in ra các từ SAI cùng đáp án đúng.
- Script thoát với mã lỗi khác 0 nếu còn bất kỳ từ sai.
- Thêm vào .github/workflows (nếu repo đã có workflow thì bổ sung) bước chạy: node --test và node kiem-tra-du-lieu.js, để deploy bị chặn khi có lỗi.

## R7. Thêm test cho app (ngoài các test đã có)
Thêm vào bộ test các ca sau (đáp án là chuỗi đúng tuyệt đối, so từng ký tự sau khi chuẩn hóa dấu gạch/khoảng trắng):

| Từ | Đáp án đánh vần |
|----|-----------------|
| hoa | hờ - o - a - oa - hờ - oa - hoa |
| cây | cờ - â - y - ây - cờ - ây - cây |
| khách | khờ - a - chờ - ach - khờ - ach - khach - sắc - khách |
| ếch | ê - chờ - êch - sắc - ếch |
| khiêng | khờ - i - ê - iê - ngờ - iêng - khờ - iêng - khiêng |
| xoài | xờ - o - a - oa - i - oai - xờ - oai - xoai - huyền - xoài |
| chuối | chờ - u - ô - uô - i - uôi - chờ - uôi - chuôi - sắc - chuối |
| nơ đỏ | nờ - ơ - nơ \| đờ - o - đo - hỏi - đỏ \| nơ đỏ |
| nhũ đá | nhờ - u - nhu - ngã - nhũ \| đờ - a - đa - sắc - đá \| nhũ đá |
| hòn đá | hờ - o - nờ - on - hờ - on - hon - huyền - hòn \| đờ - a - đa - sắc - đá \| hòn đá |
| tu hú | tờ - u - tu \| hờ - u - hu - sắc - hú \| tu hú |
| tê tê | tờ - ê - tê \| tờ - ê - tê \| tê tê |

Thêm 2 loại test giao diện/tích hợp (viết bằng cách đơn giản nhất chạy được, ví dụ test thuần Node trên hàm cấp dữ liệu cho UI, hoặc Playwright nếu có):
- Test "cả hai màn hình dùng chung": cả màn "Tập đánh vần" và "Học từ mới" đều lấy chuỗi hiển thị và kế hoạch đọc từ cùng một hàm (DanhVan.spellWord / DanhVanSpeech.planWord). Với "nơ đỏ", kế hoạch đọc phải là: nờ, ơ, nơ, đờ, o, đo, hỏi, đỏ, nơ, đỏ, nơ đỏ.
- Test "không gộp một câu": mỗi âm là một lần đọc riêng (đếm số lần gọi speak/Audio bằng đối tượng giả).

# TUYỆT ĐỐI KHÔNG
- Không sửa các file danh-van*.js để làm test "xanh". Nếu bạn cho rằng một đáp án đúng trong test là sai, DỪNG LẠI và hỏi tôi, kèm lý do.
- Không tự thêm hay đổi quy tắc đánh vần.
- Không viết đánh vần bằng tay vào dữ liệu.
- Không nói "đã xong", "đã đúng", "đã kiểm tra" nếu bạn chưa chạy lệnh và chưa dán kết quả thật.

# QUY TRÌNH VÀ CÁCH BÁO CÁO
1. Đọc kỹ toàn bộ file đính kèm và file app. Liệt kê ngắn: app đang lấy đánh vần ở đâu, đang đọc ở đâu, hai màn hình khác nhau chỗ nào.
2. Sửa theo R1 đến R7.
3. Chạy: node --test (tất cả file *test.js) và node kiem-tra-du-lieu.js. Nếu bạn không chạy được lệnh trong môi trường của mình, nói rõ và đưa lệnh chính xác để tôi chạy, không được giả vờ đã chạy.
4. Trả lời theo mẫu:
   - Danh sách file đã đổi/tạo (kèm code đầy đủ từng file, không viết tắt "...").
   - Kết quả chạy test thật (dán nguyên văn).
   - Danh sách từ đang sai trong dữ liệu cũ trước khi sửa (nếu có).
   - Mục "Cần tôi kiểm tra bằng tai" (âm thanh) và mục "Câu hỏi cho tôi" (nếu có điểm chưa chắc).

# ĐỊNH NGHĨA HOÀN THÀNH
- Tất cả test đạt, kiem-tra-du-lieu.js báo 0 lỗi.
- Hai màn hình đều đọc đánh vần giống nhau, từ nhiều tiếng đủ từng tiếng, có đọc trơn cả từ.
- Không còn chuỗi đánh vần viết tay trong dữ liệu hoặc code.
- Có audio-can-thu.txt và tu-can-duyet.md.
```

---

## Sau khi Gemini trả lời, bạn kiểm tra nhanh 4 việc
1. Gemini có dán kết quả `node --test` thật, ghi đủ số test đạt (không có test nào bị xóa hay nới lỏng)?
2. Mở app, thử "nơ đỏ" và "khách" ở **cả hai** màn hình, nghe có đủ từng âm và có "dấu sắc" không?
3. Mở `nghe-thu.html` trên thiết bị của con để chỉnh tốc độ và thử cách đọc cho vần khó.
4. Duyệt `tu-can-duyet.md` trước khi cho đổi từ vựng.

Nếu Gemini sửa `danh-van.js` hoặc nới đáp án test cho "xanh", hãy bắt nó làm lại và đừng tin kết quả đó.
