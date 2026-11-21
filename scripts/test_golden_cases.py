from vietnamese_phonics_engine import spell_word, spell_syllable

GOLDEN_CASES = [
    (1, "hoa", "hờ - o - a - oa - hờ - oa - hoa"),
    (2, "cây", "cờ - â - y - ây - cờ - ây - cây"),
    (3, "tê tê", "tiếng 1: tờ - ê - tê / tiếng 2: tờ - ê - tê / đọc: tê tê"),
    (4, "tu hú", "tiếng 1: tờ - u - tu / tiếng 2: hờ - u - hu - sắc - hú / đọc: tu hú"),
    (5, "na", "nờ - a - na"),
    (6, "đa", "đờ - a - đa"),
    (7, "quả", "quờ - a - qua - hỏi - quả"),
    (8, "xoài", "xờ - o - a - oa - i - oai - xờ - oai - xoai - huyền - xoài"),
    (9, "chuối", "chờ - u - ô - uô - i - uôi - chờ - uôi - chuôi - sắc - chuối"),
    (10, "trăng", "trờ - ă - ngờ - ăng - trờ - ăng - trăng"),
    (11, "kiến", "cờ - i - ê - iê - nờ - iên - cờ - iên - kiên - sắc - kiến"),
    (12, "ghế", "gờ - ê - ghê - sắc - ghế"),
    (13, "nghe", "ngờ - e - nghe"),
    (14, "mẹ", "mờ - e - me - nặng - mẹ"),
    (15, "quạt", "a - tờ - at - quờ - at - quat - nặng - quạt"),
    (16, "uống", "u - ô - uô - ngờ - uông - sắc - uống"),
    (17, "giỏ", "giờ - o - gio - hỏi - giỏ"),
    (18, "khỉ", "khờ - i - khi - hỏi - khỉ")
]

def run_tests():
    passed = 0
    failed = 0
    print("=== CHẠY KIỂM TRA 18 GOLDEN CASES THEO ĐÚNG ĐẶC TẢ ===")
    for case_no, word, expected in GOLDEN_CASES:
        actual = spell_word(word)
        # Chuẩn hóa khoảng trắng
        actual_norm = " ".join(actual.split())
        expected_norm = " ".join(expected.split())
        if actual_norm == expected_norm:
            print(f"[PASS] #{case_no} '{word}': {actual_norm}")
            passed += 1
        else:
            print(f"[FAIL] #{case_no} '{word}':")
            print(f"       Mong muốn: '{expected_norm}'")
            print(f"       Thực tế:   '{actual_norm}'")
            failed += 1

    print("\n" + "="*50)
    print(f"KẾT QUẢ: {passed}/18 cases đạt ({passed/18*100:.1f}%)")
    if failed == 0:
        print("TẤT CẢ 18/18 GOLDEN CASES ĐÃ VƯỢT QUA 100%!")
    return failed == 0

if __name__ == '__main__':
    run_tests()
