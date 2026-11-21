content = open('app.js', encoding='utf-8').read()
idx = 0
while True:
    idx = content.find("'step'", idx)
    if idx == -1: break
    print(f'Match at {idx}:')
    print(content[max(0, idx-100):min(len(content), idx+500)])
    print('='*50)
    idx += 20
