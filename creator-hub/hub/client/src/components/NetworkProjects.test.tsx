import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {expect,test} from 'vitest';
import NetworkProjects from './NetworkProjects';
import type {NetworkEntry} from '../../../shared/networkStatus.mjs';
const entries:NetworkEntry[]=[
 {ref:'tari-ootle:integration:veil',testnetUrl:'https://explorer.tari.mw/',mainnetPlan:'Deployment confirmation pending'},
 {ref:'tari-ootle:learn:atproto-identity',testnetUrl:'https://atproto.tari.mw/'},
 {ref:'community:skydrop',testnetUrl:'https://skydrop.tari.mw/'},
].map(entry=>({...entry,state:'testnet',checkedAt:'2026-11-10T14:00:00Z',evidenceUrl:'https://community.tari.com/t/example/429/1',evidence:'Testnet evidence.'}));
test('mainnet starts empty rather than relabeling a planned launch',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><NetworkProjects entries={entries} initialNetwork="mainnet"/></MemoryRouter>);
 expect(html).toContain('once deployments are confirmed');
 expect(html).not.toContain('class="network-project"');
});
test('testnet view reuses existing identities and keeps guide, plan and original-source distinctions',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><NetworkProjects entries={entries} initialNetwork="testnet"/></MemoryRouter>);
 for(const url of ['https://explorer.tari.mw/','https://atproto.tari.mw/','https://skydrop.tari.mw/'])expect(html).toContain(url);
 expect(html).toContain('Testnet only');expect(html).toContain('Guide');expect(html).toContain('Deployment confirmation pending');
 expect(html).toContain('Original post');expect(html).not.toContain('/#project-skydrop');
});
test('a confirmed multi-network entry opens the correct destination in each view',()=>{
 const both={...entries[0],state:'both' as const,mainnetUrl:'https://example.com/mainnet',testnetUrl:'https://example.com/testnet'};
 const mainnet=renderToStaticMarkup(<MemoryRouter><NetworkProjects entries={[both]} initialNetwork="mainnet"/></MemoryRouter>);
 const testnet=renderToStaticMarkup(<MemoryRouter><NetworkProjects entries={[both]} initialNetwork="testnet"/></MemoryRouter>);
 expect(mainnet).toContain('href="https://example.com/mainnet"');expect(mainnet).not.toContain('href="https://example.com/testnet"');
 expect(testnet).toContain('href="https://example.com/testnet"');expect(testnet).toContain('Mainnet + Testnet');
});
test('existing September projects use their catalog identity and current card copy',()=>{
 const entry={...entries[0],ref:'tari-ootle:app:caravel',testnetUrl:'https://example.com/caravel'};
 const html=renderToStaticMarkup(<MemoryRouter><NetworkProjects entries={[entry]} initialNetwork="testnet"/></MemoryRouter>);
 expect(html).toContain('/resource/tari-ootle%3Aapp%3Acaravel');
 expect(html).toContain('Combine an Ootle wallet');
});

test('the default launch showcase exposes all nine destinations without calling them live mainnet',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><NetworkProjects/></MemoryRouter>);
 for(const url of ['https://explorer.tari.mw/','https://sapient.tari.mw/','https://caravellabs.net/','https://skydrop.tari.mw/','https://ghostline-ui.vercel.app/play.html','https://manishmodak.github.io/ootle-lockbox/','https://grave-robber.netlify.app/','https://tari.staging.arkimals-game.com/','https://hidebox.app/'])expect(html).toContain(`href="${url}"`);
 expect(html.match(/class="network-project"/g)).toHaveLength(9);
 expect(html.match(/>Open app</g)).toHaveLength(9);
 expect(html).toContain('Sandbox game');expect(html).toContain('Simulation + Testnet');expect(html).toContain('Mainnet launch planned');
 expect(html).not.toContain('href="https://atproto.tari.mw/"');
});
test('curation never promotes launch candidates into the verified mainnet filter',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><NetworkProjects initialNetwork="mainnet"/></MemoryRouter>);
 expect(html).toContain('once deployments are confirmed');
 expect(html).not.toContain('class="network-project"');
 expect(html).toContain('Explore the launch lineup');
 const testnet=renderToStaticMarkup(<MemoryRouter><NetworkProjects initialNetwork="testnet"/></MemoryRouter>);
 expect(testnet).toContain('href="https://testnet-explorer.tari.mw/"');
 expect(testnet).not.toContain('href="https://explorer.tari.mw/"');
 expect(testnet).not.toContain('Grave Robber');
});
