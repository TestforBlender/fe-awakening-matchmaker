import type { Character, RosterIndex } from '@/lib/types';
import { contextualParents } from '@/lib/children';
import { Modal } from '@/components/ui/Modal';
import { Portrait } from '@/components/ui/Portrait';
import { Sprite } from '@/components/ui/Sprite';
import { Tag } from '@/components/ui/Tag';
import { Section } from '@/components/ui/Section';
import { useMatchStore } from '@/store/useMatchStore';

interface DetailProps {
  character: Character | null;
  roster: RosterIndex;
  onClose: () => void;
  onPlaceFeedback?: (result: string, character: Character) => void;
  /** The active match couple, if any. Lets a child show BOTH parents. */
  couple?: [Character, Character] | null;
}

export function CharacterDetailModal({
  character,
  roster,
  onClose,
  onPlaceFeedback,
  couple,
}: DetailProps) {
  const place = useMatchStore((s) => s.place);
  if (!character) return null;

  const c = character;
  const fixedParent = c.fixedParentId ? roster.byId.get(c.fixedParentId) ?? null : null;

  // If we have the active couple and this child belongs to it, show BOTH
  // parents (the fixed one plus the other half of the couple).
  const contextual = contextualParents(c, couple);
  const parents: Character[] = contextual ?? [];
  const parentTag =
    parents.length === 2
      ? `Child of ${parents[0].name} & ${parents[1].name}`
      : fixedParent
        ? `Child of ${fixedParent.name}`
        : null;

  // Resolve marriage partners present in the roster; note any not yet added.
  const presentMates = c.marriageableWith
    .map((id) => roster.byId.get(id))
    .filter((m): m is Character => m != null);
  const missingCount = c.marriageableWith.length - presentMates.length;

  return (
    <Modal open onClose={onClose} title={`${c.name} details`}>
      <div className="flex items-start gap-4">
        <div className="w-28 shrink-0">
          <Portrait id={c.id} name={c.name} decorative />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Sprite id={c.id} name={c.name} className="h-9 w-9" />
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">
                {c.name}
              </h2>
              <p className="text-sm text-goldtext">{c.epithet}</p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Tag variant="gold">Gen {c.generation}</Tag>
            <Tag>{c.gender === 'female' ? 'Female ♀' : 'Male ♂'}</Tag>
            {parentTag && <Tag variant="rose">{parentTag}</Tag>}
          </div>
          <button
            type="button"
            onClick={() => {
              const r = place(c.id);
              onPlaceFeedback?.(r, c);
            }}
            className="mt-3 rounded-panel border border-gold/60 bg-gold/10 px-3 py-1.5 text-sm font-semibold text-goldtext hover:bg-gold hover:text-navy-deep"
          >
            ＋ Send to Match Zone
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
      <Section title="Personality">
        <p className="text-sm leading-relaxed text-ink-soft">{c.personality}</p>
      </Section>

      <Section title="Recruitment">
        <p className="text-sm leading-relaxed text-ink-soft">{c.recruitment}</p>
      </Section>

      {c.generation === 2 && fixedParent && (
        <Section title="Parents">
          {parents.length === 2 ? (
            <div className="flex flex-wrap gap-2">
              {parents.map((p) => (
                <span
                  key={p.id}
                  className="flex items-center gap-2 rounded-panel border border-edge bg-surface px-2.5 py-1.5"
                >
                  <Sprite id={p.id} name={p.name} className="h-7 w-7" decorative />
                  <span className="text-sm text-ink">{p.name}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-ink-soft">
              Always {fixedParent.name}’s child. The other parent depends on who{' '}
              {fixedParent.name} marries — pair them in the match zone to see the
              full lineage.
            </p>
          )}
        </Section>
      )}

      {c.inheritanceNotes && (
        <Section title="Inheritance">
          <p className="text-sm leading-relaxed text-ink-soft">
            {c.inheritanceNotes}
          </p>
        </Section>
      )}

      <Section title="Available classes">
        <div className="flex flex-wrap gap-1.5">
          {c.availableClasses.map((cl) => (
            <Tag key={cl}>{cl}</Tag>
          ))}
        </div>
      </Section>

      {c.notableSkills && c.notableSkills.length > 0 && (
        <Section title="Notable skills">
          <div className="flex flex-wrap gap-1.5">
            {c.notableSkills.map((s) => (
              <Tag key={s} variant="gold">
                {s}
              </Tag>
            ))}
          </div>
        </Section>
      )}

      <Section title="Can marry">
        {presentMates.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {presentMates.map((m) => (
              <Tag key={m.id} variant="rose">
                {m.name}
              </Tag>
            ))}
            {missingCount > 0 && (
              <span className="text-xs text-ink-soft">
                +{missingCount} more added as the roster grows
              </span>
            )}
          </div>
        ) : missingCount > 0 ? (
          <p className="text-xs text-ink-soft">
            {missingCount} partner{missingCount > 1 ? 's' : ''} — added as the
            roster grows.
          </p>
        ) : (
          <p className="text-xs text-ink-soft">No marriage partners.</p>
        )}
      </Section>
      </div>
    </Modal>
  );
}
