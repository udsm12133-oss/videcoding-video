import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Shelter } from '../components/Shelter';
import { Snow } from '../components/Snow';
import { Counter, Mono, Panel, Slam } from '../components/Type';
import { C, F, glow } from '../theme';

const ck = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/* ───────────── S7 SHELTER (990–1350) ───────────── */
export const ShelterScene: React.FC = () => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, 360], [1, 1.05]);
  const panelA = interpolate(f, [200, 212], [0, 1], ck);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0c2742 0%, #061423 30%, #02060B 60%)' }} />
      <div style={{ position: 'absolute', left: 54, top: 225, width: 972, height: 954, transform: `scale(${push})`, transformOrigin: '50% 40%' }}>
        <Snow intensity={0.9} wind={2.2} width={1080} height={380} seed={7} style={{ transform: 'scale(0.9)', transformOrigin: '0 0' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, transform: 'scale(0.9)', transformOrigin: '0 0' }}>
          <Shelter t={f} />
        </div>
      </div>
      {f >= 200 && (
        <Panel style={{ left: 54, top: 1192, width: 972, height: 122 }} color={C.orange} appear={panelA}>
          <div style={{ position: 'absolute', left: 28, top: 16 }}>
            <Mono size={17} color={C.dim}>供热需求 · HEAT / DAY</Mono>
            <div style={{ fontFamily: F.num, fontWeight: 900, fontSize: 56, color: C.ember, marginTop: 4 }}>
              20–30<span style={{ fontSize: 26 }}> kWh</span>
            </div>
          </div>
          <div style={{ position: 'absolute', left: 400, top: 40, fontFamily: F.num, fontSize: 48, color: C.dim }}>→</div>
          <div style={{ position: 'absolute', right: 28, top: 16, textAlign: 'right' }}>
            <Mono size={17} color={C.dim}>30 天 · 估算</Mono>
            <div style={{ fontFamily: F.num, fontWeight: 900, fontSize: 64, color: C.orange, marginTop: 0, textShadow: glow(C.orange, 0.8) }}>
              ≈<Counter from={0} to={750} start={220} end={318} />
              <span style={{ fontSize: 28 }}> kWh</span>
            </div>
          </div>
        </Panel>
      )}
    </AbsoluteFill>
  );
};

/* ───────────── S8 COMPARE (1350–1590) ───────────── */
export const Compare: React.FC = () => {
  const f = useCurrentFrame();
  const base = 1210, maxH = 800;
  const foodH = interpolate(f, [10, 40], [0, (105 / 750) * maxH], { ...ck, easing: Easing.out(Easing.cubic) });
  const heatH = interpolate(f, [50, 118], [0, maxH], { ...ck, easing: Easing.inOut(Easing.cubic) });
  const shimmer = (f * 6) % 200;
  const bar = (x: number, w: number, h: number, col: string, inner: string) => (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: base - h,
        width: w,
        height: h,
        background: inner,
        boxShadow: `0 0 40px ${col}88, inset 0 0 0 2px ${col}`,
      }}
    />
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 70% 60%, #2a1406 0%, #02060B 60%)' }} />
      <Mono size={22} color={C.dim} style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center' }}>
        30 天能量账单 · ENERGY BUDGET
      </Mono>
      {/* grid */}
      {[0, 250, 500, 750].map((v) => (
        <div key={v} style={{ position: 'absolute', left: 120, right: 120, top: base - (v / 750) * maxH, height: 1, background: `${C.ice}22` }}>
          <span style={{ position: 'absolute', left: -6, top: -12, transform: 'translateX(-100%)', fontFamily: F.mono, fontSize: 16, color: C.dim }}>{v}</span>
        </div>
      ))}
      {bar(190, 260, foodH, C.ice, `linear-gradient(180deg, ${C.ice}, #134a74)`)}
      {bar(630, 260, heatH, C.orange, `linear-gradient(180deg, ${C.ember} 0%, ${C.orange} ${30 + shimmer / 10}%, #7a2a10 100%)`)}
      {/* values */}
      <div style={{ position: 'absolute', left: 190, width: 260, top: base - foodH - 90, textAlign: 'center', opacity: interpolate(f, [12, 20], [0, 1], ck) }}>
        <div style={{ fontFamily: F.num, fontWeight: 900, fontSize: 64, color: C.ice, textShadow: glow(C.cyan, 0.8) }}>
          <Counter from={0} to={105} start={10} end={40} />
          <span style={{ fontSize: 26 }}> kWh</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 600, width: 320, top: base - heatH - 104, textAlign: 'center', opacity: interpolate(f, [52, 60], [0, 1], ck) }}>
        <div style={{ fontFamily: F.num, fontWeight: 900, fontSize: 80, color: C.orange, textShadow: glow(C.orange, 1) }}>
          <Counter from={0} to={750} start={50} end={118} />
          <span style={{ fontSize: 30 }}> kWh</span>
        </div>
      </div>
      {/* labels */}
      <div style={{ position: 'absolute', left: 190, width: 260, top: base + 18, textAlign: 'center' }}>
        <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 46, color: C.frost }}>食物</div>
        <Mono size={16} color={C.dim}>90,000 KCAL</Mono>
      </div>
      <div style={{ position: 'absolute', left: 630, width: 260, top: base + 18, textAlign: 'center' }}>
        <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 46, color: C.frost }}>取暖</div>
        <Mono size={16} color={C.dim}>≈80 L 柴油</Mono>
      </div>
      <Slam at={120} style={{ left: 150, width: 340, top: 520, textAlign: 'center' }} from={3.2}>
        <div style={{ fontFamily: F.num, fontWeight: 900, fontSize: 250, lineHeight: 1, color: C.orange, textShadow: glow(C.orange, 1.8), letterSpacing: '-0.05em' }}>×7</div>
        <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 40, color: C.frost, marginTop: 4 }}>取暖 ÷ 食物</div>
      </Slam>
      <Mono size={15} color={C.dim} style={{ position: 'absolute', left: 0, right: 0, top: 292, textAlign: 'center', letterSpacing: '0.12em' }}>
        估算 · 约10㎡ 20cm保温避难所 · 室外 −50°C / 室内 +10°C
      </Mono>
    </AbsoluteFill>
  );
};

