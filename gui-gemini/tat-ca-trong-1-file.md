# TẤT CẢ TRONG 1 FILE (dán cả file này vào Gemini nếu nó không nhận file đính kèm)
Bạn cũng cần dán thêm nội dung `index.html`, `app.js`, `app.css` và file dữ liệu từ vựng của app vào cuối tin nhắn.

---

## PHẦN 1: YÊU CẦU

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

---

## PHẦN 2: CÁC FILE NGUỒN CHÂN LÝ

### FILE: danh-van.js
```js
/**
 * danh-van.js - Sinh đánh vần tiếng Việt bằng CODE (không dùng AI), đúng 100%.
 *
 * Quy tắc:
 *   có âm đầu : [âm đầu] - [vần đánh vần từng bước] - [âm đầu] - [vần] - [tiếng không dấu] - [thanh] - [tiếng có dấu]
 *   vần 1 chữ : [âm đầu] - [nguyên âm] - [tiếng không dấu] - [thanh] - [tiếng có dấu]
 *   không âm đầu: [vần đánh vần từng bước] - [thanh] - [tiếng có dấu]
 *   ví dụ: hoa  => hờ - o - a - oa - hờ - oa - hoa
 *          cây  => cờ - â - y - ây - cờ - ây - cây
 *          hú   => hờ - u - hu - sắc - hú
 *
 * Dùng trong trình duyệt:  <script src="danh-van.js"></script>  rồi gọi DanhVan.spellWord("tu hú")
 * Dùng trong Node:         const DanhVan = require('./danh-van.js');
 * Dòng lệnh:               node danh-van.js hoa "tu hú" cây
 */
(function (root) {
  'use strict';

  const ONSET_NAMES = {
    b: 'bờ', c: 'cờ', d: 'dờ', 'đ': 'đờ', g: 'gờ', h: 'hờ', k: 'cờ', l: 'lờ', m: 'mờ',
    n: 'nờ', p: 'pờ', r: 'rờ', s: 'sờ', t: 'tờ', v: 'vờ', x: 'xờ',
    ch: 'chờ', gh: 'gờ', gi: 'giờ', kh: 'khờ', ng: 'ngờ', ngh: 'ngờ', nh: 'nhờ',
    ph: 'phờ', qu: 'quờ', th: 'thờ', tr: 'trờ',
  };
  // thứ tự quan trọng: dài trước, ngắn sau
  const ONSETS = ['ngh', 'ch', 'gh', 'gi', 'kh', 'ng', 'nh', 'ph', 'qu', 'th', 'tr',
    'b', 'c', 'd', 'đ', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'x'];
  const FINALS = ['ch', 'ng', 'nh', 'c', 'm', 'n', 'p', 't'];
  const VOWELS = 'aăâeêioôơuưy';
  const TONES = {
    '\u0300': 'huyền', '\u0301': 'sắc', '\u0309': 'hỏi', '\u0303': 'ngã', '\u0323': 'nặng',
  };

  function splitTone(syllable) {
    let tone = 'ngang';
    let out = '';
    for (const ch of syllable.normalize('NFD')) {
      if (TONES[ch]) tone = TONES[ch];
      else out += ch;
    }
    return { base: out.normalize('NFC'), tone };
  }

  function parseSyllable(base) {
    let onset = '';
    for (const o of ONSETS) {
      if (base.startsWith(o)) { onset = o; break; }
    }
    let rest = base.slice(onset.length);

    // "gi" + phụ âm/hết chữ (gì, gin): thực chất là g + i...
    if (onset === 'gi' && (rest === '' || !VOWELS.includes(rest[0]))) {
      onset = 'g';
      rest = 'i' + rest;
    }

    let fin = '';
    for (const f of FINALS) {
      if (rest.length > f.length && rest.endsWith(f)) { fin = f; break; }
    }
    const vowels = rest.slice(0, rest.length - fin.length);
    if (!vowels || [...vowels].some((c) => !VOWELS.includes(c))) {
      throw new Error('Không phân tích được tiếng: "' + base + '"');
    }
    return { onset, vowels, fin, rime: vowels + fin };
  }

  function rimeSteps(vowels, fin) {
    const v = [...vowels];
    if (v.length === 1 && !fin) return [vowels];
    const steps = [v[0]];
    let acc = v[0];
    for (let i = 1; i < v.length; i++) {
      steps.push(v[i]);
      acc += v[i];
      steps.push(acc);
    }
    if (fin) {
      steps.push(ONSET_NAMES[fin]);
      steps.push(vowels + fin);
    }
    return steps;
  }

  function spellSyllable(syllable) {
    const original = syllable.trim().toLowerCase().normalize('NFC');
    const { base, tone } = splitTone(original);
    const { onset, vowels, fin, rime } = parseSyllable(base);
    const simple = [...vowels].length === 1 && !fin;
    let seq;
    if (onset) {
      const name = ONSET_NAMES[onset];
      seq = simple
        ? [name, vowels, base]
        : [name, ...rimeSteps(vowels, fin), name, rime, base];
    } else {
      seq = rimeSteps(vowels, fin);
    }
    if (tone !== 'ngang') seq.push(tone, original);
    return {
      tieng: original,
      am_dau: onset,
      van: rime,
      thanh: tone,
      danh_van: seq.join(' - '),
    };
  }

  function spellWord(word) {
    const clean = word.trim().toLowerCase().normalize('NFC').replace(/\s+/g, ' ');
    return {
      tu: clean,
      tieng: clean.split(' ').map(spellSyllable),
      doc_tron: clean,
    };
  }

  // chuẩn hóa chuỗi đánh vần để so sánh (bỏ khác biệt về dấu gạch, khoảng trắng, hoa/thường)
  function normalizeSpelling(s) {
    return String(s)
      .normalize('NFC')
      .toLowerCase()
      .split(/\s*[-–—−‒]\s*|\s+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .join(' - ');
  }

  // So đánh vần có sẵn (ví dụ do Gemini sinh) với đáp án đúng của 1 TIẾNG
  function auditSyllable(syllable, givenSpelling) {
    const expected = spellSyllable(syllable).danh_van;
    const got = normalizeSpelling(givenSpelling);
    return { ok: got === expected, tieng: syllable, expected, got };
  }

  // ---- KIỂM TRA TỪ NHIỀU TIẾNG (nơ đỏ, tu hú, con tê tê...) ----
  // Chuỗi đúng của một từ = đánh vần ĐỦ từng tiếng (không bỏ tiếng nào) + đọc trơn cả từ (nếu từ >= 2 tiếng).
  function tokenize(s) {
    return String(s).normalize('NFC').toLowerCase()
      .split(/[\s,;|/\-–—−‒.]+/).map((p) => p.trim()).filter(Boolean);
  }

  function expectedWordParts(word) {
    const sylls = tokenize(word);
    const parts = sylls.map((s) => ({ tieng: s, tokens: tokenize(spellSyllable(s).danh_van) }));
    const whole = sylls.length > 1 ? { tieng: sylls.join(' '), tokens: sylls.slice() } : null;
    return { parts, whole };
  }

  function expectedWordTokens(word) {
    const { parts, whole } = expectedWordParts(word);
    const out = [];
    parts.forEach((p) => out.push(...p.tokens));
    if (whole) out.push(...whole.tokens);
    return out;
  }

  function diffTokens(expected, got) {
    // LCS để chỉ ra token thiếu / thừa
    const n = expected.length, m = got.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = expected[i] === got[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const missing = [], extra = [];
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (expected[i] === got[j]) { i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) missing.push({ token: expected[i++], viTri: j });
      else extra.push({ token: got[j++], viTri: j - 1 });
    }
    while (i < n) missing.push({ token: expected[i++], viTri: j });
    while (j < m) extra.push({ token: got[j++], viTri: j - 1 });
    return { missing, extra };
  }

  function containsRun(hay, needle) {
    for (let i = 0; i + needle.length <= hay.length; i++) {
      if (needle.every((t, k) => hay[i + k] === t)) return true;
    }
    return false;
  }

  /**
   * auditWord("nơ đỏ", "Nờ ơ nơ đỏ đo hỏi đỏ nơ đỏ")
   * => { ok:false, problems:[...], missing:[...], extra:[...], expected:"nờ - ơ - nơ | đờ - o - đo - hỏi - đỏ | nơ đỏ" }
   * Không cần dấu gạch trong chuỗi cần kiểm tra: chỉ cần đủ và đúng thứ tự các âm.
   */
  function auditWord(word, givenSpelling) {
    const { parts, whole } = expectedWordParts(word);
    const got = tokenize(givenSpelling);
    const expected = expectedWordTokens(word);
    const problems = [];
    parts.forEach((p) => {
      if (!containsRun(got, p.tokens)) {
        problems.push('Tiếng "' + p.tieng + '" không được đánh vần đủ, phải là: ' + p.tokens.join(' - '));
      }
    });
    if (whole && !containsRun(got.slice(-whole.tokens.length), whole.tokens)) {
      problems.push('Thiếu đọc trơn cả từ ở cuối: "' + whole.tieng + '"');
    }
    const { missing, extra } = diffTokens(expected, got);
    const ok = problems.length === 0 && missing.length === 0 && extra.length === 0;
    const sections = parts.map((p) => p.tokens.join(' - '));
    if (whole) sections.push(whole.tieng);
    return { ok, word, expected: sections.join(' | '), got: got.join(' '), problems, missing, extra };
  }

  // Kiểm tra cả danh sách từ vựng: entries = [{ word: 'nơ đỏ', spelling: '...' }, ...]
  function auditList(entries) {
    return entries.map((e) => auditWord(e.word, e.spelling)).filter((r) => !r.ok);
  }

  const api = { spellSyllable, spellWord, auditSyllable, normalizeSpelling, auditWord, auditList, expectedWordTokens };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DanhVan = api;

  if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
    const args = process.argv.slice(2);
    if (args[0] === '--audit') {
      const r = auditWord(args[1], args[2] || '');
      console.log(r.ok ? 'ĐÚNG' : 'SAI');
      console.log('  đúng phải là: ' + r.expected);
      console.log('  đang là     : ' + r.got);
      r.problems.forEach((p) => console.log('  - ' + p));
      process.exit(r.ok ? 0 : 1);
    }
    const words = args;
    for (const w of words) {
      const r = spellWord(w);
      console.log(w);
      for (const t of r.tieng) console.log('  ' + t.danh_van);
      console.log('  đọc trơn: ' + r.doc_tron);
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);

```

