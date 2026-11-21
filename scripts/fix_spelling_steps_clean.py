import asyncio
import os
import json
import hashlib
import edge_tts

VOICE = 'vi-VN-HoaiMyNeural'
out_dir = '06-assets/audio/spelling/steps'
os.makedirs(out_dir, exist_ok=True)

with open('01-vocabulary/spelling_practice_vi_v1.json', encoding='utf-8') as f:
    sp_data = json.load(f)

with open('01-vocabulary/spelling_step_audio_map.json', encoding='utf-8') as f:
    step_map = json.load(f)

# Find all steps needed
all_steps = set()
for it in sp_data['items']:
    seq = it.get('phonics', {}).get('sequence', [])
    for s in seq:
        all_steps.add(s)

def get_tts_friendly_text(s):
    # If text is like 'lăp sắc lắp', Azure TTS fails on 'lăp'
    # Convert 'lăp sắc lắp' to 'lắp sắc, lắp' or similar
    if 'ăp' in s and 'sắc' in s:
        # e.g. 'lăp sắc lắp' -> 'lắp sắc, lắp'
        parts = s.split()
        return f"{parts[-1]} sắc, {parts[-1]}"
    if 'sắc' in s or 'huyền' in s or 'hỏi' in s or 'ngã' in s or 'nặng' in s:
        parts = s.split()
        if len(parts) >= 3:
            return f"{parts[0]} {parts[1]}, {parts[2]}"
    return s

async def synth_step(text, path, max_retries=3):
    tts_text = get_tts_friendly_text(text)
    for attempt in range(max_retries):
        try:
            if os.path.exists(path) and os.path.getsize(path) > 1000:
                return True
            if os.path.exists(path):
                os.remove(path)
            c = edge_tts.Communicate(tts_text, VOICE)
            await c.save(path)
            if os.path.exists(path) and os.path.getsize(path) > 1000:
                print(f"  [OK] '{text}' (as '{tts_text}') -> {path}")
                return True
        except Exception as e:
            pass
        await asyncio.sleep(0.3)
    return False

async def main():
    fixed = 0
    for s in sorted(list(all_steps)):
        target = step_map.get(s)
        needs_synth = not target or not os.path.exists(target) or os.path.getsize(target) < 1000
        if needs_synth:
            hash_str = hashlib.md5(s.encode('utf-8')).hexdigest()[:8]
            clean_name = ''.join(c if c.isalnum() else '_' for c in s)[:10]
            file_path = f"{out_dir}/{clean_name}_{hash_str}.mp3"
            if await synth_step(s, file_path):
                step_map[s] = file_path
                fixed += 1
            await asyncio.sleep(0.15)

    with open('01-vocabulary/spelling_step_audio_map.json', 'w', encoding='utf-8') as f:
        json.dump(step_map, f, ensure_ascii=False, indent=2)

    print(f"Finished! Synthesized/mapped {fixed} steps. Total entries in map: {len(step_map)}")

if __name__ == '__main__':
    asyncio.run(main())
