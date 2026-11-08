#!/usr/bin/env python3
"""Synthesises the listing video's music bed -> design/video/music.wav (then .m4a).

An app-intro bed: bright, light, forward-moving, and out of the voice's way.
  * 112 BPM, D major, I-V-vi-IV (D A Bm G), one chord per bar, 56 bars (~2:00)
  * warm low-passed pad + soft sub bass, both pumping gently off the kick
  * a glassy pluck arpeggio in 8ths with a dotted-8th echo (the "tech" sparkle)
  * soft four-on-the-floor kick, offbeat hats, a finger snap on 2 and 4
  * arrangement: 4 bars pad+pluck -> beat in -> snaps at bar 9 -> lift at 25 and 41
    (extra octave pluck) -> last 4 bars thin back to pad+pluck
Nothing sits hard in 1-4 kHz: plucks are sine-based with a fast decay, the pad is
filtered at ~1.8 kHz, so the voice-over keeps the speech band to itself.

  python3 design/video/music.py   # needs numpy + scipy, ffmpeg for the .m4a
"""
import subprocess
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
BPM = 112
BEAT = 60 / BPM
BAR = 4 * BEAT
BARS = 56
N = int(BARS * BAR * SR) + SR * 2
rng = np.random.default_rng(7)

def midi(n): return 440.0 * 2 ** ((n - 69) / 12)

# D  A  Bm  G — roots (MIDI) and triad tones for the pluck/pad
CHORDS = [
    (50, [62, 66, 69, 74]),  # D
    (45, [61, 64, 69, 73]),  # A
    (47, [62, 66, 71, 74]),  # Bm
    (43, [62, 67, 71, 74]),  # G
]

L = np.zeros(N); R = np.zeros(N)

def add(sig, start, gl=1.0, gr=None):
    i = int(start * SR)
    if i >= N: return
    sig = sig[: N - i]
    L[i:i + len(sig)] += sig * gl
    R[i:i + len(sig)] += sig * (gl if gr is None else gr)

def lp(x, f, order=2): return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)

def env_adsr(n, a, d, s, r, hold):
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), np.where(t < a + d, 1 - (1 - s) * (t - a) / d, s))
    rel = t > hold
    e[rel] = s * np.exp(-(t[rel] - hold) / r)
    return e

# --- kick-driven pump (sidechain feel) -------------------------------------
pump = np.ones(N)
def kick_times():
    for b in range(4, BARS - 4):
        for k in range(4): yield b * BAR + k * BEAT

for t0 in kick_times():
    i = int(t0 * SR); n = int(BEAT * SR)
    tt = np.arange(n) / SR
    pump[i:i + n] = np.minimum(pump[i:i + n], 1 - 0.55 * np.exp(-tt / 0.09))

# --- pad -------------------------------------------------------------------
for b in range(BARS):
    root, tones = CHORDS[b % 4]
    n = int((BAR + 0.6) * SR)
    t = np.arange(n) / SR
    sigL = np.zeros(n); sigR = np.zeros(n)
    for m in tones[:3]:
        f = midi(m - 12)
        for det, side in ((-0.12, 'L'), (0.12, 'R'), (0.0, 'C')):
            ff = f * 2 ** (det / 12 / 4)
            ph = rng.uniform(0, 2 * np.pi)
            w = 2 * ((ff * t + ph / (2 * np.pi)) % 1) - 1  # saw
            if side == 'L': sigL += w
            elif side == 'R': sigR += w
            else: sigL += 0.5 * w; sigR += 0.5 * w
    e = env_adsr(n, 0.35, 0.4, 0.85, 0.5, BAR)
    sigL = lp(sigL * e, 1800, 4) * 0.065
    sigR = lp(sigR * e, 1800, 4) * 0.065
    i = int(b * BAR * SR)
    seg = slice(i, min(N, i + n))
    L[seg] += sigL[: seg.stop - i] * pump[seg]
    R[seg] += sigR[: seg.stop - i] * pump[seg]

