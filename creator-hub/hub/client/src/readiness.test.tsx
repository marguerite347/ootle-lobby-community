import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {ReadinessBadge} from './ui';
import type {Resource} from './api';
describe('readiness badge for imported resources',()=>{
 it('handles missing and invalid readiness without crashing Learn',()=>{
  for(const readiness of [undefined,null,42,'']) expect(renderToStaticMarkup(<ReadinessBadge r={{readiness} as unknown as Resource}/>)).toContain('Not assessed');
 });
 it('keeps known readiness labels',()=>expect(renderToStaticMarkup(<ReadinessBadge r={{readiness:'runnable-example'} as Resource}/>)).toContain('runnable example'));
});
