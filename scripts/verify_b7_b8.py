import json
d = json.load(open('01-vocabulary/vocabulary_vi_v2.json', encoding='utf-8'))
b7 = ['vi_0078', 'vi_0079', 'vi_0082', 'vi_0083', 'vi_0084', 'vi_0085', 'vi_0086', 'vi_0088', 'vi_0089', 'vi_0092']
b8 = ['vi_0093', 'vi_0094', 'vi_0095', 'vi_0096', 'vi_0098', 'vi_0100', 'vi_0101', 'vi_0102', 'vi_0107', 'vi_0109']
m = {x['id']: x for x in d['items']}
print('=== Bài 7 ===')
for i in b7:
    print(f"  {i}: {m[i]['word']} | {m[i]['meaning_vi_child']} | {m[i]['example_vi']}")
print('=== Bài 8 ===')
for i in b8:
    print(f"  {i}: {m[i]['word']} | {m[i]['meaning_vi_child']} | {m[i]['example_vi']}")
