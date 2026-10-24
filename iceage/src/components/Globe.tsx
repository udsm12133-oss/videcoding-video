import React, { useLayoutEffect, useRef } from 'react';
import { fbm } from '../lib';

type Props = {
  diameter: number; // on-screen size in px
  res?: number; // internal canvas resolution
  rotation: number; // radians
  freeze: number; // 0 = temperate, 1 = fully frozen
  heat?: number; // 0..1 warm rim tint (unused by default)
  style?: React.CSSProperties;
};

const L = (() => {
  const v = [-0.55, 0.45, 0.7];
  const m = Math.hypot(v[0], v[1], v[2]);
  return v.map((x) => x / m);
})();

const mix = (a: number[], b: number[], t: number) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const OCEAN_D = [4, 22, 44];
const OCEAN_L = [14, 62, 98];
const LAND_A = [38, 62, 44];
const LAND_B = [92, 86, 62];
const ICE_A = [170, 214, 240];
const ICE_B = [246, 252, 255];
const FRONT = [120, 230, 255];

export const Globe: React.FC<Props> = ({ diameter, res = 600, rotation, freeze, style }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const S = res;
    const img = ctx.createImageData(S, S);
    const d = img.data;
    const r = S / 2;
    const cr = Math.cos(rotation), sr = Math.sin(rotation);
    const thresh = 1.02 - freeze * 1.12; // |sin(lat)| above this is ice

    for (let py = 0; py < S; py++) {
      const dy = (py + 0.5 - r) / r;
      for (let px = 0; px < S; px++) {
        const dx = (px + 0.5 - r) / r;
        const d2 = dx * dx + dy * dy;
        if (d2 > 1) continue;
        const nz = Math.sqrt(1 - d2);
        const nx = dx, ny = -dy;
        // rotate around Y axis
        const x = nx * cr + nz * sr;
        const z = -nx * sr + nz * cr;
        const y = ny;

        const h = fbm(x * 1.8 + 11.3, y * 1.8 + 3.1, z * 1.8 - 7.7, 4);
        const land = h > 0.535;
        let col = land
          ? mix(LAND_A, LAND_B, Math.min(1, (h - 0.535) * 6))
          : mix(OCEAN_D, OCEAN_L, Math.min(1, h * 1.4));

        // ice front, ragged by noise, land freezes first
        const n2 = fbm(x * 4 + 40, y * 4, z * 4, 3);
        const lat = Math.abs(y) + (n2 - 0.5) * 0.32 + (land ? 0.12 : 0);
        const edge = lat - thresh;
        if (edge > 0) {
          col = mix(ICE_A, ICE_B, Math.min(1, n2 * 1.4));
        }
        if (edge > -0.035 && edge < 0.02 && freeze > 0.02 && freeze < 0.99) {
          col = mix(col, FRONT, 0.75);
        }

        // clouds
        const cl = fbm(x * 3.1 + 5, y * 5.2 + 1, z * 3.1 + 9, 3);
        if (cl > 0.56) col = mix(col, [235, 245, 255], Math.min(0.55, (cl - 0.56) * 3.5));

        // lighting (screen-space so the terminator stays put)
        const lam = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
        const shade = 0.08 + 0.92 * Math.pow(lam, 0.9);
        const rim = Math.pow(1 - nz, 2.6);
        const i = (py * S + px) * 4;
        d[i] = Math.min(255, col[0] * shade + 80 * rim);
        d[i + 1] = Math.min(255, col[1] * shade + 190 * rim);
        d[i + 2] = Math.min(255, col[2] * shade + 255 * rim);
        // soft anti-aliased limb
        d[i + 3] = d2 > 0.985 ? Math.max(0, (1 - d2) / 0.015) * 255 : 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [rotation, freeze, res]);

  return (
    <div
      style={{
        position: 'absolute',
        width: diameter,
        height: diameter,
        borderRadius: '50%',
        boxShadow: `0 0 ${diameter * 0.08}px ${diameter * 0.02}px rgba(90,200,255,0.35), 0 0 ${diameter * 0.25}px rgba(40,140,255,0.25)`,
        ...style,
      }}
    >
      <canvas ref={ref} width={res} height={res} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
};
