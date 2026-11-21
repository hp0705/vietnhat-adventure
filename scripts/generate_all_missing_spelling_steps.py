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

print(f"Total unique steps: {len(all_steps)}")

async def synth(text, path, max_retries=5):
    for attempt in range(max_retries):
        try:
            if os.path.exists(path) and os.path.getsize(path) > 100:
                return True
            if os.path.exists(path):
                os.remove(path)
            tts_text = text
            if any(t in text for t in ['sắc', 'huyền', 'hỏi', 'ngã', 'nặng']):
                parts = text.split()
                if len(parts) >= 3:
                    tts_text = f"{parts[0]} {parts[1]}, {parts[2]}"
            c = edge_tts.Communicate(tts_text, VOICE)
            await c.save(path)
            if os.path.exists(path) and os.path.getsize(path) > 100:
                return True
        except Exception as e:
            pass
        await asyncio.sleep(0.5 + attempt * 0.3)
    return False

async def main():
    fixed = 0
    for s in sorted(list(all_steps)):
        target = step_map.get(s)
        if not target or not os.path.exists(target) or os.path.getsize(target) < 100:
            # Create a deterministic filename
            hash_str = hashlib.md5(s.encode('utf-8')).hexdigest()[:8]
            clean_name = ''.join(c if c.isalnum() else '_' for c in s)[:10]
            file_path = f"{out_dir}/{clean_name}_{hash_str}.mp3"
            print(f"Synthesizing step: '{s}' -> {file_path}")
            if await synth(s, file_path):
                step_map[s] = file_path
                fixed += 1
            await asyncio.sleep(0.1)

    with open('01-vocabulary/spelling_step_audio_map.json', 'w', encoding='utf-8') as f:
        json.dump(step_map, f, ensure_ascii=False, indent=2)

    print(f"Done! Fixed/added {fixed} steps. Total map entries: {len(step_map)}")

if __name__ == '__main__':
    asyncio.run(main())
