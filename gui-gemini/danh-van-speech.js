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
      audioBase: null,      // ví dụ '06-assets/audio/'; null = chỉ dùng giọng máy
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
        const a = new Audio(url);
        currentAudio = a;
        a.onended = () => resolve(true);
        a.onerror = () => resolve(false);
        a.play().catch(() => resolve(false));
      });
    }

    function speakTTS(text, rate) {
      return new Promise((resolve) => {
        const synth = root.speechSynthesis;
        if (!synth) return resolve(false);
        const u = new SpeechSynthesisUtterance(text);
        u.lang = o.lang;
        u.rate = Math.max(0.1, Math.min(2, rate));
        if (o.voiceName) {
          const v = synth.getVoices().find((x) => x.name === o.voiceName);
          if (v) u.voice = v;
        }
        u.onend = () => resolve(true);
        u.onerror = () => resolve(false);
        synth.speak(u);
      });
    }

    function stop() {
      runId++;
      if (root.speechSynthesis) root.speechSynthesis.cancel();
      if (currentAudio) { try { currentAudio.pause(); } catch (e) { /* bỏ qua */ } }
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
        if (o.audioBase) ok = await playAudio(o.audioBase + it.audioFile + '.mp3');
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

    return { say, stop, setRate };
  }

  const api = { planWord, planSyllable, neededAudio, audioFileName, createPlayer };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DanhVanSpeech = api;
})(typeof window !== 'undefined' ? window : globalThis);
