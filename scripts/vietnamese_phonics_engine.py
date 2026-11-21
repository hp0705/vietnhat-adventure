"""
Module thuật toán đánh vần tiếng Việt chuẩn 100% theo quy tắc tiểu học truyền thống.
Tuân thủ đầy đủ Bộ Prompt Đánh Vần Tiếng Việt (System Prompt & 18 Golden Cases).
"""

CONSONANTS_SOUND = {
    'ngh': 'ngờ',
    'ng': 'ngờ',
    'ch': 'chờ',
    'gh': 'gờ',
    'gi': 'giờ',
    'kh': 'khờ',
    'nh': 'nhờ',
    'ph': 'phờ',
    'qu': 'quờ',
    'th': 'thờ',
    'tr': 'trờ',
    'b': 'bờ',
    'c': 'cờ',
    'd': 'dờ',
    'đ': 'đờ',
    'g': 'gờ',
    'h': 'hờ',
    'k': 'cờ',
    'l': 'lờ',
    'm': 'mờ',
    'n': 'nờ',
    'p': 'pờ',
    'q': 'cờ',
    'r': 'rờ',
    's': 'sờ',
    't': 'tờ',
    'v': 'vờ',
    'x': 'xờ'
}

FINAL_CONSONANTS_SOUND = {
    'ng': 'ngờ',
    'nh': 'nhờ',
    'ch': 'chờ',
    'c': 'cờ',
    'm': 'mờ',
    'n': 'nờ',
    'p': 'pờ',
    't': 'tờ'
}

TONES = {
    'sắc': 'sắc',
    'huyền': 'huyền',
    'hỏi': 'hỏi',
    'ngã': 'ngã',
    'nặng': 'nặng'
}

CHAR_TO_BASE_AND_TONE = {
    'á': ('a', 'sắc'), 'à': ('a', 'huyền'), 'ả': ('a', 'hỏi'), 'ã': ('a', 'ngã'), 'ạ': ('a', 'nặng'),
    'ắ': ('ă', 'sắc'), 'ằ': ('ă', 'huyền'), 'ẳ': ('ă', 'hỏi'), 'ẵ': ('ă', 'ngã'), 'ặ': ('ă', 'nặng'),
    'ấ': ('â', 'sắc'), 'ầ': ('â', 'huyền'), 'ẩ': ('â', 'hỏi'), 'ẫ': ('â', 'ngã'), 'ậ': ('â', 'nặng'),
    'é': ('e', 'sắc'), 'è': ('e', 'huyền'), 'ẻ': ('e', 'hỏi'), 'ẽ': ('e', 'ngã'), 'ẹ': ('e', 'nặng'),
    'ế': ('ê', 'sắc'), 'ề': ('ê', 'huyền'), 'ể': ('ê', 'hỏi'), 'ễ': ('ê', 'ngã'), 'ệ': ('ê', 'nặng'),
    'í': ('i', 'sắc'), 'ì': ('i', 'huyền'), 'ỉ': ('i', 'hỏi'), 'ĩ': ('i', 'ngã'), 'ị': ('i', 'nặng'),
    'ó': ('o', 'sắc'), 'ò': ('o', 'huyền'), 'ỏ': ('o', 'hỏi'), 'õ': ('o', 'ngã'), 'ọ': ('o', 'nặng'),
    'ố': ('ô', 'sắc'), 'ồ': ('ô', 'huyền'), 'ổ': ('ô', 'hỏi'), 'ỗ': ('ô', 'ngã'), 'ộ': ('ô', 'nặng'),
    'ớ': ('ơ', 'sắc'), 'ờ': ('ơ', 'huyền'), 'ở': ('ơ', 'hỏi'), 'ỡ': ('ơ', 'ngã'), 'ợ': ('ơ', 'nặng'),
    'ú': ('u', 'sắc'), 'ù': ('u', 'huyền'), 'ủ': ('u', 'hỏi'), 'ũ': ('u', 'ngã'), 'ụ': ('u', 'nặng'),
    'ứ': ('ư', 'sắc'), 'ừ': ('ư', 'huyền'), 'ử': ('ư', 'hỏi'), 'ữ': ('ư', 'ngã'), 'ự': ('ư', 'nặng'),
    'ý': ('y', 'sắc'), 'ỳ': ('y', 'huyền'), 'ỷ': ('y', 'hỏi'), 'ỹ': ('y', 'ngã'), 'ỵ': ('y', 'nặng')
}

