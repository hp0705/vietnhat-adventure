/**
 * ĐẢO PHIÊU LƯU TỪ VỰNG — VIETNAMESE LEARNING GAME
 * Thiết kế cho iPad thế hệ 7 Safari & Web hiện đại
 */

// ==========================================
// 1. TRẠNG THÁI ỨNG DỤNG (APP STATE)
// ==========================================
const state = {
  activeModule: 'vocab', // 'vocab' (Học từ mới) hoặc 'spelling' (Tập đánh vần)
  vocabItems: [],
  spellingItems: [],
  vocabLessons: [],
  spellingLessons: [],
  rhymeCharts: [],
  spellingStepAudioMap: {},
  items: [],
  lessons: [],
  currentLessonIndex: 0,
  currentWordIndex: 0,
  currentWord: null,
  currentDialect: 'north', // 'north' (Bắc - Hà Nội) hoặc 'south' (Nam - Sài Gòn)
  soundEnabled: true,
  speechRate: 1.15, // Tốc độ chuẩn dứt khoát, sôi động cho bé
  audioUnlocked: false,
  score: 0,
  unlockedLessons: [0], // Bài 1 mở khóa mặc định
  carriedOverWords: [], // Tối đa 2 từ làm sai chuyển qua bài sau
  quizRound: null,
  unlockAllMode: true, // Mặc định tự do chọn bất kỳ bài học nào trên iPad
  vocabProgress: {
    unlockedLessons: [0],
    currentLessonIndex: 0,
    carriedOverWords: []
  },
  spellingProgress: {
    unlockedLessons: [0],
    currentLessonIndex: 0,
    carriedOverWords: []
  }
};

// ==========================================
// 1.1 TRÌNH PHÁT ĐÁNH VẦN DÙNG CHUNG DUY NHẤT (R3)
// ==========================================
let danhVanPlayer = null;

function getDanhVanPlayer() {
  if (!danhVanPlayer && typeof DanhVanSpeech !== 'undefined' && DanhVanSpeech.createPlayer) {
    danhVanPlayer = DanhVanSpeech.createPlayer({
      audioBase: '06-assets/audio/spelling/steps/',
      audioMap: state.spellingStepAudioMap || {},
      rate: state.speechRate || 1.15,
      onItem: (item, index) => {
        highlightSpellingStep(item, index);
      }
    });
  } else if (danhVanPlayer && state.spellingStepAudioMap && danhVanPlayer.setAudioMap) {
    danhVanPlayer.setAudioMap(state.spellingStepAudioMap);
  }
  return danhVanPlayer;
}

// A1. QUY TẮC CẮT CHUỖI ĐÁNH VẦN THÀNH PHẦN VẦN VÀ PHẦN TỪ (PHẦN A)
function splitSpellingTokens(item, tokens) {
  if (!item || !tokens || !tokens.length) {
    return { rhymeTokens: [], wordTokens: tokens || [] };
  }
  const rime = (item.phonics?.rime?.written || item.rhyme_family || '').trim().toLowerCase();
  const getText = (t) => (typeof t === 'string' ? t : t.text).trim().toLowerCase();
  const k = tokens.findIndex((t) => getText(t) === rime);

  if (k === -1) {
    console.warn(`splitSpellingTokens: Không tìm thấy vị trí vần k cho từ "${item.word}" (vần "${rime}")`);
    return { rhymeTokens: [], wordTokens: tokens };
  }

  // Từ có phụ âm đầu -> bỏ qua token âm đầu ở vị trí 0 (startIdx = 1)
  // Từ không có phụ âm đầu -> lấy từ vị trí 0 (startIdx = 0)
  const hasOnset = Boolean(item.phonics?.onset?.written || item.phonics?.onset?.sound_spelling);
  const startIdx = hasOnset ? 1 : 0;

  const rhymeTokens = tokens.slice(startIdx, k + 1);
  const wordTokens = tokens.slice(k + 1);
  return { rhymeTokens, wordTokens };
}

let activePlaySeqRunId = 0;

// PHÁT DANH SÁCH ÂM THEO CHUỖI KÈM SÁNG CHIP ĐỒNG BỘ (DÙNG CHO Ô VẦN VÀ TỪ)
async function playTokenList(tokens, containerSelector, btnEl) {
  if (!tokens || !tokens.length) return;
  activePlaySeqRunId++;
  const myRunId = activePlaySeqRunId;

  // Dừng mọi âm thanh đang đọc trước đó
  const player = getDanhVanPlayer();
  if (player) player.stop();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  if (chartAudio) {
    chartAudio.pause();
    chartAudio.currentTime = 0;
    chartAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  if (btnEl) btnEl.classList.add('playing');
  const chipEls = document.querySelectorAll(`${containerSelector} .sp-token`);

  try {
    for (let i = 0; i < tokens.length; i++) {
      if (myRunId !== activePlaySeqRunId) return;
      const tok = tokens[i];

      // Highlight chip hiện tại
      chipEls.forEach((el, idx) => {
        if (idx === i) {
          el.classList.add('active');
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          el.classList.remove('active');
        }
      });

      // Lấy file âm thanh từ spellingStepAudioMap hoặc fallback
      let audioUrl = state.spellingStepAudioMap && state.spellingStepAudioMap[tok.text];
      if (!audioUrl) {
        audioUrl = '06-assets/audio/spelling/steps/' + encodeURIComponent(tok.text) + '.mp3';
      }

      const rate = state.speechRate || 1.15;
      await playAudioSrc(audioUrl, tok.text, rate);

      if (myRunId !== activePlaySeqRunId) return;
      // Khoảng nghỉ bóp ngắn lại để nhịp đánh vần dứt khoát, sôi động, bé không bị chán
      const pause = tok.pauseAfter ? Math.min(tok.pauseAfter, 180) : 140;
      await new Promise((r) => setTimeout(r, pause));
    }
  } finally {
    if (myRunId === activePlaySeqRunId) {
      if (btnEl) btnEl.classList.remove('playing');
      chipEls.forEach((el) => el.classList.remove('active'));
    }
  }
}

function renderSpellingSequence(word) {
  const container = document.getElementById('spelling-seq');
  if (!container) return;
  if (typeof DanhVanSpeech !== 'undefined' && DanhVanSpeech.planWord) {
    try {
      const plan = DanhVanSpeech.planWord(word);
      if (state.activeModule === 'spelling' && state.currentWord) {
        const { wordTokens } = splitSpellingTokens(state.currentWord, plan);
        container.innerHTML = wordTokens.map((p, i) => `<span id="sp-token-${i}" class="sp-token">${p.text}</span>`).join(' ');
        return;
      }
      container.innerHTML = plan.map((p, i) => `<span id="sp-token-${i}" class="sp-token">${p.text}</span>`).join(' ');
      return;
    } catch (e) {
      console.warn('planWord error:', e);
    }
  }
  container.innerHTML = '';
}

function highlightSpellingStep(item, index) {
  const tokens = document.querySelectorAll('#spelling-seq .sp-token');
  tokens.forEach((el, i) => {
    if (i === index) {
      el.classList.add('active');
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      el.classList.remove('active');
    }
  });
}

// A2 & B2. CẬP NHẬT Ô VẦN VÀ NÚT BẢNG VẦN
function updateRhymeBox(item) {
  const rhymeBox = document.getElementById('spelling-rhyme-box');
  const rhymeDisplay = document.getElementById('rhyme-display');
  const rhymeSeq = document.getElementById('rhyme-seq');
  const chartBtn = document.getElementById('btn-open-rhyme-chart');
  if (!rhymeBox || !item) return;

  if (state.activeModule !== 'spelling') {
    rhymeBox.style.display = 'none';
    if (chartBtn) chartBtn.style.display = 'none';
    return;
  }

  rhymeBox.style.display = 'block';
  const rime = (item.phonics?.rime?.written || item.rhyme_family || '').trim();
  if (rhymeDisplay) rhymeDisplay.textContent = rime;

  if (typeof DanhVanSpeech !== 'undefined' && DanhVanSpeech.planWord) {
    try {
      const plan = DanhVanSpeech.planWord(item.word);
      const { rhymeTokens } = splitSpellingTokens(item, plan);
      if (rhymeSeq) {
        rhymeSeq.innerHTML = rhymeTokens.map((p, i) => `<span id="rhyme-token-${i}" class="sp-token">${p.text}</span>`).join(' ');
      }
    } catch (e) {
      console.warn('updateRhymeBox planWord error:', e);
      if (rhymeSeq) rhymeSeq.innerHTML = '';
    }
  }

  // B2. Hiện/ẩn nút "Bảng vần" nếu có dữ liệu tương ứng trong rhymeCharts
  const rimeLower = rime.toLowerCase();
  const hasChart = state.rhymeCharts && state.rhymeCharts.some(c => (c.rhyme || '').toLowerCase() === rimeLower);
  if (chartBtn) {
    chartBtn.style.display = hasChart ? 'inline-flex' : 'none';
  }
}

// A3. PHÁT ÂM THANH Ô VẦN (CHỈ ĐỌC CHUỖI VẦN: â - pờ - âp)
async function playRhymeSequence(item) {
  if (!item) item = state.currentWord;
  if (!item) return;
  const btn = document.getElementById('btn-play-rhyme');
  if (typeof DanhVanSpeech !== 'undefined' && DanhVanSpeech.planWord) {
    try {
      const plan = DanhVanSpeech.planWord(item.word);
      const { rhymeTokens } = splitSpellingTokens(item, plan);
      await playTokenList(rhymeTokens, '#rhyme-seq', btn);
    } catch (e) {
      console.warn('playRhymeSequence error:', e);
    }
  }
}

// PHẦN B: MÀN HÌNH BẢNG VẦN (RHYME CHART)
function formatChartWord(w, rhymeForm) {
  const wordText = (typeof w === 'string' ? w : w.word || '').trim();
  let onset = '';
  if (typeof w === 'object' && w.onset) {
    onset = w.onset;
  } else {
    const item = (state.spellingItems || []).find(x => x.word.toLowerCase() === wordText.toLowerCase()) ||
                 (state.vocabItems || []).find(x => x.word.toLowerCase() === wordText.toLowerCase());
    if (item && item.phonics?.onset?.written) {
      onset = item.phonics.onset.written;
    } else if (rhymeForm && wordText.toLowerCase().endsWith(rhymeForm.toLowerCase())) {
      onset = wordText.slice(0, wordText.length - rhymeForm.length);
    }
  }
  const rimePart = wordText.slice(onset.length);
  return `<span class="onset-blue">${onset}</span><span class="rime-black">${rimePart}</span>`;
}

let chartAudio = null;
async function playChartWord(text, cellEl) {
  if (!text) return;
  // Dừng mọi âm thanh trước đó
  const player = getDanhVanPlayer();
  if (player) player.stop();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  if (chartAudio) {
    chartAudio.pause();
    chartAudio.currentTime = 0;
    chartAudio = null;
  }
  if (chartAudio) {
    chartAudio.pause();
    chartAudio.currentTime = 0;
    chartAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  // Làm sáng ô được click
  document.querySelectorAll('.chart-cell').forEach(c => c.classList.remove('active'));
  if (cellEl) cellEl.classList.add('active');

  try {
    const item = (state.spellingItems || []).find(x => x.word.toLowerCase() === text.toLowerCase()) ||
                 (state.vocabItems || []).find(x => x.word.toLowerCase() === text.toLowerCase());
    const audioUrl = item ? getDialectAudio(item, 'word') : null;
    await playAudioSrc(audioUrl, text);
  } finally {
    if (cellEl) cellEl.classList.remove('active');
  }
}

function openRhymeChart(rime) {
  if (!rime) {
    const cur = state.currentWord;
    rime = cur?.phonics?.rime?.written || cur?.rhyme_family || '';
  }
  const rimeLower = (rime || '').trim().toLowerCase();
  const chart = (state.rhymeCharts || []).find(c => (c.rhyme || '').toLowerCase() === rimeLower);
  if (!chart) {
    showToast(`Chưa có bảng vần cho vần -${rime}`);
    return;
  }

  const bigRhymeEl = document.getElementById('chart-big-rhyme');
  if (bigRhymeEl) bigRhymeEl.textContent = chart.rhyme;

  const rowsContainer = document.getElementById('chart-rows-container');
  if (rowsContainer) {
    rowsContainer.innerHTML = '';
    (chart.rows || []).forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'chart-row';

      // Ô đầu dòng: chữ vần có dấu (ví dụ: ấp, ập)
      const formCell = document.createElement('div');
      formCell.className = 'chart-cell chart-cell-rhyme-form';
      formCell.textContent = row.rhyme_form;
      formCell.title = `Chạm để nghe: ${row.rhyme_form}`;
      formCell.addEventListener('click', () => playChartWord(row.rhyme_form, formCell));
      rowDiv.appendChild(formCell);

      // Các ô từ tiếp theo
      (row.words || []).forEach(w => {
        const wordText = typeof w === 'string' ? w : w.word;
        const wordCell = document.createElement('div');
        wordCell.className = 'chart-cell chart-cell-word';
        wordCell.innerHTML = formatChartWord(w, row.rhyme_form);
        wordCell.title = `Chạm để nghe: ${wordText}`;
        wordCell.addEventListener('click', () => playChartWord(wordText, wordCell));
        rowDiv.appendChild(wordCell);
      });

      rowsContainer.appendChild(rowDiv);
    });
  }

  // Chú thích & emoji dưới bảng
  const captionText = document.getElementById('chart-caption-text');
  const captionEmoji = document.getElementById('chart-caption-emoji');
  if (captionText) captionText.textContent = chart.picture_caption || '';
  if (captionEmoji) captionEmoji.textContent = chart.picture_emoji || '📖';

  switchView('view-rhyme-chart');
}

// Danh sách lời khen ngợi phong phú dành riêng cho Bé Mây: ĐỒNG NHẤT 100% GIỮA ÂM THANH VÀ CHỮ HIỂN THỊ
const PRAISE_ITEMS = [
  { text: "Đúng rồi Bé Mây giỏi quá", display: "Đúng rồi Bé Mây giỏi quá! 🌟", audio: "06-assets/audio/common/praise_0.mp3" },
  { text: "Hoan hô bé Mây!", display: "Hoan hô bé Mây! 🎉", audio: "06-assets/audio/common/praise_1.mp3" },
  { text: "Bé Mây tuyệt vời quá.", display: "Bé Mây tuyệt vời quá! 🚀", audio: "06-assets/audio/common/praise_2.mp3" },
  { text: "Bé Mây chọn đúng rồi", display: "Bé Mây chọn đúng rồi! 👏", audio: "06-assets/audio/common/praise_3.mp3" },
  { text: "Bé Mây rất là giỏi.", display: "Bé Mây rất là giỏi! 🌈", audio: "06-assets/audio/common/praise_4.mp3" },
  { text: "Bé Mây làm tốt lắm!", display: "Bé Mây làm tốt lắm! 💖", audio: "06-assets/audio/common/praise_5.mp3" },
  { text: "Bé Mây trả lời rất hay.", display: "Bé Mây trả lời rất hay! 🐱✨", audio: "06-assets/audio/common/praise_6.mp3" },
  { text: "Bé Mây thật là giỏi!", display: "Bé Mây thật là giỏi! 🏆", audio: "06-assets/audio/common/praise_7.mp3" }
];

// Danh sách lời khích lệ nhẹ nhàng dành riêng cho Bé Mây: ĐỒNG NHẤT 100% GIỮA ÂM THANH VÀ CHỮ HIỂN THỊ
const ENCOURAGE_ITEMS = [
  { text: "Bé Mây cố lên, thử lại lần nữa nào!", display: "Bé Mây cố lên, thử lại lần nữa nào! 💪", audio: "06-assets/audio/common/encourage_0.mp3" },
  { text: "Bé Mây nhìn kỹ lại nhé!", display: "Bé Mây nhìn kỹ lại nhé! 👀", audio: "06-assets/audio/common/encourage_1.mp3" },
  { text: "Bé Mây chọn lại một lần nữa nhé!", display: "Bé Mây chọn lại một lần nữa nhé! 🍀", audio: "06-assets/audio/common/encourage_2.mp3" },
  { text: "Không sao đâu Bé Mây yêu, cùng làm lại nào!", display: "Không sao đâu Bé Mây yêu, cùng làm lại nào! 💖", audio: "06-assets/audio/common/encourage_3.mp3" },
  { text: "Bé Mây gần đúng rồi", display: "Bé Mây gần đúng rồi! ✨", audio: "06-assets/audio/common/encourage_4.mp3" },
  { text: "Bé Mây hãy chọn lại nhé", display: "Bé Mây hãy chọn lại nhé! 🧐", audio: "06-assets/audio/common/encourage_5.mp3" }
];