# --- bass ------------------------------------------------------------------
for b in range(4, BARS - 2):
    root, _ = CHORDS[b % 4]
    for pos, ln in ((0, 1.4), (2.5, 0.45), (3, 0.9)):
        n = int(ln * BEAT * SR)
        t = np.arange(n) / SR
        f = midi(root - 12)
        w = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
        e = env_adsr(n, 0.008, 0.15, 0.7, 0.06, ln * BEAT * 0.85)
        start = b * BAR + pos * BEAT
        i = int(start * SR)
        sig = lp(w * e, 400) * 0.22
        sig = sig[: N - i] * pump[i:i + len(sig[: N - i])]
        add(sig, start)

# --- pluck arpeggio + dotted-8th echo --------------------------------------
def pluck(f, n):
    t = np.arange(n) / SR
    w = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.05)
         + 0.12 * np.sin(6 * np.pi * f * t) * np.exp(-t / 0.03))
    return w * np.exp(-t / 0.22) * np.minimum(1, t / 0.003)

pattern = [0, 1, 2, 3, 2, 1, 2, 3]  # 8ths over the chord tones
echo = 0.75 * BEAT
for b in range(BARS):
    _, tones = CHORDS[b % 4]
    lift = (24 <= b < 32) or (40 <= b < 48)
    for k, idx in enumerate(pattern):
        start = b * BAR + k * BEAT / 2
        vel = 0.9 if k % 2 == 0 else 0.7
        sig = pluck(midi(tones[idx]), int(0.6 * SR)) * 0.12 * vel
        pan = 0.6 + 0.4 * ((k % 4) / 3)
        add(sig, start, pan, 1.6 - pan)
        add(lp(sig, 3500) * 0.35, start + echo, 1.6 - pan, pan)  # echo, ping-ponged
        if lift and k % 2 == 0:
            add(pluck(midi(tones[idx] + 12), int(0.4 * SR)) * 0.032 * vel, start, 0.8, 1.2)

# --- drums -----------------------------------------------------------------
def kick():
    n = int(0.35 * SR); t = np.arange(n) / SR
    f = 48 + 90 * np.exp(-t / 0.03)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / 0.11) * 0.26

def hat(open_=False):
    n = int((0.12 if open_ else 0.05) * SR); t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 8000, 4) * np.exp(-t / (0.04 if open_ else 0.012)) * 0.045

def snap():
    n = int(0.18 * SR); t = np.arange(n) / SR
    body = sosfilt(butter(2, [1500, 3200], 'band', fs=SR, output='sos'), rng.standard_normal(n))
    return body * np.exp(-t / 0.035) * 0.11

K = kick()
for t0 in kick_times(): add(K, t0)
for b in range(4, BARS - 4):
    for k in range(4):
        add(hat(k == 3 and b % 2 == 1), b * BAR + k * BEAT + BEAT / 2, 0.8, 1.2)
        if b >= 8 and k in (1, 3):
            add(snap(), b * BAR + k * BEAT, 1.1, 0.9)

# --- master ----------------------------------------------------------------
mix = np.stack([L, R], axis=1)
mix = hp(mix.T, 35).T
peak = np.max(np.abs(mix))
mix = np.tanh(mix / peak * 1.1) / np.tanh(1.1) * 0.89
mix = mix[: int(BARS * BAR * SR)]
fade = int(0.02 * SR)
mix[:fade] *= np.linspace(0, 1, fade)[:, None]

here = Path(__file__).resolve().parent
wav = here / 'music.wav'
wavfile.write(wav, SR, (mix * 32767).astype(np.int16))
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(wav), '-c:a', 'aac', '-b:a', '192k', str(here / 'music.m4a')], check=True)
wav.unlink()
print('wrote', here / 'music.m4a', f'{len(mix) / SR:.1f}s')