### FILE: danh-van-speech.js
```js
/**
 * danh-van-speech.js - Đọc đánh vần cho trẻ nghe, dùng chung cho CẢ "Tập đánh vần" và "Học từ mới".
 * Cần danh-van.js nạp trước.
 *
 * Cách dùng (trình duyệt):
 *   <script src="danh-van.js"></script>
 *   <script src="danh-van-speech.js"></script>
 *   const player = DanhVanSpeech.createPlayer({ audioBase: '06-assets/audio/' }); // audioBase có thể bỏ trống
 *   player.say('khách');   // ở màn hình nào cũng gọi đúng hàm này
 *   player.stop();
 *
 * Nguyên tắc:
 *  1. Mỗi âm là MỘT lần đọc riêng, có khoảng nghỉ rõ ràng (không dồn cả câu vào 1 lần đọc).
 *  2. Ưu tiên file âm thanh thu sẵn (đọc kéo dài được: "ach", "iêng"...). Thiếu file thì dùng giọng máy.
 *  3. Dấu thanh được đọc là "dấu sắc", "dấu huyền"... và đọc chậm hơn để nghe rõ.
 */
(function (root) {
  'use strict';

  const DV = (typeof module !== 'undefined' && module.exports) ? require('./danh-van.js') : root.DanhVan;

  const TONE_NAMES = ['sắc', 'huyền', 'hỏi', 'ngã', 'nặng'];
  const STRIP_TONE = /[̣̀́̉̃]/g;
  // rime kết thúc bằng âm tắc (c, ch, p, t) rất dễ bị giọng máy nuốt mất => đọc chậm hơn
  const HOLD_FINALS = /(c|ch|p|t)$/;

  // khoảng nghỉ SAU mỗi loại âm (ms)
  const PAUSE = { consonant: 500, vowel: 450, rime: 800, syllable: 700, tone: 500, word: 1000 };
  // hệ số tốc độ (nhân với rate gốc). Nhỏ hơn = chậm hơn
  const SPEED = { consonant: 0.9, vowel: 0.9, rime: 0.8, syllable: 0.85, tone: 0.75, word: 0.85 };

  function stripTone(s) { return s.normalize('NFD').replace(STRIP_TONE, '').normalize('NFC'); }

  /** tên file âm thanh an toàn (chỉ chữ a-z, số, dấu _): "khờ" => "kh_1edd", "ach" => "ach" */
  function audioFileName(text) {
    let out = '';
    for (const ch of text.normalize('NFC')) {
      out += /[a-z0-9]/.test(ch) ? ch : '_' + ch.codePointAt(0).toString(16);
    }
    return out;
  }

  function planSyllable(syllable) {
    const syl = syllable.trim().toLowerCase().normalize('NFC');
    const info = DV.spellSyllable(syl);
    const tokens = info.danh_van.split(' - ');
    const base = stripTone(syl);
    return tokens.map((text, i) => {
      let kind;
      if (TONE_NAMES.includes(text) && i === tokens.length - 2) kind = 'tone';
      else if (i === tokens.length - 1) kind = 'syllable_final';
      else if ([...text].length === 1) kind = 'vowel';
      else if (/ờ$/.test(text)) kind = 'consonant';
      else if (text === base) kind = 'syllable';
      else kind = 'rime';
      return { text, kind };
    });
  }

  /** Kế hoạch đọc cho 1 từ (có thể nhiều tiếng). Mỗi item = 1 lần đọc riêng. */
  function planWord(word) {
    const syllables = word.trim().toLowerCase().normalize('NFC').split(/\s+/);
    const items = [];
    syllables.forEach((syl, si) => {
      const part = planSyllable(syl);
      part.forEach((it, i) => {
        const last = i === part.length - 1;
        let kind = it.kind === 'syllable_final' ? 'word' : it.kind;
        let ttsText = it.text;
        if (kind === 'tone') ttsText = 'dấu ' + it.text;
        const hold = kind === 'rime' && HOLD_FINALS.test(it.text);
        items.push({
          text: it.text,
          kind,
          ttsText,
          audioFile: audioFileName(it.text),
          speed: SPEED[kind] * (hold ? 0.8 : 1),
          pauseAfter: last && si < syllables.length - 1 ? 900 : PAUSE[kind],
        });
      });
    });
    // từ nhiều tiếng: đọc trơn cả từ ở cuối
    if (syllables.length > 1) {
      const whole = syllables.join(' ');
      items.push({
        text: whole, kind: 'word', ttsText: whole, audioFile: audioFileName(whole),
        speed: SPEED.word, pauseAfter: PAUSE.word,
      });
    }
    return items;
  }

  /** Danh sách file âm thanh cần thu/tạo cho một danh sách từ vựng */
  function neededAudio(words) {
    const map = new Map();
    for (const w of words) for (const it of planWord(w)) map.set(it.audioFile, it.text);
    return [...map.entries()].map(([file, text]) => ({ file: file + '.mp3', text })).sort((a, b) => a.file.localeCompare(b.file));
  }

  function createPlayer(options) {
    const o = Object.assign({
      audioBase: null,      // ví dụ '06-assets/audio/'; null = chỉ dùng giọng máy
      lang: 'vi-VN',
      rate: 0.8,            // tốc độ gốc của giọng máy (0.1 - 2)
      voiceName: null,
      ttsOverride: {},      // ví dụ { ach: 'ách ách' } để thử cách đọc khác cho giọng máy
      onItem: null,         // callback (item, index) để highlight chữ đang đọc
    }, options || {});
    let runId = 0;
    let currentAudio = null;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    function playAudio(url) {
      return new Promise((resolve) => {
        const a = new Audio(url);
        currentAudio = a;
        a.onended = () => resolve(true);
        a.onerror = () => resolve(false);
        a.play().catch(() => resolve(false));
      });
    }

    function speakTTS(text, rate) {
      return new Promise((resolve) => {
        const synth = root.speechSynthesis;
        if (!synth) return resolve(false);
        const u = new SpeechSynthesisUtterance(text);
        u.lang = o.lang;
        u.rate = Math.max(0.1, Math.min(2, rate));
        if (o.voiceName) {
          const v = synth.getVoices().find((x) => x.name === o.voiceName);
          if (v) u.voice = v;
        }
        u.onend = () => resolve(true);
        u.onerror = () => resolve(false);
        synth.speak(u);
      });
    }

    function stop() {
      runId++;
      if (root.speechSynthesis) root.speechSynthesis.cancel();
      if (currentAudio) { try { currentAudio.pause(); } catch (e) { /* bỏ qua */ } }
    }

    async function say(word) {
      stop();
      const my = ++runId;
      const items = planWord(word);
      for (let i = 0; i < items.length; i++) {
        if (my !== runId) return;
        const it = items[i];
        if (o.onItem) o.onItem(it, i);
        let ok = false;
        if (o.audioBase) ok = await playAudio(o.audioBase + it.audioFile + '.mp3');
        if (!ok) {
          const text = o.ttsOverride[it.text] && it.kind !== 'tone' ? o.ttsOverride[it.text] : it.ttsText;
          await speakTTS(text, o.rate * it.speed);
        }
        if (my !== runId) return;
        await sleep(it.pauseAfter);
      }
    }

    return { say, stop };
  }

  const api = { planWord, planSyllable, neededAudio, audioFileName, createPlayer };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DanhVanSpeech = api;
})(typeof window !== 'undefined' ? window : globalThis);

```

