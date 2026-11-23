import numpy as np
import subprocess
import wave
import os

def generate_applause(filename='06-assets/audio/common/applause.mp3', duration=2.2, sample_rate=44100):
    total_samples = int(duration * sample_rate)
    output = np.zeros(total_samples)
    
    # 1. Generate individual handclaps (around 120-150 claps over 2.2 seconds)
    # Intensity envelope: builds up quickly in 0.2s, stays energetic, fades out smoothly in last 0.5s
    times = np.linspace(0, duration, total_samples)
    envelope = np.ones(total_samples)
    attack_samples = int(0.2 * sample_rate)
    fade_samples = int(0.6 * sample_rate)
    envelope[:attack_samples] = np.linspace(0.2, 1.0, attack_samples)
    envelope[-fade_samples:] = np.linspace(1.0, 0.0, fade_samples)
    
    # Number of clappers
    num_claps = int(duration * 75)
    clap_times = np.sort(np.random.uniform(0.05, duration - 0.2, num_claps))
    
    for t_clap in clap_times:
        clap_len = int(np.random.uniform(0.025, 0.055) * sample_rate)
        if int(t_clap * sample_rate) + clap_len >= total_samples:
            continue
        
        # Single clap: 3 rapid bursts (palm & fingers contact)
        single_clap = np.zeros(clap_len)
        for sub_offset in [0, int(0.003 * sample_rate), int(0.007 * sample_rate)]:
            if sub_offset < clap_len:
                sub_len = clap_len - sub_offset
                noise = np.random.normal(0, 1, sub_len)
                decay = np.exp(-np.linspace(0, 12, sub_len))
                single_clap[sub_offset:] += noise * decay * np.random.uniform(0.6, 1.0)
        
        # Resonant bandpass filtering around 1200 - 2400 Hz
        # Simple IIR or FIR: moving average / difference approximation
        idx = int(t_clap * sample_rate)
        amp = np.random.uniform(0.3, 0.9) * envelope[idx]
        output[idx:idx + clap_len] += single_clap * amp
    
    # 2. Add subtle energetic crowd cheer / celebration pitch (harmonic warmth)
    t = np.arange(total_samples) / sample_rate
    cheer_noise = np.random.normal(0, 0.15, total_samples) * envelope
    # smooth cheer noise
    kernel_size = 20
    kernel = np.ones(kernel_size) / kernel_size
    cheer_smooth = np.convolve(cheer_noise, kernel, mode='same')
    
    output += cheer_smooth * 0.4
    
    # Normalize to -1 dB
    max_val = np.max(np.abs(output))
    if max_val > 0:
        output = (output / max_val) * 0.85
    
    # Convert to 16-bit PCM WAV
    wav_filename = '06-assets/audio/common/temp_applause.wav'
    pcm16 = (output * 32767).astype(np.int16)
    
    with wave.open(wav_filename, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(pcm16.tobytes())
    
    # Convert to MP3 with ffmpeg, adding subtle highpass/lowpass for natural warmth
    cmd = [
        'ffmpeg', '-y', '-i', wav_filename,
        '-af', 'highpass=f=400,lowpass=f=5500,volume=1.2',
        '-b:a', '128k',
        filename
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    if os.path.exists(wav_filename):
        os.remove(wav_filename)
        
    print(f"Generated {filename} successfully ({os.path.getsize(filename)} bytes)")

if __name__ == '__main__':
    generate_applause()
