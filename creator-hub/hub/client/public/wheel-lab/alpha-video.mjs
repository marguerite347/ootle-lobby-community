/** Codec playback alone does not imply alpha support: WebKit needs HEVC alpha. */
export function selectAlphaVideoSource({userAgent, canPlayType}, {webm, hevc}) {
  const webKit = /AppleWebKit\//.test(userAgent) && !/(?:Chrome|Chromium|Edg|OPR)\//.test(userAgent);
  const type = webKit ? 'video/mp4; codecs="hvc1"' : 'video/webm; codecs="vp9"';
  return canPlayType(type) ? (webKit ? hevc : webm) : null;
}
