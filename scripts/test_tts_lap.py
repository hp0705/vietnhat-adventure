import asyncio
import edge_tts

async def test():
    trials = [
        "lắp sắc, lắp",
        "Lờ, ă, phờ, ăp, lờ ăp lăp sắc lắp",
        "lờ, ăp, lăp sắc lắp",
        "lờ, ă, phờ, ăp, lờ, ăp, lắp",
        "Lờ ă phờ ăp, lờ ăp lăp sắc lắp"
    ]
    for t in trials:
        try:
            c = edge_tts.Communicate(t, 'vi-VN-HoaiMyNeural')
            await c.save('test_lap_variant.mp3')
            print(f"[SUCCESS] '{t}'")
        except Exception as e:
            print(f"[FAIL] '{t}' -> {e}")

if __name__ == '__main__':
    asyncio.run(test())
