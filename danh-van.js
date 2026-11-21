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
      steps: seq
    };
  }

  function spellWord(word) {
    const clean = word.trim().toLowerCase().normalize('NFC').replace(/[-\s]+/g, ' ');
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

  const api = { spellSyllable, spellWord, auditSyllable, normalizeSpelling };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DanhVan = api;

  if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
    const words = process.argv.slice(2);
    for (const w of words) {
      const r = spellWord(w);
      console.log(w);
      for (const t of r.tieng) console.log('  ' + t.danh_van);
      console.log('  đọc trơn: ' + r.doc_tron);
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
