import { buildRoster } from './roster';
import { assetUrl } from './assets';
import type {
  Character,
  Pairing,
  RosterIndex,
  SupportSet,
} from './types';

export interface AppData {
  roster: RosterIndex;
  pairings: Map<string, Pairing>;
  supports: Map<string, SupportSet>;
}

async function fetchJson<T>(path: string): Promise<T> {
  const url = assetUrl(path);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return (await res.json()) as T;
}

/** Load and assemble all app data. Called once at startup. */
export async function loadAppData(): Promise<AppData> {
  const [characters, children, pairings, supports] = await Promise.all([
    fetchJson<Character[]>('data/characters.json'),
    fetchJson<Character[]>('data/children.json'),
    fetchJson<Pairing[]>('data/pairings.json'),
    fetchJson<SupportSet[]>('data/supports.json'),
  ]);

  return {
    roster: buildRoster(characters, children),
    pairings: new Map(pairings.map((p) => [p.id, p])),
    supports: new Map(supports.map((s) => [s.id, s])),
  };
}
