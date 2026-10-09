import {safeHref} from '../../shared/safeLinks.mjs';
import type {Project} from './api';
import {ProjectCover} from './ProjectCover';
import {playableRelease, playUrlWithProject} from './projectDiscovery';

/** A local playable is an artifact this project built. A shared starter URL is not that claim. */
export function claimsLocalPlayable(project: Project) {
  const release = playableRelease(project);
  return Boolean(release && release.projectId === project.id);
}

export function ReleaseNext({project}: {project: Project}) {
  const play = playableRelease(project);
  if (play) {
    const localPlayable = claimsLocalPlayable(project);
    return <div className="panel mt16" data-shipping={localPlayable ? 'local-playable' : 'curated-play'}>
      <ProjectCover project={project}/>
      <div className="row mt16">
        <a className="btn primary" href={safeHref(playUrlWithProject(play.playUrl, project.id))}>Play {play.title} ↗</a>
        {play.sourceUrl && <a className="btn" href={safeHref(play.sourceUrl)}>View the source ↗</a>}
      </div>
      <p className="muted mt16">{localPlayable ? 'This project has its own local playable.' : 'This is a shared release.'} {play.walletStatus}</p>
    </div>;
  }
  if (project.forkedFrom) {
    return <div className="panel mt16" data-shipping="unshipped">
      <p>This fork does not have its own playable yet. Nothing is published.</p>
    </div>;
  }
  return <div className="panel mt16" data-shipping="draft">
    <p>Draft saved. Nothing published yet.</p>
  </div>;
}
