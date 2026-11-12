import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {expect,test} from 'vitest';
import NetworkProjects from './NetworkProjects';
import LaunchCountdown from './LaunchCountdown';
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

test('the default view puts confirmed apps before the mainnet watch without hiding available apps',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><NetworkProjects/></MemoryRouter>);
 expect(html.indexOf('id="network-confirmed-title"')).toBeLessThan(html.indexOf('id="network-watch-title"'));
 const confirmed=html.slice(html.indexOf('id="network-confirmed-title"'),html.indexOf('id="network-watch-title"'));
 for(const name of ['OotleAccord','Skydrop','Veil Ootle Explorer','Sapient','Signal Desk','Sealed Bids at Midnight'])expect(confirmed).toContain(name);
 for(const name of ['MoonMail','HideBox','Grave Robber'])expect(confirmed).not.toContain(`>${name}</a>`);
 expect(html.match(/class="network-project"/g)).toHaveLength(14);
 expect(html).toContain('Sandbox game');expect(html).toContain('Office pending');
 expect(html).toContain('Get latest extension');expect(html).toContain('Chrome Web Store: 0.9.6');
 expect(html).toContain('href="https://chromewebstore.google.com/detail/tari-ootle-wallet/demkeckolenopkgnfbnpflkpbbdhpgkl"');
 expect(html).not.toContain('releases/download/');
});
test('network filters keep pending apps out of confirmed mainnet and preserve testnet destinations',()=>{
 const mainnet=renderToStaticMarkup(<MemoryRouter><NetworkProjects initialNetwork="mainnet"/></MemoryRouter>);
 expect(mainnet.match(/class="network-project"/g)).toHaveLength(6);
 expect(mainnet).toContain('Open source');expect(mainnet).toContain('unrevealed bids forfeit bonds permanently');expect(mainnet).toContain('Mainnet evidence');expect(mainnet.slice(0,mainnet.indexOf('id="mainnet-templates"'))).not.toContain('>MoonMail</a>');
 const watch=renderToStaticMarkup(<MemoryRouter><NetworkProjects initialNetwork="watch"/></MemoryRouter>);
 expect(watch.match(/class="network-project"/g)).toHaveLength(8);
 expect(watch).toContain('>MoonMail</a>');expect(watch).not.toContain('>OotleAccord</a>');
 const testnet=renderToStaticMarkup(<MemoryRouter><NetworkProjects initialNetwork="testnet"/></MemoryRouter>);
 expect(testnet).toContain('href="https://testnet-explorer.tari.mw/"');
 expect(testnet).not.toContain('href="https://explorer.tari.mw/"');
 expect(testnet).not.toContain('>Skydrop</a>');expect(testnet).not.toContain('Grave Robber');
});

test('the header reflects reviewed mainnet evidence instead of the expired launch countdown',()=>{
 const html=renderToStaticMarkup(<LaunchCountdown/>);
 expect(html).toContain('Mainnet live');expect(html).toContain('href="#mainnet"');
 expect(html).not.toContain('Launching soon');expect(html).not.toContain('planned launch');
});

 test('published templates stay separate from live apps and never promote MoonMail',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><NetworkProjects/></MemoryRouter>);
 const templateStart=html.indexOf('id="mainnet-templates"');
 expect(templateStart).toBeGreaterThan(html.indexOf('id="network-watch-title"'));
 const templates=html.slice(templateStart);
 expect(templates).toContain('Published mainnet templates');
 expect(templates.match(/aria-label="View .*? template definition"/g)).toHaveLength(16);
 for(const name of ['MoonMail','SignalDesk','SignalForecasts','SignalFollows','SapientEscrow','TipPolicy','BurnRateGovernance'])expect(templates).toContain(name);
 expect(templates).toContain('does not confirm that an app or every feature is working');
 expect(templates).not.toContain('class="network-project"');
 expect(templates).not.toContain('Open app');
 const mainnet=renderToStaticMarkup(<MemoryRouter><NetworkProjects initialNetwork="mainnet"/></MemoryRouter>);
 const apps=mainnet.slice(0,mainnet.indexOf('id="mainnet-templates"'));
 expect(apps).toContain('>Signal Desk</a>');
 expect(apps).not.toContain('>MoonMail</a>');
 const testnet=renderToStaticMarkup(<MemoryRouter><NetworkProjects initialNetwork="testnet"/></MemoryRouter>);
 expect(testnet).not.toContain('Published mainnet templates');
 });
