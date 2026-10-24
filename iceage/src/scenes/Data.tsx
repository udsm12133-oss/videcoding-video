import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Counter, Mono, Panel, Slam } from '../components/Type';
import { C, F, glow } from '../theme';
import { fmt, rnd } from '../lib';

const ck = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const Bg: React.FC<{ tint?: string }> = ({ tint = '#0a2238' }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, ${tint} 0%, #02060B 68%)` }} />
);

/* ───────────── S5 FOOD (510–780) ───────────── */
const Gauge: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const cx = 540, cy = 790, R = 330;
  const A0 = (210 * Math.PI) / 180, SW = (240 * Math.PI) / 180;
  const ang = (v: number) => A0 - (v / 4000) * SW;
  const pt = (r: number, v: number) => [cx + Math.cos(ang(v)) * r, cy - Math.sin(ang(v)) * r];
  const arc = (r: number, v0: number, v1: number) => {
    const [x0, y0] = pt(r, v0);
    const [x1, y1] = pt(r, v1);
    const large = ((v1 - v0) / 4000) * 240 > 180 ? 1 : 0;
    return `M${x0} ${y0} A${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  };
  const s = spring({ frame: f - 8, fps, config: { damping: 9, stiffness: 60 } });
  const val = s * 3500;
  const [nx, ny] = pt(R - 40, val);
  const out = interpolate(f, [80, 90], [0, 1], ck);
  const draw = interpolate(f, [0, 14], [0, 1], { ...ck, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `scale(${1 - out * 0.2})`, filter: `blur(${out * 10}px)` }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <path d={arc(R, 0, 4000)} stroke="#123a5c" strokeWidth={26} fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
        <path d={arc(R, 2000, 2500)} stroke={C.dim} strokeWidth={26} fill="none" opacity={0.8 * draw} />
        <path d={arc(R, 3000, 3500)} stroke={C.orange} strokeWidth={34} fill="none" opacity={draw} style={{ filter: 'drop-shadow(0 0 14px #FF8A2A)' }} />
        {Array.from({ length: 41 }, (_, i) => {
          const v = i * 100;
          const big = i % 10 === 0;
          const [x0, y0] = pt(R + 24, v);
          const [x1, y1] = pt(R + (big ? 50 : 36), v);
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.ice} strokeWidth={big ? 3 : 1.5} opacity={draw * (big ? 0.9 : 0.4)} />;
        })}
        {[0, 1000, 2000, 3000, 4000].map((v) => {
          const [x, y] = pt(R + 84, v);
          return (
            <text key={v} x={x} y={y + 8} textAnchor="middle" fontFamily={F.mono} fontSize={22} fill={C.dim} opacity={draw}>
              {v}
            </text>
          );
        })}
        {(() => {
          const [x, y] = pt(R - 64, 2250);
          return (
            <text x={x} y={y} textAnchor="middle" fontFamily={F.head} fontWeight={900} fontSize={24} fill={C.dim} opacity={draw}>
              常温
            </text>
          );
        })()}
        {(() => {
          const [x, y] = pt(R - 70, 3250);
          return (
            <text x={x} y={y} textAnchor="middle" fontFamily={F.head} fontWeight={900} fontSize={28} fill={C.orange} opacity={draw}>
              极寒
            </text>
          );
        })()}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={C.frost} strokeWidth={8} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 10px #fff)' }} />
        <circle cx={cx} cy={cy} r={22} fill={C.frost} />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center' }}>
        <div style={{ fontFamily: F.num, fontWeight: 900, fontSize: 150, lineHeight: 1, color: C.orange, textShadow: glow(C.orange, 1.2), fontVariantNumeric: 'tabular-nums' }}>
          {fmt(Math.min(3500, val))}
        </div>
        <Mono size={24} color={C.ember} style={{ marginTop: 8 }}>
          KCAL / 天 · 3000–3500
        </Mono>
        <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 30, color: C.dim, marginTop: 18 }}>发抖产热 + 负重活动 + 呼吸失热</div>
      </div>
    </AbsoluteFill>
  );
};

const Crate: React.FC<{ i: number; f: number }> = ({ i, f }) => {
  const { fps } = useVideoConfig();
  const col = i % 6, row = Math.floor(i / 6);
  const x = 105 + col * 148, y = 1000 - row * 128;
  const at = 92 + i * 2.6;
  const s = spring({ frame: f - at, fps, config: { damping: 11, stiffness: 200, mass: 0.7 } });
  const out = interpolate(f, [176, 186], [0, 1], ck);
  if (f < at) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 130,
        height: 110,
        transform: `translateY(${(1 - s) * -700}px) scale(${1 - out * 0.6}) rotate(${out * (rnd(i, 4) - 0.5) * 40}deg)`,
        opacity: 1 - out,
        background: 'linear-gradient(180deg, #3d4b37, #232c21)',
        border: `2px solid #8da07a`,
        boxShadow: `inset 0 0 0 6px #2a3427, 0 0 16px ${C.orange}33`,
        fontFamily: F.mono,
        color: C.ember,
        boxSizing: 'border-box',
        padding: '14px 12px',
      }}
    >
      <div style={{ fontSize: 16, letterSpacing: '0.12em', color: '#c8d6b4' }}>DAY {String(i + 1).padStart(2, '0')}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 10, fontFamily: F.num }}>3,000+</div>
      <div style={{ fontSize: 14, color: '#c8d6b4' }}>KCAL</div>
    </div>
  );
};

