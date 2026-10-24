# 极寒末日：避难所要囤多少物资？ — Remotion project

60 s · 1080×1920 · 30 fps · Chinese kinetic subtitles · synthesised score locked to 120 BPM.

Script, storyboard (with frame numbers) and the visual design system: `docs/SCRIPT_STORYBOARD.md`.

## Render with Remotion
```bash
npm install
npm run audio      # regenerates public/soundtrack.wav from src/timeline.json (needs python3 + numpy + scipy)
npm run studio     # live preview
npm run preview    # 10 s preview  -> out/preview_10s.mp4
npm run render     # full 60 s     -> out/ice_age_shelter_60s.mp4
```

## Structure
```
src/
  timeline.json        single source of truth: scenes, impacts, risers, ticks, silence
                       (drives camera shake, flashes, glitch cuts AND the soundtrack)
  subtitles.ts         narration cues  ([ice] {heat} highlights, | line break)
  IceAge.tsx           master timeline + global layers (snow, frost, HUD, grain, audio)
  scenes/Intro.tsx     S1 hook · S2 global freeze · S3 home failure · S4 the question
  scenes/Data.tsx      S5 food · S6 water
  scenes/Outro.tsx     S7 shelter cutaway · S8 energy comparison · S9 verdict
  components/          Globe (procedural, canvas) · Snow · Shelter (SVG cutaway) · HUD · Type · Overlays
audio/make_soundtrack.py   drone, wind, heartbeat, impacts, risers, ticks, warm pad
render/                    fallback frame renderer (headless Chromium + ffmpeg) using a
                           shim of the Remotion APIs — only needed where `remotion` can't be installed
```

## Notes
- There is no recorded voice-over; the narration lives in the kinetic subtitles. To add VO, drop a
  file in `public/` and add an `<Audio>` next to the soundtrack in `IceAge.tsx` — cue timings are in `subtitles.ts`.
- Fonts: Noto Sans CJK SC (headlines), Inter Display (numbers), JetBrains Mono / DejaVu Sans Mono (HUD).
  Falls back to PingFang SC / Microsoft YaHei if Noto is missing.
- Heating numbers are labelled 估算 on screen; the derivation is in the script doc.
