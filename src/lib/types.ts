/**
 * Domain types for the Fire Emblem Awakening Matchmaker.
 *
 * Design decisions encoded here (agreed during planning):
 *  - Robin and Morgan are TWO separate static entries each (robin_m/robin_f,
 *    morgan_m/morgan_f). No runtime gender toggle anywhere — every record is
 *    immutable, which keeps the logic layer pure.
 *  - Gen-1 and gen-2 units share ONE `Character` type so the gallery, match
 *    zone, and compatibility code never branch on "is this a child". The data
 *    still lives in two files (characters.json / children.json) for tidiness;
 *    they're merged into one roster at load time.
 *  - `marriageableWith` is the SINGLE SOURCE OF TRUTH for whether two units can
 *    marry. Everything else (same-gender, blood relation) only refines the
 *    *explanation* when a pair is incompatible — it never overrides the verdict.
 *  - The parent→child edge is stored ONCE, as `fixedParentId` on the child.
 *    Most children have a fixed mother; Lucina's fixed parent is Chrom (father)
 *    and Morgan's is the Avatar. Storing it one place avoids inconsistency.
 *  - Awakening has no third generation: a pairing where neither partner fixes a
 *    child (e.g. two gen-2 units) correctly yields no children and no tree.
 */

export type Gender = 'male' | 'female';
export type Generation = 1 | 2;

/** Where a unit comes from. Base cast only for v1; field kept so DLC/SpotPass
 *  is a pure data add later, never a refactor. */
export type Source = 'base' | 'dlc' | 'spotpass';

/**
 * A playable unit. Covers both generations; gen-specific fields are optional
 * and only populated for the relevant generation.
 */
export interface Character {
  /** Lowercase join key, identical across data and asset filenames. */
  id: string;
  name: string;
  /** Short title shown under the name, e.g. "The Exalt", "The Dancer". */
  epithet: string;
  gender: Gender;
  generation: Generation;
  source: Source;

  defaultClass: string;
  availableClasses: string[];

  /** 2–3 spoiler-light sentences. */
  personality: string;
  /** How/when the unit joins. */
  recruitment: string;

  /** Ids of every unit this character can reach an S support (marry) with.
   *  Source of truth for compatibility. Verified against Serenes Forest. */
  marriageableWith: string[];

  /** Freeform facets for filtering/search: "royalty", "flier", "mounted"… */
  tags: string[];

  /** Notable skills (used prominently in the child detail panel; optional for
   *  gen-1). */
  notableSkills?: string[];

  // ---- Gen-2 (child) only ----------------------------------------------
  /** The parent who is FIXED for this child. The other parent is whoever the
   *  fixed parent marries. Undefined/null for gen-1 units. */
  fixedParentId?: string | null;
  /** Father-/mother-dependent inheritance caveats, shown in the child panel. */
  inheritanceNotes?: string;
}

/**
 * Narrative content for a couple. Existence is OPTIONAL — compatibility does
 * not depend on this. It only supplies the prose shown when a pair is valid.
 * `id` is the two member ids sorted and joined with "__".
 */
export interface Pairing {
  id: string;
  members: [string, string];
  relationshipSummary: string;
  personalityDynamic: string;
  gameplayNotes: string;
  /** Id into the supports collection. */
  supportId: string;
}

/** C/B/A/S support conversation summaries (paraphrased, never transcripts). */
export interface SupportSet {
  id: string;
  members: [string, string];
  ranks: {
    C: string;
    B: string;
    A: string;
    S: string;
  };
}

/** Why a pair cannot marry. Ordered from most to least specific. */
export type IncompatibilityReason =
  | 'same-unit'
  | 'same-gender'
  | 'blood-relation'
  | 'not-in-support-pool';

export interface CompatibilityResult {
  compatible: boolean;
  aId: string;
  bId: string;
  /** Present only when `compatible` is false. */
  reason?: IncompatibilityReason;
  /** Human-readable, gameplay-framed explanation (both cases). */
  explanation: string;
}

/**
 * Everything the result panel needs for one pairing, composed from the pure
 * functions. `children`/`pairing`/`support` are only meaningful when compatible.
 */
export interface PairingAnalysis {
  compatibility: CompatibilityResult;
  /** Child ids produced by this couple (0–2). Empty if incompatible or none. */
  childIds: string[];
  pairing: Pairing | null;
  support: SupportSet | null;
}

/**
 * Indexed roster built once from the raw data for O(1) lookups.
 */
export interface RosterIndex {
  /** All units (gen-1 + gen-2) in stable display order. */
  all: Character[];
  /** id → Character. */
  byId: Map<string, Character>;
  /** fixed parent id → the child id they determine (1:1). */
  childByParentId: Map<string, string>;
  /** child id → fixed parent id (reverse of the above). */
  parentByChildId: Map<string, string>;
}
