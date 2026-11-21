import json
with open('01-vocabulary/vocabulary_vi_v2.json', encoding='utf-8') as f:
    d = json.load(f)
authored = [it for it in d['items'] if it.get('content_status') == 'authored_starter']
print(f'Total authored: {len(authored)}')
for idx, it in enumerate(authored):
    print(f"{idx+1}. {it['id']}: word='{it['word']}' seq={it['phonics'].get('sequence')}")
