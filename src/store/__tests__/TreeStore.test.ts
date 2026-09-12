import { describe, expect, it } from 'vitest';
import { TreeStore, type TreeItem } from '../TreeStore';

const testData: TreeItem[] = [
  { id: 1, parent: null, label: 'Item 1' },
  { id: '6346sdfxd12', parent: 1, label: 'Item 2' },
  { id: 3, parent: 1, label: 'Item 3' },
  { id: 4, parent: '6346sdfxd12', label: 'Item 4' },
  { id: 5, parent: '6346sdfxd12', label: 'Item 5' },
  { id: 6, parent: '6346sdfxd12', label: 'Item 6' },
  { id: 7, parent: 4, label: 'Item 7' },
  { id: 8, parent: 4, label: 'Item 8' },
];

function labels(items: TreeItem[]) {
  return items.map((item) => item.label);
}

function createStore(): TreeStore {
  return new TreeStore(testData.map((item) => ({ ...item })));
}

describe('TreeStore', () => {
  it('Construct empty without passed items', () => {
    const store = new TreeStore();

    expect(store.getAll()).toEqual([]);
  });

  it('Get all items in insertion order', () => {
    const items = testData.map((item) => ({ ...item }));
    const store = new TreeStore(items);

    expect(store.getAll()).toBe(items);
    expect(store.getAll()[0]).toBe(items[0]);
  });

  it('Get item by id with both number and string', () => {
    const store = createStore();

    expect(store.getItem(1)?.label).toBe('Item 1');
    expect(store.getItem('6346sdfxd12')?.label).toBe('Item 2');
    expect(store.getItem(3)?.label).toBe('Item 3');
    expect(store.getItem(999)).toBeUndefined();
  });

  it('Does not mistake number ids for strings', () => {
    const store = new TreeStore([
      { id: 1, parent: null, label: 'numeric' },
      { id: '1', parent: null, label: 'string' },
    ]);

    expect(store.getItem(1)?.label).toBe('numeric');
    expect(store.getItem('1')?.label).toBe('string');
  });

  it('getChildren returns direct children in source order', () => {
    const store = createStore();

    expect(labels(store.getChildren(1))).toEqual(['Item 2', 'Item 3']);
    expect(labels(store.getChildren('6346sdfxd12'))).toEqual(['Item 4', 'Item 5', 'Item 6']);
    expect(labels(store.getChildren(4))).toEqual(['Item 7', 'Item 8']);
  });

  it('getChildren returns an empty array when there are no children', () => {
    const store = createStore();

    expect(store.getChildren(7)).toEqual([]);
    expect(store.getChildren(3)).toEqual([]);
    expect(store.getChildren(999)).toEqual([]);
  });

  it('getAllChildren returns every child in order', () => {
    const store = createStore();

    expect(labels(store.getAllChildren(1))).toEqual([
      'Item 2',
      'Item 4',
      'Item 7',
      'Item 8',
      'Item 5',
      'Item 6',
      'Item 3',
    ]);
    expect(labels(store.getAllChildren('6346sdfxd12'))).toEqual([
      'Item 4',
      'Item 7',
      'Item 8',
      'Item 5',
      'Item 6',
    ]);
    expect(store.getAllChildren(7)).toEqual([]);
  });

  it('getAllParents returns the path from the item up to the root', () => {
    const store = createStore();

    expect(labels(store.getAllParents(7))).toEqual(['Item 7', 'Item 4', 'Item 2', 'Item 1']);
    expect(labels(store.getAllParents(1))).toEqual(['Item 1']);
    expect(store.getAllParents(999)).toEqual([]);
  });

  it('setItems replaces all data', () => {
    const store = createStore();

    store.setItems([{ id: 10, parent: null, label: 'Новый корень' }]);

    expect(store.getAll()).toHaveLength(1);
    expect(store.getItem(1)).toBeUndefined();
    expect(store.getItem(10)?.label).toBe('Новый корень');
    expect(store.getChildren(1)).toEqual([]);
  });

  it('addItem adds an item and updates parent children', () => {
    const store = createStore();
    const newItem: TreeItem = { id: 9, parent: 3, label: 'Айтем 9' };

    store.addItem(newItem);

    const lastItem = store.getAll()[store.getAll().length - 1];

    expect(lastItem).toBe(newItem);
    expect(store.getItem(9)).toBe(newItem);
    expect(labels(store.getChildren(3))).toEqual(['Айтем 9']);
    expect(labels(store.getAllChildren(1))).toContain('Айтем 9');
  });

  it('removeItem deletes the item and all of its children', () => {
    const store = createStore();

    store.removeItem('6346sdfxd12');

    expect(store.getItem('6346sdfxd12')).toBeUndefined();
    expect(store.getItem(4)).toBeUndefined();
    expect(store.getItem(7)).toBeUndefined();
    expect(store.getItem(8)).toBeUndefined();
    expect(store.getItem(5)).toBeUndefined();
    expect(store.getItem(6)).toBeUndefined();
    expect(store.getItem(1)).toBeDefined();
    expect(store.getItem(3)).toBeDefined();
    expect(labels(store.getChildren(1))).toEqual(['Item 3']);
    expect(store.getAll()).toHaveLength(2);
  });

  it('updateItem updates the existing object and changes parent link', () => {
    const store = createStore();
    const item = store.getItem(5);
    expect(item).toBeDefined();

    store.updateItem({ id: 5, parent: 3, label: 'Item 5 new' });

    expect(store.getItem(5)).toBe(item);
    expect(store.getItem(5)?.label).toBe('Item 5 new');
    expect(labels(store.getChildren('6346sdfxd12'))).toEqual(['Item 4', 'Item 6']);
    expect(labels(store.getChildren(3))).toEqual(['Item 5 new']);
  });

  it('updateItem does nothing for unknown ids', () => {
    const store = createStore();
    const before = store.getAll().length;

    store.updateItem({ id: 999, parent: null, label: 'missing' });

    expect(store.getAll()).toHaveLength(before);
    expect(store.getItem(999)).toBeUndefined();
  });
});
