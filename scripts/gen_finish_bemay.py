import asyncio
import os
import shutil
import edge_tts

VOICE = 'vi-VN-HoaiMyNeural'

phrases = {
    'encourage_4': 'Bé Mây gần đúng rồi',
    'encourage_5': 'Bé Mây hãy chọn lại nhé'
}

async def run():
    for name, text in phrases.items():
        fn = f'06-assets/audio/common/{name}.mp3'
        c = edge_tts.Communicate(text, VOICE)
        await c.save(fn)
        size = os.path.getsize(fn)
        print(f'{name}: {text} ({size} bytes)')

    # Also make sure correct-north.mp3 and try-again-north.mp3 are updated
    shutil.copyfile('06-assets/audio/common/praise_0.mp3', '06-assets/audio/common/correct-north.mp3')
    shutil.copyfile('06-assets/audio/common/encourage_0.mp3', '06-assets/audio/common/try-again-north.mp3')
    print("Copied correct-north and try-again-north successfully.")

if __name__ == '__main__':
    asyncio.run(run())
