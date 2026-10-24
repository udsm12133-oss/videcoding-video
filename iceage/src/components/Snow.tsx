import React, { useLayoutEffect, useRef } from 'react';
import { useCurrentFrame } from 'remotion';
import { rnd } from '../lib';

type Props = {
  intensity: number; // 0..1
  wind?: number; // horizontal speed multiplier
  width?: number;
  height?: number;
  seed?: number;
  color?: string; // rgb triplet "r,g,b"
  /** attract flakes toward a point (0..1 strength) for the finale vortex */
  vortex?: { x: number; y: number; k: number };
  style?: React.CSSProperties;
};

const MAX = 1100;

export const Snow: React.FC<Props> = ({
  intensity,
  wind = 1,
  width = 1080,
  height = 1920,
  seed = 1,
  color = '220,240,255',
  vortex,
  style,
}) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, width, height);
    const n = Math.floor(MAX * Math.max(0, Math.min(1, intensity)));
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const depth = rnd(i, seed); // 0 far .. 1 near
      const size = 1 + depth * depth * 6;
      const vy = 6 + depth * 26;
      const vx = (10 + depth * 38) * wind;
      const y0 = rnd(i, seed + 1) * (height + 400);
      const x0 = rnd(i, seed + 2) * (width + 1200) - 1200 * Math.max(0, wind) / 1.5;
      const t = frame + rnd(i, seed + 3) * 1000;
      let y = ((y0 + t * vy) % (height + 400)) - 200;
      let x = ((x0 + t * vx + Math.sin(t * 0.05 + i) * 20) % (width + 1200) + width + 1200) % (width + 1200) - 300;
      if (vortex) {
        const dx = vortex.x - x, dy = vortex.y - y;
        const dist = Math.hypot(dx, dy) + 1;
        const pull = vortex.k * Math.min(1, 260 / dist);
        x += dx * pull * 0.5 - dy * pull * 0.35;
        y += dy * pull * 0.5 + dx * pull * 0.35;
      }
      const a = 0.25 + depth * 0.7;
      const streak = 0.6 + depth * 1.4;
      ctx.strokeStyle = `rgba(${color},${a})`;
      ctx.lineWidth = size;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - vx * streak * 0.35, y - vy * streak * 0.35);
      ctx.stroke();
    }
  }, [frame, intensity, wind, width, height, seed, color, vortex?.x, vortex?.y, vortex?.k]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      style={{ position: 'absolute', left: 0, top: 0, width, height, pointerEvents: 'none', ...style }}
    />
  );
};
