import type { Character, RosterIndex } from './types';

/**
 * The children a couple produces.
 *
 * Each "child-bearing" unit fixes exactly one child (Chrom→Lucina,
 * Olivia→Inigo, Sumia→Cynthia, Robin→Morgan…). A couple's children are simply
 * the fixed children of each partner, so:
 *   - most couples → 1 child (only the mother fixes one)
 *   - Chrom/Robin + a child-bearing partner → 2 children (both fix one)
 *   - two gen-2 units → 0 children (no third generation in Awakening)
 *
 * Returns child ids, de-duplicated, in a stable order.
 */
export function childIdsForCouple(
  aId: string,
  bId: string,
  roster: RosterIndex
): string[] {
  const ids: string[] = [];
  const fromA = roster.childByParentId.get(aId);
  const fromB = roster.childByParentId.get(bId);
  if (fromA) ids.push(fromA);
  if (fromB && fromB !== fromA) ids.push(fromB);
  return ids;
}

/** Resolve child ids to full Character records (skips any missing). */
export function childrenForCouple(
  aId: string,
  bId: string,
  roster: RosterIndex
): Character[] {
  return childIdsForCouple(aId, bId, roster)
    .map((id) => roster.byId.get(id))
    .filter((c): c is Character => c != null);
}

/**
 * Given a child and the active couple, return the child's two parents in this
 * pairing — the fixed parent first, then the other half of the couple — or null
 * if the child doesn't belong to this couple (or there's no couple).
 */
export function contextualParents(
  child: Character,
  couple: [Character, Character] | null | undefined
): [Character, Character] | null {
  if (child.generation !== 2 || !couple || !child.fixedParentId) return null;
  const [p0, p1] = couple;
  if (p0.id === child.fixedParentId) return [p0, p1];
  if (p1.id === child.fixedParentId) return [p1, p0];
  return null;
}

/** A node in the rendered family tree. */
export interface FamilyTree {
  parents: [Character, Character];
  children: Character[];
}

/** Assemble the data a family-tree view needs. Returns null if either parent
 *  is missing from the roster. */
export function buildFamilyTree(
  aId: string,
  bId: string,
  roster: RosterIndex
): FamilyTree | null {
  const a = roster.byId.get(aId);
  const b = roster.byId.get(bId);
  if (!a || !b) return null;
  return { parents: [a, b], children: childrenForCouple(aId, bId, roster) };
}

/**
 * Reverse lookup for future "which pairings make this child?" expansion:
 * given a child, return its fixed parent and the list of partners that fixed
 * parent could marry (each such partner is the variable parent).
 */
export function couplesProducing(
  childId: string,
  roster: RosterIndex
): { fixedParent: Character; variableParents: Character[] } | null {
  const fixedParentId = roster.parentByChildId.get(childId);
  if (!fixedParentId) return null;
  const fixedParent = roster.byId.get(fixedParentId);
  if (!fixedParent) return null;
  const variableParents = fixedParent.marriageableWith
    .map((id) => roster.byId.get(id))
    .filter((c): c is Character => c != null);
  return { fixedParent, variableParents };
}
