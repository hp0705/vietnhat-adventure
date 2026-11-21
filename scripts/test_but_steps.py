import asyncio
import os
import edge_tts

VOICE = 'vi-VN-HoaiMyNeural'

test_variants = [
    ('step_4', ['u tờ ut.', 'u, tờ, ut', 'u tờ, ut', 'u - tờ - ut', 'U tờ ut']),
    ('step_5', ['bờ ut but.', 'bờ, ut, but', 'bờ ut, but', 'Bờ ut but']),
    ('step_6', ['but sắc bút.', 'but, sắc, bút', 'but sắc, bút', 'But sắc bút'])
]

async def check():
    for name, variants in test_variants:
        for v in variants:
            try:
                c = edge_tts.Communicate(v, VOICE)
                await c.save('test_tmp_step.mp3')
                size = os.path.getsize('test_tmp_step.mp3')
                if size > 3000:
                    print(f'OK: {name} -> [{v}] ({size} bytes)')
                    break
            except Exception as e:
                print(f'FAIL: {name} -> [{v}] ({e})')

if __name__ == '__main__':
    asyncio.run(check())
