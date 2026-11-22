Chào bạn. Tôi làm app dạy bé đọc tiếng Việt (tên "Việt Nhật Adventure"). Tôi cần bạn sửa app theo 2 phần: PHẦN A và PHẦN B.
Hai phần liên quan với nhau nên hãy đọc hết tin nhắn này trước khi viết code.

FILE TÔI GỬI KÈM (hãy dùng đúng các bản này, đây là bản MỚI NHẤT):
- app.js (bản mới, đã có sẵn một số chỗ tôi vừa sửa, xem mục "KHÔNG ĐỤNG VÀO")
- index.html, file CSS, danh-van.js, danh-van-speech.js
- rhyme_charts_vi_v1.json (dữ liệu bảng vần, ĐÃ CHỐT, không sửa)
- 2 ảnh trang sách giấy (bảng vần) và ảnh chụp màn hình có khung đỏ

==================================================
QUY TẮC CHUNG (áp dụng cho cả 2 phần)
==================================================
- Chỉ sửa nhỏ, đúng yêu cầu. KHÔNG thêm tính năng, KHÔNG viết lại cả file,
  KHÔNG đổi tên hàm/biến đang có.
- Chỉ trả về các đoạn đã sửa. Mỗi chỗ ghi rõ: tên file, tên hàm, đoạn CŨ, đoạn MỚI.
- Chỉ sửa chế độ "Tập đánh vần" (trong code: state.activeModule === 'spelling').
  Chế độ "Học từ mới" (activeModule === 'vocab') phải giữ NGUYÊN.
- KHÔNG sửa các file dữ liệu .json và KHÔNG sửa danh-van.js, danh-van-speech.js
  (thuật toán đánh vần R7). Chỉ ĐỌC kết quả của chúng.
- KHÔNG ĐỤNG VÀO các phần tôi vừa sửa trong app.js (đừng xóa, đừng đổi):
    buildVocabLessons, getWordHint, playWordWithHint,
    vocabPictureData, VOCAB_LAYOUT_VERSION, và dòng đầu của getPictureDataForWord.
- Không sửa: câu ví dụ, nút "Từ trước", "Từ sau", nút "Thử thách ghép hình".
- Làm PHẦN A xong trước, rồi mới làm PHẦN B.

MỤC TIÊU CHUNG
Bé học theo thứ tự: biết VẦN trước (â - pờ - âp), nhìn BẢNG VẦN để thấy vài từ cùng vần,
rồi mới học từng TỪ (tập). Cố ý làm ÍT và ĐƠN GIẢN để bé không chán.

==================================================
PHẦN A: Ô "VẦN" Ở TRÊN CÙNG, TÁCH CHUỖI ĐÁNH VẦN
==================================================
Hiện tại: mở từ "tập" thì hiện 1 hàng chip (id="spelling-seq") đọc cả chuỗi dài:
  tờ - â - pờ - âp - tờ - âp - tâp - nặng - tập
Hàng chip do hàm renderSpellingSequence(word) tạo ra, bằng DanhVanSpeech.planWord(word)
(trả về mảng, mỗi phần tử có .text). Nút "Cách đánh vần" gọi playAllPhonicsSteps()
(dùng player.say(word) và làm sáng từng chip bằng class "active").

Muốn đổi: tách chuỗi làm 2 phần.
  PHẦN VẦN : â - pờ - âp                  -> hiện ở ô riêng, trên cùng thẻ từ
  PHẦN TỪ  : tờ - âp - tâp - nặng - tập   -> hiện ở hàng chip cũ bên dưới

A1. Quy tắc cắt chuỗi (viết MỘT hàm riêng, ví dụ splitSpellingTokens(item, tokens)
    trả về { rhymeTokens, wordTokens }, để dùng ở mọi nơi):
  - tokens = DanhVanSpeech.planWord(word) lấy .text. Với "tập":
    ["tờ","â","pờ","âp","tờ","âp","tâp","nặng","tập"]
  - Vần = item.phonics.rime.written (ví dụ "âp").
  - k = vị trí XUẤT HIỆN ĐẦU TIÊN của token bằng vần đó. Với "tập" k = 3.
    KHÔNG hard-code số 3, vì mỗi từ dài ngắn khác nhau.
  - rhymeTokens = tokens từ vị trí 1 đến k      -> ["â","pờ","âp"]  (bỏ phụ âm đầu "tờ")
  - wordTokens  = tokens từ vị trí k+1 đến hết   -> ["tờ","âp","tâp","nặng","tập"]
  - Từ KHÔNG có phụ âm đầu (item.phonics.onset rỗng/không có): rhymeTokens = tokens từ 0 đến k.
  - Không tìm thấy k (lỗi dữ liệu): giữ cách cũ (hiện cả chuỗi, không có ô vần)
    và console.warn một dòng. Không để app bị lỗi.

