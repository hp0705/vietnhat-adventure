import unicodedata
import re

ONSET_NAMES = {
    'b': 'bờ', 'c': 'cờ', 'd': 'dờ', 'đ': 'đờ', 'g': 'gờ', 'h': 'hờ', 'k': 'cờ', 'l': 'lờ', 'm': 'mờ',
    'n': 'nờ', 'p': 'pờ', 'r': 'rờ', 's': 'sờ', 't': 'tờ', 'v': 'vờ', 'x': 'xờ',
    'ch': 'chờ', 'gh': 'gờ', 'gi': 'giờ', 'kh': 'khờ', 'ng': 'ngờ', 'ngh': 'ngờ', 'nh': 'nhờ',
    'ph': 'phờ', 'qu': 'quờ', 'th': 'thờ', 'tr': 'trờ',
}
ONSETS = ['ngh', 'ch', 'gh', 'gi', 'kh', 'ng', 'nh', 'ph', 'qu', 'th', 'tr',
          'b', 'c', 'd', 'đ', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'x']
FINALS = ['ch', 'ng', 'nh', 'c', 'm', 'n', 'p', 't']
VOWELS = 'aăâeêioôơuưy'
TONES = {'\u0300': 'huyền', '\u0301': 'sắc', '\u0309': 'hỏi', '\u0303': 'ngã', '\u0323': 'nặng'}

def split_tone(syllable):
    tone = 'ngang'
    out = []
    for ch in unicodedata.normalize('NFD', syllable):
        if ch in TONES:
            tone = TONES[ch]
        else:
            out.append(ch)
    return unicodedata.normalize('NFC', ''.join(out)), tone

def parse_syllable(base):
    onset = ''
    for o in ONSETS:
        if base.startswith(o):
            onset = o
            break
    rest = base[len(onset):]
    if onset == 'gi' and (rest == '' or rest[0] not in VOWELS):
        onset = 'g'
        rest = 'i' + rest
    fin = ''
    for f in FINALS:
        if len(rest) > len(f) and rest.endswith(f):
            fin = f
            break
    vowels = rest[:len(rest) - len(fin)]
    if not vowels or any(c not in VOWELS for c in vowels):
        raise ValueError(f'Không phân tích được tiếng: "{base}"')
    return onset, vowels, fin, vowels + fin

def rime_steps(vowels, fin):
    v = list(vowels)
    if len(v) == 1 and not fin:
        return [vowels]
    steps = [v[0]]
    acc = v[0]
    for i in range(1, len(v)):
        steps.append(v[i])
        acc += v[i]
        steps.append(acc)
    if fin:
        steps.append(ONSET_NAMES[fin])
        steps.append(vowels + fin)
    return steps

def spell_syllable(syllable):
    orig = unicodedata.normalize('NFC', syllable.strip().lower())
    base, tone = split_tone(orig)
    onset, vowels, fin, rime = parse_syllable(base)
    simple = len(vowels) == 1 and not fin
    if onset:
        name = ONSET_NAMES[onset]
        seq = [name, vowels, base] if simple else [name] + rime_steps(vowels, fin) + [name, rime, base]
    else:
        seq = rime_steps(vowels, fin)
    if tone != 'ngang':
        seq.extend([tone, orig])
    return {
        'tieng': orig, 'am_dau': onset, 'van': rime, 'thanh': tone,
        'danh_van': ' - '.join(seq)
    }

def spell_word(word):
    clean = unicodedata.normalize('NFC', re.sub(r'\s+', ' ', word.strip().lower()))
    return {
        'tu': clean,
        'tieng': [spell_syllable(p) for p in clean.split()],
        'doc_tron': clean
    }

GOLDEN = {
  'hoa': 'hờ - o - a - oa - hờ - oa - hoa',
  'cây': 'cờ - â - y - ây - cờ - ây - cây',
  'tê': 'tờ - ê - tê',
  'tu': 'tờ - u - tu',
  'hú': 'hờ - u - hu - sắc - hú',
  'na': 'nờ - a - na',
  'đa': 'đờ - a - đa',
  'xoài': 'xờ - o - a - oa - i - oai - xờ - oai - xoai - huyền - xoài',
  'chuối': 'chờ - u - ô - uô - i - uôi - chờ - uôi - chuôi - sắc - chuối',
  'kiến': 'cờ - i - ê - iê - nờ - iên - cờ - iên - kiên - sắc - kiến',
  'mía': 'mờ - i - a - ia - mờ - ia - mia - sắc - mía',
  'quy': 'quờ - y - quy',
  'quả': 'quờ - a - qua - hỏi - quả',
  'quạt': 'quờ - a - tờ - at - quờ - at - quat - nặng - quạt',
  'trăng': 'trờ - ă - ngờ - ăng - trờ - ăng - trăng',
  'xanh': 'xờ - a - nhờ - anh - xờ - anh - xanh',
  'ghế': 'gờ - ê - ghê - sắc - ghế',
  'nghe': 'ngờ - e - nghe',
  'kê': 'cờ - ê - kê',
  'giỏ': 'giờ - o - gio - hỏi - giỏ',
  'gì': 'gờ - i - gi - huyền - gì',
  'khỉ': 'khờ - i - khi - hỏi - khỉ',
  'mẹ': 'mờ - e - me - nặng - mẹ',
  'uống': 'u - ô - uô - ngờ - uông - sắc - uống',
  'ăn': 'ă - nờ - ăn',
  'ô': 'ô',
  'khách': 'khờ - a - chờ - ach - khờ - ach - khach - sắc - khách',
  'ếch': 'ê - chờ - êch - sắc - ếch',
  'khiêng': 'khờ - i - ê - iê - ngờ - iêng - khờ - iêng - khiêng',
}

MULTI = {
    'tê tê': (['tờ - ê - tê', 'tờ - ê - tê'], 'tê tê'),
    'tu hú': (['tờ - u - tu', 'hờ - u - hu - sắc - hú'], 'tu hú'),
    'nơ đỏ': (['nờ - ơ - nơ', 'đờ - o - đo - hỏi - đỏ'], 'nơ đỏ'),
    'nhũ đá': (['nhờ - u - nhu - ngã - nhũ', 'đờ - a - đa - sắc - đá'], 'nhũ đá'),
    'hòn đá': (['hờ - o - nờ - on - hờ - on - hon - huyền - hòn', 'đờ - a - đa - sắc - đá'], 'hòn đá'),
}

if __name__ == '__main__':
    passed = 0
    total = len(GOLDEN) + len(MULTI)
    print(f"=== TESTING {total} GOLDEN CASES (danh-van.test.js & R7) ===")
    for syl, expected in GOLDEN.items():
        res = spell_syllable(syl)['danh_van']
        assert res == expected, f"FAIL {syl}: {res} != {expected}"
        print(f" [PASS] '{syl}': {res}")
        passed += 1
    for word, (exp_parts, exp_whole) in MULTI.items():
        r = spell_word(word)
        actual_parts = [t['danh_van'] for t in r['tieng']]
        assert actual_parts == exp_parts, f"FAIL {word}: {actual_parts} != {exp_parts}"
        assert r['doc_tron'] == exp_whole, f"FAIL {word}: {r['doc_tron']} != {exp_whole}"
        print(f" [PASS] '{word}': {' | '.join(actual_parts)} | {exp_whole}")
        passed += 1
    print(f"\nALL {passed}/{total} TESTS PASSED!")
