import type { TreeItem, ItemId } from '../../TreeStore';

export interface TreeGenOptions {
  levels: number;
  childrenPerNode: number;
}

export const generateTreeData = ({ levels, childrenPerNode }: TreeGenOptions): TreeItem[] => {
  const items: TreeItem[] = [{ id: 1, parent: null, label: 'root' }];
  let nextId = 2;

  const buildLevel = (parents: ItemId[], levels: number): void => {
    if (levels === 0) return;

    const nextParents: ItemId[] = [];
    for (const parent of parents) {
      for (let i = 0; i < childrenPerNode; i++) {
        const id = nextId++;
        items.push({ id, parent, label: `node-${id}` });
        nextParents.push(id);
      }
    }
    buildLevel(nextParents, levels - 1);
  };

  buildLevel([1], levels);
  return items;
};

export const generateChainTree = (length: number): TreeItem[] => {
  const items: TreeItem[] = [{ id: 1, parent: null, label: 'root' }];
  for (let i = 2; i <= length; i++) {
    items.push({ id: i, parent: i - 1, label: `node-${i}` });
  }
  return items;
};

export const generateWideTree = (childCount: number): TreeItem[] => {
  const items: TreeItem[] = [{ id: 1, parent: null, label: 'root' }];
  for (let i = 2; i <= childCount + 1; i++) {
    items.push({ id: i, parent: 1, label: `node-${i}` });
  }
  return items;
};

export const getDeepestId = (items: TreeItem[]): ItemId => {
  return items[items.length - 1]?.id ?? 0;
};

export const getMiddleId = (items: TreeItem[]): ItemId => {
  return items[Math.floor(items.length / 2)]?.id ?? 0;
};
