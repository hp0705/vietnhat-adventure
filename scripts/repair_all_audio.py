import asyncio
import os
import json
import time
import edge_tts

VOICE = 'vi-VN-HoaiMyNeural'

with open('01-vocabulary/vocabulary_vi_v2.json', encoding='utf-8') as f:
    vocab_data = json.load(f)

authored_items = [it for it in vocab_data['items'] if it.get('content_status') == 'authored_starter']
print(f"Total authored items: {len(authored_items)}")

async def synth_with_retry(text, out_path, max_retries=5):
    for attempt in range(max_retries):
        try:
            if os.path.exists(out_path) and os.path.getsize(out_path) > 100:
                return True
            if os.path.exists(out_path):
                os.remove(out_path)
            
            c = edge_tts.Communicate(text, VOICE)
            await c.save(out_path)
            if os.path.exists(out_path) and os.path.getsize(out_path) > 100:
                print(f"  [OK] {out_path} ({os.path.getsize(out_path)} bytes)")
                return True
        except Exception as e:
            print(f"  [Attempt {attempt+1} failed] {text} -> {e}")
        await asyncio.sleep(1.0 + attempt * 0.5)
    return False

async def main():
    fixed = 0
    total_checked = 0
    for item in authored_items:
        iid = item['id']
        word = item['word']
        example = item.get('example_vi') or ''
        seq = item.get('phonics', {}).get('sequence', [])
        
        dir_path = f'06-assets/audio/vi/north-hanoi/{iid}'
        os.makedirs(dir_path, exist_ok=True)
        
        # 1. word.mp3
        total_checked += 1
        w_path = f'{dir_path}/word.mp3'
        if not os.path.exists(w_path) or os.path.getsize(w_path) < 100:
            print(f"Repairing word: {word} ({iid})")
            if await synth_with_retry(word, w_path):
                fixed += 1
            await asyncio.sleep(0.3)
            
        # 2. example.mp3
        if example:
            total_checked += 1
            e_path = f'{dir_path}/example.mp3'
            if not os.path.exists(e_path) or os.path.getsize(e_path) < 100:
                print(f"Repairing example for: {word} ({iid})")
                if await synth_with_retry(example, e_path):
                    fixed += 1
                await asyncio.sleep(0.3)
                
        # 3. Phonics steps
        for idx, step_text in enumerate(seq):
            total_checked += 1
            s_path = f'{dir_path}/step_{idx + 1}.mp3'
            if not os.path.exists(s_path) or os.path.getsize(s_path) < 100:
                print(f"Repairing step {idx + 1} ({step_text}) for: {word} ({iid})")
                tts_text = step_text
                if any(t in step_text for t in ['hỏi', 'ngã', 'nặng', 'huyền', 'sắc']):
                    parts = step_text.split()
                    if len(parts) >= 3:
                        tts_text = f"{parts[0]} {parts[1]}, {parts[2]}"
                if await synth_with_retry(tts_text, s_path):
                    fixed += 1
                await asyncio.sleep(0.3)

    print(f"\nDone! Checked {total_checked} audio targets. Fixed {fixed} missing/empty files.")

if __name__ == '__main__':
    asyncio.run(main())
