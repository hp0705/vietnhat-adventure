import asyncio
import os
import json
import edge_tts

VOICE = 'vi-VN-HoaiMyNeural'

new_words_data = [
    {
        'word': 'dê',
        'meaning': 'con dê có đôi sừng nhỏ và thích ăn lá cỏ',
        'example': 'Bé ngắm đàn dê trên đồi xanh.',
        'topic': 'động vật',
        'sequence': ['dờ', 'ê', 'dờ ê dê']
    },
    {
        'word': 'đỗ',
        'meaning': 'hạt đỗ xanh tròn nhỏ mẹ dùng nấu chè',
        'example': 'Mẹ nấu chè đỗ xanh thơm mát.',
        'topic': 'thực vật',
        'sequence': ['đờ', 'ô', 'đô', 'đô ngã đỗ']
    },
    {
        'word': 'bi',
        'meaning': 'viên bi tròn lấp lánh bé chơi cùng bạn',
        'example': 'Bé chơi bắn bi vui vẻ cùng bạn.',
        'topic': 'đồ chơi',
        'sequence': ['bờ', 'i', 'bờ i bi']
    },
    {
        'word': 'khỉ',
        'meaning': 'con khỉ tinh nghịch hay leo trèo trên cây',
        'example': 'Chú khỉ chuyền cành thoăn thoắt.',
        'topic': 'động vật',
        'sequence': ['khờ', 'i', 'khi', 'khi hỏi khỉ']
    },
    {
        'word': 'sò',
        'meaning': 'con sò biển có hai mảnh vỏ đẹp',
        'example': 'Bé nhặt được vỏ sò màu hồng ở bãi biển.',
        'topic': 'động vật',
        'sequence': ['sờ', 'o', 'so', 'so huyền sò']
    },
    {
        'word': 've',
        'meaning': 'con ve sầu kêu râm ran vào mùa hè',
        'example': 'Tiếng ve sầu kêu râm ran trong vòm lá.',
        'topic': 'động vật',
        'sequence': ['vờ', 'e', 'vờ e ve']
    },
    {
        'word': 'tre',
        'meaning': 'cây tre xanh tươi cao vút đầu làng',
        'example': 'Lũy tre xanh rì rào trong gió sớm.',
        'topic': 'thiên nhiên',
        'sequence': ['trờ', 'e', 'trờ e tre']
    },
    {
        'word': 'dù',
        'meaning': 'chiếc dù che mưa che nắng cho bé',
        'example': 'Bé cầm chiếc dù đỏ đi dưới trời mưa.',
        'topic': 'đồ dùng',
        'sequence': ['dờ', 'u', 'du', 'du huyền dù']
    },
    {
        'word': 'tổ',
        'meaning': 'tổ chim êm ái trên cành cây cao',
        'example': 'Chim mẹ ấp trứng trong chiếc tổ nhỏ.',
        'topic': 'thiên nhiên',
        'sequence': ['tờ', 'ô', 'tô', 'tô hỏi tổ']
    },
    {
        'word': 'nụ',
        'meaning': 'nụ hoa hồng chúm chím sắp nở',
        'example': 'Nụ hoa hồng hé nở đón ánh ban mai.',
        'topic': 'thiên nhiên',
        'sequence': ['nờ', 'u', 'nu', 'nu nặng nụ']
    },
    {
        'word': 'nho',
        'meaning': 'chùm nho tím ngọt lịm mọng nước',
        'example': 'Bé thích ăn những quả nho ngọt lịm.',
        'topic': 'thức ăn',
        'sequence': ['nhờ', 'o', 'nhờ o nho']
    },
    {
        'word': 'phở',
        'meaning': 'bát phở bò nóng hổi thơm ngon của Hà Nội',
        'example': 'Cả nhà cùng ăn bát phở sáng thơm phức.',
        'topic': 'thức ăn',
        'sequence': ['phờ', 'ơ', 'phơ', 'phơ hỏi phở']
    },
    {
        'word': 'thị',
        'meaning': 'quả thị vàng thơm ngát trong chuyện cổ tích',
        'example': 'Quả thị thơm lừng trong túi bé.',
        'topic': 'thực vật',
        'sequence': ['thờ', 'i', 'thi', 'thi nặng thị']
    },
    {
        'word': 'rổ',
        'meaning': 'chiếc rổ tre đan mẹ dùng đựng rau củ',
        'example': 'Bé giúp mẹ xếp rau vào rổ sạch.',
        'topic': 'đồ dùng',
        'sequence': ['rờ', 'ô', 'rô', 'rô hỏi rổ']
    },
    {
        'word': 'mạ',
        'meaning': 'cây mạ non xanh rờn trên cánh đồng quê',
        'example': 'Cánh đồng mạ non xanh mướt trải dài.',
        'topic': 'thiên nhiên',
        'sequence': ['mờ', 'a', 'ma', 'ma nặng mạ']
    },
    {
        'word': 'kè',
        'meaning': 'bờ kè đá vững chắc ngăn dòng nước',
        'example': 'Bé cùng ông đi dạo bên bờ kè đá mát rượi.',
        'topic': 'nơi chốn',
        'sequence': ['kờ', 'e', 'ke', 'ke huyền kè']
    },
    {
        'word': 'kho',
        'meaning': 'nhà kho rộng rãi để cất đồ đạc ngăn nắp',
        'example': 'Bố cất dụng cụ cẩn thận vào nhà kho.',
        'topic': 'nơi chốn',
        'sequence': ['khờ', 'o', 'khờ o kho']
    },
    {
        'word': 'chả',
        'meaning': 'miếng chả quế vàng ươm thơm nức',
        'example': 'Bé ăn cơm cùng miếng chả thơm lừng.',
        'topic': 'thức ăn',
        'sequence': ['chờ', 'a', 'cha', 'cha hỏi chả']
    },
    {
        'word': 'lư',
        'meaning': 'chiếc lư hương chạm trổ trang nghiêm',
        'example': 'Chiếc lư đá cổ kính đặt trước sân đình.',
        'topic': 'đồ vật',
        'sequence': ['lờ', 'ư', 'lờ ư lư']
    },
    {
        'word': 'đò',
        'meaning': 'con đò nhỏ trôi lững lờ trên bến sông quê',
        'example': 'Bác lái đò đưa khách qua sông êm đềm.',
        'topic': 'phương tiện',
        'sequence': ['đờ', 'o', 'đo', 'đo huyền đò']
    }
]

