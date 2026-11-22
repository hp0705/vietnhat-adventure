"""
scripts/audit_audio_match.py
Kiểm tra file âm thanh có KHỚP với từ hay không (phát hiện lỗi kiểu: bấm "cục đá" nhưng đọc "nhà kho").

Chạy từ thư mục gốc dự án:   python scripts/audit_audio_match.py
Script KHÔNG sửa gì, chỉ in báo cáo. Thoát mã 1 nếu có lỗi chắc chắn.

Các kiểm tra (đều không cần nghe):
  1. File mp3 trong JSON có tồn tại và đủ lớn không.
  2. Thư mục/tên file có đúng id của từ không (vi_0099 phải chứa âm của từ có id vi_0099).
  3. Hai từ KHÁC NHAU không được dùng chung 1 đường dẫn.
  4. Hai từ KHÁC NHAU không được có file mp3 giống hệt nhau (md5) -> chắc chắn có file bị nhầm.
  5. Thư mục âm thanh "mồ côi" (không thuộc từ nào hiện có) -> cảnh báo.
  6. File word.mp3 của một từ hiện có GIỐNG HỆT file của thư mục khác (kể cả thư mục cũ/mồ côi)
     -> rất có thể là file cũ bị sót (đúng kiểu lỗi "cục đá" đọc thành "nhà kho").
"""
import hashlib
import json
import os
import re
import sys
from collections import defaultdict

VOCAB = '01-vocabulary/vocabulary_vi_v2.json'
SPELL = '01-vocabulary/spelling_practice_vi_v1.json'
VOCAB_AUDIO_ROOT = '06-assets/audio/vi/north-hanoi'
MIN_BYTES = 500


def md5(path):
    h = hashlib.md5()
    with open(path, 'rb') as f:
        h.update(f.read())
    return h.hexdigest()


def audio_paths(item):
    """Trả về {loại: đường dẫn} gồm 'word' và 'example' (lấy cả audio.* lẫn audio.dialects.north.*)."""
    a = item.get('audio') or {}
    north = ((a.get('dialects') or {}).get('north')) or {}
    out = {}
    w = north.get('word_full') or a.get('word_full')
    e = north.get('example_sentence') or a.get('example_sentence')
    if w: out['word'] = w.replace('\\', '/')
    if e: out['example'] = e.replace('\\', '/')
    return out


def main():
    errors, warns = [], []
    entries = []  # (module, id, word, kind, path)
    for module, fn in (('vocab', VOCAB), ('spelling', SPELL)):
        if not os.path.exists(fn):
            warns.append(f'Không thấy {fn}, bỏ qua.')
            continue
        with open(fn, 'r', encoding='utf-8') as f:
            items = json.load(f).get('items', [])
        for it in items:
            paths = audio_paths(it)
            if not paths:
                warns.append(f"[{module}] '{it['word']}' ({it['id']}) chưa có đường dẫn âm thanh (sẽ đọc bằng giọng dự phòng).")
            for kind, p in paths.items():
                entries.append((module, it['id'], it['word'], kind, p))

    # 1 + 2: tồn tại, kích thước, id khớp
    for module, iid, word, kind, p in entries:
        if not os.path.exists(p):
            errors.append(f"[{module}] '{word}' ({iid}) {kind}: file không tồn tại: {p}")
            continue
        if os.path.getsize(p) < MIN_BYTES:
            errors.append(f"[{module}] '{word}' ({iid}) {kind}: file quá nhỏ (nghi lỗi): {p}")
        m = re.search(r'((?:vi|sp)_\d+)', p)
        if m and m.group(1) != iid:
            errors.append(f"[{module}] '{word}' ({iid}) {kind}: đường dẫn trỏ sang id khác ({m.group(1)}): {p}")

    # 3: dùng chung đường dẫn
    by_path = defaultdict(set)
    for module, iid, word, kind, p in entries:
        by_path[(kind, p)].add((iid, word))
    for (kind, p), owners in by_path.items():
        if len({o[0] for o in owners}) > 1:
            errors.append(f"{kind}: nhiều từ cùng dùng 1 file {p}: {sorted(o[1] for o in owners)}")

    # 4: file giống hệt nhau nhưng thuộc từ khác nhau
    by_hash = defaultdict(list)
    for module, iid, word, kind, p in entries:
        if kind == 'word' and os.path.exists(p) and os.path.getsize(p) >= MIN_BYTES:
            by_hash[md5(p)].append((word, p))
    for h, lst in by_hash.items():
        words = {w for w, _ in lst}
        if len(words) > 1:
            errors.append(f"File âm thanh GIỐNG HỆT nhau nhưng là các từ khác nhau {sorted(words)}: {[p for _, p in lst]}")

    # 6: file word.mp3 của từ hiện có giống hệt file ở thư mục khác (kể cả thư mục cũ)
    if os.path.isdir(VOCAB_AUDIO_ROOT) and os.path.exists(VOCAB):
        with open(VOCAB, 'r', encoding='utf-8') as f:
            cur = {it['id']: it['word'] for it in json.load(f).get('items', [])}
        groups = defaultdict(list)
        for d in sorted(os.listdir(VOCAB_AUDIO_ROOT)):
            wp = os.path.join(VOCAB_AUDIO_ROOT, d, 'word.mp3')
            if os.path.isfile(wp) and os.path.getsize(wp) >= MIN_BYTES:
                groups[md5(wp)].append(d)
        for h, dirs in groups.items():
            if len(dirs) > 1 and any(d in cur for d in dirs):
                desc = [f"{d} ({cur[d]})" if d in cur else f"{d} (thư mục cũ, không còn trong danh sách)" for d in dirs]
                errors.append("word.mp3 giống hệt nhau ở nhiều thư mục -> nghi file cũ bị sót: " + ', '.join(desc))

    # 5: thư mục mồ côi
    if os.path.isdir(VOCAB_AUDIO_ROOT) and os.path.exists(VOCAB):
        with open(VOCAB, 'r', encoding='utf-8') as f:
            ids = {it['id'] for it in json.load(f).get('items', [])}
        orphans = sorted(d for d in os.listdir(VOCAB_AUDIO_ROOT)
                         if os.path.isdir(os.path.join(VOCAB_AUDIO_ROOT, d)) and d not in ids)
        if orphans:
            warns.append(f"{len(orphans)} thư mục âm thanh cũ không thuộc từ nào hiện có "
                         f"(vd: {orphans[:8]}). Nên chuyển vào archive để khỏi nhầm.")

    print('==============================================')
    print('  KIỂM TRA ÂM THANH CÓ KHỚP VỚI TỪ KHÔNG')
    print('==============================================')
    print(f'Đã kiểm tra {len(entries)} file âm thanh.')
    for w in warns[:40]:
        print('  [cảnh báo]', w)
    if len(warns) > 40:
        print(f'  ... và {len(warns) - 40} cảnh báo khác')
    if errors:
        print(f'\n❌ {len(errors)} LỖI:')
        for e in errors[:80]:
            print('  -', e)
        sys.exit(1)
    print('\n✅ Không phát hiện nhầm lẫn nào ở mức đường dẫn/file trùng.')
    print('   (Nếu vẫn nghe sai: file có đường dẫn đúng nhưng NỘI DUNG sai -> cần tạo lại âm thanh bằng --force.)')


if __name__ == '__main__':
    main()
