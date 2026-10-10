#!/usr/bin/env node
// Enumerate existing entries for daily source review. No fetches or success-date writes.
import {readFileSync,readdirSync} from 'node:fs';
import {catalogReviewQueue} from '../creator-hub/hub/server/sourceMonitoring.mjs';
const root=new URL('../',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const args=process.argv.slice(2);
if(args.length && (args[0]!=='--workbench-catalog'||args.length!==2)) throw Error('Usage: node scripts/review-catalog.mjs [--workbench-catalog /path/to/ecosystem-resources.json]');
const september=read('creator-hub/hub/data/contests/september-2026.json').entries;
const submissionFolders=readdirSync(new URL('content/submissions/',root),{withFileTypes:true}).filter(item=>item.isDirectory()).map(item=>`submissions/${item.name}`);
const entries=['projects','community-projects',...submissionFolders].flatMap(folder=>readdirSync(new URL(`content/${folder}/`,root)).filter(f=>f.endsWith('.json')).map(f=>{const entry=read(`content/${folder}/${f}`);return {...september.find(x=>x.id===entry.id),...entry};}));
const catalog=read('creator-hub/hub/shared/ecosystemResources.json');
entries.push(...catalog.records,...catalog.opportunities);
if(args.length){const wb=JSON.parse(readFileSync(args[1],'utf8'));entries.push(...wb.records,...wb.opportunities);}
const ledger=read('docs/ecosystem-source-registry.json');
console.log(JSON.stringify({schemaVersion:1,scope:'Existing catalog entries, independent of feed lookback; no source reads performed by this command',resources:catalogReviewQueue(entries,ledger.resourceReviews||{})},null,2));
