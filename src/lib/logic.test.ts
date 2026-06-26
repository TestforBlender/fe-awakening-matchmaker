import { describe, it, expect } from 'vitest';
import { buildRoster, validateRoster } from './roster';
import { checkCompatibility, isBloodRelated } from './compatibility';
import { childIdsForCouple, buildFamilyTree, contextualParents } from './children';
import { analyzePairing, pairingId } from './index';
import { applyFilters, allClassNames } from './search';
import { TEST_CHARACTERS, TEST_CHILDREN } from './fixture.test-data';
import type { Pairing, SupportSet } from './types';

const roster = buildRoster(TEST_CHARACTERS, TEST_CHILDREN);

describe('buildRoster', () => {
  it('merges both generations into one indexed roster', () => {
    expect(roster.all).toHaveLength(7);
    expect(roster.byId.get('chrom')?.name).toBe('Chrom');
    expect(roster.byId.get('lucina')?.generation).toBe(2);
  });

  it('derives the parent↔child edges from fixedParentId', () => {
    expect(roster.childByParentId.get('chrom')).toBe('lucina');
    expect(roster.childByParentId.get('olivia')).toBe('inigo');
    expect(roster.childByParentId.get('sumia')).toBe('cynthia');
    expect(roster.parentByChildId.get('lucina')).toBe('chrom');
    // Frederick fixes no child.
    expect(roster.childByParentId.has('frederick')).toBe(false);
  });
});

describe('validateRoster', () => {
  it('passes the clean fixture with no errors', () => {
    const issues = validateRoster(roster);
    expect(issues.filter((i) => i.level === 'error')).toHaveLength(0);
  });

  it('flags a dangling marriage reference', () => {
    const broken = buildRoster(
      [
        {
          ...TEST_CHARACTERS[0],
          marriageableWith: ['ghost'],
        },
        ...TEST_CHARACTERS.slice(1),
      ],
      TEST_CHILDREN
    );
    const issues = validateRoster(broken);
    expect(issues.some((i) => i.message.includes('ghost'))).toBe(true);
  });

  it('flags a same-gender marriage pairing as an error', () => {
    const broken = buildRoster(
      [
        { ...TEST_CHARACTERS[0], marriageableWith: ['frederick'] }, // chrom→frederick
        TEST_CHARACTERS[1],
        TEST_CHARACTERS[2],
        { ...TEST_CHARACTERS[3], marriageableWith: ['chrom'] }, // frederick→chrom
      ],
      []
    );
    const issues = validateRoster(broken);
    expect(
      issues.some((i) => i.level === 'error' && i.message.includes('gender'))
    ).toBe(true);
  });
});

describe('checkCompatibility', () => {
  const chrom = roster.byId.get('chrom')!;
  const olivia = roster.byId.get('olivia')!;
  const sumia = roster.byId.get('sumia')!;
  const frederick = roster.byId.get('frederick')!;
  const lucina = roster.byId.get('lucina')!;
  const inigo = roster.byId.get('inigo')!;

  it('confirms a valid marriage (Chrom + Olivia)', () => {
    const r = checkCompatibility(chrom, olivia);
    expect(r.compatible).toBe(true);
    expect(r.explanation).toContain('marry');
  });

  it('is order-independent', () => {
    expect(checkCompatibility(chrom, olivia).compatible).toBe(
      checkCompatibility(olivia, chrom).compatible
    );
  });

  it('rejects the same unit with reason same-unit', () => {
    const r = checkCompatibility(chrom, chrom);
    expect(r.compatible).toBe(false);
    expect(r.reason).toBe('same-unit');
  });

  it('rejects a same-gender pair with reason same-gender', () => {
    const r = checkCompatibility(olivia, sumia);
    expect(r.compatible).toBe(false);
    expect(r.reason).toBe('same-gender');
  });

  it('rejects a fixed parent/child pair with reason blood-relation', () => {
    // Chrom is Lucina's fixed parent; opposite genders so it's not same-gender.
    const r = checkCompatibility(chrom, lucina);
    expect(r.compatible).toBe(false);
    expect(r.reason).toBe('blood-relation');
    expect(isBloodRelated(chrom, lucina)).toBe(true);
  });

  it('rejects an unrelated, non-listed opposite-gender pair as not-in-support-pool', () => {
    // Frederick and Lucina: opposite gender, not blood-related, not listed.
    const r = checkCompatibility(frederick, lucina);
    expect(r.compatible).toBe(false);
    expect(r.reason).toBe('not-in-support-pool');
  });

  it('treats marriageableWith as the verdict even between two children', () => {
    expect(checkCompatibility(lucina, inigo).compatible).toBe(true);
  });
});

