import asyncio
import json
import os
import re
import sys
import unicodedata
import edge_tts

sys.path.append('scripts')
from gen_needed_audio import plan_word

def safe_filename(text):
    out = []
    for ch in unicodedata.normalize('NFC', text):
        if ('a' <= ch <= 'z') or ('0' <= ch <= '9'):
            out.append(ch)
        else:
            out.append(f"_{ord(ch):x}")
    return ''.join(out)

TTS_OVERRIDE = {
    'ăt': 'ắt.',
    'ut': 'út.',
    'uc': 'úc.',
    'it': 'ít.',
    'ach': 'ách.',
}

sem = asyncio.Semaphore(2)

async def synthesize_token(tok, target_path):
    async with sem:
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        if os.path.exists(target_path):
            if os.path.getsize(target_path) > 1000:
                return True
            else:
                try:
                    os.remove(target_path)
                except OSError:
                    pass

        texts_to_try = [
            TTS_OVERRIDE.get(tok, f"{tok}."),
            tok,
            f"từ {tok}."
        ]
        
        voice = 'vi-VN-HoaiMyNeural'
        rate = '-15%'
        for text in texts_to_try:
            try:
                comm = edge_tts.Communicate(text, voice, rate=rate)
                await comm.save(target_path)
                if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
                    await asyncio.sleep(0.15)
                    return True
                if os.path.exists(target_path):
                    os.remove(target_path)
            except Exception:
                if os.path.exists(target_path):
                    try:
                        os.remove(target_path)
                    except OSError:
                        pass
                await asyncio.sleep(0.3)
        return False

async def main():
    # Remove any 0-byte files in 06-assets/audio/spelling/steps/
    steps_dir = '06-assets/audio/spelling/steps'
    for f in os.listdir(steps_dir):
        fp = os.path.join(steps_dir, f)
        if os.path.isfile(fp) and os.path.getsize(fp) == 0:
            try:
                os.remove(fp)
            except OSError:
                pass

    with open('01-vocabulary/spelling_step_audio_map.json', encoding='utf-8') as f:
        step_map = json.load(f)

    with open('01-vocabulary/vocabulary_vi_v2.json', encoding='utf-8') as f:
        vocab_data = json.load(f)

    if os.path.exists('06-assets/audio/spelling/words/cuc_da.mp3'):
        step_map['cục đá'] = '06-assets/audio/spelling/words/cuc_da.mp3'

    missing_tokens = []
    for it in vocab_data.get('items', [])[:100]:
        for s in plan_word(it['word']):
            tok = s['text']
            if tok not in step_map or not os.path.exists(step_map[tok]) or os.path.getsize(step_map[tok]) < 1000:
                if tok not in missing_tokens:
                    missing_tokens.append(tok)

    print(f"Found {len(missing_tokens)} missing/invalid tokens to synthesize.")

    tasks = []
    tok_map = {}
    for tok in missing_tokens:
        safe_name = safe_filename(tok)
        target_path = f"06-assets/audio/spelling/steps/step_{safe_name}.mp3"
        tok_map[tok] = target_path
        tasks.append(synthesize_token(tok, target_path))

    results = await asyncio.gather(*tasks)
    success_count = 0
    for tok, ok in zip(missing_tokens, results):
        target_path = tok_map[tok]
        if ok and os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
            step_map[tok] = target_path.replace('\\', '/')
            success_count += 1
        else:
            print(f"Still failed: {tok}")

    # Essential spelling words
    step_map['khách'] = '06-assets/audio/spelling/words/sp_0082.mp3'
    step_map['tháp'] = '06-assets/audio/spelling/words/sp_0002.mp3'
    step_map['sáp'] = '06-assets/audio/spelling/words/sp_0001.mp3'
    step_map['lắp'] = '06-assets/audio/spelling/words/sp_0012.mp3'
    step_map['cục đá'] = '06-assets/audio/spelling/words/cuc_da.mp3'

    with open('01-vocabulary/spelling_step_audio_map.json', 'w', encoding='utf-8') as f:
        json.dump(step_map, f, ensure_ascii=False, indent=2)

    print(f"\nCompleted! Successfully synthesized and mapped {success_count}/{len(missing_tokens)} tokens.")
    print(f"Total entries in step_map: {len(step_map)}")

if __name__ == '__main__':
    asyncio.run(main())
