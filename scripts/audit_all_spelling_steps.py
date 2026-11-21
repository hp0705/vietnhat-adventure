import json
import os
import re
from test_danh_van_js import spell_word, spell_syllable

# Load datasets
with open('01-vocabulary/vocabulary_vi_v2.json', encoding='utf-8') as f:
    vocab_data = json.load(f)

with open('01-vocabulary/spelling_practice_vi_v1.json', encoding='utf-8') as f:
    sp_data = json.load(f)

with open('01-vocabulary/spelling_step_audio_map.json', encoding='utf-8') as f:
    step_map = json.load(f)

all_unique_steps = set()
errors = []

all_words = [it['word'] for it in vocab_data['items']] + [it['word'] for it in sp_data['items']]

for w in all_words:
    clean_w = re.sub(r'[-\s]+', ' ', w.strip())
    try:
        res = spell_word(clean_w)
        for t in res['tieng']:
            for s in t['steps']:
                all_unique_steps.add(s)
    except Exception as e:
        errors.append((w, str(e)))

print(f"Total words checked: {len(all_words)}")
print(f"Errors encountered: {len(errors)}")
if errors:
    print("Errors:", errors)

print(f"Total unique steps across ALL words: {len(all_unique_steps)}")

missing = []
for s in sorted(list(all_unique_steps)):
    target = step_map.get(s)
    if not target or not os.path.exists(target) or os.path.getsize(target) < 100:
        missing.append(s)

print(f"Missing steps in audio map: {len(missing)}")
print("Sample missing:", missing[:30])
