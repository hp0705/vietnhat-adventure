import asyncio
import os
import json
import re
import hashlib
import edge_tts

VOICE = 'vi-VN-HoaiMyNeural'

with open('01-vocabulary/spelling_practice_vi_v1.json', encoding='utf-8') as f:
    data = json.load(f)

out_dir = '06-assets/audio/spelling/steps'
os.makedirs(out_dir, exist_ok=True)

# Collect all unique phonics step texts
unique_steps = set()
for it in data['items']:
    for s in it['phonics']['sequence']:
        unique_steps.add(s)

print(f'Total unique steps: {len(unique_steps)}')

def get_step_filename(text):
    # Safe filename: clean ascii or hash
    h = hashlib.md5(text.encode('utf-8')).hexdigest()[:8]
    clean = re.sub(r'[^a-zA-Z0-9]', '_', text)[:16]
    return f'{clean}_{h}.mp3'

async def run():
    step_map = {}
    success_count = 0
    fail_count = 0
    for s in sorted(list(unique_steps)):
        fn = get_step_filename(s)
        target = f'{out_dir}/{fn}'
        if os.path.exists(target) and os.path.getsize(target) > 2000:
            step_map[s] = target
            success_count += 1
            continue
        
        # Test candidate texts if needed
        # Some edge cases: short consonants like 'bờ', 'u', 'tờ' or phrases
        candidates = [s, f'{s}.', s.replace(' ', ', ')]
        done = False
        for cand in candidates:
            try:
                c = edge_tts.Communicate(cand, VOICE)
                await c.save(target)
                if os.path.getsize(target) > 2000:
                    step_map[s] = target
                    success_count += 1
                    done = True
                    break
            except Exception:
                pass
        if not done:
            fail_count += 1

    print(f'Generated steps: {success_count} success, {fail_count} failed')
    with open('01-vocabulary/spelling_step_audio_map.json', 'w', encoding='utf-8') as f:
        json.dump(step_map, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    asyncio.run(run())