A2. Ô "Vần" (xem khung đỏ trong ảnh):
  - Thêm khối HTML mới trong index.html, nằm phía trên thẻ từ lớn (chỗ hiện chữ "tập").
  - Gồm: chữ vần cỡ lớn, đậm (ví dụ "âp"), nút loa tròn xanh bên cạnh
    (dùng CÙNG kiểu nút loa hiện có, không tạo style mới),
    và dưới chữ vần là hàng chip nhỏ "â - pờ - âp" (dùng class "sp-token" hiện có).
  - Chữ vần lấy từ item.phonics.rime.written (hoặc item.rhyme_family nếu thiếu).
  - Chỉ hiện khi activeModule === 'spelling'. Ở "Học từ mới" thì ẩn (display:none).
  - Giữ nguyên nhãn "Hành Động" và nhãn "Vần -âp (Âm cuối -p)" ở hàng trên.
  - Mỗi lần mở từ mới (openWordStation) phải cập nhật lại ô Vần theo từ đó.

A3. Nút loa của ô Vần:
  - Đọc lần lượt rhymeTokens ("â" ... "pờ" ... "âp"), sáng từng chip theo giọng đọc.
  - Dùng ĐÚNG cơ chế phát âm đang có (getDanhVanPlayer(), danh-van.js,
    spelling_step_audio_map.json). Đọc code của playAllPhonicsSteps để làm tương tự,
    nhưng chỉ cho rhymeTokens. KHÔNG tạo file âm thanh mới, KHÔNG dùng Google TTS ở đây.
  - Trước khi phát: dừng âm đang phát (player.stop(), currentAudio.pause())
    như playAllPhonicsSteps đang làm, để không chồng tiếng khi bấm liên tục.
  - Không tự đọc vần khi mở từ. Chỉ đọc khi bé bấm loa.

A4. Phần từ:
  - renderSpellingSequence(word): ở chế độ spelling chỉ vẽ wordTokens
    (tờ - âp - tâp - nặng - tập). Ở chế độ vocab giữ y như cũ.
  - Nút "Cách đánh vần" (playAllPhonicsSteps): ở chế độ spelling chỉ đọc wordTokens.
    Kiểm tra kỹ chỉ số làm sáng chip không bị lệch (mảng đã ngắn đi).

==================================================
PHẦN B: MÀN HÌNH "BẢNG VẦN" (giống trang sách giấy, nhưng GỌN HƠN)
==================================================
Trang sách giấy (xem 2 ảnh) có rất nhiều từ mỗi hàng. App của tôi CỐ Ý chỉ hiện ít:
  - Đúng 2 HÀNG: hàng thanh sắc và hàng thanh nặng.
  - Mỗi hàng chỉ có ĐÚNG 2 TỪ (là 2 từ gần gũi, thú vị nhất với bé). Không hiện thêm từ nào khác.

Ví dụ vần "âp" hiện như sau:
  Chữ vần "âp" rất to, màu đỏ, kèm mũi tên (→) chỉ sang bảng.
      Hàng 1 (sắc) : ấp | gấp  hấp
      Hàng 2 (nặng): ập | tập  đập
  - Mỗi hàng: ô đầu (ấp / ập) là VẦN CÓ DẤU, đứng riêng, nền khác màu.
    Hai ô sau là TIẾNG = phụ âm đầu + vần. Phụ âm đầu tô XANH, phần vần tô ĐEN.
    Ví dụ "gấp" -> "g" xanh, "ấp" đen.
  - Dưới bảng: hình minh họa (emoji lớn) và chú thích (bài tập).

