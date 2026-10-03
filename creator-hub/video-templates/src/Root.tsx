import { AlbumArt } from './compositions/AlbumArt';
import { DiscoveryCover } from './compositions/DiscoveryCover';
import React from 'react';
import type { z } from 'zod';
import { Composition } from 'remotion';
import { AppSpotlight } from './compositions/AppSpotlight';
import { TemplateWalkthrough } from './compositions/TemplateWalkthrough';
import { CommunityUpdate } from './compositions/CommunityUpdate';
import { AppCover } from './compositions/AppCover';
import { appCoverSchema, appSpotlightSchema, communityUpdateSchema, templateWalkthroughSchema } from './schemas.mjs';
import { FPS, dimsFor } from './format.mjs';
import { BRAND } from './brand.mjs';

// One template renders to any social size: `format` drives width/height, and
// `durationInSeconds` drives durationInFrames — both via calculateMetadata.
const metadataFrom = ({ props }: { props: { format: '9:16' | '16:9' | '1:1'; durationInSeconds: number } }) => ({
  ...dimsFor(props.format),
  durationInFrames: Math.round(props.durationInSeconds * FPS),
  fps: FPS,
});

const shared = { format: '9:16' as const, accent: BRAND.colors.green, durationInSeconds: 12, background: { type: 'brand' as const, src: '', kind: 'demo' as const, scrim: 0.45 }, meta: {} };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="AlbumArt" component={AlbumArt} width={640} height={360} fps={24} durationInFrames={96} defaultProps={{title:"Airdrop Template"}} />
      <Composition id="DiscoveryCover" component={DiscoveryCover} width={640} height={360} fps={24} durationInFrames={96} defaultProps={{title:'Creator resource',kind:'starter',ecosystem:'Tari Ootle',variant:0}} />
      <Composition
        id="AppSpotlight"
        component={AppSpotlight}
        schema={appSpotlightSchema}
        defaultProps={{ ...shared, appName: 'Ootle App', tagline: 'A preview layout for your verified app footage.', benefits: ['Explain the use case', 'Show the working feature', 'Link to the project'], ctaLabel: 'Try it' } as z.infer<typeof appSpotlightSchema>}
        fps={FPS}
        durationInFrames={FPS * 12}
        width={1080}
        height={1920}
        calculateMetadata={metadataFrom}
      />
      <Composition
        id="TemplateWalkthrough"
        component={TemplateWalkthrough}
        schema={templateWalkthroughSchema}
        defaultProps={{ ...shared, componentName: 'Counter + Token', whatItDoes: 'Illustrative composition; validate the adapter before use.', steps: ['Pick the counter template', 'Add a fungible token', 'Configure and preview', 'Export a remixable recipe'], remixLabel: 'Riff this template' } as z.infer<typeof templateWalkthroughSchema>}
        fps={FPS}
        durationInFrames={FPS * 12}
        width={1080}
        height={1920}
        calculateMetadata={metadataFrom}
      />
      <Composition
        id="CommunityUpdate"
        component={CommunityUpdate}
        schema={communityUpdateSchema}
        defaultProps={{ ...shared, headline: 'This week in Ootle Lobby', items: [{ label: 'Example: proposed counter recipe', note: 'recipe' }, { label: 'Contributor spotlight: astra', note: 'review' }, { label: 'TariSkills added to Learn', note: 'skills' }], ctaLabel: 'See what is new' } as z.infer<typeof communityUpdateSchema>}
        fps={FPS}
        durationInFrames={FPS * 12}
        width={1080}
        height={1920}
        calculateMetadata={metadataFrom}
      />
      <Composition
        id="AppCover"
        component={AppCover}
        schema={appCoverSchema}
        defaultProps={{ name: 'SOOON FUN', category: 'Markets & DeFi', status: 'Testnet', format: '1:1' as const, durationInSeconds: 4 } as z.infer<typeof appCoverSchema>}
        fps={FPS}
        durationInFrames={FPS * 4}
        width={1080}
        height={1080}
        calculateMetadata={metadataFrom}
      />
    </>
  );
};
