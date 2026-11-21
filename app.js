/**
 * ĐẢO PHIÊU LƯU TỪ VỰNG — VIETNAMESE LEARNING GAME
 * Thiết kế cho iPad thế hệ 7 Safari & Web hiện đại
 */

// ==========================================
// 1. TRẠNG THÁI ỨNG DỤNG (APP STATE)
// ==========================================
const state = {
  items: [],
  lessons: [],
  currentLessonIndex: 0,
  currentWordIndex: 0,
  currentWord: null,
  currentDialect: 'north', // 'north' (Bắc - Hà Nội) hoặc 'south' (Nam - Sài Gòn)
  soundEnabled: true,
  speechRate: 0.75, // Tốc độ vừa chậm cho trẻ 4-6 tuổi
  audioUnlocked: false,
  score: 0,
  quizCurrentWord: null
};

// Hình minh họa sinh động cho từng câu ví dụ
const exampleIllustrationMap = {
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
  'sau': '➡️🚶' // Đi sau một bước
};

// Dữ liệu hình ảnh và tên gọi trực quan cho trẻ nhỏ
const pictureData = {
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
  'đánh': { emoji: '🥁', label: 'Đánh Trống' },
  'bóng': { emoji: '⚽', label: 'Quả Bóng' },
  'xe': { emoji: '🚗', label: 'Chiếc Xe' },
  'nhà': { emoji: '🏡', label: 'Ngôi Nhà' }
};

// Emoji dự phòng
const emojiMap = {
  'ba': '👨‍👧',
  'bà': '👵',
  'bố': '👨',
  'mẹ': '👩‍👦',
  'bé': '👶',
  'bò': '🐄',
  'mèo': '🐱',
  'gà': '🐔',
  'cá': '🐟',
  'vịt': '🦆',
  'chó': '🐶',
  'hoa': '🌸',
  'lá': '🍃',
  'cây': '🌳',
  'nắng': '☀️',
  'mưa': '🌧️',
  'đá': '🪨',
  'đèn': '💡',
  'bút': '✏️',
  'sách': '📖',
  'vở': '📓',
  'bàn': '🪑',
  'ghế': '🛋️',
  'nhà': '🏡',
  'cửa': '🚪',
  'cơm': '🍚',
  'nước': '🥛',
  'xe': '🚗',
  'đánh': '🥁',
  'bóng': '⚽',
  'đau': '🩹',
  'sau': '➡️'
};

// ==========================================
// 2. KHỞI TẠO ỨNG DỤNG & TẢI DỮ LIỆU
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadVocabularyData();
});

// Tải dữ liệu từ vocabulary_vi_v2.json
async function loadVocabularyData() {
  try {
    const response = await fetch('./01-vocabulary/vocabulary_vi_v2.json');
    if (!response.ok) throw new Error('Không thể tải file JSON');
    const data = await response.json();
    state.items = data.items || [];
    buildLessons();
    renderLessonTabs();
    renderIslandMap();
  } catch (err) {
    console.warn('Đang tải dữ liệu dự phòng...', err);
    // Dữ liệu dự phòng nếu mở trực tiếp bằng file:/// trên máy
    loadFallbackData();
  }
}

// Xây dựng lộ trình bài học: mỗi bài ~10 từ theo mức độ dễ đến khó
function buildLessons() {
  const starterItems = state.items.filter(x => x.content_status === 'authored_starter');
  const sgkItems = state.items.filter(x => x.content_status !== 'authored_starter');

  const lessons = [];

  // Bài 1: 10 từ khởi đầu 1 (Gia đình & Động vật gần gũi)
  lessons.push({
    id: 'lesson-1',
    title: 'Bài 1: Gia đình & Động vật gần gũi',
    level: 'Mức 1 (Rất dễ)',
    items: starterItems.slice(0, 10)
  });

  // Bài 2: 10 từ khởi đầu 2 (Thiên nhiên & Đồ dùng)
  lessons.push({
    id: 'lesson-2',
    title: 'Bài 2: Thiên nhiên & Đồ dùng',
    level: 'Mức 2 (Dễ)',
    items: starterItems.slice(10, 20)
  });

  // Bài 3: 12 từ khởi đầu 3 (Ngôi nhà & Hoạt động)
  lessons.push({
    id: 'lesson-3',
    title: 'Bài 3: Ngôi nhà & Hoạt động',
    level: 'Mức 3 (Vừa)',
    items: starterItems.slice(20, 32)
  });

  // Bài 4 đến Bài 63: Chia toàn bộ 600 từ SGK, mỗi bài ~10 từ từ dễ đến nâng cao
  const chunkSize = 10;
  let lessonNum = 4;
  for (let i = 0; i < sgkItems.length; i += chunkSize) {
    const chunk = sgkItems.slice(i, i + chunkSize);
    const week = chunk[0]?.source_refs?.[0]?.week || Math.floor(lessonNum / 2);
    lessons.push({
      id: `lesson-${lessonNum}`,
      title: `Bài ${lessonNum}: Tuần ${week} SGK`,
      level: `Mức ${lessonNum}`,
      items: chunk
    });
    lessonNum++;
  }

  state.lessons = lessons;
}

