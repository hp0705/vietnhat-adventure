import json, os
with open('01-vocabulary/spelling_practice_vi_v1.json', encoding='utf-8') as f:
    d = json.load(f)
missing = [(it['id'], it['word']) for it in d['items'] if not os.path.exists(f"06-assets/audio/spelling/words/{it['id']}.mp3")]
print('Missing:', missing)
