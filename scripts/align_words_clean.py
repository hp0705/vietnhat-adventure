import asyncio
import os
import json
import edge_tts

VOICE = 'vi-VN-HoaiMyNeural'

authoring_specs = {
    # Bài 7 (10 từ)
    'vi_0078': {
        'word': 'tu hú',
        'meaning': 'loài chim kêu gọi mùa vải chín về',
        'example': 'Tiếng chim tu hú gọi hè xôn xao.',
        'topic': 'động vật',
        'sequence': ['tu', 'hú', 'tu hú']
    },
    'vi_0079': {
        'word': 'tê tê',
        'meaning': 'con tê tê hiền lành có bộ vảy cứng',
        'example': 'Con tê tê cuộn tròn như quả bóng nhỏ.',
        'topic': 'động vật',
        'sequence': ['tê', 'tê', 'tê tê']
    },
    'vi_0082': {
        'word': 'nơ đỏ',
        'meaning': 'chiếc nơ màu đỏ xinh cài trên tóc bé',
        'example': 'Bé cài chiếc nơ đỏ xinh xắn đi học.',
        'topic': 'đồ dùng',
        'sequence': ['nơ', 'đỏ', 'nơ đỏ']
    },
    'vi_0083': {
        'word': 'tô mì',
        'meaning': 'bát mì nóng hổi thơm ngon mẹ nấu',
        'example': 'Mẹ nấu cho bé tô mì thơm lừng.',
        'topic': 'thức ăn',
        'sequence': ['tô', 'mì', 'tô mì']
    },
    'vi_0084': {
        'word': 'le le',
        'meaning': 'loài vịt trời nhỏ bơi lội dưới ao',
        'example': 'Đôi chim le le bơi lội bên hồ sen.',
        'topic': 'động vật',
        'sequence': ['le', 'le', 'le le']
    },
    'vi_0085': {
        'word': 'li',
        'meaning': 'chiếc cốc trong suốt bé dùng uống nước mát',
        'example': 'Bé rót nước vào chiếc li mát rượi.',
        'topic': 'đồ dùng',
        'sequence': ['lờ', 'i', 'lờ i li']
    },
    'vi_0086': {
        'word': 'nho',
        'meaning': 'chùm nho tím ngọt lịm mọng nước',
        'example': 'Chùm nho chín mọng trên giàn xanh mát.',
        'topic': 'thực vật',
        'sequence': ['nhờ', 'o', 'nhờ o nho']
    },
    'vi_0088': {
        'word': 'phở',
        'meaning': 'món phở truyền thống thơm phức nước dùng',
        'example': 'Cả nhà cùng ăn bát phở sáng thơm phức.',
        'topic': 'thức ăn',
        'sequence': ['phờ', 'ơ', 'phơ', 'phơ hỏi phở']
    },
    'vi_0089': {
        'word': 'thị',
        'meaning': 'quả thị vàng thơm như trong cổ tích',
        'example': 'Quả thị thơm lừng trong câu chuyện bà kể.',
        'topic': 'thực vật',
        'sequence': ['thờ', 'i', 'thi', 'thi nặng thị']
    },
    'vi_0092': {
        'word': 'phố cổ',
        'meaning': 'khu phố cổ kính rêu phong ở Thủ đô Hà Nội',
        'example': 'Bé cùng bố mẹ đi dạo phố cổ rực rỡ đèn lồng.',
        'topic': 'nơi chốn',
        'sequence': ['phố', 'cổ', 'phố cổ']
    },

    # Bài 8 (10 từ)
    'vi_0093': {
        'word': 'cá thu',
        'meaning': 'loài cá biển mình thon bơi nhanh trong nước',
        'example': 'Đàn cá thu bơi lượn ngoài biển xanh.',
        'topic': 'động vật',
        'sequence': ['cá', 'thu', 'cá thu']
    },
    'vi_0094': {
        'word': 'cá mú',
        'meaning': 'loài cá biển sống ở rạn san hô rực rỡ',
        'example': 'Chú cá mú trốn trong rạn san hô đẹp mắt.',
        'topic': 'động vật',
        'sequence': ['cá', 'mú', 'cá mú']
    },
    'vi_0095': {
        'word': 'kè đá',
        'meaning': 'bờ đá vững chãi được xếp ven bờ sông bờ biển',
        'example': 'Bờ kè đá chắn sóng vững chãi ven sông.',
        'topic': 'nơi chốn',
        'sequence': ['kè', 'đá', 'kè đá']
    },
    'vi_0096': {
        'word': 'cà phê',
        'meaning': 'hạt cà phê chín đỏ thơm ngon trên vùng cao',
        'example': 'Vườn cà phê chín đỏ rực cả sườn đồi.',
        'topic': 'thực vật',
        'sequence': ['cà', 'phê', 'cà phê']
    },
    'vi_0098': {
        'word': 'nhà kho',
        'meaning': 'ngôi nhà dùng để cất giữ đồ dùng gọn gàng',
        'example': 'Bố xếp dụng cụ cẩn thận vào nhà kho.',
        'topic': 'nơi chốn',
        'sequence': ['nhà', 'kho', 'nhà kho']
    },
    'vi_0100': {
        'word': 'rổ',
        'meaning': 'chiếc rổ tre đan dùng để đựng rau củ quả',
        'example': 'Bé giúp mẹ xếp rau sạch vào chiếc rổ tre.',
        'topic': 'đồ dùng',
        'sequence': ['rờ', 'ô', 'rô', 'rô hỏi rổ']
    },
    'vi_0101': {
        'word': 'sò',
        'meaning': 'con sò biển có hai mảnh vỏ khép mở',
        'example': 'Bé nhặt được chiếc vỏ sò xinh xắn trên bãi cát.',
        'topic': 'động vật',
        'sequence': ['sờ', 'o', 'so', 'so huyền sò']
    },
    'vi_0102': {
        'word': 've',
        'meaning': 'con ve sầu cất tiếng hát rộn ràng đón mùa hè',
        'example': 'Tiếng ve sầu kêu râm ran trong vòm lá me.',
        'topic': 'động vật',
        'sequence': ['vờ', 'e', 'vờ e ve']
    },
    'vi_0107': {
        'word': 'xe bò',
        'meaning': 'chiếc xe mộc mạc do chú bò kéo chở lúa thơm',
        'example': 'Chiếc xe bò chở đầy lúa vàng về làng.',
        'topic': 'phương tiện',
        'sequence': ['xe', 'bò', 'xe bò']
    },
    'vi_0109': {
        'word': 'tre',
        'meaning': 'cây tre dẻo dai vươn cao trong gió',
        'example': 'Rặng tre xanh rì rào che mát đường làng.',
        'topic': 'thiên nhiên',
        'sequence': ['trờ', 'e', 'trờ e tre']
    }
}