def remove_tone(syllable):
    tone = 'ngang'
    clean_chars = []
    for ch in syllable.lower():
        if ch in CHAR_TO_BASE_AND_TONE:
            base, t = CHAR_TO_BASE_AND_TONE[ch]
            clean_chars.append(base)
            tone = t
        else:
            clean_chars.append(ch)
    return ''.join(clean_chars), tone

def split_onset_rime(base_syllable):
    s = base_syllable.lower()
    
    if s.startswith('qu'):
        if len(s) > 2 and s[2] in 'aăâeêioôơuưy':
            return 'qu', s[2:]
        return 'qu', s[2:]

    if s.startswith('gi'):
        if len(s) > 2 and s[2] in 'aăâeêoôơuưy':
            return 'gi', s[2:]
        if s == 'gi':
            return 'gi', 'i'
        return 'gi', s[1:]

    for c in ['ngh', 'ng', 'ch', 'gh', 'kh', 'nh', 'ph', 'th', 'tr', 'b', 'c', 'd', 'đ', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'x']:
        if s.startswith(c):
            return c, s[len(c):]

    return '', s

def spell_rime(rime):
    if len(rime) <= 1:
        return [rime]

    final_c = ''
    nucleus = rime
    for fc in ['ng', 'nh', 'ch', 'c', 'm', 'n', 'p', 't']:
        if rime.endswith(fc) and len(rime) > len(fc):
            final_c = fc
            nucleus = rime[:-len(fc)]
            break

    if final_c:
        final_sound = FINAL_CONSONANTS_SOUND.get(final_c, final_c)
        if len(nucleus) == 1:
            return [nucleus, final_sound, rime]
        nuc_steps = spell_rime(nucleus)
        return [*nuc_steps, final_sound, rime]

    if len(rime) == 2:
        return [rime[0], rime[1], rime]
    
    if len(rime) == 3:
        prefix_steps = spell_rime(rime[:2])
        return [*prefix_steps, rime[2], rime]

    if len(rime) == 4:
        prefix_steps = spell_rime(rime[:3])
        return [*prefix_steps, rime[3], rime]

    return list(rime)

def get_syllable_steps(syllable):
    s_raw = syllable.lower().strip()
    if not s_raw:
        return []

    base_s, tone = remove_tone(s_raw)
    onset, rime = split_onset_rime(base_s)
    rime_steps = spell_rime(rime)
    steps = []

    if not onset:
        steps.extend(rime_steps)
        if tone != 'ngang':
            steps.append(tone)
            steps.append(s_raw)
        return steps

    onset_sound = CONSONANTS_SOUND.get(onset, onset)

    if onset == 'qu' and len(rime_steps) > 1:
        steps.extend(rime_steps)
        steps.extend([onset_sound, rime, base_s])
        if tone != 'ngang':
            steps.append(tone)
            steps.append(s_raw)
        return steps

    if len(rime) > 1:
        steps.append(onset_sound)
        steps.extend(rime_steps)
        steps.extend([onset_sound, rime, base_s])
        if tone != 'ngang':
            steps.append(tone)
            steps.append(s_raw)
    else:
        steps.extend([onset_sound, rime, base_s])
        if tone != 'ngang':
            steps.append(tone)
            steps.append(s_raw)

    return steps

def spell_syllable(syllable):
    return " - ".join(get_syllable_steps(syllable))

def spell_word(word):
    parts = word.strip().split()
    if len(parts) == 1:
        return spell_syllable(parts[0])
    
    res = []
    for idx, p in enumerate(parts):
        res.append(f"tiếng {idx+1}: " + spell_syllable(p))
    res.append(f"đọc: {word}")
    return " / ".join(res)

def get_word_steps_list(word):
    """
    Trả về mảng các bước âm thanh tuần tự cho máy đọc:
    - Nếu từ 1 tiếng: các bước của tiếng đó
    - Nếu từ nhiều tiếng: lần lượt các bước của từng tiếng, cuối cùng là đọc cả từ
    """
    parts = word.strip().split()
    if len(parts) == 1:
        steps = get_syllable_steps(parts[0])
        return steps

    steps = []
    for p in parts:
        steps.extend(get_syllable_steps(p))
    steps.append(word)
    return steps

