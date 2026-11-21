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

test('tích hợp R7: nơ đỏ có kế hoạch đọc đủ từng tiếng và đọc trơn', () => {
  const plan = S.planWord('nơ đỏ');
  assert.deepStrictEqual(plan.map((p) => p.text), ['nờ', 'ơ', 'nơ', 'đờ', 'o', 'đo', 'hỏi', 'đỏ', 'nơ đỏ']);
});

test('tích hợp R7: không gộp một câu - mỗi âm là một lần phát riêng', () => {
  const plan = S.planWord('hoa');
  assert.strictEqual(plan.length, 7);
  assert.deepStrictEqual(plan.map((p) => p.text), ['hờ', 'o', 'a', 'oa', 'hờ', 'oa', 'hoa']);
});
