import json
from test_danh_van_js import spell_syllable, split_tone, parse_syllable

TONE_NAMES = ['sắc', 'huyền', 'hỏi', 'ngã', 'nặng']
STRIP_TONE = re = None
import unicodedata

def strip_tone(s):
    out = []
    tones = {'\u0300', '\u0301', '\u0309', '\u0303', '\u0323'}
    for ch in unicodedata.normalize('NFD', s):
        if ch not in tones:
            out.append(ch)
    return unicodedata.normalize('NFC', ''.join(out))

def audio_file_name(text):
    out = []
    for ch in unicodedata.normalize('NFC', text):
        if ('a' <= ch <= 'z') or ('0' <= ch <= '9'):
            out.append(ch)
        else:
            out.append(f"_{ord(ch):x}")
    return ''.join(out)

def plan_syllable(syllable):
    syl = syllable.strip().lower()
    info = spell_syllable(syl)
    tokens = info['danh_van'].split(' - ')
    base = strip_tone(syl)
    items = []
    for i, text in enumerate(tokens):
        if text in TONE_NAMES and i == len(tokens) - 2:
            kind = 'tone'
        elif i == len(tokens) - 1:
            kind = 'syllable_final'
        elif len(text) == 1:
            kind = 'vowel'
        elif text.endswith('ờ'):
            kind = 'consonant'
        elif text == base:
            kind = 'syllable'
        else:
            kind = 'rime'
        items.append({'text': text, 'kind': kind})
    return items

def plan_word(word):
    syls = word.strip().lower().replace('-', ' ').split()
    items = []
    for si, syl in enumerate(syls):
        part = plan_syllable(syl)
        for i, it in enumerate(part):
            kind = 'word' if it['kind'] == 'syllable_final' else it['kind']
            tts_text = f"dấu {it['text']}" if kind == 'tone' else it['text']
            items.append({
                'text': it['text'],
                'kind': kind,
                'tts_text': tts_text,
                'audio_file': audio_file_name(it['text'])
            })
    if len(syls) > 1:
        whole = ' '.join(syls)
        items.append({
            'text': whole,
            'kind': 'word',
            'tts_text': whole,
            'audio_file': audio_file_name(whole)
        })
    return items

def needed_audio(words):
    file_map = {}
    for w in words:
        for it in plan_word(w):
            file_map[it['audio_file']] = it['text']
    res = [{'file': k + '.mp3', 'text': v} for k, v in file_map.items()]
    res.sort(key=lambda x: x['file'])
    return res

if __name__ == '__main__':
    with open('01-vocabulary/vocabulary_vi_v2.json', 'r', encoding='utf-8') as f:
        vocab = json.load(f)
    with open('01-vocabulary/spelling_practice_vi_v1.json', 'r', encoding='utf-8') as f:
        spelling = json.load(f)
    words = [it['word'] for it in vocab.get('items', []) + spelling.get('items', []) if it.get('word')]
    needed = needed_audio(words)
    with open('audio-can-thu.txt', 'w', encoding='utf-8') as f:
        for item in needed:
            f.write(f"{item['file']}\t{item['text']}\n")
    print(f"Đã xuất {len(needed)} file âm thanh cần thu vào audio-can-thu.txt")