CUM_TU_GOI_NGHIA_MAP = {
    'na': 'quả na', 'đa': 'cây đa', 'dê': 'con dê', 'bàn': 'cái bàn', 'cà': 'quả cà',
    'lê': 'quả lê', 'cá': 'con cá', 'bò': 'con bò', 'gà': 'con gà', 'vịt': 'con vịt',
    'chó': 'con chó', 'mèo': 'con mèo', 'hoa': 'bông hoa', 'lá': 'chiếc lá', 'cây': 'cây xanh',
    'xe': 'chiếc xe', 'đèn': 'chiếc đèn', 'bút': 'cây bút', 'sách': 'cuốn sách', 'vở': 'quyển vở',
    'ghế': 'chiếc ghế', 'nhà': 'ngôi nhà', 'cửa': 'cánh cửa', 'nơ': 'chiếc nơ', 'mì': 'tô mì',
    'phở': 'bát phở', 'nho': 'chùm nho', 'thị': 'quả thị', 'rổ': 'chiếc rổ', 'sò': 'con sò',
    've': 'con ve', 'tre': 'cây tre', 'khỉ': 'con khỉ', 'hổ': 'con hổ', 'voi': 'con voi',
    'thỏ': 'con thỏ', 'ngựa': 'con ngựa', 'sen': 'bông sen', 'mía': 'cây mía', 'dừa': 'quả dừa',
    'ngô': 'bắp ngô', 'búa': 'chiếc búa', 'gương': 'chiếc gương', 'yếm': 'chiếc yếm'
}

def get_cum_tu_goi_nghia(word):
    w_clean = word.strip().lower()
    if w_clean in CUM_TU_GOI_NGHIA_MAP:
        return CUM_TU_GOI_NGHIA_MAP[w_clean]
    
    # Heuristics
    if len(word.split()) == 1:
        if any(c in w_clean for c in ['cá', 'chim', 'chuột', 'mèo', 'chó', 'gà', 'vịt', 'ngỗng', 'heo', 'lợn', 'bò', 'dê', 'ngựa', 'voi', 'hổ', 'báo', 'gấu', 'thỏ', 'khỉ', 'vượn', 'sóc', 'hươu', 'nai', 'cừu', 'trâu', 'ong', 'bướm', 'sâu', 'kiến', 've', 'muỗi', 'ruồi', 'ếch', 'nhái', 'cóc', 'thằn lằn', 'rắn', 'trăn', 'rùa', 'ba ba', 'sò', 'ốc', 'hến', 'tôm', 'cua', 'còng', 'mực', 'bạch tuộc']):
            return f"con {word}"
        if any(p in w_clean for p in ['hoa', 'bông', 'nụ']):
            return f"bông {word}"
        if any(p in w_clean for p in ['cây', 'tre', 'trúc', 'thông', 'đa', 'si', 'liễu', 'bàng', 'phượng']):
            return f"cây {word}"
        if any(f in w_clean for f in ['quả', 'trái', 'cam', 'quýt', 'bưởi', 'chanh', 'táo', 'lê', 'mận', 'đào', 'mơ', 'mận', 'xoài', 'ổi', 'mận', 'nhãn', 'vải', 'chôm chôm', 'măng cụt', 'sầu riêng', 'chuối', 'đu đủ', 'dưa', 'dứa', 'thơm', 'khóm', 'thị', 'na', 'khế', 'hồng']):
            return f"quả {word}"
    return word

def to_json_format(word):
    parts = word.strip().split()
    tieng_list = []
    for p in parts:
        base_s, tone = remove_tone(p)
        onset, rime = split_onset_rime(base_s)
        tieng_list.append({
            "tieng": p,
            "am_dau": onset,
            "van": rime,
            "thanh": tone,
            "danh_van": spell_syllable(p)
        })
    return {
        "tu": word,
        "cum_tu_goi_nghia": get_cum_tu_goi_nghia(word),
        "tieng": tieng_list,
        "doc_tron": word
    }
