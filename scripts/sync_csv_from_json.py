import json
import csv

with open('01-vocabulary/vocabulary_vi_v2.json', encoding='utf-8') as f:
    data = json.load(f)

items = data['items']

# CSV columns
fieldnames = [
    'id', 'word', 'meaning_vi_child', 'meaning_ja', 'example_vi', 'topic',
    'part_of_speech', 'content_status', 'source_textbook', 'grade',
    'phonics_complexity', 'phonics_sequence', 'phonics_status', 'phonics_level',
    'audio_word', 'audio_example', 'audio_steps',
    'review_dictionary', 'review_phonics', 'review_native', 'review_teacher', 'review_safety'
]

with open('01-vocabulary/vocabulary_vi_v2.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for it in items:
        p = it.get('phonics', {})
        a = it.get('audio', {})
        r = it.get('review', {})
        writer.writerow({
            'id': it.get('id', ''),
            'word': it.get('word', ''),
            'meaning_vi_child': it.get('meaning_vi_child', ''),
            'meaning_ja': it.get('meaning_ja', ''),
            'example_vi': it.get('example_vi', ''),
            'topic': it.get('topic', ''),
            'part_of_speech': it.get('part_of_speech', ''),
            'content_status': it.get('content_status', ''),
            'source_textbook': it.get('source_textbook', ''),
            'grade': it.get('grade', ''),
            'phonics_complexity': p.get('complexity', ''),
            'phonics_sequence': '|'.join(p.get('sequence', [])) if isinstance(p.get('sequence'), list) else '',
            'phonics_status': p.get('status', ''),
            'phonics_level': p.get('level', ''),
            'audio_word': a.get('word_full', ''),
            'audio_example': a.get('example_sentence', ''),
            'audio_steps': '|'.join(a.get('phonics_steps', [])) if isinstance(a.get('phonics_steps'), list) else '',
            'review_dictionary': r.get('dictionary', ''),
            'review_phonics': r.get('phonics', ''),
            'review_native': r.get('native_speaker', ''),
            'review_teacher': r.get('primary_literacy_teacher', ''),
            'review_safety': r.get('content_safety', '')
        })

print(f"Synced {len(items)} items to 01-vocabulary/vocabulary_vi_v2.csv")
