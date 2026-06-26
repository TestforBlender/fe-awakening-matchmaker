import type {
  Character,
  CompatibilityResult,
  IncompatibilityReason,
  RosterIndex,
} from './types';

/**
 * Are these two units in a fixed parent/child relationship?
 *
 * Direct field comparison — no index needed. Covers the cases the data can know
 * for certain: a child and its FIXED parent (Chrom↔Lucina, Olivia↔Inigo,
 * Robin↔Morgan, every mother↔her child).
 *
 * KNOWN LIMITATION (intentional, documented): a child's *variable* parent
 * depends on who the fixed parent married in a given playthrough, and likewise
 * two children are siblings only in the playthrough where they share a couple.
 * The matchmaker shows STATIC support possibilities, so it does not model these
 * playthrough-dependent relationships. The static `marriageableWith` list still
 * governs the verdict, so the tool is never *wrong* — only less specific about
 * the reason in those rare dynamic cases.
 */
export function isBloodRelated(a: Character, b: Character): boolean {
  return a.fixedParentId === b.id || b.fixedParentId === a.id;
}

const EXPLANATIONS: Record<IncompatibilityReason, string> = {
  'same-unit': 'A unit can’t be paired with itself.',
  'same-gender':
    'Awakening has no same-sex marriages, so these two can’t reach an S support.',
  'blood-relation':
    'These two are parent and child, so they can’t marry.',
  'not-in-support-pool':
    'These two don’t share a support chain, so they can never reach an S support.',
};

/**
 * Decide whether two units can marry, and explain why or why not.
 *
 * VERDICT: compatible iff `b` is in `a`'s marriageableWith list. That list is
 * the verified source of truth; the checks below never override it, they only
 * choose the most specific explanation for an incompatible pair.
 *
 * Reason order (gameplay-framed, most→least specific):
 *   1. same unit
 *   2. same gender (no same-sex S support)
 *   3. fixed parent/child (can't marry)
 *   4. simply not in each other's support pool
 */
export function checkCompatibility(
  a: Character,
  b: Character,
  _roster?: RosterIndex
): CompatibilityResult {
  if (a.id === b.id) {
    return {
      compatible: false,
      aId: a.id,
      bId: b.id,
      reason: 'same-unit',
      explanation: EXPLANATIONS['same-unit'],
    };
  }

  const compatible = a.marriageableWith.includes(b.id);
  if (compatible) {
    return {
      compatible: true,
      aId: a.id,
      bId: b.id,
      explanation: `${a.name} and ${b.name} can reach an S support and marry.`,
    };
  }

  let reason: IncompatibilityReason;
  if (a.gender === b.gender) {
    reason = 'same-gender';
  } else if (isBloodRelated(a, b)) {
    reason = 'blood-relation';
  } else {
    reason = 'not-in-support-pool';
  }

  return {
    compatible: false,
    aId: a.id,
    bId: b.id,
    reason,
    explanation: EXPLANATIONS[reason],
  };
}
