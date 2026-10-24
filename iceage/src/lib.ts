import timeline from './timeline.json';

export const TL = timeline;

// ---------- deterministic randomness ----------
export const hash1 = (n: number) => {
  let h = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};
export const rnd = (i: number, salt = 0) => hash1(i * 7919 + salt * 104729 + 17);

export const mulberry = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// ---------- 3D value noise (seamless on a sphere) ----------
const h3 = (x: number, y: number, z: number) => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};
const sm = (t: number) => t * t * (3 - 2 * t);
export const vnoise = (x: number, y: number, z: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = sm(x - xi), yf = sm(y - yi), zf = sm(z - zi);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  const c000 = h3(xi, yi, zi), c100 = h3(xi + 1, yi, zi);
  const c010 = h3(xi, yi + 1, zi), c110 = h3(xi + 1, yi + 1, zi);
  const c001 = h3(xi, yi, zi + 1), c101 = h3(xi + 1, yi, zi + 1);
  const c011 = h3(xi, yi + 1, zi + 1), c111 = h3(xi + 1, yi + 1, zi + 1);
  return l(
    l(l(c000, c100, xf), l(c010, c110, xf), yf),
    l(l(c001, c101, xf), l(c011, c111, xf), yf),
    zf,
  );
};
export const fbm = (x: number, y: number, z: number, oct = 4) => {
  let s = 0, a = 0.5, f = 1, n = 0;
  for (let i = 0; i < oct; i++) {
    s += vnoise(x * f, y * f, z * f) * a;
    n += a;
    a *= 0.5;
    f *= 2.03;
  }
  return s / n;
};

// ---------- helpers ----------
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

export const mixHex = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const tt = clamp(t);
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * tt)).join(',')})`;
};

/** Camera shake / flash energy from the shared impact list (also drives the soundtrack). */
export const impactEnergy = (frame: number, decay = 9) => {
  let e = 0;
  for (const im of TL.impacts) {
    const d = frame - im.f;
    if (d >= 0 && d < 40) e += im.k * Math.exp(-d / decay);
  }
  return e;
};
export const lastImpactAge = (frame: number) => {
  let best = 999;
  for (const im of TL.impacts) {
    const d = frame - im.f;
    if (d >= 0 && d < best) best = d;
  }
  return best;
};

/** External temperature shown on the HUD across the whole piece. */
export const extTemp = (f: number) => {
  if (f < 60) return -50;
  if (f < 100) return 0;
  if (f < 105) return lerp(0, -20, (f - 100) / 5);
  if (f < 145) return -20;
  if (f < 150) return lerp(-20, -50, (f - 145) / 5);
  return -50;
};