// Render các nút chọn bài học (Lesson tabs)
function renderLessonTabs() {
  const container = document.getElementById('lesson-tabs');
  if (!container) return;
  container.innerHTML = '';

  state.lessons.forEach((l, idx) => {
    const btn = document.createElement('button');
    btn.className = `lesson-tab-btn ${idx === state.currentLessonIndex ? 'active' : ''}`;
    btn.textContent = `Bài ${idx + 1} (${l.items.length} từ)`;
    btn.addEventListener('click', () => {
      state.currentLessonIndex = idx;
      renderLessonTabs();
      renderIslandMap();
    });
    container.appendChild(btn);
  });

  const curLesson = state.lessons[state.currentLessonIndex];
  if (curLesson) {
    document.getElementById('current-lesson-title').textContent = `${curLesson.title} — ${curLesson.level}`;
  }
}

// Thiết lập các sự kiện giao diện
function setupEventListeners() {
  // 1. Mở khóa âm thanh trên iPad Safari (Bắt buộc tương tác chạm lần đầu)
  const btnStart = document.getElementById('btn-start');
  btnStart.addEventListener('click', unlockAudioAndStart);
  btnStart.addEventListener('touchstart', unlockAudioAndStart, { passive: true });

  // 2. Điều hướng Header
  document.getElementById('btn-back').addEventListener('click', () => switchView('view-map'));
  document.getElementById('btn-dialect-toggle').addEventListener('click', toggleDialect);
  document.getElementById('btn-sound-toggle').addEventListener('click', toggleSound);
  document.getElementById('btn-speed-toggle').addEventListener('click', toggleSpeed);

  // 3. Chuyển đổi ngôn ngữ
  document.getElementById('lang-vi').addEventListener('click', () => {
    showToast('Đang chọn: Tiếng Việt 🇻🇳');
  });
  document.getElementById('lang-ja').addEventListener('click', () => {
    showToast('🇯🇵 Phần tiếng Nhật sẽ có trong giai đoạn mở rộng tiếp theo!');
  });

  // 4. Bộ lọc bản đồ
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      state.activeFilter = e.target.dataset.filter;
      renderIslandMap();
    });
  });

  // 5. Trạm học từ vựng
  document.getElementById('btn-play-full').addEventListener('click', () => {
    if (state.currentWord) {
      playAudioSrc(getDialectAudio(state.currentWord, 'word'), state.currentWord.word);
    }
  });

  document.getElementById('btn-play-all-steps').addEventListener('click', playAllPhonicsSteps);

  document.getElementById('btn-play-example').addEventListener('click', () => {
    if (state.currentWord && state.currentWord.example_vi) {
      playAudioSrc(getDialectAudio(state.currentWord, 'example'), state.currentWord.example_vi);
    }
  });

  document.getElementById('btn-prev-word').addEventListener('click', prevWord);
  document.getElementById('btn-next-word').addEventListener('click', nextWord);

  // 6. Mini Game Thử Thách Nhìn Chữ Chọn Hình
  document.getElementById('btn-launch-game').addEventListener('click', startQuizGame);
  document.getElementById('btn-exit-game').addEventListener('click', () => switchView('view-station'));
  document.getElementById('btn-quiz-listen').addEventListener('click', () => {
    if (state.quizCurrentWord) {
      playAudioSrc(getDialectAudio(state.quizCurrentWord, 'word'), state.quizCurrentWord.word);
    }
  });
  document.getElementById('btn-next-quiz').addEventListener('click', nextQuizQuestion);
}

