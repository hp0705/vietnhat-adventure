Chào bạn. Tôi cần bạn sửa 2 việc trong app dạy bé đọc tiếng Việt "Việt Nhật Adventure": VIỆC 1 (lỗi âm thanh sai từ) và VIỆC 2 (bỏ chữ trong đáp án trò ghép hình).
Hãy đọc hết tin nhắn trước khi viết code. Làm VIỆC 1 trước, VIỆC 2 sau.

FILE TÔI GỬI KÈM: app.js (bản hiện tại), 01-vocabulary/vocabulary_vi_v2.json (bản hiện tại),
scripts/generate_all_word_and_example_audio.py, scripts/audit_audio_match.py (mới, xem bên dưới),
kết quả chạy `python scripts/audit_audio_match.py` (tôi dán ở cuối tin nhắn).

QUY TẮC CHUNG
- Sửa nhỏ, đúng yêu cầu. KHÔNG viết lại cả file, KHÔNG đổi tên hàm/biến đang có, KHÔNG thêm tính năng.
- KHÔNG đổi thứ tự từ, KHÔNG đổi id, KHÔNG đổi nội dung chữ (word, meaning, example) trong các file .json.
  Chỉ được đổi các trường đường dẫn âm thanh (audio.*) khi thật sự cần.
- Chỉ trả về đoạn đã sửa: ghi rõ tên file, tên hàm, đoạn CŨ, đoạn MỚI.
- KHÔNG đụng vào: buildVocabLessons, getWordHint, playWordWithHint, vocabPictureData,
  VOCAB_LAYOUT_VERSION, ô Vần, Bảng vần.

==================================================
VIỆC 1: ÂM THANH ĐỌC SAI TỪ
==================================================
TRIỆU CHỨNG (đã thấy tận mắt)
Trong "Học từ mới", mở từ "cục đá" (id vi_0099). Chữ hiển thị đúng là "cục đá", các chip đánh vần
(cờ - u - cờ - uc ... cục - đờ - a - đa - sắc - đá - cục đá) cũng đúng,
nhưng bấm nút loa bên cạnh từ thì nghe đọc "nhà kho".
Trong dữ liệu cũ, "nhà kho" có id vi_0098, "cục đá" có id vi_0099 (hai id liền nhau).
Rất có thể còn nhiều từ khác bị nhầm tương tự. Tôi muốn sửa TẬN GỐC, không chỉ sửa riêng "cục đá".

BỐI CẢNH QUAN TRỌNG
- Tôi vừa sắp xếp lại và lọc bớt vocabulary_vi_v2.json (từ 632 còn 198 từ). Thứ tự từ trong file đã
  KHÁC thứ tự id ban đầu. Ví dụ "cục đá" (vi_0099) giờ nằm ở vị trí thứ 71, không còn là thứ 99.
  Từ "nhà kho" (vi_0098) đã bị loại khỏi danh sách nhưng thư mục âm thanh cũ vi_0098 có thể vẫn còn trên đĩa.
- Âm thanh từ vựng lưu ở 06-assets/audio/vi/north-hanoi/{id}/word.mp3 và example.mp3.
- Script scripts/generate_all_word_and_example_audio.py tạo âm thanh bằng giọng vi-VN-HoaiMyNeural.