### FILE: danh-van.test.js
```js
// Chạy: node --test danh-van.test.js
const test = require('node:test');
const assert = require('node:assert');
const { spellSyllable, spellWord, auditSyllable } = require('./danh-van.js');

const GOLDEN = {
  // các case bạn đã báo lỗi
  hoa: 'hờ - o - a - oa - hờ - oa - hoa',
  cây: 'cờ - â - y - ây - cờ - ây - cây',
  tê: 'tờ - ê - tê',
  tu: 'tờ - u - tu',
  hú: 'hờ - u - hu - sắc - hú',
  na: 'nờ - a - na',
  đa: 'đờ - a - đa',
  // âm đôi / âm kép / vần dài
  xoài: 'xờ - o - a - oa - i - oai - xờ - oai - xoai - huyền - xoài',
  chuối: 'chờ - u - ô - uô - i - uôi - chờ - uôi - chuôi - sắc - chuối',
  kiến: 'cờ - i - ê - iê - nờ - iên - cờ - iên - kiên - sắc - kiến',
  mía: 'mờ - i - a - ia - mờ - ia - mia - sắc - mía',
  quy: 'quờ - y - quy',
  // phụ âm ghép
  quả: 'quờ - a - qua - hỏi - quả',
  quạt: 'quờ - a - tờ - at - quờ - at - quat - nặng - quạt',
  trăng: 'trờ - ă - ngờ - ăng - trờ - ăng - trăng',
  xanh: 'xờ - a - nhờ - anh - xờ - anh - xanh',
  ghế: 'gờ - ê - ghê - sắc - ghế',
  nghe: 'ngờ - e - nghe',
  kê: 'cờ - ê - kê',
  giỏ: 'giờ - o - gio - hỏi - giỏ',
  gì: 'gờ - i - gi - huyền - gì',
  khỉ: 'khờ - i - khi - hỏi - khỉ',
  mẹ: 'mờ - e - me - nặng - mẹ',
  // không có âm đầu
  uống: 'u - ô - uô - ngờ - uông - sắc - uống',
  ăn: 'ă - nờ - ăn',
  ô: 'ô',
};

for (const [syl, expected] of Object.entries(GOLDEN)) {
  test('đánh vần: ' + syl, () => {
    assert.strictEqual(spellSyllable(syl).danh_van, expected);
  });
}

test('từ nhiều tiếng: tê tê', () => {
  const r = spellWord('tê tê');
  assert.deepStrictEqual(r.tieng.map((t) => t.danh_van), ['tờ - ê - tê', 'tờ - ê - tê']);
  assert.strictEqual(r.doc_tron, 'tê tê');
});

test('từ nhiều tiếng: tu hú', () => {
  const r = spellWord('tu hú');
  assert.deepStrictEqual(r.tieng.map((t) => t.danh_van), [
    'tờ - u - tu',
    'hờ - u - hu - sắc - hú',
  ]);
});

test('audit bắt lỗi "cờ ây cây" (thiếu bước đánh vần vần)', () => {
  const bad = auditSyllable('cây', 'Cờ - ây - cây');
  assert.strictEqual(bad.ok, false);
  const good = auditSyllable('cây', 'Cờ – â – y – ây – cờ – ây – cây');
  assert.strictEqual(good.ok, true);
});

test('audit bắt lỗi "hờ - oa - hoa" (thiếu o - a)', () => {
  assert.strictEqual(auditSyllable('hoa', 'hờ - oa - hoa').ok, false);
});

// ---- Từ nhiều tiếng: nơ đỏ ----
const { auditWord, auditList, expectedWordTokens } = require('./danh-van.js');

test('nơ đỏ: đáp án đúng đầy đủ', () => {
  assert.deepStrictEqual(spellWord('nơ đỏ').tieng.map((t) => t.danh_van), [
    'nờ - ơ - nơ',
    'đờ - o - đo - hỏi - đỏ',
  ]);
  assert.deepStrictEqual(expectedWordTokens('nơ đỏ'),
    ['nờ', 'ơ', 'nơ', 'đờ', 'o', 'đo', 'hỏi', 'đỏ', 'nơ', 'đỏ']);
});

test('auditWord bắt lỗi "Nờ ơ nơ đỏ đo hỏi đỏ nơ đỏ" (tiếng 2 thiếu "đờ o")', () => {
  const r = auditWord('nơ đỏ', 'Nờ ơ nơ đỏ đo hỏi đỏ nơ đỏ');
  assert.strictEqual(r.ok, false);
  assert.ok(r.problems.some((p) => p.includes('"đỏ"')));
  assert.deepStrictEqual(r.missing.map((m) => m.token), ['đờ', 'o']);
});

test('auditWord chấp nhận bản đúng (có hoặc không có dấu gạch)', () => {
  assert.strictEqual(auditWord('nơ đỏ', 'nờ - ơ - nơ, đờ - o - đo - hỏi - đỏ, nơ đỏ').ok, true);
  assert.strictEqual(auditWord('nơ đỏ', 'Nờ ơ nơ đờ o đo hỏi đỏ nơ đỏ').ok, true);
});

test('auditWord bắt thiếu đọc trơn cả từ', () => {
  const r = auditWord('tu hú', 'tờ u tu hờ u hu sắc hú');
  assert.strictEqual(r.ok, false);
  assert.ok(r.problems.some((p) => p.includes('đọc trơn')));
});

test('auditWord bắt lỗi từ 2 vần: tê tê thiếu tiếng 2', () => {
  assert.strictEqual(auditWord('tê tê', 'tờ ê tê tê tê').ok, false);
});

test('auditList chỉ trả về các mục sai', () => {
  const bad = auditList([
    { word: 'hoa', spelling: 'hờ o a oa hờ oa hoa' },
    { word: 'cây', spelling: 'cờ ây cây' },
  ]);
  assert.strictEqual(bad.length, 1);
  assert.strictEqual(bad[0].word, 'cây');
});

```

