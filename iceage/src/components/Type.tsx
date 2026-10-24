import React from 'react';
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CUES } from '../subtitles';
import { C, F, SUB_Y, glow } from '../theme';
import { fmt } from '../lib';

type Seg = { t: string; kind: 'n' | 'ice' | 'heat' | 'br' };
const parse = (s: string): Seg[] => {
  const out: Seg[] = [];
  const re = /\[([^\]]+)\]|\{([^}]+)\}|(\|)|([^[{|]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m[1]) out.push({ t: m[1], kind: 'ice' });
    else if (m[2]) out.push({ t: m[2], kind: 'heat' });
    else if (m[3]) out.push({ t: '', kind: 'br' });
    else out.push({ t: m[4], kind: 'n' });
  }
  return out;
};

const CueLine: React.FC<{ start: number; end: number; text: string }> = ({ start, end, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const segs = parse(text);
  const exit = interpolate(frame, [end - 7, end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  let idx = 0;
  const renderChar = (ch: string, color: string, size: number) => {
    const i = idx++;
    const local = frame - start - i * 1.1;
    const p = interpolate(local, [0, 7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
    return (
      <span
        key={i}
        style={{
          display: 'inline-block',
          opacity: p,
          transform: `translateY(${(1 - p) * 46}px) scale(${1 + (1 - p) * 0.4})`,
          filter: `blur(${(1 - p) * 10}px)`,
          color,
          fontSize: size,
        }}
      >
        {ch}
      </span>
    );
  };
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 70,
        top: SUB_Y,
        transform: `translateY(-50%) translateY(${-exit * 26}px)`,
        opacity: 1 - exit,
        filter: `blur(${exit * 8}px)`,
        textAlign: 'center',
        fontFamily: F.head,
        fontWeight: 900,
        fontSize: 62,
        lineHeight: 1.32,
        textWrap: 'balance',
        letterSpacing: '0.02em',
        color: C.frost,
        textShadow: '0 0 18px rgba(0,0,0,0.9), 0 3px 0 rgba(0,0,0,0.85), 0 0 40px rgba(60,180,255,0.35)',
      }}
    >
      {segs.map((s, si) => {
        if (s.kind === 'br') return <br key={si} />;
        if (s.kind === 'n') return <React.Fragment key={si}>{Array.from(s.t).map((ch) => renderChar(ch, C.frost, 62))}</React.Fragment>;
        const startIdx = idx;
        const pop = spring({ frame: frame - start - startIdx * 1.1 - 4, fps, config: { damping: 9, stiffness: 180 } });
        const col = s.kind === 'heat' ? C.orange : C.ice;
        return (
          <span
            key={si}
            style={{
              display: 'inline-block',
              whiteSpace: 'nowrap',
              transform: `scale(${interpolate(pop, [0, 1], [0.8, 1.06])})`,
              margin: '0 6px',
              textShadow: glow(col, 0.8),
            }}
          >
            {Array.from(s.t).map((ch) => renderChar(ch, col, 66))}
          </span>
        );
      })}
    </div>
  );
};

export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = CUES.find(([s, e]) => frame >= s && frame < e);
  if (!cue) return null;
  return <CueLine key={cue[0]} start={cue[0]} end={cue[1]} text={cue[2]} />;
};

/** Big slam-in typography. `at` = local frame when it lands. */
export const Slam: React.FC<{
  at: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  from?: number;
  out?: number; // local frame to start exit
}> = ({ at, children, style, from = 2.4, out }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at - 4) return null;
  const s = spring({ frame: frame - at + 4, fps, config: { damping: 13, stiffness: 260, mass: 0.8 } });
  const scale = interpolate(s, [0, 1], [from, 1]);
  const op = interpolate(frame, [at - 4, at], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ex = out !== undefined ? interpolate(frame, [out, out + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
  return (
    <div
      style={{
        position: 'absolute',
        transform: `scale(${scale * (1 + ex * 0.15)})`,
        opacity: op * (1 - ex),
        filter: `blur(${Math.max(0, (scale - 1) * 14) + ex * 12}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Counter: React.FC<{
  from: number;
  to: number;
  start: number;
  end: number;
  format?: (n: number) => string;
  style?: React.CSSProperties;
}> = ({ from, to, start, end, format = fmt, style }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return <span style={{ fontFamily: F.num, fontVariantNumeric: 'tabular-nums', ...style }}>{format(v)}</span>;
};

export const Mono: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; color?: string; size?: number }> = ({
  children,
  style,
  color = C.ice,
  size = 22,
}) => (
  <div style={{ fontFamily: F.mono, fontSize: size, letterSpacing: '0.2em', color, textTransform: 'uppercase', ...style }}>{children}</div>
);

/** HUD panel with corner brackets. */
export const Panel: React.FC<{ style?: React.CSSProperties; color?: string; children?: React.ReactNode; appear?: number }> = ({
  style,
  color = C.cyan,
  children,
  appear = 1,
}) => {
  const b = 22;
  const corner = (pos: React.CSSProperties, bt: string, bl: string): React.CSSProperties => ({
    position: 'absolute',
    width: b,
    height: b,
    ...pos,
    borderTop: bt,
    borderLeft: bl,
  });
  const line = `3px solid ${color}`;
  return (
    <div
      style={{
        position: 'absolute',
        background: 'linear-gradient(180deg, rgba(10,34,56,0.62), rgba(4,14,26,0.72))',
        border: `1px solid ${color}44`,
        boxShadow: `0 0 30px ${color}22, inset 0 0 30px ${color}11`,
        clipPath: `inset(0 ${(1 - appear) * 100}% 0 0)`,
        ...style,
      }}
    >
      <div style={corner({ left: -2, top: -2 }, line, line)} />
      <div style={{ ...corner({ right: -2, top: -2 }, line, 'none'), borderRight: line }} />
      <div style={{ ...corner({ left: -2, bottom: -2 }, 'none', line), borderBottom: line }} />
      <div style={{ ...corner({ right: -2, bottom: -2 }, 'none', 'none'), borderRight: line, borderBottom: line }} />
      {children}
    </div>
  );
};
