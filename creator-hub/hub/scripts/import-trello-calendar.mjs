// Reads a fully paginated connector snapshot on stdin. Trello remains authoritative.
import {normalizeSnapshot,writeSnapshot} from '../server/trelloSnapshot.mjs';
import {calendarItems} from '../server/marketingCalendar.mjs';
let input='';
for await(const chunk of process.stdin){input+=chunk;if(Buffer.byteLength(input)>2_000_000)throw new Error('Snapshot too large');}
const snapshot=normalizeSnapshot(JSON.parse(input));
const cards=snapshot.lists.flatMap(list=>list.cards.map(card=>({...card,idList:list.id})));
const items=calendarItems(cards,snapshot.lists);
writeSnapshot(snapshot);
console.log(JSON.stringify({cards:items.length,scheduled:items.filter(item=>item.due||item.start).length,lastSyncedAt:snapshot.syncedAt}));
