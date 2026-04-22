/**
 * Pure reducer for thread reorder operations. Extracted so it can be unit-tested
 * without mounting the React component.
 */
import type { ThreadItem } from './ThreadComposer';

export function reorderThread(items: ThreadItem[], fromIndex: number, toIndex: number): ThreadItem[] {
  if (fromIndex === toIndex) return items;
  if (fromIndex < 0 || fromIndex >= items.length) return items;
  if (toIndex < 0 || toIndex >= items.length) return items;
  const next = items.slice();
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function insertThreadAt(items: ThreadItem[], atIndex: number, newItem: ThreadItem): ThreadItem[] {
  const next = items.slice();
  const clamped = Math.max(0, Math.min(atIndex, next.length));
  next.splice(clamped, 0, newItem);
  return next;
}

export function removeThreadAt(items: ThreadItem[], index: number): ThreadItem[] {
  if (items.length <= 1) return items;
  if (index < 0 || index >= items.length) return items;
  return items.filter((_, i) => i !== index);
}
