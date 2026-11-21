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
  // từ kiểm tra R7
  khách: 'khờ - a - chờ - ach - khờ - ach - khach - sắc - khách',
  ếch: 'ê - chờ - êch - sắc - ếch',
  khiêng: 'khờ - i - ê - iê - ngờ - iêng - khờ - iêng - khiêng',
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

test('từ nhiều tiếng: nhũ đá', () => {
  const r = spellWord('nhũ đá');
  assert.deepStrictEqual(r.tieng.map((t) => t.danh_van), [
    'nhờ - u - nhu - ngã - nhũ',
    'đờ - a - đa - sắc - đá',
  ]);
  assert.strictEqual(r.doc_tron, 'nhũ đá');
});

test('từ nhiều tiếng: hòn đá', () => {
  const r = spellWord('hòn đá');
  assert.deepStrictEqual(r.tieng.map((t) => t.danh_van), [
    'hờ - o - nờ - on - hờ - on - hon - huyền - hòn',
    'đờ - a - đa - sắc - đá',
  ]);
  assert.strictEqual(r.doc_tron, 'hòn đá');
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
