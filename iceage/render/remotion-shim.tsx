/**
 * Minimal stand-in for the subset of the Remotion API this project uses, so the
 * exact same composition source can be rendered frame-by-frame in plain headless
 * Chromium when the real `remotion` package can't be installed.
 * Used only by render/render.mjs (esbuild aliases `remotion` -> this file).
 */
import React, { createContext, useContext } from 'react';

type Cfg = { fps: number; width: number; height: number; durationInFrames: number; id: string };
const FrameCtx = createContext(0);
const CfgCtx = createContext<Cfg>({ fps: 30, width: 1080, height: 1920, durationInFrames: 1800, id: 'IceAge' });

export const __Provider: React.FC<{ frame: number; cfg: Cfg; children: React.ReactNode }> = ({ frame, cfg, children }) => (
  <CfgCtx.Provider value={cfg}>
    <FrameCtx.Provider value={frame}>{children}</FrameCtx.Provider>
  </CfgCtx.Provider>
);

export const useCurrentFrame = () => useContext(FrameCtx);
export const useVideoConfig = () => useContext(CfgCtx);

export const AbsoluteFill: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ style, ...rest }) => (
  <div
    {...rest}
    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', ...style }}
  />
);

export const Sequence: React.FC<{ from?: number; durationInFrames?: number; children: React.ReactNode; name?: string; layout?: 'absolute-fill' | 'none' }> = ({
  from = 0,
  durationInFrames = Infinity,
  children,
  layout = 'absolute-fill',
}) => {
  const f = useCurrentFrame();
  if (f < from || f >= from + durationInFrames) return null;
  const inner = <FrameCtx.Provider value={f - from}>{children}</FrameCtx.Provider>;
  return layout === 'none' ? inner : <AbsoluteFill>{inner}</AbsoluteFill>;
};

export const Audio: React.FC<any> = () => null;
export const staticFile = (p: string) => p;

// ---------- interpolate ----------
type Extrap = 'extend' | 'clamp' | 'identity';
export const interpolate = (
  input: number,
  inputRange: readonly number[],
  outputRange: readonly number[],
  opts: { easing?: (t: number) => number; extrapolateLeft?: Extrap; extrapolateRight?: Extrap } = {},
) => {
  const { easing = (t: number) => t, extrapolateLeft = 'extend', extrapolateRight = 'extend' } = opts;
  let i = 1;
  while (i < inputRange.length - 1 && input > inputRange[i]) i++;
  const i0 = inputRange[i - 1], i1 = inputRange[i];
  const o0 = outputRange[i - 1], o1 = outputRange[i];
  let x = input;
  if (x < i0) {
    if (extrapolateLeft === 'clamp') x = i0;
    else if (extrapolateLeft === 'identity') return x;
  }
  if (x > i1) {
    if (extrapolateRight === 'clamp') x = i1;
    else if (extrapolateRight === 'identity') return x;
  }
  if (i1 === i0) return o0;
  let t = (x - i0) / (i1 - i0);
  t = easing(t);
  return o0 + (o1 - o0) * t;
};

// ---------- spring (damped harmonic oscillator, closed form) ----------
export const spring = ({
  frame,
  fps,
  config = {},
  from = 0,
  to = 1,
  delay = 0,
}: {
  frame: number;
  fps: number;
  config?: { damping?: number; mass?: number; stiffness?: number; overshootClamping?: boolean };
  from?: number;
  to?: number;
  delay?: number;
}) => {
  const { damping = 10, mass = 1, stiffness = 100, overshootClamping = false } = config;
  const t = (frame - delay) / fps;
  if (t <= 0) return from;
  const w0 = Math.sqrt(stiffness / mass);
  const z = damping / (2 * Math.sqrt(stiffness * mass));
  let x: number; // displacement from target, starts at 1
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    x = Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
  } else if (z === 1) {
    x = Math.exp(-w0 * t) * (1 + w0 * t);
  } else {
    const s = Math.sqrt(z * z - 1);
    const r1 = -w0 * (z - s), r2 = -w0 * (z + s);
    const c2 = -r1 / (r2 - r1);
    const c1 = 1 - c2;
    x = c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t);
  }
  let p = 1 - x;
  if (overshootClamping) p = Math.min(1, p);
  return from + (to - from) * p;
};

// ---------- Easing ----------
const bezier = (x1: number, y1: number, x2: number, y2: number) => {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      const d = dx(t);
      if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    return sy(Math.min(1, Math.max(0, t)));
  };
};
type E = (t: number) => number;
export const Easing = {
  linear: (t: number) => t,
  ease: bezier(0.42, 0, 1, 1),
  quad: (t: number) => t * t,
  cubic: (t: number) => t * t * t,
  poly: (n: number) => (t: number) => Math.pow(t, n),
  sin: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  circle: (t: number) => 1 - Math.sqrt(1 - t * t),
  exp: (t: number) => Math.pow(2, 10 * (t - 1)),
  back: (s = 1.70158) => (t: number) => t * t * ((s + 1) * t - s),
  bezier,
  in: (e: E) => e,
  out: (e: E) => (t: number) => 1 - e(1 - t),
  inOut: (e: E) => (t: number) => (t < 0.5 ? e(t * 2) / 2 : 1 - e((1 - t) * 2) / 2),
};