export const Food: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phaseB = f >= 86 && f < 190;
  const phaseC = f >= 176;
  return (
    <AbsoluteFill>
      <Bg tint="#1a2230" />
      {f < 92 && <Gauge f={f} />}
      {phaseB && (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', opacity: interpolate(f, [86, 94, 176, 184], [0, 1, 1, 0], ck) }}>
            <Mono size={22} color={C.dim}>30 天总需求 · TOTAL ENERGY</Mono>
            <div style={{ fontFamily: F.num, fontWeight: 900, fontSize: 150, lineHeight: 1.05, color: C.frost, textShadow: glow(C.orange, 1) }}>
              <Counter from={0} to={90000} start={92} end={176} />
              <span style={{ fontSize: 50, color: C.orange }}> kcal</span>
            </div>
          </div>
          {Array.from({ length: 30 }, (_, i) => (
            <Crate key={i} i={i} f={f} />
          ))}
        </>
      )}
      {phaseC && (
        <>
          <Slam at={182} style={{ left: 0, right: 0, top: 250, textAlign: 'center' }}>
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 120, lineHeight: 1.05, color: C.frost, textShadow: glow(C.orange, 1) }}>
              ≈ <span style={{ fontFamily: F.num, color: C.ember }}>180</span> 包
            </div>
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 52, color: C.ice }}>方便面 · 约 500 kcal/包</div>
          </Slam>
          {Array.from({ length: 180 }, (_, i) => {
            const at = 182 + i * 0.22;
            if (f < at) return null;
            const s = spring({ frame: f - at, fps, config: { damping: 10, stiffness: 300 } });
            const col = i % 18, row = Math.floor(i / 18);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 93 + col * 50,
                  top: 520 + row * 50,
                  width: 44,
                  height: 44,
                  transform: `scale(${s})`,
                  borderRadius: '6px 6px 12px 12px',
                  background: `linear-gradient(180deg, ${C.ember}, ${C.orange})`,
                  boxShadow: `0 0 10px ${C.orange}66`,
                  borderTop: '7px solid #fff3dc',
                  boxSizing: 'border-box',
                }}
              />
            );
          })}
          <Panel style={{ left: 93, top: 1050, width: 894, height: 110 }} color={C.orange} appear={interpolate(f, [200, 212], [0, 1], ck)}>
            <div style={{ position: 'absolute', left: 30, top: 18, fontFamily: F.head, fontWeight: 900, fontSize: 46, color: C.frost }}>
              或 ≈ <span style={{ color: C.ember, fontFamily: F.num }}>20 kg</span> 高能口粮
            </div>
            <Mono size={18} color={C.dim} style={{ position: 'absolute', right: 26, top: 44 }}>
              4.5–5 KCAL/G
            </Mono>
          </Panel>
        </>
      )}
    </AbsoluteFill>
  );
};