describe('childIdsForCouple', () => {
  it('returns BOTH children when both partners fix one (Chrom + Olivia)', () => {
    expect(childIdsForCouple('chrom', 'olivia', roster).sort()).toEqual(
      ['inigo', 'lucina'].sort()
    );
  });

  it('returns one child when only one partner fixes one (Frederick + Sumia)', () => {
    expect(childIdsForCouple('frederick', 'sumia', roster)).toEqual(['cynthia']);
  });

  it('returns Lucina + Cynthia for Chrom + Sumia', () => {
    expect(childIdsForCouple('chrom', 'sumia', roster).sort()).toEqual(
      ['cynthia', 'lucina'].sort()
    );
  });

  it('returns no children for a gen-2 × gen-2 pairing (no third generation)', () => {
    expect(childIdsForCouple('lucina', 'inigo', roster)).toEqual([]);
  });
});

describe('buildFamilyTree', () => {
  it('assembles parents and children', () => {
    const tree = buildFamilyTree('chrom', 'olivia', roster)!;
    expect(tree.parents.map((p) => p.id).sort()).toEqual(['chrom', 'olivia']);
    expect(tree.children.map((c) => c.id).sort()).toEqual(['inigo', 'lucina']);
  });
});

describe('contextualParents', () => {
  const lucina = roster.byId.get('lucina')!;
  const inigo = roster.byId.get('inigo')!;
  const chrom = roster.byId.get('chrom')!;
  const olivia = roster.byId.get('olivia')!;
  const sumia = roster.byId.get('sumia')!;

  it('returns the fixed parent first, then the other half of the couple', () => {
    // Lucina's fixed parent is Chrom, so Chrom leads regardless of couple order.
    expect(contextualParents(lucina, [olivia, chrom])?.map((p) => p.id)).toEqual([
      'chrom',
      'olivia',
    ]);
    expect(contextualParents(inigo, [chrom, olivia])?.map((p) => p.id)).toEqual([
      'olivia',
      'chrom',
    ]);
  });

  it('returns null when the child does not belong to the couple', () => {
    // Lucina (fixed parent Chrom) is not a child of Frederick + Sumia.
    const frederick = roster.byId.get('frederick')!;
    expect(contextualParents(lucina, [frederick, sumia])).toBeNull();
  });

  it('returns null with no couple or for a gen-1 unit', () => {
    expect(contextualParents(lucina, null)).toBeNull();
    expect(contextualParents(chrom, [chrom, olivia])).toBeNull();
  });
});

describe('analyzePairing', () => {
  const pairings = new Map<string, Pairing>([
    [
      pairingId('chrom', 'olivia'),
      {
        id: pairingId('chrom', 'olivia'),
        members: ['chrom', 'olivia'],
        relationshipSummary: 'Prince and dancer.',
        personalityDynamic: 'Extrovert × introvert.',
        gameplayNotes: 'A dancer in the main line.',
        supportId: pairingId('chrom', 'olivia'),
      },
    ],
  ]);
  const supports = new Map<string, SupportSet>([
    [
      pairingId('chrom', 'olivia'),
      {
        id: pairingId('chrom', 'olivia'),
        members: ['chrom', 'olivia'],
        ranks: { C: 'c', B: 'b', A: 'a', S: 's' },
      },
    ],
  ]);

  it('attaches children + narrative when compatible (order-independent)', () => {
    const r = analyzePairing('olivia', 'chrom', roster, pairings, supports);
    expect(r.compatibility.compatible).toBe(true);
    expect(r.childIds.sort()).toEqual(['inigo', 'lucina'].sort());
    expect(r.pairing?.relationshipSummary).toBe('Prince and dancer.');
    expect(r.support?.ranks.S).toBe('s');
  });

  it('omits children and narrative when incompatible', () => {
    const r = analyzePairing('olivia', 'sumia', roster, pairings, supports);
    expect(r.compatibility.compatible).toBe(false);
    expect(r.childIds).toEqual([]);
    expect(r.pairing).toBeNull();
    expect(r.support).toBeNull();
  });
});

describe('search & filter', () => {
  const all = roster.all;
  const matesOf = (id: string) => roster.byId.get(id)?.marriageableWith ?? [];

  it('finds by name substring', () => {
    const r = applyFilters(all, { query: 'chr' });
    expect(r[0].id).toBe('chrom');
  });

  it('finds by tag', () => {
    const r = applyFilters(all, { query: 'flier' });
    expect(r.map((c) => c.id)).toContain('sumia');
  });

  it('filters by gender', () => {
    const r = applyFilters(all, { gender: 'female' });
    expect(r.every((c) => c.gender === 'female')).toBe(true);
  });

  it('filters by generation', () => {
    const r = applyFilters(all, { generation: 2 });
    expect(r.map((c) => c.id).sort()).toEqual(['cynthia', 'inigo', 'lucina']);
  });

  it('filters to a unit’s valid partners', () => {
    const r = applyFilters(all, { marriageableWithId: 'chrom' }, matesOf);
    expect(r.map((c) => c.id).sort()).toEqual(['olivia', 'sumia']);
    expect(r.map((c) => c.id)).not.toContain('chrom');
  });

  it('lists distinct class names sorted', () => {
    const classes = allClassNames(all);
    expect(classes).toContain('Lord');
    expect([...classes]).toEqual([...classes].sort());
  });
});
