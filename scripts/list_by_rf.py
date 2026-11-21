import json
from collections import defaultdict

with open('01-vocabulary/spelling_practice_vi_v1.json', encoding='utf-8') as f:
    d = json.load(f)

by_rf = defaultdict(list)
for it in d['items']:
    by_rf[it['rhyme_family']].append(it)

print(f'Total rhyme families: {len(by_rf)}')
for rf, items in by_rf.items():
    words = [x['word'] for x in items]
    print(f"- Vần '{rf}': {len(items)} từ -> {words}")