B1. Dữ liệu: file có sẵn rhyme_charts_vi_v1.json (đặt ở 01-vocabulary/, KHÔNG sửa, KHÔNG tự sinh từ).
  {
    "charts": [
      { "rhyme": "âp", "picture_caption": "bài tập", "picture_emoji": "📝",
        "rows": [
          { "tone": "sắc",  "rhyme_form": "ấp",
            "words": [ {"word":"gấp","onset":"g"}, {"word":"hấp","onset":"h"} ] },
          { "tone": "nặng", "rhyme_form": "ập",
            "words": [ {"word":"tập","onset":"t"}, {"word":"đập","onset":"đ"} ] }
        ] }, ...
    ]
  }
  - Cứ vẽ đúng những gì có trong "rows" và "words" (hiện tại luôn là 2 hàng x 2 từ).
    KHÔNG hard-code số 2, nhưng cũng KHÔNG tự thêm từ.
  - Tô xanh phụ âm đầu bằng trường "onset" có sẵn. Nếu onset rỗng thì không tô xanh.
  - Phải thêm việc tải file này vào chỗ đang fetch 2 file dữ liệu ở app.js
    (fetch('./01-vocabulary/...')). Tải lỗi thì app vẫn chạy bình thường, chỉ ẩn nút Bảng vần.

B2. Cách vào màn hình (nối với PHẦN A):
  - Cạnh ô "Vần" của PHẦN A, thêm 1 nút nhỏ "📋 Bảng vần".
  - Bấm nút: mở màn hình "Bảng vần" của đúng vần của từ đang học
    (tìm chart có "rhyme" bằng item.rhyme_family).
  - Không tìm thấy chart cho vần đó: ẩn nút, không báo lỗi.
  - Tạo view mới id="view-rhyme-chart", dùng đúng hàm switchView(...) đang có.
    Có nút "← Quay lại" để về thẻ từ.

B3. Khi bấm:
  - Bấm một ô tiếng (ví dụ "gấp") hoặc ô vần có dấu (ấp): đọc tiếng đó.
      + Nếu tiếng có trong state.spellingItems (so khớp item.word) và có item.audio.word_full:
        playAudioSrc(getDialectAudio(item,'word'), word).
      + Nếu không: playAudioSrc(null, word) (giọng dự phòng).
  - Bấm chữ vần to (âp): đọc "â - pờ - âp", dùng CÙNG hàm với nút loa ô Vần ở PHẦN A.
  - Ô đang đọc thì sáng (class "active"), đọc xong thì tắt.
  - Trước khi phát: dừng âm đang phát (currentAudio.pause()).

B4. Giao diện:
  - Hợp giao diện hiện có (font, màu thẻ, bo góc như thẻ từ).
  - Vần to màu đỏ #dc2626, phụ âm đầu xanh #2563eb, phần vần đen/xám đậm.
  - Mỗi ô tiếng là nút bấm cao ít nhất 48px. Màn hình hẹp (iPad dọc) thì ô tự xuống dòng, không tràn ngang.
  - Hình minh họa: dùng "picture_emoji" cỡ lớn + "picture_caption" bên dưới. KHÔNG tải ảnh mới.

==================================================
CÁCH TRẢ LỜI VÀ TỰ KIỂM TRA
==================================================
Trước khi viết code, hãy tóm tắt lại bằng lời của bạn (5-6 dòng) bạn hiểu PHẦN A và PHẦN B là gì,
để tôi xác nhận. Sau khi tôi xác nhận mới viết code.

Sau khi viết xong, tự chạy thử trong đầu và ghi kết quả từng mục:
  [ ] "tập": vần = â - pờ - âp ; từ = tờ - âp - tâp - nặng - tập
  [ ] "sáp": vần = a - pờ - ap  ; từ = sờ - ap - sap - sắc - sáp
  [ ] Ô vần hiện ở mọi từ của bài "Tập đánh vần"
  [ ] Loa ô vần: chỉ đọc phần vần, chip sáng đúng thứ tự
  [ ] "Cách đánh vần": chỉ đọc phần từ, chip sáng đúng, không lệch
  [ ] "Từ sau": ô vần đổi theo từ mới
  [ ] "tập" -> nút "Bảng vần" -> thấy đúng 2 hàng, mỗi hàng 2 từ: ấp | gấp hấp ; ập | tập đập
  [ ] Phụ âm đầu tô xanh, kể cả phụ âm đôi (ch, th, nh, ph, ngh, kh, gh)
  [ ] Vần không có trong JSON (ví dụ anh): nút "Bảng vần" bị ẩn, console không lỗi
  [ ] "Học từ mới": giao diện, hình minh họa và âm thanh y như bản tôi gửi, không có ô vần, không có nút Bảng vần
  [ ] Không có lỗi đỏ trong console
