import type { ItemId, TreeItem, TreeStore } from '@/store/TreeStore'
import { encodeItemId } from '@/store/encodeItemsIds'

export const buildDataPaths = (store: TreeStore): Map<ItemId, string[]> => {
  const paths = new Map<ItemId, string[]>();

  for (const item of store.getAll()) {
    if (paths.has(item.id)) continue;

    const itemsToRoot: string[] = [];
    let current: TreeItem | undefined = item;

    while (current) {
      itemsToRoot.push(encodeItemId(current.id));
      if (current.parent === null || current.parent === undefined) break;
      current = store.getItem(current.parent);
    }

    paths.set(item.id, itemsToRoot.reverse())
  }

  return paths
}

export const getRowCategory = (store: TreeStore, item: TreeItem) => {
  return store.getChildren(item.id).length > 0 ? 'Группа' : 'Элемент';
}
