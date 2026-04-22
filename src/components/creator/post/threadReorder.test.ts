import { describe, it, expect } from 'vitest';
import { reorderThread, insertThreadAt, removeThreadAt } from './threadReorder';
import type { ThreadItem } from './ThreadComposer';

const make = (n: number): ThreadItem[] =>
  Array.from({ length: n }, (_, i) => ({ id: `t-${i}`, content: `item ${i}` }));

describe('reorderThread', () => {
  it('moves an item from one index to another', () => {
    const items = make(3);
    const next = reorderThread(items, 0, 2);
    expect(next.map(i => i.id)).toEqual(['t-1', 't-2', 't-0']);
  });

  it('is a no-op when from === to', () => {
    const items = make(3);
    expect(reorderThread(items, 1, 1)).toBe(items);
  });

  it('returns the input unchanged for out-of-range from', () => {
    const items = make(3);
    expect(reorderThread(items, -1, 1)).toBe(items);
    expect(reorderThread(items, 99, 1)).toBe(items);
  });

  it('returns the input unchanged for out-of-range to', () => {
    const items = make(3);
    expect(reorderThread(items, 0, -1)).toBe(items);
    expect(reorderThread(items, 0, 99)).toBe(items);
  });
});

describe('insertThreadAt', () => {
  it('inserts at the requested index', () => {
    const items = make(2);
    const next = insertThreadAt(items, 1, { id: 'new', content: 'X' });
    expect(next.map(i => i.id)).toEqual(['t-0', 'new', 't-1']);
  });

  it('clamps an above-length index to the end', () => {
    const items = make(2);
    const next = insertThreadAt(items, 99, { id: 'new', content: 'X' });
    expect(next.map(i => i.id)).toEqual(['t-0', 't-1', 'new']);
  });

  it('clamps a negative index to 0', () => {
    const items = make(2);
    const next = insertThreadAt(items, -5, { id: 'new', content: 'X' });
    expect(next.map(i => i.id)).toEqual(['new', 't-0', 't-1']);
  });
});

describe('removeThreadAt', () => {
  it('removes the item at the requested index', () => {
    const items = make(3);
    const next = removeThreadAt(items, 1);
    expect(next.map(i => i.id)).toEqual(['t-0', 't-2']);
  });

  it('refuses to remove the last item', () => {
    const items = make(1);
    expect(removeThreadAt(items, 0)).toBe(items);
  });

  it('returns the input unchanged for an out-of-range index', () => {
    const items = make(3);
    expect(removeThreadAt(items, -1)).toBe(items);
    expect(removeThreadAt(items, 99)).toBe(items);
  });
});