with open('01-vocabulary/vocabulary_vi_v2.json', encoding='utf-8') as f:
    vocab_data = json.load(f)

# Find IDs for these 20 words in vocabulary_vi_v2.json
word_map = {w['word']: w for w in new_words_data}

async def run():
    for item in vocab_data['items']:
        w = item['word']
        if w in word_map:
            w_info = word_map[w]
            item_id = item['id']
            dir_path = f'06-assets/audio/vi/north-hanoi/{item_id}'
            os.makedirs(dir_path, exist_ok=True)
            
            # 1. Synthesize word.mp3
            try:
                c = edge_tts.Communicate(w, VOICE)
                await c.save(f'{dir_path}/word.mp3')
            except Exception as e:
                print(f"Error word {w}: {e}")
            
            # 2. Synthesize example.mp3
            try:
                c = edge_tts.Communicate(w_info['example'], VOICE)
                await c.save(f'{dir_path}/example.mp3')
            except Exception as e:
                print(f"Error example {w}: {e}")

            # 3. Synthesize step audios
            step_files = []
            for idx, step_text in enumerate(w_info['sequence']):
                step_file = f'{dir_path}/step_{idx + 1}.mp3'
                step_files.append(step_file)
                # Formulate suitable text for TTS Communicate
                tts_text = step_text
                if 'hỏi' in step_text or 'ngã' in step_text or 'nặng' in step_text or 'huyền' in step_text or 'sắc' in step_text:
                    parts = step_text.split()
                    if len(parts) >= 3:
                        tts_text = f"{parts[0]} {parts[1]}, {parts[2]}"
                try:
                    c = edge_tts.Communicate(tts_text, VOICE)
                    await c.save(step_file)
                except Exception:
                    try:
                        c = edge_tts.Communicate(step_text, VOICE)
                        await c.save(step_file)
                    except Exception as e2:
                        print(f"Error step {step_text} for {w}: {e2}")

            # Update item in json
            item['content_status'] = 'authored_starter'
            item['meaning_vi_child'] = w_info['meaning']
            item['example_vi'] = w_info['example']
            item['topic'] = w_info['topic']
            item['phonics'] = {
                'status': 'user_confirmed',
                'sequence': w_info['sequence'],
                'complexity': f"{len(w_info['sequence'])}_am",
                'level': 2 if len(w_info['sequence']) <= 3 else 3
            }
            item['audio'] = {
                'word_full': f'{dir_path}/word.mp3',
                'example_sentence': f'{dir_path}/example.mp3',
                'phonics_steps': step_files,
                'dialects': {
                    'north': {
                        'word_full': f'{dir_path}/word.mp3',
                        'example_sentence': f'{dir_path}/example.mp3',
                        'phonics_steps': step_files
                    }
                }
            }
            print(f"DONE authoring & audio for {item_id} ({w})")

    with open('01-vocabulary/vocabulary_vi_v2.json', 'w', encoding='utf-8') as f:
        json.dump(vocab_data, f, ensure_ascii=False, indent=2)
    print("Updated vocabulary_vi_v2.json with 20 newly authored words!")

if __name__ == '__main__':
    asyncio.run(run())
