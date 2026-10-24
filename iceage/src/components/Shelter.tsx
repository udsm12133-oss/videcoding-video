import React from 'react';
import { Easing, interpolate, spring } from 'remotion';
import { C, F } from '../theme';
import { rnd } from '../lib';

const ck = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

type TagDef = {
  at: number;
  item: [number, number];
  pos: [number, number];
  w: number;
  label: string;
  value: string;
  sub?: string;
  color: string;
};

const TAGS: TagDef[] = [
  { at: 45, item: [167, 700], pos: [24, 948], w: 330, label: '保温层', value: '≥ 20 cm', sub: 'INSULATION', color: C.ice },
  { at: 75, item: [430, 812], pos: [196, 612], w: 330, label: '热源', value: '≈1 kW 持续', sub: '必须通风 + CO报警', color: C.orange },
  { at: 105, item: [770, 820], pos: [690, 948], w: 360, label: '燃料', value: '≈80 L 柴油', sub: 'FUEL · 30 DAYS', color: C.orange },
  { at: 135, item: [780, 680], pos: [700, 318], w: 350, label: '电力', value: '≈30 kWh', sub: '照明·通讯·报警', color: C.cyan },
  { at: 165, item: [255, 548], pos: [24, 318], w: 380, label: '药品', value: '冻伤·低温症', sub: '+ 一氧化碳中毒', color: C.red },
];

const Tag: React.FC<{ d: TagDef; t: number }> = ({ d, t }) => {
  if (t < d.at - 2) return null;
  const p = spring({ frame: t - d.at + 2, fps: 30, config: { damping: 14, stiffness: 220 } });
  const line = interpolate(t, [d.at - 2, d.at + 8], [0, 1], ck);
  const h = d.sub ? 92 : 64;
  const [tx, ty] = d.pos;
  const anchorX = d.item[0] < tx ? tx : d.item[0] > tx + d.w ? tx + d.w : d.item[0];
  const anchorY = d.item[1] < ty ? ty : ty + h;
  const ex = d.item[0] + (anchorX - d.item[0]) * line;
  const ey = d.item[1] + (anchorY - d.item[1]) * line;
  const pulse = 1 + 0.25 * Math.sin((t - d.at) * 0.25);
  return (
    <g>
      <circle cx={d.item[0]} cy={d.item[1]} r={10 * pulse} fill="none" stroke={d.color} strokeWidth={3} opacity={0.9} />
      <circle cx={d.item[0]} cy={d.item[1]} r={4} fill={d.color} />
      <line x1={d.item[0]} y1={d.item[1]} x2={ex} y2={ey} stroke={d.color} strokeWidth={2} strokeDasharray="6 4" />
      <g transform={`translate(${tx},${ty}) scale(${p},1)`} opacity={Math.min(1, p * 1.5)}>
        <rect width={d.w} height={h} fill="rgba(4,14,26,0.9)" stroke={d.color} strokeWidth={2} />
        <rect width={8} height={h} fill={d.color} />
        <text x={24} y={44} fontFamily={F.head} fontWeight={900} fontSize={32} fill={C.frost}>
          {d.label}
        </text>
        <text x={d.w - 16} y={44} textAnchor="end" fontFamily={F.head} fontWeight={900} fontSize={32} fill={d.color}>
          {d.value}
        </text>
        {d.sub && (
          <text x={24} y={78} fontFamily={F.mono} fontSize={19} letterSpacing="0.12em" fill={C.dim}>
            {d.sub}
          </text>
        )}
      </g>
    </g>
  );
};

