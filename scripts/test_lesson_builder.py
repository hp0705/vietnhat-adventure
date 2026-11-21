import json

with open('01-vocabulary/spelling_practice_vi_v1.json', encoding='utf-8') as f:
    d = json.load(f)

items = d['items']

lesson_configs = [
    {
        'id': 'spel_1',
        'title': 'Bài 1: Vần ap & ăp (Âm cuối P)',
        'rimes': ['ap', 'ăp'],
        'level': 'Cơ bản - Âm cuối p'
    },
    {
        'id': 'spel_2',
        'title': 'Bài 2: Vần âp & ep (Âm cuối P)',
        'rimes': ['âp', 'ep'],
        'level': 'Cơ bản - Âm cuối p'
    },
    {
        'id': 'spel_3',
        'title': 'Bài 3: Vần êp, ip & op (Âm cuối P)',
        'rimes': ['êp', 'ip', 'op'],
        'level': 'Nâng cao - Âm cuối p'
    },
    {
        'id': 'spel_4',
        'title': 'Bài 4: Vần ôp, ơp & up (Âm cuối P)',
        'rimes': ['ôp', 'ơp', 'up'],
        'level': 'Nâng cao - Âm cuối p'
    },
    {
        'id': 'spel_5',
        'title': 'Bài 5: Vần ach, êch & ich (Âm cuối CH)',
        'rimes': ['ach', 'êch', 'ich'],
        'level': 'Mở rộng - Âm cuối ch'
    },
    {
        'id': 'spel_6',
        'title': 'Bài 6: Vần anh (Âm cuối NH)',
        'rimes': ['anh'],
        'level': 'Mở rộng - Âm cuối nh'
    },
    {
        'id': 'spel_7',
        'title': 'Bài 7: Vần au (Âm cuối U)',
        'rimes': ['au'],
        'level': 'Mở rộng - Âm cuối u'
    }
]

spelling_lessons = []
total_allocated = 0
for cfg in lesson_configs:
    l_items = [it for it in items if it.get('rhyme_family') in cfg['rimes']]
    total_allocated += len(l_items)
    spelling_lessons.append({
        'id': cfg['id'],
        'title': cfg['title'],
        'level': cfg['level'],
        'rimes': cfg['rimes'],
        'items': l_items
    })
    words = [x['word'] for x in l_items]
    print(f"{cfg['title']}: {len(l_items)} từ -> {words}")

print(f'\nTotal words allocated: {total_allocated}/{len(items)}')
