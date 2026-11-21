import json
from vietnamese_phonics_engine import spell_word, get_word_steps_list, get_cum_tu_goi_nghia

# 1. Cập nhật vocabulary_vi_v2.json
with open('01-vocabulary/vocabulary_vi_v2.json', encoding='utf-8') as f:
    vocab_data = json.load(f)

for it in vocab_data['items']:
    word = it['word']
    steps = get_word_steps_list(word)
    spelling_text = spell_word(word)
    phrase = get_cum_tu_goi_nghia(word)
    
    it['cum_tu_goi_nghia'] = phrase
    if 'phonics' not in it or not it['phonics']:
        it['phonics'] = {}
    it['phonics']['sequence'] = steps
    it['phonics']['spelling_rule'] = spelling_text
    it['phonics']['complexity'] = f"{len(steps)}_am"
    it['phonics']['status'] = 'user_confirmed'

with open('01-vocabulary/vocabulary_vi_v2.json', 'w', encoding='utf-8') as f:
    json.dump(vocab_data, f, ensure_ascii=False, indent=2)

print(f"Updated all {len(vocab_data['items'])} items in vocabulary_vi_v2.json!")

# 2. Cập nhật spelling_practice_vi_v1.json
with open('01-vocabulary/spelling_practice_vi_v1.json', encoding='utf-8') as f:
    sp_data = json.load(f)

for it in sp_data['items']:
    word = it['word']
    steps = get_word_steps_list(word)
    spelling_text = spell_word(word)
    phrase = get_cum_tu_goi_nghia(word)
    
    it['cum_tu_goi_nghia'] = phrase
    if 'phonics' not in it or not it['phonics']:
        it['phonics'] = {}
    it['phonics']['sequence'] = steps
    it['phonics']['spelling_rule'] = spelling_text

with open('01-vocabulary/spelling_practice_vi_v1.json', 'w', encoding='utf-8') as f:
    json.dump(sp_data, f, ensure_ascii=False, indent=2)

print(f"Updated all {len(sp_data['items'])} items in spelling_practice_vi_v1.json!")
