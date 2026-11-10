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
 const html=renderToStaticMarkup(<MemoryRouter><NetworkProjects entries={entries}/></MemoryRouter>);
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
 const mainnet=renderToStaticMarkup(<MemoryRouter><NetworkProjects entries={[both]}/></MemoryRouter>);
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