/* ───────────── S9 VERDICT (1590–1800) ───────────── */
export const Verdict: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dieAt = 165; // global 1755
  const beat = Math.exp(-((f % 15) / 5)) * 0.12;
  const flicker = f >= 150 && f < dieAt ? (Math.floor(f * 1.7) % 3 === 0 ? 0.35 : 1) : 1;
  const alive = f < dieAt ? 1 : interpolate(f, [dieAt, dieAt + 10], [1, 0], { ...ck, easing: Easing.in(Easing.cubic) });
  const born = spring({ frame: f, fps, config: { damping: 12, stiffness: 80 } });
  const r = 170 * born * (1 + beat) * alive;
  const cold = interpolate(f, [dieAt, dieAt + 20], [0, 1], ck);
  const textOut = interpolate(f, [148, 160], [0, 1], ck);
  const endMark = interpolate(f, [182, 196], [0, 1], ck);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 36%, rgba(255,122,26,${0.35 * alive * flicker}) 0%, #050d16 45%, #02060B 80%)` }} />
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 40%, #12385c 0%, #02060B 75%)', opacity: cold }} />
      <Snow intensity={0.85} wind={0.6 + cold * 2} seed={11} vortex={{ x: 540, y: 690, k: 0.55 * alive }} />
      {/* heat core */}
      <div style={{ position: 'absolute', left: 540 - r * 2.4, top: 690 - r * 2.4, width: r * 4.8, height: r * 4.8, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,138,42,0.55) 0%, rgba(255,90,20,0.18) 40%, rgba(0,0,0,0) 70%)', opacity: flicker }} />
      <div style={{ position: 'absolute', left: 540 - r, top: 690 - r, width: r * 2, height: r * 2, borderRadius: '50%', background: 'radial-gradient(circle, #fff6df 0%, #FFC15A 28%, #FF7A1A 60%, rgba(255,90,20,0) 72%)', filter: 'blur(2px)', opacity: flicker }} />
      {Array.from({ length: 3 }, (_, i) => {
        const a = ((f + i * 20) % 60) / 60;
        return (
          <div key={i} style={{ position: 'absolute', left: 540 - (r + a * 260), top: 690 - (r + a * 260), width: (r + a * 260) * 2, height: (r + a * 260) * 2, borderRadius: '50%', border: `3px solid ${C.orange}`, opacity: (1 - a) * 0.5 * alive }} />
        );
      })}
      {/* statement */}
      <div style={{ opacity: 1 - textOut, filter: `blur(${textOut * 10}px)` }}>
        <Slam at={30} style={{ left: 0, right: 0, top: 990, textAlign: 'center' }}>
          <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 72, color: C.frost, textShadow: glow(C.cyan, 0.8) }}>在极寒末日里</div>
        </Slam>
        <Slam at={60} style={{ left: 0, right: 0, top: 1085, textAlign: 'center' }} from={2.8}>
          <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 150, lineHeight: 1.1, color: C.orange, textShadow: glow(C.orange, 1.8) }}>能量和热量</div>
        </Slam>
        <Slam at={90} style={{ left: 0, right: 0, top: 1270, textAlign: 'center' }}>
          <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 96, color: C.frost, textShadow: glow(C.cyan, 1) }}>比食物更重要</div>
        </Slam>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: endMark }}>
        <div style={{ fontFamily: F.num, fontWeight: 900, fontSize: 96, color: C.frost, letterSpacing: '0.02em', textShadow: glow(C.cyan, 1) }}>
          ENERGY <span style={{ color: C.orange }}>&gt;</span> FOOD
        </div>
        <Mono size={20} color={C.dim} style={{ marginTop: 10 }}>END OF TRANSMISSION</Mono>
      </div>
    </AbsoluteFill>
  );
};
