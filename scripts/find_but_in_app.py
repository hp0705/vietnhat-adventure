with open('app.js', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'bút' in l:
        print(f'{i+1}: {l.strip()}')
