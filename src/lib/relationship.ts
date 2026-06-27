import type {
  Character,
  RelationshipCondition,
  RelationshipResult,
  RosterIndex,
} from './types';

function fixedParent(c: Character, roster: RosterIndex): Character | null {
  return c.fixedParentId ? roster.byId.get(c.fixedParentId) ?? null : null;
}

/** Full support pool (defaults to the marriage pool when not separately given). */
function supportPool(c: Character): string[] {
  return c.supportsWith ?? c.marriageableWith;
}

function sharesListedSupport(a: Character, b: Character): boolean {
  return supportPool(a).includes(b.id) || supportPool(b).includes(a.id);
}

function canMarry(a: Character, b: Character): boolean {
  return (
    a.gender !== b.gender &&
    (a.marriageableWith.includes(b.id) || b.marriageableWith.includes(a.id))
  );
}

function parentChildLabel(parent: Character, child: Character): string {
  const p = parent.gender === 'male' ? 'Father' : 'Mother';
  const c = child.gender === 'male' ? 'son' : 'daughter';
  return `${p} & ${c}`;
}

function siblingLabel(a: Character, b: Character): string {
  if (a.gender === b.gender) return a.gender === 'male' ? 'Brothers' : 'Sisters';
  return 'Siblings';
}

/** Unconditional fixed parent/child edge (a mother↔her child, Chrom↔Lucina,
 *  Robin↔Morgan). */
function fixedParentChild(
  a: Character,
  b: Character
): { parent: Character; child: Character } | null {
  if (a.fixedParentId === b.id) return { parent: b, child: a };
  if (b.fixedParentId === a.id) return { parent: a, child: b };
  return null;
}

/** Could these two be siblings in some parent combination? Both are gen-2 and
 *  their fixed parents can marry each other. Returns the triggering parents. */
function conditionalSiblings(
  a: Character,
  b: Character,
  roster: RosterIndex
): [Character, Character] | null {
  if (a.generation !== 2 || b.generation !== 2) return null;
  const fa = fixedParent(a, roster);
  const fb = fixedParent(b, roster);
  if (!fa || !fb || fa.id === fb.id) return null;
  if (fa.marriageableWith.includes(fb.id) || fb.marriageableWith.includes(fa.id)) {
    return [fa, fb];
  }
  return null;
}

/** Could `gen1` be `child`'s VARIABLE parent in some combination? That happens
 *  when gen1 can marry the child's fixed parent. Returns the fixed parent. */
function conditionalParent(
  gen1: Character,
  child: Character,
  roster: RosterIndex
): Character | null {
  if (gen1.generation !== 1 || child.generation !== 2) return null;
  const fp = fixedParent(child, roster);
  if (!fp || fp.id === gen1.id) return null;
  if (fp.marriageableWith.includes(gen1.id) || gen1.marriageableWith.includes(fp.id)) {
    return fp;
  }
  return null;
}

/**
 * Classify the relationship between two units.
 *
 * Priority: a fixed parent/child edge and an actual marriage are unconditional
 * and win first; then same-gender comrade bonds; then the conditional cases
 * (siblings / variable-parent) that only hold in specific pairings.
 */
export function analyzeRelationship(
  a: Character,
  b: Character,
  roster: RosterIndex
): RelationshipResult {
  const base = { aId: a.id, bId: b.id };

  if (a.id === b.id) {
    return {
      ...base,
      kind: 'none',
      maxRank: null,
      label: 'Same unit',
      explanation: 'A unit can’t be paired with itself.',
      conditions: [],
    };
  }

  // 1) Unconditional fixed parent/child → bond.
  const pc = fixedParentChild(a, b);
  if (pc) {
    return {
      ...base,
      kind: 'bond',
      maxRank: 'A',
      bondReason: 'parent-child',
      label: parentChildLabel(pc.parent, pc.child),
      explanation: `${pc.child.name} is ${pc.parent.name}’s child — a parent-child bond (support up to A), so they can’t marry.`,
      conditions: [],
    };
  }

  // A sibling possibility may decorate the marriage / same-gender branches.
  const condSib = conditionalSiblings(a, b, roster);
  const sibCondition: RelationshipCondition | null = condSib
    ? {
        kind: 'siblings',
        ifMarry: [condSib[0].id, condSib[1].id],
        text: `Siblings (cannot marry) if ${condSib[0].name} marries ${condSib[1].name}.`,
      }
    : null;

  // 2) Marriage: opposite gender and in the marriage pool.
  if (canMarry(a, b)) {
    return {
      ...base,
      kind: 'marriage',
      maxRank: 'S',
      label: 'Can marry',
      explanation: `${a.name} and ${b.name} can reach an S support and marry.`,
      conditions: sibCondition ? [sibCondition] : [],
    };
  }

  // 3) Same-gender comrades: share a listed support but can't marry.
  if (a.gender === b.gender && sharesListedSupport(a, b)) {
    return {
      ...base,
      kind: 'bond',
      maxRank: 'A',
      bondReason: 'same-gender',
      label: 'Comrades',
      explanation: `${a.name} and ${b.name} share a support chain (up to A). Awakening has no same-sex marriage, so it can’t reach S.`,
      conditions: sibCondition ? [sibCondition] : [],
    };
  }

  // 4) Conditional siblings (no other shared support).
  if (condSib && sibCondition) {
    return {
      ...base,
      kind: 'bond',
      maxRank: 'A',
      bondReason: 'siblings',
      label: siblingLabel(a, b),
      explanation: `${a.name} and ${b.name} become siblings if ${condSib[0].name} marries ${condSib[1].name} — a bond up to A, and they can’t marry.`,
      conditions: [sibCondition],
    };
  }

  // 5) Conditional parent/child (a gen-1 unit who could be the gen-2 unit's
  //    variable parent).
  const aIsParent = conditionalParent(a, b, roster);
  const bIsParent = conditionalParent(b, a, roster);
  if (aIsParent || bIsParent) {
    const parent = aIsParent ? a : b;
    const child = aIsParent ? b : a;
    const fp = (aIsParent ?? bIsParent)!;
    const label = parentChildLabel(parent, child);
    return {
      ...base,
      kind: 'bond',
      maxRank: 'A',
      bondReason: 'parent-child',
      label,
      explanation: `If ${parent.name} marries ${fp.name}, ${parent.name} is ${child.name}’s parent — a bond up to A, so they can’t marry.`,
      conditions: [
        {
          kind: 'parent-child',
          ifMarry: [parent.id, fp.id],
          text: `${label} if ${parent.name} marries ${fp.name}.`,
        },
      ],
    };
  }

  // 6) No shared support at all.
  return {
    ...base,
    kind: 'none',
    maxRank: null,
    label: 'No support',
    explanation: `${a.name} and ${b.name} don’t share a support chain.`,
    conditions: [],
  };
}
