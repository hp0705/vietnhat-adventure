import os
import json
import re
import hashlib

def get_step_filename(text):
    h = hashlib.md5(text.encode('utf-8')).hexdigest()[:8]
    clean = re.sub(r'[^a-zA-Z0-9]', '_', text)[:16]
    return f'{clean}_{h}.mp3'

with open('01-vocabulary/spelling_practice_vi_v1.json', encoding='utf-8') as f:
    d = json.load(f)

step_map = {}
steps_dir = '06-assets/audio/spelling/steps'

for it in d['items']:
    for s in it['phonics']['sequence']:
        fn = get_step_filename(s)
        p = f'{steps_dir}/{fn}'
        if os.path.exists(p) and os.path.getsize(p) > 2000:
            step_map[s] = p

print(f'Currently mapped steps: {len(step_map)}')
with open('01-vocabulary/spelling_step_audio_map.json', 'w', encoding='utf-8') as f:
    json.dump(step_map, f, ensure_ascii=False, indent=2)
