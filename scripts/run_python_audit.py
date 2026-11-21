import json
import os
import unicodedata
import re

from test_danh_van_js import spell_syllable, split_tone, parse_syllable, spell_word

def tokenize(s):
    return [p.strip() for p in re.split(r'[\s,;|/\-–—−‒.]+', str(s).lower()) if p.strip()]

def expected_word_tokens(word):
    clean = unicodedata.normalize('NFC', word.strip().lower()).replace('-', ' ')
    syls = clean.split()
    tokens = []
    for s in syls:
        t_info = spell_syllable(s)
        tokens.extend(tokenize(t_info['danh_van']))
    if len(syls) > 1:
        tokens.extend(syls)
    return tokens

def diff_tokens(expected, got):
    n, m = len(expected), len(got)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n - 1, -1, -1):
        for j in range(m - 1, -1, -1):
            if expected[i] == got[j]:
                dp[i][j] = dp[i + 1][j + 1] + 1
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j + 1])
    missing, extra = [], []
    i, j = 0, 0
    while i < n and j < m:
        if expected[i] == got[j]:
            i += 1
            j += 1
        elif dp[i + 1][j] >= dp[i][j + 1]:
            missing.append(expected[i])
            i += 1
        else:
            extra.append(got[j])
            j += 1
    while i < n:
        missing.append(expected[i])
        i += 1
    while j < m:
        extra.append(got[j])
        j += 1
    return missing, extra

def contains_run(hay, needle):
    for i in range(len(hay) - len(needle) + 1):
        if hay[i : i + len(needle)] == needle:
            return True
    return False

def audit_word(word, given_spelling):
    clean = unicodedata.normalize('NFC', word.strip().lower()).replace('-', ' ')
    syls = clean.split()
    got = tokenize(given_spelling)
    expected = expected_word_tokens(word)
    problems = []
    for s in syls:
        t_tokens = tokenize(spell_syllable(s)['danh_van'])
        if not contains_run(got, t_tokens):
            problems.append(f'Tiếng "{s}" không được đánh vần đủ, phải là: {" - ".join(t_tokens)}')
    if len(syls) > 1 and not contains_run(got[-len(syls):], syls):
        problems.append(f'Thiếu đọc trơn cả từ ở cuối: "{clean}"')
    missing, extra = diff_tokens(expected, got)
    ok = len(problems) == 0 and len(missing) == 0 and len(extra) == 0
    return {
        'ok': ok,
        'word': word,
        'expected': ' '.join(expected),
        'got': ' '.join(got),
        'problems': problems,
        'missing': missing,
        'extra': extra
    }

def run_audit():
    print("=== KIỂM TRA DỮ LIỆU TỪ VỰNG (R6) ===")
    with open('01-vocabulary/vocabulary_vi_v2.json', 'r', encoding='utf-8') as f:
        vocab = json.load(f)
    with open('01-vocabulary/spelling_practice_vi_v1.json', 'r', encoding='utf-8') as f:
        spelling = json.load(f)

    all_items = vocab.get('items', []) + spelling.get('items', [])
    print(f"Tổng số mục: {len(all_items)}")

    errors = []
    unique_words = set()

    for it in all_items:
        word = it.get('word', '').strip()
        if not word:
            errors.append(f"[{it.get('id')}] Word rỗng")
            continue
        unique_words.add(word)

        try:
            r = spell_word(word.replace('-', ' '))
        except Exception as e:
            errors.append(f"[{it.get('id')} - {word}] Lỗi phân tích: {str(e)}")
            continue

        clean_syls = word.replace('-', ' ').split()
        if len(r['tieng']) != len(clean_syls):
            errors.append(f"[{word}] Số tiếng không khớp ({len(r['tieng'])} vs {len(clean_syls)})")

        exp_toks = expected_word_tokens(word)
        aud = audit_word(word, ' '.join(exp_toks))
        if not aud['ok']:
            errors.append(f"[{word}] audit thất bại: {aud['problems']}")

        # Kiểm tra chuỗi đánh vần lưu sẵn nếu có
        rule = it.get('phonics', {}).get('spelling_rule')
        if rule:
            ra = audit_word(word, rule)
            if not ra['ok']:
                errors.append(f"[{it.get('id')} - {word}] spelling_rule lưu sẵn bị sai:\n  Có: {ra['got']}\n  Đúng: {ra['expected']}")

    print(f"Đã kiểm tra {len(unique_words)} từ vựng duy nhất.")
    if errors:
        print(f"❌ CÓ {len(errors)} LỖI:")
        for e in errors[:20]:
            print(" ", e)
        return False
    else:
        print("✅ TOÀN BỘ DỮ LIỆU ĐẠT CHUẨN 100% (0 LỖI).")
        return True

if __name__ == '__main__':
    ok = run_audit()
    exit(0 if ok else 1)
