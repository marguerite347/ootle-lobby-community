import React from 'react';
import type { z } from 'zod';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background, ContentFrame, KindBadge, CtaCard, fontFamily, appear, useAppear } from '../components/base';
import { BRAND } from '../brand.mjs';
import { appSpotlightSchema } from '../schemas.mjs';

type Props = z.infer<typeof appSpotlightSchema>;

export const AppSpotlight: React.FC<Props> = ({ appName, tagline, benefits, ctaLabel, accent, background, meta }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames, fps } = useVideoConfig();
  const isWide = width >= 1600;
  const pad = Math.round(Math.min(width, height) * 0.075);

  const titleIn = useAppear(0);
  const ctaStart = Math.max(0, durationInFrames - Math.round(fps * 2.4));
  const ctaIn = useAppear(ctaStart, 18);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Background type={background.type} src={background.src} scrim={background.scrim} accent={accent} />
      <KindBadge kind={background.kind} pad={pad} />

      <ContentFrame pad={pad}>
        <Sequence layout="none">
          <div style={{ opacity: titleIn, transform: `translateY(${interpolate(titleIn, [0, 1], [40, 0])}px)` }}>
            <h1 style={{ margin: 0, color: BRAND.colors.cloud, fontSize: isWide ? 92 : 104, lineHeight: 1.02, fontWeight: 800 }}>
              {appName}
            </h1>
            {tagline ? (
              <p style={{ marginTop: 20, color: `${BRAND.colors.cloud}d9`, fontSize: isWide ? 38 : 44, maxWidth: isWide ? '72%' : '100%' }}>
                {tagline}
              </p>
            ) : null}
          </div>

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {benefits.map((b, i) => {
              const a = appear(frame, fps, 14 + i * 8);
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 18,
                    opacity: a,
                    transform: `translateX(${interpolate(a, [0, 1], [-30, 0])}px)`,
                  }}
                >
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: accent, flexShrink: 0 }} />
                  <span style={{ color: BRAND.colors.cloud, fontSize: isWide ? 40 : 46, fontWeight: 600 }}>{b}</span>
                </div>
              );
            })}
          </div>
        </Sequence>
      </ContentFrame>

      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'flex-start', padding: pad }}>
        <CtaCard label={ctaLabel} footer={meta.destinationUrl || undefined} accent={accent} appear={ctaIn} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
