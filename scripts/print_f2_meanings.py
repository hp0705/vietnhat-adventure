import json

with open('function 2/spelling_practice_vi_v1_expanded.json', encoding='utf-8') as f:
    d = json.load(f)

for it in d['items']:
    print(f"'{it['word']}': {{ meaning: '{it.get('meaning_vi_child')}', context: '{it.get('context_phrase')}', topic: '{it.get('topic')}' }},")
