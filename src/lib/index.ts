import { checkCompatibility } from './compatibility';
import { childIdsForCouple } from './children';
import type {
  Pairing,
  PairingAnalysis,
  RosterIndex,
  SupportSet,
} from './types';

/** Canonical pairing id: the two ids sorted and joined, so order never matters. */
export function pairingId(aId: string, bId: string): string {
  return [aId, bId].sort().join('__');
}

/**
 * The one function the result panel calls. Composes the pure pieces:
 *  - compatibility verdict + explanation
 *  - children (only when compatible)
 *  - narrative pairing + support summaries (only when present in the data)
 *
 * Narrative lookups are by canonical pairing id, so the data author doesn't
 * have to worry about which order the user dropped the two units in.
 */
export function analyzePairing(
  aId: string,
  bId: string,
  roster: RosterIndex,
  pairings: Map<string, Pairing>,
  supports: Map<string, SupportSet>
): PairingAnalysis {
  const a = roster.byId.get(aId);
  const b = roster.byId.get(bId);
  if (!a || !b) {
    throw new Error(`analyzePairing: unknown unit ("${aId}" / "${bId}").`);
  }

  const compatibility = checkCompatibility(a, b, roster);

  if (!compatibility.compatible) {
    return { compatibility, childIds: [], pairing: null, support: null };
  }

  const id = pairingId(aId, bId);
  const pairing = pairings.get(id) ?? null;
  const support = pairing
    ? supports.get(pairing.supportId) ?? null
    : supports.get(id) ?? null;

  return {
    compatibility,
    childIds: childIdsForCouple(aId, bId, roster),
    pairing,
    support,
  };
}
