import { describe, it, expect } from 'vitest';
import { buildRoster } from './roster';
import { analyzeRelationship } from './relationship';
import type { Character, Gender, Generation } from './types';

function mk(
  id: string,
  gender: Gender,
  generation: Generation,
  marriageableWith: string[],
  extra: Partial<Character> = {}
): Character {
  return {
    id,
    name: id[0].toUpperCase() + id.slice(1),
    epithet: 'Test',
    gender,
    generation,
    source: 'base',
    defaultClass: 'Tactician',
    availableClasses: ['Tactician'],
    personality: '',
    recruitment: '',
    marriageableWith,
    tags: [],
    ...extra,
  };
}

// Minimal slice mirroring the real data's relevant edges.
const characters: Character[] = [
  mk('chrom', 'male', 1, ['sumia', 'olivia', 'robin_f']),
  mk('sumia', 'female', 1, ['chrom']),
  mk('olivia', 'female', 1, ['chrom']),
  mk('robin_f', 'female', 1, ['chrom', 'inigo', 'brady']),
];
const children: Character[] = [
  mk('lucina', 'female', 2, ['inigo', 'brady', 'morgan_m'], { fixedParentId: 'chrom' }),
  mk('inigo', 'male', 2, ['lucina', 'cynthia', 'robin_f'], { fixedParentId: 'olivia' }),
  mk('cynthia', 'female', 2, ['inigo', 'brady', 'morgan_m'], { fixedParentId: 'sumia' }),
  mk('brady', 'male', 2, ['lucina', 'cynthia', 'robin_f'], { fixedParentId: 'maribelle' }),
  mk('morgan_m', 'male', 2, ['lucina', 'cynthia'], { fixedParentId: 'robin_f' }),
];
const roster = buildRoster(characters, children);
const rel = (a: string, b: string) =>
  analyzeRelationship(roster.byId.get(a)!, roster.byId.get(b)!, roster);

describe('analyzeRelationship — parent/child', () => {
  it('Chrom + Lucina = unconditional father & daughter (bond, A)', () => {
    const r = rel('chrom', 'lucina');
    expect(r.kind).toBe('bond');
    expect(r.maxRank).toBe('A');
    expect(r.bondReason).toBe('parent-child');
    expect(r.label).toBe('Father & daughter');
    expect(r.conditions).toHaveLength(0);
  });

  it('Robin (f) + Morgan = unconditional mother & son', () => {
    const r = rel('robin_f', 'morgan_m');
    expect(r.label).toBe('Mother & son');
    expect(r.conditions).toHaveLength(0);
  });

  it('Sumia + Cynthia = unconditional mother & daughter', () => {
    expect(rel('sumia', 'cynthia').label).toBe('Mother & daughter');
  });

  it('Chrom + Cynthia = CONDITIONAL father & daughter (if Chrom ⚭ Sumia)', () => {
    const r = rel('chrom', 'cynthia');
    expect(r.kind).toBe('bond');
    expect(r.bondReason).toBe('parent-child');
    expect(r.conditions[0]).toMatchObject({ kind: 'parent-child', ifMarry: ['chrom', 'sumia'] });
  });

  it('Chrom + Inigo (both male) = conditional father & son (if Chrom ⚭ Olivia)', () => {
    const r = rel('chrom', 'inigo');
    expect(r.bondReason).toBe('parent-child');
    expect(r.conditions[0].ifMarry).toEqual(['chrom', 'olivia']);
  });

  it('Robin (f) + Lucina = conditional mother & daughter (if Robin ⚭ Chrom)', () => {
    const r = rel('robin_f', 'lucina');
    expect(r.label).toBe('Mother & daughter');
    expect(r.conditions[0].kind).toBe('parent-child');
  });
});

describe('analyzeRelationship — marriage with conditional siblings', () => {
  it('Lucina + Inigo = marriage (S), but siblings if Chrom ⚭ Olivia', () => {
    const r = rel('lucina', 'inigo');
    expect(r.kind).toBe('marriage');
    expect(r.maxRank).toBe('S');
    expect(r.conditions[0]).toMatchObject({ kind: 'siblings', ifMarry: ['chrom', 'olivia'] });
  });

  it('Lucina + Morgan = marriage, siblings if Chrom ⚭ Robin', () => {
    const r = rel('lucina', 'morgan_m');
    expect(r.kind).toBe('marriage');
    expect(r.conditions[0].ifMarry).toEqual(['chrom', 'robin_f']);
  });

  it('Cynthia + Inigo = plain marriage (different mothers → never siblings)', () => {
    const r = rel('cynthia', 'inigo');
    expect(r.kind).toBe('marriage');
    expect(r.conditions).toHaveLength(0);
  });

  it('Robin (f) + Inigo = marriage (Robin can marry a child who isn’t hers)', () => {
    expect(rel('robin_f', 'inigo').kind).toBe('marriage');
  });
});

describe('analyzeRelationship — siblings & no-support', () => {
  it('Lucina + Cynthia (both female) = conditional sisters if Chrom ⚭ Sumia', () => {
    const r = rel('lucina', 'cynthia');
    expect(r.kind).toBe('bond');
    expect(r.bondReason).toBe('siblings');
    expect(r.label).toBe('Sisters');
    expect(r.conditions[0].ifMarry).toEqual(['chrom', 'sumia']);
  });

  it('Sumia + Olivia = no shared support', () => {
    expect(rel('sumia', 'olivia').kind).toBe('none');
  });

  it('same unit = none', () => {
    expect(rel('chrom', 'chrom').kind).toBe('none');
  });
});
