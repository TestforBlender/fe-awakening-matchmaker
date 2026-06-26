import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import type { Character } from '@/lib/types';
import { applyFilters, allClassNames, type FilterFacets } from '@/lib/search';
import { useMatchStore } from '@/store/useMatchStore';
import { SearchInput } from './SearchInput';
import { FilterBar } from './FilterBar';
import { CharacterCard } from './CharacterCard';
import { CharacterDetailModal } from './CharacterDetailModal';
import { MatchZone } from '@/components/match/MatchZone';
import { ResultPanel } from '@/components/result/ResultPanel';
import { Portrait } from '@/components/ui/Portrait';
import type { AppData } from '@/lib/data';

const DEFAULT_FACETS: FilterFacets = {
  query: '',
  gender: 'any',
  generation: 'any',
  className: 'any',
  source: 'any',
};

function placeMessage(result: string, name: string): string {
  switch (result) {
    case 'placed-a':
      return `${name} placed in slot 1.`;
    case 'placed-b':
      return `${name} placed in slot 2.`;
    case 'duplicate':
      return `${name} is already in the match zone.`;
    case 'full':
      return 'Match zone is full \u2014 remove someone first.';
    case 'removed':
      return `${name} removed from the match zone.`;
    case 'dropped':
      return `${name} placed.`;
    default:
      return '';
  }
}

export function CharacterGallery({ data }: { data: AppData }) {
  const { roster, pairings, supports } = data;
  const [facets, setFacets] = useState<FilterFacets>(DEFAULT_FACETS);
  const [detail, setDetail] = useState<Character | null>(null);
  const [announce, setAnnounce] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const slots = useMatchStore((s) => s.slots);
  const slotA = slots[0] ? roster.byId.get(slots[0]!) ?? null : null;
  const slotB = slots[1] ? roster.byId.get(slots[1]!) ?? null : null;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } })
  );

  const classNames = useMemo(() => allClassNames(roster.all), [roster]);
  const matesOf = useMemo(
    () => (id: string) => roster.byId.get(id)?.marriageableWith ?? [],
    [roster]
  );
  const results = useMemo(
    () => applyFilters(roster.all, facets, matesOf),
    [roster, facets, matesOf]
  );

  const onPlaceFeedback = (result: string, character: Character) =>
    setAnnounce(placeMessage(result, character.name));

  const activeChar = activeId ? roster.byId.get(activeId) ?? null : null;

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const overId = e.over?.id;
    if (overId !== 'slot-0' && overId !== 'slot-1') return;
    const index = overId === 'slot-0' ? 0 : 1;
    const charId = String(e.active.id);
    useMatchStore.getState().moveToSlot(index, charId);
    const c = roster.byId.get(charId);
    if (c) onPlaceFeedback('dropped', c);
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <ResultPanel
        a={slotA}
        b={slotB}
        roster={roster}
        pairings={pairings}
        supports={supports}
        onSelectChild={setDetail}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_19rem]">
        {/* Left: search + filters + grid */}
        <div className="space-y-4 pb-40 lg:pb-2">
          <SearchInput
            value={facets.query ?? ''}
            onChange={(query) => setFacets((f) => ({ ...f, query }))}
          />
          <FilterBar
            facets={facets}
            onChange={setFacets}
            classNames={classNames}
            characters={roster.all}
          />

          <h2 className="sr-only">Characters</h2>
          <p className="text-sm text-ink-soft">
            {results.length} character{results.length === 1 ? '' : 's'}
          </p>

          {results.length === 0 ? (
            <div className="rounded-panel border border-edge bg-surface-raised p-8 text-center">
              <p className="font-display text-lg text-ink">No matches</p>
              <p className="mt-1 text-sm text-ink-soft">
                Try clearing the search or filters.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {results.map((c) => (
                <li key={c.id}>
                  <CharacterCard
                    character={c}
                    onOpenDetail={setDetail}
                    onPlaceFeedback={onPlaceFeedback}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right: match zone (sticky sidebar on desktop; fixed bottom bar on mobile) */}
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <MatchZone roster={roster} />
        </aside>
      </div>

      {/* Floating preview while dragging */}
      <DragOverlay dropAnimation={null}>
        {activeChar ? (
          <div className="w-24 rotate-3 opacity-90">
            <Portrait
              id={activeChar.id}
              name={activeChar.name}
              subtitle={activeChar.epithet}
              decorative
            />
          </div>
        ) : null}
      </DragOverlay>

      <CharacterDetailModal
        character={detail}
        roster={roster}
        couple={slotA && slotB ? [slotA, slotB] : null}
        onClose={() => setDetail(null)}
        onPlaceFeedback={onPlaceFeedback}
      />

      {/* Screen-reader announcements */}
      <div className="sr-only" role="status" aria-live="polite">
        {announce}
      </div>
    </DndContext>
  );
}
