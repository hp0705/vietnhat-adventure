import unicodedata

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

TONES = {
    '\u0300': 'huyền', '\u0301': 'sắc', '\u0309': 'hỏi', '\u0303': 'ngã', '\u0323': 'nặng',
}

def split_tone(syllable):
    tone = 'ngang'
    out = []
    # NFD normalization
    for ch in unicodedata.normalize('NFD', syllable):
        if ch in TONES:
            tone = TONES[ch]
        else:
            out.append(ch)
    base = unicodedata.normalize('NFC', "".join(out))
    return base, tone

def parse_syllable(base):
    onset = ''
    for o in ONSETS:
        if base.startswith(o):
            onset = o
            break
    rest = base[len(onset):]

    # "gi" + phụ âm/hết chữ (gì, gin): thực chất là g + i...
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
    original = unicodedata.normalize('NFC', syllable.strip().lower())
    base, tone = split_tone(original)
    onset, vowels, fin, rime = parse_syllable(base)
    simple = len(vowels) == 1 and not fin
    if onset:
        name = ONSET_NAMES[onset]
        if simple:
            seq = [name, vowels, base]
        else:
            seq = [name] + rime_steps(vowels, fin) + [name, rime, base]
    else:
        seq = rime_steps(vowels, fin)
    if tone != 'ngang':
        seq.extend([tone, original])
    return {
        'tieng': original,
        'am_dau': onset,
        'van': rime,
        'thanh': tone,
        'danh_van': ' - '.join(seq),
        'steps': seq
    }

def spell_word(word):
    clean = unicodedata.normalize('NFC', ' '.join(word.strip().lower().split()))
    return {
        'tu': clean,
        'tieng': [spell_syllable(p) for p in clean.split()],
        'doc_tron': clean
    }

# Run tests from danh-van_test.js
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
}

if __name__ == '__main__':
    passed = 0
    total = len(GOLDEN)
    print(f"=== TESTING {total} GOLDEN CASES FROM danh-van_test.js ===")
    for syl, expected in GOLDEN.items():
        res = spell_syllable(syl)['danh_van']
        if res == expected:
            print(f" [PASS] '{syl}': {res}")
            passed += 1
        else:
            print(f" [FAIL] '{syl}':")
            print(f"   Expected: {expected}")
            print(f"   Actual:   {res}")
    print(f"\nResult: {passed}/{total} passed.")
