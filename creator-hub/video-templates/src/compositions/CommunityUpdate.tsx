import React from 'react';
import type { z } from 'zod';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background, ContentFrame, KindBadge, CtaCard, fontFamily, appear, useAppear } from '../components/base';
import { BRAND } from '../brand.mjs';
import { communityUpdateSchema } from '../schemas.mjs';

type Props = z.infer<typeof communityUpdateSchema>;

export const CommunityUpdate: React.FC<Props> = ({ headline, items, ctaLabel, accent, background, meta }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames, fps } = useVideoConfig();
  const isWide = width >= 1600;
  const pad = Math.round(Math.min(width, height) * 0.075);

  const headIn = useAppear(0);
  const ctaStart = Math.max(0, durationInFrames - Math.round(fps * 2.4));
  const ctaIn = useAppear(ctaStart, 18);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Background type={background.type} src={background.src} scrim={background.scrim} accent={accent} />
      <KindBadge kind={background.kind} pad={pad} />

      <ContentFrame pad={pad}>
        <Sequence layout="none">
          <h1
            style={{
              margin: 0,
              color: BRAND.colors.cloud,
              fontSize: isWide ? 84 : 92,
              lineHeight: 1.03,
              fontWeight: 800,
              opacity: headIn,
              transform: `translateY(${interpolate(headIn, [0, 1], [40, 0])}px)`,
            }}
          >
            {headline}
          </h1>

          <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {items.map((it, i) => {
              const a = appear(frame, fps, 14 + i * 8);
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 18,
                    padding: '16px 20px',
                    borderRadius: 14,
                    background: `${BRAND.colors.cloud}0f`,
                    borderLeft: `6px solid ${accent}`,
                    opacity: a,
                    transform: `translateY(${interpolate(a, [0, 1], [24, 0])}px)`,
                  }}
                >
                  <span style={{ color: BRAND.colors.cloud, fontSize: isWide ? 36 : 40, fontWeight: 600 }}>{it.label}</span>
                  {it.note ? <span style={{ color: accent, fontSize: isWide ? 28 : 30, fontWeight: 700 }}>{it.note}</span> : null}
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
