import json
import os

with open('01-vocabulary/spelling_practice_vi_v1.json', encoding='utf-8') as f:
    sp_data = json.load(f)
with open('01-vocabulary/vocabulary_vi_v2.json', encoding='utf-8') as f:
    vocab_data = json.load(f)
with open('01-vocabulary/spelling_step_audio_map.json', encoding='utf-8') as f:
    step_map = json.load(f)

# 1. Map all words from spelling_practice
sp_added = 0
for it in sp_data.get('items', []):
    word = it['word']
    audio_path = it.get('audio', {}).get('word_full') or f"06-assets/audio/spelling/words/{it['id']}.mp3"
    if os.path.exists(audio_path):
        step_map[word] = audio_path.replace('\\', '/')
        sp_added += 1

# 2. Map all words from vocab_data
vocab_added = 0
for it in vocab_data.get('items', []):
    word = it['word']
    audio_path = it.get('audio', {}).get('dialects', {}).get('north', {}).get('word_full') or it.get('audio', {}).get('word_full')
    if audio_path and os.path.exists(audio_path):
        if word not in step_map:
            step_map[word] = audio_path.replace('\\', '/')
            vocab_added += 1

# 3. Check for specific essential words
for w in ['khách', 'tháp', 'sáp', 'lắp', 'ba', 'bà', 'mèo', 'cục đá', 'nơ đỏ', 'tu hú', 'hoa', 'cây']:
    print(f"'{w}': {step_map.get(w)}")

print(f"\nAdded {sp_added} spelling words to step_map")
print(f"Added {vocab_added} vocab words to step_map")
print(f"Total entries in step_map: {len(step_map)}")

with open('01-vocabulary/spelling_step_audio_map.json', 'w', encoding='utf-8') as f:
    json.dump(step_map, f, ensure_ascii=False, indent=2)
print("Updated 01-vocabulary/spelling_step_audio_map.json successfully!")