// Mở khóa AudioContext trên iPad Safari
function unlockAudioAndStart() {
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
  showToast('Đã mở khóa âm thanh cho iPad! Chúc bé học vui! 🌟');
}

// ==========================================
// 3. RENDER BẢN ĐỒ THÁM HIỂM (ISLAND MAP THEO BÀI HỌC)
// ==========================================
function renderIslandMap() {
  const container = document.getElementById('island-grid');
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
    card.className = `island-node ${isConfirmed ? 'confirmed' : ''}`;
    
    const icon = emojiMap[item.word] || '🌿';
    const statusText = isConfirmed ? 'Chơi ngay' : 'Đang duyệt';
    const badgeClass = isConfirmed ? 'ready' : 'pending';

    card.innerHTML = `
      <div class="node-icon">${icon}</div>
      <div class="node-word">${item.word}</div>
      <span class="node-badge ${badgeClass}">${statusText}</span>
    `;

    card.addEventListener('click', () => openWordStation(item));
    container.appendChild(card);
  });
}

// ==========================================
// 4. PHÒNG KHÁM PHÁ TỪ & ĐÁNH VẦN (STATION)
// ==========================================
function openWordStation(item) {
  state.currentWord = item;
  state.currentWordIndex = state.items.findIndex(x => x.id === item.id);

  // Cập nhật thông tin giao diện
  document.getElementById('word-display').textContent = item.word;
  document.getElementById('word-meaning').textContent = item.meaning_vi_child || 'Chờ cập nhật nghĩa';
  document.getElementById('word-topic').textContent = item.topic || 'khám phá';
  document.getElementById('example-text').textContent = `"${item.example_vi || 'Đang cập nhật ví dụ'}"`;
  document.getElementById('word-emoji').textContent = emojiMap[item.word] || '📖';
  
  // Cập nhật hình ảnh minh họa cho câu ví dụ
  const exEmoji = document.getElementById('example-emoji');
  if (exEmoji) {
    exEmoji.textContent = exampleIllustrationMap[item.word] || '🌟';
  }

  const isConfirmed = item.phonics && item.phonics.status === 'user_confirmed';
  const badge = document.getElementById('phonics-badge');
  if (isConfirmed) {
    badge.textContent = '🌟 Đã duyệt cách ghép vần';
    badge.className = 'badge-status';
  } else {
    badge.textContent = '⏳ Đang chờ thẩm định giáo viên';
    badge.className = 'badge-status';
    badge.style.background = '#fef3c7';
    badge.style.color = '#92400e';
  }

  // Render các bước đánh vần
  renderPhonicsSteps(item);

  // Chuyển sang View Station
  switchView('view-station');

  // Đọc từ chào mừng bằng file thu âm chuẩn của giọng đang chọn
  setTimeout(() => {
    playAudioSrc(getDialectAudio(item, 'word'), item.word);
  }, 300);
}

// Render các thẻ bước đánh vần
function renderPhonicsSteps(item) {
  const wrapper = document.getElementById('phonics-steps-wrapper');
  wrapper.innerHTML = '';

  const sequence = (item.phonics && item.phonics.sequence) ? item.phonics.sequence : [];

  if (sequence.length === 0) {
    wrapper.innerHTML = '<p style="color:#64748b; font-style:italic;">Chuỗi ghép âm đang chờ xác nhận từ giáo viên dạy đọc.</p>';
    return;
  }

  sequence.forEach((stepText, index) => {
    // Thẻ bước
    const card = document.createElement('div');
    card.className = 'step-card';
    card.id = `step-card-${index}`;
    card.innerHTML = `
      <span class="step-number">Bước ${index + 1}</span>
      <span class="step-text">${stepText}</span>
    `;

    card.addEventListener('click', () => {
      highlightStep(index);
      const audioSrc = getDialectAudio(item, 'step', index);
      playAudioSrc(audioSrc, stepText);
    });

    wrapper.appendChild(card);

    // Mũi tên liên kết (trừ bước cuối)
    if (index < sequence.length - 1) {
      const arrow = document.createElement('span');
      arrow.className = 'step-arrow';
      arrow.textContent = '➔';
      wrapper.appendChild(arrow);
    }
  });
}

