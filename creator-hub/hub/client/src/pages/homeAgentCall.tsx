import {safeHref} from '../../../shared/safeLinks.mjs';
export const AGENT_START_HREF = '/agent-start';
export const AGENT_START_LABEL = 'Build with an agent';

export const AGENT_QUICKSTART = `Read /agent-start.md on this Hub completely before planning or coding. Use this page's full origin for all links; no private repo access is required.
Follow the first-visit checklist, site/API map, role selection and skill-reading workflow. Discover roles at /api/agent-roles and skills at /api/agent-resources; follow pagination and read full selected instructions.
Inspect available frameworks and starter capabilities before proposing the game. Show me the design plan for approval before implementation.
Verify a complete playable loop, failure and restart, then deliver the game, editable source, asset credits and a reproducible handoff through a destination I authorize.
Do not claim skills run automatically, invent publishing access, or expose management keys. Do not spend or deploy publicly without authorization.`;

export function HomeAgentLink() {
  return <a className="btn" href={safeHref(AGENT_START_HREF)}>{AGENT_START_LABEL}</a>;
}

export function HomeAgentCopy() {
  return <details className="home-agent-copy">
    <summary>Copy the agent instructions</summary>
    <pre>{AGENT_QUICKSTART}</pre>
  </details>;
}
