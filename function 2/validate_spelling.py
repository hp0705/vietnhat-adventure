#!/usr/bin/env python3
"""Kiểm tra spelling_practice_vi_v1.json (v1.1: thêm bài theo âm cuối, từ ghép, cặp khác nguyên âm). Chạy: python3 validate_spelling.py [spelling.json] [vocabulary.json]
Thoát mã 1 nếu có lỗi. Bảng âm được đọc từ chính file JSON, bộ kiểm tra tự suy ra lại chuỗi và so sánh."""
import json, re, sys, unicodedata as ud, collections, os

N = lambda s: ud.normalize("NFC", s)
sp_path = sys.argv[1] if len(sys.argv) > 1 else "spelling_practice_vi_v1.json"
vc_path = sys.argv[2] if len(sys.argv) > 2 else "vocabulary_vi_v2_1.json"
D = json.load(open(sp_path, encoding="utf-8"))
SI = D["sound_inventory"]; ONS, FIN, TON = SI["onsets"], SI["finals"], SI["tones"]
FRONT = SI["front_vowels"]
errors, warns = [], []
E = lambda i, m: errors.append(f"[{i}] {m}")

def syl(onset, rime, tone):
    m = TON[tone]; v = N(ud.normalize("NFD", rime[0]) + m) if m else rime[0]
    return N((onset or "") + v + rime[1:])

def derive(onset, rime, tone):
    out = []
    if onset: out.append(ONS[onset])
    out += [rime[0], FIN[rime[1:]][0], rime]
    if onset: out.append(onset + rime)
    if tone != "ngang": out.append(f"{onset or ''}{rime} {tone} {syl(onset, rime, tone)}")
    return out

CONFIRMED = {"đánh": ["đờ","a","nhờ","anh","đanh","đanh sắc đánh"]}
UNSAFE = ["đánh người", "đánh bạn", "đánh nhau", "đánh em", "đánh mẹ", "đánh bố"]
REV_OK = {"pending", "user_confirmed", "editorial_note"}
STEP_TYPES = ["onset", "rime_part", "rime_part", "rime_blend", "onset_rime_blend", "tone_and_final"]

vocab = {}
if os.path.exists(vc_path):
    vocab = {v["id"]: v for v in json.load(open(vc_path, encoding="utf-8"))["items"]}
else:
    warns.append(f"không thấy {vc_path}; bỏ qua kiểm tra vocab_ref")

