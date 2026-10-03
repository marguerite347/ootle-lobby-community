import {unrealCreatorConnectors} from './unrealCreatorTools.mjs';
import {designReadingConnectors} from './designReading.mjs';
import {gameResourceConnectors} from './gameResourceLists.mjs';
import * as huggingface from './huggingface.mjs';
import * as ambientCG from './ambientCG.mjs';
import * as kenney from './kenney.mjs';
import * as creatorReferences from './creatorReferences.mjs';
import * as wikiApps from './wikiApps.mjs';
import * as gameStarters from './gameStarters.mjs';
import * as ootleApps from './ootleApps.mjs';
import * as ootleStarters from './ootleStarters.mjs';
import * as gdevelop from './gdevelop.mjs';
import * as luanti from './luanti.mjs';
import * as curatedCollections from './curatedCollections.mjs';
import * as assetProviders from './assetProviders.mjs';
import * as ootleEducation from './ootleEducation.mjs';
import * as polyHaven from './polyHaven.mjs';

import * as playCanvas from './playCanvas.mjs';

import * as governance from './governance.mjs';

// Ordered so native Ootle sources ingest first.
export const connectors = [ootleStarters, ootleEducation, ootleApps, gdevelop, luanti, curatedCollections, assetProviders, polyHaven, ambientCG, kenney, playCanvas, governance, gameStarters, creatorReferences, wikiApps, huggingface, ...gameResourceConnectors, ...designReadingConnectors, ...unrealCreatorConnectors];

export function connectorById(id) {
  return connectors.find((c) => c.source.id === id);
}
