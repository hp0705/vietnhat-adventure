"""
scripts/generate_all_word_and_example_audio.py  (bản có manifest - chống lỗi "cục đá đọc thành nhà kho")

NGUYÊN NHÂN LỖI CŨ: bản trước chỉ tạo file khi file CHƯA CÓ (hoặc quá nhỏ). Nếu thư mục
vi_0099 còn sót file âm thanh của một từ khác từ lần tạo cũ thì script cứ giữ nguyên,
nên bé bấm "cục đá" vẫn nghe âm cũ.

BẢN NÀY: ghi sổ audio_manifest.json cho từng file: file được tạo từ CHỮ NÀO.
  - File chưa có trong sổ, hoặc chữ trong sổ khác chữ hiện tại  -> TẠO LẠI.
  - File đã có trong sổ và chữ khớp                              -> bỏ qua (nhanh).
Lần chạy đầu tiên sau khi cập nhật: tất cả file "Học từ mới" chưa có trong sổ nên sẽ được tạo lại
(khoảng 400 file, vài phút). Từ lần sau chỉ tạo file còn thiếu hoặc đã đổi chữ.

Cách dùng (chạy ở thư mục gốc dự án):
    python scripts/generate_all_word_and_example_audio.py                 # chuẩn: tự phát hiện file sai/thiếu
    python scripts/generate_all_word_and_example_audio.py --force         # ép tạo lại TOÀN BỘ Học từ mới
    python scripts/generate_all_word_and_example_audio.py --ids vi_0099   # chỉ các id này (ép tạo lại)
    python scripts/generate_all_word_and_example_audio.py --force-spelling  # ép tạo lại cả Tập đánh vần
    python scripts/generate_all_word_and_example_audio.py --archive-orphans # chuyển thư mục âm thanh cũ không còn dùng sang _archive
    python scripts/generate_all_word_and_example_audio.py --dry-run       # chỉ in kế hoạch, không tạo gì
"""
import argparse
import asyncio
import json
import os
import shutil
import sys
import urllib.parse
import urllib.request

import edge_tts

sys.stdout.reconfigure(line_buffering=True)
VOICE = 'vi-VN-HoaiMyNeural'
VOCAB_PATH = '01-vocabulary/vocabulary_vi_v2.json'
SPELL_PATH = '01-vocabulary/spelling_practice_vi_v1.json'
MANIFEST_PATH = '01-vocabulary/audio_manifest.json'
VOCAB_ROOT = '06-assets/audio/vi/north-hanoi'
ARCHIVE_ROOT = '06-assets/audio/vi/_archive'
MIN_BYTES = 1000


def fetch_google_tts(text):
    clean = text.replace('"', '').replace("'", "").strip()
    encoded = urllib.parse.quote(clean)
    url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q={encoded}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = resp.read()
            if len(data) > 500:
                return data
    except Exception as e:
        print(f"  [Google TTS Error] {e} for '{clean}'")
    return None


async def get_edge_audio(clean):
    c = edge_tts.Communicate(clean, VOICE)
    buf = bytearray()
    async for chunk in c.stream():
        if chunk['type'] == 'audio':
            buf.extend(chunk['data'])
    if len(buf) > MIN_BYTES:
        return bytes(buf)
    return None


async def get_audio_bytes(text):
    clean = text.replace('"', '').replace("'", "").strip()
    if not clean:
        return None
    try:
        b = await asyncio.wait_for(get_edge_audio(clean), timeout=6)
        if b:
            return b
    except Exception:
        pass
    try:
        g = fetch_google_tts(clean)
        if g and len(g) > 500:
            return g
    except Exception:
        pass
    return None


def load_manifest():
    if os.path.exists(MANIFEST_PATH):
        try:
            with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
                m = json.load(f)
            if isinstance(m, dict) and isinstance(m.get('files'), dict):
                return m
        except Exception:
            pass
    return {'version': 1, 'voice': VOICE, 'files': {}}


def save_manifest(m):
    with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(m, f, ensure_ascii=False, indent=2, sort_keys=True)


def file_ok(path):
    return os.path.exists(path) and os.path.getsize(path) >= MIN_BYTES


