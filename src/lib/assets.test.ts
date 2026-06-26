import { describe, it, expect } from 'vitest';
import { assetUrl, portraitCandidates, spriteUrl } from './assets';

describe('asset URLs', () => {
  it('builds base-relative paths (default base "/")', () => {
    expect(assetUrl('data/characters.json')).toBe('/data/characters.json');
    expect(assetUrl('/data/characters.json')).toBe('/data/characters.json');
  });

  it('portrait candidates prefer webp, then png', () => {
    const c = portraitCandidates('chrom');
    expect(c).toEqual([
      '/assets/portraits/chrom.webp',
      '/assets/portraits/chrom.png',
    ]);
  });

  it('sprite url is a single png keyed by id', () => {
    expect(spriteUrl('lucina')).toBe('/assets/sprites/lucina.png');
  });
});