BƯỚC 1: TÌM NGUYÊN NHÂN (làm đầu tiên, CHƯA ĐƯỢC SỬA GÌ)
Hãy kiểm tra từng giả thuyết dưới đây bằng cách ĐỌC CODE và DỮ LIỆU THẬT, rồi báo cho tôi kết quả
từng giả thuyết là ĐÚNG hay SAI kèm bằng chứng (dòng code / giá trị trong JSON):

  G1. Script tạo âm thanh đặt tên thư mục theo VỊ TRÍ trong danh sách (enumerate / chỉ số) thay vì theo `id` của từ.
      Nếu vậy, sau khi tôi đổi thứ tự thì mọi thứ lệch. Hãy tìm trong script đoạn tạo đường dẫn
      (kiểu f"vi_{...:04d}") và xem nó lấy số từ `item['id']` hay từ chỉ số vòng lặp.
  G2. Trong vocabulary_vi_v2.json, từ "cục đá" (id vi_0099) có trường audio.word_full /
      audio.dialects.north.word_full trỏ SAI sang thư mục vi_0098 (hoặc thư mục id khác). In ra giá trị thật.
  G3. Thư mục vi_0099 tồn tại và đường dẫn đúng, nhưng NỘI DUNG file word.mp3 trong đó là âm "nhà kho"
      (do lần tạo trước dùng nhầm văn bản). Hãy chỉ ra đoạn code đã truyền văn bản vào TTS cho từng file.
  G4. app.js không dùng đường dẫn trong JSON mà tra theo CHỮ trong spelling_step_audio_map.json
      (khóa theo từ) hoặc theo "special_words", và khóa này trỏ nhầm. Hãy đọc kỹ getDialectAudio(),
      playAudioSrc(), playWordWithHint() và mọi chỗ khác gọi phát âm từ, liệt kê CHÍNH XÁC
      thứ tự ưu tiên nguồn âm thanh khi bấm loa ở thẻ từ.
  G5. Có hai file khác nhau cùng được nạp (ví dụ thư mục update/ cũ) nên app đọc nhầm bản cũ.

Sau đó chạy: python scripts/audit_audio_match.py
và dán nguyên văn kết quả. Script này báo: file không tồn tại, đường dẫn trỏ sang id khác,
nhiều từ dùng chung một file, các file mp3 giống hệt nhau nhưng thuộc từ khác nhau, thư mục mồ côi.

Tóm tắt NGUYÊN NHÂN GỐC bằng 3-5 dòng và liệt kê TẤT CẢ các từ bị ảnh hưởng (không chỉ "cục đá").
Dừng lại ở đây và chờ tôi xác nhận, rồi mới sang bước 2.

BƯỚC 2: SỬA TẬN GỐC (sau khi tôi xác nhận)
  a) Sửa script tạo âm thanh để đường dẫn LUÔN lấy từ `item['id']`, tuyệt đối không dùng chỉ số vòng lặp.
  b) Thêm tùy chọn `--force`: tạo lại TOÀN BỘ word.mp3 và example.mp3 của 198 từ trong
     vocabulary_vi_v2.json (và nếu cần cả spelling_practice_vi_v1.json) từ chính văn bản `word` /
     `example_vi` của từ đó, ghi đè file cũ. Chạy mặc định (không --force) thì chỉ tạo file còn thiếu như hiện nay.
  c) Ghi file manifest 01-vocabulary/audio_manifest.json với mỗi file: { "path", "id", "text", "kind" }
     (text là đúng chữ đã đưa vào TTS). Mục đích: sau này có thể kiểm tra chữ trong manifest
     có còn khớp với chữ trong JSON hay không.
  d) Sau khi tạo lại, cập nhật audio.word_full, audio.example_sentence và audio.dialects.north.* trong
     vocabulary_vi_v2.json cho đúng đường dẫn mới. KHÔNG đổi trường nào khác.
  e) Các thư mục âm thanh cũ không thuộc từ nào trong 198 từ hiện có (ví dụ vi_0098 của "nhà kho"):
     KHÔNG xóa, hãy chuyển vào 06-assets/audio/vi/_archive/ để khỏi bị nhầm.
  f) Nếu nguyên nhân thuộc G4 (app.js tra theo chữ): sửa getDialectAudio()/playWordWithHint() để
     chế độ "Học từ mới" LUÔN dùng đường dẫn trong item.audio của chính từ đó trước tiên,
     chỉ khi thiếu mới dùng giọng dự phòng (playAudioSrc(null, text)). Không tra theo chữ ở chế độ này.
  g) Thêm vào scripts/audit_audio_match.py (nếu cần) kiểm tra: mọi dòng trong audio_manifest.json
     phải có text bằng đúng chữ hiện tại của từ có id đó.

