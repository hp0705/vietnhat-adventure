import asyncio
import os
import json
import edge_tts

VOICE = 'vi-VN-HoaiMyNeural'

with open('01-vocabulary/spelling_practice_vi_v1.json', encoding='utf-8') as f:
    data = json.load(f)

out_dir = '06-assets/audio/spelling/words'
os.makedirs(out_dir, exist_ok=True)

async def run():
    success_count = 0
    for it in data['items']:
        word = it['word']
        item_id = it['id']
        target = f'{out_dir}/{item_id}.mp3'
        if os.path.exists(target) and os.path.getsize(target) > 5000:
            success_count += 1
            it['audio'] = {
                'word_full': target,
                'dialects': {
                    'north': {
                        'word_full': target
                    }
                }
            }
            continue
        try:
            c = edge_tts.Communicate(word, VOICE)
            await c.save(target)
            if os.path.getsize(target) > 3000:
                success_count += 1
                it['audio'] = {
                    'word_full': target,
                    'dialects': {
                        'north': {
                            'word_full': target
                        }
                    }
                }
        except Exception as e:
            pass

    print(f'Generated {success_count}/{len(data["items"])} word audios')
    with open('01-vocabulary/spelling_practice_vi_v1.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    asyncio.run(run())
