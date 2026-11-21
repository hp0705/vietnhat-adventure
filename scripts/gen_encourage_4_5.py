import asyncio
import os
import edge_tts

VOICE = 'vi-VN-HoaiMyNeural'

cands_4_5 = [
    ('encourage_4', 'Bé Mây ơi cố lên nào!'),
    ('encourage_4', 'Bé Mây cố lên nào!'),
    ('encourage_4', 'Gần đúng rồi bé Mây.'),
    ('encourage_4', 'Bé Mây cố lên nhé!'),
    ('encourage_4', 'Cố lên bé Mây ơi!'),
    ('encourage_5', 'Bé Mây quan sát thật kỹ nhé!'),
    ('encourage_5', 'Bé Mây nhìn kỹ lại nha!'),
    ('encourage_5', 'Bé Mây quan sát kỹ nhé!'),
    ('encourage_5', 'Bé Mây chọn lại một lần nữa nha!'),
    ('encourage_5', 'Bé Mây nhìn lại hình nhé!')
]

async def test():
    results = {}
    for name, text in cands_4_5:
        if name in results:
            continue
        fn = f'06-assets/audio/common/{name}.mp3'
        try:
            c = edge_tts.Communicate(text, VOICE)
            await c.save(fn)
            size = os.path.getsize(fn)
            if size > 5000:
                print(f'SUCCESS: {name} -> "{text}" ({size} bytes)', flush=True)
                results[name] = text
        except Exception as e:
            pass

    print("DONE:", results, flush=True)

if __name__ == '__main__':
    asyncio.run(test())
