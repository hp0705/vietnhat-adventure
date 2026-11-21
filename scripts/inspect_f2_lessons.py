import json

with open('function 2/spelling_practice_vi_v1_expanded.json', encoding='utf-8') as f:
    d = json.load(f)

print('Lessons:')
for l in d['lessons']:
    items_in_lesson = [it for it in d['items'] if it.get('lesson_id') == l['id']]
    print(f"- {l['id']}: final='{l.get('final')}', {len(items_in_lesson)} items")
    for u in l.get('units', []):
        unit_words = [it['word'] for it in items_in_lesson if it.get('rhyme_family') == u.get('rhyme_family')]
        print(f"    Unit {u.get('rhyme_family')}: {unit_words}")
