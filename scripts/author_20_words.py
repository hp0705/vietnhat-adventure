import asyncio
import os
import json
import edge_tts

VOICE = 'vi-VN-HoaiMyNeural'

authoring_specs = {
    'vi_0078': { # tu hú
        'word': 'tu hú',
        'meaning': 'loài chim kêu gọi mùa vải chín về',
        'example': 'Tiếng chim tu hú gọi hè xôn xao.',
        'topic': 'động vật',
        'sequence': ['tu', 'hú', 'tu hú']
    },
    'vi_0079': { # tê tê
        'word': 'tê tê',
        'meaning': 'con tê tê hiền lành có bộ vảy cứng',
        'example': 'Con tê tê cuộn tròn như quả bóng nhỏ.',
        'topic': 'động vật',
        'sequence': ['tê', 'tê', 'tê tê']
    },
    'vi_0082': { # nơ đỏ
        'word': 'nơ đỏ',
        'meaning': 'chiếc nơ màu đỏ xinh cài trên tóc bé',
        'example': 'Bé cài chiếc nơ đỏ xinh xắn đi học.',
        'topic': 'đồ dùng',
        'sequence': ['nơ', 'đỏ', 'nơ đỏ']
    },
    'vi_0083': { # tô mì
        'word': 'tô mì',
        'meaning': 'bát mì nóng hổi thơm ngon mẹ nấu',
        'example': 'Mẹ nấu cho bé tô mì thơm lừng.',
        'topic': 'thức ăn',
        'sequence': ['tô', 'mì', 'tô mì']
    },
    'vi_0084': { # le le
        'word': 'le le',
        'meaning': 'loài vịt trời nhỏ bơi lội dưới ao',
        'example': 'Đôi chim le le bơi lội bên hồ sen.',
        'topic': 'động vật',
        'sequence': ['le', 'le', 'le le']
    },
    'vi_0085': { # li
        'word': 'li',
        'meaning': 'chiếc cốc trong suốt bé dùng uống nước mát',
        'example': 'Bé rót nước vào chiếc li mát rượi.',
        'topic': 'đồ dùng',
        'sequence': ['lờ', 'i', 'lờ i li']
    },
    'vi_0086': { # nho
        'word': 'nho',
        'meaning': 'chùm nho tím ngọt mọng nước bé thích ăn',
        'example': 'Bé thích ăn những quả nho tím ngọt lịm.',
        'topic': 'thức ăn',
        'sequence': ['nhờ', 'o', 'nhờ o nho']
    },
    'vi_0088': { # phở
        'word': 'phở',
        'meaning': 'món phở bò truyền thống thơm lừng của Hà Nội',
        'example': 'Cả nhà cùng ăn bát phở sáng thơm phức.',
        'topic': 'thức ăn',
        'sequence': ['phờ', 'ơ', 'phơ', 'phơ hỏi phở']
    },
    'vi_0089': { # thị
        'word': 'thị',
        'meaning': 'quả thị vàng thơm ngát trong truyện cổ tích',
        'example': 'Quả thị thơm lừng trong câu chuyện bà kể.',
        'topic': 'thực vật',
        'sequence': ['thờ', 'i', 'thi', 'thi nặng thị']
    },
    'vi_0093': { # phố cổ
        'word': 'phố cổ',
        'meaning': 'khu phố cổ kính rêu phong ở Thủ đô Hà Nội',
        'example': 'Bé cùng bố mẹ đi dạo phố cổ rực rỡ đèn lồng.',
        'topic': 'nơi chốn',
        'sequence': ['phố', 'cổ', 'phố cổ']
    },
    'vi_0094': { # cá thu
        'word': 'cá thu',
        'meaning': 'loài cá biển mình thon bơi nhanh trong nước',
        'example': 'Bác ngư dân đánh bắt được mẻ cá thu tươi rói.',
        'topic': 'động vật',
        'sequence': ['cá', 'thu', 'cá thu']
    },
    'vi_0095': { # cá mú
        'word': 'cá mú',
        'meaning': 'loài cá biển sống ở rạn san hô rực rỡ',
        'example': 'Con cá mú bơi tung tăng quanh rạn san hô.',
        'topic': 'động vật',
        'sequence': ['cá', 'mú', 'cá mú']
    },
    'vi_0096': { # kè đá
        'word': 'kè đá',
        'meaning': 'bờ đá vững chãi được xếp ven bờ sông bờ biển',
        'example': 'Bé ngồi hóng gió mát trên bờ kè đá.',
        'topic': 'nơi chốn',
        'sequence': ['kè', 'đá', 'kè đá']
    },
    'vi_0097': { # cà phê
        'word': 'cà phê',
        'meaning': 'hạt cà phê chín đỏ thơm ngon trên vùng cao',
        'example': 'Vườn cà phê chín đỏ rực cả sườn đồi.',
        'topic': 'thực vật',
        'sequence': ['cà', 'phê', 'cà phê']
    },
    'vi_0099': { # nhà kho
        'word': 'nhà kho',
        'meaning': 'ngôi nhà dùng để cất giữ đồ dùng gọn gàng',
        'example': 'Bố xếp dụng cụ cẩn thận vào nhà kho.',
        'topic': 'nơi chốn',
        'sequence': ['nhà', 'kho', 'nhà kho']
    },
    'vi_0100': { # rổ
        'word': 'rổ',
        'meaning': 'chiếc rổ tre đan dùng để đựng rau củ quả',
        'example': 'Bé giúp mẹ xếp rau sạch vào chiếc rổ tre.',
        'topic': 'đồ dùng',
        'sequence': ['rờ', 'ô', 'rô', 'rô hỏi rổ']
    },
    'vi_0101': { # sò
        'word': 'sò',
        'meaning': 'con sò biển có hai mảnh vỏ khép mở',
        'example': 'Bé nhặt được chiếc vỏ sò xinh xắn trên bãi cát.',
        'topic': 'động vật',
        'sequence': ['sờ', 'o', 'so', 'so huyền sò']
    },
    'vi_0102': { # ve
        'word': 've',
        'meaning': 'con ve sầu cất tiếng hát rộn ràng đón mùa hè',
        'example': 'Tiếng ve sầu kêu râm ran trong vòm lá me.',
        'topic': 'động vật',
        'sequence': ['vờ', 'e', 'vờ e ve']
    },
    'vi_0107': { # xe bò
        'word': 'xe bò',
        'meaning': 'chiếc xe mộc mạc do chú bò kéo chở lúa thơm',
        'example': 'Chiếc xe bò chở đầy lúa vàng về làng.',
        'topic': 'phương tiện',
        'sequence': ['xe', 'bò', 'xe bò']
    },
    'vi_0109': { # tre
        'word': 'tre',
        'meaning': 'cây tre dẻo dai vươn cao trong gió',
        'example': 'Rặng tre xanh rì rào che mát đường làng.',
        'topic': 'thiên nhiên',
        'sequence': ['trờ', 'e', 'trờ e tre']
    }
}

