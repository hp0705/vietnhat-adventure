import json
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))
from test_danh_van_js import spell_syllable

def process_file(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    items = data['items'] if isinstance(data, dict) and 'items' in data else data
    changed = 0
    for it in items:
        word = it['word']
        clean_word = word.replace('-', ' ')
        syls = clean_word.split()
        t_list = [spell_syllable(s) for s in syls]
        
        steps = []
        for t in t_list:
            steps.extend(t['steps'])
        
        if len(syls) > 1:
            rules = [f"tiếng {i+1}: {t['danh_van']}" for i, t in enumerate(t_list)]
            spelling_rule = " / ".join(rules) + f" / đọc: {clean_word}"
            steps.append(word)
        else:
            spelling_rule = t_list[0]['danh_van']
            
        if 'phonics' not in it:
            it['phonics'] = {}
        it['phonics']['sequence'] = steps
        it['phonics']['spelling_rule'] = spelling_rule
        it['phonics']['status'] = 'user_confirmed'
        changed += 1
        
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Updated {changed} items in {json_path}")

if __name__ == '__main__':
    process_file('01-vocabulary/vocabulary_vi_v2.json')
    process_file('01-vocabulary/spelling_practice_vi_v1.json')
    if os.path.exists('function 2/spelling_practice_vi_v1.json'):
        process_file('function 2/spelling_practice_vi_v1.json')
