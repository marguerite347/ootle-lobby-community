import {it,expect} from 'vitest';
import {safeSkillLink} from './skillLinks';
it('resolves reference links and skips malformed or unsafe URLs',()=>{
 const base='https://hub.test/skills/start-here/';
 expect(safeSkillLink('../privacy/SKILL.md',base)).toBe('https://hub.test/skills/privacy/SKILL.md');
 for(const href of ['https://[broken','javascript:alert(1)','data:text/html,hello'])expect(safeSkillLink(href,base)).toBeNull();
});
