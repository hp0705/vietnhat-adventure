with open('app.js', encoding='utf-8') as f:
    text = f.read()

# Target to replace: from document.addEventListener('DOMContentLoaded' ... up to end of buildLessons()
import re
pattern = r"document\.addEventListener\('DOMContentLoaded', \(\) => \{.*?function buildLessons\(\) \{.*?\n  state\.lessons = lessons;\n\}"
match = re.search(pattern, text, re.DOTALL)

if not match:
    print("Could not match pattern for loader and buildLessons!")
else:
    new_code = """document.addEventListener('DOMContentLoaded', () => {
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
    }
  } catch (e) {}

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

// Xây dựng lộ trình Học từ mới (Function 1)
function buildVocabLessons() {
  const authored = state.vocabItems.filter(x => x.content_status === 'authored_starter');
  const sgkItems = state.vocabItems.filter(x => x.content_status !== 'authored_starter');

  const level1 = authored.filter(x => x.phonics?.complexity === '2_am');
  const level2 = authored.filter(x => x.phonics?.complexity === '3_am');
  const level3 = authored.filter(x => x.phonics?.complexity === '4_5_am' || x.phonics?.complexity === '5_am_tro_len');

  const lessons = [];
  lessons.push({
    id: 'lesson-1',
    lessonIndex: 0,
    title: 'Bài 1: Ghép 2 âm cơ bản (Gia đình & Động vật)',
    level: 'Cấp 1 (2 âm - Rất dễ)',
    items: level1.slice(0, 10)
  });
  lessons.push({
    id: 'lesson-2',
    lessonIndex: 1,
    title: 'Bài 2: Ghép 2 âm cơ bản (Thiên nhiên & Cây cối)',
    level: 'Cấp 1 (2 âm - Dễ)',
    items: level1.slice(10, 20)
  });
  lessons.push({
    id: 'lesson-3',
    lessonIndex: 2,
    title: 'Bài 3: Ghép 2 âm mở rộng (Đồ dùng & Sinh hoạt)',
    level: 'Cấp 1 (2 âm - Dễ)',
    items: level1.slice(20, 30)
  });
  const l4Items = [...level1.slice(30), ...level2.slice(0, 8)];
  lessons.push({
    id: 'lesson-4',
    lessonIndex: 3,
    title: 'Bài 4: Nâng lên 3 âm (Vần đôi & Thiên nhiên)',
    level: 'Cấp 2 (3 âm - Vừa)',
    items: l4Items
  });
  const l5Items = level2.slice(8, 18);
  lessons.push({
    id: 'lesson-5',
    lessonIndex: 4,
    title: 'Bài 5: Nâng lên 3 âm (Cơ thể & Hoạt động)',
    level: 'Cấp 2 (3 âm - Vừa)',
    items: l5Items
  });
  const l6Items = [...level2.slice(18), ...level3];
  lessons.push({
    id: 'lesson-6',
    lessonIndex: 5,
    title: 'Bài 6: Nâng lên 4-5 âm & Từ ghép',
    level: 'Cấp 3 (4-5 âm - Nâng cao)',
    items: l6Items
  });

  const chunkSize = 10;
  let lessonNum = 7;
  for (let i = 0; i < sgkItems.length; i += chunkSize) {
    const chunk = sgkItems.slice(i, i + chunkSize);
    lessons.push({
      id: `lesson-${lessonNum}`,
      lessonIndex: lessonNum - 1,
      title: `Bài ${lessonNum}: Luyện đọc SGK`,
      level: `Cấp ${lessonNum} (Mở rộng)`,
      items: chunk
    });
    lessonNum++;
  }

  state.vocabLessons = lessons;
}

// Xây dựng lộ trình Tập đánh vần (Function 2 - 7 Bài học theo họ vần)
function buildSpellingLessons() {
  const lessonConfigs = [
    {
      id: 'spel-1',
      title: 'Bài 1: Vần ap & ăp (Âm cuối P)',
      rimes: ['ap', 'ăp'],
      level: 'Cơ bản - Âm cuối p'
    },
    {
      id: 'spel-2',
      title: 'Bài 2: Vần âp & ep (Âm cuối P)',
      rimes: ['âp', 'ep'],
      level: 'Cơ bản - Âm cuối p'
    },
    {
      id: 'spel-3',
      title: 'Bài 3: Vần êp, ip & op (Âm cuối P)',
      rimes: ['êp', 'ip', 'op'],
      level: 'Nâng cao - Âm cuối p'
    },
    {
      id: 'spel-4',
      title: 'Bài 4: Vần ôp, ơp & up (Âm cuối P)',
      rimes: ['ôp', 'ơp', 'up'],
      level: 'Nâng cao - Âm cuối p'
    },
    {
      id: 'spel-5',
      title: 'Bài 5: Vần ach, êch & ich (Âm cuối CH)',
      rimes: ['ach', 'êch', 'ich'],
      level: 'Mở rộng - Âm cuối ch'
    },
    {
      id: 'spel-6',
      title: 'Bài 6: Vần anh (Âm cuối NH)',
      rimes: ['anh'],
      level: 'Mở rộng - Âm cuối nh'
    },
    {
      id: 'spel-7',
      title: 'Bài 7: Vần au (Âm cuối U)',
      rimes: ['au'],
      level: 'Mở rộng - Âm cuối u'
    }
  ];

  state.spellingLessons = lessonConfigs.map((cfg, idx) => {
    const lessonItems = state.spellingItems.filter(it => cfg.rimes.includes(it.rhyme_family));
    return {
      id: cfg.id,
      lessonIndex: idx,
      title: cfg.title,
      level: cfg.level,
      rimes: cfg.rimes,
      items: lessonItems
    };
  });
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
}"""
    text = text[:match.start()] + new_code + text[match.end():]
    with open('app.js', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Replaced loader and buildLessons successfully!")
