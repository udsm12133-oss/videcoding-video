export const C = {
  void: '#02060B',
  navy: '#061423',
  deep: '#0A2238',
  ice: '#7FD8FF',
  cyan: '#3BB8FF',
  frost: '#E8F7FF',
  dim: '#5C7A93',
  red: '#FF3B3B',
  orange: '#FF8A2A',
  ember: '#FFC15A',
};

export const F = {
  head: '"Noto Sans CJK SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
  num: '"Inter Display", "Inter", "Helvetica Neue", Arial, sans-serif',
  mono: '"JetBrains Mono", "DejaVu Sans Mono", "SF Mono", Menlo, monospace',
};

export const glow = (c: string, s = 1) =>
  `0 0 ${12 * s}px ${c}, 0 0 ${36 * s}px ${c}88, 0 4px 0 rgba(0,0,0,0.6)`;

export const SUB_Y = 1420; // centre line of the kinetic subtitles
