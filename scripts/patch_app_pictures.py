import json

# Load spelling pictures and examples
with open('01-vocabulary/spelling_pictures.json', encoding='utf-8') as f:
    sp_pics = json.load(f)

with open('01-vocabulary/spelling_example_illustrations.json', encoding='utf-8') as f:
    sp_exs = json.load(f)

with open('app.js', encoding='utf-8') as f:
    content = f.read()

# 1. Check if pictureData already contains sáp
if "'sáp':" not in content:
    # Append spelling pictures inside pictureData
    pic_entries = []
    for w, val in sp_pics.items():
        pic_entries.append(f"  '{w}': {{ emoji: '{val['emoji']}', label: '{val['label']}' }},")
    pic_text = "\n  // --- FUNCTION 2: TẬP ĐÁNH VẦN (113 từ) ---\n" + "\n".join(pic_entries) + "\n"
    target = "  'rổ': { emoji: '🧺', label: 'Cái Rổ' }\n};"
    replacement = "  'rổ': { emoji: '🧺', label: 'Cái Rổ' },\n" + pic_text + "};"
    content = content.replace(target, replacement)
    print("Added spelling pictures to pictureData")

# 2. Check if exampleIllustrationMap contains sáp
if "'sáp':" not in content:
    ex_entries = []
    for w, val in sp_exs.items():
        ex_entries.append(f"  '{w}': '{val}',")
    ex_text = "\n  // --- FUNCTION 2: TẬP ĐÁNH VẦN VÍ DỤ ---\n" + "\n".join(ex_entries) + "\n"
    target = "  'cơ': '🚩🇻🇳',\n};"
    replacement = "  'cơ': '🚩🇻🇳',\n" + ex_text + "};"
    content = content.replace(target, replacement)
    print("Added spelling examples to exampleIllustrationMap")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated pictureData and exampleIllustrationMap in app.js successfully!")
