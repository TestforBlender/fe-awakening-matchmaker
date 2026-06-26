import { describe, it, expect, beforeEach } from 'vitest';
import { useMatchStore } from './useMatchStore';

const reset = () => useMatchStore.setState({ slots: [null, null] });
const slots = () => useMatchStore.getState().slots;

describe('match store', () => {
  beforeEach(reset);

  it('places into the first empty slot', () => {
    expect(useMatchStore.getState().place('chrom')).toBe('placed-a');
    expect(useMatchStore.getState().place('olivia')).toBe('placed-b');
    expect(slots()).toEqual(['chrom', 'olivia']);
  });

  it('rejects duplicates', () => {
    useMatchStore.getState().place('chrom');
    expect(useMatchStore.getState().place('chrom')).toBe('duplicate');
    expect(slots()).toEqual(['chrom', null]);
  });

  it('reports full when both slots are taken', () => {
    useMatchStore.getState().place('chrom');
    useMatchStore.getState().place('olivia');
    expect(useMatchStore.getState().place('sumia')).toBe('full');
    expect(slots()).toEqual(['chrom', 'olivia']);
  });

  it('removes a slot', () => {
    useMatchStore.getState().place('chrom');
    useMatchStore.getState().place('olivia');
    useMatchStore.getState().removeSlot(0);
    expect(slots()).toEqual([null, 'olivia']);
  });

  it('clears both slots', () => {
    useMatchStore.getState().place('chrom');
    useMatchStore.getState().place('olivia');
    useMatchStore.getState().clear();
    expect(slots()).toEqual([null, null]);
  });

  it('moveToSlot replaces an occupant', () => {
    useMatchStore.getState().place('chrom');
    useMatchStore.getState().place('olivia');
    useMatchStore.getState().moveToSlot(1, 'sumia'); // drop sumia onto slot 2
    expect(slots()).toEqual(['chrom', 'sumia']);
  });

  it('moveToSlot moves a unit from the other slot (no duplication)', () => {
    useMatchStore.getState().place('chrom'); // slot 0
    useMatchStore.getState().moveToSlot(1, 'chrom'); // drag chrom to slot 1
    expect(slots()).toEqual([null, 'chrom']);
  });
});
