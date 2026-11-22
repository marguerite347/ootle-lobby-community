import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {expect,test} from 'vitest';
import NetworkProjects from './NetworkProjects';
import LaunchCountdown from './LaunchCountdown';
import templateCatalogue from '../../../../../content/mainnet-templates.json';
import type {NetworkEntry} from '../../../shared/networkStatus.mjs';
const entries:NetworkEntry[]=[
 {ref:'tari-ootle:integration:veil',testnetUrl:'https://explorer.tari.mw/',mainnetPlan:'Deployment confirmation pending'},
 {ref:'tari-ootle:learn:atproto-identity',testnetUrl:'https://atproto.tari.mw/'},
 {ref:'community:skydrop',testnetUrl:'https://skydrop.tari.mw/'},
].map(entry=>({...entry,state:'testnet',checkedAt:'2026-11-10T14:00:00Z',evidenceUrl:'https://community.tari.com/t/example/429/1',evidence:'Testnet evidence.'}));
test('mainnet starts empty rather than relabeling a planned launch',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><NetworkProjects entries={entries} initialNetwork="mainnet"/></MemoryRouter>);
 expect(html).toContain('once deployments are confirmed');
 expect(html).not.toContain('class="network-project contest-hologram"');
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

test('mainnet is the default, includes every confirmed project and removes the watch',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><NetworkProjects/></MemoryRouter>);
 for(const name of ['OotleAccord','Skydrop','Veil Ootle Explorer','Sapient','Signal Desk','Sealed Bids at Midnight','Ootle Lockbox','Launch Commitments','The Cursed Pumpkin','AT Protocol identity on Ootle','Ghostline','HideBox','Private Ballot','MoonMail','Ootle Fee Check','Public Grant Ledger','Specter','Semvi','Ootle Split','Steady'])expect(html).toContain(name);
 for(const name of ['Grave Robber','StillHere','SplitBill','Seance — privacy demo','Tari Cipherseed'])expect(html.slice(0,html.indexOf('id="mainnet-templates"'))).not.toContain(`>${name}</a>`);
 expect(html).not.toContain('Mainnet watch');expect(html).not.toContain('All apps');
 expect(html.match(/class="network-project contest-hologram"/g)).toHaveLength(20);
 expect(html).toContain('Review notes');expect(html).toContain('Get latest extension');
 expect(html).toContain('href="https://chromewebstore.google.com/detail/tari-ootle-wallet/demkeckolenopkgnfbnpflkpbbdhpgkl"');
 expect(html).not.toContain('releases/download/');
});
test('network filters keep pending apps out of confirmed mainnet and preserve testnet destinations',()=>{
 const mainnet=renderToStaticMarkup(<MemoryRouter><NetworkProjects initialNetwork="mainnet"/></MemoryRouter>);
 expect(mainnet.match(/class="network-project contest-hologram"/g)).toHaveLength(20);
 expect(mainnet).toContain('Mainnet anchor template · Non-binding pilots');expect(mainnet).toContain('hosted website and browser-wallet integration are still being configured');expect(mainnet).toContain('Read guide');expect(mainnet).toContain('Open source');expect(mainnet).toContain('unrevealed bids forfeit bonds permanently');expect(mainnet).toContain('Mainnet evidence');expect(mainnet.slice(0,mainnet.indexOf('id="mainnet-templates"'))).toContain('>MoonMail</a>');
 const testnet=renderToStaticMarkup(<MemoryRouter><NetworkProjects initialNetwork="testnet"/></MemoryRouter>);
 expect(testnet).toContain('>StillHere</a>');expect(testnet).toContain('>Seance — privacy demo</a>');expect(testnet).not.toContain('>Semvi</a>');
 expect(testnet).toContain('href="https://testnet-explorer.tari.mw/"');
 expect(testnet).not.toContain('href="https://explorer.tari.mw/"');
 expect(testnet).toContain('href="https://testnet-atproto.tari.mw/"');
 expect(testnet).not.toContain('href="https://atproto.tari.mw/"');
 expect(testnet).toContain('href="https://testnet.hidebox.app/"');expect(testnet).not.toContain('href="https://hidebox.app/"');expect(testnet).not.toContain('>Skydrop</a>');expect(testnet).not.toContain('Grave Robber');
});

test('the header reflects reviewed mainnet evidence instead of the expired launch countdown',()=>{
 const html=renderToStaticMarkup(<LaunchCountdown/>);
 expect(html).toContain('Mainnet live');expect(html).toContain('href="#mainnet"');
 expect(html).not.toContain('Launching soon');expect(html).not.toContain('planned launch');
});

 test('published templates stay separate from apps with current deployment evidence',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><NetworkProjects/></MemoryRouter>);
 const templateStart=html.indexOf('id="mainnet-templates"');
 expect(templateStart).toBeGreaterThan(html.indexOf('class="grid network-project-grid"'));
 const templates=html.slice(templateStart);
 expect(templates).toContain('Published mainnet templates');
 expect(templates.match(/aria-label="View .*? template definition"/g)).toHaveLength(templateCatalogue.entries.length);
 for(const name of ['MoonMail','SignalDesk','SignalForecasts','SignalFollows','SapientEscrow','TipPolicy','BurnRateGovernance'])expect(templates).toContain(name);
 expect(templates).toContain('does not confirm that an app or every feature is working');
 expect(templates).not.toContain('class="network-project contest-hologram"');
 expect(templates).not.toContain('Open app');
 const mainnet=renderToStaticMarkup(<MemoryRouter><NetworkProjects initialNetwork="mainnet"/></MemoryRouter>);
 const apps=mainnet.slice(0,mainnet.indexOf('id="mainnet-templates"'));
 expect(apps).toContain('>Signal Desk</a>');
 expect(apps).toContain('>MoonMail</a>');
 expect(apps).not.toContain('>Grave Robber</a>');
 expect(apps).toContain('Mainnet evidence');
 const testnet=renderToStaticMarkup(<MemoryRouter><NetworkProjects initialNetwork="testnet"/></MemoryRouter>);
 expect(testnet).not.toContain('Published mainnet templates');
 });

test('source-only community links are not presented as original announcements and platform limits remain visible',()=>{
 const selected=[{...entries[0],ref:'community:ghost-lantern'},{...entries[0],ref:'community:clew'}];
 const html=renderToStaticMarkup(<MemoryRouter><NetworkProjects entries={selected} initialNetwork="testnet"/></MemoryRouter>);
 expect(html).toContain('href="https://github.com/penielgold-hub/Ghost-Lantern" target="_blank" rel="noreferrer">Source</a>');
 expect(html).toContain('macOS 14+');expect(html).toContain('Not notarized');
 expect(html).toContain('href="https://community.tari.com/t/clew-a-small-private-tari-wallet-for-mac/424" target="_blank" rel="noreferrer">Original post</a>');
});
