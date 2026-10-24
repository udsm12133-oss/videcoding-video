import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { __Provider } from 'remotion';
import { IceAge } from '../src/IceAge';

const cfg = { fps: 30, width: 1080, height: 1920, durationInFrames: 1800, id: 'IceAge' };
const root = createRoot(document.getElementById('root')!);

(window as any).__setFrame = async (frame: number) => {
  flushSync(() => {
    root.render(
      <__Provider frame={frame} cfg={cfg}>
        <IceAge withAudio={false} />
      </__Provider>,
    );
  });
  await document.fonts.ready;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  return true;
};
(window as any).__ready = true;
