import asyncio
import os
import shutil
import edge_tts

VOICE = 'vi-VN-HoaiMyNeural'

candidates = {
    'praise_0': [
        'Đúng rồi Bé Mây giỏi quá',
        'Đúng rồi, bé Mây giỏi quá.',
        'Bé Mây giỏi quá!'
    ],
    'praise_1': [
        'Hoan hô bé Mây!',
        'Hoan hô bé Mây rất thông minh.',
        'Hoan hô bé Mây, thông minh quá.'
    ],
    'praise_2': [
        'Bé Mây tuyệt vời quá.',
        'Chính xác rồi, bé Mây tuyệt vời quá.',
        'Tuyệt vời quá bé Mây ơi!'
    ],
    'praise_3': [
        'Bé Mây chọn đúng rồi',
        'Bé Mây chọn đúng rồi, rất giỏi.',
        'Bé Mây chọn chuẩn quá!'
    ],
    'praise_4': [
        'Bé Mây rất là giỏi.',
        'Bé Mây chăm ngoan giỏi quá.',
        'Bé Mây học giỏi quá!'
    ],
    'praise_5': [
        'Bé Mây làm tốt lắm!',
        'Đúng rồi, bé Mây làm tốt lắm.',
        'Bé Mây làm tốt lắm nhé!'
    ],
    'praise_6': [
        'Bé Mây trả lời rất hay.',
        'Bé Mây trả lời đúng rồi.',
        'Bé Mây thông minh quá.'
    ],
    'praise_7': [
        'Bé Mây nhớ bài rất giỏi.',
        'Bé Mây nhớ bài rất tốt.',
        'Giỏi quá, bé Mây nhớ bài rồi.'
    ],
    'encourage_0': [
        'Bé Mây cố lên, thử lại lần nữa nào!',
        'Bé Mây cố lên, thử lại lần nữa nào.',
        'Bé Mây cố lên nhé.'
    ],
    'encourage_1': [
        'Bé Mây nhìn kỹ lại nhé!',
        'Bé Mây nhìn kỹ lại nhé.',
        'Bé Mây nhìn lại nhé.'
    ],
    'encourage_2': [
        'Bé Mây thử chọn lại nhé.',
        'Tiếc quá, bé Mây thử chọn lại nhé.',
        'Bé Mây chọn lại nhé.'
    ],
    'encourage_3': [
        'Không sao đâu bé Mây, cùng làm lại nào.',
        'Không sao đâu bé Mây yêu, cùng làm lại nào.',
        'Bé Mây đừng lo, cùng làm lại nào.'
    ],
    'encourage_4': [
        'Gần đúng rồi bé Mây ơi.',
        'Gần đúng rồi, bé Mây thử lại nhé.',
        'Bé Mây sắp làm đúng rồi.'
    ],
    'encourage_5': [
        'Bé Mây nhìn kỹ chữ rồi chọn nhé.',
        'Bé Mây nhìn kỹ hình và chọn lại nhé.',
        'Bé Mây nhìn lại một lần nữa nhé.'
    ]
}

async def run():
    final_map = {}
    for key, c_list in candidates.items():
        saved = False
        for text in c_list:
            target = f'06-assets/audio/common/{key}.mp3'
            try:
                c = edge_tts.Communicate(text, VOICE)
                await c.save(target)
                size = os.path.getsize(target)
                if size > 5000:
                    print(f'SUCCESS: {key} -> "{text}" ({size} bytes)')
                    final_map[key] = text
                    saved = True
                    break
            except Exception as e:
                pass
        if not saved:
            print(f'FAILED: {key}')

    # Also copy praise_0 to correct-north.mp3 and encourage_0 to try-again-north.mp3
    if 'praise_0' in final_map:
        shutil.copyfile('06-assets/audio/common/praise_0.mp3', '06-assets/audio/common/correct-north.mp3')
        print("Copied praise_0.mp3 -> correct-north.mp3")
    if 'encourage_0' in final_map:
        shutil.copyfile('06-assets/audio/common/encourage_0.mp3', '06-assets/audio/common/try-again-north.mp3')
        print("Copied encourage_0.mp3 -> try-again-north.mp3")

    print("\nSUMMARY_DICT:")
    for k, v in final_map.items():
        print(f"'{k}': '{v}',")

if __name__ == '__main__':
    asyncio.run(run())
