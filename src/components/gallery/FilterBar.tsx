import { useId, useState } from 'react';
import type { Character } from '@/lib/types';
import type { FilterFacets } from '@/lib/search';

interface FilterBarProps {
  facets: FilterFacets;
  onChange: (facets: FilterFacets) => void;
  classNames: string[];
  /** All characters, for the "can marry…" target select. */
  characters: Character[];
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-ink-soft">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-panel border border-edge bg-surface px-2 py-1.5 text-sm text-ink focus:border-gold"
      >
        {children}
      </select>
    </div>
  );
}

export function FilterBar({ facets, onChange, classNames, characters }: FilterBarProps) {
  const [openMobile, setOpenMobile] = useState(false);

  const activeCount = [
    facets.gender && facets.gender !== 'any',
    facets.generation && facets.generation !== 'any',
    facets.className && facets.className !== 'any',
    facets.marriageableWithId,
  ].filter(Boolean).length;

  const set = (patch: Partial<FilterFacets>) => onChange({ ...facets, ...patch });

  return (
    <div className="rounded-panel border border-edge bg-surface-raised">
      {/* Mobile disclosure toggle */}
      <button
        type="button"
        onClick={() => setOpenMobile((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-ink sm:hidden"
        aria-expanded={openMobile}
        aria-controls="filter-panel"
      >
        <span>
          Filters
          {activeCount > 0 && (
            <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-xs font-semibold text-navy-deep">
              {activeCount}
            </span>
          )}
        </span>
        <span aria-hidden="true">{openMobile ? '▲' : '▼'}</span>
      </button>

      {/* Panel: hidden on mobile unless open; always shown on desktop */}
      <div
        id="filter-panel"
        className={`${openMobile ? 'grid' : 'hidden'} gap-3 border-t border-edge/60 p-4 sm:grid sm:grid-cols-2 sm:border-t-0 lg:grid-cols-4`}
      >
        <Select
          label="Gender"
          value={facets.gender ?? 'any'}
          onChange={(v) => set({ gender: v as FilterFacets['gender'] })}
        >
          <option value="any">Any</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </Select>

        <Select
          label="Generation"
          value={String(facets.generation ?? 'any')}
          onChange={(v) =>
            set({
              generation:
                v === 'any' ? 'any' : (Number(v) as FilterFacets['generation']),
            })
          }
        >
          <option value="any">Any</option>
          <option value="1">First gen</option>
          <option value="2">Second gen (children)</option>
        </Select>

        <Select
          label="Class"
          value={facets.className ?? 'any'}
          onChange={(v) => set({ className: v })}
        >
          <option value="any">Any</option>
          {classNames.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>

        <Select
          label="Can marry…"
          value={facets.marriageableWithId ?? ''}
          onChange={(v) => set({ marriageableWithId: v || undefined })}
        >
          <option value="">Anyone</option>
          {characters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.gender === 'female' ? ' ♀' : ' ♂'}
            </option>
          ))}
        </Select>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() =>
              onChange({
                query: facets.query,
                gender: 'any',
                generation: 'any',
                className: 'any',
                source: 'any',
                marriageableWithId: undefined,
              })
            }
            className="justify-self-start rounded-panel border border-edge px-3 py-1.5 text-sm text-ink-soft hover:border-gold hover:text-ink sm:col-span-2 lg:col-span-4"
          >
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}
