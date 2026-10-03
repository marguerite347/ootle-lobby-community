import {readFileSync} from 'node:fs';
import {renderBlockers} from '../shared/productionReview.mjs';
const state=JSON.parse(readFileSync(process.argv[2], 'utf8'));
const blockers=renderBlockers(state.productionReview);
if(blockers.length) {console.error(blockers.join('\n'));process.exit(1);}
console.log('Creative prerequisites recorded. This is not provider spending authorization or final-cut acceptance.');
