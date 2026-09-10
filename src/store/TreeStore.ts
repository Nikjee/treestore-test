export type ItemId = string | number

export interface TreeItem {
  id: ItemId;
  parent: ItemId | null;
  label?: string;
  [key: string]: unknown;
}

export class TreeStore {
  private items: TreeItem[] = [];
  private readonly itemsById = new Map<ItemId, TreeItem>();
  private readonly childrenByParent = new Map<ItemId | null, TreeItem[]>();

  constructor(items: TreeItem[]) {
    this.setItems(items);
  }

  setItems(items: TreeItem[]): void {
    this.items = items;
    this.buildIndexes();
  }

  getAll(): TreeItem[] {
    return this.items;
  }

  getItem(id: ItemId): TreeItem | undefined {
    return this.itemsById.get(id);
  }

  getChildren(id: ItemId): TreeItem[] {
    return this.childrenByParent.get(id) ?? [];
  }

  addItem(item: TreeItem): void {
    this.items.push(item);
    this.indexItem(item);
  }

  getAllChildren(id: ItemId): TreeItem[] {
    const result: TreeItem[] = [];
    const stack = this.getChildren(id).slice().reverse();

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) continue;

      result.push(current);

      const children = this.getChildren(current.id);
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        if (child) stack.push(child);
      }
    }

    return result;
  }

  getAllParents(id: ItemId): TreeItem[] {
    const start = this.itemsById.get(id);
    if (!start) return [];

    const result: TreeItem[] = [start];
    let current: TreeItem | undefined = start;

    while (current && current.parent !== null && current.parent !== undefined) {
      current = this.itemsById.get(current.parent);
      if (!current) break;
      result.push(current);
    }

    return result;
  }

  removeItem(id: ItemId): void {
    const item = this.itemsById.get(id);
    if (!item) return;

    const toRemove = [item, ...this.getAllChildren(id)];

    const removableIds = new Set<ItemId>(toRemove.map(i => i.id));
    this.items = this.items.filter(i => !removableIds.has(i.id));

    for (const item of toRemove) {
      this.itemsById.delete(item.id);
      this.childrenByParent.delete(item.id);
      this.removeFromParent(item);
    }
  }

  updateItem(item: TreeItem): void {
    const existing = this.itemsById.get(item.id);
    if (!existing) return;

    Object.assign(existing, item);

  }

  private removeFromParent(child: TreeItem): void {
    const children = this.childrenByParent.get(child.parent);
    if (!children) return;

    const index = children.indexOf(child);
    children.splice(index, 1);
  }

  private appendToParent(item: TreeItem): void {
    const children = this.childrenByParent.get(item.parent);
    if (children) {
      children.push(item);
      return;
    }

    this.childrenByParent.set(item.parent, [item]);
  }

  private indexItem(item: TreeItem): void {
    this.itemsById.set(item.id, item);
    this.appendToParent(item);
  }

  private buildIndexes(): void {
    this.itemsById.clear();
    this.childrenByParent.clear();

    for (const item of this.items) {
      this.indexItem(item);
    }
  }

}