/* ───────────── S6 WATER (780–990) ───────────── */
export const Water: React.FC = () => {
  const f = useCurrentFrame();
  const freezeP = interpolate(f, [105, 125], [0, 1], { ...ck, easing: Easing.out(Easing.cubic) });
  let liters = 0;
  const jugs = Array.from({ length: 30 }, (_, i) => {
    const at = 10 + i * 2.2;
    const lvl = interpolate(f, [at, at + 16], [0, 1], { ...ck, easing: Easing.out(Easing.quad) });
    liters += lvl * 3;
    return lvl;
  });
  const warnOn = f >= 112;
  return (
    <AbsoluteFill>
      <Bg tint="#0b2a44" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center' }}>
        <Mono size={22} color={C.dim}>3 L × 30 天 · MINIMUM WATER</Mono>
        <div style={{ fontFamily: F.num, fontWeight: 900, fontSize: 170, lineHeight: 1.05, color: freezeP > 0.5 ? C.frost : C.ice, textShadow: glow(C.cyan, 1.2), fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(liters)}
          <span style={{ fontSize: 70 }}> L</span>
        </div>
        <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 36, color: C.dim, opacity: interpolate(f, [60, 70], [0, 1], ck) }}>
          ≈ 180 瓶 500 ml 矿泉水 · 重 90 kg
        </div>
      </div>
      {jugs.map((lvl, i) => {
        const col = i % 10, row = Math.floor(i / 10);
        const x = 68 + col * 96, y = 560 + row * 180;
        const wave = Math.sin(f * 0.3 + i) * 4 * (1 - freezeP);
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, width: 80, height: 150 }}>
            <div style={{ position: 'absolute', left: 26, top: -12, width: 28, height: 16, background: '#2b4d6a', borderRadius: 3 }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: 14, border: `2px solid ${C.ice}88`, overflow: 'hidden', background: '#04111eaa' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: `${lvl * 92}%`,
                  background:
                    freezeP > 0
                      ? `linear-gradient(180deg, rgba(240,250,255,${0.6 + 0.4 * freezeP}), rgba(140,200,235,${0.6 + 0.4 * freezeP}))`
                      : `linear-gradient(180deg, #5fd0ff, #135a8e)`,
                  borderTop: `3px solid ${freezeP > 0.5 ? '#fff' : '#a8ecff'}`,
                  transform: `translateY(${wave}px)`,
                }}
              />
              {freezeP > 0 && (
                <svg width={80} height={150} style={{ position: 'absolute', inset: 0, opacity: freezeP }}>
                  <polyline
                    points={`${10 + rnd(i, 1) * 20},${30 + rnd(i, 2) * 30} 40,${70 + rnd(i, 3) * 20} ${50 + rnd(i, 4) * 20},${110 + rnd(i, 5) * 30}`}
                    stroke="#5a8fb3"
                    strokeWidth={2}
                    fill="none"
                  />
                  <line x1={40} y1={75} x2={70} y2={60} stroke="#5a8fb3" strokeWidth={1.5} />
                </svg>
              )}
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 156, textAlign: 'center', fontFamily: F.mono, fontSize: 14, color: C.dim }}>
              D{String(i + 1).padStart(2, '0')}
            </div>
          </div>
        );
      })}
      {warnOn && (
        <Panel style={{ left: 68, top: 1110, width: 944, height: 190 }} color={C.red} appear={interpolate(f, [112, 122], [0, 1], ck)}>
          <div style={{ position: 'absolute', left: 30, top: 22, fontFamily: F.head, fontWeight: 900, fontSize: 46, color: C.red, textShadow: `0 0 14px ${C.red}` }}>
            ⚠ 储水会结冰
          </div>
          <div style={{ position: 'absolute', left: 30, top: 92, fontFamily: F.head, fontWeight: 900, fontSize: 34, color: C.frost }}>
            融化 3 L 雪水 ≈ <span style={{ color: C.orange, fontFamily: F.num }}>0.4 kWh</span> 热量 / 天
          </div>
          <Mono size={16} color={C.dim} style={{ position: 'absolute', left: 30, top: 146 }}>
            −50°C ICE → +10°C WATER · ≈480 KJ/KG
          </Mono>
        </Panel>
      )}
    </AbsoluteFill>
  );
};
