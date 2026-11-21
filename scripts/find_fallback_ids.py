with open('app.js', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'id:\s*"([^"]+)",\s*word:\s*"([^"]+)"', text)
print(matches)
