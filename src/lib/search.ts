import type { Character, Gender, Generation, Source } from './types';

export interface FilterFacets {
  /** Free-text query across name, epithet, and tags. */
  query?: string;
  gender?: Gender | 'any';
  generation?: Generation | 'any';
  /** Matches against availableClasses (exact, case-insensitive). */
  className?: string | 'any';
  source?: Source | 'any';
  /** When set, only units that can marry this id are kept. */
  marriageableWithId?: string;
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

/** Does a character match the free-text query? */
function matchesQuery(c: Character, q: string): boolean {
  if (!q) return true;
  const needle = normalize(q);
  if (normalize(c.name).includes(needle)) return true;
  if (normalize(c.epithet).includes(needle)) return true;
  return (c.tags ?? []).some((t) => normalize(t).includes(needle));
}

/** A small relevance score so better matches sort first (higher = better). */
function queryScore(c: Character, q: string): number {
  if (!q) return 0;
  const needle = normalize(q);
  const name = normalize(c.name);
  if (name === needle) return 100;
  if (name.startsWith(needle)) return 80;
  if (name.includes(needle)) return 60;
  if (normalize(c.epithet).includes(needle)) return 40;
  if ((c.tags ?? []).some((t) => normalize(t).includes(needle))) return 20;
  return 0;
}

/**
 * Apply all facets and return matching characters. Pure and stable: with no
 * query, results keep the roster's display order; with a query, they sort by
 * relevance then name.
 */
export function applyFilters(
  roster: Character[],
  facets: FilterFacets,
  marriageableWith?: (id: string) => string[]
): Character[] {
  const q = facets.query ?? '';
  const target = facets.marriageableWithId;
  const targetMates =
    target && marriageableWith ? new Set(marriageableWith(target)) : null;

  const filtered = roster.filter((c) => {
    if (!matchesQuery(c, q)) return false;
    if (facets.gender && facets.gender !== 'any' && c.gender !== facets.gender)
      return false;
    if (
      facets.generation &&
      facets.generation !== 'any' &&
      c.generation !== facets.generation
    )
      return false;
    if (facets.source && facets.source !== 'any' && c.source !== facets.source)
      return false;
    if (facets.className && facets.className !== 'any') {
      const wanted = normalize(facets.className);
      if (!c.availableClasses.some((cl) => normalize(cl) === wanted))
        return false;
    }
    if (targetMates) {
      // Exclude the target itself and keep only its valid partners.
      if (c.id === target) return false;
      if (!targetMates.has(c.id)) return false;
    }
    return true;
  });

  if (!q) return filtered;

  return [...filtered].sort((a, b) => {
    const diff = queryScore(b, q) - queryScore(a, q);
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });
}

/** Distinct, sorted class names across the roster — for building the class
 *  filter dropdown. */
export function allClassNames(roster: Character[]): string[] {
  const set = new Set<string>();
  for (const c of roster) for (const cl of c.availableClasses) set.add(cl);
  return [...set].sort((a, b) => a.localeCompare(b));
}
