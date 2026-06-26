/**
 * Asset URL resolution. All asset paths are base-relative so they resolve
 * correctly whether the app is served from "/" (dev) or "/<repo>/" (GitHub
 * Pages). The filename stem is always the character's `id`.
 */

const BASE = (import.meta.env.BASE_URL ?? '/').replace(/\/?$/, '/');

export function assetUrl(path: string): string {
  return `${BASE}${path.replace(/^\//, '')}`;
}

/** Ordered portrait candidates: webp preferred, png fallback. */
export function portraitCandidates(id: string): string[] {
  return [assetUrl(`assets/portraits/${id}.webp`), assetUrl(`assets/portraits/${id}.png`)];
}

/** Sprites are single PNGs (per the chosen convention). */
export function spriteUrl(id: string): string {
  return assetUrl(`assets/sprites/${id}.png`);
}