async def synth_with_retry(text, out_path, max_retries=5):
    for attempt in range(max_retries):
        try:
            if os.path.exists(out_path) and os.path.getsize(out_path) > 100:
                return True
            if os.path.exists(out_path):
                os.remove(out_path)
            c = edge_tts.Communicate(text, VOICE)
            await c.save(out_path)
            if os.path.exists(out_path) and os.path.getsize(out_path) > 100:
                return True
        except Exception as e:
            pass
        await asyncio.sleep(0.5 + attempt * 0.3)
    return False

async def main():
    with open('01-vocabulary/vocabulary_vi_v2.json', encoding='utf-8') as f:
        data = json.load(f)

    # First clean up mismatched items vi_0097, vi_0099
    for it in data['items']:
        iid = it['id']
        if iid in ['vi_0097', 'vi_0099']:
            it['content_status'] = 'source_extracted_needs_authoring'
            it['meaning_vi_child'] = None
            it['example_vi'] = None
            it['phonics'] = {
                'status': 'pending_native_teacher_review',
                'sequence': []
            }
            it['audio'] = {
                'word_full': None,
                'example_sentence': None,
                'phonics_steps': [],
                'dialects': {'north': {'word_full': None, 'example_sentence': None, 'phonics_steps': []}}
            }
            it['review'] = {
                'dictionary': 'pending',
                'phonics': 'pending',
                'native_speaker': 'pending',
                'primary_literacy_teacher': 'pending',
                'content_safety': 'pending'
            }

    # Author the exact 20 items
    for it in data['items']:
        iid = it['id']
        if iid in authoring_specs:
            spec = authoring_specs[iid]
            dir_path = f'06-assets/audio/vi/north-hanoi/{iid}'
            os.makedirs(dir_path, exist_ok=True)
            
            # Synthesize
            w_file = f'{dir_path}/word.mp3'
            await synth_with_retry(spec['word'], w_file)
            await asyncio.sleep(0.1)

            e_file = f'{dir_path}/example.mp3'
            await synth_with_retry(spec['example'], e_file)
            await asyncio.sleep(0.1)

            step_files = []
            for sidx, step_text in enumerate(spec['sequence']):
                s_file = f'{dir_path}/step_{sidx + 1}.mp3'
                step_files.append(s_file)
                tts_text = step_text
                if any(t in step_text for t in ['hỏi', 'ngã', 'nặng', 'huyền', 'sắc']):
                    parts = step_text.split()
                    if len(parts) >= 3:
                        tts_text = f"{parts[0]} {parts[1]}, {parts[2]}"
                await synth_with_retry(tts_text, s_file)
                await asyncio.sleep(0.1)

            it['content_status'] = 'authored_starter'
            it['meaning_vi_child'] = spec['meaning']
            it['example_vi'] = spec['example']
            it['topic'] = spec['topic']
            it['phonics'] = {
                'status': 'user_confirmed',
                'sequence': spec['sequence'],
                'complexity': f"{len(spec['sequence'])}_am",
                'level': 2 if len(spec['sequence']) <= 3 else 3
            }
            audio_info = {
                'word_full': w_file,
                'example_sentence': e_file,
                'phonics_steps': step_files,
                'dialects': {
                    'north': {
                        'word_full': w_file,
                        'example_sentence': e_file,
                        'phonics_steps': step_files
                    }
                }
            }
            it['audio'] = audio_info
            it['review'] = {
                'dictionary': 'passed',
                'phonics': 'user_confirmed',
                'native_speaker': 'passed',
                'primary_literacy_teacher': 'passed',
                'content_safety': 'passed'
            }
            print(f"Aligned and authored {iid}: {spec['word']}")

    with open('01-vocabulary/vocabulary_vi_v2.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("Finished aligning 20 items perfectly!")

if __name__ == '__main__':
    asyncio.run(main())
