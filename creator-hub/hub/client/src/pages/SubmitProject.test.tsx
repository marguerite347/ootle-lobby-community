import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {describe,it,expect} from 'vitest';
import SubmitProject from './SubmitProject';

const page=(url:string)=>renderToStaticMarkup(<MemoryRouter initialEntries={[url]}><SubmitProject/></MemoryRouter>);
describe('closed October submission path',()=>{
  it('shows a closed notice and archive link instead of a form at the old URL',()=>{
    const html=page('/submit?contest=october');
    expect(html).toContain('are closed.');
    expect(html).toContain('href="/#october-submissions"');
    expect(html).toContain('href="/challenges/november-mvp"');
    expect(html).not.toContain('<form');
    expect(html).not.toContain('Send for review');
  });
  it('keeps community and November intake available without an October option',()=>{
    for(const url of ['/submit','/submit?contest=november']){
      const html=page(url);
      expect(html).toContain('<form');
      expect(html).toContain('November MVP entry');
      expect(html).not.toContain('value="october-2026"');
    }
    expect(page('/submit?contest=november')).toContain('https://community.tari.com/t/november-build-contest-thread-mvp/520');
  });
});