### FILE: danh-van-speech.test.js
```js
// Chạy: node --test danh-van-speech_test.js
const test = require('node:test');
const assert = require('node:assert');
const S = require('./danh-van-speech.js');

test('khách: từng âm một lần đọc riêng, đúng thứ tự và đúng loại', () => {
  const plan = S.planWord('khách');
  assert.deepStrictEqual(plan.map((p) => p.text), ['khờ', 'a', 'chờ', 'ach', 'khờ', 'ach', 'khach', 'sắc', 'khách']);
  assert.deepStrictEqual(plan.map((p) => p.kind), ['consonant', 'vowel', 'consonant', 'rime', 'consonant', 'rime', 'syllable', 'tone', 'word']);
});

test('dấu thanh được đọc là "dấu sắc" và chậm hơn', () => {
  const tone = S.planWord('khách').find((p) => p.kind === 'tone');
  assert.strictEqual(tone.ttsText, 'dấu sắc');
  assert.ok(tone.speed < 0.8);
});

test('rime kết thúc bằng c/ch/p/t đọc chậm hơn rime thường', () => {
  const ach = S.planWord('khách').find((p) => p.text === 'ach');
  const ai = S.planWord('hai').find((p) => p.text === 'ai');
  assert.ok(ach.speed < ai.speed);
});

test('từ nhiều tiếng: tê tê đọc từng tiếng rồi đọc trơn', () => {
  const plan = S.planWord('tê tê');
  assert.deepStrictEqual(plan.map((p) => p.text), ['tờ', 'ê', 'tê', 'tờ', 'ê', 'tê', 'tê tê']);
});

test('tên file âm thanh an toàn và không trùng', () => {
  assert.strictEqual(S.audioFileName('ach'), 'ach');
  assert.notStrictEqual(S.audioFileName('ba'), S.audioFileName('bà'));
  assert.ok(/^[a-z0-9_]+$/.test(S.audioFileName('khờ')));
});

test('neededAudio liệt kê đủ âm cần thu cho danh sách từ', () => {
  const list = S.neededAudio(['khách', 'hoa', 'tu hú']);
  const texts = list.map((x) => x.text);
  for (const t of ['khờ', 'ach', 'khách', 'sắc', 'oa', 'hoa', 'tu hú']) assert.ok(texts.includes(t), t);
});

```

