import type { Character, RosterIndex } from '@/lib/types';
import { Sprite } from '@/components/ui/Sprite';

interface FamilyTreeProps {
  parentA: Character;
  parentB: Character;
  childIds: string[];
  roster: RosterIndex;
  onSelectChild: (child: Character) => void;
}

function ParentNode({ c }: { c: Character }) {
  return (
    <div className="flex items-center gap-2 rounded-panel border border-edge bg-surface px-3 py-1.5">
      <Sprite id={c.id} name={c.name} className="h-8 w-8" decorative />
      <span className="text-sm font-semibold text-ink">{c.name}</span>
    </div>
  );
}

export function FamilyTree({
  parentA,
  parentB,
  childIds,
  roster,
  onSelectChild,
}: FamilyTreeProps) {
  const children = childIds
    .map((id) => roster.byId.get(id))
    .filter((c): c is Character => c != null);

  const label =
    children.length > 0
      ? `Family tree: ${parentA.name} and ${parentB.name}, children ${children
          .map((c) => c.name)
          .join(' and ')}.`
      : `${parentA.name} and ${parentB.name} have no children.`;

  return (
    <figure className="rounded-panel border border-edge bg-surface-raised/60 p-4" aria-label={label}>
      {/* Parents */}
      <div className="flex items-center justify-center gap-3">
        <ParentNode c={parentA} />
        <span className="text-lg text-rose" aria-hidden="true">
          ♥
        </span>
        <ParentNode c={parentB} />
      </div>

      {children.length === 0 ? (
        <p className="mt-3 text-center text-sm text-ink-soft">
          No children — Awakening has no third generation.
        </p>
      ) : (
        <>
          {/* Connectors */}
          <svg
            viewBox="0 0 100 28"
            preserveAspectRatio="none"
            className="h-7 w-full text-edge"
            aria-hidden="true"
          >
            {children.length === 1 ? (
              <line
                x1="50"
                y1="0"
                x2="50"
                y2="28"
                stroke="currentColor"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            ) : (
              <g
                stroke="currentColor"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              >
                <line x1="50" y1="0" x2="50" y2="14" vectorEffect="non-scaling-stroke" />
                <line x1="25" y1="14" x2="75" y2="14" vectorEffect="non-scaling-stroke" />
                <line x1="25" y1="14" x2="25" y2="28" vectorEffect="non-scaling-stroke" />
                <line x1="75" y1="14" x2="75" y2="28" vectorEffect="non-scaling-stroke" />
              </g>
            )}
          </svg>

          {/* Children (clickable) */}
          <ul className="flex justify-around gap-3">
            {children.map((child) => {
              const parent = child.fixedParentId
                ? roster.byId.get(child.fixedParentId)
                : null;
              return (
                <li key={child.id} className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => onSelectChild(child)}
                    className="flex flex-col items-center gap-1 rounded-panel border border-edge bg-surface px-4 py-2 transition hover:border-gold hover:shadow-gold-glow focus-visible:ring-2 focus-visible:ring-gold"
                    aria-label={`View details for ${child.name}`}
                  >
                    <Sprite id={child.id} name={child.name} className="h-10 w-10" decorative />
                    <span className="text-sm font-semibold text-ink">
                      {child.name}
                    </span>
                    {parent && (
                      <span className="text-[11px] text-goldtext">
                        via {parent.name}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </figure>
  );
}