// Hình minh họa sinh động cho từng câu ví dụ
const exampleIllustrationMap = {
  // 32 từ khởi đầu
  'ba': '📚👨‍👧', // Ba đọc sách cùng bé
  'bà': '👵✨', // Bà kể chuyện cổ tích
  'bố': '👨🚲', // Bố đưa bé đi chơi
  'mẹ': '👩‍👦💖', // Mẹ ôm bé
  'bé': '👶🎈', // Bé cười với bóng bay
  'bò': '🐄🌾', // Bò gặm cỏ xanh
  'mèo': '🐱💤', // Mèo nằm ngủ
  'gà': '🐔🌽', // Gà mổ thóc
  'cá': '🐟🌊', // Cá bơi tung tăng
  'vịt': '🦆🏊', // Vịt bơi ở ao
  'chó': '🐶🎾', // Chó chơi bóng
  'hoa': '🌸🌿', // Bé ngắm hoa
  'lá': '🍃🍂', // Chiếc lá rơi
  'cây': '🌳🍎', // Cây cao trong vườn
  'nắng': '☀️🕶️', // Hôm nay có nắng
  'mưa': '🌧️☔', // Trời đang mưa
  'đá': '🪨🏞️', // Bé nhặt viên đá
  'đèn': '💡🛋️', // Bé bật đèn
  'bút': '✏️📝', // Bé cầm bút vẽ
  'sách': '📖🎒', // Bé mở sách học
  'vở': '📓✏️', // Cuốn vở xinh xắn
  'bàn': '🪑📚', // Bàn học ngăn nắp
  'ghế': '🛋️🏡', // Chiếc ghế êm ái
  'nhà': '🏡🌸', // Ngôi nhà ấm cúng
  'cửa': '🚪🔑', // Cửa mở rộng
  'cơm': '🍚🥢', // Bát cơm thơm dẻo
  'nước': '🥛🧊', // Cốc nước mát
  'xe': '🚗🛣️', // Chiếc xe chạy bon bon
  'đánh': '🥁🎵', // Bé đánh trống rộn ràng
  'bóng': '⚽🥅', // Bé đá bóng
  'đau': '🩹🤕', // Băng dán vết thương
  'sau': '➡️🚶', // Đi sau một bước
  'tay': '✋🎨', // Bàn tay vẽ tranh
  'mắt': '👀✨', // Đôi mắt sáng ngời
  'miệng': '👄🍎', // Miệng cười tươi
  'chân': '🦶⚽', // Chân sút bóng
  'ăn': '🍚🥄', // Bé xúc cơm ăn
  'uống': '🥛😋', // Bé uống sữa mát
  'ngủ': '😴🌙', // Bé ngủ say sưa
  'đi': '🚶🎒', // Bé đi đến trường

  // Các từ SGK phổ biến tiếp theo
  'cô': '👩‍🏫🌸',
  'na': '🍈🌿',
  'cơ': '🚩🇻🇳',
  'đa': '🌳🏡',
  'ca nô': '🛥️🌊',
  'ca sĩ': '🎤🎶',
  'ca múa': '💃🎵',
  'bế': '🤱💕',
  'me': '🌿😋',
  'lê': '🍐✨',
  'bè': '🛶🌊',
  'bê': '🐂🌾',
  'cà': '🍆🌱',
  'bồ': '🕊️☁️',
  'cờ': '🇻🇳⭐',
  'cỏ': '🌿🌼',
  'cỗ': '🍲🥢',
  'cọ': '🌴🌞',
  'bẻ': '🌽🌻',
  'dê': '🐐🌿',
  'đỗ': '🫘🌱',
  'bi': '🔮✨',
  'bí đỏ': '🎃🌾',
  'đi đò': '🛶🌊',
  'bé bò': '👶🧸',
  'cố đô': '🏯✨',
  'đi bộ': '🚶🌳',
  'hề': '🤡🎈',
  'khế': '⭐🌿',
  'khỉ bé': '🐒🍌',
  'hồ cá': '🐠💦',
  'dù': '☂️🌧️',
  'nụ': '🌷🍃',
  'nơ đỏ': '🎀✨',
  'tô mì': '🍜🥢',
  'nho': '🍇🌿',
  'phở': '🍜🍋'
};

// Dữ liệu hình ảnh và tên gọi trực quan cho trẻ nhỏ
const pictureData = {
  // 32 từ khởi đầu
  'ba': { emoji: '👨‍👧', label: 'Người Ba (Bố)' },
  'bà': { emoji: '👵', label: 'Người Bà' },
  'bố': { emoji: '👨', label: 'Người Bố' },
  'mẹ': { emoji: '👩‍👦', label: 'Người Mẹ' },
  'bé': { emoji: '👶', label: 'Em Bé' },
  'bò': { emoji: '🐄', label: 'Con Bò' },
  'mèo': { emoji: '🐱', label: 'Con Mèo' },
  'gà': { emoji: '🐔', label: 'Con Gà' },
  'cá': { emoji: '🐟', label: 'Con Cá' },
  'vịt': { emoji: '🦆', label: 'Con Vịt' },
  'chó': { emoji: '🐶', label: 'Con Chó' },
  'hoa': { emoji: '🌸', label: 'Bông Hoa' },
  'lá': { emoji: '🍃', label: 'Chiếc Lá' },
  'cây': { emoji: '🌳', label: 'Cây Xanh' },
  'nắng': { emoji: '☀️', label: 'Ánh Nắng' },
  'mưa': { emoji: '🌧️', label: 'Trời Mưa' },
  'đá': { emoji: '🪨', label: 'Cục đá' },
  'cục đá': { emoji: '🪨', label: 'Cục đá' },
  'đèn': { emoji: '💡', label: 'Cái Đèn' },
  'bút': { emoji: '✏️', label: 'Cây Bút' },
  'sách': { emoji: '📖', label: 'Cuốn Sách' },
  'vở': { emoji: '📓', label: 'Quyển Vở' },
  'tay': { emoji: '✋', label: 'Bàn Tay' },
  'mắt': { emoji: '👀', label: 'Đôi Mắt' },
  'miệng': { emoji: '👄', label: 'Cái Miệng' },
  'chân': { emoji: '🦶', label: 'Bàn Chân' },
  'ăn': { emoji: '🍚', label: 'Bé Ăn Cơm' },
  'uống': { emoji: '🥛', label: 'Bé Uống Nước' },
  'ngủ': { emoji: '😴', label: 'Bé Đi Ngủ' },
  'đánh': { emoji: '🥁', label: 'Đánh Trống' },
  'đi': { emoji: '🚶', label: 'Đi Bộ' },
  'đau': { emoji: '🩹', label: 'Vết Đau' },
  'sau': { emoji: '➡️', label: 'Đi Phía Sau' },
  'bóng': { emoji: '⚽', label: 'Quả Bóng' },
  'xe': { emoji: '🚗', label: 'Chiếc Xe' },
  'nhà': { emoji: '🏡', label: 'Ngôi Nhà' },
  'cửa': { emoji: '🚪', label: 'Cánh Cửa' },
  'bàn': { emoji: '🪑', label: 'Bàn Học' },
  'ghế': { emoji: '🛋️', label: 'Cái Ghế' },

  // Mở rộng các từ SGK
  'cô': { emoji: '👩‍🏫', label: 'Cô Giáo' },
  'na': { emoji: '🍈', label: 'Quả Na' },
  'cơ': { emoji: '🚩', label: 'Cờ Đỏ' },
  'đa': { emoji: '🌳', label: 'Cây Đa' },
  'ca nô': { emoji: '🛥️', label: 'Ca Nô' },
  'ca sĩ': { emoji: '🎤', label: 'Ca Sĩ' },
  'ca múa': { emoji: '💃', label: 'Ca Múa' },
  'bế': { emoji: '🤱', label: 'Bế Bé' },
  'me': { emoji: '🌿', label: 'Quả Me' },
  'lê': { emoji: '🍐', label: 'Quả Lê' },
  'bè': { emoji: '🛶', label: 'Cái Bè' },
  'bê': { emoji: '🐂', label: 'Con Bê' },
  'cà': { emoji: '🍆', label: 'Quả Cà' },
  'bồ': { emoji: '🕊️', label: 'Chim Bồ Câu' },
  'cờ': { emoji: '🇻🇳', label: 'Lá Cờ' },
  'cỏ': { emoji: '🌿', label: 'Bãi Cỏ' },
  'cỗ': { emoji: '🍲', label: 'Mâm Cỗ' },
  'cọ': { emoji: '🌴', label: 'Cây Cọ' },
  'bẻ': { emoji: '🌽', label: 'Bẻ Bắp' },
  'bễ': { emoji: '🔨', label: 'Cái Bễ' },
  'bệ': { emoji: '🏛️', label: 'Bệ Đá' },
  'dê': { emoji: '🐐', label: 'Con Dê' },
  'đỗ': { emoji: '🫘', label: 'Hạt Đỗ' },
  'bi': { emoji: '🔮', label: 'Viên Bi' },
  'da bò': { emoji: '👞', label: 'Tấm Da Bò' },
  'dỗ bé': { emoji: '🧸', label: 'Dỗ Em Bé' },
  'bí đỏ': { emoji: '🎃', label: 'Quả Bí Đỏ' },
  'đi đò': { emoji: '🛶', label: 'Đi Con Đò' },
  'bé bò': { emoji: '👶', label: 'Em Bé Bò' },
  'cố đô': { emoji: '🏯', label: 'Thành Cố Đô' },
  'đi bộ': { emoji: '🚶', label: 'Đi Bộ' },
  'da cá': { emoji: '🐟', label: 'Tấm Da Cá' },
  'đổ': { emoji: '🫗', label: 'Rót Nước' },
  'hề': { emoji: '🤡', label: 'Chú Hề' },
  'kẻ': { emoji: '📏', label: 'Kẻ Vạch' },
  'khế': { emoji: '⭐', label: 'Quả Khế' },
  'kì đà': { emoji: '🦎', label: 'Con Kì Đà' },
  'khe đá': { emoji: '⛰️', label: 'Khe Đá' },
  'khỉ bé': { emoji: '🐒', label: 'Con Khỉ' },
  'hồ cá': { emoji: '🐠', label: 'Hồ Nuôi Cá' },
  'dù': { emoji: '☂️', label: 'Chiếc Dù (Ô)' },
  'tổ': { emoji: '🪺', label: 'Tổ Chim' },
  'dữ': { emoji: '🦁', label: 'Hung Dữ' },
  'củ từ': { emoji: '🥔', label: 'Củ Từ' },
  'cử tạ': { emoji: '🏋️', label: 'Môn Cử Tạ' },
  'tu hú': { emoji: '🐦', label: 'Chim Tu Hú' },
  'tê tê': { emoji: '🦔', label: 'Con Tê Tê' },
  'nụ': { emoji: '🌷', label: 'Nụ Hoa' },
  'mạ': { emoji: '🌾', label: 'Cây Mạ Non' },
  'nơ đỏ': { emoji: '🎀', label: 'Chiếc Nơ Đỏ' },
  'tô mì': { emoji: '🍜', label: 'Tô Mì Thơm' },
  'le le': { emoji: '🦆', label: 'Vịt Le Le' },
  'li': { emoji: '🥛', label: 'Cái Ly (Cốc)' },
  'nho': { emoji: '🍇', label: 'Chùm Nho' },
  'pi-a-nô': { emoji: '🎹', label: 'Đàn Pi-a-nô' },
  'phở': { emoji: '🍜', label: 'Bát Phở' },
  'thị': { emoji: '🍈', label: 'Quả Thị' },
  'nhũ đá': { emoji: '🪨', label: 'Nhũ Đá Hang' },
  'pa-nô': { emoji: '🖼️', label: 'Biển Pa-nô' },
  'phố cổ': { emoji: '🏮', label: 'Phố Cổ' },
  'cá thu': { emoji: '🐟', label: 'Con Cá Thu' },
  'cá mú': { emoji: '🐠', label: 'Con Cá Mú' },
  'kè đá': { emoji: '🪨', label: 'Bờ Kè Đá' },
  'cà phê': { emoji: '☕', label: 'Ly Cà Phê' },
  'cổ thụ': { emoji: '🌳', label: 'Cây Cổ Thụ' },
  'nhà kho': { emoji: '🏭', label: 'Nhà Kho' },
  'cục đá': { emoji: '🪨', label: 'Cục đá' },
  'rổ': { emoji: '🧺', label: 'Cái Rổ' },

  // --- FUNCTION 2: TẬP ĐÁNH VẦN (113 từ) ---
  'sáp': { emoji: '🖍️', label: 'Sáp Màu' },
  'tháp': { emoji: '🗼', label: 'Ngọn Tháp' },
  'rạp': { emoji: '🎪', label: 'Rạp Xiếc' },
  'cáp': { emoji: '🚠', label: 'Cáp Treo' },
  'sạp': { emoji: '🏪', label: 'Sạp Hàng' },
  'nháp': { emoji: '📝', label: 'Giấy Nháp' },
  'đáp': { emoji: '🛬', label: 'Hạ Cánh / Trả Lời' },
  'ráp': { emoji: '🧩', label: 'Lắp Ráp' },
  'cặp': { emoji: '🎒', label: 'Cặp Sách' },
  'gặp': { emoji: '🤝', label: 'Gặp Gỡ' },
  'lắp': { emoji: '🔧', label: 'Lắp Ghép' },
  'bắp': { emoji: '🌽', label: 'Bắp Ngô / Bắp Cải' },
  'nắp': { emoji: '🫙', label: 'Nắp Hộp' },
  'đắp': { emoji: '🛌', label: 'Đắp Chăn' },
  'thắp': { emoji: '🕯️', label: 'Thắp Nến' },
  'chắp': { emoji: '🙏', label: 'Chắp Tay' },
  'khắp': { emoji: '🌍', label: 'Khắp Nơi' },
  'sắp': { emoji: '📦', label: 'Sắp Xếp' },
  'tập': { emoji: '🤸', label: 'Tập Thể Dục' },
  'thấp': { emoji: '🌱', label: 'Cây Thấp' },
  'gấp': { emoji: '📄', label: 'Gấp Giấy' },
  'hấp': { emoji: '🥟', label: 'Bánh Hấp' },
  'nấp': { emoji: '🙈', label: 'Trốn Nấp' },
  'ngập': { emoji: '🌊', label: 'Ngập Nước' },
  'gập': { emoji: '📖', label: 'Gập Sách' },
  'vấp': { emoji: '🦶', label: 'Vấp Ngã' },
  'chập': { emoji: '👶', label: 'Chập Chững' },
  'lấp': { emoji: '✨', label: 'Lấp Lánh' },
  'dép': { emoji: '🩴', label: 'Đôi Dép' },
  'kẹp': { emoji: '📎', label: 'Cái Kẹp' },
  'ghép': { emoji: '🧩', label: 'Ghép Hình' },
  'đẹp': { emoji: '🌺', label: 'Xinh Đẹp' },
  'hẹp': { emoji: '🚪', label: 'Ngõ Hẹp' },
  'xẹp': { emoji: '🎈', label: 'Bóng Xẹp' },
  'chép': { emoji: '✍️', label: 'Chép Bài / Cá Chép' },
  'ép': { emoji: '🧃', label: 'Nước Ép' },
  'khép': { emoji: '🚪', label: 'Khép Cửa' },
  'tép': { emoji: '🦐', label: 'Con Tép' },
  'thép': { emoji: '⛓️', label: 'Sắt Thép' },
  'bếp': { emoji: '🍳', label: 'Nhà Bếp' },
  'nếp': { emoji: '🍚', label: 'Xôi Nếp' },
  'xếp': { emoji: '🧱', label: 'Xếp Gạch' },
  'kịp': { emoji: '⏰', label: 'Kịp Giờ' },
  'nhịp': { emoji: '🥁', label: 'Nhịp Điệu' },
  'chíp': { emoji: '🐥', label: 'Tiếng Chíp Chíp' },
  'dịp': { emoji: '🎉', label: 'Dịp Lễ Hội' },
  'nhíp': { emoji: '✂️', label: 'Cái Nhíp' },
  'chóp': { emoji: '⛰️', label: 'Chóp Núi' },
  'họp': { emoji: '👥', label: 'Họp Mặt' },
  'góp': { emoji: '🪙', label: 'Đóng Góp' },
  'bóp': { emoji: '👛', label: 'Cái Ví / Bóp Tay' },
  'hộp': { emoji: '📦', label: 'Chiếc Hộp' },
  'lốp': { emoji: '🛞', label: 'Lốp Xe' },
  'xốp': { emoji: '🧽', label: 'Miếng Xốp' },
  'nộp': { emoji: '📑', label: 'Nộp Bài' },
  'gộp': { emoji: '➕', label: 'Gộp Lại' },
  'tốp': { emoji: '🚶‍♂️', label: 'Tốp Ca / Tốp Người' },
  'chớp': { emoji: '⚡', label: 'Tia Chớp' },
  'lợp': { emoji: '🏠', label: 'Lợp Mái Nhà' },
  'rợp': { emoji: '🌳', label: 'Rợp Bóng Cây' },
  'hớp': { emoji: '🍵', label: 'Hớp Nước' },
  'đớp': { emoji: '🐟', label: 'Cá Đớp Mồi' },
  'úp': { emoji: '🥣', label: 'Úp Bát' },
  'súp': { emoji: '🍲', label: 'Bát Súp' },
  'cúp': { emoji: '🏆', label: 'Chiếc Cúp' },
  'búp': { emoji: '🌷', label: 'Búp Hoa / Búp Bê' },
  'chụp': { emoji: '📸', label: 'Chụp Ảnh' },
  'túp': { emoji: '🛖', label: 'Túp Lều' },
  'ngụp': { emoji: '🤿', label: 'Ngụp Lặn' },
  'sách': { emoji: '📖', label: 'Cuốn Sách' },
  'gạch': { emoji: '🧱', label: 'Viên Gạch' },
  'lạch': { emoji: '🛶', label: 'Con Lạch Nước' },
  'sạch': { emoji: '🧼', label: 'Sạch Sẽ' },
  'khách': { emoji: '🛎️', label: 'Vị Khách' },
  'tách': { emoji: '☕', label: 'Tách Trà' },
  'thạch': { emoji: '🍮', label: 'Thạch Rau Câu' },
  'vạch': { emoji: '📏', label: 'Vạch Kẻ' },
  'bạch': { emoji: '🐙', label: 'Bạch Tuộc' },
  'ếch': { emoji: '🐸', label: 'Con Ếch' },
  'lệch': { emoji: '📐', label: 'Bị Lệch' },
  'lịch': { emoji: '🗓️', label: 'Tờ Lịch' },
  'thích': { emoji: '😍', label: 'Yêu Thích' },
  'chích': { emoji: '🐦', label: 'Chim Chích' },
  'tích': { emoji: '⏱️', label: 'Đồng Hồ Tích Tắc' },
  'xích': { emoji: '⛓️', label: 'Xích Đu' },
  'kịch': { emoji: '🎭', label: 'Vở Kịch' },
  'đích': { emoji: '🎯', label: 'Về Đích' },
  'đánh': { emoji: '🥁', label: 'Đánh Trống' },
  'anh': { emoji: '👦', label: 'Anh Trai' },
  'ảnh': { emoji: '🖼️', label: 'Bức Ảnh' },
  'bánh': { emoji: '🎂', label: 'Chiếc Bánh' },
  'canh': { emoji: '🥣', label: 'Bát Canh' },
  'chanh': { emoji: '🍋', label: 'Quả Chanh' },
  'tranh': { emoji: '🎨', label: 'Bức Tranh' },
  'cành': { emoji: '🌿', label: 'Cành Cây' },
  'xanh': { emoji: '🟢', label: 'Màu Xanh' },
  'nhanh': { emoji: '🏃', label: 'Chạy Nhanh' },
  'lạnh': { emoji: '❄️', label: 'Trời Lạnh' },
  'mạnh': { emoji: '💪', label: 'Khỏe Mạnh' },
  'gánh': { emoji: '🧺', label: 'Đòn Gánh' },
  'hành': { emoji: '🧅', label: 'Hành Lá' },
  'lánh': { emoji: '⭐', label: 'Lấp Lánh' },
  'đau': { emoji: '🩹', label: 'Vết Đau' },
  'sau': { emoji: '➡️', label: 'Đi Sau' },
  'màu': { emoji: '🎨', label: 'Hộp Màu' },
  'rau': { emoji: '🥦', label: 'Rau Xanh' },
  'lau': { emoji: '🧽', label: 'Lau Bàn' },
  'tàu': { emoji: '🚢', label: 'Con Tàu' },
  'sáu': { emoji: '6️⃣', label: 'Số Sáu' },
  'cháu': { emoji: '👧', label: 'Em Bé Cháu' },
  'mau': { emoji: '⚡', label: 'Mau Chóng' },
  'nhau': { emoji: '👫', label: 'Cùng Nhau' },
  'cau': { emoji: '🌴', label: 'Cây Cau' },
};

