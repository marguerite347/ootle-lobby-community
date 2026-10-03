import React from 'react';
import type { z } from 'zod';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background, ContentFrame, KindBadge, CtaCard, fontFamily, appear, useAppear } from '../components/base';
import { BRAND } from '../brand.mjs';
import { templateWalkthroughSchema } from '../schemas.mjs';

type Props = z.infer<typeof templateWalkthroughSchema>;

export const TemplateWalkthrough: React.FC<Props> = ({ componentName, whatItDoes, steps, remixLabel, accent, background, meta }) => {
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
          <div style={{ opacity: headIn, transform: `translateY(${interpolate(headIn, [0, 1], [40, 0])}px)` }}>
            <div style={{ color: accent, fontSize: isWide ? 30 : 34, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
              Tari template
            </div>
            <h1 style={{ margin: '6px 0 0', color: BRAND.colors.cloud, fontSize: isWide ? 84 : 96, lineHeight: 1.02, fontWeight: 800 }}>
              {componentName}
            </h1>
            {whatItDoes ? (
              <p style={{ marginTop: 18, color: `${BRAND.colors.cloud}d9`, fontSize: isWide ? 36 : 42, maxWidth: isWide ? '72%' : '100%' }}>
                {whatItDoes}
              </p>
            ) : null}
          </div>

          <ol style={{ marginTop: 36, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {steps.map((s, i) => {
              const a = appear(frame, fps, 14 + i * 8);
              return (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: a, transform: `translateX(${interpolate(a, [0, 1], [-30, 0])}px)` }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: `${BRAND.colors.cloud}14`,
                      border: `2px solid ${accent}`,
                      color: BRAND.colors.cloud,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 24,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ color: BRAND.colors.cloud, fontSize: isWide ? 36 : 40, fontWeight: 500 }}>{s}</span>
                </li>
              );
            })}
          </ol>
        </Sequence>
      </ContentFrame>

      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'flex-start', padding: pad }}>
        <CtaCard label={remixLabel} footer={meta.destinationUrl || undefined} accent={accent} appear={ctaIn} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
