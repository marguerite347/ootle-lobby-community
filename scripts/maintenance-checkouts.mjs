import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const definitions = [
  ['lobby', 'ootle-lobby-community', 'creator-hub/hub/shared/ecosystemResources.json'],
  ['workbench', 'ootle-workbench', 'apps/remix-ide/src/app/plugins/ootle/ecosystem-resources.json'],
];

// Evidence can remain in Documents while code and builds move to Developer.
// Never silently fall back to the older evidence-root/work copies.
export function maintenanceCheckouts(lobbyCheckout, workbenchCheckout) {
  return definitions.map(([name, repository, catalog]) => {
    const checkout = fs.realpathSync(name === 'lobby' ? lobbyCheckout : workbenchCheckout);
    const git = (...args) => execFileSync('git', ['-C', checkout, ...args], {encoding: 'utf8'}).trim();
    if (fs.realpathSync(git('rev-parse', '--show-toplevel')) !== checkout) {
      throw new Error(`${name}: checkout must be the repository root`);
    }
    const remote = git('remote', 'get-url', 'origin');
    const expected = `marguerite347/${repository}`;
    if (![ `https://github.com/${expected}`, `https://github.com/${expected}.git`,
      `git@github.com:${expected}`, `git@github.com:${expected}.git` ].includes(remote)) {
      throw new Error(`${name}: origin does not identify ${expected}`);
    }
    const catalogPath = path.join(checkout, catalog);
    if (!fs.realpathSync(catalogPath).startsWith(checkout + path.sep)) {
      throw new Error(`${name}: catalog resolves outside the checkout`);
    }
    return {name, checkout, repository: expected, revision: git('rev-parse', 'HEAD'),
      catalogPath, records: JSON.parse(fs.readFileSync(catalogPath, 'utf8')).records};
  });
}
