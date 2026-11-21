import json
from test_danh_van_js import spell_word

def update_spelling_rules():
    with open('01-vocabulary/vocabulary_vi_v2.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    for item in data['items']:
        word = item['word'].replace('-', ' ')
        r = spell_word(word)
        sections = [t['danh_van'] for t in r['tieng']]
        if len(r['tieng']) > 1:
            sections.append(r['doc_tron'])
        rule = ' | '.join(sections)
        
        steps = []
        for t in r['tieng']:
            steps.extend(t['steps'])
        if len(r['tieng']) > 1:
            steps.append(item['word'])
            
        if 'phonics' not in item:
            item['phonics'] = {}
        item['phonics']['spelling_rule'] = rule
        item['phonics']['sequence'] = steps
        item['phonics']['status'] = 'user_confirmed'

    with open('01-vocabulary/vocabulary_vi_v2.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("Đã cập nhật toàn bộ 632 mục trong vocabulary_vi_v2.json sang chuẩn ' | '")

if __name__ == '__main__':
    update_spelling_rules()