// Emoji dự phòng
const emojiMap = {
  'ba': '👨‍👧', 'bà': '👵', 'bố': '👨', 'mẹ': '👩‍👦', 'bé': '👶',
  'bò': '🐄', 'mèo': '🐱', 'gà': '🐔', 'cá': '🐟', 'vịt': '🦆',
  'chó': '🐶', 'hoa': '🌸', 'lá': '🍃', 'cây': '🌳', 'nắng': '☀️',
  'mưa': '🌧️', 'đá': '🪨', 'đèn': '💡', 'bút': '✏️', 'sách': '📖',
  'vở': '📓', 'bàn': '🪑', 'ghế': '🛋️', 'nhà': '🏡', 'cửa': '🚪',
  'cơm': '🍚', 'nước': '🥛', 'xe': '🚗', 'đánh': '🥁', 'bóng': '⚽',
  'đau': '🩹', 'sau': '➡️', 'tay': '✋', 'mắt': '👀', 'miệng': '👄',
  'chân': '🦶', 'ăn': '🍚', 'uống': '🥛', 'ngủ': '😴', 'đi': '🚶'
};

// Hình minh họa cho TOÀN BỘ từ trong "Học từ mới" (mỗi từ 1 emoji riêng, không trùng nhau trong cùng bài).
// Muốn đổi hình của 1 từ: sửa emoji/label ở dòng của từ đó.
const vocabPictureData = {
  "ba": { emoji: "👨‍👧", label: "Ba" },
  "bà": { emoji: "👵", label: "Bà" },
  "bố": { emoji: "👨", label: "Bố" },
  "mẹ": { emoji: "👩‍👦", label: "Mẹ" },
  "bé": { emoji: "👶", label: "Bé" },
  "bò": { emoji: "🐄", label: "Con bò" },
  "gà": { emoji: "🐔", label: "Con gà" },
  "cá": { emoji: "🐟", label: "Con cá" },
  "lá": { emoji: "🍃", label: "Chiếc lá" },
  "đá": { emoji: "🪨", label: "Hòn đá" },
  "vở": { emoji: "📓", label: "Quyển vở" },
  "ăn": { emoji: "🍚", label: "Ăn cơm" },
  "đi": { emoji: "🚶", label: "Đi" },
  "cô": { emoji: "👩‍🏫", label: "Cô giáo" },
  "na": { emoji: "🍏", label: "Quả na" },
  "đa": { emoji: "🌳", label: "Cây đa" },
  "bế": { emoji: "🤱", label: "Bế em bé" },
  "lê": { emoji: "🍐", label: "Quả lê" },
  "cà": { emoji: "🍆", label: "Quả cà" },
  "cờ": { emoji: "🚩", label: "Lá cờ" },
  "cỏ": { emoji: "🌿", label: "Cây cỏ" },
  "dê": { emoji: "🐐", label: "Con dê" },
  "bi": { emoji: "🔵", label: "Viên bi" },
  "hề": { emoji: "🤡", label: "Chú hề" },
  "dù": { emoji: "☂️", label: "Cái dù" },
  "tổ": { emoji: "🐣", label: "Tổ chim" },
  "rổ": { emoji: "🧺", label: "Chiếc rổ" },
  "sò": { emoji: "🐚", label: "Con sò" },
  "ve": { emoji: "🦗", label: "Con ve" },
  "xe": { emoji: "🚗", label: "Chiếc xe" },
  "ca nô": { emoji: "🚤", label: "Ca nô" },
  "ca sĩ": { emoji: "🎤", label: "Ca sĩ" },
  "bí đỏ": { emoji: "🎃", label: "Bí đỏ" },
  "đi bộ": { emoji: "🚶‍♀️", label: "Đi bộ" },
  "đi đò": { emoji: "🛶", label: "Đi đò" },
  "hồ cá": { emoji: "🐠", label: "Hồ cá" },
  "tu hú": { emoji: "🐦", label: "Tu hú" },
  "tê tê": { emoji: "🦔", label: "Tê tê" },
  "nơ đỏ": { emoji: "🎀", label: "Nơ đỏ" },
  "tô mì": { emoji: "🍝", label: "Tô mì" },
  "le le": { emoji: "🐤", label: "Le le" },
  "ví da": { emoji: "👛", label: "Ví da" },
  "mèo": { emoji: "🐱", label: "Con mèo" },
  "vịt": { emoji: "🦆", label: "Con vịt" },
  "chó": { emoji: "🐶", label: "Con chó" },
  "hoa": { emoji: "🌸", label: "Bông hoa" },
  "cây": { emoji: "🌲", label: "Cây xanh" },
  "mưa": { emoji: "🌧️", label: "Cơn mưa" },
  "đèn": { emoji: "💡", label: "Chiếc đèn" },
  "bút": { emoji: "🖊️", label: "Cây bút" },
  "tay": { emoji: "✋", label: "Bàn tay" },
  "mắt": { emoji: "👀", label: "Đôi mắt" },
  "ngủ": { emoji: "😴", label: "Đi ngủ" },
  "đau": { emoji: "🤕", label: "Đau bụng" },
  "khế": { emoji: "⭐", label: "Quả khế" },
  "nho": { emoji: "🍇", label: "Chùm nho" },
  "phở": { emoji: "🍲", label: "Bát phở" },
  "tre": { emoji: "🎋", label: "Cây tre" },
  "ngô": { emoji: "🌽", label: "Bắp ngô" },
  "quả": { emoji: "🍎", label: "Quả" },
  "que": { emoji: "🥢", label: "Que gỗ" },
  "quạ": { emoji: "🐦‍⬛", label: "Con quạ" },
  "mía": { emoji: "🌾", label: "Cây mía" },
  "cua": { emoji: "🦀", label: "Con cua" },
  "búa": { emoji: "🔨", label: "Chiếc búa" },
  "dừa": { emoji: "🥥", label: "Quả dừa" },
  "ghế": { emoji: "🪑", label: "Chiếc ghế" },
  "sen": { emoji: "🌺", label: "Bông sen" },
  "vẹt": { emoji: "🦜", label: "Con vẹt" },
  "cà phê": { emoji: "☕", label: "Cà phê" },
  "cục đá": { emoji: "🧊", label: "Cục đá" },
  "che ô": { emoji: "🌂", label: "Che ô" },
  "nhà ga": { emoji: "🚉", label: "Nhà ga" },
  "ru ngủ": { emoji: "🌙", label: "Ru ngủ" },
  "ghế gỗ": { emoji: "💺", label: "Ghế gỗ" },
  "nô đùa": { emoji: "🧒", label: "Nô đùa" },
  "dưa lê": { emoji: "🍈", label: "Dưa lê" },
  "mưa gió": { emoji: "🌬️", label: "Mưa gió" },
  "bàn là": { emoji: "👔", label: "Bàn là" },
  "quả cam": { emoji: "🍊", label: "Quả cam" },
  "xe đạp": { emoji: "🚲", label: "Xe đạp" },
  "lạc đà": { emoji: "🐪", label: "Lạc đà" },
  "nhà sàn": { emoji: "🛖", label: "Nhà sàn" },
  "gà mái": { emoji: "🥚", label: "Gà mái" },
  "máy bay": { emoji: "✈️", label: "Máy bay" },
  "lái xe": { emoji: "🚘", label: "Lái xe" },
  "rau cải": { emoji: "🥬", label: "Rau cải" },
  "cái cân": { emoji: "⚖️", label: "Cái cân" },
  "quả mận": { emoji: "🍑", label: "Quả mận" },
  "đèn pin": { emoji: "🔦", label: "Đèn pin" },
  "quả mít": { emoji: "🍈", label: "Quả mít" },
  "đàn vịt": { emoji: "🦆", label: "Đàn vịt" },
  "nón lá": { emoji: "👒", label: "Nón lá" },
  "cà rốt": { emoji: "🥕", label: "Cà rốt" },
  "con lợn": { emoji: "🐷", label: "Con lợn" },
  "quả ớt": { emoji: "🌶️", label: "Quả ớt" },
  "cơn mưa": { emoji: "☔", label: "Cơn mưa" },
  "bút chì": { emoji: "✏️", label: "Bút chì" },
  "cún con": { emoji: "🐕", label: "Cún con" },
  "bún bò": { emoji: "🍜", label: "Bún bò" },
  "cặp da": { emoji: "🎒", label: "Cặp da" },
  "bồn tắm": { emoji: "🛁", label: "Bồn tắm" },
  "ấm trà": { emoji: "🍵", label: "Ấm trà" },
  "cá mập": { emoji: "🦈", label: "Cá mập" },
  "tập múa": { emoji: "💃", label: "Tập múa" },
  "que kem": { emoji: "🍦", label: "Que kem" },
  "dép lê": { emoji: "🩴", label: "Dép lê" },
  "tập đếm": { emoji: "🔢", label: "Tập đếm" },
  "sắp xếp": { emoji: "🗂️", label: "Sắp xếp" },
  "con tôm": { emoji: "🦐", label: "Con tôm" },
  "hộp sữa": { emoji: "🥛", label: "Hộp sữa" },
  "nấm rơm": { emoji: "🍄", label: "Nấm rơm" },
  "mặc áo": { emoji: "👚", label: "Mặc áo" },
  "học vẽ": { emoji: "🎨", label: "Học vẽ" },
  "con ốc": { emoji: "🐌", label: "Con ốc" },
  "con ếch": { emoji: "🐸", label: "Con ếch" },
  "đám mây": { emoji: "☁️", label: "Đám mây" },
  "kéo co": { emoji: "🪢", label: "Kéo co" },
  "cái lều": { emoji: "⛺", label: "Cái lều" },
  "con cừu": { emoji: "🐑", label: "Con cừu" },
  "con voi": { emoji: "🐘", label: "Con voi" },
  "con dơi": { emoji: "🦇", label: "Con dơi" },
  "bơi lội": { emoji: "🏊", label: "Bơi lội" },
  "đồi núi": { emoji: "⛰️", label: "Đồi núi" },
  "gửi thư": { emoji: "✉️", label: "Gửi thư" },
  "toa tàu": { emoji: "🚃", label: "Toa tàu" },
  "nắng": { emoji: "☀️", label: "Ánh nắng" },
  "sách": { emoji: "📖", label: "Cuốn sách" },
  "miệng": { emoji: "👄", label: "Cái miệng" },
  "chân": { emoji: "🦶", label: "Bàn chân" },
  "uống": { emoji: "🥤", label: "Uống nước" },
  "ngựa": { emoji: "🐎", label: "Con ngựa" },
  "gương": { emoji: "🪞", label: "Chiếc gương" },
  "cà chua": { emoji: "🍅", label: "Cà chua" },
  "lá bàng": { emoji: "🍂", label: "Lá bàng" },
  "quả chanh": { emoji: "🍋", label: "Quả chanh" },
  "sách vở": { emoji: "📚", label: "Sách vở" },
  "sạch sẽ": { emoji: "🧼", label: "Sạch sẽ" },
  "chào cờ": { emoji: "🇻🇳", label: "Chào cờ" },
  "cái chăn": { emoji: "🛌", label: "Cái chăn" },
  "nốt nhạc": { emoji: "🎵", label: "Nốt nhạc" },
  "áo thun": { emoji: "👕", label: "Áo thun" },
  "bờ biển": { emoji: "🏖️", label: "Bờ biển" },
  "cô tiên": { emoji: "🧚", label: "Cô tiên" },
  "viên phấn": { emoji: "🖍️", label: "Viên phấn" },
  "viết bài": { emoji: "✍️", label: "Viết bài" },
  "con vượn": { emoji: "🐒", label: "Con vượn" },
  "cá chép": { emoji: "🎏", label: "Cá chép" },
  "lễ phép": { emoji: "🙇", label: "Lễ phép" },
  "gấp chăn": { emoji: "🛏️", label: "Gấp chăn" },
  "khu vườn": { emoji: "🌷", label: "Khu vườn" },
  "con nhím": { emoji: "🦔", label: "Con nhím" },
  "xem phim": { emoji: "🎬", label: "Xem phim" },
  "trốn tìm": { emoji: "🙈", label: "Trốn tìm" },
  "gà chíp": { emoji: "🐥", label: "Gà chíp" },
  "tia chớp": { emoji: "⚡", label: "Tia chớp" },
  "con bướm": { emoji: "🦋", label: "Con bướm" },
  "quả bóng": { emoji: "⚽", label: "Quả bóng" },
  "sóng biển": { emoji: "🌊", label: "Sóng biển" },
  "dòng sông": { emoji: "🏞️", label: "Dòng sông" },
  "công viên": { emoji: "🎡", label: "Công viên" },
  "bông cúc": { emoji: "🌼", label: "Bông cúc" },
  "trung thu": { emoji: "🥮", label: "Trung thu" },
  "con ngỗng": { emoji: "🦢", label: "Con ngỗng" },
  "đồng ruộng": { emoji: "🌾", label: "Đồng ruộng" },
  "thước kẻ": { emoji: "📏", label: "Thước kẻ" },
  "hướng dương": { emoji: "🌻", label: "Hướng dương" },
  "bập bênh": { emoji: "🎢", label: "Bập bênh" },
  "bệnh viện": { emoji: "🏥", label: "Bệnh viện" },
  "máy tính": { emoji: "💻", label: "Máy tính" },
  "tờ lịch": { emoji: "📅", label: "Tờ lịch" },
  "xích đu": { emoji: "🎠", label: "Xích đu" },
  "rước đèn": { emoji: "🏮", label: "Rước đèn" },
  "nhảy dây": { emoji: "🤸", label: "Nhảy dây" },
  "cái chổi": { emoji: "🧹", label: "Cái chổi" },
  "chơi cờ": { emoji: "♟️", label: "Chơi cờ" },
  "túi xách": { emoji: "👜", label: "Túi xách" },
  "quả bưởi": { emoji: "🍊", label: "Quả bưởi" },
  "tưới cây": { emoji: "🪴", label: "Tưới cây" },
  "con ruồi": { emoji: "🪰", label: "Con ruồi" },
  "cánh diều": { emoji: "🪁", label: "Cánh diều" },
  "con hươu": { emoji: "🦌", label: "Con hươu" },
  "siêu thị": { emoji: "🛒", label: "Siêu thị" },
  "yêu thương": { emoji: "❤️", label: "Yêu thương" },
  "hoạt hình": { emoji: "📺", label: "Hoạt hình" },
  "vải thiều": { emoji: "🍒", label: "Vải thiều" },
  "hoan hô": { emoji: "🎉", label: "Hoan hô" },
  "khoai lang": { emoji: "🍠", label: "Khoai lang" },
  "quả xoài": { emoji: "🥭", label: "Quả xoài" },
  "điện thoại": { emoji: "📱", label: "Điện thoại" },
  "kể chuyện": { emoji: "🗣️", label: "Kể chuyện" },
  "bóng chuyền": { emoji: "🏐", label: "Bóng chuyền" },
  "mùa xuân": { emoji: "🌸", label: "Mùa xuân" },
  "áo khoác": { emoji: "🧥", label: "Áo khoác" },
  "xe buýt": { emoji: "🚌", label: "Xe buýt" },
  "huýt sáo": { emoji: "😗", label: "Huýt sáo" },
  "tập thể dục": { emoji: "🏋️", label: "Tập thể dục" },
  "xe cứu hoả": { emoji: "🚒", label: "Xe cứu hoả" },
};