fam = {f["rime"]: f for f in D["rhyme_families"]}
ids, words = collections.Counter(), collections.Counter()
byid = {}
for it in D["items"]:
    i = it["id"]; ids[i] += 1; words[N(it["word"]).lower()] += 1; byid[i] = it
    if not re.fullmatch(r"sp_\d{4}", i): E(i, "ID sai định dạng sp_NNNN")
    p = it["phonics"]; rime = p["rime"]["written"]; tone = p["tone"]["name"]
    onset = p["onset"]["written"] if p["onset"] else None
    if not (len(rime) >= 2 and rime[1:] in FIN): E(i, f"vần '{rime}' ngoài phạm vi v1 (nguyên âm đơn + âm cuối)"); continue
    if tone not in TON: E(i, f"thanh '{tone}' không hợp lệ"); continue
    if onset is not None and onset not in ONS: E(i, f"âm đầu '{onset}' không có trong bảng"); continue
    # onset + vần + thanh phải ra đúng từ
    if syl(onset, rime, tone) != N(it["word"]): E(i, f"{onset}+{rime}+{tone} = '{syl(onset, rime, tone)}' ≠ '{it['word']}'")
    # chuỗi lưu phải bằng chuỗi suy ra lại
    exp = CONFIRMED.get(it["word"]) if p["status"] == "user_confirmed" else derive(onset, rime, tone)
    if p["sequence"] != exp: E(i, f"chuỗi {p['sequence']} ≠ mong đợi {exp}")
    if exp and [s["display"] for s in p["steps"]] != p["sequence"]: E(i, "steps và sequence không khớp")
    if [s["order"] for s in p["steps"]] != list(range(1, len(p["steps"]) + 1)): E(i, "order không liên tục")
    if onset and p["steps"][0]["display"] != ONS[onset]: E(i, "bước 1 không phải tên âm của âm đầu (trộn âm đầu của từ khác?)")
    if p["steps"] and p["steps"][-1]["type"] not in ("tone_and_final", "onset_rime_blend", "rime_blend"): E(i, "bước cuối sai loại")
    if any(len(x["display"]) == 1 and x["display"] in "bcdđghklmnpqrstvxy" and x["type"] != "rime_part" for x in p["steps"]):
        E(i, "bước dùng tên chữ cái thay vì âm")
    # chính tả c/k, g/gh, ng/ngh
    front = rime[0] in FRONT
    for plain, special in (("c", "k"), ("g", "gh"), ("ng", "ngh")):
        if onset == plain and front: E(i, f"'{plain}' không đứng trước {rime[0]} (phải là '{special}')")
        if onset == special and not front: E(i, f"'{special}' chỉ đứng trước e, ê, i")
    # âm tiết kết thúc p,t,c,ch chỉ nhận sắc/nặng
    if FIN[rime[1:]][1] == "stop" and tone not in ("sắc", "nặng"): E(i, f"vần tắc '{rime}' không nhận thanh {tone}")
    if rime not in fam: E(i, f"họ vần '{rime}' chưa khai báo")
    elif i not in fam[rime]["word_ids"]: E(i, "không có trong word_ids của họ vần")
    elif FIN[rime[1:]][1] == "stop" and fam[rime]["allowed_tones"] != ["sắc", "nặng"]: E(i, "allowed_tones của họ vần tắc sai")
    # nội dung
    for k in ("meaning_vi_child", "example_vi", "topic"):
        if not (it.get(k) or "").strip(): E(i, f"{k} trống")
    if it.get("example_vi") and N(it["word"]).lower() not in N(it["example_vi"]).lower(): E(i, "câu ví dụ không chứa từ")
    txt = N((it.get("example_vi") or "") + " " + (it.get("meaning_vi_child") or "")).lower()
    for u in UNSAFE:
        if u in txt: E(i, f"nội dung không an toàn: '{u}'")
    if it["lexical_role"] != "standalone_word" and not it.get("context_phrase"): E(i, "thiếu context_phrase cho từ không đứng riêng")
    # tài sản không được bịa
    a, im = it["audio"], it["image"]
    if a["word_full"] or a["example_sentence"] or a["phonics_steps"]: E(i, "audio phải null/rỗng cho đến khi có bản thu thật")
    if im["path"] or im["status"] != "not_created": E(i, "image phải null/not_created cho đến khi có ảnh thật")
    # duyệt
    for k, v in it["review"].items():
        if v not in REV_OK: E(i, f"review.{k}='{v}' không được phép khi chưa có bằng chứng")
    if p["status"] == "user_confirmed" and it["word"] not in CONFIRMED: E(i, "user_confirmed chỉ dành cho chuỗi người dùng đã xác nhận")
    # vocab_ref
    ref = it.get("vocab_ref")
    if ref and vocab:
        if ref not in vocab: E(i, f"vocab_ref {ref} không tồn tại")
        elif N(vocab[ref]["word"]).lower() != N(it["word"]).lower(): E(i, f"vocab_ref {ref} là '{vocab[ref]['word']}', không phải '{it['word']}'")
        elif vocab[ref].get("meaning_vi_child") and vocab[ref]["meaning_vi_child"] != it["meaning_vi_child"]: E(i, "nghĩa lệch với vocabulary")

for k, c in ids.items():
    if c > 1: E(k, "ID trùng")
for k, c in words.items():
    if c > 1: E(k, "từ trùng")
for pr in D["contrast_pairs"]:
    a, b = byid[pr["a"]], byid[pr["b"]]
    if a["rhyme_family"] != b["rhyme_family"] or a["phonics"]["tone"]["name"] != b["phonics"]["tone"]["name"]: E(pr["a"], "cặp tương phản khác vần/thanh")
    if a["phonics"]["onset"]["written"] == b["phonics"]["onset"]["written"]: E(pr["a"], "cặp tương phản cùng âm đầu")
# đau/sau không được lẫn âm đầu
w = {x["word"]: x for x in D["items"]}
if "đau" in w and "sau" in w:
    if w["đau"]["phonics"]["sequence"][0] != "đờ" or w["sau"]["phonics"]["sequence"][0] != "sờ": E("đau/sau", "âm đầu bị lẫn")
