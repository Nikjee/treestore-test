import { TreeStore, type ItemId, type TreeItem } from "@/store/TreeStore";
import { computed, ref } from "vue";

export const useTreeStore = (initialData: TreeItem[]) => {
  const store = new TreeStore(initialData);
  const updateCnt = ref(0);

  const bump = () => {
    updateCnt.value += 1
  }

  const items = computed(() => {
    void updateCnt.value;
    return store.getAll().slice();
  })

  const setItems = (data: TreeItem[]) => {
    store.setItems(data);
    bump();
  }

  const addItem = (item: TreeItem) => {
    store.addItem(item);
    bump();
  }

  const removeItem = (id: ItemId) => {
    store.removeItem(id);
    bump();
  }

  const updateItem = (item: TreeItem) => {
    store.updateItem(item);
    bump();
  }

  return {
    store,
    items,
    setItems,
    addItem,
    removeItem,
    updateItem,
  }
}
