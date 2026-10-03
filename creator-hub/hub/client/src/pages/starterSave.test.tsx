import {describe, expect, it} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import type {Resource} from '../api';
import {ResourceCard} from '../ui';
import {StarterSaveButton} from './Onboarding';
import {saveProjectButtonLabel, starterProjectPath, threeDimensionalShelfLabel} from '../../../shared/starterShelf.mjs';

const threeDimensionalStarter = {
  id: 'gdevelop:starter:3d-bomber-bunny',
  type: 'starter',
  ecosystem: 'gdevelop',
  native: false,
  title: '3d Bomber Bunny',
  summary: 'GDevelop example',
  tags: ['gdevelop', '3d'],
  starterDimension: '3d',
  readiness: 'runnable-example',
  creator: null,
} as Resource;

describe('starter save CTA', () => {
  it('names the project-record screen and keeps the save route', () => {
    const title = '360° Platformer';
    const templateId = 'gdevelop:starter:360-platformer';
    const html = renderToStaticMarkup(
      <StarterSaveButton title={title} templateId={templateId} onNavigate={() => {}} />,
    );
    expect(saveProjectButtonLabel(title)).toBe('Save project from 360° Platformer →');
    expect(html).toContain('Save project from 360° Platformer →');
    expect(html).not.toContain('Start from');
    expect(starterProjectPath(templateId)).toBe('/create/project?template=gdevelop%3Astarter%3A360-platformer');
    expect(starterProjectPath(templateId).startsWith('/create/project?template=')).toBe(true);
  });

  it('badges a kept 3D starter as 3D', () => {
    expect(threeDimensionalShelfLabel('3d')).toBe('3D');
    expect(threeDimensionalShelfLabel('2d')).toBeNull();
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ResourceCard r={threeDimensionalStarter} dimensionLabel={threeDimensionalShelfLabel('3d')} />
      </MemoryRouter>,
    );
    expect(html).toContain('>3D<');
  });
});
