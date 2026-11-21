import re

with open('app.js', encoding='utf-8') as f:
    text = f.read()

# 1. Update saveProgressToStorage and loadProgressFromStorage
old_storage = """function saveProgressToStorage() {
  try {
    const data = {
      unlockedLessons: state.unlockedLessons,
      currentLessonIndex: state.currentLessonIndex,
      score: state.score,
      unlockAllMode: state.unlockAllMode,
      carriedOverIds: (state.carriedOverWords || []).map(w => w.id)
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
      if (Array.isArray(data.unlockedLessons)) state.unlockedLessons = data.unlockedLessons;
      if (typeof data.currentLessonIndex === 'number') state.currentLessonIndex = data.currentLessonIndex;
      if (typeof data.score === 'number') state.score = data.score;
      if (typeof data.unlockAllMode === 'boolean') state.unlockAllMode = data.unlockAllMode;
      state._savedCarriedIds = data.carriedOverIds || [];
    }
  } catch (e) {
    console.warn('Storage load note:', e);
  }
}"""

new_storage = """function saveProgressToStorage() {
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

      if (data.vocabProgress) {
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
}"""

if old_storage in text:
    text = text.replace(old_storage, new_storage)
    print("Replaced storage functions successfully")
else:
    print("Could not find old_storage in text")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(text)
