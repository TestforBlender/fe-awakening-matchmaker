import { describe, it, expect } from 'vitest';
import charactersJson from '../../public/data/characters.json';
import childrenJson from '../../public/data/children.json';
import pairingsJson from '../../public/data/pairings.json';
import supportsJson from '../../public/data/supports.json';
import { buildRoster, validateRoster } from './roster';
import { analyzePairing, pairingId } from './index';
import { checkCompatibility } from './compatibility';
import type { Character, Pairing, SupportSet } from './types';

const characters = charactersJson as unknown as Character[];
const children = childrenJson as unknown as Character[];
const pairings = new Map(
  (pairingsJson as unknown as Pairing[]).map((p) => [p.id, p])
);
const supports = new Map(
  (supportsJson as unknown as SupportSet[]).map((s) => [s.id, s])
);

const roster = buildRoster(characters, children);

describe('real slice data: integrity', () => {
  const issues = validateRoster(roster); // non-strict (incremental build)

  it('has ZERO validation errors', () => {
    const errors = issues.filter((i) => i.level === 'error');
    if (errors.length) console.error(errors);
    expect(errors).toHaveLength(0);
  });

  it('its only warnings are not-yet-added gen-2 partners (TODOs)', () => {
    const warnings = issues.filter((i) => i.level === 'warning');
    // Every warning should be the "not added yet" kind for this slice.
    expect(warnings.every((w) => w.message.includes('not added yet'))).toBe(
      true
    );
  });

  it('builds the expected parent→child edges', () => {
    expect(roster.childByParentId.get('chrom')).toBe('lucina');
    expect(roster.childByParentId.get('olivia')).toBe('inigo');
  });

  it('pairing ids match the canonical sorted form', () => {
    expect(pairings.has(pairingId('chrom', 'olivia'))).toBe(true);
    expect(pairings.has(pairingId('olivia', 'chrom'))).toBe(true); // same id
  });
});

describe('real slice data: end-to-end pairing analysis', () => {
  it('Chrom + Olivia → compatible, two children, full narrative + support', () => {
    const r = analyzePairing('chrom', 'olivia', roster, pairings, supports);
    expect(r.compatibility.compatible).toBe(true);
    expect(r.childIds.sort()).toEqual(['inigo', 'lucina'].sort());
    expect(r.pairing?.gameplayNotes).toMatch(/Dance/i);
    expect(r.support?.ranks.S.length).toBeGreaterThan(20);
    expect(r.support?.ranks.C.length).toBeGreaterThan(20);
  });

  it('Chrom + Sully → both Lucina and Kjelle', () => {
    const r = analyzePairing('chrom', 'sully', roster, pairings, supports);
    expect(r.compatibility.compatible).toBe(true);
    expect(r.childIds.sort()).toEqual(['kjelle', 'lucina']);
  });

  it('Olivia + Sumia → incompatible, same-gender', () => {
    const r = checkCompatibility(
      roster.byId.get('olivia')!,
      roster.byId.get('sumia')!
    );
    expect(r.compatible).toBe(false);
    expect(r.reason).toBe('same-gender');
  });

  it('Chrom + Lucina → incompatible, blood-relation', () => {
    const r = checkCompatibility(
      roster.byId.get('chrom')!,
      roster.byId.get('lucina')!
    );
    expect(r.compatible).toBe(false);
    expect(r.reason).toBe('blood-relation');
  });

  it('Lucina + Inigo → compatible (gen-2 marriage), no children', () => {
    const r = analyzePairing('lucina', 'inigo', roster, pairings, supports);
    expect(r.compatibility.compatible).toBe(true);
    expect(r.childIds).toEqual([]); // no third generation
  });

  it('every gen-1 wife is compatible with Chrom', () => {
    for (const wife of ['sumia', 'sully', 'maribelle', 'olivia', 'robin_f']) {
      const r = checkCompatibility(
        roster.byId.get('chrom')!,
        roster.byId.get(wife)!
      );
      expect(r.compatible).toBe(true);
    }
  });
});
