import asyncio
import os
import edge_tts

VOICE = 'vi-VN-HoaiMyNeural'

steps = [
    ('step_1', 'bờ'),
    ('step_2', 'u'),
    ('step_3', 'tờ'),
    ('step_4', 'u, tờ, ut'),
    ('step_5', 'bờ, ut, but'),
    ('step_6', 'but sắc bút.')
]

async def run():
    out_dir = '06-assets/audio/vi/north-hanoi/vi_0019'
    os.makedirs(out_dir, exist_ok=True)
    for name, text in steps:
        target = f'{out_dir}/{name}.mp3'
        c = edge_tts.Communicate(text, VOICE)
        await c.save(target)
        print(f'{name} ({text}): {os.path.getsize(target)} bytes')

    # Ensure word.mp3 and example.mp3 are also present and crisp
    c_word = edge_tts.Communicate('bút', VOICE)
    await c_word.save(f'{out_dir}/word.mp3')
    print(f'word.mp3: {os.path.getsize(f"{out_dir}/word.mp3")} bytes')

    c_ex = edge_tts.Communicate('Bé cầm bút vẽ ngôi nhà mơ ước.', VOICE)
    await c_ex.save(f'{out_dir}/example.mp3')
    print(f'example.mp3: {os.path.getsize(f"{out_dir}/example.mp3")} bytes')

if __name__ == '__main__':
    asyncio.run(run())
