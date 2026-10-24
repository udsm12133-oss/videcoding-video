import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Snow } from './components/Snow';
import { Frost, GlitchCuts, Grain, ImpactFlash, Scanlines, Shake, Vignette } from './components/Overlays';
import { HUD } from './components/HUD';
import { Subtitles } from './components/Type';
import { Collapse, Freeze, Hook, Question } from './scenes/Intro';
import { Food, Water } from './scenes/Data';
import { Compare, ShelterScene, Verdict } from './scenes/Outro';
import { TL } from './lib';
import { C } from './theme';

const SCENES: Record<string, React.FC> = {
  hook: Hook,
  freeze: Freeze,
  collapse: Collapse,
  question: Question,
  food: Food,
  water: Water,
  shelter: ShelterScene,
  compare: Compare,
  verdict: Verdict,
};

// global snow layer, keyed to the story
const snowAt = (f: number) =>
  interpolate(
    f,
    [0, 60, 200, 230, 360, 380, 510, 530, 780, 990, 992, 1348, 1352, 1590, 1592],
    [0.7, 0.3, 0.35, 0.8, 0.8, 0.6, 0.25, 0.2, 0.3, 0.3, 0, 0, 0.2, 0.2, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
const windAt = (f: number) => (f < 360 ? 1.4 : f < 510 ? 2.4 : 1);
const frostAt = (f: number) =>
  interpolate(f, [0, 40, 150, 210, 360, 510, 1590, 1755, 1775], [0.5, 0.35, 0.75, 0.75, 0.85, 0.45, 0.45, 0.4, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const IceAge: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.void, overflow: 'hidden' }}>
      <Shake>
        {TL.scenes.map((s) => {
          const S = SCENES[s.id];
          return (
            <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from} name={s.id}>
              <S />
            </Sequence>
          );
        })}
        <Snow intensity={snowAt(frame)} wind={windAt(frame)} seed={3} />
      </Shake>
      <Frost amount={frostAt(frame)} />
      <HUD />
      <Subtitles />
      <GlitchCuts />
      <ImpactFlash />
      <Scanlines />
      <Vignette />
      <Grain />
      {withAudio && <Audio src={staticFile('soundtrack.wav')} />}
    </AbsoluteFill>
  );
};