// Hình minh hoạ (emoji) cho các từ Tập đánh vần mở rộng (chỉ dùng khi từ chưa có trong pictureData)
const spellingExtraPictures = {
  'mắt': { emoji: '👀', label: 'Đôi Mắt' },
  'bát': { emoji: '🥣', label: 'Cái Bát' },
  'đất': { emoji: '🌱', label: 'Đất Trồng Cây' },
  'Tết': { emoji: '🧧', label: 'Ngày Tết' },
  'mít': { emoji: '🍈', label: 'Quả Mít' },
  'bút': { emoji: '🖊️', label: 'Cái Bút' },
  'ngọt': { emoji: '🍬', label: 'Vị Ngọt' },
  'tốt': { emoji: '👍', label: 'Việc Tốt' },
  'ớt': { emoji: '🌶️', label: 'Quả Ớt' },
  'viết': { emoji: '✍️', label: 'Viết Chữ' },
  'bác': { emoji: '👨‍🦳', label: 'Bác' },
  'mặc': { emoji: '🧥', label: 'Mặc Áo' },
  'bậc': { emoji: '🪜', label: 'Bậc Thang' },
  'tóc': { emoji: '💇', label: 'Mái Tóc' },
  'đọc': { emoji: '📖', label: 'Đọc Sách' },
  'ốc': { emoji: '🐌', label: 'Con Ốc' },
  'cúc': { emoji: '🌼', label: 'Hoa Cúc' },
  'mực': { emoji: '🦑', label: 'Con Mực' },
  'nước': { emoji: '💧', label: 'Nước' },
  'thuốc': { emoji: '💊', label: 'Viên Thuốc' },
  'cam': { emoji: '🍊', label: 'Quả Cam' },
  'làm': { emoji: '🙌', label: 'Làm Việc' },
  'năm': { emoji: '📅', label: 'Một Năm' },
  'nấm': { emoji: '🍄', label: 'Cây Nấm' },
  'kem': { emoji: '🍦', label: 'Cây Kem' },
  'đêm': { emoji: '🌃', label: 'Ban Đêm' },
  'chim': { emoji: '🐦', label: 'Con Chim' },
  'tôm': { emoji: '🦐', label: 'Con Tôm' },
  'cơm': { emoji: '🍚', label: 'Bát Cơm' },
  'thơm': { emoji: '🌸', label: 'Mùi Thơm' },
  'bàn': { emoji: '🪑', label: 'Cái Bàn' },
  'khăn': { emoji: '🧣', label: 'Chiếc Khăn' },
  'sân': { emoji: '🏡', label: 'Sân Nhà' },
  'đèn': { emoji: '💡', label: 'Bóng Đèn' },
  'bên': { emoji: '↔️', label: 'Bên Cạnh' },
  'chín': { emoji: '9️⃣', label: 'Số Chín' },
  'con': { emoji: '🐱', label: 'Con Mèo' },
  'bốn': { emoji: '4️⃣', label: 'Số Bốn' },
  'sơn': { emoji: '🎨', label: 'Sơn Tường' },
  'cún': { emoji: '🐶', label: 'Chú Cún' },
  'sáng': { emoji: '🌅', label: 'Buổi Sáng' },
  'trăng': { emoji: '🌕', label: 'Mặt Trăng' },
  'tầng': { emoji: '🏢', label: 'Tầng Nhà' },
  'xẻng': { emoji: '⛏️', label: 'Cái Xẻng' },
  'bóng': { emoji: '⚽', label: 'Quả Bóng' },
  'bông': { emoji: '🌺', label: 'Bông Hoa' },
  'thùng': { emoji: '🪣', label: 'Cái Thùng' },
  'rừng': { emoji: '🌲', label: 'Khu Rừng' },
  'bảng': { emoji: '📋', label: 'Cái Bảng' },
  'đứng': { emoji: '🧍', label: 'Bé Đứng' },
  'hai': { emoji: '2️⃣', label: 'Số Hai' },
  'tai': { emoji: '👂', label: 'Cái Tai' },
  'voi': { emoji: '🐘', label: 'Con Voi' },
  'nồi': { emoji: '🍲', label: 'Cái Nồi' },
  'chơi': { emoji: '🧸', label: 'Chơi Đùa' },
  'vui': { emoji: '😊', label: 'Vui Vẻ' },
  'núi': { emoji: '⛰️', label: 'Ngọn Núi' },
  'gửi': { emoji: '✉️', label: 'Gửi Thư' },
  'cười': { emoji: '😄', label: 'Bé Cười' },
  'đuôi': { emoji: '🐕', label: 'Cái Đuôi' },
  'tay': { emoji: '✋', label: 'Bàn Tay' },
  'bay': { emoji: '🕊️', label: 'Chim Bay' },
  'máy': { emoji: '⚙️', label: 'Cái Máy' },
  'cây': { emoji: '🌳', label: 'Cái Cây' },
  'đây': { emoji: '📍', label: 'Ở Đây' },
  'mây': { emoji: '☁️', label: 'Đám Mây' },
  'ngày': { emoji: '☀️', label: 'Ban Ngày' },
  'dây': { emoji: '🧶', label: 'Sợi Dây' },
  'gậy': { emoji: '🦯', label: 'Cái Gậy' },
  'chảy': { emoji: '🚰', label: 'Nước Chảy' },
  'áo': { emoji: '👕', label: 'Cái Áo' },
  'sao': { emoji: '⭐', label: 'Ngôi Sao' },
  'rào': { emoji: '🚧', label: 'Hàng Rào' },
  'cao': { emoji: '📏', label: 'Cao' },
  'chào': { emoji: '👋', label: 'Chào Hỏi' },
  'mèo': { emoji: '🐱', label: 'Con Mèo' },
  'kẹo': { emoji: '🍬', label: 'Viên Kẹo' },
  'heo': { emoji: '🐷', label: 'Con Heo' },
  'treo': { emoji: '🖼️', label: 'Treo Tranh' },
  'bao': { emoji: '🌾', label: 'Bao Gạo' },
  'trâu': { emoji: '🐃', label: 'Con Trâu' },
  'sâu': { emoji: '🐛', label: 'Con Sâu' },
  'đầu': { emoji: '👦', label: 'Cái Đầu' },
  'câu': { emoji: '🎣', label: 'Câu Cá' },
  'cầu': { emoji: '🌉', label: 'Cây Cầu' },
  'kêu': { emoji: '🐓', label: 'Gà Kêu' },
  'lều': { emoji: '⛺', label: 'Cái Lều' },
  'sếu': { emoji: '🦩', label: 'Chim Sếu' },
  'níu': { emoji: '🤝', label: 'Níu Tay' },
  'địu': { emoji: '🍼', label: 'Địu Em Bé' },
  'nắng': { emoji: '☀️', label: 'Trời Nắng' },
  'thang': { emoji: '🪜', label: 'Cái Thang' },
  'vàng': { emoji: '🟡', label: 'Màu Vàng' },
  'măng': { emoji: '🎋', label: 'Măng Tre' },
  'vâng': { emoji: '🙋', label: 'Vâng Ạ' },
  'ong': { emoji: '🐝', label: 'Con Ong' },
  'lồng': { emoji: '🐤', label: 'Lồng Chim' },
  'ông': { emoji: '👴', label: 'Ông' },
  'cùng': { emoji: '👫', label: 'Cùng Bạn' },
  'trứng': { emoji: '🥚', label: 'Quả Trứng' },
  'tiếng': { emoji: '🔊', label: 'Tiếng Chim' },
  'miệng': { emoji: '👄', label: 'Cái Miệng' },
  'chuông': { emoji: '🔔', label: 'Cái Chuông' },
  'uống': { emoji: '🥛', label: 'Uống Sữa' },
  'vuông': { emoji: '🟦', label: 'Hình Vuông' },
  'đường': { emoji: '🛣️', label: 'Con Đường' },
  'hương': { emoji: '🌿', label: 'Mùi Hương' },
  'sương': { emoji: '💦', label: 'Giọt Sương' },
  'trường': { emoji: '🏫', label: 'Trường Học' },
  'thương': { emoji: '🥰', label: 'Yêu Thương' },
  'hình': { emoji: '⭕', label: 'Hình Tròn' },
  'xinh': { emoji: '🌷', label: 'Xinh Xắn' },
  'bệnh': { emoji: '🤒', label: 'Bị Bệnh' },
  'chịu': { emoji: '💪', label: 'Chịu Khó' },
  'diều': { emoji: '🪁', label: 'Cái Diều' },
  'cứu': { emoji: '🚒', label: 'Cứu Hoả' },
  'hươu': { emoji: '🦌', label: 'Con Hươu' }
};

// Hàm lấy thông tin hình ảnh và tên gọi với cơ chế fallback thông minh (100% từ đều có hình)
function getPictureDataForWord(word) {
  // "Học từ mới": ưu tiên bảng hình riêng đã duyệt cho từng từ
  if (state.activeModule !== 'spelling' && vocabPictureData[word]) return vocabPictureData[word];
  if (pictureData[word]) return pictureData[word];
  if (state.activeModule === 'spelling' && spellingExtraPictures[word]) return spellingExtraPictures[word];
  
  // Suy luận thông minh theo từ khóa
  if (word.includes('cá')) return { emoji: '🐟', label: `Con ${word}` };
  if (word.includes('bò') || word.includes('bê')) return { emoji: '🐄', label: `Con ${word}` };
  if (word.includes('chó')) return { emoji: '🐶', label: `Con ${word}` };
  if (word.includes('mèo')) return { emoji: '🐱', label: `Con ${word}` };
  if (word.includes('gà')) return { emoji: '🐔', label: `Con ${word}` };
  if (word.includes('vịt')) return { emoji: '🦆', label: `Con ${word}` };
  if (word.includes('chim') || word.includes('bồ') || word.includes('tu hú') || word.includes('le le') || word.includes('vẹt') || word.includes('yến') || word.includes('quạ')) return { emoji: '🐦', label: `Con ${word}` };
  if (word.includes('ngựa')) return { emoji: '🐎', label: `Con ${word}` };
  if (word.includes('cua') || word.includes('ghẹ')) return { emoji: '🦀', label: `Con ${word}` };
  if (word.includes('tôm')) return { emoji: '🦐', label: `Con ${word}` };
  if (word.includes('ốc') || word.includes('sò')) return { emoji: '🐚', label: `Con ${word}` };
  if (word.includes('ve') || word.includes('ong') || word.includes('bướm')) return { emoji: '🐝', label: `Con ${word}` };
  if (word.includes('khỉ') || word.includes('vượn')) return { emoji: '🐒', label: `Con ${word}` };
  if (word.includes('thỏ')) return { emoji: '🐰', label: `Con ${word}` };
  if (word.includes('hổ') || word.includes('cọp')) return { emoji: '🐯', label: `Con ${word}` };
  if (word.includes('voi')) return { emoji: '🐘', label: `Con ${word}` };

  if (word.includes('hoa') || word.includes('nụ') || word.includes('sen')) return { emoji: '🌸', label: `Bông ${word}` };
  if (word.includes('cây') || word.includes('đa') || word.includes('thụ') || word.includes('tre') || word.includes('rừng')) return { emoji: '🌳', label: `Cây ${word}` };
  if (word.includes('lá') || word.includes('cỏ') || word.includes('mạ') || word.includes('rau')) return { emoji: '🌿', label: word };
  if (word.includes('quả') || word.includes('trái') || word.includes('khế') || word.includes('na') || word.includes('lê') || word.includes('nho') || word.includes('thị') || word.includes('ngô') || word.includes('mía') || word.includes('dừa')) return { emoji: '🍎', label: `Quả ${word}` };
  
  if (word.includes('máy bay')) return { emoji: '✈️', label: word };
  if (word.includes('tàu') || word.includes('thuyền') || word.includes('đò') || word.includes('ca nô')) return { emoji: '🚢', label: word };
  if (word.includes('xe') || word.includes('bò kéo')) return { emoji: '🚗', label: word };

  if (word.includes('nhà') || word.includes('cố đô') || word.includes('phố') || word.includes('trường') || word.includes('kho')) return { emoji: '🏡', label: word };
  if (word.includes('đá') || word.includes('núi') || word.includes('đồi')) return { emoji: '🪨', label: `Hòn ${word}` };
  if (word.includes('sông') || word.includes('suối') || word.includes('biển') || word.includes('hồ') || word.includes('nước')) return { emoji: '🌊', label: word };

  if (word.includes('sách') || word.includes('vở') || word.includes('truyện')) return { emoji: '📖', label: word };
  if (word.includes('bút') || word.includes('thước') || word.includes('phấn')) return { emoji: '✏️', label: word };
  if (word.includes('bàn') || word.includes('ghế')) return { emoji: '🪑', label: word };
  if (word.includes('đàn') || word.includes('pi-a-nô') || word.includes('hát') || word.includes('múa') || word.includes('ca')) return { emoji: '🎵', label: word };
  if (word.includes('mì') || word.includes('phở') || word.includes('cơm') || word.includes('cỗ') || word.includes('bánh') || word.includes('chè')) return { emoji: '🍜', label: `Món ${word}` };
  if (word.includes('chạy') || word.includes('nhảy') || word.includes('bơi') || word.includes('đi')) return { emoji: '🏃', label: word };
  if (word.includes('áo') || word.includes('quần') || word.includes('mũ') || word.includes('nón') || word.includes('nơ') || word.includes('yếm')) return { emoji: '🎀', label: word };

  const emoji = emojiMap[word] || '🌟';
  return { emoji, label: `Từ: ${word}` };
}

