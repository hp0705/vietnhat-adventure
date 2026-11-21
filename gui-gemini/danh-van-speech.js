/**
 * danh-van-speech.js - Đọc đánh vần cho trẻ nghe, dùng chung cho CẢ "Tập đánh vần" và "Học từ mới".
 * Cần danh-van.js nạp trước.
 *
 * Cách dùng (trình duyệt):
 *   <script src="danh-van.js"></script>
 *   <script src="danh-van-speech.js"></script>
 *   const player = DanhVanSpeech.createPlayer({ audioBase: '06-assets/audio/' }); // audioBase có thể bỏ trống
 *   player.say('khách');   // ở màn hình nào cũng gọi đúng hàm này
 *   player.stop();
 *
 * Nguyên tắc:
 *  1. Mỗi âm là MỘT lần đọc riêng, có khoảng nghỉ rõ ràng (không dồn cả câu vào 1 lần đọc).
 *  2. Ưu tiên file âm thanh thu sẵn (đọc kéo dài được: "ach", "iêng"...). Thiếu file thì dùng giọng máy.
 *  3. Dấu thanh được đọc là "dấu sắc", "dấu huyền"... và đọc chậm hơn để nghe rõ.
 */
(function (root) {
  'use strict';

  const DV = (typeof module !== 'undefined' && module.exports) ? require('./danh-van.js') : root.DanhVan;

  const TONE_NAMES = ['sắc', 'huyền', 'hỏi', 'ngã', 'nặng'];
  const STRIP_TONE = /[̣̀́̉̃]/g;
  // rime kết thúc bằng âm tắc (c, ch, p, t) rất dễ bị giọng máy nuốt mất => đọc chậm hơn
  const HOLD_FINALS = /(c|ch|p|t)$/;

  // khoảng nghỉ SAU mỗi loại âm (ms)
  const PAUSE = { consonant: 500, vowel: 450, rime: 800, syllable: 700, tone: 500, word: 1000 };
  // hệ số tốc độ (nhân với rate gốc). Nhỏ hơn = chậm hơn
  const SPEED = { consonant: 0.9, vowel: 0.9, rime: 0.8, syllable: 0.85, tone: 0.75, word: 0.85 };

  function stripTone(s) { return s.normalize('NFD').replace(STRIP_TONE, '').normalize('NFC'); }

  /** tên file âm thanh an toàn (chỉ chữ a-z, số, dấu _): "khờ" => "kh_1edd", "ach" => "ach" */
  function audioFileName(text) {
    let out = '';
    for (const ch of text.normalize('NFC')) {
      out += /[a-z0-9]/.test(ch) ? ch : '_' + ch.codePointAt(0).toString(16);
    }
    return out;
  }

  function planSyllable(syllable) {
    const syl = syllable.trim().toLowerCase().normalize('NFC');
    const info = DV.spellSyllable(syl);
    const tokens = info.danh_van.split(' - ');
    const base = stripTone(syl);
    return tokens.map((text, i) => {
      let kind;
      if (TONE_NAMES.includes(text) && i === tokens.length - 2) kind = 'tone';
      else if (i === tokens.length - 1) kind = 'syllable_final';
      else if ([...text].length === 1) kind = 'vowel';
      else if (/ờ$/.test(text)) kind = 'consonant';
      else if (text === base) kind = 'syllable';
      else kind = 'rime';
      return { text, kind };
    });
  }

  /** Kế hoạch đọc cho 1 từ (có thể nhiều tiếng). Mỗi item = 1 lần đọc riêng. */
  function planWord(word) {
    const syllables = word.trim().toLowerCase().normalize('NFC').split(/\s+/);
    const items = [];
    syllables.forEach((syl, si) => {
      const part = planSyllable(syl);
      part.forEach((it, i) => {
        const last = i === part.length - 1;
        let kind = it.kind === 'syllable_final' ? 'word' : it.kind;
        let ttsText = it.text;
        if (kind === 'tone') ttsText = 'dấu ' + it.text;
        // Vần có âm cuối tắc (c, ch, p, t) hoặc vần dài 3 chữ cái (anh, ach, iêng...) cần đọc chậm, kéo dài hơn
        const hold = kind === 'rime' && (HOLD_FINALS.test(it.text) || [...it.text].length >= 3 || /(nh|ng)$/.test(it.text));
        items.push({
          text: it.text,
          kind,
          ttsText,
          audioFile: audioFileName(it.text),
          speed: SPEED[kind] * (hold ? 0.75 : 1),
          pauseAfter: last && si < syllables.length - 1 ? 900 : (hold ? 950 : PAUSE[kind]),
        });
      });
    });
    // từ nhiều tiếng: đọc trơn cả từ ở cuối
    if (syllables.length > 1) {
      const whole = syllables.join(' ');
      items.push({
        text: whole, kind: 'word', ttsText: whole, audioFile: audioFileName(whole),
        speed: SPEED.word, pauseAfter: PAUSE.word,
      });
    }
    return items;
  }

  /** Danh sách file âm thanh cần thu/tạo cho một danh sách từ vựng */
  function neededAudio(words) {
    const map = new Map();
    for (const w of words) for (const it of planWord(w)) map.set(it.audioFile, it.text);
    return [...map.entries()].map(([file, text]) => ({ file: file + '.mp3', text })).sort((a, b) => a.file.localeCompare(b.file));
  }

  function createPlayer(options) {
    const o = Object.assign({
      audioBase: null,      // ví dụ '06-assets/audio/spelling/steps/'; null = chỉ dùng giọng máy
      audioMap: null,       // map ánh xạ chuỗi âm -> đường dẫn file âm thanh thật
      lang: 'vi-VN',
      rate: 0.8,            // tốc độ gốc của giọng máy (0.1 - 2)
      voiceName: null,
      ttsOverride: {},      // ví dụ { ach: 'ách ách' } để thử cách đọc khác cho giọng máy
      onItem: null,         // callback (item, index) để highlight chữ đang đọc
    }, options || {});
    let runId = 0;
    let currentAudio = null;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    function playAudio(url) {
      return new Promise((resolve) => {
        if (!url || typeof Audio === 'undefined') return resolve(false);
        try {
          const a = new Audio(url);
          currentAudio = a;
          a.onended = () => resolve(true);
          a.onerror = () => resolve(false);
          const p = a.play();
          if (p && p.catch) p.catch(() => resolve(false));
        } catch (e) {
          resolve(false);
        }
      });
    }

    // Luôn phát âm chuẩn tiếng Việt 100%, TUYỆT ĐỐI KHÔNG DÙNG GIỌNG TIẾNG ANH
    function speakTTS(text, rate) {
      return new Promise((resolve) => {
        const synth = root.speechSynthesis;
        let viVoice = null;
        if (synth && synth.getVoices) {
          const voices = synth.getVoices();
          if (o.voiceName && o.voiceName !== '__google__') {
            viVoice = voices.find((x) => x.name === o.voiceName);
          }
          if (!viVoice && o.voiceName !== '__google__') {
            viVoice = voices.find((x) => x.lang && x.lang.toLowerCase().startsWith('vi'));
          }
        }

        // Nếu máy có sẵn giọng tiếng Việt chính thức trong hệ thống:
        if (synth && viVoice) {
          try {
            const u = new SpeechSynthesisUtterance(text);
            u.voice = viVoice;
            u.lang = viVoice.lang || o.lang || 'vi-VN';
            u.rate = Math.max(0.1, Math.min(2, rate));
            u.onend = () => resolve(true);
            u.onerror = () => fallbackGoogleTTS(text, resolve);
            synth.speak(u);
            return;
          } catch (e) {
            // fallback nếu lỗi
          }
        }

        // Nếu máy không có giọng tiếng Việt (máy tính Windows, trình duyệt thiếu voice vi-VN):
        // KHÔNG cho speechSynthesis dùng giọng tiếng Anh mặc định (David/Zira) đọc tiếng Việt!
        // Thay vào đó chuyển phát Google Translate TTS stream chuẩn tiếng Việt 100%:
        fallbackGoogleTTS(text, resolve);
      });
    }

    function fallbackGoogleTTS(text, resolve) {
      if (typeof Audio === 'undefined') return resolve(false);
      try {
        const clean = text.replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
        const url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=' + encodeURIComponent(clean);
        const a = new Audio(url);
        currentAudio = a;
        a.onended = () => resolve(true);
        a.onerror = () => resolve(false);
        const p = a.play();
        if (p && p.catch) p.catch(() => resolve(false));
      } catch (e) {
        resolve(false);
      }
    }

    function stop() {
      runId++;
      if (root.speechSynthesis) root.speechSynthesis.cancel();
      if (currentAudio) { try { currentAudio.pause(); currentAudio.currentTime = 0; } catch (e) { /* bỏ qua */ } }
    }

    async function say(word) {
      stop();
      const my = ++runId;
      const items = planWord(word);
      for (let i = 0; i < items.length; i++) {
        if (my !== runId) return;
        const it = items[i];
        if (o.onItem) o.onItem(it, i);
        let ok = false;
        // 1. Kiểm tra ánh xạ audioMap
        if (o.audioMap && o.audioMap[it.text]) {
          ok = await playAudio(o.audioMap[it.text]);
        }
        // 2. Kiểm tra trực tiếp theo tên chuỗi âm trong audioBase
        if (!ok && o.audioBase) {
          ok = await playAudio(o.audioBase + encodeURIComponent(it.text) + '.mp3');
        }
        // 3. Kiểm tra theo hex audioFile
        if (!ok && o.audioBase) {
          ok = await playAudio(o.audioBase + it.audioFile + '.mp3');
        }
        // 4. Nếu không có file thu: phát âm tiếng Việt chuẩn 100% (giọng vi-VN hoặc Google vi TTS)
        if (!ok) {
          const text = o.ttsOverride[it.text] && it.kind !== 'tone' ? o.ttsOverride[it.text] : it.ttsText;
          await speakTTS(text, o.rate * it.speed);
        }
        if (my !== runId) return;
        await sleep(it.pauseAfter);
      }
    }

    function setRate(r) {
      o.rate = Math.max(0.1, Math.min(2, r));
    }

    function setAudioMap(m) {
      o.audioMap = m;
    }

    return { say, stop, setRate, setAudioMap };
  }

  const api = { planWord, planSyllable, neededAudio, audioFileName, createPlayer };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DanhVanSpeech = api;
})(typeof window !== 'undefined' ? window : globalThis);
