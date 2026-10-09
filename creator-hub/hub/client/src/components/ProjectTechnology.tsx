import {safeHref} from '../../../shared/safeLinks.mjs';
import technology from './septemberProjectTechnology.json';
import './ProjectTechnology.css';

type TechnologyLabel = {label: string; sourceUrl: string};
const projectTechnology: Record<string, TechnologyLabel[]> = technology;

// Source inspected 2026-10-03. Links pin the reviewed revisions; they describe
// implementations, not deployment status or the exact September release.
export default function ProjectTechnology({resourceId, labels = projectTechnology[resourceId]}: {resourceId: string; labels?: TechnologyLabel[]}) {
  if (!labels) return null;
  return <div className="project-technology" aria-label="Templates and Tari components">
    <span className="project-technology-heading">Built with</span>
    <div className="project-technology-labels">{labels.map(({label, sourceUrl}) =>
      <a key={label} href={safeHref(sourceUrl)} target="_blank" rel="noreferrer" title={`View source for ${label}`}>{label}</a>
    )}</div>
  </div>;
}
