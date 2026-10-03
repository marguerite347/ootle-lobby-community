// Output sizes for social destinations. One template renders to any of these.
export const FPS = 30;

export const FORMATS = {
  '9:16': { width: 1080, height: 1920 }, // TikTok / Shorts / Reels
  '16:9': { width: 1920, height: 1080 }, // YouTube / X landscape
  '1:1': { width: 1080, height: 1080 }, // square feed
};

export function dimsFor(format) {
  return FORMATS[format] || FORMATS['9:16'];
}
