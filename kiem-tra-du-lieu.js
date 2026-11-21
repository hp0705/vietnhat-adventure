/**
 * kiem-tra-du-lieu.js
 * Kiểm tra toàn bộ dữ liệu từ vựng của app theo R6.
 * Thoát mã 1 nếu có lỗi, mã 0 nếu toàn bộ dữ liệu đạt chuẩn 100%.
 */
const fs = require('fs');
const path = require('path');
const DanhVan = require('./danh-van.js');
const DanhVanSpeech = require('./danh-van-speech.js');

function loadJson(relPath) {
  const p = path.join(__dirname, relPath);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

console.log('=== BẮT ĐẦU KIỂM TRA DỮ LIỆU TỪ VỰNG (R6) ===\n');

const vocabData = loadJson('01-vocabulary/vocabulary_vi_v2.json');
const spellingData = loadJson('01-vocabulary/spelling_practice_vi_v1.json');

const allItems = [];
if (vocabData && vocabData.items) allItems.push(...vocabData.items);
if (spellingData && spellingData.items) allItems.push(...spellingData.items);

console.log(`Tổng số mục nạp từ hệ thống: ${allItems.length}`);

const errors = [];
const checkedWords = new Set();
const allWordsList = [];

for (const item of allItems) {
  const word = (item.word || '').trim();
  if (!word) {
    errors.push(`[${item.id || 'NO_ID'}] Mục không có từ (word rỗng)`);
    continue;
  }
  allWordsList.push(word);

  // a) DanhVan.spellWord(tu) không báo lỗi
  let res;
  try {
    res = DanhVan.spellWord(word);
  } catch (err) {
    errors.push(`[${item.id || word}] Lỗi phân tích âm: ${err.message}`);
    continue;
  }

  // b) Với từ nhiều tiếng, số mục đánh vần = số tiếng, mỗi tiếng đều có đủ bước, đọc trơn ở cuối
  const cleanSyls = word.replace(/[-\s]+/g, ' ').split(' ').filter(Boolean);
  if (res.tieng.length !== cleanSyls.length) {
    errors.push(`[${word}] Số tiếng phân tích (${res.tieng.length}) khác số tiếng thực tế (${cleanSyls.length})`);
  }

  // Dùng auditWord để xác nhận tính trọn vẹn
  const expectedTokens = DanhVan.expectedWordTokens(word);
  const audit = DanhVan.auditWord(word, expectedTokens.join(' '));
  if (!audit.ok) {
    errors.push(`[${word}] auditWord thất bại: ${audit.problems.join('; ')}`);
  }

  // c) Nếu có chuỗi đánh vần lưu sẵn (item.phonics.spelling_rule), kiểm tra tính hợp lệ
  if (item.phonics && item.phonics.spelling_rule) {
    const ruleAudit = DanhVan.auditWord(word, item.phonics.spelling_rule);
    if (!ruleAudit.ok) {
      errors.push(`[${item.id} - ${word}] spelling_rule lưu sẵn bị sai:\n   Có: ${ruleAudit.got}\n   Đúng: ${ruleAudit.expected}`);
    }
  }

  checkedWords.add(word);
}

// R4: Sinh danh sách audio cần thu
const needed = DanhVanSpeech.neededAudio([...checkedWords]);
const audioListPath = path.join(__dirname, 'audio-can-thu.txt');
const audioLines = needed.map((x) => `${x.file}\t${x.text}`).join('\n');
fs.writeFileSync(audioListPath, audioLines, 'utf-8');
console.log(`Đã xuất danh sách ${needed.length} file âm thanh cần thu ra audio-can-thu.txt`);

// Kết quả
console.log(`\nĐã kiểm tra ${checkedWords.size} từ duy nhất.`);
if (errors.length > 0) {
  console.error(`\n❌ PHÁT HIỆN ${errors.length} LỖI DỮ LIỆU:`);
  errors.forEach((err, idx) => {
    console.error(`  ${idx + 1}. ${err}`);
  });
  process.exit(1);
} else {
  console.log('✅ TOÀN BỘ DỮ LIỆU ĐẠT CHUẨN 100% (0 LỖI).');
  process.exit(0);
}
