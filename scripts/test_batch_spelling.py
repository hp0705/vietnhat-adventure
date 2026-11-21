import asyncio
import os
import edge_tts

VOICE = 'vi-VN-HoaiMyNeural'

test_words = ['sáp', 'tháp', 'rạp', 'cặp', 'gặp', 'lắp', 'bắp', 'nắp', 'đắp', 'thắp']

async def run():
    os.makedirs('06-assets/audio/spelling_test', exist_ok=True)
    for w in test_words:
        target = f'06-assets/audio/spelling_test/{w}.mp3'
        c = edge_tts.Communicate(w, VOICE)
        await c.save(target)
        print(f'{w}: {os.path.getsize(target)} bytes')

if __name__ == '__main__':
    asyncio.run(run())
