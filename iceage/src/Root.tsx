import React from 'react';
import { Composition } from 'remotion';
import { IceAge } from './IceAge';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="IceAge" component={IceAge} durationInFrames={1800} fps={30} width={1080} height={1920} defaultProps={{ withAudio: true }} />
    <Composition id="IceAgePreview10s" component={IceAge} durationInFrames={300} fps={30} width={1080} height={1920} defaultProps={{ withAudio: true }} />
  </>
);
