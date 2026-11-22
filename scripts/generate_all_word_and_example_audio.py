import asyncio
import os
import sys
import json
import urllib.parse
import urllib.request
import edge_tts

sys.stdout.reconfigure(line_buffering=True)
VOICE = 'vi-VN-HoaiMyNeural'

def fetch_google_tts(text):
    clean = text.replace('"', '').replace("'", "").strip()
    encoded = urllib.parse.quote(clean)
    url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q={encoded}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = resp.read()
            if len(data) > 500:
                return data
    except Exception as e:
        print(f"  [Google TTS Error] {e} for '{clean}'")
    return None

async def get_edge_audio(clean):
    c = edge_tts.Communicate(clean, VOICE)
    buf = bytearray()
    async for chunk in c.stream():
        if chunk['type'] == 'audio':
            buf.extend(chunk['data'])
    if len(buf) > 1000:
        return buf
    return None

async def get_audio_bytes(text):
    clean = text.replace('"', '').replace("'", "").strip()
    if not clean:
        return None

    # 1. Edge TTS with 3.5s timeout
    try:
        b = await asyncio.wait_for(get_edge_audio(clean), timeout=3.5)
        if b:
            return b
    except Exception:
        pass

    # 2. Google TTS fallback
    try:
        g = fetch_google_tts(clean)
        if g and len(g) > 500:
            return g
    except Exception:
        pass

    return None

async def ensure_file(text, filepath):
    if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
        return True

    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    audio_data = await get_audio_bytes(text)
    if audio_data and len(audio_data) > 500:
        with open(filepath, 'wb') as f:
            f.write(audio_data)
        await asyncio.sleep(0.04)
        return True
    return False

async def main():
    print("=== 1. CẬP NHẬT METADATA VOCABULARY_VI_V2.JSON ===")
    vocab_path = '01-vocabulary/vocabulary_vi_v2.json'
    with open(vocab_path, 'r', encoding='utf-8') as f:
        vocab_data = json.load(f)

    vocab_fixed = 0
    for it in vocab_data['items']:
        item_id = it['id']
        word = it['word']
        example = it.get('example_vi') or word
        w_path = f"06-assets/audio/vi/north-hanoi/{item_id}/word.mp3"
        ex_path = f"06-assets/audio/vi/north-hanoi/{item_id}/example.mp3"

        if not os.path.exists(w_path) or os.path.getsize(w_path) < 1000:
            ok = await ensure_file(word, w_path)
            if ok:
                vocab_fixed += 1

        if not os.path.exists(ex_path) or os.path.getsize(ex_path) < 1000:
            ok = await ensure_file(example, ex_path)
            if ok:
                vocab_fixed += 1

        if 'audio' not in it or not isinstance(it['audio'], dict):
            it['audio'] = {}
        it['audio']['word_full'] = w_path
        it['audio']['example_sentence'] = ex_path
        if 'dialects' not in it['audio'] or not isinstance(it['audio']['dialects'], dict):
            it['audio']['dialects'] = {}
        if 'north' not in it['audio']['dialects'] or not isinstance(it['audio']['dialects']['north'], dict):
            it['audio']['dialects']['north'] = {}
        it['audio']['dialects']['north']['word_full'] = w_path
        it['audio']['dialects']['north']['example_sentence'] = ex_path

    with open(vocab_path, 'w', encoding='utf-8') as f:
        json.dump(vocab_data, f, ensure_ascii=False, indent=2)
    print(f"Vocab hoàn tất! Đã bổ sung: {vocab_fixed} file.")

    print("\n=== 2. TẠO CÂU VÍ DỤ CHO SPELLING_PRACTICE_VI_V1.JSON ===")
    spelling_path = '01-vocabulary/spelling_practice_vi_v1.json'
    with open(spelling_path, 'r', encoding='utf-8') as f:
        spelling_data = json.load(f)

    sp_new_ex = 0
    total_sp = len(spelling_data['items'])
    for idx, it in enumerate(spelling_data['items']):
        item_id = it['id']
        word = it['word']
        example = it.get('example_vi') or word
        w_path = f"06-assets/audio/spelling/words/{item_id}.mp3"
        ex_path = f"06-assets/audio/spelling/examples/{item_id}.mp3"

        if not os.path.exists(w_path) or os.path.getsize(w_path) < 1000:
            await ensure_file(word, w_path)

        if not os.path.exists(ex_path) or os.path.getsize(ex_path) < 1000:
            ok = await ensure_file(example, ex_path)
            if ok:
                sp_new_ex += 1

        if 'audio' not in it or not isinstance(it['audio'], dict):
            it['audio'] = {}
        it['audio']['word_full'] = w_path
        it['audio']['example_sentence'] = ex_path
        if 'dialects' not in it['audio'] or not isinstance(it['audio']['dialects'], dict):
            it['audio']['dialects'] = {}
        if 'north' not in it['audio']['dialects'] or not isinstance(it['audio']['dialects']['north'], dict):
            it['audio']['dialects']['north'] = {}
        it['audio']['dialects']['north']['word_full'] = w_path
        it['audio']['dialects']['north']['example_sentence'] = ex_path

        if (idx + 1) % 25 == 0 or idx + 1 == total_sp:
            print(f"  Spelling tiến độ: {idx + 1}/{total_sp} (Đã tạo mới {sp_new_ex} câu ví dụ)...")

    with open(spelling_path, 'w', encoding='utf-8') as f:
        json.dump(spelling_data, f, ensure_ascii=False, indent=2)

    print(f"\nSpelling hoàn tất: Đã tạo mới {sp_new_ex} câu ví dụ.")

    print("\n=== 3. KIỂM TRA TỔNG QUÁT ===")
    v_missing_w = [it['id'] for it in vocab_data['items'] if not os.path.exists(f"06-assets/audio/vi/north-hanoi/{it['id']}/word.mp3") or os.path.getsize(f"06-assets/audio/vi/north-hanoi/{it['id']}/word.mp3") < 1000]
    v_missing_ex = [it['id'] for it in vocab_data['items'] if not os.path.exists(f"06-assets/audio/vi/north-hanoi/{it['id']}/example.mp3") or os.path.getsize(f"06-assets/audio/vi/north-hanoi/{it['id']}/example.mp3") < 1000]
    s_missing_w = [it['id'] for it in spelling_data['items'] if not os.path.exists(f"06-assets/audio/spelling/words/{it['id']}.mp3") or os.path.getsize(f"06-assets/audio/spelling/words/{it['id']}.mp3") < 1000]
    s_missing_ex = [it['id'] for it in spelling_data['items'] if not os.path.exists(f"06-assets/audio/spelling/examples/{it['id']}.mp3") or os.path.getsize(f"06-assets/audio/spelling/examples/{it['id']}.mp3") < 1000]

    print(f"Vocab words thiếu: {len(v_missing_w)}")
    print(f"Vocab examples thiếu: {len(v_missing_ex)}")
    print(f"Spelling words thiếu: {len(s_missing_w)}")
    print(f"Spelling examples thiếu: {len(s_missing_ex)}")

    if not v_missing_w and not v_missing_ex and not s_missing_w and not s_missing_ex:
        print("\n🎉 THÀNH CÔNG 100%: TẤT CẢ 198 TỪ VỰNG VÀ 230 TỪ ĐÁNH VẦN ĐÃ CÓ FILE ÂM THANH ĐẦY ĐỦ!")
    else:
        print("\n⚠️ Cảnh báo: Vẫn còn file thiếu!")

if __name__ == '__main__':
    asyncio.run(main())
