<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { loadData } from './api/loadData'
import TreeTable from './components/TreeTable.vue'
import { useTreeStore } from './composables/useTreeStore.ts'
import type { ItemId, TreeItem } from './store/TreeStore.ts'
import TreeToolbar from './components/TreeToolbar.vue'

const { store, items, setItems, addItem, removeItem, updateItem } = useTreeStore([])
const isLoading = ref(true)

const selected = ref<TreeItem | null>(null)

const selectedTreeItem = computed(() => {
  void items.value
  if (!selected.value) return null
  return store.getItem(selected.value.id) ?? null
})

const createId = () => crypto.randomUUID().slice(0, 8)

const onSelect = (item: TreeItem | null) => {
  selected.value = item
}

const addEntity = (label: string) => {
  const parent = selectedTreeItem.value?.id ?? null
  addItem({
    id: createId(),
    parent,
    label,
  })
}

const removeEntity = () => {
  if (!selectedTreeItem.value) return
  removeItem(selectedTreeItem.value.id)
  selected.value = null
}

const updateEntity = (patch: { label: string; parent: ItemId | null }) => {
  const current = selectedTreeItem.value
  if (!current) return

  updateItem({
    id: current.id,
    parent: patch.parent,
    label: patch.label.trim() || String(current.id),
  })
}

onMounted(async () => {
  const data = await loadData()
  setItems(data)
  isLoading.value = false
})
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
    />
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
</style>
