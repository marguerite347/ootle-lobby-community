import {readFileSync} from 'node:fs';

const logUrl = new URL('../content/creator-insights.json', import.meta.url);
export function readInsightLog() {
  return JSON.parse(readFileSync(logUrl, 'utf8'));
}

export function weeklyIdeas(log = readInsightLog(), now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const monday = new Date(`${today}T00:00:00Z`);
  monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
  const weekOf = monday.toISOString().slice(0, 10);
  const next = new Date(monday);
  next.setUTCDate(next.getUTCDate() + 7);
  const goals = log.goals.filter(goal => goal.active);
  const activeGoals = new Set(goals.map(goal => goal.id));
  const eligible = log.entries.filter(entry => entry.status === 'reviewed' &&
    entry.reviewedAt <= today && entry.expiresAt >= today &&
    entry.goalIds.some(id => activeGoals.has(id)));
  // Rotate predictably without paid generation or changing suggestions on each refresh.
  const weekNumber = Math.floor(monday.getTime() / (7 * 86400000));
  const offset = eligible.length ? weekNumber % eligible.length : 0;
  const ordered = [...eligible.slice(offset), ...eligible.slice(0, offset)].slice(0, 3);
  const ideas = ordered.map(entry => {
    const goalTitles = goals.filter(goal => entry.goalIds.includes(goal.id)).map(goal => goal.title);
    const brief = `WEEKLY CHALLENGE DRAFT · Week of ${weekOf}\n\n${entry.title}\n\nWhy: ${entry.question}\nEcosystem goals: ${goalTitles.join('; ')}\n\nBuild: ${entry.build}\n\nSuccess: ${entry.success}\n\nSubmit: an editable project, a working demo or usable resource, and a short explanation of what changed.\n\nEvidence: ${entry.sourceUrl}\nReviewed: ${entry.reviewedAt}\nValidate technical claims against current official Tari/Ootle documentation. This is a proposal, not a published challenge or funded reward.`;
    return {...entry, goalTitles, brief};
  });
  return {weekOf, nextWeek: next.toISOString().slice(0, 10), cadence:'Monday 00:00 UTC',
    mode:'Curated insight log; no live New Lore feed', goals, ideas,
    lastReviewedAt: log.entries.filter(entry => entry.status === 'reviewed' && entry.reviewedAt <= today).map(entry => entry.reviewedAt).sort().at(-1) || null};
}

export function insightSource() {
  const summary = weeklyIdeas();
  return {id:'new-lore-insights',name:'New Lore · creator insight log',kind:'manual',
    canonicalUrl:'https://newlore.ai/tari',native:false,recordCount:0,
    freshness:summary.ideas.length ? 'provisional' : 'stale',lastSuccessAt:null,lastAttemptAt:null,
    ingestion:'Reviewed public questions and creator goals drive weekly challenge proposals on Create. The saved log is read on refresh; no authenticated feed or paid generation.',
    note:`Last editorial review: ${summary.lastReviewedAt || 'none'}. Weekly rotation: Monday 00:00 UTC. Entries expire individually. Source review is manual; scheduled rotation does not discover new New Lore content.`};
}