// Phân loại nhóm đối tượng để đa dạng hóa đáp án trắc nghiệm hình ảnh
function getWordCategory(word) {
  const p = getPictureDataForWord(word);
  const label = (p.label || '').toLowerCase();
  const em = p.emoji || '';
  
  if (['👨‍👧', '👵', '👨', '👩‍👦', '👶', '👩‍🏫', '🎤', '🤡'].includes(em) || label.includes('người') || label.includes('bé') || label.includes('cô') || label.includes('hề') || label.includes('ca sĩ') || label.includes('ba') || label.includes('mẹ') || label.includes('bà')) {
    return 'people';
  }
  if (['🐄', '🐱', '🐔', '🐟', '🦆', '🐶', '🐂', '🕊️', '🐐', '🦎', '🐒', '🐠', '🦁', '🐦', '🦔', '🐷'].includes(em) || label.includes('con') || label.includes('chim') || label.includes('vịt') || label.includes('cá') || label.includes('chó') || label.includes('mèo') || label.includes('bò') || label.includes('gà') || label.includes('dê') || label.includes('tê tê') || label.includes('tu hú') || label.includes('le le') || label.includes('kì đà')) {
    return 'animals';
  }
  if (['🌸', '🍃', '🌳', '🌿', '🍐', '🍆', '🌴', '🌽', '🫘', '🎃', '⭐', '🌷', '🌾', '🍇', '🍈', '🍎'].includes(em) || label.includes('hoa') || label.includes('lá') || label.includes('cây') || label.includes('quả') || label.includes('nụ') || label.includes('mạ') || label.includes('bắp') || label.includes('hạt') || label.includes('cỏ') || label.includes('cà') || label.includes('khế') || label.includes('lê') || label.includes('me') || label.includes('na') || label.includes('nho') || label.includes('thị')) {
    return 'plants';
  }
  if (['☀️', '🌧️', '🪨', '⛰️'].includes(em) || label.includes('nắng') || label.includes('mưa') || label.includes('đá') || label.includes('khe') || label.includes('nhũ')) {
    return 'nature';
  }
  if (['💡', '✏️', '📖', '📓', '🪑', '🛋️', '🏡', '🚪', '⚽', '🚗', '🛥️', '🛶', '🇻🇳', '🚩', '🍲', '🔨', '🏛️', '👞', '🧸', '🏯', '📏', '☂️', '🪺', '🥔', '🏋️', '🎀', '🍜', '🥛', '🎹', '🖼️', '🏮', '☕', '🏭', '🧺', '🫗'].includes(em) || label.includes('cái') || label.includes('chiếc') || label.includes('đèn') || label.includes('bút') || label.includes('sách') || label.includes('vở') || label.includes('bàn') || label.includes('xe') || label.includes('cờ') || label.includes('nhà') || label.includes('món') || label.includes('ly') || label.includes('rổ') || label.includes('dù') || label.includes('bi')) {
    return 'objects';
  }
  return 'actions';
}

// Lựa chọn đáp án gây nhiễu TUYỆT ĐỐI CHỈ TRONG BÀI HỌC HIỆN TẠI (10-12 từ), đa dạng hóa nhóm phân loại
function selectDistractorsForWord(targetItem, roundQuestions) {
  const targetWord = targetItem.word;
  const targetPic = getPictureDataForWord(targetWord);
  const targetCat = getWordCategory(targetWord);

  // Pool chỉ lấy DUY NHẤT trong bài học hiện tại (10-12 từ)
  const pool = (roundQuestions || []).filter(x => x.word !== targetWord);
  
  // Lọc ra các từ có emoji khác với targetPic.emoji
  const validCandidates = pool.filter(x => {
    const pic = getPictureDataForWord(x.word);
    return pic.emoji !== targetPic.emoji;
  });

  // Xáo trộn ngẫu nhiên để mỗi lần chơi phong phú
  const shuffled = [...validCandidates].sort(() => Math.random() - 0.5);

  const chosen = [];
  const usedEmojis = new Set([targetPic.emoji]);
  const usedCats = new Set([targetCat]);

  // Vòng 1: Tìm ứng viên thuộc nhóm phân loại KHÁC HOÀN TOÀN với mục tiêu và với nhau
  // Ví dụ: Mục tiêu là Quả Na (plants) -> chọn Con Chó (animals) và Bàn Học (objects)
  // Mục tiêu là Chim Tu Hú (animals) -> chọn Con Bò (khác emoji) hoặc Cây Đa (plants), Cái Bàn (objects)
  for (const cand of shuffled) {
    if (chosen.length >= 2) break;
    const pic = getPictureDataForWord(cand.word);
    const cat = getWordCategory(cand.word);
    if (!usedEmojis.has(pic.emoji) && !usedCats.has(cat)) {
      chosen.push(cand);
      usedEmojis.add(pic.emoji);
      usedCats.add(cat);
    }
  }

  // Vòng 2: Nếu chưa đủ 2, lấy ứng viên khác emoji (dù có thể cùng category nếu bài học ít nhóm)
  if (chosen.length < 2) {
    for (const cand of shuffled) {
      if (chosen.length >= 2) break;
      if (chosen.some(c => c.id === cand.id)) continue;
      const pic = getPictureDataForWord(cand.word);
      if (!usedEmojis.has(pic.emoji)) {
        chosen.push(cand);
        usedEmojis.add(pic.emoji);
      }
    }
  }

  // Dự phòng an toàn tuyệt đối nếu bài có quá ít emoji khác nhau
  if (chosen.length < 2) {
    for (const cand of shuffled) {
      if (chosen.length >= 2) break;
      if (!chosen.some(c => c.id === cand.id)) {
        chosen.push(cand);
      }
    }
  }

  return chosen.slice(0, 2);
}

// ==========================================
// 1.1 LƯU TRỮ TIẾN ĐỘ VĨNH VIỄN TRÊN IPAD (LOCALSTORAGE)
// ==========================================
const STORAGE_KEY = 'vietnhat_adventure_progress_v1';
// Đổi số này mỗi khi thay đổi lộ trình "Học từ mới" để tiến độ cũ của bé tự về Bài 1 (không bị lệch bài).
const VOCAB_LAYOUT_VERSION = 'v3-curated-198';

function saveProgressToStorage() {
  try {
    // Lưu trạng thái của module hiện tại vào progress tương ứng
    if (state.activeModule === 'vocab') {
      state.vocabProgress.unlockedLessons = [...state.unlockedLessons];
      state.vocabProgress.currentLessonIndex = state.currentLessonIndex;
      state.vocabProgress.carriedOverWords = [...state.carriedOverWords];
    } else {
      state.spellingProgress.unlockedLessons = [...state.unlockedLessons];
      state.spellingProgress.currentLessonIndex = state.currentLessonIndex;
      state.spellingProgress.carriedOverWords = [...state.carriedOverWords];
    }

    const data = {
      activeModule: state.activeModule,
      unlockAllMode: state.unlockAllMode,
      score: state.score,
      vocabLayout: VOCAB_LAYOUT_VERSION,
      vocabProgress: {
        unlockedLessons: state.vocabProgress.unlockedLessons,
        currentLessonIndex: state.vocabProgress.currentLessonIndex,
        carriedOverIds: (state.vocabProgress.carriedOverWords || []).map(w => w.id)
      },
      spellingProgress: {
        unlockedLessons: state.spellingProgress.unlockedLessons,
        currentLessonIndex: state.spellingProgress.currentLessonIndex,
        carriedOverIds: (state.spellingProgress.carriedOverWords || []).map(w => w.id)
      }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage save note:', e);
  }
}

function loadProgressFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.unlockAllMode !== undefined) state.unlockAllMode = data.unlockAllMode;
      if (data.score !== undefined) state.score = data.score;
      if (data.activeModule) state.activeModule = data.activeModule;

      if (data.vocabProgress && data.vocabLayout === VOCAB_LAYOUT_VERSION) {
        state.vocabProgress = {
          unlockedLessons: Array.isArray(data.vocabProgress.unlockedLessons) ? data.vocabProgress.unlockedLessons : [0],
          currentLessonIndex: typeof data.vocabProgress.currentLessonIndex === 'number' ? data.vocabProgress.currentLessonIndex : 0,
          carriedOverWords: []
        };
        state._savedVocabCarriedIds = data.vocabProgress.carriedOverIds || [];
      }
      if (data.spellingProgress) {
        state.spellingProgress = {
          unlockedLessons: Array.isArray(data.spellingProgress.unlockedLessons) ? data.spellingProgress.unlockedLessons : [0],
          currentLessonIndex: typeof data.spellingProgress.currentLessonIndex === 'number' ? data.spellingProgress.currentLessonIndex : 0,
          carriedOverWords: []
        };
        state._savedSpellingCarriedIds = data.spellingProgress.carriedOverIds || [];
      }
    }
  } catch (e) {
    console.warn('Storage load note:', e);
  }
}

// ==========================================
// 2. KHỞI TẠO ỨNG DỤNG & TẢI DỮ LIỆU
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadLibraryData();
});

// Tải dữ liệu từ cả 2 nguồn: Học từ mới (vocabulary_vi_v2.json) và Tập đánh vần (spelling_practice_vi_v1.json)
async function loadLibraryData() {
  loadProgressFromStorage();

  // 1. Tải dữ liệu Học từ mới
  try {
    const resVocab = await fetch('./01-vocabulary/vocabulary_vi_v2.json');
    if (resVocab.ok) {
      const dataVocab = await resVocab.json();
      state.vocabItems = dataVocab.items || [];
    }
  } catch (e) {
    console.warn('Lỗi tải vocab items, dùng dự phòng:', e);
  }

  // 2. Tải dữ liệu Tập đánh vần
  try {
    const resSpelling = await fetch('./01-vocabulary/spelling_practice_vi_v1.json');
    if (resSpelling.ok) {
      const dataSpelling = await resSpelling.json();
      state.spellingItems = dataSpelling.items || [];
    }
  } catch (e) {
    console.warn('Lỗi tải spelling items:', e);
  }

  // 3. Tải map âm thanh các bước đánh vần nếu có
  try {
    const resStepMap = await fetch('./01-vocabulary/spelling_step_audio_map.json');
    if (resStepMap.ok) {
      state.spellingStepAudioMap = await resStepMap.json();
      if (danhVanPlayer && danhVanPlayer.setAudioMap) {
        danhVanPlayer.setAudioMap(state.spellingStepAudioMap);
      }
    }
  } catch (e) {}

  // 3.1 Tải dữ liệu Bảng vần (Rhyme Charts - Phần B)
  try {
    const resRhymeCharts = await fetch('./01-vocabulary/rhyme_charts_vi_v1.json');
    if (resRhymeCharts.ok) {
      const dataRc = await resRhymeCharts.json();
      state.rhymeCharts = dataRc.charts || [];
    }
  } catch (e) {
    console.warn('Lỗi tải dữ liệu rhyme_charts_vi_v1.json:', e);
    state.rhymeCharts = [];
  }

  // Nếu cả hai rỗng, nạp fallback
  if (state.vocabItems.length === 0) {
    loadFallbackData();
    state.vocabItems = [...state.items];
  }

  // Khôi phục từ chuyển tiếp
  if (state._savedVocabCarriedIds && state._savedVocabCarriedIds.length > 0) {
    state.vocabProgress.carriedOverWords = state.vocabItems.filter(x => state._savedVocabCarriedIds.includes(x.id));
  }
  if (state._savedSpellingCarriedIds && state._savedSpellingCarriedIds.length > 0) {
    state.spellingProgress.carriedOverWords = state.spellingItems.filter(x => state._savedSpellingCarriedIds.includes(x.id));
  }

  // Xây dựng lộ trình bài học cho cả 2 nhánh
  buildVocabLessons();
  buildSpellingLessons();

  // Áp dụng module đang chọn
  applyActiveModule(state.activeModule || 'vocab');
}

// Xây dựng lộ trình Học từ mới: các từ đã được xếp sẵn trong vocabulary_vi_v2.json theo 5 nhóm (trường "path_group").
// Muốn đổi thứ tự học: chỉ cần đổi vị trí từ trong file JSON (trong cùng nhóm). Mỗi bài tối đa 10 từ, không trộn nhóm.
function buildVocabLessons() {
  const groupInfo = {
    1: { name: 'Từ 1 tiếng, 2 chữ cái', level: 'Nhóm 1 - Rất dễ' },
    2: { name: 'Từ đôi, mỗi tiếng 2 chữ cái', level: 'Nhóm 2 - Rất dễ' },
    3: { name: 'Từ 1 tiếng, 3 chữ cái', level: 'Nhóm 3 - Dễ' },
    4: { name: 'Từ đôi, mỗi tiếng 2-3 chữ cái', level: 'Nhóm 4 - Vừa' },
    5: { name: 'Từ dài hơn', level: 'Nhóm 5 - Nâng cao' }
  };
  const chunkSize = 10;
  const lessons = [];
  let lessonNum = 1;

  [1, 2, 3, 4, 5].forEach(g => {
    const list = state.vocabItems.filter(x => (x.path_group || 5) === g);
    let i = 0;
    while (i < list.length) {
      let chunk;
      // Nếu phần dư cuối nhóm ít hơn 5 từ thì gom vào bài cuối của nhóm
      if (list.length - (i + chunkSize) > 0 && list.length - (i + chunkSize) < 5) {
        chunk = list.slice(i);
        i = list.length;
      } else {
        chunk = list.slice(i, i + chunkSize);
        i += chunkSize;
      }
      lessons.push({
        id: `lesson-${lessonNum}`,
        lessonIndex: lessonNum - 1,
        title: `Bài ${lessonNum}: ${groupInfo[g].name}`,
        level: groupInfo[g].level,
        items: chunk
      });
      lessonNum++;
    }
  });

  state.vocabLessons = lessons;
}

