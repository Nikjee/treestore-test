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
  });

  it('updates reactive items after adding an item', () => {
    const { items: rowData, addItem, setItems } = useTreeStore();
    setItems(items);
    const before = rowData.value;

    addItem({ id: 3, parent: 1, label: 'Item 3' });

    expect(rowData.value).not.toBe(before);
    expect(rowData.value.map((item) => item.id)).toEqual([1, 2, 3]);
  });

  it('updates reactive items after editing an item', () => {
    const { items: rowData, setItems, updateItem } = useTreeStore();
    setItems(items);
    const before = rowData.value;

    updateItem({ id: 2, parent: null, label: 'Updated item' });

    expect(rowData.value).not.toBe(before);
    expect(rowData.value[1]).toEqual({ id: 2, parent: null, label: 'Updated item' });
  });

  it('updates reactive items after removing an item', () => {
    const { items: rowData, removeItem, setItems } = useTreeStore();
    setItems(items);
    const before = rowData.value;

    removeItem(1);

    expect(rowData.value).not.toBe(before);
    expect(rowData.value.length).toEqual(1);
  });
});