for c in D["case_catalog"]:
    if c["status"] == "covered" and not c["covered_by"]: E(c["id"], "tình huống đánh dấu covered nhưng chưa có từ nào")
    if c["status"] == "planned" and c["covered_by"]: warns.append(f"{c['id']} đã có từ nhưng còn 'planned'")


# ---------- v1.1: tag, bài học, cặp khác nguyên âm, từ ghép ----------
cat_ids = {c["id"] for c in D["case_catalog"]}
for it in D["items"]:
    for t in it["case_tags"]:
        if t not in cat_ids: E(it["id"], f"case_tag '{t}' không có trong case_catalog")
    if it["lexical_role"] == "syllable_in_compound" and it.get("context_phrase") not in {c["text"] for c in D.get("compounds", [])}:
        E(it["id"], "tiếng chỉ dùng trong từ ghép nhưng context_phrase không có trong compounds")

fam_lesson = {}
lessons = {l["id"]: l for l in D.get("lessons", [])}
for l in lessons.values():
    for u in l["units"]:
        r = u["rhyme_family"]
        if r in fam_lesson: E(l["id"], f"họ vần {r} nằm trong hai bài")
        fam_lesson[r] = l["id"]
        if r not in fam: E(l["id"], f"họ vần {r} chưa khai báo"); continue
        if fam[r]["final"] != l["final"]: E(l["id"], f"vần {r} không cùng âm cuối '{l['final']}' của bài")
        if u["word_ids"] != fam[r]["word_ids"]: E(l["id"], f"units {r}: word_ids lệch họ vần")
        if u["compound_ids"] != fam[r].get("compound_ids"): E(l["id"], f"units {r}: compound_ids lệch họ vần")
        if fam[r]["allowed_tones"] != l["allowed_tones"]: E(l["id"], f"thanh cho phép của {r} khác bài")
    if l.get("pair_with") and l["pair_with"] not in lessons: E(l["id"], "pair_with không tồn tại")
for r in fam:
    if r not in fam_lesson: E(r, "họ vần chưa thuộc bài nào")
for it in D["items"]:
    if it.get("lesson_id") != fam_lesson.get(it["rhyme_family"]): E(it["id"], "lesson_id không khớp họ vần")
oh = [it["order_hint"] for it in D["items"]]
if oh != list(range(1, len(oh) + 1)): E("items", "order_hint không liên tục theo thứ tự bài")

for p in D.get("vowel_contrast_pairs", []):
    a, b = byid[p["a"]], byid[p["b"]]
    pa, pb = a["phonics"], b["phonics"]
    if (pa["onset"] or {}).get("written") != (pb["onset"] or {}).get("written"): E(p["id"], "cặp khác nguyên âm: khác âm đầu")
    if pa["tone"]["name"] != pb["tone"]["name"]: E(p["id"], "cặp khác nguyên âm: khác thanh")
    if pa["rime"]["final"] != pb["rime"]["final"]: E(p["id"], "cặp khác nguyên âm: khác âm cuối")
    if pa["rime"]["vowel"] == pb["rime"]["vowel"]: E(p["id"], "cặp khác nguyên âm: cùng nguyên âm")
    if fam_lesson.get(a["rhyme_family"]) != fam_lesson.get(b["rhyme_family"]): E(p["id"], "hai từ khác bài (khác âm cuối)")
    if p["lesson_id"] != fam_lesson.get(a["rhyme_family"]): E(p["id"], "lesson_id của cặp sai")
    if p["word_a"] != a["word"] or p["word_b"] != b["word"]: E(p["id"], "word_a/word_b lệch id")