BƯỚC 3: TỰ KIỂM TRA (ghi kết quả từng mục)
  [ ] python scripts/audit_audio_match.py chạy xong, 0 lỗi.
  [ ] "cục đá": loa bên cạnh từ phát "cục đá"; loa ở câu ví dụ phát đúng câu "Bé nhặt cục đá nhỏ xếp thành hình tròn."
  [ ] Làm tương tự với 10 từ ngẫu nhiên khác trong cả 5 nhóm (ba, mèo, cà phê, quả cam, bệnh viện, ...):
      ghi rõ file mp3 nào được dùng và văn bản trong manifest.
  [ ] Nút "Gợi ý âm thanh" trong trò ghép hình cũng đọc đúng từ.
  [ ] Chế độ "Tập đánh vần" không bị ảnh hưởng.

==================================================
VIỆC 2: BỎ CHỮ TRONG ĐÁP ÁN TRÒ GHÉP HÌNH
==================================================
Hiện tại: trò "Thử thách ghép hình" hiện chữ (ví dụ "xe"), bé chọn 1 trong 3 hình.
Dưới mỗi hình đang có thêm CHỮ ("Cà phê", "Chiếc xe", "Che ô"). Chữ này làm lộ đáp án
(thấy chữ "xe" trong "Chiếc xe" là đoán được) nên bé không cần tự đọc. Cần bỏ chữ đó đi,
CHỈ CÒN HÌNH.

Yêu cầu:
  1. Tìm trong app.js đoạn tạo các nút đáp án của trò ghép hình (hàm đang dùng
     getPictureDataForWord(...) và tạo opt.emoji / opt.label, có thẻ <span class="pic-label">${opt.label}</span>).
     Chỉ XÓA thẻ <span class="pic-label"> ...</span> khỏi nút đáp án. Nút chỉ còn hình emoji (cỡ lớn).
  2. KHÔNG xóa trường `label` trong dữ liệu (opt.label vẫn giữ). Lý do: SAU KHI bé chọn,
     thông báo kết quả vẫn dùng label, ví dụ: Chữ "xe" chính là Chiếc xe! Phần này giữ nguyên.
  3. Thêm cho mỗi nút đáp án thuộc tính aria-label="${opt.label}" để người dùng đọc màn hình vẫn dùng được
     (thuộc tính này không hiện ra màn hình). KHÔNG dùng title="..." vì sẽ hiện tooltip khi rê chuột.
  4. Chỉnh CSS tối thiểu trong app.css cho nút đáp án chỉ có hình: căn giữa, hình đủ lớn (khoảng 64-80px),
     chiều cao nút không bị lệch. Không đổi màu hay hiệu ứng khác.
  5. Không đụng vào: câu hỏi "Bé hãy tự đọc chữ và chọn đúng hình nhé", ô chữ, nút "Gợi ý âm thanh",
     phần chấm điểm, nút "Từ tiếp theo".
  6. Phải chạy được cho cả hai chế độ (Học từ mới và Tập đánh vần) vì hai chế độ dùng chung hàm này.

TỰ KIỂM TRA:
  [ ] Màn hình ghép hình chỉ còn 3 hình, không có chữ dưới hình.
  [ ] Chọn đúng: vẫn hiện thông báo có tên đồ vật (ví dụ "Chiếc xe").
  [ ] Chọn sai: vẫn hiện gợi ý có tên đồ vật.
  [ ] Không có lỗi đỏ trong console.

==================================================
CÁCH TRẢ LỜI
==================================================
Làm theo thứ tự: BƯỚC 1 của VIỆC 1, rồi DỪNG chờ tôi xác nhận. Trong lúc chờ, bạn có thể làm
VIỆC 2 luôn vì không liên quan. Sau khi tôi xác nhận mới làm BƯỚC 2 và BƯỚC 3 của VIỆC 1.

KẾT QUẢ CHẠY audit_audio_match.py (tôi dán ở đây): 
[dán kết quả vào đây]
