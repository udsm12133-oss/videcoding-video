"""Synthesised 60s score, locked to src/timeline.json (120 BPM, cuts on the beat).
Layers: sub drone, blizzard wind, heartbeat kick, impacts, risers, data ticks,
warm pad for the heat sections, and a hard silence before the final hit.
Writes public/soundtrack.wav (44.1 kHz stereo)."""
import json, os
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, 'src', 'timeline.json')))
SR = 44100
FPS = TL['fps']
N = int(TL['duration'] / FPS * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)
fr = lambda f: int(f / FPS * SR)

def lp(x, hz, order=2):
    return sosfilt(butter(order, hz, 'low', fs=SR, output='sos'), x)
def hp(x, hz, order=2):
    return sosfilt(butter(order, hz, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)
def env_at(frames, values):
    return np.interp(t, np.array(frames) / FPS, values)

L = np.zeros(N); R = np.zeros(N)
def add(sig, start=0, gain=1.0, pan=0.0):
    s = fr(start) if start else 0
    e = min(N, s + len(sig))
    if e <= s: return
    L[s:e] += sig[:e - s] * gain * (1 - pan) ** 0.5 * 1.0
    R[s:e] += sig[:e - s] * gain * (1 + pan) ** 0.5 * 1.0

# ---- sub drone (A1 + fifth, slow beating) ----
drone = (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 55.4 * t) + 0.35 * np.sin(2 * np.pi * 82.4 * t)
         + 0.25 * np.sign(np.sin(2 * np.pi * 27.5 * t)) * 0.3)
drone = lp(drone, 180)
dr_env = env_at([0, 60, 210, 360, 510, 990, 1350, 1590, 1740, 1755, 1800], [0.9, 0.6, 0.8, 0.9, 0.55, 0.65, 0.7, 0.9, 0.9, 0.0, 0.0])
add(drone * dr_env, gain=0.22)

# ---- wind (filtered noise with gusts), stereo-decorrelated ----
for pan, seed in ((-0.6, 1), (0.6, 2)):
    nz = np.random.default_rng(seed).standard_normal(N)
    gust = 0.6 + 0.4 * np.sin(2 * np.pi * 0.13 * t + seed) * np.sin(2 * np.pi * 0.31 * t)
    w = bp(nz, 250, 1400) * gust
    w_env = env_at([0, 60, 210, 360, 510, 990, 1350, 1590, 1740, 1755, 1770, 1800], [0.8, 0.5, 0.9, 1.0, 0.35, 0.6, 0.35, 0.6, 0.6, 0.0, 1.0, 0.7])
    add(w * w_env, gain=0.06, pan=pan)

# ---- heartbeat kick on the beat (120 BPM = every 15 frames) ----
def kick(dur=0.35, f0=120, f1=42):
    tt = np.arange(int(dur * SR)) / SR
    freq = f1 + (f0 - f1) * np.exp(-tt * 28)
    ph = 2 * np.pi * np.cumsum(freq) / SR
    return np.sin(ph) * np.exp(-tt * 9)
K = kick()
kick_zones = [(210, 1740, 1.0)]
for f in range(0, TL['duration'], 15):
    if any(a <= f < b for a, b, _ in kick_zones) and not any(a <= f < b for a, b in TL['silence']):
        g = 0.5 if (f // 15) % 2 == 0 else 0.28
        if 360 <= f < 510: g *= 0.6
        add(K, f, gain=g)

# ---- impacts: sub boom + noise crack + metallic ring ----
def impact(k):
    dur = 2.4
    tt = np.arange(int(dur * SR)) / SR
    freq = 30 + 90 * np.exp(-tt * 10)
    boom = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt * 1.6)
    crack = hp(rng.standard_normal(len(tt)), 1500) * np.exp(-tt * 18)
    ring = (np.sin(2 * np.pi * 1310 * tt) + np.sin(2 * np.pi * 1979 * tt)) * np.exp(-tt * 4) * 0.08
    body = lp(rng.standard_normal(len(tt)), 400) * np.exp(-tt * 5) * 0.8
    return (boom * 1.0 + crack * 0.35 + ring + body) * k
for im in TL['impacts']:
    add(impact(im['k']), im['f'], gain=0.5)

# ---- risers (noise sweep + pitch rise) ending on the cut ----
for a, b in TL['risers']:
    n = fr(b) - fr(a)
    tt = np.arange(n) / SR
    p = tt / tt[-1]
    nz = rng.standard_normal(n)
    sweep = bp(nz, 400, 6000) * p ** 2
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * p ** 2) / SR) * p ** 3 * 0.25
    add(sweep * 0.5 + tone, a, gain=0.35)

# ---- data ticks (counters) ----
tick_len = int(0.025 * SR)
tt = np.arange(tick_len) / SR
TICK = np.sin(2 * np.pi * 3200 * tt) * np.exp(-tt * 260)
for a, b in TL['ticks']:
    f = a
    i = 0
    while f < b:
        add(TICK, f, gain=0.18, pan=0.3 if i % 2 else -0.3)
        f += 2 if (f - a) < (b - a) * 0.7 else 3
        i += 1

# ---- warm pad (heat): D minor add9 -> resolves; only in heat sections ----
def pad(freqs, n):
    tt = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * tt + i) + 0.5 * np.sin(2 * np.pi * f * 1.003 * tt) for i, f in enumerate(freqs))
    return lp(s, 1800)
for a, b in TL['warm']:
    n = fr(b) - fr(a)
    chord = [146.8, 220.0, 293.7, 329.6, 440.0] if a < 1500 else [130.8, 196.0, 261.6, 329.6, 392.0]
    s = pad(chord, n)
    p = np.arange(n) / n
    e = np.minimum(1, p * 6) * np.minimum(1, (1 - p) * 12)
    add(s * e, a, gain=0.035)

# ---- final tail: high icy shimmer after the fire dies ----
n = fr(1800) - fr(1755)
tt = np.arange(n) / SR
shim = sum(np.sin(2 * np.pi * f * tt) for f in (1760, 2637, 3520)) * np.exp(-tt * 0.8)
add(shim, 1755, gain=0.03)

# ---- hard silence before last hit ----
for a, b in TL['silence']:
    s, e = fr(a), fr(b)
    ramp = np.linspace(1, 0, min(1200, e - s))
    L[s:s + len(ramp)] *= ramp; R[s:s + len(ramp)] *= ramp
    L[s + len(ramp):e] = 0; R[s + len(ramp):e] = 0

# master: gentle saturation + fade
mix = np.stack([L, R], 1)
mix = np.tanh(mix * 1.6) / np.tanh(1.6)
fade = np.ones(N); fl = int(0.6 * SR); fade[-fl:] = np.linspace(1, 0, fl)
mix *= fade[:, None]
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.89
os.makedirs(os.path.join(ROOT, 'public'), exist_ok=True)
wavfile.write(os.path.join(ROOT, 'public', 'soundtrack.wav'), SR, (mix * 32767).astype(np.int16))
print('wrote public/soundtrack.wav', N / SR, 's')
