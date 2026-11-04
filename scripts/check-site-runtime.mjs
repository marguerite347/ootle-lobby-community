// Exercise the packaged server, including imports, without posting or fetching
// community data. Build success alone does not prove a function can start.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import app from '../api/index.mjs';
const server=app.listen(0,'127.0.0.1');
try {
  await new Promise((resolve,reject)=>{server.once('listening',resolve);server.once('error',reject);});
  const base=`http://127.0.0.1:${server.address().port}`;
  const response=await fetch(base+'/api/chat/capabilities');
  assert.equal(response.status,200);
  const capabilities=await response.json();
  assert.equal(typeof capabilities.configured,'boolean');
  assert.equal(capabilities.preview,false);
  const catalogResponse=await fetch(base+'/api/skill-market');
  assert.equal(catalogResponse.status,200);
  const {listings}=await catalogResponse.json();
  assert.ok(listings.length>0,'Packaged skill catalog is empty');
  for(const listing of listings){
    // The production boundary makes this a stateless export: no download event
    // or user profile is created. Exercise the same route as the download UI.
    const download=await fetch(base+`/api/skill-market/${listing.id}/download`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({visitor:'packaged-download-validation'})});
    assert.equal(download.status,200,`Packaged bundle unavailable: ${listing.id}`);
    const bundle=await download.json();
    assert.ok(Object.keys(bundle.files).length,listing.id);
    for(const [name,body] of Object.entries(bundle.files))assert.equal(createHash('sha256').update(body).digest('hex'),bundle.sha256[name],`${listing.id}/${name}`);
  }
  console.log('Packaged site server starts and serves chat capabilities.');
  console.log(`Packaged downloads verified for all ${listings.length} public skill bundles.`);
} finally {
  server.closeAllConnections();
  await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
}
