import {Pool} from 'pg';
import {communityDatabaseOptions} from '../creator-hub/hub/server/community/database.mjs';
import {createCalendarMetricsStore} from '../creator-hub/hub/server/calendarMetrics.mjs';
if(!process.env.CHAT_DATABASE_URL)throw new Error('Use the existing authorized backend database configuration.');
const pool=new Pool({...communityDatabaseOptions(),max:1,connectionTimeoutMillis:10000});
try {console.log(JSON.stringify(await createCalendarMetricsStore(pool).report(),null,2));}
finally {await pool.end();}
