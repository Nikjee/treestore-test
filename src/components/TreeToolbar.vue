<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ItemId, TreeItem, TreeStore } from '@/store/TreeStore';
import { decodeItemId, encodeItemId } from '@/store/encodeItemsIds';

type Props = {
  store: TreeStore;
  items: TreeItem[];
  selected: TreeItem | null;
  disabled?: boolean;
};

type Emits = {
  add: [label: string];
  update: [patch: { label: string; parent: ItemId | null }];
  remove: [];
  GetAllParents: [];
  GetAllChildren: [];
  Reload: [];
};

const ROOT_PARENT = '';

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const label = ref('');
const parent = ref(ROOT_PARENT);

const encodeParent = (id: ItemId | null): string => {
  if (id === null) return ROOT_PARENT;
  return encodeItemId(id);
};

const decodeParent = (value: string): ItemId | null => {
  if (value === ROOT_PARENT) return null;
  return decodeItemId(value);
};

const parentOptions = computed(() => {
  void props.items;
  const current = props.selected;
  const blocked = new Set<ItemId>();
  if (current) {
    blocked.add(current.id);
    for (const child of props.store.getAllChildren(current.id)) {
      blocked.add(child.id);
    }
  }

  return props.store
    .getAll()
    .filter((item) => !blocked.has(item.id))
    .map((item) => ({
      value: encodeParent(item.id),
      label: String(item.label ?? item.id),
    }));
});

const canEdit = computed(() => !props.disabled && Boolean(props.selected));

watch(
  () => props.selected,
  (item) => {
    if (!item) {
      label.value = '';
      parent.value = ROOT_PARENT;
      return;
    }

    label.value = String(item.label ?? '');
    parent.value = encodeParent(item.parent);
  },
  { immediate: true },
);

const updateEntity = () => {
  if (!props.selected) return;

  emit('update', {
    label: label.value,
    parent: decodeParent(parent.value),
  });
};
</script>

<template>
  <div class="toolbar">
    <div class="toolbar-actions">
      <button
        type="button"
        data-test="add-item"
        :disabled="disabled"
        @click="emit('add', label)"
      >
        Добавить
      </button>
      <button
        type="button"
        data-test="update-item"
        :disabled="!canEdit"
        @click="updateEntity"
      >
        Изменить
      </button>
      <button
        type="button"
        data-test="remove-item"
        :disabled="!canEdit"
        @click="emit('remove')"
      >
        Удалить
      </button>
      <button
        type="button"
        data-test="get-all-children"
        :disabled="!canEdit"
        @click="emit('GetAllChildren')"
      >
        GetAllChildren
      </button>
      <button
        type="button"
        data-test="get-all-parents"
        :disabled="!canEdit"
        @click="emit('GetAllParents')"
      >
        GetAllParents
      </button>
      <button
        type="button"
        data-test="reload-data"
        :disabled="disabled"
        @click="emit('Reload')"
      >
        Reload data
      </button>
    </div>
    <div class="toolbar-fields">
      <label class="field">
        Название
        <input
          v-model="label"
          type="text"
          data-test="edit-label"
          :disabled="disabled"
        >
      </label>
      <label class="field">
        Родитель
        <select
          v-model="parent"
          :disabled="!canEdit"
          data-test="edit-parent"
        >
          <option :value="ROOT_PARENT">Корневой элемент</option>
          <option
            v-for="option in parentOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>
    </div>
  </div>
</template>

<style scoped lang="scss">
.toolbar {
  flex: 0 0 auto;

  &-actions,
  &-fields {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &-fields {
    margin-top: 8px;
  }

  button {
    padding: 6px 12px;
    border: 1px solid #cfcfcf;
    border-radius: 4px;
    background: #f7f7f7;
    color: #000;
    font-size: 13px;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: #ececec;
    }

    &:disabled {
      color: #999;
      cursor: not-allowed;
    }
  }
}

.field {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #000;
  font-size: 13px;

  input,
  select {
    min-width: 180px;
    padding: 6px 8px;
    border: 1px solid #cfcfcf;
    border-radius: 4px;
    background: #fff;
    color: #000;
    font-size: 13px;

    &:disabled {
      background: #f5f5f5;
      color: #999;
    }
  }
}
</style>