// Xây dựng lộ trình Tập đánh vần (Function 2 - 7 Bài học theo họ vần)
// Xây dựng lộ trình Tập đánh vần: mỗi bài = 1 âm cuối, ~10 từ đại diện cho các vần khác nhau.
// Từ nào thuộc bài nào do trường "lesson_key" (và thứ tự "path_order") trong spelling_practice_vi_v1.json quyết định.
// Từ có lesson_key = null là kho dự phòng, chưa đưa vào bài. Thứ tự bài = thứ tự trong mảng "groups" dưới đây.
function buildSpellingLessons() {
  const groups = [
    { key: 'p', name: 'Âm cuối P', level: 'Cơ bản - Âm cuối p' },

    { key: 'ch', name: 'Âm cuối CH', level: 'Cơ bản - Âm cuối ch' },

    { key: 'nh', name: 'Âm cuối NH', level: 'Cơ bản - Âm cuối nh' },

    { key: 'u', name: 'Âm cuối U', level: 'Cơ bản - Âm cuối u' },

    { key: 'ng1', name: 'Âm cuối NG (1) - nhóm a, ă, â, e', level: 'Mở rộng - Âm cuối ng' },

    { key: 'ng2', name: 'Âm cuối NG (2) - nhóm o, ô, u, ư', level: 'Mở rộng - Âm cuối ng' },

    { key: 'ng3', name: 'Âm cuối NG (3) - nhóm vần đôi iê, uô, ươ', level: 'Mở rộng - Âm cuối ng' },

    { key: 't', name: 'Âm cuối T', level: 'Mở rộng - Âm cuối t' },

    { key: 'c', name: 'Âm cuối C', level: 'Mở rộng - Âm cuối c' },

    { key: 'm', name: 'Âm cuối M', level: 'Mở rộng - Âm cuối m' },

    { key: 'n', name: 'Âm cuối N', level: 'Mở rộng - Âm cuối n' },

    { key: 'i', name: 'Âm cuối I', level: 'Nâng cao - Âm cuối i' },

    { key: 'y', name: 'Âm cuối Y', level: 'Nâng cao - Âm cuối y' },

    { key: 'o', name: 'Âm cuối O', level: 'Nâng cao - Âm cuối o' }
  ];
  const lessons = [];
  groups.forEach(g => {
    const list = state.spellingItems
      .filter(it => it.lesson_key === g.key)
      .sort((a, b) => (a.path_order || 0) - (b.path_order || 0));
    if (list.length === 0) return;
    const rimesIn = [];
    list.forEach(it => { if (!rimesIn.includes(it.rhyme_family)) rimesIn.push(it.rhyme_family); });
    const rimeText = rimesIn.length > 6 ? rimesIn.slice(0, 6).join(', ') + '...' : rimesIn.join(', ');
    const num = lessons.length + 1;
    lessons.push({
      id: `spel-${num}`,
      lessonIndex: num - 1,
      title: `Bài ${num}: ${g.name} - Vần ${rimeText}`,
      level: g.level,
      rimes: rimesIn,
      items: list
    });
  });
  state.spellingLessons = lessons;
}

// Áp dụng dữ liệu của module đang kích hoạt
function applyActiveModule(mod) {
  state.activeModule = mod;
  if (mod === 'spelling') {
    state.items = state.spellingItems;
    state.lessons = state.spellingLessons;
    state.unlockedLessons = state.spellingProgress.unlockedLessons || [0];
    state.currentLessonIndex = Math.min(state.spellingProgress.currentLessonIndex || 0, Math.max(0, state.lessons.length - 1));
    state.carriedOverWords = state.spellingProgress.carriedOverWords || [];
  } else {
    state.items = state.vocabItems;
    state.lessons = state.vocabLessons;
    state.unlockedLessons = state.vocabProgress.unlockedLessons || [0];
    state.currentLessonIndex = Math.min(state.vocabProgress.currentLessonIndex || 0, Math.max(0, state.lessons.length - 1));
    state.carriedOverWords = state.vocabProgress.carriedOverWords || [];
  }

  updateHeaderUI();
  renderLessonTabs();
  renderIslandMap();
}

// Chuyển đổi giữa 2 chức năng: Học từ mới ⟷ Tập đánh vần
function switchModule(mod) {
  if (state.activeModule === mod && state.lessons.length > 0) return;
  saveProgressToStorage();
  applyActiveModule(mod);
  switchView('view-map');
  showToast(mod === 'spelling'
    ? 'Đã chuyển sang: 🔤 TẬP ĐÁNH VẦN!'
    : 'Đã chuyển sang: 📖 HỌC TỪ MỚI!');
}

function updateHeaderUI() {
  const brandName = document.getElementById('app-brand-name');
  if (brandName) {
    brandName.textContent = state.activeModule === 'spelling' ? 'Tập đánh vần' : 'Học từ mới';
  }
  const tabVocab = document.getElementById('btn-tab-vocab');
  const tabSpelling = document.getElementById('btn-tab-spelling');
  if (tabVocab && tabSpelling) {
    if (state.activeModule === 'spelling') {
      tabVocab.classList.remove('active');
      tabSpelling.classList.add('active');
    } else {
      tabVocab.classList.add('active');
      tabSpelling.classList.remove('active');
    }
  }
}

// Render các nút chọn bài học (Lesson tabs với trạng thái mở khóa)
function renderLessonTabs() {
  const container = document.getElementById('lesson-tabs');
  if (!container) return;
  container.innerHTML = '';

  state.lessons.forEach((l, idx) => {
    const isUnlocked = state.unlockAllMode || state.unlockedLessons.includes(idx);
    const btn = document.createElement('button');
    btn.className = `lesson-tab-btn ${idx === state.currentLessonIndex ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`;
    
    if (isUnlocked) {
      btn.textContent = `Bài ${idx + 1} (${l.items.length} từ)`;
    } else {
      btn.innerHTML = `🔒 Bài ${idx + 1}`;
    }

    btn.addEventListener('click', () => {
      if (!isUnlocked) {
        showToast(`🔒 Bé Mây hãy đạt từ 8/10 điểm ở Bài ${idx} để mở khóa Bài ${idx + 1} nhé!`);
        return;
      }
      state.currentLessonIndex = idx;
      saveProgressToStorage();
      renderLessonTabs();
      renderIslandMap();
    });
    container.appendChild(btn);
  });

  const curLesson = state.lessons[state.currentLessonIndex];
  if (curLesson) {
    document.getElementById('current-lesson-title').textContent = `${curLesson.title} — ${curLesson.level}`;
    const mapBtnText = document.getElementById('map-challenge-btn-text');
    if (mapBtnText) {
      mapBtnText.textContent = `Thử thách ghép hình Bài ${state.currentLessonIndex + 1} (10 câu)`;
    }
  }

  // Cập nhật giao diện nút Bật/Tắt chế độ tự do chọn bài
  const btnToggle = document.getElementById('btn-toggle-unlock-all');
  if (btnToggle) {
    if (state.unlockAllMode) {
      btnToggle.className = 'btn-mode-toggle active';
      const icon = document.getElementById('mode-toggle-icon');
      const label = document.getElementById('mode-toggle-label');
      if (icon) icon.textContent = '🔓';
      if (label) label.textContent = 'Tự do chọn bài: BẬT';
    } else {
      btnToggle.className = 'btn-mode-toggle';
      const icon = document.getElementById('mode-toggle-icon');
      const label = document.getElementById('mode-toggle-label');
      if (icon) icon.textContent = '🔒';
      if (label) label.textContent = 'Mở khóa từng bài';
    }
  }
}

// Thiết lập các sự kiện giao diện
function setupEventListeners() {
  // 1. Mở khóa âm thanh trên iPad Safari & Chọn chức năng
  const btnStartVocab = document.getElementById('btn-start-vocab');
  if (btnStartVocab) {
    btnStartVocab.addEventListener('click', () => unlockAudioAndStart('vocab'));
    btnStartVocab.addEventListener('touchstart', () => unlockAudioAndStart('vocab'), { passive: true });
  }

  const btnStartSpelling = document.getElementById('btn-start-spelling');
  if (btnStartSpelling) {
    btnStartSpelling.addEventListener('click', () => unlockAudioAndStart('spelling'));
    btnStartSpelling.addEventListener('touchstart', () => unlockAudioAndStart('spelling'), { passive: true });
  }

  const btnStart = document.getElementById('btn-start');
  if (btnStart) {
    btnStart.addEventListener('click', () => unlockAudioAndStart('vocab'));
    btnStart.addEventListener('touchstart', () => unlockAudioAndStart('vocab'), { passive: true });
  }

  // 1.1 Chuyển đổi Module trên Header & Trang chủ
  document.getElementById('btn-tab-vocab')?.addEventListener('click', () => switchModule('vocab'));
  document.getElementById('btn-tab-spelling')?.addEventListener('click', () => switchModule('spelling'));
  document.getElementById('btn-home')?.addEventListener('click', () => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.style.display = 'flex';
      splash.classList.remove('hidden');
    }
  });

  // 1.2 Bật/Tắt chế độ tự do chọn bài học & Đặt lại tiến độ
  document.getElementById('btn-toggle-unlock-all')?.addEventListener('click', () => {
    state.unlockAllMode = !state.unlockAllMode;
    saveProgressToStorage();
    renderLessonTabs();
    showToast(state.unlockAllMode
      ? 'Đã BẬT: Bé Mây có thể tự do chọn bất kỳ bài học nào! 🔓'
      : 'Đã BẬT: Chế độ học theo lộ trình (đạt 8/10 để qua bài) 🔒');
  });

  document.getElementById('btn-reset-progress')?.addEventListener('click', () => {
    state.unlockedLessons = [0];
    state.currentLessonIndex = 0;
    state.score = 0;
    state.carriedOverWords = [];
    saveProgressToStorage();
    renderLessonTabs();
    renderIslandMap();
    showToast('Đã đặt lại tiến độ học tập từ Bài 1! 🌟');
  });

  // 2. Điều hướng Header
  document.getElementById('btn-back')?.addEventListener('click', () => {
    const chartView = document.getElementById('view-rhyme-chart');
    if (chartView && !chartView.classList.contains('hidden')) {
      switchView('view-station');
    } else {
      switchView('view-map');
    }
  });
  document.getElementById('btn-sound-toggle')?.addEventListener('click', toggleSound);
  document.getElementById('btn-speed-toggle')?.addEventListener('click', toggleSpeed);

  // 3. Chuyển đổi ngôn ngữ
  document.getElementById('lang-vi')?.addEventListener('click', () => {
    showToast('Đang chọn: Tiếng Việt 🇻🇳');
  });
  document.getElementById('lang-ja')?.addEventListener('click', () => {
    showToast('🇯🇵 Phần tiếng Nhật sẽ có trong giai đoạn mở rộng tiếp theo!');
  });

  // 4. Trạm học từ vựng
  document.getElementById('btn-play-full')?.addEventListener('click', () => {
    if (state.currentWord) {
      playWordWithHint(state.currentWord);
    }
  });

  // 5. NÚT ĐÁNH VẦN DUY NHẤT (Không hiển thị các bước chữ rườm rà)
  document.getElementById('btn-play-all-steps')?.addEventListener('click', playAllPhonicsSteps);

  // 5.1 Nút phát âm vần & mở Bảng vần (PHẦN A & B)
  document.getElementById('btn-play-rhyme')?.addEventListener('click', () => {
    if (state.currentWord) playRhymeSequence(state.currentWord);
  });
  document.getElementById('btn-open-rhyme-chart')?.addEventListener('click', () => {
    if (state.currentWord) {
      const rime = state.currentWord.phonics?.rime?.written || state.currentWord.rhyme_family;
      openRhymeChart(rime);
    }
  });
  document.getElementById('chart-big-rhyme-btn')?.addEventListener('click', () => {
    if (state.currentWord) playRhymeSequence(state.currentWord);
  });
  document.getElementById('btn-back-from-chart')?.addEventListener('click', () => {
    switchView('view-station');
  });

  // Phím Esc quay lại thẻ từ khi đang ở Bảng vần
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const chartView = document.getElementById('view-rhyme-chart');
      if (chartView && !chartView.classList.contains('hidden')) {
        switchView('view-station');
      }
    }
  });

  document.getElementById('btn-play-example')?.addEventListener('click', () => {
    if (state.currentWord && state.currentWord.example_vi) {
      playAudioSrc(getDialectAudio(state.currentWord, 'example'), state.currentWord.example_vi);
    }
  });

  document.getElementById('btn-prev-word')?.addEventListener('click', prevWord);
  document.getElementById('btn-next-word')?.addEventListener('click', nextWord);

  // 6. Mini Game Thử Thách Nhìn Chữ Chọn Hình (10 từ theo bài học)
  document.getElementById('btn-launch-game')?.addEventListener('click', () => startLessonChallenge(state.currentLessonIndex));
  document.getElementById('btn-map-start-quiz')?.addEventListener('click', () => startLessonChallenge(state.currentLessonIndex));
  document.getElementById('btn-exit-game')?.addEventListener('click', () => switchView('view-station'));
  document.getElementById('btn-quiz-listen')?.addEventListener('click', () => {
    if (state.quizRound) {
      const curItem = state.quizRound.questions[state.quizRound.currentIndex];
      if (curItem) {
        playAudioSrc(getDialectAudio(curItem, 'word'), curItem.word);
      }
    }
  });
  document.getElementById('btn-next-quiz')?.addEventListener('click', nextQuizQuestion);
}

// Mở khóa AudioContext trên iPad Safari & Kích hoạt module
function unlockAudioAndStart(moduleToStart = 'vocab') {
  state.audioUnlocked = true;
  
  // Mở khóa Web Audio API trên iPad Safari (bọc try-catch an toàn tuyệt đối)
  try {
    getAudioContext();
  } catch (e) {
    console.warn('AudioContext init note:', e);
  }

  // Phát âm thanh câm để giải phóng AudioContext trên WebKit Safari
  try {
    if ('speechSynthesis' in window) {
      const silent = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(silent);
    }
  } catch (e) {
    console.warn('SpeechSynthesis note:', e);
  }

  // Ẩn màn hình Splash
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.classList.add('hidden');
    setTimeout(() => {
      splash.style.display = 'none';
    }, 450);
  }

  if (moduleToStart) {
    applyActiveModule(moduleToStart);
  }
  switchView('view-map');
  const greeting = state.activeModule === 'spelling'
    ? 'Chào mừng Bé Mây đến với Phòng Tập Đánh Vần! 🔤'
    : 'Chào mừng Bé Mây đến với Đảo Học Từ Mới! 🌟';
  showToast(greeting);
}

// ==========================================
// 3. RENDER BẢN ĐỒ THÁM HIỂM (ISLAND MAP THEO BÀI HỌC)
// ==========================================
function renderIslandMap() {
  const container = document.getElementById('island-grid');
  if (!container) return;
  container.innerHTML = '';

  const currentLesson = state.lessons[state.currentLessonIndex];
  const itemsToRender = currentLesson ? currentLesson.items : state.items.slice(0, 10);

  if (!itemsToRender || itemsToRender.length === 0) {
    container.innerHTML = '<p class="map-intro">Chưa có từ nào trong bài học này.</p>';
    return;
  }

  itemsToRender.forEach(item => {
    const isConfirmed = item.phonics && item.phonics.status === 'user_confirmed';
    const card = document.createElement('div');
    card.className = `island-node ${isConfirmed || state.activeModule === 'spelling' ? 'confirmed' : ''}`;
    
    const pic = getPictureDataForWord(item.word);
    const icon = pic.emoji || '🌿';
    let statusText = isConfirmed ? 'Chơi ngay' : 'Đang duyệt';
    let badgeClass = isConfirmed ? 'ready' : 'pending';

    if (state.activeModule === 'spelling') {
      statusText = `Vần -${item.rhyme_family || ''}`;
      badgeClass = 'ready';
    }

    card.innerHTML = `
      <div class="node-icon">${icon}</div>
      <div class="node-word">${item.word}</div>
      <span class="node-badge ${badgeClass}">${statusText}</span>
    `;

    card.addEventListener('click', () => openWordStation(item));
    container.appendChild(card);
  });
}

function openWordStation(item) {
  state.currentWord = item;
  state.currentWordIndex = state.items.findIndex(x => x.id === item.id);

  // Dừng âm thanh trước đó và hiển thị chuỗi đánh vần (R3)
  const player = getDanhVanPlayer();
  if (player) player.stop();
  renderSpellingSequence(item.word);
  updateRhymeBox(item);

  // Cập nhật thông tin giao diện
  document.getElementById('word-display').textContent = item.word;
  const hint = getWordHint(item);
  const meaningText = hint || item.meaning_vi_child || item.meaning_vi || 'Chờ cập nhật nghĩa';
  document.getElementById('word-meaning').textContent = meaningText;
  document.getElementById('word-topic').textContent = item.topic || 'khám phá';
  document.getElementById('example-text').textContent = `"${item.example_vi || 'Đang cập nhật ví dụ'}"`;
  
  const pic = getPictureDataForWord(item.word);
  document.getElementById('word-emoji').textContent = pic.emoji || '📖';
  
  // Cập nhật hình ảnh minh họa cho câu ví dụ
  const exEmoji = document.getElementById('example-emoji');
  if (exEmoji) {
    exEmoji.textContent = exampleIllustrationMap[item.word] || '🌟';
  }

  const isConfirmed = item.phonics && item.phonics.status === 'user_confirmed';
  const badge = document.getElementById('phonics-badge');
  if (badge) {
    if (state.activeModule === 'spelling') {
      badge.textContent = `🔤 Vần -${item.rhyme_family || ''} (Âm cuối -${item.phonics?.rime?.final || ''})`;
      badge.className = 'badge-status ready';
      badge.style.background = '#fdf4ff';
      badge.style.color = '#a21caf';
    } else if (isConfirmed) {
      badge.textContent = '🌟 Đã kiểm duyệt';
      badge.className = 'badge-status ready';
      badge.style.background = '#dcfce7';
      badge.style.color = '#15803d';
    } else {
      badge.textContent = '⏳ Đang chờ thẩm định giáo viên';
      badge.className = 'badge-status';
      badge.style.background = '#fef3c7';
      badge.style.color = '#92400e';
    }
  }

  // Chuyển sang View Station
  switchView('view-station');

  // Đọc từ chào mừng bằng file thu âm chuẩn của giọng đang chọn
  setTimeout(() => {
    playWordWithHint(item);
  }, 300);
}

