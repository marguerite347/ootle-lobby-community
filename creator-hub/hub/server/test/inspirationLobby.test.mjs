import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {preventProjectHosting} from '../inspirationLobby.mjs';

test('inspiration Lobby rejects every legacy creator-storage path before a handler can run', async t => {
  const app = express();
  app.use(preventProjectHosting);
  app.use((_req, res) => res.json({reachedHandler: true}));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const path of ['/api/projects', '/api/projects/example/publish', '/api/projects/example/fork', '/api/projects/example/manage-history', '/api/recipes/guessing/projects', '/api/assets', '/api/assets/example/commerce', '/api/challenges/submissions', '/API/PROJECTS/', '/api/%70rojects']) {
    const response = await fetch(origin + path, {method: 'POST'});
    assert.equal(response.status, 410, path);
    assert.equal((await response.json()).code, 'PROJECT_HOSTING_RETIRED');
  }
  for (const [method, path] of [['GET', '/api/projects'], ['GET', '/api/projects/example'], ['GET', '/api/resources'], ['POST', '/api/daily-trivia/reveal'], ['POST', '/api/recipes/guessing/export']]) {
    const response = await fetch(origin + path, {method});
    assert.equal(response.status, 200, `${method} ${path}`);
    assert.equal((await response.json()).reachedHandler, true);
  }
});
