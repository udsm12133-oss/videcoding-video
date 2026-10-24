import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Globe } from '../components/Globe';
import { Counter, Mono, Panel, Slam } from '../components/Type';
import { C, F, glow } from '../theme';
import { extTemp, mixHex, rnd } from '../lib';

const ck = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/* ───────────── S1 HOOK  (0–60) ───────────── */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const freeze = interpolate(f, [2, 34], [0.04, 0.9], { ...ck, easing: Easing.out(Easing.exp) });
  const zoomOut = interpolate(f, [52, 60], [1, 1.35], { ...ck, easing: Easing.in(Easing.cubic) });
  const crack = interpolate(f, [8, 22], [0, 1], { ...ck, easing: Easing.out(Easing.cubic) });
  const cx = 540, cy = 900;
  const cracks = Array.from({ length: 16 }, (_, i) => {
    const a0 = (i / 16) * Math.PI * 2 + rnd(i, 1) * 0.3;
    let x = cx, y = cy, a = a0;
    const pts = [`${x},${y}`];
    const steps = 7;
    for (let s = 0; s < steps; s++) {
      a += (rnd(i * 10 + s, 2) - 0.5) * 0.7;
      const len = 60 + rnd(i * 10 + s, 3) * 110;
      x += Math.cos(a) * len;
      y += Math.sin(a) * len;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  });
  const warn = Math.floor(f / 5) % 2 === 0;
  return (
    <AbsoluteFill style={{ transform: `scale(${zoomOut})`, filter: `blur(${(zoomOut - 1) * 20}px)` }}>
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 47%, #0d2c4a 0%, #02060B 70%)' }} />
      <Globe diameter={1500} res={560} rotation={0.4 + f * 0.01} freeze={freeze} style={{ left: -210, top: 150 }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g stroke="#e6f8ff" strokeWidth={4} fill="none" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 8px #7FD8FF)' }}>
          {cracks.map((p, i) => (
            <polyline key={i} points={p} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - crack} opacity={0.9} />
          ))}
        </g>
      </svg>
      <Slam at={8} style={{ left: 0, right: 0, top: 560, textAlign: 'center' }}>
        <div style={{ fontFamily: F.num, fontWeight: 900, fontSize: 300, lineHeight: 1, color: C.frost, letterSpacing: '-0.04em', textShadow: glow(C.cyan, 1.6) }}>
          −50°C
        </div>
      </Slam>
      <div
        style={{
          position: 'absolute',
          left: 56,
          right: 56,
          top: 250,
          height: 64,
          background: warn ? 'rgba(255,40,40,0.9)' : 'rgba(255,40,40,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: F.head,
          fontWeight: 900,
          fontSize: 34,
          color: '#fff',
          letterSpacing: '0.12em',
          opacity: f > 4 ? 1 : 0,
        }}
      >
        ⚠ WARNING · 全球温度崩溃
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── S2 FREEZE  (60–210) ───────────── */
export const Freeze: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + 60;
  const enter = interpolate(f, [0, 14], [1.6, 1], { ...ck, easing: Easing.out(Easing.exp) });
  const freeze = interpolate(f, [0, 45, 90, 148], [0.06, 0.42, 0.78, 1.0], ck);
  const t = extTemp(g);
  const tCol = t <= -40 ? C.red : t <= -15 ? C.cyan : C.ice;
  const jolt = (k: number) => Math.exp(-Math.max(0, f - k) / 4) * (f >= k ? 1 : 0);
  const pop = 1 + 0.18 * (jolt(45) + jolt(90));
  // thermometer: +20 (top) .. -60 (bottom)
  const thTop = 300, thBot = 1180;
  const level = thTop + ((20 - t) / 80) * (thBot - thTop);
  const secs = Math.max(0, 72 * 3600 - Math.max(0, f - 90) * 420);
  const hh = String(Math.floor(secs / 3600)).padStart(2, '0');
  const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const ss = String(Math.floor(secs % 60)).padStart(2, '0');
  const countOn = f >= 88;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 36%, ${mixHex('#123a5c', '#0a1c30', freeze)} 0%, #02060B 65%)` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, transform: `scale(${enter})`, transformOrigin: '540px 640px' }}>
        <Globe diameter={760} res={520} rotation={1 + f * 0.014} freeze={freeze} style={{ left: 160, top: 260 }} />
      </div>
      {/* thermometer */}
      <div style={{ position: 'absolute', left: 64, top: thTop, width: 18, height: thBot - thTop, borderRadius: 9, border: `2px solid ${C.ice}55`, background: '#02060Baa', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: level - thTop, bottom: 0, background: `linear-gradient(180deg, ${tCol}, ${C.cyan}44)`, boxShadow: `0 0 20px ${tCol}` }} />
      </div>
      {[20, 0, -20, -40, -60].map((v) => (
        <div key={v} style={{ position: 'absolute', left: 92, top: thTop + ((20 - v) / 80) * (thBot - thTop) - 11, fontFamily: F.mono, fontSize: 18, color: v === Math.round(t) ? tCol : C.dim }}>
          — {v}
        </div>
      ))}
      {/* big readout */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1040, textAlign: 'center' }}>
        <Mono size={22} color={C.dim} style={{ marginBottom: 6 }}>
          全球地表平均温度 · GLOBAL SURFACE
        </Mono>
        <div
          style={{
            fontFamily: F.num,
            fontWeight: 900,
            fontSize: 210,
            lineHeight: 1,
            color: tCol,
            textShadow: glow(tCol, 1.4),
            transform: `scale(${pop})`,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.03em',
          }}
        >
          {t < -0.5 ? '−' : ''}
          {Math.abs(Math.round(t))}°C
        </div>
      </div>
      {/* countdown */}
      {countOn && (
        <Panel style={{ left: 600, top: 236, width: 424, height: 104 }} color={C.red} appear={interpolate(f, [88, 96], [0, 1], ck)}>
          <Mono size={18} color={C.red} style={{ position: 'absolute', left: 22, top: 14 }}>
            家庭存活倒计时 · HOME
          </Mono>
          <div style={{ position: 'absolute', left: 22, top: 40, fontFamily: F.num, fontWeight: 900, fontSize: 50, color: C.frost, fontVariantNumeric: 'tabular-nums' }}>
            {hh}:{mm}:{ss}
          </div>
        </Panel>
      )}
    </AbsoluteFill>
  );
};

