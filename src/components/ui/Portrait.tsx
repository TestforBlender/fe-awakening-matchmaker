import { useMemo, useState } from 'react';
import { portraitCandidates } from '@/lib/assets';

interface PortraitProps {
  id: string;
  name: string;
  /** Shown small under the initial in the placeholder. */
  subtitle?: string;
  /** Tailwind sizing classes for the frame (default a 3:4 card). */
  className?: string;
  /** If true, the image is decorative and hidden from screen readers. */
  decorative?: boolean;
}

/** Deterministic 0–359 hue from an id, for subtle per-character variation. */
function hueFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
}

/**
 * Character portrait with a graceful, styled fallback.
 *
 * The placeholder always renders; the real <img> is layered on top and fades in
 * only once it successfully loads. If neither webp nor png exists, the
 * placeholder simply stays — the user never sees a broken-image icon, and a
 * dropped-in file lights up automatically on next view.
 */
export function Portrait({
  id,
  name,
  subtitle,
  className = 'w-full aspect-[3/4]',
  decorative = false,
}: PortraitProps) {
  const candidates = useMemo(() => portraitCandidates(id), [id]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const hue = hueFromId(id);
  const exhausted = candidateIndex >= candidates.length;

  return (
    <div
      className={`relative overflow-hidden rounded-panel border border-gold/40 bg-navy-deep shadow-panel ${className}`}
    >
      {/* Styled placeholder (always present, behind the image) */}
      <svg
        viewBox="0 0 120 160"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={`pg-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`hsl(${hue} 28% 26%)`} />
            <stop offset="100%" stopColor="rgb(20 26 46)" />
          </linearGradient>
        </defs>
        <rect width="120" height="160" fill={`url(#pg-${id})`} />
        {/* faint emblem diamond */}
        <path
          d="M60 40 L86 80 L60 120 L34 80 Z"
          fill="none"
          stroke="rgb(201 160 78)"
          strokeOpacity="0.22"
          strokeWidth="2"
        />
        <text
          x="60"
          y="92"
          textAnchor="middle"
          fontFamily="Cinzel, Georgia, serif"
          fontSize="52"
          fontWeight="700"
          fill="rgb(201 160 78)"
          fillOpacity="0.92"
        >
          {initial}
        </text>
      </svg>

      {/* Real image, fades in over the placeholder when it loads */}
      {!exhausted && (
        <img
          src={candidates[candidateIndex]}
          alt={decorative ? '' : `${name} portrait`}
          aria-hidden={decorative || undefined}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setCandidateIndex((i) => i + 1);
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Name/subtitle ribbon at the bottom */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-deep/95 to-transparent px-2 pb-1.5 pt-6">
        <p className="truncate text-center font-display text-sm font-semibold text-parchment">
          {name}
        </p>
        {subtitle && (
          <p className="truncate text-center text-[11px] text-gold">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