// Cụm gợi nghĩa (vd: "na" -> "quả na"). Chỉ dùng ở "Học từ mới", chỉ khi khác chính từ đó.
function getWordHint(item) {
  if (state.activeModule === 'spelling' || !item) return '';
  const h = (item.cum_tu_goi_nghia || '').trim();
  return h && h.toLowerCase() !== item.word.toLowerCase() ? h : '';
}

// Đọc từ trước, sau đó đọc cụm gợi nghĩa (nếu có): "na" ... "quả na"
async function playWordWithHint(item) {
  await playAudioSrc(getDialectAudio(item, 'word'), item.word);
  const hint = getWordHint(item);
  if (hint && state.currentWord && state.currentWord.id === item.id) {
    await playAudioSrc(null, hint);
  }
}

// PHÁT ÂM THANH ĐÁNH VẦN DÙNG CHUNG DUY NHẤT (R3)
async function playAllPhonicsSteps() {
  if (!state.currentWord) return;
  const word = state.currentWord.word;
  const btn = document.getElementById('btn-play-all-steps');

  // Đảm bảo dừng mọi âm thanh trước đó
  const player = getDanhVanPlayer();
  if (player) player.stop();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  if (chartAudio) {
    chartAudio.pause();
    chartAudio.currentTime = 0;
    chartAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  // A4. Nếu ở chế độ "Tập đánh vần": chỉ đọc PHẦN TỪ và làm sáng chip phần từ tương ứng
  if (state.activeModule === 'spelling') {
    if (typeof DanhVanSpeech !== 'undefined' && DanhVanSpeech.planWord) {
      try {
        const plan = DanhVanSpeech.planWord(word);
        const { wordTokens } = splitSpellingTokens(state.currentWord, plan);
        await playTokenList(wordTokens, '#spelling-seq', btn);
      } catch (e) {
        console.warn('playAllPhonicsSteps spelling error:', e);
      }
    }
    return;
  }

  // Ở chế độ "Học từ mới": giữ nguyên cách hoạt động cũ
  if (btn) btn.classList.add('playing');
  try {
    if (player) {
      await player.say(word);
    }
  } finally {
    if (btn) btn.classList.remove('playing');
    const tokens = document.querySelectorAll('#spelling-seq .sp-token');
    tokens.forEach((el) => el.classList.remove('active'));
  }
}

function prevWord() {
  const currentLesson = state.lessons[state.currentLessonIndex];
  const list = currentLesson ? currentLesson.items : state.items;
  const idx = list.findIndex(x => x.id === state.currentWord?.id);
  if (idx > 0) {
    openWordStation(list[idx - 1]);
  } else {
    showToast('Đây là từ đầu tiên của bài học!');
  }
}

function nextWord() {
  const currentLesson = state.lessons[state.currentLessonIndex];
  const list = currentLesson ? currentLesson.items : state.items;
  const idx = list.findIndex(x => x.id === state.currentWord?.id);
  if (idx >= 0 && idx < list.length - 1) {
    openWordStation(list[idx + 1]);
  } else {
    showToast('Bé Mây đã xem hết các từ trong bài học này! 🎉');
  }
}

// ==========================================
// 5. THỬ THÁCH NHÌN CHỮ CHỌN HÌNH (10 TỪ/BÀI, ĐẠT 8/10 MỚI MỞ KHÓA)
// ==========================================

// Bắt đầu vòng thử thách 10-12 câu cho Bài học đang chọn
function startLessonChallenge(lessonIndex) {
  state.currentLessonIndex = lessonIndex;
  const currentLesson = state.lessons[lessonIndex];
  if (!currentLesson) return;

  // 1. Lấy các từ chuyển tiếp từ bài trước (tối đa 2 từ)
  const carried = [...state.carriedOverWords];

  // 2. Lấy toàn bộ 10 từ trong bài học hiện tại (loại trừ từ đã có trong carried)
  const lessonItems = currentLesson.items.filter(item => !carried.some(c => c.id === item.id));

  // 3. Kết hợp: 10 từ của bài hiện tại + tối đa 2 từ carried = 10 đến 12 câu!
  // Đảm bảo các đáp án hình ảnh được xào nấu trong cùng nhóm 10-12 từ này
  const quizQuestions = [...carried, ...lessonItems];

  // Khởi tạo trạng thái vòng thử thách
  state.quizRound = {
    lessonIndex: lessonIndex,
    questions: quizQuestions,
    currentIndex: 0,
    score: 0,
    missedWords: [], // Danh sách các từ bé làm sai ở vòng này
    firstAttempt: true,
    carriedIds: carried.map(c => c.id) // Để hiển thị badge "Ôn lại"
  };

  switchView('view-game');
  loadQuizQuestionByIndex(0);
}

// Nạp câu hỏi theo chỉ mục trong vòng 10-12 câu
function loadQuizQuestionByIndex(index) {
  const round = state.quizRound;
  if (!round || index >= round.questions.length) return;

  const targetItem = round.questions[index];
  const word = targetItem.word;
  round.firstAttempt = true;

  // Cập nhật tiến độ & điểm
  document.getElementById('quiz-progress').textContent = `${index + 1}/${round.questions.length}`;
  document.getElementById('game-score').textContent = round.score;
  document.getElementById('quiz-word-display').textContent = word;

  // Hiển thị huy hiệu "Ôn lại từ cũ" nếu từ này chuyển tiếp từ bài trước
  const badgeCarry = document.getElementById('quiz-carryover-badge');
  if (badgeCarry) {
    if (round.carriedIds.includes(targetItem.id)) {
      badgeCarry.classList.remove('hidden');
    } else {
      badgeCarry.classList.add('hidden');
    }
  }

  // Reset feedback & nút tiếp theo
  const feedback = document.getElementById('quiz-feedback');
  feedback.className = 'quiz-feedback hidden';
  feedback.innerHTML = '';
  document.getElementById('btn-next-quiz').classList.add('hidden');

  // Lấy các đáp án gây nhiễu TUYỆT ĐỐI CHỈ TỪ các từ trong bài học hiện tại (10-12 từ)
  // và đa dạng hóa nhóm phân loại (Quả Na -> Con Chó, Cái Bàn; Chim Tu Hú -> Con Bò, Chiếc Lá)
  const distractors = selectDistractorsForWord(targetItem, round.questions);

  const targetPic = getPictureDataForWord(word);
  const options = [
    { word: word, emoji: targetPic.emoji, label: targetPic.label, isCorrect: true },
    ...distractors.map(d => {
      const p = getPictureDataForWord(d.word);
      return { word: d.word, emoji: p.emoji, label: p.label, isCorrect: false };
    })
  ];

  // Xáo trộn vị trí các thẻ hình
  const shuffledOptions = options.sort(() => Math.random() - 0.5);

  const container = document.getElementById('picture-options-grid');
  container.innerHTML = '';

  shuffledOptions.forEach(opt => {
    const card = document.createElement('div');
    card.className = 'picture-card';
    card.innerHTML = `
      <span class="pic-emoji">${opt.emoji}</span>
      <span class="pic-label">${opt.label}</span>
    `;

    card.addEventListener('click', () => handlePictureSelect(card, opt));
    container.appendChild(card);
  });
}

// Xử lý khi bé chạm chọn hình
function handlePictureSelect(cardElement, option) {
  const round = state.quizRound;
  if (!round) return;

  const currentItem = round.questions[round.currentIndex];
  const feedback = document.getElementById('quiz-feedback');
  feedback.classList.remove('hidden');

  if (option.isCorrect) {
    // Bé chọn ĐÚNG!
    cardElement.classList.add('correct');

    if (round.firstAttempt) {
      round.score++;
      document.getElementById('game-score').textContent = round.score;
    }

    // 1. Âm thanh chuông reo chiến thắng vui nhộn
    playChimeSound('correct');

    // 2. Bắn pháo hoa rực rỡ
    triggerFireworks();

    // 3. Phát giọng người thật khen ngợi ĐỒNG NHẤT 100% VỚI CHỮ HIỂN THỊ
    const praiseItem = PRAISE_ITEMS[Math.floor(Math.random() * PRAISE_ITEMS.length)];
    playAudioSrc(praiseItem.audio, praiseItem.text);

    // Lời khen ngợi hiển thị đồng nhất
    feedback.className = 'quiz-feedback success';
    feedback.innerHTML = `🎉 ${praiseItem.display} Chữ <b>"${option.word}"</b> chính là <b>${option.label}</b>!`;

    // Khóa click tạm thời
    document.querySelectorAll('.picture-card').forEach(c => c.style.pointerEvents = 'none');

    // Hiện nút tiếp theo
    document.getElementById('btn-next-quiz').classList.remove('hidden');
  } else {
    // Bé chọn SAI!
    cardElement.classList.add('wrong');

    // Ghi nhận từ này bị làm sai ở lần đầu
    if (round.firstAttempt) {
      if (!round.missedWords.some(w => w.id === currentItem.id)) {
        round.missedWords.push(currentItem);
      }
      round.firstAttempt = false;
    }

    // 1. ÂM THANH "BÀ BƯ BƯ" HÀI HƯỚC
    playWrongBuzzer();

    // 2. HIỂN THỊ DẤU X MÀU ĐỎ RỒI MỜ BIẾN MẤT
    showWrongXMark();

    // 3. Phát giọng người thật động viên ĐỒNG NHẤT 100% VỚI CHỮ HIỂN THỊ
    const encourageItem = ENCOURAGE_ITEMS[Math.floor(Math.random() * ENCOURAGE_ITEMS.length)];
    setTimeout(() => {
      playAudioSrc(encourageItem.audio, encourageItem.text);
    }, 450);

    // Lời khích lệ hiển thị đồng nhất
    feedback.className = 'quiz-feedback error';
    feedback.innerHTML = `💡 ${encourageItem.display} Đây là <b>${option.label}</b>. Bé Mây nhìn kỹ chữ lại nhé!`;

    setTimeout(() => {
      cardElement.classList.remove('wrong');
    }, 600);
  }
}

// Chuyển sang câu hỏi tiếp theo hoặc tổng kết vòng
function nextQuizQuestion() {
  document.querySelectorAll('.picture-card').forEach(c => c.style.pointerEvents = 'auto');
  const round = state.quizRound;
  if (!round) return;

  round.currentIndex++;
  if (round.currentIndex < round.questions.length) {
    loadQuizQuestionByIndex(round.currentIndex);
  } else {
    // Hoàn thành cả 10 câu -> Hiện bảng tổng kết
    finishQuizRound();
  }
}

// Hiển thị bảng tổng kết vòng thử thách (Yêu cầu đạt 80% câu đúng để mở khóa bài tiếp theo)
function finishQuizRound() {
  const round = state.quizRound;
  const total = round.questions.length;
  const passingScore = Math.ceil(total * 0.8);
  const isPassed = round.score >= passingScore;
  const modal = document.getElementById('quiz-summary-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  const nextLessonIdx = round.lessonIndex + 1;

  if (isPassed) {
    // VƯỢT QUA BÀI HỌC!
    if (!state.unlockedLessons.includes(nextLessonIdx) && nextLessonIdx < state.lessons.length) {
      state.unlockedLessons.push(nextLessonIdx);
      renderLessonTabs();
    }
    saveProgressToStorage();

    // Chuyển tối đa 2 từ làm sai sang bài sau để ôn tập
    state.carriedOverWords = round.missedWords.slice(0, 2);

    triggerFireworks();
    playChimeSound('correct');

    let carryMsg = '';
    if (state.carriedOverWords.length > 0) {
      const wordsStr = state.carriedOverWords.map(w => `<b>"${w.word}"</b>`).join(', ');
      carryMsg = `<div class="carry-notice">📌 Các từ ${wordsStr} Bé Mây sẽ được gặp lại để ôn tập ở bài tiếp theo nhé!</div>`;
    }

    modal.innerHTML = `
      <div class="summary-card victory">
        <div class="summary-icon">🏆 🌟 🎓</div>
        <h2>XUẤT SẮC QUÁ BÉ MÂY ƠI!</h2>
        <p class="summary-score">Bé Mây đạt <b>${round.score}/${total}</b> câu đúng!</p>
        <p class="summary-desc">Bé Mây đã hoàn thành xuất sắc và mở khóa <b>Bài ${nextLessonIdx + 1}</b>!</p>
        ${carryMsg}
        <div class="summary-actions">
          ${nextLessonIdx < state.lessons.length ? `
            <button id="btn-modal-next-lesson" class="btn-hero pulse">
              🚀 Khám phá Bài ${nextLessonIdx + 1} ngay
            </button>
          ` : ''}
          <button id="btn-modal-replay" class="btn-secondary">
            🔄 Chơi lại bài này
          </button>
          <button id="btn-modal-map" class="btn-secondary">
            🗺️ Về bản đồ
          </button>
        </div>
      </div>
    `;

    speakVoiceText(`Xuất sắc quá Bé Mây ơi! Bé Mây đạt ${round.score} trên ${total} câu đúng và mở khóa bài tiếp theo!`);
  } else {
    // CHƯA ĐẠT ĐIỂM YÊU CẦU
    playWrongBuzzer();

    modal.innerHTML = `
      <div class="summary-card retry">
        <div class="summary-icon">💪 🐣 🌈</div>
        <h2>CỐ LÊN BÉ MÂY YÊU!</h2>
        <p class="summary-score">Bé Mây đạt <b>${round.score}/${total}</b> câu đúng.</p>
        <p class="summary-desc">Bé Mây cần đạt ít nhất <b>${passingScore}/${total}</b> câu đúng để mở khóa Bài tiếp theo. Bé Mây hãy thử lại nhé!</p>
        <div class="summary-actions">
          <button id="btn-modal-retry" class="btn-hero">
            🔄 Thử lại ngay nào!
          </button>
          <button id="btn-modal-map" class="btn-secondary">
            🗺️ Về bản đồ
          </button>
        </div>
      </div>
    `;

    speakVoiceText(`Bé Mây đạt ${round.score} trên ${total} điểm. Bé Mây thử lại để đạt từ ${passingScore} điểm trở lên nhé!`);
  }

  // Gắn sự kiện cho các nút điều hướng trong modal
  setTimeout(() => {
    document.getElementById('btn-modal-next-lesson')?.addEventListener('click', () => {
      modal.classList.add('hidden');
      state.currentLessonIndex = nextLessonIdx;
      renderLessonTabs();
      renderIslandMap();
      switchView('view-map');
    });

    const btnRetry = document.getElementById('btn-modal-retry') || document.getElementById('btn-modal-replay');
    btnRetry?.addEventListener('click', () => {
      modal.classList.add('hidden');
      startLessonChallenge(round.lessonIndex);
    });

    document.getElementById('btn-modal-map')?.addEventListener('click', () => {
      modal.classList.add('hidden');
      switchView('view-map');
    });
  }, 100);
}

// Hiển thị dấu X màu đỏ nổi bật rồi mờ biến mất
function showWrongXMark() {
  const x = document.getElementById('wrong-x-mark');
  if (!x) return;
  x.classList.add('show');
  setTimeout(() => {
    x.classList.remove('show');
  }, 850);
}

// ==========================================
// 6. XỬ LÝ ÂM THANH: PHÁT AUDIO FILE CHUẨN & DỰ PHÒNG TTS
// ==========================================
let currentAudio = null;
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Phát âm thanh chuông reo (Đúng)
function playChimeSound(type) {
  if (!state.soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (type === 'correct') {
    // Hợp âm chiến thắng rộn rã: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.5);
    });
  }
}

// ÂM THANH "BÀ BƯ BƯ" HÀI HƯỚC KHI BÉ LÀM SAI (3 nốt trầm giảm dần)
function playWrongBuzzer() {
  if (!state.soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [
    { freq: 240, start: 0.0, dur: 0.22, vol: 0.2 },   // "bà"
    { freq: 190, start: 0.24, dur: 0.22, vol: 0.22 }, // "bư"
    { freq: 140, start: 0.48, dur: 0.38, vol: 0.25 }  // "bư" trầm ngân
  ];

  notes.forEach(n => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.start);
    osc.frequency.exponentialRampToValueAtTime(n.freq * 0.9, ctx.currentTime + n.start + n.dur);

    gain.gain.setValueAtTime(0, ctx.currentTime + n.start);
    gain.gain.linearRampToValueAtTime(n.vol, ctx.currentTime + n.start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.start + n.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + n.start);
    osc.stop(ctx.currentTime + n.start + n.dur + 0.05);
  });
}

