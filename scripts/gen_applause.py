import urllib.request
import urllib.parse
import subprocess
import os

# Tải và xử lý file âm thanh tiếng vỗ tay ăn mừng chân thực (có reo hò Yeyyy & tiếng vỗ tay người thật)
def prepare_real_applause(output_path='06-assets/audio/common/applause.mp3'):
    temp_raw = 'temp_raw_celebrate.mp3'
    # URL file âm thanh chất lượng cao CC0 / Attribution từ kho SoundMonster
    encoded_filename = urllib.parse.quote('celebrate group applause clapping yey 2.mp3')
    url = f'https://raw.githubusercontent.com/jonjonsson/SoundMonster/master/Attribution%20license/{encoded_filename}'
    
    print(f"Downloading real applause from {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp, open(temp_raw, 'wb') as f:
        f.write(resp.read())
        
    print("Normalizing and adding smooth fade-out with ffmpeg...")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    subprocess.run([
        'ffmpeg', '-y',
        '-i', temp_raw,
        '-af', 'afade=t=out:st=2.7:d=0.5',
        '-t', '3.2',
        output_path
    ], check=True)
    
    if os.path.exists(temp_raw):
        os.remove(temp_raw)
    print(f"Successfully generated {output_path}")

if __name__ == '__main__':
    prepare_real_applause()