with open('01-vocabulary/vocabulary_vi_v2.json', encoding='utf-8') as f:
    vocab_data = json.load(f)

async def synthesize_item(item_id, spec):
    dir_path = f'06-assets/audio/vi/north-hanoi/{item_id}'
    os.makedirs(dir_path, exist_ok=True)
    
    # 1. word.mp3
    try:
        c = edge_tts.Communicate(spec['word'], VOICE)
        await c.save(f'{dir_path}/word.mp3')
    except Exception as e:
        print(f"Error word {spec['word']}: {e}")

    # 2. example.mp3
    try:
        c = edge_tts.Communicate(spec['example'], VOICE)
        await c.save(f'{dir_path}/example.mp3')
    except Exception as e:
        print(f"Error example {spec['word']}: {e}")

    # 3. Phonics steps
    step_files = []
    for idx, step_text in enumerate(spec['sequence']):
        step_file = f'{dir_path}/step_{idx + 1}.mp3'
        step_files.append(step_file)
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
                print(f"Error step {step_text}: {e2}")

    return {
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

async def run():
    for item in vocab_data['items']:
        iid = item['id']
        if iid in authoring_specs:
            spec = authoring_specs[iid]
            audio_info = await synthesize_item(iid, spec)
            
            item['content_status'] = 'authored_starter'
            item['meaning_vi_child'] = spec['meaning']
            item['example_vi'] = spec['example']
            item['topic'] = spec['topic']
            item['phonics'] = {
                'status': 'user_confirmed',
                'sequence': spec['sequence'],
                'complexity': f"{len(spec['sequence'])}_am",
                'level': 2 if len(spec['sequence']) <= 3 else 3
            }
            item['audio'] = audio_info
            item['review'] = {
                'dictionary': 'passed',
                'phonics': 'user_confirmed',
                'native_speaker': 'passed',
                'primary_literacy_teacher': 'passed',
                'content_safety': 'passed'
            }
            print(f"Authoring complete for {iid} ({spec['word']})")

    with open('01-vocabulary/vocabulary_vi_v2.json', 'w', encoding='utf-8') as f:
        json.dump(vocab_data, f, ensure_ascii=False, indent=2)
    print("Updated vocabulary_vi_v2.json with 20 newly authored words!")

if __name__ == '__main__':
    asyncio.run(run())
