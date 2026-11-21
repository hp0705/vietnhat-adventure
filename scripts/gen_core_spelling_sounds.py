import asyncio
import os
import json
import edge_tts

VOICE = 'vi-VN-HoaiMyNeural'
out_dir = '06-assets/audio/spelling/steps'
os.makedirs(out_dir, exist_ok=True)

with open('01-vocabulary/spelling_step_audio_map.json', encoding='utf-8') as f:
    step_map = json.load(f)

core_items = {
    'sắc': 'sắc',
    'huyền': 'huyền',
    'hỏi': 'hỏi',
    'ngã': 'ngã',
    'nặng': 'nặng',
    'giờ': 'giờ',
    'quờ': 'quờ',
    'kờ': 'cờ'
}

async def main():
    for name, tts_text in core_items.items():
        file_path = f"{out_dir}/{name}.mp3"
        print(f"Synthesizing: {name} (as '{tts_text}')...")
        c = edge_tts.Communicate(tts_text, VOICE)
        await c.save(file_path)
        step_map[name] = file_path
        print(f"  Saved {file_path} ({os.path.getsize(file_path)} bytes)")
        await asyncio.sleep(0.3)

    with open('01-vocabulary/spelling_step_audio_map.json', 'w', encoding='utf-8') as f:
        json.dump(step_map, f, ensure_ascii=False, indent=2)

    print("Core spelling sounds updated successfully!")

if __name__ == '__main__':
    asyncio.run(main())
