import json
with open('01-vocabulary/vocabulary_vi_v2.json', encoding='utf-8') as f:
    d = json.load(f)
others = [x for x in d['items'] if x.get('content_status') != 'authored_starter']
for i, x in enumerate(others[:40]):
    print(f"{i+1}. {x['word']} ({x.get('meaning_vi_child', '')})")