/* ───────────── S3 COLLAPSE  (210–360) ───────────── */
const STATUS = [
  { at: 15, zh: '电网', en: 'POWER GRID', bad: 'OFFLINE' },
  { at: 45, zh: '暖气', en: 'HEATING', bad: 'FAILED' },
  { at: 75, zh: '水管', en: 'WATER PIPES', bad: 'FROZEN · BURST' },
];

export const Collapse: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [8, 132], [0, 1], { ...ck, easing: Easing.inOut(Easing.quad) });
  const inside = interpolate(p, [0, 1], [18, -12]);
  const hour = Math.round(interpolate(f, [8, 132], [0, 72], ck));
  const inCol = inside > 5 ? C.orange : inside > -2 ? C.ice : C.red;
  const enter = interpolate(f, [0, 12], [0, 1], { ...ck, easing: Easing.out(Easing.cubic) });
  const warmA = mixHex('#FF5A1F', '#0B3C66', p);
  const warmB = mixHex('#FFC15A', '#123A5C', p);
  const coldA = mixHex('#B83A12', '#05182B', p);
  const waves = Array.from({ length: 9 }, (_, i) => {
    const age = ((f * 1.4 + i * 17) % 60) / 60;
    const src = [
      [280, 230], [400, 120], [520, 230], [250, 420], [550, 420], [400, 330], [180, 330], [620, 330], [400, 520],
    ][i];
    const dir = [[-0.6, -1], [0, -1], [0.6, -1], [-1, 0], [1, 0], [0, -1], [-1, -0.3], [1, -0.3], [0, 1]][i];
    return { x: src[0] + dir[0] * age * 200, y: src[1] + dir[1] * age * 200, o: (1 - age) * (1 - p) };
  });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 35%, #0b2238 0%, #02060B 70%)' }} />
      <svg viewBox="0 0 800 640" width={760} height={608} style={{ position: 'absolute', left: 160, top: 250, opacity: enter, transform: `scale(${0.9 + enter * 0.1})` }}>
        <defs>
          <radialGradient id="th" cx="0.5" cy="0.65" r="0.65">
            <stop offset="0" stopColor={warmB} />
            <stop offset="0.5" stopColor={warmA} />
            <stop offset="1" stopColor={coldA} />
          </radialGradient>
          <filter id="b6"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>
        {waves.map((w, i) => (
          <path key={i} d={`M${w.x - 20} ${w.y} q 10 -14 20 0 t 20 0`} stroke={C.orange} strokeWidth={5} fill="none" opacity={w.o} filter="url(#b6)" />
        ))}
        <polygon points="80,300 400,70 720,300" fill="url(#th)" stroke={C.frost} strokeWidth={4 + p * 8} strokeOpacity={0.3 + p * 0.6} />
        <rect x={130} y={300} width={540} height={300} fill="url(#th)" stroke={C.frost} strokeWidth={4 + p * 8} strokeOpacity={0.3 + p * 0.6} />
        <rect x={360} y={440} width={80} height={160} fill="#02060B" opacity={0.5} />
        <rect x={190} y={360} width={110} height={90} fill="#02060B" opacity={0.35} stroke={C.frost} strokeOpacity={0.4} strokeWidth={3} />
        <rect x={500} y={360} width={110} height={90} fill="#02060B" opacity={0.35} stroke={C.frost} strokeOpacity={0.4} strokeWidth={3} />
        {/* icicles */}
        {Array.from({ length: 14 }, (_, i) => (
          <polygon key={i} points={`${140 + i * 38},300 ${152 + i * 38},300 ${146 + i * 38},${300 + p * (20 + rnd(i, 9) * 50)}`} fill={C.frost} opacity={p} />
        ))}
        <rect x={0} y={600} width={800} height={40} fill={C.frost} opacity={0.15 + p * 0.5} />
        <text x={20} y={30} fontFamily={F.mono} fontSize={16} fill={C.dim} letterSpacing="0.2em">
          THERMAL IMAGING · RESIDENCE
        </text>
      </svg>

      {/* indoor readout */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 860, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 40 }}>
        <div style={{ textAlign: 'center' }}>
          <Mono size={20} color={C.dim}>室内温度 · INDOOR</Mono>
          <div style={{ fontFamily: F.num, fontWeight: 900, fontSize: 150, lineHeight: 1, color: inCol, textShadow: glow(inCol, 1.2), fontVariantNumeric: 'tabular-nums' }}>
            {inside >= 0.5 ? '+' : inside <= -0.5 ? '−' : ''}
            {Math.abs(Math.round(inside))}°C
          </div>
        </div>
        <div style={{ textAlign: 'left', paddingBottom: 18 }}>
          <Mono size={20} color={C.dim}>停电后</Mono>
          <div style={{ fontFamily: F.num, fontWeight: 900, fontSize: 64, color: C.frost, fontVariantNumeric: 'tabular-nums' }}>
            {String(hour).padStart(2, '0')}
            <span style={{ fontSize: 30, color: C.dim }}> H</span>
          </div>
        </div>
      </div>

      {/* status rows */}
      <Panel style={{ left: 90, top: 1080, width: 900, height: 220 }} color={C.cyan} appear={enter}>
        {STATUS.map((s, i) => {
          const bad = f >= s.at;
          const flash = bad ? Math.exp(-(f - s.at) / 5) : 0;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 28,
                right: 28,
                top: 22 + i * 64,
                height: 54,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: `rgba(255,59,59,${flash * 0.5})`,
                borderBottom: i < 2 ? `1px solid ${C.cyan}22` : 'none',
              }}
            >
              <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 36, color: C.frost }}>
                {s.zh} <span style={{ fontFamily: F.mono, fontSize: 18, color: C.dim, letterSpacing: '0.2em', fontWeight: 400 }}>{s.en}</span>
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: '0.16em', color: bad ? C.red : C.cyan, textShadow: bad ? `0 0 12px ${C.red}` : 'none' }}>
                {bad ? `■ ${s.bad}` : '● ONLINE'}
              </div>
            </div>
          );
        })}
      </Panel>
    </AbsoluteFill>
  );
};

