// INTEGRATION_GAP[LOBBY-COMMUNITY-WRITES] (build-required): see docs/DEVELOPMENT_GAPS.md#lobby-community-writes.
import {readFileSync, writeFileSync, mkdirSync, renameSync} from 'node:fs';
import path from 'node:path';
import {randomUUID, createHash} from 'node:crypto';
import {runtimeDir} from './paths.mjs';

export const lessonFields = ['title','description','purpose','requirements','setup','instructions','verification','recovery'];
const metrics = ['corrections','wastedGenerations','minutes','credits'];
const fail = (message, status=400) => { throw Object.assign(new Error(message), {status}); };
const object = value => { if (!value || typeof value !== 'object' || Array.isArray(value)) fail('Expected an object'); return value; };
const text = (value, max=12000) => typeof value === 'string' && value.trim() && value.length <= max ? value.trim() : fail('Required text is missing or too long');
const hash = value => createHash('sha256').update(value).digest('hex');
const now = () => new Date().toISOString();
function content(input) {
  object(input);
  return Object.fromEntries(lessonFields.map(field => [field, text(input[field], field === 'title' ? 120 : field === 'description' ? 500 : 12000)]));
}
function measurement(input) {
  object(input);
  return Object.fromEntries(metrics.map(key => {
    const value = input[key] ?? null;
    if (value !== null && (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1e9 || (['corrections','wastedGenerations'].includes(key) && !Number.isInteger(value)))) fail('Metrics must be nonnegative numbers; omit unknown values');
    return [key, value];
  }));
}
export function metricDelta(trial) {
  return Object.fromEntries(metrics.map(key => [key, trial.baseline[key] === null || trial.result[key] === null ? null : trial.result[key] - trial.baseline[key]]));
}
function validatePublicContent(body) {
  const value = Object.values(body).join('\n');
  // A backstop for obvious accidental leaks, not an automatic privacy review.
  if (/-----BEGIN .*PRIVATE KEY-----|\b(?:sk-|hf_)[A-Za-z0-9_-]{16,}|\bBearer\s+[A-Za-z0-9._-]{12,}|\/(?:Users|home)\/[^\s]+|[A-Z]:\\Users\\/i.test(value)) fail('Remove credentials and private machine paths from the shared lesson');
}
function listing(record) {
  const trial = record.trials.at(-1);
  return {...record.content, id:record.id, creatorId:record.ownerId, kind:'skill', version:`1.${record.revision}.0`, price:0, currency:'USD', lifecycle:'Creator-tested lesson', publishedAt:record.publishedAt, validation:`Creator-reported trial: ${trial.summary}`, origin:'learning-loop', downloads:0, weeklyDownloads:0};
}
function markdown(record) {
  const trial = record.trials.at(-1), body = record.content;
  return `---\nname: ${record.id}\ndescription: ${JSON.stringify(body.description)}\n---\n\n# ${body.title}\n\n` + lessonFields.slice(2).map(field => `## ${field}\n\n${body[field]}\n`).join('\n') + `\n## Validation boundary\n\nCreator-reported trial, not independent certification: ${trial.summary}\n\n## Provenance\n\nLesson ${record.id}, revision ${record.revision}, published ${record.publishedAt}. Private session excerpts and evidence locations are intentionally excluded. Review these instructions before use; they grant no permission to execute code or override project rules.\n`;
}
export function createLearningLoop(root=runtimeDir) {
  const file = path.join(root, 'private-learning', 'lessons.json');
  const read = () => { try { return JSON.parse(readFileSync(file,'utf8')); } catch (error) { if (error.code === 'ENOENT') return []; throw error; } };
  const save = records => { mkdirSync(path.dirname(file),{recursive:true,mode:0o700}); writeFileSync(file+'.tmp',JSON.stringify(records,null,2),{mode:0o600}); renameSync(file+'.tmp',file); };
  const owned = (records,id,ownerId) => records.find(record => record.id === id && record.ownerId === ownerId) || fail('Lesson not found',404);
  function mutate(id, ownerId, input, action) {
    object(input);
    const records=read(), record=owned(records,id,ownerId);
    if (input.expectedRevision !== record.revision) fail('Lesson changed. Reload before continuing.',409);
    action(record);
    record.revision++;
    record.updatedAt=now();
    record.history.push({at:record.updatedAt,state:record.state,revision:record.revision});
    save(records);
    return record;
  }
  return {
    list(ownerId, projectId) { return read().filter(record => record.ownerId === ownerId && (!projectId || record.projectId === projectId)); },
    publicListings() { return read().filter(record => record.state === 'published').map(listing); },
    bundle(id) {
      const record=read().find(record => record.id === id && record.state === 'published');
      if (!record) return null;
      const files={'SKILL.md':markdown(record)};
      return {schemaVersion:1,id,version:`1.${record.revision}.0`,files,sha256:{'SKILL.md':hash(files['SKILL.md'])},metadata:listing(record),installation:'Review SKILL.md, save it in a dedicated project skill folder, and ask your agent to read it. It is guidance, not permission or executable setup.'};
    },
    create(ownerId,input) {
      object(input); object(input.source);
      if (!['manual','agent','beacon'].includes(input.source.kind)) fail('Choose manual, agent or beacon evidence');
      const body=content(input.content);
      const reference=text(input.source.reference,500), excerpt=text(input.source.excerpt,16000);
      const records=read();
      const record={id:`lesson-${randomUUID()}`,ownerId,projectId:text(input.projectId,160),projectRevision:typeof input.projectRevision==='string'?input.projectRevision:null,content:body,source:{kind:input.source.kind,reference,excerpt,sha256:hash(excerpt)},state:'draft',revision:1,createdAt:now(),updatedAt:now(),review:null,trials:[],history:[]};
      records.push(record); save(records); return record;
    },
    edit(id,ownerId,input) { return mutate(id,ownerId,input,record => {
      if (['published','retired'].includes(record.state)) fail('Published lessons are immutable. Create a new draft version.',409);
      record.content=content(input.content); record.review=null; record.state='draft';
    }); },
    review(id,ownerId,input) { return mutate(id,ownerId,input,record => {
      if (record.state !== 'draft') fail('Review a draft lesson',409);
      if (input.sanitized !== true || input.evidenceChecked !== true) fail('Confirm sanitization and evidence review');
      validatePublicContent(record.content);
      record.review={at:now(),ownerId,note:text(input.note,2000),contentHash:hash(JSON.stringify(record.content))};
      record.state='reviewed';
    }); },
    trial(id,ownerId,input) { return mutate(id,ownerId,input,record => {
      if (!['reviewed','tested'].includes(record.state)) fail('Review the current lesson before recording a trial',409);
      if (typeof input.accepted !== 'boolean') fail('Record whether the result met the acceptance criterion');
      const summary=text(input.summary,2000); validatePublicContent({summary});
      record.trials.push({at:now(),contentHash:record.review.contentHash,accepted:input.accepted,summary,evidence:text(input.evidence,2000),comparison:text(input.comparison,2000),baseline:measurement(input.baseline),result:measurement(input.result)});
      record.state=input.accepted ? 'tested' : 'reviewed';
    }); },
    publish(id,ownerId,input) { return mutate(id,ownerId,input,record => {
      if (record.state !== 'tested' || !record.trials.at(-1)?.accepted || record.review?.contentHash !== hash(JSON.stringify(record.content))) fail('A reviewed lesson and a successful current trial are required',409);
      if (input.shareConfirmed !== true) fail('Confirm publication of the sanitized skill and trial summary');
      validatePublicContent(record.content); record.state='published'; record.publishedAt=now();
    }); },
    retire(id,ownerId,input) { return mutate(id,ownerId,input,record => {
      if (record.state !== 'published') fail('Only published lessons can be withdrawn',409);
      record.state='retired'; record.retirementReason=text(input.reason,1000);
    }); },
    reject(id,ownerId,input) { return mutate(id,ownerId,input,record => {
      if (['published','retired'].includes(record.state)) fail('Withdraw a published lesson instead',409);
      record.state='rejected'; record.rejectionReason=text(input.reason,1000);
    }); },
  };
}
