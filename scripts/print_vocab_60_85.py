import json
with open('01-vocabulary/vocabulary_vi_v2.json', encoding='utf-8') as f:
    d = json.load(f)
for it in d['items'][60:85]:
    print(f"{it['id']}: word='{it['word']}', status='{it.get('content_status')}'")