// Đọc toàn bộ chuỗi đánh vần lần lượt bằng audio chuẩn với nhịp điệu tự nhiên, nhanh vừa
async function playAllPhonicsSteps() {
  if (!state.currentWord || !state.currentWord.phonics || !state.currentWord.phonics.sequence) return;
  const seq = state.currentWord.phonics.sequence;

  for (let i = 0; i < seq.length; i++) {
    highlightStep(i);
    const audioSrc = getDialectAudio(state.currentWord, 'step', i);
    // Tăng tốc độ đọc từng bước lên 1.25x và rút ngắn thời gian nghỉ để chuỗi liền mạch
    await playAudioSrc(audioSrc, seq[i], 1.25);
    await waitMs(120);
  }

  // Đọc từ hoàn chỉnh cuối cùng
  await waitMs(180);
  playAudioSrc(getDialectAudio(state.currentWord, 'word'), state.currentWord.word, 1.0);
}

function highlightStep(index) {
  document.querySelectorAll('.step-card').forEach(c => c.classList.remove('active'));
  const card = document.getElementById(`step-card-${index}`);
  if (card) {
    card.classList.add('active');
    setTimeout(() => card.classList.remove('active'), 1200);
  }
}

// Điều hướng từ tiếp / từ trước trong bài học
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
    showToast('Bé đã xem hết các từ trong bài học này! 🎉');
  }
}

// ==========================================
// 5. THỬ THÁCH NHÌN CHỮ CHỌN HÌNH (WORD-TO-PICTURE)
// ==========================================
function startQuizGame() {
  const target = state.currentWord || state.items.find(x => x.phonics?.status === 'user_confirmed') || state.items[0];
  loadQuizQuestion(target);
  switchView('view-game');
}