// Đọc lời khen ngợi hoặc động viên bằng giọng nói
function speakVoiceText(text) {
  if (!state.soundEnabled || !text) return;
  try {
    const clean = text.replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(clean)}`;
    const audio = new Audio(url);
    currentAudio = audio;
    audio.play().catch(() => {});
  } catch (e) {
    console.warn('speakVoiceText note:', e);
  }
}

// Phát file âm thanh đã thu âm hoặc truyền phát Google Translate TTS chuẩn tiếng Việt
function playAudioSrc(audioSrc, fallbackText, rate = 1.0) {
  return new Promise((resolve) => {
    if (!state.soundEnabled) return resolve();

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    if (audioSrc) {
      const audio = new Audio(audioSrc);
      currentAudio = audio;
      audio.playbackRate = rate;

      audio.onended = () => resolve();
      audio.onerror = () => {
        fallbackSpeech(fallbackText, resolve);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          fallbackSpeech(fallbackText, resolve);
        });
      }
    } else {
      fallbackSpeech(fallbackText, resolve);
    }
  });
}

// Phát âm tiếng Việt chuẩn giọng Bắc (Hà Nội)
function fallbackSpeech(text, resolve) {
  if (!text || !state.soundEnabled) return resolve();

  // 1. Thử dùng Web Speech API với giọng Hà Nội nếu có
  if ('speechSynthesis' in window) {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices ? synth.getVoices() : [];
    const northVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('vi') && /(HoaiMy|NamMinh|Hanoi|North)/i.test(v.name));
    const viVoice = northVoice || voices.find(v => v.lang && v.lang.toLowerCase().startsWith('vi'));
    if (viVoice) {
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.voice = viVoice;
        u.lang = viVoice.lang || 'vi-VN';
        u.rate = state.speechRate || 1.15;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        synth.speak(u);
        return;
      } catch (e) {}
    }
  }

  // 2. Fallback stream
  try {
    const clean = text.replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(clean)}`;
    const audio = new Audio(url);
    currentAudio = audio;
    audio.playbackRate = state.speechRate || 1.15;
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    const p = audio.play();
    if (p !== undefined) {
      p.catch(() => resolve());
    }
  } catch (e) {
    resolve();
  }
}

// Lấy đường dẫn âm thanh tương ứng với giọng đang chọn (Bắc / Nam)
function getDialectAudio(item, type, stepIndex = 0, stepText = null) {
  if (!item) return null;

  if (type === 'step') {
    if (stepText && state.spellingStepAudioMap && state.spellingStepAudioMap[stepText]) {
      return state.spellingStepAudioMap[stepText];
    }
    const seq = item.phonics?.sequence || [];
    const textAtIdx = stepText || seq[stepIndex];
    if (textAtIdx && state.spellingStepAudioMap && state.spellingStepAudioMap[textAtIdx]) {
      return state.spellingStepAudioMap[textAtIdx];
    }
  }

  // Xử lý riêng cho Function 2: Tập đánh vần
  if (state.activeModule === 'spelling') {
    if (type === 'word') {
      return item.audio?.word_full || (item.id ? `06-assets/audio/spelling/words/${item.id}.mp3` : null);
    }
    if (type === 'example') {
      return item.audio?.example_sentence || null;
    }
    if (type === 'step') {
      return null;
    }
  }

  // Function 1: Học từ mới
  if (!item.audio) return null;

  const dialects = item.audio.dialects;
  if (dialects && dialects[state.currentDialect]) {
    const dialectData = dialects[state.currentDialect];
    if (type === 'word') return dialectData.word_full || null;
    if (type === 'example') return dialectData.example_sentence || null;
    if (type === 'step') {
      return (dialectData.phonics_steps && dialectData.phonics_steps[stepIndex]) || null;
    }
  }

  // Fallback cấu trúc cũ
  if (type === 'word') return item.audio.word_full || null;
  if (type === 'example') return item.audio.example_sentence || null;
  if (type === 'step') {
    return (item.audio.phonics_steps && item.audio.phonics_steps[stepIndex]) || null;
  }

  return null;
}

function toggleDialect() {
  state.currentDialect = state.currentDialect === 'north' ? 'south' : 'north';
  const label = document.getElementById('dialect-label');
  if (state.currentDialect === 'north') {
    label.textContent = 'Miền Bắc';
    showToast('Đã chuyển sang giọng đọc: Miền Bắc (Hà Nội) 🏙️');
  } else {
    label.textContent = 'Miền Nam';
    showToast('Đã chuyển sang giọng đọc: Miền Nam (Sài Gòn) 🌴');
  }
}

// Bật/tắt toàn bộ âm thanh
function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  const icon = document.getElementById('sound-icon');
  if (state.soundEnabled) {
    icon.textContent = '🔊';
    showToast('Âm thanh: Đã BẬT 🔊');
  } else {
    icon.textContent = '🔇';
    if (currentAudio) currentAudio.pause();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    showToast('Âm thanh: Đã TẮT 🔇');
  }
}

// Chuyển đổi tốc độ đọc
function toggleSpeed() {
  const label = document.getElementById('speed-label');
  if (state.speechRate <= 1.0) {
    state.speechRate = 1.15;
    label.textContent = 'Chuẩn';
    showToast('Tốc độ đọc: Chuẩn dứt khoát 🌟');
  } else if (state.speechRate <= 1.15) {
    state.speechRate = 1.35;
    label.textContent = 'Nhanh';
    showToast('Tốc độ đọc: Nhanh sôi động 🚀');
  } else {
    state.speechRate = 0.95;
    label.textContent = 'Chậm';
    showToast('Tốc độ đọc: Chậm rõ ràng 🐢');
  }
  const player = getDanhVanPlayer();
  if (player && player.setRate) {
    player.setRate(state.speechRate);
  }
}

// ==========================================
// 7. HIỆU ỨNG PHÁO HOA KHI LÀM ĐÚNG
// ==========================================
let fireworksParticles = [];
let fireworksAnimationId = null;

function triggerFireworks() {
  const canvas = document.getElementById('fireworks-canvas');
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.add('active');

  const originX = canvas.width / 2;
  const originY = canvas.height * 0.45;

  const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#fde047', '#06b6d4'];

  for (let i = 0; i < 90; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 9;
    fireworksParticles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.5,
      radius: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: 0.015 + Math.random() * 0.018,
      gravity: 0.18
    });
  }

  if (!fireworksAnimationId) {
    animateFireworks();
  }
}

function animateFireworks() {
  const canvas = document.getElementById('fireworks-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = fireworksParticles.length - 1; i >= 0; i--) {
    const p = fireworksParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.alpha -= p.decay;

    if (p.alpha <= 0) {
      fireworksParticles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.restore();
  }

  if (fireworksParticles.length > 0) {
    fireworksAnimationId = requestAnimationFrame(animateFireworks);
  } else {
    cancelAnimationFrame(fireworksAnimationId);
    fireworksAnimationId = null;
    canvas.classList.remove('active');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// ==========================================
// 8. TIỆN ÍCH GIAO DIỆN & ĐIỀU HƯỚNG
// ==========================================
function switchView(viewId) {
  // Dừng mọi âm thanh đang đọc khi chuyển màn hình (R3)
  const player = getDanhVanPlayer();
  if (player) player.stop();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  if (chartAudio) {
    chartAudio.pause();
    chartAudio.currentTime = 0;
    chartAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  const target = document.getElementById(viewId);
  if (target) target.classList.remove('hidden');

  const btnBack = document.getElementById('btn-back');
  if (btnBack) {
    if (viewId === 'view-map') {
      btnBack.classList.add('hidden');
    } else {
      btnBack.classList.remove('hidden');
    }
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2200);
}

function waitMs(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// ==========================================
// 9. DỮ LIỆU DỰ PHÒNG KHI KHÔNG CÓ SERVER
// ==========================================
function loadFallbackData() {
  state.items = [
    {
      id: "vi_0001",
      word: "ba",
      meaning_vi_child: "bố hoặc người đàn ông; cần ngữ cảnh",
      example_vi: "Ba đang đọc sách cho bé.",
      topic: "gia đình",
      content_status: "authored_starter",
      phonics: {
        status: "user_confirmed",
        sequence: ["bờ", "a", "bờ a ba"]
      },
      audio: {
        dialects: {
          north: {
            word_full: "06-assets/audio/vi/north-hanoi/vi_0001/word.mp3",
            example_sentence: "06-assets/audio/vi/north-hanoi/vi_0001/example.mp3",
            phonics_steps: [
              "06-assets/audio/vi/north-hanoi/vi_0001/01-onset.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0001/02-rime.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0001/03-blend.mp3"
            ]
          },
          south: {
            word_full: "06-assets/audio/vi/south-saigon/vi_0001/word.mp3",
            example_sentence: "06-assets/audio/vi/south-saigon/vi_0001/example.mp3",
            phonics_steps: [
              "06-assets/audio/vi/south-saigon/vi_0001/01-onset.mp3",
              "06-assets/audio/vi/south-saigon/vi_0001/02-rime.mp3",
              "06-assets/audio/vi/south-saigon/vi_0001/03-blend.mp3"
            ]
          }
        }
      }
    },
    {
      id: "vi_0002",
      word: "bà",
      meaning_vi_child: "người phụ nữ lớn tuổi trong gia đình",
      example_vi: "Bà kể chuyện cho bé nghe.",
      topic: "gia đình",
      content_status: "authored_starter",
      phonics: {
        status: "user_confirmed",
        sequence: ["bờ", "a", "bờ a ba", "ba huyền bà"]
      },
      audio: {
        dialects: {
          north: {
            word_full: "06-assets/audio/vi/north-hanoi/vi_0002/word.mp3",
            example_sentence: "06-assets/audio/vi/north-hanoi/vi_0002/example.mp3",
            phonics_steps: [
              "06-assets/audio/vi/north-hanoi/vi_0002/01-onset.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0002/02-rime.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0002/03-blend.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0002/04-tone.mp3"
            ]
          },
          south: {
            word_full: "06-assets/audio/vi/south-saigon/vi_0002/word.mp3",
            example_sentence: "06-assets/audio/vi/south-saigon/vi_0002/example.mp3",
            phonics_steps: [
              "06-assets/audio/vi/south-saigon/vi_0002/01-onset.mp3",
              "06-assets/audio/vi/south-saigon/vi_0002/02-rime.mp3",
              "06-assets/audio/vi/south-saigon/vi_0002/03-blend.mp3",
              "06-assets/audio/vi/south-saigon/vi_0002/04-tone.mp3"
            ]
          }
        }
      }
    },
    {
      id: "vi_0005",
      word: "bé",
      meaning_vi_child: "em nhỏ đáng yêu",
      example_vi: "Bé cười thật tươi.",
      topic: "gia đình",
      content_status: "authored_starter",
      phonics: {
        status: "user_confirmed",
        sequence: ["bờ", "e", "bờ e be", "be sắc bé"]
      },
      audio: {
        dialects: {
          north: {
            word_full: "06-assets/audio/vi/north-hanoi/vi_0005/word.mp3",
            example_sentence: "06-assets/audio/vi/north-hanoi/vi_0005/example.mp3",
            phonics_steps: [
              "06-assets/audio/vi/north-hanoi/vi_0005/01-onset.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0005/02-rime.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0005/03-blend.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0005/04-tone.mp3"
            ]
          },
          south: {
            word_full: "06-assets/audio/vi/south-saigon/vi_0005/word.mp3",
            example_sentence: "06-assets/audio/vi/south-saigon/vi_0005/example.mp3",
            phonics_steps: [
              "06-assets/audio/vi/south-saigon/vi_0005/01-onset.mp3",
              "06-assets/audio/vi/south-saigon/vi_0005/02-rime.mp3",
              "06-assets/audio/vi/south-saigon/vi_0005/03-blend.mp3",
              "06-assets/audio/vi/south-saigon/vi_0005/04-tone.mp3"
            ]
          }
        }
      }
    },
    {
      id: "vi_0006",
      word: "bò",
      meaning_vi_child: "con bò ăn cỏ trên đồng",
      example_vi: "Con bò gặm cỏ xanh mướt.",
      topic: "động vật",
      content_status: "authored_starter",
      phonics: {
        status: "user_confirmed",
        sequence: ["bờ", "o", "bờ o bo", "bo huyền bò"]
      },
      audio: {
        dialects: {
          north: {
            word_full: "06-assets/audio/vi/north-hanoi/vi_0006/word.mp3",
            example_sentence: "06-assets/audio/vi/north-hanoi/vi_0006/example.mp3",
            phonics_steps: [
              "06-assets/audio/vi/north-hanoi/vi_0006/01-onset.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0006/02-rime.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0006/03-blend.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0006/04-tone.mp3"
            ]
          },
          south: {
            word_full: "06-assets/audio/vi/south-saigon/vi_0006/word.mp3",
            example_sentence: "06-assets/audio/vi/south-saigon/vi_0006/example.mp3",
            phonics_steps: [
              "06-assets/audio/vi/south-saigon/vi_0006/01-onset.mp3",
              "06-assets/audio/vi/south-saigon/vi_0006/02-rime.mp3",
              "06-assets/audio/vi/south-saigon/vi_0006/03-blend.mp3",
              "06-assets/audio/vi/south-saigon/vi_0006/04-tone.mp3"
            ]
          }
        }
      }
    },
    {
      id: "vi_0029",
      word: "đánh",
      meaning_vi_child: "dùng tay hoặc dùi tác động; đánh trống",
      example_vi: "Bé đánh trống rộn ràng.",
      topic: "hành động",
      content_status: "authored_starter",
      phonics: {
        status: "user_confirmed",
        sequence: ["đờ", "a", "nhờ", "a nhờ anh", "đờ anh đanh", "đanh sắc đánh"]
      },
      audio: {
        dialects: {
          north: {
            word_full: "06-assets/audio/vi/north-hanoi/vi_0029/word.mp3",
            example_sentence: "06-assets/audio/vi/north-hanoi/vi_0029/example.mp3",
            phonics_steps: [
              "06-assets/audio/vi/north-hanoi/vi_0029/01-onset.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0029/02-rime-01.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0029/03-rime-02.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0029/04-rime-blend.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0029/05-blend.mp3",
              "06-assets/audio/vi/north-hanoi/vi_0029/06-tone.mp3"
            ]
          },
          south: {
            word_full: "06-assets/audio/vi/south-saigon/vi_0029/word.mp3",
            example_sentence: "06-assets/audio/vi/south-saigon/vi_0029/example.mp3",
            phonics_steps: [
              "06-assets/audio/vi/south-saigon/vi_0029/01-onset.mp3",
              "06-assets/audio/vi/south-saigon/vi_0029/02-rime-01.mp3",
              "06-assets/audio/vi/south-saigon/vi_0029/03-rime-02.mp3",
              "06-assets/audio/vi/south-saigon/vi_0029/04-rime-blend.mp3",
              "06-assets/audio/vi/south-saigon/vi_0029/05-blend.mp3",
              "06-assets/audio/vi/south-saigon/vi_0029/06-tone.mp3"
            ]
          }
        }
      }
    }
  ];
  buildLessons();
  renderLessonTabs();
  renderIslandMap();
}
