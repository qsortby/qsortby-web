// Renders the listing video. Each scene is an HTML page recorded with Playwright
// for the length of its voice-over + pad_seconds (or script.minDur when there is
// no audio yet — a silent preview), then ffmpeg concatenates the scenes with the
// voice-over underneath → out/qsortby-listing.mp4 (1920×1080 H.264/AAC) + poster.
//   node design/video/render.mjs            # everything
//   node design/video/render.mjs 12-intent  # one scene, to check a change
//   node design/video/render.mjs --mix      # re-stitch out/work/*.mp4 only (new music or mix levels)
// Needs `playwright` (with Chromium) resolvable and ffmpeg/ffprobe on PATH.
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const script = JSON.parse(readFileSync(join(here, 'script.json'), 'utf8'));
const work = join(here, 'out', 'work');
mkdirSync(work, { recursive: true });
const probe = (f) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const mixOnly = process.argv.includes('--mix');
const only = mixOnly ? undefined : process.argv[2];

function markerLead(vpath) {
  const out = spawnSync('ffmpeg', ['-i', vpath, '-vf', 'crop=8:8:4:4,scale=1:1,format=gbrp,showinfo', '-f', 'null', '-'],
    { encoding: 'utf8', maxBuffer: 1 << 26 }).stderr;
  const re = /pts_time:\s*([\d.]+).*?mean:\[(\d+) (\d+) (\d+)\]/g;
  let m;
  while ((m = re.exec(out))) { const g = +m[2], r = +m[4]; if (!(r > 180 && g < 80)) return parseFloat(m[1]); } // gbrp: mean:[G B R]
  return 0;
}

// Word timings: from tts.mjs when present, else spread evenly over the audio.
function wordsFor(s, dur) {
  const meta = join(here, 'audio', `${s.id}.json`);
  if (existsSync(meta)) { const m = JSON.parse(readFileSync(meta, 'utf8')); if (m.text === s.vo) return sayAs(m.words); }
  const ws = s.vo.split(/\s+/); const step = (dur - 0.8) / ws.length;
  return sayAs(ws.map((w, i) => ({ w, t: 0.3 + i * step })));
}

// script.say_as: [[spoken, shown]]. The voice reads the brand as "Cue sort by"
// (spelled out so ElevenLabs says it right); the subtitle must show "QSortby".
// Consecutive words matching `spoken` collapse into one word timed at the first,
// trailing punctuation kept ("by." -> "QSortby.").
function sayAs(words) {
  for (const [spoken, shown] of script.say_as ?? []) {
    const parts = spoken.toLowerCase().split(/\s+/);
    const bare = (w) => w.toLowerCase().replace(/[.,!?;:]+$/, '');
    for (let i = 0; i + parts.length <= words.length; i++) {
      if (!parts.every((p, k) => bare(words[i + k].w) === p)) continue;
      const tail = words[i + parts.length - 1].w.match(/[.,!?;:]+$/)?.[0] ?? '';
      words.splice(i, parts.length, { ...words[i], w: shown + tail });
    }
  }
  return words;
}

const browser = mixOnly ? null : await chromium.launch();
const parts = [];
for (const s of script.scenes) {
  if (only && s.id !== only) continue;
  if (mixOnly) { parts.push(join(work, `${s.id}.mp4`)); continue; }
  const audio = join(here, 'audio', `${s.id}.mp3`), meta = join(here, 'audio', `${s.id}.json`);
  // A take counts only if it was made from this script's line (see tts.mjs).
  const hasAudio = existsSync(audio) && existsSync(meta) && JSON.parse(readFileSync(meta, 'utf8')).text === s.vo;
  if (existsSync(audio) && !hasAudio) console.warn(`${s.id}: audio/${s.id}.mp3 is from an older line — run tts.mjs; rendering silent`);
  const voice = hasAudio ? probe(audio) : s.minDur;
  // The scene lasts at least minDur: the picture holds after a short line, which
  // is how the old cut breathes, and no animation is cut off by a fast take.
  const speed = s.speed ?? script.speed ?? 1;
  const dur = Math.max(voice + script.pad_seconds, s.minDur / speed);
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1,
    recordVideo: { dir: work, size: { width: 1920, height: 1080 } } });
  const page = await ctx.newPage();
  await page.addInitScript((a) => { window.__SUB = a.sub; window.__SPEED = a.speed; }, { sub: { text: s.vo, words: wordsFor(s, voice) }, speed });
  await page.goto('file://' + join(here, 'scenes', `${s.id}.html`));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  await page.evaluate(() => window.__start());
  await page.waitForTimeout(Math.round(dur * 1000));
  const vpath = await page.video().path();
  await ctx.close();
  // The scene clock, the subtitle and the audio all start at __start(); the
  // recording started earlier. The page shows a red 24px square until then,
  // so the first frame without it is the cut point — exact, not a guess.
  const lead = markerLead(vpath);
  const seg = join(work, `${s.id}.mp4`);
  const args = ['-y', '-ss', lead.toFixed(3), '-i', vpath];
  if (hasAudio) args.push('-i', audio); else args.push('-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo');
  args.push('-t', dur.toFixed(3), '-r', '30', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
    '-af', 'apad', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', seg);
  execFileSync('ffmpeg', args, { stdio: 'ignore' });
  parts.push(seg);
  console.log(`${s.id}: ${dur.toFixed(1)}s ${hasAudio ? '(voice)' : '(silent, minDur)'}`);
}
if (browser) await browser.close();

