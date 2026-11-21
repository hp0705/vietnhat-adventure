import json

with open('function 2/spelling_practice_vi_v1_expanded.json', encoding='utf-8') as f:
    d = json.load(f)

with open('app.js', encoding='utf-8') as f:
    app_text = f.read()

# Extract pictureData keys
import re
pic_match = re.search(r'const pictureData = \{([^}]+)\};', app_text)

# Let's test each word against known words
words = [it['word'] for it in d['items']]
print(f'Checking {len(words)} words...')
