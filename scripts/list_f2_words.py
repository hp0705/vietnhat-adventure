import json

with open('function 2/spelling_practice_vi_v1_expanded.json', encoding='utf-8') as f:
    d = json.load(f)

words = [it['word'] for it in d['items']]
print(f'Total words in F2: {len(words)}')
print(words)
