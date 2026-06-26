import type { Character, RosterIndex } from './types';

/**
 * Build the indexed roster from the two raw data sources.
 *
 * `characters` are gen-1 units; `children` are gen-2 units. They're merged into
 * one list because, downstream, a child is just another draggable, marriageable
 * unit. The only structural difference is that children carry `fixedParentId`.
 *
 * The parent↔child maps are derived from `fixedParentId` so the edge is stored
 * exactly once (on the child) and can never drift out of sync.
 */
export function buildRoster(
  characters: Character[],
  children: Character[]
): RosterIndex {
  const all = [...characters, ...children];

  const byId = new Map<string, Character>();
  for (const c of all) byId.set(c.id, c);

  const childByParentId = new Map<string, string>();
  const parentByChildId = new Map<string, string>();
  for (const child of all) {
    if (child.fixedParentId) {
      childByParentId.set(child.fixedParentId, child.id);
      parentByChildId.set(child.id, child.fixedParentId);
    }
  }

  return { all, byId, childByParentId, parentByChildId };
}

export interface RosterIssue {
  level: 'error' | 'warning';
  message: string;
}

export interface ValidateOptions {
  /** When true (final/CI), a marriage pointing at a unit not in the roster is
   *  an ERROR. When false (incremental builds), it's a WARNING — effectively a
   *  TODO list of units still to be added. */
  strict?: boolean;
}

/**
 * Validate a roster's internal consistency. Pure: returns a list of issues
 * rather than throwing, so callers (a build script, or a dev-mode banner) can
 * decide how loud to be. Catches the classes of data mistakes most likely to
 * appear while hand-entering ~60 characters.
 */
export function validateRoster(
  roster: RosterIndex,
  opts: ValidateOptions = {}
): RosterIssue[] {
  const issues: RosterIssue[] = [];
  const seen = new Set<string>();

  for (const c of roster.all) {
    // Duplicate ids would make Map lookups ambiguous.
    if (seen.has(c.id)) {
      issues.push({ level: 'error', message: `Duplicate id: "${c.id}".` });
    }
    seen.add(c.id);

    // A child must point at a parent that exists.
    if (c.fixedParentId && !roster.byId.has(c.fixedParentId)) {
      issues.push({
        level: 'error',
        message: `"${c.id}" has fixedParentId "${c.fixedParentId}" which is not in the roster.`,
      });
    }

    // Children are gen-2; gen-1 should not carry a fixed parent.
    if (c.generation === 2 && !c.fixedParentId) {
      issues.push({
        level: 'warning',
        message: `Gen-2 unit "${c.id}" is missing fixedParentId.`,
      });
    }
    if (c.generation === 1 && c.fixedParentId) {
      issues.push({
        level: 'warning',
        message: `Gen-1 unit "${c.id}" unexpectedly has a fixedParentId.`,
      });
    }

    for (const mate of c.marriageableWith) {
      const other = roster.byId.get(mate);
      if (!other) {
        // Not yet in the roster: an error only when we expect completeness.
        issues.push({
          level: opts.strict ? 'error' : 'warning',
          message: opts.strict
            ? `"${c.id}" can marry "${mate}", which is not in the roster.`
            : `"${c.id}" lists "${mate}" as a partner — not added yet (TODO).`,
        });
        continue;
      }
      // Marriage should be symmetric (if A can marry B, B can marry A).
      if (!other.marriageableWith.includes(c.id)) {
        issues.push({
          level: 'warning',
          message: `Asymmetric marriage: "${c.id}" → "${mate}" but not back.`,
        });
      }
      // A same-gender pair in a marriage list is always a data error.
      if (other.gender === c.gender) {
        issues.push({
          level: 'error',
          message: `"${c.id}" and "${mate}" share a gender but appear as marriageable.`,
        });
      }
    }
  }

  return issues;
}
