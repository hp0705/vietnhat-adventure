with open('app.js', encoding='utf-8') as f:
    text = f.read()

import re

# 1. Patch setupEventListeners and unlockAudioAndStart
old_events_pattern = r"function setupEventListeners\(\) \{.*?\nfunction unlockAudioAndStart\(\) \{.*?\n\}"
new_events = """function setupEventListeners() {
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
  document.getElementById('btn-back')?.addEventListener('click', () => switchView('view-map'));
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
      playAudioSrc(getDialectAudio(state.currentWord, 'word'), state.currentWord.word);
    }
  });

  // 5. NÚT ĐÁNH VẦN DUY NHẤT (Không hiển thị các bước chữ rườm rà)
  document.getElementById('btn-play-all-steps')?.addEventListener('click', playAllPhonicsSteps);

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
}"""

text = re.sub(old_events_pattern, new_events, text, flags=re.DOTALL)
print("Updated setupEventListeners and unlockAudioAndStart")

# 2. Patch renderIslandMap
old_island_pattern = r"function renderIslandMap\(\) \{.*?\nfunction openWordStation"
new_island = """function renderIslandMap() {
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

function openWordStation"""

text = re.sub(old_island_pattern, new_island, text, flags=re.DOTALL)
print("Updated renderIslandMap")

# 3. Patch openWordStation badge logic
old_station_badge = """  const isConfirmed = item.phonics && item.phonics.status === 'user_confirmed';
  const badge = document.getElementById('phonics-badge');
  if (badge) {
    if (isConfirmed) {
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
  }"""

new_station_badge = """  const isConfirmed = item.phonics && item.phonics.status === 'user_confirmed';
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
  }"""

if old_station_badge in text:
    text = text.replace(old_station_badge, new_station_badge)
    print("Updated openWordStation badge logic")

# 4. Patch getDialectAudio
old_get_audio_pattern = r"function getDialectAudio\(item, type, stepIndex = 0\) \{.*?\nfunction toggleDialect"
new_get_audio = """function getDialectAudio(item, type, stepIndex = 0) {
  if (!item) return null;

  // Xử lý riêng cho Function 2: Tập đánh vần
  if (state.activeModule === 'spelling') {
    if (type === 'word') {
      return item.audio?.word_full || (item.id ? `06-assets/audio/spelling/words/${item.id}.mp3` : null);
    }
    if (type === 'example') {
      return item.audio?.example_sentence || null;
    }
    if (type === 'step') {
      const seq = item.phonics?.sequence || [];
      const stepText = seq[stepIndex];
      if (stepText && state.spellingStepAudioMap && state.spellingStepAudioMap[stepText]) {
        return state.spellingStepAudioMap[stepText];
      }
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

function toggleDialect"""

text = re.sub(old_get_audio_pattern, new_get_audio, text, flags=re.DOTALL)
print("Updated getDialectAudio")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Patching complete!")
