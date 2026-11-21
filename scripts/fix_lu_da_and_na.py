import json

with open('01-vocabulary/vocabulary_vi_v2.json', encoding='utf-8') as f:
    data = json.load(f)

for it in data['items']:
    # Sửa lư đá -> cục đá
    if it['id'] == 'vi_0099' or it['word'] == 'lư đá':
        it['word'] = 'cục đá'
        it['meaning_vi_child'] = 'viên đá nhỏ tròn bé nhặt trên sân'
        it['example_vi'] = 'Bé nhặt cục đá nhỏ xếp thành hình tròn.'
        it['topic'] = 'thiên nhiên'
        it['cum_tu_goi_nghia'] = 'cục đá'
        it['phonics'] = {
            'status': 'user_confirmed',
            'sequence': ['cờ', 'u', 'cờ', 'uc', 'cờ', 'uc', 'cuc', 'nặng', 'cục', 'đờ', 'a', 'đa', 'sắc', 'đá', 'cục đá'],
            'spelling_rule': 'tiếng 1: cờ - u - cờ - uc - cờ - uc - cuc - nặng - cục / tiếng 2: đờ - a - đa - sắc - đá / đọc: cục đá',
            'complexity': '15_am'
        }
        print("Updated vi_0099 to 'cục đá'")

    # Sửa từ na
    if it['word'] == 'na':
        it['meaning_vi_child'] = 'quả na chín mềm thơm ngọt'
        it['example_vi'] = 'Mẹ mua cho bé quả na thơm ngọt.'
        it['cum_tu_goi_nghia'] = 'quả na'
        it['phonics'] = {
            'status': 'user_confirmed',
            'sequence': ['nờ', 'a', 'na'],
            'spelling_rule': 'nờ - a - na',
            'complexity': '3_am'
        }
        print("Updated word 'na'")

    # Sửa từ đá
    if it['word'] == 'đá':
        it['meaning_vi_child'] = 'cục đá, hòn đá tự nhiên'
        it['example_vi'] = 'Dòng suối trong veo chảy qua cục đá.'
        it['cum_tu_goi_nghia'] = 'cục đá'
        it['phonics'] = {
            'status': 'user_confirmed',
            'sequence': ['đờ', 'a', 'đa', 'sắc', 'đá'],
            'spelling_rule': 'đờ - a - đa - sắc - đá',
            'complexity': '5_am'
        }
        print("Updated word 'đá'")

with open('01-vocabulary/vocabulary_vi_v2.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Saved vocabulary_vi_v2.json successfully!")