def needs_work(manifest, path, text, force):
    """Trả về lý do cần tạo lại, hoặc None nếu file đã đúng."""
    if force:
        return 'ép tạo lại'
    if not file_ok(path):
        return 'file thiếu/quá nhỏ'
    rec = manifest['files'].get(path)
    if rec is None:
        return 'chưa có trong sổ (không biết file tạo từ chữ nào)'
    if rec.get('text') != text:
        return f"chữ đã đổi (sổ: '{rec.get('text')}' / hiện tại: '{text}')"
    return None


async def build_file(manifest, path, text, item_id, kind, force, dry, stats):
    reason = needs_work(manifest, path, text, force)
    if reason is None:
        stats['skipped'] += 1
        return True
    print(f"  tạo {path}  <- '{text}'   [{reason}]")
    if dry:
        stats['planned'] += 1
        return True
    data = await get_audio_bytes(text)
    if not data:
        print(f"    ❌ KHÔNG tạo được âm thanh cho '{text}' ({item_id}); giữ nguyên file cũ nếu có.")
        stats['failed'].append((item_id, kind, text))
        return False
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + '.tmp'
    with open(tmp, 'wb') as f:
        f.write(data)
    os.replace(tmp, path)  # chỉ ghi đè khi đã có dữ liệu mới hoàn chỉnh
    manifest['files'][path] = {'id': item_id, 'kind': kind, 'text': text}
    stats['built'] += 1
    await asyncio.sleep(0.04)
    return True


