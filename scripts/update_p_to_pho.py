import json

with open('01-vocabulary/spelling_practice_vi_v1.json', encoding='utf-8') as f:
    d = json.load(f)

count_replaced = 0
for it in d['items']:
    seq = it['phonics']['sequence']
    new_seq = []
    for s in seq:
        if s == 'pờ':
            new_seq.append('phờ')
            count_replaced += 1
        else:
            new_seq.append(s)
    it['phonics']['sequence'] = new_seq
    
    # Also update phonics.rime letter_sound_steps
    if 'rime' in it['phonics'] and 'letter_sound_steps' in it['phonics']['rime']:
        steps = it['phonics']['rime']['letter_sound_steps']
        it['phonics']['rime']['letter_sound_steps'] = ['phờ' if x == 'pờ' else x for x in steps]
    
    # Also update phonics.steps
    if 'steps' in it['phonics']:
        for step_obj in it['phonics']['steps']:
            if step_obj.get('display') == 'pờ':
                step_obj['display'] = 'phờ'

print(f"Replaced 'pờ' with 'phờ' in {count_replaced} occurrences across {len(d['items'])} items.")

# Print sáp sequence
for it in d['items']:
    if it['word'] == 'sáp':
        print('sáp sequence:', it['phonics']['sequence'])

with open('01-vocabulary/spelling_practice_vi_v1.json', 'w', encoding='utf-8') as f:
    json.dump(d, f, ensure_ascii=False, indent=2)
