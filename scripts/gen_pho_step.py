import asyncio
import os
import json
import edge_tts
import hashlib
import re

VOICE = 'vi-VN-HoaiMyNeural'

def get_step_filename(text):
    h = hashlib.md5(text.encode('utf-8')).hexdigest()[:8]
    clean = re.sub(r'[^a-zA-Z0-9]', '_', text)[:16]
    return f'{clean}_{h}.mp3'

out_dir = '06-assets/audio/spelling/steps'
os.makedirs(out_dir, exist_ok=True)

async def run():
    # 1. Synthesize phờ
    target = f'{out_dir}/{get_step_filename("phờ")}'
    c = edge_tts.Communicate('phờ', VOICE)
    await c.save(target)
    print(f"phờ -> {target} ({os.path.getsize(target)} bytes)")

    # 2. Also ensure steps for sáp: sờ, a, phờ, ap, sap, sap sắc sáp
    steps_sap = [
        ('sờ', 'sờ'),
        ('a', 'a'),
        ('phờ', 'phờ'),
        ('ap', 'ap'),
        ('sap', 'sap'),
        ('sap sắc sáp', 'sap sắc, sáp')
    ]
    for step_key, text_tts in steps_sap:
        fn = f'{out_dir}/{get_step_filename(step_key)}'
        c = edge_tts.Communicate(text_tts, VOICE)
        await c.save(fn)
        print(f"{step_key} -> {fn} ({os.path.getsize(fn)} bytes)")

    # 3. Update spelling_step_audio_map.json
    with open('01-vocabulary/spelling_step_audio_map.json', encoding='utf-8') as f:
        step_map = json.load(f)
    
    step_map['phờ'] = f'{out_dir}/{get_step_filename("phờ")}'
    for step_key, _ in steps_sap:
        step_map[step_key] = f'{out_dir}/{get_step_filename(step_key)}'
    
    with open('01-vocabulary/spelling_step_audio_map.json', 'w', encoding='utf-8') as f:
        json.dump(step_map, f, ensure_ascii=False, indent=2)
    print("Updated step map with phờ and sáp steps successfully!")

if __name__ == '__main__':
    asyncio.run(run())
