// Chạy: node --test danh-van_test.js
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
