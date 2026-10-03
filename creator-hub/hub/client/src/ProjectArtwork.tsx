import type React from 'react';
import type {Project} from './api';

// Original cover art is deliberately distinct from recorded gameplay.
export function ProjectArtwork({project}: {project: Project}) {
  if (project.id === 'tari-creator-hub-make-something-yours-4cee7c') {
    return <div className="project-art film-art" role="img" aria-label="Make Something Yours: a cinematic title treatment over an editing timeline">
      <div className="film-orbit" aria-hidden="true"/>
      <div className="film-title"><small>TARI / CREATOR FILM</small><strong>MAKE<br/>SOMETHING<br/><em>YOURS.</em></strong></div>
      <div className="film-timeline" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>
      <span className="art-caption">Editable film · work in progress</span>
    </div>;
  }
  return <ProjectShader project={project}/>;
}

function hueOf(id: string) { let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360; return h; }

// No cover yet: the same animated shader fallback resource cards use, with the real title.
function ProjectShader({project}: {project: Project}) {
  const playable = Boolean(project.release?.playUrl);
  return <div className="media media-ph media-shader project-shader" style={{'--ph-hue': hueOf(project.id)} as React.CSSProperties} role="img" aria-label={`${project.title} · no cover yet`}>
    <span className="media-ph-glyph" aria-hidden="true">{playable ? '▶' : '✧'}</span>
    <span className="media-ph-title">{project.title}</span>
  </div>;
}