def set_audio_meta(it, w_path, ex_path):
    if not isinstance(it.get('audio'), dict):
        it['audio'] = {}
    it['audio']['word_full'] = w_path
    it['audio']['example_sentence'] = ex_path
    if not isinstance(it['audio'].get('dialects'), dict):
        it['audio']['dialects'] = {}
    if not isinstance(it['audio']['dialects'].get('north'), dict):
        it['audio']['dialects']['north'] = {}
    it['audio']['dialects']['north']['word_full'] = w_path
    it['audio']['dialects']['north']['example_sentence'] = ex_path


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--force', action='store_true', help='ép tạo lại toàn bộ âm thanh Học từ mới')
    ap.add_argument('--force-spelling', action='store_true', help='ép tạo lại toàn bộ âm thanh Tập đánh vần')
    ap.add_argument('--ids', default='', help='danh sách id, cách nhau bằng dấu phẩy, ép tạo lại các id này')
    ap.add_argument('--archive-orphans', action='store_true', help='chuyển thư mục âm thanh Học từ mới không còn thuộc từ nào sang _archive')
    ap.add_argument('--dry-run', action='store_true', help='chỉ in kế hoạch, không tạo/sửa gì')
    args = ap.parse_args()
    only_ids = {x.strip() for x in args.ids.split(',') if x.strip()}
    manifest = load_manifest()
    manifest['voice'] = VOICE

    print("=== 1. HỌC TỪ MỚI (vocabulary_vi_v2.json) ===")
    with open(VOCAB_PATH, 'r', encoding='utf-8') as f:
        vocab_data = json.load(f)
    vs = {'built': 0, 'skipped': 0, 'planned': 0, 'failed': []}
    for it in vocab_data['items']:
        item_id, word = it['id'], it['word']
        example = it.get('example_vi') or word
        w_path = f"{VOCAB_ROOT}/{item_id}/word.mp3"
        ex_path = f"{VOCAB_ROOT}/{item_id}/example.mp3"
        force = args.force or item_id in only_ids
        await build_file(manifest, w_path, word, item_id, 'word', force, args.dry_run, vs)
        await build_file(manifest, ex_path, example, item_id, 'example', force, args.dry_run, vs)
        set_audio_meta(it, w_path, ex_path)
    print(f"Học từ mới: tạo {vs['built']}, bỏ qua (đã đúng) {vs['skipped']}, "
          f"lên kế hoạch {vs['planned']}, lỗi {len(vs['failed'])}.")

    print("\n=== 2. TẬP ĐÁNH VẦN (spelling_practice_vi_v1.json) ===")
    with open(SPELL_PATH, 'r', encoding='utf-8') as f:
        spelling_data = json.load(f)
    ss = {'built': 0, 'skipped': 0, 'planned': 0, 'failed': []}
    for it in spelling_data['items']:
        item_id, word = it['id'], it['word']
        example = it.get('example_vi') or word
        w_path = f"06-assets/audio/spelling/words/{item_id}.mp3"
        ex_path = f"06-assets/audio/spelling/examples/{item_id}.mp3"
        force = args.force_spelling or item_id in only_ids
        # Tập đánh vần: file có sẵn từ trước được TIN TƯỞNG (chưa báo lỗi), nên ghi sổ nếu thiếu.
        for p, txt, kind in ((w_path, word, 'word'), (ex_path, example, 'example')):
            if not force and file_ok(p) and p not in manifest['files']:
                manifest['files'][p] = {'id': item_id, 'kind': kind, 'text': txt, 'trusted_existing': True}
        await build_file(manifest, w_path, word, item_id, 'word', force, args.dry_run, ss)
        await build_file(manifest, ex_path, example, item_id, 'example', force, args.dry_run, ss)
        set_audio_meta(it, w_path, ex_path)
    print(f"Tập đánh vần: tạo {ss['built']}, bỏ qua {ss['skipped']}, lên kế hoạch {ss['planned']}, lỗi {len(ss['failed'])}.")

    # Thư mục âm thanh Học từ mới không thuộc từ nào hiện có
    ids = {it['id'] for it in vocab_data['items']}
    orphans = []
    if os.path.isdir(VOCAB_ROOT):
        orphans = sorted(d for d in os.listdir(VOCAB_ROOT)
                         if os.path.isdir(os.path.join(VOCAB_ROOT, d)) and d not in ids)
    if orphans:
        print(f"\nCó {len(orphans)} thư mục âm thanh cũ không thuộc từ nào hiện có (vd: {orphans[:8]}).")
        if args.archive_orphans and not args.dry_run:
            os.makedirs(ARCHIVE_ROOT, exist_ok=True)
            for d in orphans:
                shutil.move(os.path.join(VOCAB_ROOT, d), os.path.join(ARCHIVE_ROOT, d))
            for p in [p for p in manifest['files'] if any(p.startswith(f"{VOCAB_ROOT}/{d}/") for d in orphans)]:
                manifest['files'].pop(p, None)
            print(f"Đã chuyển {len(orphans)} thư mục sang {ARCHIVE_ROOT}/ (không xóa).")
        else:
            print("  (chạy thêm --archive-orphans để chuyển chúng sang _archive cho khỏi nhầm)")

    if not args.dry_run:
        with open(VOCAB_PATH, 'w', encoding='utf-8') as f:
            json.dump(vocab_data, f, ensure_ascii=False, indent=2)
        with open(SPELL_PATH, 'w', encoding='utf-8') as f:
            json.dump(spelling_data, f, ensure_ascii=False, indent=2)
        save_manifest(manifest)

    print("\n=== 3. KIỂM TRA TỔNG QUÁT ===")
    def missing(items, wf, ef):
        return [it['id'] for it in items if not file_ok(wf(it['id'])) or not file_ok(ef(it['id']))]
    vm = missing(vocab_data['items'], lambda i: f"{VOCAB_ROOT}/{i}/word.mp3", lambda i: f"{VOCAB_ROOT}/{i}/example.mp3")
    sm = missing(spelling_data['items'], lambda i: f"06-assets/audio/spelling/words/{i}.mp3", lambda i: f"06-assets/audio/spelling/examples/{i}.mp3")
    stale = [it['id'] for it in vocab_data['items']
             if manifest['files'].get(f"{VOCAB_ROOT}/{it['id']}/word.mp3", {}).get('text') != it['word']]
    print(f"Học từ mới thiếu file: {len(vm)} | chữ trong sổ không khớp: {len(stale)}")
    print(f"Tập đánh vần thiếu file: {len(sm)}")
    failed = vs['failed'] + ss['failed']
    if failed:
        print("\n⚠️ Các file KHÔNG tạo được (thường do mất mạng), chạy lại script sau:")
        for f_ in failed[:30]:
            print("  -", f_)
    if args.dry_run:
        print("\n(chế độ --dry-run: chưa tạo/sửa gì)")
    elif not vm and not sm and not failed and not stale:
        print(f"\n🎉 THÀNH CÔNG: {len(vocab_data['items'])} từ Học từ mới và {len(spelling_data['items'])} từ Tập đánh vần đã có âm thanh đúng.")
        print("   Hãy chạy: python scripts/audit_audio_match.py")
    else:
        print("\n⚠️ Cảnh báo: còn file thiếu hoặc chưa khớp!")


if __name__ == '__main__':
    asyncio.run(main())