function loadQuizQuestion(targetWordItem) {
  state.quizCurrentWord = targetWordItem;
  const word = targetWordItem.word;

  document.getElementById('quiz-word-display').textContent = word;
  const feedback = document.getElementById('quiz-feedback');
  feedback.className = 'quiz-feedback hidden';
  feedback.innerHTML = '';
  document.getElementById('btn-next-quiz').classList.add('hidden');

  // Lấy các đáp án gây nhiễu phù hợp với trẻ (theo yêu cầu: chữ ba -> hình ba, mẹ, bà)
  const distractorPool = {
    'ba': ['mẹ', 'bà', 'bé'],
    'bà': ['ba', 'mẹ', 'bé'],
    'bé': ['ba', 'bà', 'bò'],
    'bò': ['mèo', 'gà', 'vịt'],
    'đánh': ['bóng', 'xe', 'nhà']
  };

  const pool = distractorPool[word] || ['ba', 'bà', 'bé', 'mèo', 'gà'].filter(w => w !== word);
  
  // Chọn 2 từ gây nhiễu
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
  const distractors = shuffledPool.slice(0, 2);

  const options = [
    { word: word, ...(pictureData[word] || { emoji: emojiMap[word] || '🌿', label: word }), isCorrect: true },
    ...distractors.map(dw => ({ word: dw, ...(pictureData[dw] || { emoji: emojiMap[dw] || '🌿', label: dw }), isCorrect: false }))
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

function handlePictureSelect(cardElement, option) {
  const feedback = document.getElementById('quiz-feedback');
  feedback.classList.remove('hidden');

  if (option.isCorrect) {
    // Bé chọn ĐÚNG!
    cardElement.classList.add('correct');
    feedback.className = 'quiz-feedback success';
    feedback.innerHTML = `🎉 Đúng rồi! Bé giỏi quá! Chữ <b>"${option.word}"</b> chính là <b>${option.label}</b>!`;
    
    state.score += 10;
    document.getElementById('game-score').textContent = state.score;

    // 1. Phát âm thanh chuông reo chiến thắng vui nhộn
    playChimeSound('correct');

    // 2. Bắn pháo hoa rực rỡ trên màn hình iPad
    triggerFireworks();

    // 3. Giọng đọc khen ngợi "Đúng rồi! Bé giỏi quá!" theo giọng đang chọn (Bắc / Nam)
    const correctAudio = `06-assets/audio/common/correct-${state.currentDialect}.mp3`;
    setTimeout(() => {
      playAudioSrc(correctAudio, 'Đúng rồi! Bé giỏi quá!');
    }, 250);

    // Hiện nút chuyển sang từ tiếp theo
    document.getElementById('btn-next-quiz').classList.remove('hidden');

    // Khóa click tạm thời
    document.querySelectorAll('.picture-card').forEach(c => c.style.pointerEvents = 'none');
  } else {
    // Bé chọn SAI: Rung thẻ và hướng dẫn nhẹ nhàng
    cardElement.classList.add('wrong');
    feedback.className = 'quiz-feedback error';
    feedback.innerHTML = `💡 Chưa đúng rồi! Đây là <b>${option.label}</b>. Bé nhìn kỹ chữ lại nhé!`;
    
    // 1. Âm thanh báo sai nhẹ nhàng thân thiện
    playChimeSound('wrong');

    // 2. Giọng đọc động viên "Bé thử lại nhé!" theo giọng đang chọn (Bắc / Nam)
    const tryAgainAudio = `06-assets/audio/common/try-again-${state.currentDialect}.mp3`;
    setTimeout(() => {
      playAudioSrc(tryAgainAudio, 'Bé thử lại nhé!');
    }, 150);

    setTimeout(() => {
      cardElement.classList.remove('wrong');
    }, 600);
  }
}

function nextQuizQuestion() {
  document.querySelectorAll('.picture-card').forEach(c => c.style.pointerEvents = 'auto');
  
  // Lấy các từ đã duyệt
  const confirmedWords = state.items.filter(x => x.phonics?.status === 'user_confirmed');
  const pool = confirmedWords.length > 0 ? confirmedWords : state.items.slice(0, 5);
  
  // Chọn từ khác với từ hiện tại
  const nextPool = pool.filter(x => x.word !== state.quizCurrentWord?.word);
  const nextTarget = nextPool.length > 0 ? nextPool[Math.floor(Math.random() * nextPool.length)] : pool[0];
  
  loadQuizQuestion(nextTarget);
}

// Hiệu ứng ăn mừng khi hoàn thành
function confettiEffect() {
  showToast('🌟 +10 Ngôi sao! Bé giỏi lắm!');
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

// Phát âm thanh chuông reo (Đúng) hoặc âm boing nhẹ (Sai)
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
  } else if (type === 'wrong') {
    // Âm thanh boing nhẹ nhàng, hài hước, khích lệ
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(329.63, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  }
}

// Bắn pháo hoa rực rỡ Canvas khi làm đúng
let fireworksAnimationId = null;
const particles = [];

function triggerFireworks() {
  const canvas = document.getElementById('fireworks-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const centers = [
    { x: canvas.width * 0.28, y: canvas.height * 0.4 },
    { x: canvas.width * 0.5, y: canvas.height * 0.32 },
    { x: canvas.width * 0.72, y: canvas.height * 0.42 }
  ];

  const colors = ['#f59e0b', '#22c55e', '#38bdf8', '#ef4444', '#ec4899', '#a855f7', '#fbbf24', '#ffffff'];

  centers.forEach(c => {
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      particles.push({
        x: c.x,
        y: c.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.018 + 0.012,
        gravity: 0.15
      });
    }
  });

  if (!fireworksAnimationId) {
    animateFireworks();
  }
}

function animateFireworks() {
  const canvas = document.getElementById('fireworks-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= 0.98;
    p.alpha -= p.decay;

    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (particles.length > 0) {
    fireworksAnimationId = requestAnimationFrame(animateFireworks);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fireworksAnimationId = null;
  }
}

// Lấy file audio theo phương ngữ đang chọn (Bắc / Nam)
function getDialectAudio(item, type, stepIndex) {
  if (!item || !item.audio) return null;
  const dialect = state.currentDialect; // 'north' hoặc 'south'
  
  if (item.audio.dialects && item.audio.dialects[dialect]) {
    const d = item.audio.dialects[dialect];
    if (type === 'word') return d.word_full;
    if (type === 'example') return d.example_sentence;
    if (type === 'step') return d.phonics_steps?.[stepIndex];
  }
  
  // Dự phòng nếu chưa phân tách nhánh
  if (type === 'word') return item.audio.word_full;
  if (type === 'example') return item.audio.example_sentence;
  if (type === 'step') return item.audio.phonics_steps?.[stepIndex];
  return null;
}

function toggleDialect() {
  if (state.currentDialect === 'north') {
    state.currentDialect = 'south';
    document.getElementById('dialect-label').textContent = 'Miền Nam';
    showToast('🌴 Đã chuyển sang: Giọng Miền Nam (Sài Gòn)');
  } else {
    state.currentDialect = 'north';
    document.getElementById('dialect-label').textContent = 'Miền Bắc';
    showToast('🏛️ Đã chuyển sang: Giọng Miền Bắc (Hà Nội)');
  }

  // Phát thử từ hiện tại để người dùng cảm nhận ngay giọng mới
  if (state.currentWord) {
    playAudioSrc(getDialectAudio(state.currentWord, 'word'), state.currentWord.word);
  }
}

function playAudioSrc(src, fallbackText, speedMultiplier = 1.0) {
  if (!state.soundEnabled) return Promise.resolve();

  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
  }

  // 1. Ưu tiên phát file âm thanh thu âm thật
  if (src) {
    return new Promise((resolve) => {
      const audio = new Audio(src);
      const baseRate = state.speechRate === 0.75 ? 0.95 : 1.0;
      audio.playbackRate = baseRate * speedMultiplier;
      currentAudio = audio;
      audio.onended = () => resolve();
      audio.onerror = (err) => {
        console.warn('Không tải được audio file, chuyển sang giọng máy:', src, err);
        speakTextAsync(fallbackText).then(resolve);
      };
      audio.play().catch(err => {
        console.warn('Trình duyệt chặn autoplay hoặc lỗi play audio:', err);
        speakTextAsync(fallbackText).then(resolve);
      });
    });
  } else {
    // 2. Dự phòng bằng giọng đọc nếu chưa có file thu âm
    return speakTextAsync(fallbackText);
  }
}

function speakText(text) {
  if (!state.soundEnabled || !text) return;

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Ngắt âm đang phát nếu có
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = state.speechRate;
    utterance.pitch = 1.0;

    // Ưu tiên giọng miền Bắc nếu trình duyệt có sẵn
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi') || v.name.includes('Vietnamese') || v.name.includes('Hanoi'));
    if (viVoice) utterance.voice = viVoice;

    window.speechSynthesis.speak(utterance);
  }
}