/* ───────────── S4 QUESTION  (360–510) ───────────── */
const CHIPS = ['食物', '水', '热源', '燃料', '电力', '药品'];

export const Question: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lit = Math.floor(interpolate(f, [62, 128], [0, 30], ck));
  const R = 300, cx = 540, cy = 820;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 45%, #0a1f35 0%, #010409 70%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: F.head, fontWeight: 900, fontSize: 1100, lineHeight: 1, color: C.ice, opacity: 0.045 }}>?</div>
      <Slam at={15} style={{ left: 0, right: 0, top: 250, textAlign: 'center' }} out={58}>
        <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 190, color: C.frost, textShadow: glow(C.cyan, 1.2), lineHeight: 1 }}>
          1<span style={{ fontSize: 120 }}> 人</span>
        </div>
        <Mono size={22} color={C.dim} style={{ marginTop: 10 }}>ONE PERSON · ONE SHELTER</Mono>
      </Slam>
      {f >= 56 && (
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 30 }, (_, i) => {
            const a0 = (i / 30) * Math.PI * 2 - Math.PI / 2 + 0.02;
            const a1 = ((i + 1) / 30) * Math.PI * 2 - Math.PI / 2 - 0.02;
            const on = i < lit;
            const p = (r: number, a: number) => `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
            return (
              <path
                key={i}
                d={`M${p(R, a0)} A${R} ${R} 0 0 1 ${p(R, a1)} L${p(R - 34, a1)} A${R - 34} ${R - 34} 0 0 0 ${p(R - 34, a0)} Z`}
                fill={on ? C.ice : '#0e2a44'}
                opacity={on ? 0.95 : 0.6}
                style={on ? { filter: 'drop-shadow(0 0 8px #3BB8FF)' } : undefined}
              />
            );
          })}
        </svg>
      )}
      <Slam at={60} style={{ left: 0, right: 0, top: cy - 170, textAlign: 'center' }} from={3}>
        <div style={{ fontFamily: F.num, fontWeight: 900, fontSize: 300, lineHeight: 1, color: C.frost, textShadow: glow(C.cyan, 1.5), letterSpacing: '-0.04em' }}>30</div>
        <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 64, color: C.ice, marginTop: -6 }}>天 · DAYS</div>
      </Slam>
      {CHIPS.map((c, i) => {
        const at = 100 + i * 5;
        if (f < at) return null;
        const s = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 240 } });
        const flick = f - at < 6 ? (Math.floor(f) % 2 ? 0.3 : 1) : 1;
        const col = i < 2 ? C.ice : i === 2 || i === 3 ? C.orange : i === 4 ? C.cyan : C.red;
        return (
          <div
            key={c}
            style={{
              position: 'absolute',
              left: 90 + (i % 3) * 310,
              top: 1150 + Math.floor(i / 3) * 76,
              width: 280,
              height: 62,
              border: `2px solid ${col}`,
              background: `${col}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 18px',
              boxSizing: 'border-box',
              opacity: flick,
              transform: `translateY(${(1 - s) * 30}px)`,
            }}
          >
            <span style={{ fontFamily: F.head, fontWeight: 900, fontSize: 34, color: C.frost }}>{c}</span>
            <span style={{ fontFamily: F.mono, fontSize: 18, color: col, letterSpacing: '0.15em' }}>? ? ?</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
