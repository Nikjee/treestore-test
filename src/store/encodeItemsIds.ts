import type { ItemId } from '@/store/TreeStore';

export function encodeItemId(id: ItemId): string {
  return typeof id === 'number' ? `n:${id}` : `s:${id}`;
}

export function decodeItemId(value: string): ItemId {
  if (value.startsWith('n:')) return Number(value.slice(2));
  if (value.startsWith('s:')) return value.slice(2);
  return value;
}
