// Frame-accurate local renderer: bundles src/ with `remotion` aliased to the shim,
// screenshots every frame in headless Chromium, then muxes with ffmpeg.
// usage: node render/render.mjs <startFrame> <endFrameExclusive> <out.mp4> [workers]
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const [start = '0', end = '1800', out = 'out/render.mp4', workers = '2'] = process.argv.slice(2);
const S = +start, E = +end, W = +workers;
const NODE_PATH = '/opt/npm-tools/node_modules';

const tmp = path.join(ROOT, '.render');
const framesDir = path.join(tmp, `frames_${S}_${E}`);
fs.rmSync(framesDir, { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });

await build({
  entryPoints: [path.join(ROOT, 'render/entry.tsx')],
  bundle: true,
  outfile: path.join(tmp, 'bundle.js'),
  alias: { remotion: path.join(ROOT, 'render/remotion-shim.tsx') },
  nodePaths: [NODE_PATH],
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  minify: true,
  logLevel: 'warning',
});
fs.writeFileSync(
  path.join(tmp, 'index.html'),
  `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#02060B;width:1080px;height:1920px;overflow:hidden}#root{position:relative;width:1080px;height:1920px;overflow:hidden}</style></head><body><div id="root"></div><script src="bundle.js"></script></body></html>`,
);

const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text'] });
const t0 = Date.now();
let done = 0;
const total = E - S;
await Promise.all(
  Array.from({ length: W }, async (_, w) => {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
    await page.goto('file://' + path.join(tmp, 'index.html'));
    await page.waitForFunction(() => window.__ready === true);
    for (let f = S + w; f < E; f += W) {
      await page.evaluate((n) => window.__setFrame(n), f);
      await page.screenshot({ path: path.join(framesDir, `${String(f - S).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 93 });
      done++;
      if (done % 60 === 0) {
        const el = (Date.now() - t0) / 1000;
        console.log(`${done}/${total} frames · ${el.toFixed(0)}s · eta ${((el / done) * (total - done)).toFixed(0)}s`);
      }
    }
    await page.close();
  }),
);
await browser.close();

const audio = path.join(ROOT, 'public/soundtrack.wav');
const args = ['-y', '-framerate', '30', '-i', path.join(framesDir, '%05d.jpg')];
if (fs.existsSync(audio)) args.push('-ss', String(S / 30), '-t', String(total / 30), '-i', audio);
args.push('-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart');
if (fs.existsSync(audio)) args.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
args.push(path.resolve(ROOT, out));
execFileSync('ffmpeg', args, { stdio: ['ignore', 'ignore', 'inherit'] });
console.log('wrote', out, `in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
