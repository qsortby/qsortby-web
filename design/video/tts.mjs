// Voice-over per scene through ElevenLabs, WITH word timestamps (the subtitle
// in each scene reveals word by word as the line is spoken, like the old cut).
//   ELEVENLABS_API_KEY=… node design/video/tts.mjs             # scenes with no audio yet
//   ELEVENLABS_API_KEY=… node design/video/tts.mjs 12-intent   # redo one (overwrites)
//   ELEVENLABS_API_KEY=… node design/video/tts.mjs --all       # redo everything
// Writes audio/<id>.mp3 + audio/<id>.json (word start times). The voice is the
// QPushly listing v2 one (SSfU0eLfP3qeuR4j2bwD); change it in script.json only.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const script = JSON.parse(readFileSync(join(here, 'script.json'), 'utf8'));
const key = process.env.ELEVENLABS_API_KEY;
if (!key) { console.error('ELEVENLABS_API_KEY is not set'); process.exit(1); }
const arg = process.argv[2];
mkdirSync(join(here, 'audio'), { recursive: true });

for (const s of script.scenes) {
  const mp3 = join(here, 'audio', `${s.id}.mp3`), meta = join(here, 'audio', `${s.id}.json`);
  if (arg && arg !== '--all' && s.id !== arg) continue;
  // Keep a take only when it was made from the line the script holds NOW — an
  // mp3 left over from an earlier script (same id, different words) is redone.
  const fresh = existsSync(mp3) && existsSync(meta) && JSON.parse(readFileSync(meta, 'utf8')).text === s.vo;
  if (!arg && fresh) { console.log('keep ', s.id); continue; }
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${script.voice_id}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ text: s.vo, model_id: script.model_id, voice_settings: script.voice_settings }),
  });
  if (!r.ok) { console.error(s.id, r.status, await r.text()); process.exit(1); }
  const j = await r.json();
  writeFileSync(mp3, Buffer.from(j.audio_base64, 'base64'));
  // character alignment → word start times
  const al = j.alignment || j.normalized_alignment;
  const words = []; let cur = '', start = null;
  al.characters.forEach((ch, i) => {
    if (ch === ' ' || ch === '\n') { if (cur) { words.push({ w: cur, t: start }); cur = ''; start = null; } }
    else { if (start === null) start = al.character_start_times_seconds[i]; cur += ch; }
  });
  if (cur) words.push({ w: cur, t: start });
  writeFileSync(meta, JSON.stringify({ text: s.vo, words }, null, 1));
  console.log('wrote', s.id, `${words.length} words`);
}
