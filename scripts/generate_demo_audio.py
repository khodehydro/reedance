"""Generate the original, instrumental UI-demo track (no third-party recording).

Run with: python scripts/generate_demo_audio.py
The 64-second WAV is intentionally small and is used only to demonstrate download,
offline storage, seeking, and playback in the interface prototype.
"""

import math
import random
import wave
from array import array
from pathlib import Path

SAMPLE_RATE = 16_000
BPM = 90
BEAT = 60 / BPM
BAR = BEAT * 4
DURATION = 64
OUT = Path(__file__).resolve().parents[1] / "public/audio/midnight-avenue-demo.wav"
OUT.parent.mkdir(parents=True, exist_ok=True)

NOTES = {
    "C3": 130.81, "E3": 164.81, "F3": 174.61, "G3": 196.00, "A3": 220.00,
    "B3": 246.94, "C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23,
    "G4": 392.00, "A4": 440.00, "B4": 493.88, "C5": 523.25, "D5": 587.33,
    "E5": 659.25,
}
CHORDS = [
    ("A3", "C4", "E4"),
    ("F3", "A3", "C4"),
    ("C3", "E3", "G3"),
    ("G3", "B3", "D4"),
]
MELODIES = [
    ("E4", "A4", "C5", "A4"),
    ("C5", "A4", "G4", "E4"),
    ("G4", "C5", "E5", "C5"),
    ("B4", "G4", "D5", "B4"),
]
rand = random.Random(315)
frames = array("h")
two_pi = 2 * math.pi

for i in range(SAMPLE_RATE * DURATION):
    t = i / SAMPLE_RATE
    bar_index = int(t / BAR)
    beat_index = int(t / BEAT)
    chord = CHORDS[bar_index % len(CHORDS)]
    beat_phase = (t % BEAT) / BEAT
    half_beat_phase = (t % (BEAT / 2)) / (BEAT / 2)
    bar_phase = (t % BAR) / BAR

    # A quiet, slowly breathing harmonic bed.
    breath = 0.78 + 0.22 * math.sin(two_pi * t / 7.5)
    pad = sum(
        math.sin(two_pi * NOTES[note] * t + 0.06 * math.sin(t * 2.1))
        + 0.18 * math.sin(two_pi * NOTES[note] * 2 * t)
        for note in chord
    ) * 0.066 * breath

    # Short plucked notes, alternating through each chord twice per bar.
    arp_note = chord[int(bar_phase * 8) % 3]
    arp = (
        math.sin(two_pi * NOTES[arp_note] * 2 * t)
        + 0.22 * math.sin(two_pi * NOTES[arp_note] * 4 * t)
    ) * 0.105 * math.exp(-half_beat_phase * 6)

    # Simple original four-note motif, introduced after the first two bars.
    melody_note = MELODIES[bar_index % 4][beat_index % 4]
    lead_envelope = min(1, beat_phase * 18) * math.exp(-beat_phase * 2.5)
    lead = 0 if bar_index < 2 else (
        math.sin(two_pi * NOTES[melody_note] * t)
        + 0.12 * math.sin(two_pi * NOTES[melody_note] * 2 * t)
    ) * 0.105 * lead_envelope

    bass_freq = NOTES[chord[0]] / 2
    bass = math.sin(two_pi * bass_freq * t) * 0.12 * math.exp(-beat_phase * 4)

    # Soft kick, snare and hi-hat keep the demo recognisably musical.
    kick = 0.0
    if beat_index % 4 in (0, 2) and beat_phase < 0.32:
        phase = beat_phase * BEAT
        kick = math.sin(two_pi * (75 - 28 * beat_phase) * phase) * 0.19 * math.exp(-beat_phase * 15)
    snare = 0.0
    if beat_index % 4 in (1, 3) and beat_phase < 0.19:
        snare = rand.uniform(-1, 1) * 0.075 * math.exp(-beat_phase * 27)
    hat = rand.uniform(-1, 1) * 0.035 * math.exp(-half_beat_phase * 22)

    fade = min(1, t / 2.0, (DURATION - t) / 3.0)
    sample = (pad + arp + lead + bass + kick + snare + hat) * max(0, fade)
    frames.append(int(max(-1, min(1, sample)) * 25_000))

with wave.open(str(OUT), "wb") as output:
    output.setnchannels(1)
    output.setsampwidth(2)
    output.setframerate(SAMPLE_RATE)
    output.writeframes(frames.tobytes())

print(f"Generated {OUT} ({OUT.stat().st_size / 1024 / 1024:.2f} MiB, {DURATION}s)")
