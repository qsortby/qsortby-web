# Listing video — `design/video/`

The App Store feature video and the site's intro, rebuilt 2026-11 for the new brand
("Sort by sales. Upsell by AI.", lowercase wordmark). Same story and look as the old
cut — the AURORA demo store, one shopper through six touchpoints, AOV $165 → $421,
the stepper, phone mockups, the dark rules scenes, word-by-word subtitles — with four
new beats: nightly learning from orders (07), Intent AI (12), the testing gate (15)
and the on/off test (16). Nineteen HTML scenes, one voice.

```
script.json      scenes: voice-over line + minimum length; the voice and its settings
scenes/*.html    one page per scene, 1920×1080, CSS animation; base.js draws the subtitle
                 word by word from the voice-over's own timestamps (newest word green)
scenes/data.js   the AURORA catalogue and the storefront/tile helpers
assets/          logo, app icon, product art, fonts (copies of public/)
audio/<id>.mp3   voice-over per scene + <id>.json word timings — produced by tts.mjs, not committed
out/             renders — not committed
```

## Voice

ElevenLabs voice **`SSfU0eLfP3qeuR4j2bwD`** ("Advertisement, variation B" — the one the
QPushly listing v2 uses), model `eleven_multilingual_v2`. Settings live in `script.json`.

```bash
ELEVENLABS_API_KEY=… node design/video/tts.mjs            # every scene whose take is missing or stale
ELEVENLABS_API_KEY=… node design/video/tts.mjs 12-intent  # redo one
ELEVENLABS_API_KEY=… node design/video/tts.mjs --all      # redo everything
```

A take is kept only when `audio/<id>.json` holds the exact line now in `script.json`;
edit a `vo`, run tts, re-render. Keep every line something the app does today: scene 15
MUST keep "stay in testing" — the learned picks and the trained model do not rank a
storefront.

## Render

```bash
node design/video/render.mjs            # all scenes → out/qsortby-listing.mp4 + poster.jpg
node design/video/render.mjs 05-intent  # one scene, to check a change
```

Needs `playwright` resolvable (`npm i -D playwright` once, with its Chromium) and
`ffmpeg`/`ffprobe` on PATH. Each scene runs for its voice-over's length plus
`pad_seconds`; with no `audio/<id>.mp3` it runs for `minDur` (a silent preview).
`speed` in script.json (global, or per scene) is the cut's tempo: every CSS animation and
every scene timer (`after()`, not `setTimeout`) runs at that rate, and a scene's floor is
`minDur / speed`. 1.35 is the current cut; the opening and closing run at 1.6. Scene
animations are authored at 1× and timed for `minDur` — if a voice-over comes out much longer
or shorter than `minDur`, adjust the scene's animation delays, not the pad. Nothing in a
scene moves until `window.__start()` (render.mjs calls it once the recording rolls and
fonts are in), so the clock, the subtitle and the audio share one zero.

## Music

`music.m4a` is synthesised by `music.py` (numpy + scipy): a light app-intro bed —
112 BPM, D major, pluck arpeggio with an echo, warm pad, soft four-on-the-floor,
snaps from bar 9, lifts at bars 25 and 41. Re-run `python3 design/video/music.py`
to regenerate it. A licensed `music.mp3` / `music.wav` beside it takes priority.

The mix: voice normalised to -16 LUFS first (the TTS takes come in near -30), music
at `MUSIC_DB = -8` (~-20 LUFS in the gaps, ~-23 LUFS — 7 dB under — while the voice plays, light 2:1 duck), a -4 dB dip
across the speech band, 2 s fade out. Retune
`MUSIC_DB` in `render.mjs` and run `node design/video/render.mjs --mix` — it
re-stitches `out/work/*.mp4` without re-recording the scenes.

## After rendering

1. Upload `out/qsortby-listing.mp4` to YouTube, put the new ID in `src/consts.ts`
   (`INTRO_VIDEO_ID`) and re-download the poster (see `public/video/README.md`).
2. Upload the same mp4 as the App Store feature media (Partner Dashboard).
3. Rules carried from the old cut: nothing on screen the app does not have, no lift
   number, no price, no "the best".
