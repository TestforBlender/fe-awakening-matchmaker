import { create } from 'zustand';

export type SlotIndex = 0 | 1;
export type PlaceResult = 'placed-a' | 'placed-b' | 'duplicate' | 'full';

interface MatchState {
  /** Two match slots; null = empty. Holds character ids. */
  slots: [string | null, string | null];
  /** Place a character in the first empty slot. */
  place: (id: string) => PlaceResult;
  /** Drag a unit onto a slot: place it there, vacating the other slot if it
   *  was the same unit (move rather than block). Replaces an occupant. */
  moveToSlot: (index: SlotIndex, id: string) => void;
  /** Clear one slot. */
  removeSlot: (index: SlotIndex) => void;
  /** Clear both. */
  clear: () => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  slots: [null, null],

  place: (id) => {
    const [a, b] = get().slots;
    if (a === id || b === id) return 'duplicate';
    if (a === null) {
      set({ slots: [id, b] });
      return 'placed-a';
    }
    if (b === null) {
      set({ slots: [a, id] });
      return 'placed-b';
    }
    return 'full';
  },

  removeSlot: (index) =>
    set((s) => {
      const next: [string | null, string | null] = [...s.slots];
      next[index] = null;
      return { slots: next };
    }),

  moveToSlot: (index, id) =>
    set((s) => {
      const other = index === 0 ? 1 : 0;
      const next: [string | null, string | null] = [...s.slots];
      if (next[other] === id) next[other] = null; // unit moved from other slot
      next[index] = id;
      return { slots: next };
    }),

  clear: () => set({ slots: [null, null] }),
}));
