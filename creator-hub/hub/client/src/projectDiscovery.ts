import type {Project} from './api';

/** A direct Play target exists only for this project's own registered release. */
export function playableRelease(project: Project) {
  const release = project.release;
  if (!release?.playUrl) return null;
  if (project.forkedFrom && release.projectId !== project.id) return null;
  return release;
}

export function publishedProjects(items:Project[]){return items.filter(p=>p.release&&(!p.forkedFrom||p.release.projectId===p.id)).sort((a,b)=>(b.publishedAt||b.createdAt).localeCompare(a.publishedAt||a.createdAt));}
/** Lobby Games tab: published originals first, then community remixes, each newest first. */
export function lobbyGameSections(items:Project[]){
  const published=publishedProjects(items).filter(project=>playableRelease(project)!==null);
  return {originals:published.filter(p=>!p.forkedFrom), remixes:published.filter(p=>p.forkedFrom)};
}
export function trendingProjects(items:Project[]){return publishedProjects(items).filter(p=>(p.recentActivity||0)>=3).sort((a,b)=>(b.recentActivity||0)-(a.recentActivity||0));}

const LOCAL_PLAY_PATH = /^\/games\//;

/** Hub-hosted play path (relative `/games/…`). */
export function isLocalPlayUrl(playUrl: string): boolean {
  if (!playUrl) return false;
  try {
    if (playUrl.startsWith('/')) return LOCAL_PLAY_PATH.test(playUrl.split(/[?#]/, 1)[0]);
    const u = new URL(playUrl, 'http://local.invalid');
    // Absolute http(s) with a real host is not a relative Hub path.
    if ((u.protocol === 'http:' || u.protocol === 'https:') && u.hostname !== 'local.invalid') {
      return false;
    }
    return LOCAL_PLAY_PATH.test(u.pathname);
  } catch {
    return false;
  }
}

/**
 * Attach ?project= for Lobby→play lineage.
 * - Absolute external-origin URLs: return unchanged (never pathname-only rewrite).
 * - Local `/games/…` (relative): set project query; return path+search+hash.
 */
export function playUrlWithProject(playUrl: string, projectId: string): string {
  if (!playUrl || !projectId) return playUrl;
  try {
    const u = new URL(playUrl, 'http://local.invalid');
    const absoluteExternal =
      (u.protocol === 'http:' || u.protocol === 'https:') && u.hostname !== 'local.invalid';
    if (absoluteExternal) return playUrl;
    if (!LOCAL_PLAY_PATH.test(u.pathname)) return playUrl;
    if (!u.searchParams.get('project')) u.searchParams.set('project', projectId);
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return playUrl;
  }
}

/** Safe Hub project id from ?project= (reject path traversal / odd chars). */
export function validatedProjectQueryId(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const id = raw.trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(id)) return null;
  if (id.length > 128) return null;
  return id;
}
