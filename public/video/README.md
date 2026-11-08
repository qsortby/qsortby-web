# Intro video

The home-page intro video is on **YouTube**, not in this folder:
https://www.youtube.com/watch?v=9XvEiozgzcY (1:58, 2026-11-08 cut — source in `design/video/`)

- The video ID lives in `src/consts.ts` → `INTRO_VIDEO_ID`.
- `src/components/IntroVideo.astro` shows a poster with a play button and only
  loads the YouTube player (from youtube-nocookie.com) when someone presses play.
- Poster: `qsortby-intro-youtube.jpg`, the video's own YouTube thumbnail,
  self-hosted (currently `design/video/out/youtube-thumbnail-light-1600x900.jpg`). Swapping the video? Change the ID and re-download the poster:

```bash
curl -o public/video/qsortby-intro-youtube.jpg \
  https://i.ytimg.com/vi/<VIDEO_ID>/maxresdefault.jpg
```

`qsortby-intro.mp4` / `qsortby-intro.jpg` are the old self-hosted cut (1:37)
and are no longer used by any page.
