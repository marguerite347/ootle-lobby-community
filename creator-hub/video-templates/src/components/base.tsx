import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  AbsoluteFill,
  delayRender,
  continueRender,
  Img,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Poppins';
import { BRAND } from '../brand.mjs';
import { KIND_LABEL } from '../schemas.mjs';

export const { fontFamily } = loadFont();

type BackgroundProps = {
  type: 'brand' | 'image' | 'video';
  src: string;
  scrim: number;
  accent: string;
};

const resolveSrc = (src: string) => (/^https?:\/\//.test(src) ? src : staticFile(src));

// Deterministic brand backdrop, or a ComfyUI-generated image/clip behind a scrim.
export const Background: React.FC<BackgroundProps> = ({ type, src, scrim, accent }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const t = frame / durationInFrames;
  const glowX = interpolate(t, [0, 1], [0.25, 0.75]) * width;
  const glowY = interpolate(t, [0, 1], [0.7, 0.35]) * height;

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.colors.ink }}>
      {type === 'image' && src ? <Img src={resolveSrc(src)} style={{ width, height, objectFit: 'cover' }} /> : null}
      {type === 'video' && src ? (
        <OffthreadVideo src={resolveSrc(src)} muted style={{ width, height, objectFit: 'cover' }} />
      ) : null}
      {type === 'brand' ? (
        <>
          <AbsoluteFill
            style={{ background: `radial-gradient(circle at ${glowX}px ${glowY}px, ${BRAND.colors.purple}55, transparent 45%)` }}
          />
          <AbsoluteFill
            style={{ background: `radial-gradient(circle at ${width - glowX}px ${height - glowY}px, ${accent}22, transparent 40%)` }}
          />
        </>
      ) : (
        <AbsoluteFill style={{ backgroundColor: `rgba(4,7,35,${scrim})` }} />
      )}
    </AbsoluteFill>
  );
};

// Text-only identification, not a recreation of the official Tari logo.
export const Logo: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <div style={{ color: BRAND.colors.cloud, fontFamily, fontWeight: 700, fontSize: size * 0.5, flexShrink: 0 }}>Tari</div>
);

// Honesty label — concept/AI visuals must be distinguishable from gameplay.
export const KindBadge: React.FC<{ kind: keyof typeof KIND_LABEL; pad: number }> = ({ kind, pad }) => (
  <div
    style={{
      position: 'absolute',
      zIndex: 10,
      top: pad,
      left: pad,
      padding: '8px 16px',
      borderRadius: 999,
      border: `2px solid ${BRAND.colors.cloud}44`,
      color: BRAND.colors.cloud,
      fontSize: 24,
      fontWeight: 500,
      letterSpacing: 0.5,
    }}
  >
    {KIND_LABEL[kind]}
  </div>
);

export const CtaCard: React.FC<{ label: string; footer?: string; accent: string; appear: number }> = ({
  label,
  footer,
  accent,
  appear,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 20, maxWidth: '100%', opacity: appear, transform: `translateY(${interpolate(appear, [0, 1], [24, 0])}px)` }}>
    <Logo />
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          display: 'inline-block',
          background: accent,
          color: BRAND.colors.ink,
          fontWeight: 700,
          fontSize: 40,
          padding: '10px 22px',
          borderRadius: 12,
        }}
      >
        {label}
      </div>
      {footer ? <div style={{ color: `${BRAND.colors.cloud}aa`, marginTop: 12, fontSize: 24, overflowWrap: 'anywhere' }}>{footer}</div> : null}
    </div>
  </div>
);

// Pure spring value (not a hook) so it is safe to call inside a .map loop.
export function appear(frame: number, fps: number, delayFrames = 0, duration = 20) {
  return spring({ frame: frame - delayFrames, fps, config: { damping: 200 }, durationInFrames: duration });
}

// Hook convenience for single top-level uses.
export function useAppear(delayFrames = 0, duration = 20) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return appear(frame, fps, delayFrames, duration);
}

// Reserve badge/footer space and fit variable copy inside the remaining region.
export const ContentFrame: React.FC<{ pad: number; children: React.ReactNode }> = ({ pad, children }) => {
  const box = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [handle] = useState(() => delayRender('Measure video copy'));
  useLayoutEffect(() => {
    const measure = () => {
      if (box.current && content.current) {
        setScale(Math.min(1, box.current.clientHeight / Math.max(1, content.current.scrollHeight), box.current.clientWidth / Math.max(1, content.current.scrollWidth)));
      }
      continueRender(handle);
    };
    const observer = new ResizeObserver(measure);
    if (content.current) observer.observe(content.current);
    measure();
    return () => { observer.disconnect(); continueRender(handle); };
  }, [handle]);
  return <div ref={box} style={{ position: 'absolute', top: pad + 70, bottom: pad + 240, left: pad, right: pad, display: 'flex', alignItems: 'center' }}>
    <div ref={content} style={{ width: '100%', flexShrink: 0, transform: `scale(${scale})`, transformOrigin: 'left center', overflowWrap: 'anywhere' }}>{children}</div>
  </div>;
};
