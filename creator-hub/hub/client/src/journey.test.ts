import {expect,test} from 'vitest';
import {primaryNavigation,legacyDestination} from './journey';
test('one canonical creation entry with distinct discovery, learning and projects',()=>{
 expect(primaryNavigation.map(l=>l.to)).toEqual(['/games','/explore','/learn','/skills','/challenges','/create','/projects']);
});
test('legacy links retain chosen templates and discovery filters',()=>{
 expect(legacyDestination('/studio','?template=tari%3Acounter')).toBe('/create/project?template=tari%3Acounter');
 expect(legacyDestination('/studio','')).toBe('/projects');
 expect(legacyDestination('/build','?ecosystem=tari-ootle')).toBe('/explore?ecosystem=tari-ootle');
 expect(legacyDestination('/build','')).toBe('/explore?type=starter');
 expect(legacyDestination('/onboarding/first-template','')).toBe('/create/goal/first-template');
 expect(legacyDestination('/recipe/token-rewarded-counter','')).toBe('/create/recipe/token-rewarded-counter');
});

test('general onboarding opens Lobby Games and preserves query parameters',()=>{
 expect(legacyDestination('/onboarding','')).toBe('/games');
 expect(legacyDestination('/onboarding','?from=invite')).toBe('/games?from=invite');
});
