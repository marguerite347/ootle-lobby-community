import {requireLinkHost} from './safeLinks.mjs';
import {validateCommunityProjects} from './communityProjects.mjs';
import {validateContests} from './contestContentValidation.mjs';
const FIELDS = ['id', 'title', 'summary','cardSummary','cardStatus', 'technologies'];
function text(value, label, max) {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[<>\u0000-\u0008]/.test(value)) {
    throw new Error(`${label} must be nonempty plain text, at most ${max} characters.`);
  }
}
function keys(value, allowed, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !allowed.includes(key))) {
    throw new Error(`${label} contains unsupported fields.`);
  }
}
export function validateProjects(projects) {
  if (!Array.isArray(projects) || projects.length < 1 || projects.length > 100) throw new Error('Expected 1–100 projects.');
  const ids = new Set();
  for (const project of projects) {
    keys(project, FIELDS, 'Project');
    text(project.id, 'Project id', 100);
    if (!/^tari-ootle:app:[a-z0-9-]+$/.test(project.id) || ids.has(project.id)) throw new Error('Invalid or duplicate project id.');
    ids.add(project.id);
    text(project.title, 'Title', 100);
    text(project.summary, 'Summary', 1500);if(project.cardSummary!==undefined)text(project.cardSummary,'Card summary',160);if(project.cardStatus!==undefined)text(project.cardStatus,'Card status',80);
    if (!Array.isArray(project.technologies) || project.technologies.length < 1 || project.technologies.length > 6) throw new Error('Expected 1–6 technology labels.');
    const labels = new Set();
    for (const technology of project.technologies) {
      keys(technology, ['label', 'sourceUrl'], 'Technology');
      text(technology.label, 'Technology label', 60);
      text(technology.sourceUrl, 'Source URL', 1500);
      requireLinkHost(technology.sourceUrl);
      const url = new URL(technology.sourceUrl);
      if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Source links must use HTTPS without credentials.');
      if (labels.has(technology.label)) throw new Error('Duplicate technology label.');
      labels.add(technology.label);
    }
  }
  return projects;
}
export function validateFeed(feed) {
  if (feed?.schemaVersion !== 1 || !/^[0-9a-f]{40}$/.test(feed.revision || '') || !Number.isFinite(Date.parse(feed.publishedAt))) throw new Error('Invalid content feed metadata.');
  validateProjects(feed.projects);
  if (feed.contests !== undefined) validateContests(feed.contests);
  if (feed.communityProjects !== undefined) validateCommunityProjects(feed.communityProjects);
  return feed;
}
