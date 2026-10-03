import {describe, expect, it} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {HomeAgentCopy, HomeAgentLink} from './homeAgentCall';

describe('home agent entry', () => {
  it('links the agent guide and a site-only planning brief', () => {
    const html = renderToStaticMarkup(<><HomeAgentLink/><HomeAgentCopy/></>);
    expect(html).toContain('href="/agent-start"');
    expect(html).not.toContain('href="/agent-start.md"');
    expect(html).toContain('Build with an agent');
    expect(html).toContain('Read /agent-start.md');
    expect(html).toContain('/api/agent-roles');
    expect(html).toContain('/api/agent-resources');
    expect(html).toContain('approval before implementation');
    expect(html).toContain('management keys');
  });
});
