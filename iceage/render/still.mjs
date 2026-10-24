// quick stills: node render/still.mjs 0 30 150 ... -> .render/stills/f_XXXX.jpg
import { build } from 'esbuild';
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const tmp = path.join(ROOT, '.render');
const dir = path.join(tmp, 'stills');
fs.mkdirSync(dir, { recursive: true });
await build({
  entryPoints: [path.join(ROOT, 'render/entry.tsx')], bundle: true, outfile: path.join(tmp, 'bundle.js'),
  alias: { remotion: path.join(ROOT, 'render/remotion-shim.tsx') }, nodePaths: ['/opt/npm-tools/node_modules'],
  jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'warning',
});
fs.writeFileSync(path.join(tmp, 'index.html'), `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#02060B;width:1080px;height:1920px;overflow:hidden}#root{position:relative;width:1080px;height:1920px;overflow:hidden}</style></head><body><div id="root"></div><script src="bundle.js"></script></body></html>`);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
page.on('console', (m) => m.type() === 'error' && console.error('CONSOLE', m.text()));
await page.goto('file://' + path.join(tmp, 'index.html'));
await page.waitForFunction(() => window.__ready === true);
for (const a of process.argv.slice(2)) {
  const f = +a; const t = Date.now();
  await page.evaluate((n) => window.__setFrame(n), f);
  await page.screenshot({ path: path.join(dir, `f_${String(f).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 85 });
  console.log(f, Date.now() - t, 'ms');
}
await browser.close();
