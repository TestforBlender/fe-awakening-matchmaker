import { useState } from 'react';
import { spriteUrl } from '@/lib/assets';

interface SpriteProps {
  id: string;
  name: string;
  /** Tailwind size classes for the box (default 40px square). */
  className?: string;
  decorative?: boolean;
}

/**
 * Map sprite with a styled fallback chip. Renders pixelated (sprites are
 * low-res pixel art). If `assets/sprites/{id}.png` is absent, a small gold
 * initial chip stays in its place.
 */
export function Sprite({
  id,
  name,
  className = 'h-10 w-10',
  decorative = false,
}: SpriteProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div
      className={`relative grid place-items-center overflow-hidden rounded-md border border-edge/70 bg-navy-panel ${className}`}
    >
      {(!loaded || failed) && (
        <span
          className="font-display text-sm font-semibold text-gold"
          aria-hidden="true"
        >
          {initial}
        </span>
      )}
      {!failed && (
        <img
          src={spriteUrl(id)}
          alt={decorative ? '' : `${name} sprite`}
          aria-hidden={decorative || undefined}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={{ imageRendering: 'pixelated' }}
          className={`absolute inset-0 h-full w-full object-contain p-0.5 transition-opacity duration-200 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}
