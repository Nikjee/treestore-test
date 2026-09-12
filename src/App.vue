<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { loadData } from './api/loadData';
import TreeTable from './components/TreeTable.vue';
import { useTreeStore } from './composables/useTreeStore.ts';
import type { ItemId, TreeItem } from './store/TreeStore.ts';
import TreeToolbar from './components/TreeToolbar.vue';

const { store, items, setItems, addItem, removeItem, updateItem } = useTreeStore([]);
const isLoading = ref(true);

const selected = ref<TreeItem | null>(null);
const debugHint = ref<string | null>(null);

const selectedTreeItem = computed(() => {
  void items.value;
  if (!selected.value) return null;
  return store.getItem(selected.value.id) ?? null;
});

const createId = () => crypto.randomUUID().slice(0, 8);

const onSelect = (item: TreeItem | null) => {
  selected.value = item;
};

const addEntity = (label: string) => {
  const parent = selectedTreeItem.value?.id ?? null;
  addItem({
    id: createId(),
    parent,
    label,
  });
};

const removeEntity = () => {
  if (!selectedTreeItem.value) return;
  removeItem(selectedTreeItem.value.id);
  selected.value = null;
};

const updateEntity = (patch: { label: string; parent: ItemId | null }) => {
  const current = selectedTreeItem.value;
  if (!current) return;

  updateItem({
    id: current.id,
    parent: patch.parent,
    label: patch.label.trim() || String(current.id),
  });
};

const getAllChildren = () => {
  if (!selectedTreeItem.value) return;
  console.log('getAllChildren', store.getAllChildren(selectedTreeItem.value.id));
  debugHint.value = `All children of ${selectedTreeItem.value.label}: [ ${store
    .getAllChildren(selectedTreeItem.value.id)
    .map((item) => item.label)
    .join(', ')} ]`;
};

const getAllParents = () => {
  if (!selectedTreeItem.value) return;
  console.log('getAllParents', store.getAllParents(selectedTreeItem.value.id));
  debugHint.value = `All parents of ${selectedTreeItem.value.label}: [ ${store
    .getAllParents(selectedTreeItem.value.id)
    .map((item) => item.label)
    .join(', ')} ]`;
};

const reloadData = async () => {
  setItems([]);

  isLoading.value = true;

  const data = await loadData();
  setItems(data);

  isLoading.value = false;
};

onMounted(async () => {
  const data = await loadData();
  setItems(data);
  isLoading.value = false;
});
</script>

<template>
  <main class="page">
    <TreeToolbar
      :store="store"
      :items="items"
      :selected="selectedTreeItem"
      :disabled="isLoading"
      @add="addEntity"
      @update="updateEntity"
      @remove="removeEntity"
      @get-all-children="getAllChildren"
      @get-all-parents="getAllParents"
      @reload="reloadData"
    />
    <div
      v-if="debugHint"
      class="debug-info"
    >
      <pre>{{ debugHint }}</pre>
      <button
        type="button"
        @click="debugHint = null"
      >
        X
      </button>
    </div>
    <div class="table-wrap">
      <TreeTable
        :store="store"
        :row-data="items"
        :is-loading="isLoading"
        @select="onSelect"
      />
    </div>
  </main>
</template>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  padding: 16px;
  gap: 12px;
  background: #fff;
}

.table-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
}

.debug-info {
  display: flex;
  align-self: flex-start;
  align-items: center;
  gap: 12px;
  max-width: 100%;
  padding: 0 6px;
  background: #f0f0f0;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-size: 14px;

  & button {
    cursor: pointer;
  }
}
</style>