export const Shelter: React.FC<{ t: number }> = ({ t }) => {
  const rise = interpolate(t, [0, 26], [1, 0], { ...ck, easing: Easing.out(Easing.exp) });
  const ignite = spring({ frame: t - 12, fps: 30, config: { damping: 8, stiffness: 120 } });
  const heatR = interpolate(t, [12, 70], [0, 1], { ...ck, easing: Easing.out(Easing.cubic) });
  const flick = 0.85 + 0.15 * Math.sin(t * 0.9) * Math.sin(t * 0.37 + 1);
  const insul = interpolate(t, [40, 60], [0, 1], ck);
  const charge = interpolate(t, [135, 175], [0, 1], ck);
  const led = Math.floor(t / 10) % 2 === 0;

  return (
    <svg viewBox="0 0 1080 1060" width={1080} height={1060} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <linearGradient id="earth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1a28" />
          <stop offset="1" stopColor="#02070c" />
        </linearGradient>
        <radialGradient id="heat" cx="430" cy="812" r="520" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFB547" stopOpacity={0.85 * heatR * flick} />
          <stop offset="0.25" stopColor="#FF7A1A" stopOpacity={0.45 * heatR} />
          <stop offset="0.6" stopColor="#7a2a10" stopOpacity={0.18 * heatR} />
          <stop offset="1" stopColor="#061423" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="core" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF4D6" />
          <stop offset="0.3" stopColor="#FFC15A" />
          <stop offset="0.7" stopColor="#FF7A1A" />
          <stop offset="1" stopColor="#FF7A1A" stopOpacity={0} />
        </radialGradient>
        <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="14" height="14" fill="#0d3350" />
          <line x1="0" y1="0" x2="0" y2="14" stroke="#7FD8FF" strokeWidth="3" opacity="0.55" />
        </pattern>
        <filter id="blur8"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="blur20"><feGaussianBlur stdDeviation="20" /></filter>
      </defs>

      <g transform={`translate(0, ${rise * 420})`} opacity={1 - rise * 0.8}>
        {/* earth */}
        <path
          d="M0 300 C 120 270, 220 286, 330 292 S 560 262, 700 288 S 940 300, 1080 280 L1080 1060 L0 1060 Z"
          fill="url(#earth)"
        />
        {/* snow crust */}
        <path
          d="M0 300 C 120 270, 220 286, 330 292 S 560 262, 700 288 S 940 300, 1080 280 L1080 300 C 900 318, 760 306, 640 312 S 300 318, 0 316 Z"
          fill="#d8eefc"
          opacity={0.9}
        />
        {/* strata */}
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M0 ${400 + i * 160} Q 540 ${380 + i * 160 + (i % 2) * 40}, 1080 ${410 + i * 160}`}
            stroke="#1b3550"
            strokeWidth={1.5}
            fill="none"
            opacity={0.6}
          />
        ))}

        {/* vent pipe */}
        <rect x={500} y={240} width={22} height={190} fill="#22394f" stroke="#4d7393" strokeWidth={2} />
        <rect x={492} y={232} width={38} height={14} fill="#4d7393" />
        {Array.from({ length: 6 }, (_, i) => {
          const age = ((t * 1.2 + i * 22) % 130) / 130;
          return (
            <circle
              key={i}
              cx={511 + age * 220 + Math.sin(i + t * 0.1) * 10}
              cy={226 - age * 150}
              r={10 + age * 34}
              fill="#b8c9d6"
              opacity={(1 - age) * 0.35 * heatR}
              filter="url(#blur8)"
            />
          );
        })}

        {/* shelter shell: insulation */}
        <rect x={150} y={390} width={780} height={540} fill="url(#hatch)" />
        <rect x={150} y={390} width={780} height={540} fill="none" stroke={C.ice} strokeWidth={3} opacity={0.4 + insul * 0.6} />
        {insul > 0 && (
          <rect x={150} y={390} width={780} height={540} fill="none" stroke={C.ice} strokeWidth={10} opacity={insul * (0.5 + 0.5 * Math.sin(t * 0.4))} filter="url(#blur8)" />
        )}

        {/* interior */}
        <rect x={184} y={424} width={712} height={472} fill="#071626" />
        <rect x={184} y={424} width={712} height={472} fill="url(#heat)" />
        {/* floor */}
        <rect x={184} y={890} width={712} height={6} fill="#2a4560" />

        {/* heat waves */}
        {Array.from({ length: 4 }, (_, i) => {
          const a = ((t * 0.9 + i * 18) % 72) / 72;
          return (
            <circle key={i} cx={430} cy={812} r={40 + a * 330} fill="none" stroke={C.orange} strokeWidth={3} opacity={(1 - a) * 0.4 * heatR} />
          );
        })}

        {/* food crates */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const cx = 200 + (i % 3) * 42, cy = 852 - Math.floor(i / 3) * 40;
          return (
            <g key={i}>
              <rect x={cx} y={cy} width={38} height={38} fill="#3b4a3a" stroke="#8da07a" strokeWidth={2} />
              <line x1={cx} y1={cy + 19} x2={cx + 38} y2={cy + 19} stroke="#8da07a" strokeWidth={1.5} />
            </g>
          );
        })}
        {/* water jugs */}
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x={332 + i * 24} y={830} width={20} height={60} rx={5} fill="#1d5f8a" stroke={C.ice} strokeWidth={1.5} />
          </g>
        ))}

        {/* stove / heat core */}
        <rect x={384} y={762} width={92} height={128} rx={6} fill="#1a1f26" stroke="#55606c" strokeWidth={3} />
        <rect x={500} y={430} width={22} height={0} />
        <path d="M430 762 L430 700 L511 700 L511 430" stroke="#55606c" strokeWidth={14} fill="none" />
        <circle cx={430} cy={812} r={70 * ignite * flick} fill="url(#core)" filter="url(#blur20)" />
        <circle cx={430} cy={812} r={30 * ignite} fill="url(#core)" />

        {/* battery bank */}
        <rect x={690} y={652} width={180} height={66} rx={6} fill="#0c2236" stroke={C.cyan} strokeWidth={2} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            x={704 + i * 33}
            y={664}
            width={24}
            height={42}
            fill={C.cyan}
            opacity={charge * 5 > i ? 0.9 : 0.15}
          />
        ))}

        {/* fuel drums */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={706 + i * 58} y={806} width={52} height={86} rx={4} fill="#4a2a14" stroke={C.orange} strokeWidth={2} />
            <line x1={706 + i * 58} y1={828} x2={758 + i * 58} y2={828} stroke={C.orange} strokeWidth={2} />
            <line x1={706 + i * 58} y1={870} x2={758 + i * 58} y2={870} stroke={C.orange} strokeWidth={2} />
          </g>
        ))}

        {/* cot */}
        <rect x={560} y={510} width={310} height={22} rx={4} fill="#26384a" />
        <rect x={580} y={492} width={250} height={22} rx={8} fill="#5c3a2a" />
        <line x1={570} y1={532} x2={570} y2={560} stroke="#26384a" strokeWidth={6} />
        <line x1={860} y1={532} x2={860} y2={560} stroke="#26384a" strokeWidth={6} />

        {/* med kit */}
        <rect x={222} y={520} width={66} height={56} rx={6} fill="#e8eef2" />
        <rect x={249} y={530} width={12} height={36} fill={C.red} />
        <rect x={237} y={542} width={36} height={12} fill={C.red} />

        {/* CO alarm */}
        <circle cx={620} cy={440} r={12} fill="#cfd8df" />
        <circle cx={620} cy={440} r={4} fill={led ? '#3dff8a' : '#0d3a22'} />

        {/* readouts */}
        <text x={572} y={640} fontFamily={F.num} fontWeight={900} fontSize={64} fill={C.orange} opacity={heatR} style={{ filter: 'drop-shadow(0 0 14px #FF8A2A)' }}>
          +10°C
        </text>
        <text x={576} y={672} fontFamily={F.mono} fontSize={18} letterSpacing="0.3em" fill={C.ember} opacity={heatR}>
          INSIDE · 室内
        </text>

        {TAGS.map((d, i) => (
          <Tag key={i} d={d} t={t} />
        ))}
      </g>

      {/* outside temp */}
      <g opacity={interpolate(t, [20, 40], [0, 1], ck)}>
        <text x={1040} y={150} textAnchor="end" fontFamily={F.num} fontWeight={900} fontSize={72} fill={C.ice} style={{ filter: 'drop-shadow(0 0 14px #3BB8FF)' }}>
          −50°C
        </text>
        <text x={1040} y={184} textAnchor="end" fontFamily={F.mono} fontSize={18} letterSpacing="0.3em" fill={C.dim}>
          OUTSIDE · 暴风雪
        </text>
        {/* wind streaks */}
        {Array.from({ length: 10 }, (_, i) => {
          const x = ((t * 34 + rnd(i, 5) * 1400) % 1400) - 200;
          const y = 40 + rnd(i, 6) * 220;
          return <line key={i} x1={x} y1={y} x2={x - 180} y2={y - 20} stroke="#cfeaff" strokeWidth={2} opacity={0.25} />;
        })}
      </g>
    </svg>
  );
};
