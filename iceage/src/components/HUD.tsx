import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, F } from '../theme';
import { TL, extTemp } from '../lib';

export const HUD: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = TL.scenes.find((s) => frame >= s.from && frame < s.to) ?? TL.scenes[0];
  const t = extTemp(frame);
  const tCol = t <= -40 ? C.red : t <= -15 ? C.cyan : C.ice;
  const blink = Math.floor(frame / 8) % 2 === 0;
  const day = Math.round(interpolate(frame, [360, 1590], [1, 30], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const showDay = frame >= 360;
  const intro = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  const labelAge = frame - scene.from;
  const typed = scene.label.slice(0, Math.max(0, Math.floor(labelAge * 1.6)));

  return (
    <AbsoluteFill style={{ fontFamily: F.mono, color: C.ice, opacity: intro }}>
      {/* top-left */}
      <div style={{ position: 'absolute', left: 56, top: 70 }}>
        <div style={{ fontSize: 20, letterSpacing: '0.32em', color: C.dim }}>ICE AGE // SURVIVAL PROTOCOL</div>
        <div style={{ fontSize: 26, letterSpacing: '0.18em', marginTop: 10, color: C.frost }}>
          <span style={{ color: blink ? C.red : 'transparent' }}>● </span>
          {typed}
          <span style={{ opacity: blink ? 1 : 0 }}>_</span>
        </div>
      </div>
      {/* top-right */}
      <div style={{ position: 'absolute', right: 56, top: 64, textAlign: 'right' }}>
        <div style={{ fontSize: 18, letterSpacing: '0.3em', color: C.dim }}>EXT. TEMP</div>
        <div
          style={{
            fontFamily: F.num,
            fontWeight: 900,
            fontSize: 54,
            lineHeight: 1,
            marginTop: 6,
            color: tCol,
            textShadow: `0 0 18px ${tCol}`,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {t > 0 ? '+' : t < 0 ? '−' : ''}
          {Math.abs(Math.round(t))}°C
        </div>
        {showDay && (
          <div style={{ fontSize: 20, letterSpacing: '0.24em', marginTop: 8, color: C.ice }}>
            DAY {String(day).padStart(2, '0')}/30
          </div>
        )}
      </div>
      {/* rule */}
      <div style={{ position: 'absolute', left: 56, right: 56, top: 200, height: 1, background: `linear-gradient(90deg, ${C.cyan}aa, ${C.cyan}11 60%, ${C.cyan}66)` }} />
      {Array.from({ length: 25 }, (_, i) => (
        <div key={i} style={{ position: 'absolute', left: 56 + i * 40, top: 196, width: 1, height: i % 5 === 0 ? 10 : 5, background: `${C.cyan}88` }} />
      ))}
      {/* bottom timeline */}
      <div style={{ position: 'absolute', left: 56, right: 56, top: 1590, height: 3, background: `${C.cyan}22` }}>
        <div style={{ width: `${(frame / TL.duration) * 100}%`, height: '100%', background: frame > 1590 ? C.orange : C.cyan, boxShadow: `0 0 10px ${C.cyan}` }} />
        {TL.scenes.map((s) => (
          <div key={s.id} style={{ position: 'absolute', left: `${(s.from / TL.duration) * 100}%`, top: -6, width: 2, height: 15, background: frame >= s.from ? C.ice : `${C.ice}44` }} />
        ))}
      </div>
      <div style={{ position: 'absolute', left: 56, top: 1606, fontSize: 16, letterSpacing: '0.3em', color: C.dim }}>
        T+{(frame / 30).toFixed(2).padStart(5, '0')}s
      </div>
    </AbsoluteFill>
  );
};
