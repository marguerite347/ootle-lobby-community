import {describe, it, expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {QuestProgress, CreatorPath} from './GameKit';
describe('game presentation boundaries', () => {
  it('bounds invalid API counts and targets without emitting NaN', () => {
    for (const value of [NaN, Infinity, -5]) {
      const html = renderToStaticMarkup(<QuestProgress value={value} target={0} label="Verified"/>);
      expect(html).toContain('value="0"');
      expect(html).toContain('max="1"');
      expect(html).not.toContain('NaN');
    }
  });
  it('caps progress and names its accessible measure', () => {
    const html = renderToStaticMarkup(<QuestProgress value={9} target={5} label="Verified contributions"/>);
    expect(html).toContain('aria-label="Verified contributions"');
    expect(html).toContain('value="5"');
  });
  it('identifies only the current step', () => {
    const html = renderToStaticMarkup(<CreatorPath current={1}/>);
    expect(html.match(/aria-current="step"/g)).toHaveLength(1);
  });
});
