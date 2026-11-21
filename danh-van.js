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
