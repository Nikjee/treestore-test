import { describe, expect, it } from 'vitest';
import { useTreeStore } from '../useTreeStore';
import type { TreeItem } from '@/store/TreeStore';

const items: TreeItem[] = [
  { id: 1, parent: null, label: 'Item 1' },
  { id: 2, parent: 1, label: 'Item 2' },
];

describe('useTreeStore', () => {
  it('starts with an empty store', () => {
    const { store, items: rowData } = useTreeStore();

    expect(store.getAll()).toEqual([]);
    expect(rowData.value).toEqual([]);
  });

  it('replaces items with setItems and returns a new array for Vue', () => {
    const { store, items: rowData, setItems } = useTreeStore();

    setItems(items);

    expect(store.getAll()).toEqual(items);
    expect(rowData.value).toEqual(items);
    expect(rowData.value).not.toBe(store.getAll());
  });
});