function speakTextAsync(text) {
  return new Promise((resolve) => {
    if (!state.soundEnabled || !text || !('speechSynthesis' in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = state.speechRate;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi'));
    if (viVoice) utterance.voice = viVoice;

    window.speechSynthesis.speak(utterance);
  });
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  const icon = document.getElementById('sound-icon');
  icon.textContent = state.soundEnabled ? '🔊' : '🔇';
  showToast(state.soundEnabled ? 'Âm thanh: BẬT' : 'Âm thanh: TẮT');
}

function toggleSpeed() {
  if (state.speechRate === 0.75) {
    state.speechRate = 1.0;
    document.getElementById('speed-label').textContent = 'Vừa';
  } else {
    state.speechRate = 0.75;
    document.getElementById('speed-label').textContent = 'Chậm';
  }
  showToast(`Tốc độ đọc: ${document.getElementById('speed-label').textContent}`);
}

// ==========================================
// 7. TIỆN ÍCH GIAO DIỆN & ĐIỀU HƯỚNG
// ==========================================
function switchView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  const target = document.getElementById(viewId);
  if (target) target.classList.remove('hidden');

  const btnBack = document.getElementById('btn-back');
  if (viewId === 'view-map') {
    btnBack.classList.add('hidden');
  } else {
    btnBack.classList.remove('hidden');
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
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
// 8. DỮ LIỆU DỰ PHÒNG KHI KHÔNG CÓ SERVER
// ==========================================
function loadFallbackData() {
  // Dự phòng 5 từ đã duyệt chuẩn kèm audio cả 2 miền
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
      meaning_vi_child: "trẻ nhỏ đáng yêu",
      example_vi: "Bé đang cười tươi.",
      topic: "con người",
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
      meaning_vi_child: "con bò ăn cỏ ngoài đồng",
      example_vi: "Con bò đang ăn cỏ xanh.",
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
