import os
import subprocess
import time
from concurrent.futures import ThreadPoolExecutor

STEPS_DIR = '06-assets/audio/spelling/steps'

def trim_file(fname):
    src = os.path.join(STEPS_DIR, fname)
    if not fname.endswith('.mp3') or not os.path.isfile(src):
        return None
    tmp = os.path.join(STEPS_DIR, f"tmp_{fname}")
    
    # Trim silence: start threshold -38dB, stop threshold -38dB, min duration 0.06s
    cmd = [
        'ffmpeg', '-y', '-i', src,
        '-af', 'silenceremove=start_periods=1:start_duration=0.01:start_threshold=-38dB:stop_periods=1:stop_duration=0.06:stop_threshold=-38dB',
        tmp
    ]
    res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if res.returncode == 0 and os.path.exists(tmp) and os.path.getsize(tmp) >= 500:
        os.replace(tmp, src)
        return True
    else:
        if os.path.exists(tmp):
            os.remove(tmp)
        return False

def main():
    t0 = time.time()
    files = [f for f in os.listdir(STEPS_DIR) if f.endswith('.mp3')]
    print(f"Bắt đầu cắt khoảng lặng cho {len(files)} file âm thanh đánh vần...")
    
    with ThreadPoolExecutor(max_workers=8) as ex:
        results = list(ex.map(trim_file, files))
        
    success = sum(1 for r in results if r is True)
    failed = sum(1 for r in results if r is False)
    print(f"Hoàn thành trong {time.time()-t0:.2f}s: Thành công {success}/{len(files)} file (Lỗi {failed}).")

if __name__ == '__main__':
    main()
