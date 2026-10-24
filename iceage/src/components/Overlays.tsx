import React, { useLayoutEffect, useRef } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { TL, impactEnergy, lastImpactAge, mulberry, rnd } from '../lib';

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.16 }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const W = 360, H = 640;
  useLayoutEffect(() => {
    const ctx = ref.current!.getContext('2d')!;
    const img = ctx.createImageData(W, H);
    const r = mulberry(frame * 9973 + 1);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = r() * 255;
      img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [frame]);
  return (
    <canvas
      ref={ref}
      width={W}
      height={H}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, mixBlendMode: 'overlay' }}
    />
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        'radial-gradient(ellipse 75% 60% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,4,10,0.55) 80%, rgba(0,2,6,0.92) 100%)',
    }}
  />
);

export const Scanlines: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(120,200,255,0.035) 0px, rgba(120,200,255,0.035) 1px, transparent 1px, transparent 4px)',
      mixBlendMode: 'screen',
    }}
  />
);

/** Frost creeping in from the frame edges; amount 0..1 */
export const Frost: React.FC<{ amount: number }> = ({ amount }) => {
  if (amount <= 0) return null;
  const a = amount;
  const crystals = Array.from({ length: 26 }, (_, i) => {
    const side = i % 4;
    const t = rnd(i, 77);
    const len = (60 + rnd(i, 78) * 160) * a;
    const pos = t * (side % 2 === 0 ? 1080 : 1920);
    const [x, y, ang] =
      side === 0 ? [pos, 0, 90] : side === 1 ? [1080, pos, 180] : side === 2 ? [pos, 1920, 270] : [0, pos, 0];
    return { x, y, ang: ang + (rnd(i, 79) - 0.5) * 50, len };
  });
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill
        style={{
          boxShadow: `inset 0 0 ${140 * a}px ${30 * a}px rgba(190,235,255,${0.32 * a})`,
        }}
      />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: 0.55 * a }}>
        {crystals.map((c, i) => {
          const rad = (c.ang * Math.PI) / 180;
          const ex = c.x + Math.cos(rad) * c.len, ey = c.y + Math.sin(rad) * c.len;
          const mx = c.x + Math.cos(rad) * c.len * 0.55, my = c.y + Math.sin(rad) * c.len * 0.55;
          const b = c.len * 0.3;
          return (
            <g key={i} stroke="rgba(220,245,255,0.9)" strokeWidth={1.4} fill="none">
              <line x1={c.x} y1={c.y} x2={ex} y2={ey} />
              <line x1={mx} y1={my} x2={mx + Math.cos(rad + 0.7) * b} y2={my + Math.sin(rad + 0.7) * b} />
              <line x1={mx} y1={my} x2={mx + Math.cos(rad - 0.7) * b} y2={my + Math.sin(rad - 0.7) * b} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** White flash + chromatic edge on strong hits. */
export const ImpactFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const age = lastImpactAge(frame);
  const im = TL.impacts.find((i) => i.f === frame - age);
  const k = im ? im.k : 0;
  const flash = k >= 1 ? Math.max(0, 1 - age / 5) * 0.85 * Math.min(1, k) : k >= 0.6 ? Math.max(0, 1 - age / 3) * 0.25 : 0;
  const e = Math.min(1.5, impactEnergy(frame, 5));
  return (
    <>
      {flash > 0.01 && <AbsoluteFill style={{ background: `rgba(225,245,255,${flash})`, mixBlendMode: 'screen' }} />}
      {e > 0.05 && (
        <AbsoluteFill
          style={{
            boxShadow: `inset ${14 * e}px 0 ${40 * e}px rgba(255,40,80,${0.35 * e}), inset ${-14 * e}px 0 ${40 * e}px rgba(40,200,255,${0.35 * e})`,
          }}
        />
      )}
    </>
  );
};

/** Horizontal glitch slices around every scene cut. */
export const GlitchCuts: React.FC = () => {
  const frame = useCurrentFrame();
  let d = 99, cut = 0;
  for (const s of TL.scenes) {
    if (s.from === 0) continue;
    const dd = Math.abs(frame - s.from);
    if (dd < d) { d = dd; cut = s.from; }
  }
  if (d > 4) return null;
  const strength = 1 - d / 5;
  const bars = Array.from({ length: 9 }, (_, i) => {
    const y = rnd(i + frame * 13, cut) * 1920;
    const h = 4 + rnd(i + frame * 7, cut + 1) * 60;
    const off = (rnd(i + frame, cut + 2) - 0.5) * 220 * strength;
    const col = i % 3 === 0 ? 'rgba(255,60,80,0.45)' : i % 3 === 1 ? 'rgba(60,210,255,0.5)' : 'rgba(230,245,255,0.55)';
    return { y, h, off, col };
  });
  return (
    <AbsoluteFill style={{ mixBlendMode: 'screen' }}>
      {bars.map((b, i) => (
        <div key={i} style={{ position: 'absolute', left: b.off, top: b.y, width: 1080, height: b.h, background: b.col, opacity: strength }} />
      ))}
    </AbsoluteFill>
  );
};

/** Wraps content in decaying camera shake driven by the impact list. */
export const Shake: React.FC<{ children: React.ReactNode; amount?: number }> = ({ children, amount = 1 }) => {
  const frame = useCurrentFrame();
  const e = impactEnergy(frame, 6) * amount;
  const x = (rnd(frame, 3) - 0.5) * 36 * e;
  const y = (rnd(frame, 4) - 0.5) * 36 * e;
  const r = (rnd(frame, 5) - 0.5) * 1.2 * e;
  const s = 1 + 0.025 * Math.min(1, e);
  return <AbsoluteFill style={{ transform: `translate(${x}px,${y}px) rotate(${r}deg) scale(${s})` }}>{children}</AbsoluteFill>;
};