comps = D.get("compounds", [])
cids, ctext = collections.Counter(), collections.Counter()
order_key = {r: (list(lessons).index(fam_lesson[r]), [u["rhyme_family"] for u in lessons[fam_lesson[r]]["units"]].index(r)) for r in fam if r in fam_lesson}
for c in comps:
    i = c["id"]; cids[i] += 1; ctext[N(c["text"]).lower()] += 1
    if not re.fullmatch(r"spc_\d{4}", i): E(i, "ID sai định dạng spc_NNNN")
    toks = N(c["text"]).split()
    if c["syllable_count"] != len(toks) or len(toks) < 2: E(i, "syllable_count sai hoặc từ ghép có dưới 2 tiếng")
    if [N(s["text"]) for s in c["syllables"]] != toks: E(i, "syllables không khớp text")
    linked = []
    for s in c["syllables"]:
        ref = s["item_ref"]
        if ref is None: continue
        if ref not in byid: E(i, f"item_ref {ref} không tồn tại"); continue
        if N(byid[ref]["word"]).lower() != N(s["text"]).lower(): E(i, f"item_ref {ref} là '{byid[ref]['word']}', không phải '{s['text']}'")
        linked.append(byid[ref])
    if not linked: E(i, "từ ghép không có tiếng nào đã có chuỗi đánh vần"); continue
    if c["fully_decodable"] != all(s["item_ref"] for s in c["syllables"]): E(i, "fully_decodable sai")
    if c["unlocks_after_items"] != [x["id"] for x in linked]: E(i, "unlocks_after_items sai")
    # đặt ở bài/họ vần của tiếng học SAU CÙNG
    last = max(linked, key=lambda x: order_key[x["rhyme_family"]])
    if c["rhyme_family"] != last["rhyme_family"] or c["lesson_id"] != fam_lesson[last["rhyme_family"]]: E(i, f"đặt sai bài: phải ở {last['rhyme_family']}")
    fl = []
    for x in linked:
        if x["rhyme_family"] not in fl: fl.append(x["rhyme_family"])
    if c["related_families"] != fl: E(i, "related_families sai")
    if i not in fam[c["rhyme_family"]].get("compound_ids", []): E(i, "không có trong compound_ids của họ vần")
    for k in ("meaning_vi_child", "example_vi", "topic"):
        if not (c.get(k) or "").strip(): E(i, f"{k} trống")
    if N(c["text"]).lower() not in N(c["example_vi"]).lower(): E(i, "câu ví dụ không chứa từ ghép")
    txt = N(c["example_vi"] + " " + c["meaning_vi_child"]).lower()
    for u in UNSAFE:
        if u in txt: E(i, f"nội dung không an toàn: '{u}'")
    a, im = c["audio"], c["image"]
    if a["word_full"] or a["example_sentence"] or a["syllables"]: E(i, "audio phải null/rỗng cho đến khi có bản thu thật")
    if im["path"] or im["status"] != "not_created": E(i, "image phải null/not_created cho đến khi có ảnh thật")
    for k, v in c["review"].items():
        if v not in REV_OK: E(i, f"review.{k}='{v}' không được phép khi chưa có bằng chứng")
    for t in c["case_tags"]:
        if t not in cat_ids: E(i, f"case_tag '{t}' không có trong case_catalog")
for k, n in cids.items():
    if n > 1: E(k, "ID từ ghép trùng")
for k, n in ctext.items():
    if n > 1: E(k, "từ ghép trùng")
for r, f in fam.items():
    if len(f["word_ids"]) < 2: warns.append(f"họ vần {r} chỉ có {len(f['word_ids'])} từ đơn")
for l in D.get("lessons", []):
    for u in l["units"]:
        if not u["compound_ids"]: warns.append(f"vần {u['rhyme_family']} chưa có từ ghép nào")
S = D["stats"]; real = {"items": len(D["items"]), "families": len(D["rhyme_families"]), "lessons": len(lessons), "compounds": len(comps),
    "compounds_fully_decodable": sum(1 for c in comps if c["fully_decodable"]), "vowel_contrast_pairs": len(D.get("vowel_contrast_pairs", []))}
for k, v in real.items():
    if S.get(k) != v: E("stats", f"{k}: ghi {S.get(k)} nhưng thực tế {v}")
for c in D["case_catalog"]:
    src = [it["word"] for it in D["items"] if c["id"] in it["case_tags"]] + [x["text"] for x in comps if c["id"] in x["case_tags"]]
    if sorted(src) != sorted(c["covered_by"]): E(c["id"], "covered_by không khớp case_tags thực tế")

print(f"Đã kiểm tra {len(D['items'])} mục, {len(comps)} từ ghép, {len(lessons)} bài, {len(D['rhyme_families'])} họ vần, {len(D['case_catalog'])} tình huống.")
for m in warns: print("CẢNH BÁO:", m)
if errors:
    print(f"{len(errors)} LỖI:"); [print(" ", e) for e in errors]; sys.exit(1)
print("OK: không có lỗi.")