### FILE: nghe-thu.html
```html
<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Nghe thử đánh vần</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 640px; margin: 0 auto; padding: 16px; }
  label { display: block; margin-top: 12px; font-weight: 600; }
  input[type=text], select, textarea { width: 100%; font-size: 18px; padding: 8px; box-sizing: border-box; }
  button { font-size: 20px; padding: 10px 20px; margin: 12px 8px 0 0; }
  #seq { margin-top: 16px; font-size: 28px; line-height: 1.8; }
  #seq span { padding: 2px 8px; margin: 2px; border-radius: 8px; background: #eee; display: inline-block; }
  #seq span.on { background: #ffd54f; }
  small { color: #666; }
</style>
</head>
<body>
<h2>Nghe thử đánh vần</h2>
<label>Từ cần đọc (thử: khách, khiêng, ếch, hoa, tu hú)</label>
<input type="text" id="word" value="khách">

<label>Giọng đọc</label>
<select id="voice"></select>

<label>Tốc độ gốc: <span id="rv">0.8</span></label>
<input type="range" id="rate" min="0.3" max="1.2" step="0.05" value="0.8" style="width:100%">

<label>Thử cách đọc khác cho giọng máy (JSON, tùy chọn)</label>
<textarea id="override" rows="2">{}</textarea>
<small>Ví dụ nếu giọng máy đọc "ach" như "a": {"ach":"ách ách","iêng":"iêêêng"} rồi bấm Đọc lại.</small>

<div>
  <button id="go">▶ Đọc</button>
  <button id="stop">■ Dừng</button>
</div>
<div id="seq"></div>

<script src="danh-van.js"></script>
<script src="danh-van-speech.js"></script>
<script>
  const $ = (id) => document.getElementById(id);
  function loadVoices() {
    const vs = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('vi'));
    $('voice').innerHTML = vs.length
      ? vs.map((v) => `<option>${v.name}</option>`).join('')
      : '<option value="">(máy này chưa có giọng tiếng Việt)</option>';
  }
  speechSynthesis.onvoiceschanged = loadVoices; loadVoices();
  $('rate').oninput = () => { $('rv').textContent = $('rate').value; };

  let player;
  function render(plan) {
    $('seq').innerHTML = plan.map((p, i) => `<span id="i${i}">${p.text}</span>`).join(' ');
  }
  $('go').onclick = () => {
    let ov = {};
    try { ov = JSON.parse($('override').value || '{}'); } catch (e) { alert('JSON sai'); return; }
    if (player) player.stop();
    const word = $('word').value.trim();
    render(DanhVanSpeech.planWord(word));
    player = DanhVanSpeech.createPlayer({
      rate: parseFloat($('rate').value),
      voiceName: $('voice').value || null,
      ttsOverride: ov,
      onItem: (it, i) => {
        document.querySelectorAll('#seq span').forEach((s) => s.classList.remove('on'));
        const el = $('i' + i); if (el) el.classList.add('on');
      },
    });
    player.say(word);
  };
  $('stop').onclick = () => player && player.stop();
</script>
</body>
</html>

```