// Stitch with a short cross-dissolve between scenes (the old cut's transitions),
// video via xfade, voice via acrossfade, then one loudness pass to -16 LUFS.
const X = 0.25;
const durs = parts.map(probe);
const out = join(here, 'out', 'qsortby-listing.mp4');
if (parts.length === 1) {
  execFileSync('ffmpeg', ['-y', '-i', parts[0], '-c', 'copy', out], { stdio: 'ignore' });
} else {
  const inputs = parts.flatMap((p) => ['-i', p]);
  let fc = '', v = '[0:v]', a = '[0:a]', off = 0;
  for (let i = 1; i < parts.length; i++) {
    off += durs[i - 1] - X;
    fc += `${v}[${i}:v]xfade=transition=fade:duration=${X}:offset=${off.toFixed(3)}[v${i}];`;
    fc += `${a}[${i}:a]acrossfade=d=${X}:c1=tri:c2=tri[a${i}];`;
    v = `[v${i}]`; a = `[a${i}]`;
  }
  // Voice first: the TTS takes land around -30 LUFS, so they are brought to -16
  // before anything is mixed under them (otherwise any bed drowns them). Measured
  // in a first pass, applied as a plain gain: loudnorm's dynamic mode holds back
  // ~3 s, and sidechaincompress then ended the mix 3 s early — the closing line
  // was lost (2026-11-08). A fixed gain has no lookahead; alimiter keeps peaks.
  // Music bed: design/video/music.m4a (made by music.py, mastered near -12 LUFS;
  // a licensed music.mp3/.wav wins if present). MUSIC_DB -8 puts it ~-20 LUFS in
  // the gaps — present, part of the piece — and a light duck (2:1) brings it to
  // ~-23 LUFS under the voice: 7 dB below the speech, audible the whole way. A
  // -4 dB dip across 1–4 kHz keeps consonants clear; 2 s fade at the end.
  // (Measured 2026-11-08: -15 dB with a 4:1 duck left it at -35 LUFS — inaudible.)
  const voiceLufs = (() => {
    const afc = fc.replace(/\[[^\]]*\]xfade=[^;]*;/g, '') + `${a}ebur128=framelog=quiet[m]`;
    const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...inputs, '-filter_complex', afc, '-map', '[m]', '-f', 'null', '-'], { encoding: 'utf8' });
    const all = [...(r.stderr ?? '').matchAll(/I:\s+(-?[\d.]+) LUFS/g)];
    return all.length ? parseFloat(all.at(-1)[1]) : -30;
  })();
  const voiceGain = -16 - voiceLufs;
  console.log(`voice ${voiceLufs.toFixed(1)} LUFS -> +${voiceGain.toFixed(1)} dB`);
  const MUSIC_DB = -8;
  const total = durs.reduce((x, y) => x + y, 0) - X * (parts.length - 1);
  const music = ['music.mp3', 'music.wav', 'music.m4a'].map((f) => join(here, f)).find(existsSync);
  if (music) {
    inputs.push('-stream_loop', '-1', '-i', music);
    const mi = parts.length;
    fc += `${a}volume=${voiceGain.toFixed(2)}dB,asplit=2[vo][sc];[${mi}:a]atrim=0:${total.toFixed(3)},volume=${MUSIC_DB}dB,equalizer=f=2200:t=q:w=1.4:g=-4,lowpass=f=12000,afade=t=out:st=${(total - 2).toFixed(3)}:d=2[m];` +
          `[m][sc]sidechaincompress=threshold=0.08:ratio=2:attack=40:release=500:makeup=1[md];[vo][md]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.79:level=0[aout]`;
  } else {
    fc += `${a}volume=${voiceGain.toFixed(2)}dB,alimiter=limit=0.79:level=0[aout]`;
  }
  execFileSync('ffmpeg', ['-y', ...inputs, '-filter_complex', fc, '-map', v, '-map', '[aout]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30',
    '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], { stdio: 'ignore' });
}
execFileSync('ffmpeg', ['-y', '-ss', '2.5', '-i', out, '-frames:v', '1', '-q:v', '2', join(here, 'out', 'poster.jpg')], { stdio: 'ignore' });
console.log('wrote', out, `${probe(out).toFixed(1)}s`);
