// Exercise the packaged server, including imports, without posting or fetching
// community data. Build success alone does not prove a function can start.
import assert from 'node:assert/strict';
import app from '../api/index.mjs';
const server=app.listen(0,'127.0.0.1');
try {
  await new Promise((resolve,reject)=>{server.once('listening',resolve);server.once('error',reject);});
  const response=await fetch(`http://127.0.0.1:${server.address().port}/api/chat/capabilities`);
  assert.equal(response.status,200);
  const capabilities=await response.json();
  assert.equal(typeof capabilities.configured,'boolean');
  assert.equal(capabilities.preview,false);
  console.log('Packaged site server starts and serves chat capabilities.');
} finally {
  server.closeAllConnections();
  await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
}
