import json

with open('01-vocabulary/spelling_practice_vi_v1.json', encoding='utf-8') as f:
    d = json.load(f)

with open('01-vocabulary/spelling_pictures.json', encoding='utf-8') as f:
    pics = json.load(f)

example_emojis = {}
for it in d['items']:
    w = it['word']
    em = pics.get(w, {}).get('emoji', '📖')
    # Pair with a cute context icon
    topic = it.get('topic', '')
    if 'đồ' in topic:
        pair = f'{em}🎒'
    elif 'động vật' in topic or 'con vật' in topic:
        pair = f'{em}🐾'
    elif 'thức ăn' in topic or 'ăn' in topic:
        pair = f'{em}😋'
    elif 'thiên nhiên' in topic:
        pair = f'{em}🌿'
    elif 'hành động' in topic:
        pair = f'{em}✨'
    elif 'nơi chốn' in topic:
        pair = f'{em}🏡'
    else:
        pair = f'{em}🌟'
    example_emojis[w] = pair

print(f'Total example illustrations: {len(example_emojis)}')
with open('01-vocabulary/spelling_example_illustrations.json', 'w', encoding='utf-8') as f:
    json.dump(example_emojis, f, ensure_ascii=False, indent=2)
