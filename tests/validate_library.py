import json
import os
import sys

def validate_library():
    json_path = os.path.join(os.path.dirname(__file__), '..', '01-vocabulary', 'vocabulary_vi_v2.json')
    if not os.path.exists(json_path):
        print(f"Error: {json_path} does not exist.")
        return False

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    items = data.get('items', [])
    print(f"=== Thống kê tổng quan ===")
    print(f"Tổng số mục: {len(items)}")

    # 1. Check ID uniqueness
    ids = {}
    words = {}
    for idx, item in enumerate(items):
        iid = item.get('id')
        w = item.get('word')
        ids.setdefault(iid, []).append(idx)
        words.setdefault(w, []).append(iid)

    duplicate_ids = {k: v for k, v in ids.items() if len(v) > 1}
    duplicate_words = {k: v for k, v in words.items() if len(v) > 1}

    print(f"Trùng lặp ID: {len(duplicate_ids)}")
    print(f"Từ bị trùng lặp: {len(duplicate_words)}")
    if duplicate_words:
        for w, id_list in list(duplicate_words.items())[:10]:
            print(f"  - Từ '{w}': xuất hiện ở các ID {id_list}")

    # 2. Check structure & schema
    missing_fields = []
    phonics_status_counts = {}
    empty_meanings = []
    empty_examples = []
    starter_batch_issues = []

    for item in items:
        iid = item.get('id')
        w = item.get('word')
        status = item.get('content_status')

        # Check essential keys
        for key in ['id', 'word', 'phonics', 'audio', 'image', 'review']:
            if key not in item:
                missing_fields.append((iid, key))

        phonics = item.get('phonics', {})
        p_status = phonics.get('status')
        phonics_status_counts[p_status] = phonics_status_counts.get(p_status, 0) + 1

        # Check starter batch
        if status == 'authored_starter':
            if not item.get('meaning_vi_child'):
                empty_meanings.append(iid)
            if not item.get('example_vi'):
                empty_examples.append(iid)
            # Check phonics status consistency
            if iid in ['vi_0029', 'vi_0031', 'vi_0032']:
                if p_status is None:
                    starter_batch_issues.append(f"{iid} ({w}): phonics.status là null/None (dù bên trong có onset.status)")

    print(f"\n=== Phân loại trạng thái nội dung (content_status) ===")
    content_statuses = {}
    for item in items:
        st = item.get('content_status')
        content_statuses[st] = content_statuses.get(st, 0) + 1
    for k, v in content_statuses.items():
        print(f"  - {k}: {v} mục")

    print(f"\n=== Phân loại trạng thái đánh vần (phonics.status) ===")
    for k, v in phonics_status_counts.items():
        print(f"  - {k}: {v} mục")

    print(f"\n=== Vấn đề cần khắc phục / thẩm định ===")
    print(f"Mục thiếu trường bắt buộc: {len(missing_fields)}")
    print(f"Mục authored_starter rỗng nghĩa: {len(empty_meanings)}")
    print(f"Mục authored_starter rỗng ví dụ: {len(empty_examples)}")
    print(f"Vấn đề cụ thể ở nhóm khởi đầu (32 mục): {starter_batch_issues}")

    # Review status summary
    review_status_summary = {}
    for item in items:
        rev = item.get('review', {})
        rev_tuple = tuple(sorted(rev.items()))
        review_status_summary[rev_tuple] = review_status_summary.get(rev_tuple, 0) + 1
    print(f"\n=== Tình trạng kiểm duyệt (review) ===")
    for r, count in review_status_summary.items():
        print(f"  - {dict(r)}: {count} mục")

if __name__ == '__main__':
    validate_library()
