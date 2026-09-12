<script setup lang="ts">
import { computed, ref } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import {
  ClientSideRowModelModule,
  ModuleRegistry,
  enableDevValidations,
  themeQuartz,
  RowSelectionModule,
  type ColDef,
  type GetDataPath,
  type GetRowIdParams,
  type RowSelectionOptions,
  type ValueGetterParams,
  type SelectionChangedEvent,
} from 'ag-grid-community'
import { TreeDataModule } from 'ag-grid-enterprise'
import type { TreeItem, TreeStore } from '@/store/TreeStore'
import { buildDataPaths, getRowCategory } from '@/store/buildDataPaths'
import { encodeItemId } from '@/store/encodeItemsIds'

type Props = {
  store: TreeStore;
  rowData: TreeItem[];
  isLoading: boolean;
}

type Emits = {
  select: [item: TreeItem | null]
}

type GridRow = TreeItem & { path: string[] }


if (import.meta.env.DEV) {
  enableDevValidations()
}

ModuleRegistry.registerModules([ClientSideRowModelModule, TreeDataModule, RowSelectionModule])

const props = defineProps<Props>();
const emit = defineEmits<Emits>()

const rows = computed<GridRow[]>(() => {
  const pathMap = buildDataPaths(props.store)
  return props.rowData.map((item) => ({
    ...item,
    path: pathMap.get(item.id) ?? [encodeItemId(item.id)],
  }))
})

const theme = themeQuartz.withParams({
  headerBackgroundColor: '#f3f3f3',
  headerFontWeight: 600,
  borderColor: '#e5e5e5',
  wrapperBorder: false,
  wrapperBorderRadius: 0,
})

const columnDefs: ColDef<GridRow>[] = [
  {
    headerName: '№ п\\п',
    colId: 'rowNumber',
    width: 90,
    maxWidth: 120,
    valueGetter: (params: ValueGetterParams<GridRow>) =>
      params.node?.rowIndex != null ? params.node.rowIndex + 1 : '',
  },
  {
    headerName: 'Категория',
    colId: 'category',
    flex: 1,
    minWidth: 240,
    showRowGroup: true,
    cellRenderer: 'agGroupCellRenderer',
    cellRendererParams: {
      suppressCount: true,
    },
    valueGetter: (params: ValueGetterParams<GridRow>) => {
      if (!params.data) return ''
      return getRowCategory(props.store, params.data)
    },
  },
  {
    headerName: 'Наименование',
    field: 'label',
    flex: 1,
    minWidth: 200,
  },
]

const defaultColDef: ColDef<GridRow> = {
  sortable: false,
  filter: false,
  resizable: true,
  suppressHeaderMenuButton: true,
}

const rowSelection: RowSelectionOptions = {
  mode: 'singleRow',
  checkboxLocation:'selectionColumn',
}

const groupDefaultExpanded = ref(-1)

const getDataPath: GetDataPath<GridRow> = (data) => data.path

const getRowId = (params: GetRowIdParams<GridRow>) => encodeItemId(params.data.id)

const onSelectionChanged = (event: SelectionChangedEvent<GridRow>) => {
  if (event.source === 'rowDataChanged') return
  const [row] = event.api.getSelectedRows()
  emit('select', row ?? null)
}
</script>

<template>
  <div style="height: 100%">
    <ag-grid-vue
      style="width: 100%; height: 100%"
      :column-defs="columnDefs"
      :default-col-def="defaultColDef"
      :row-data="rows"
      :row-selection="rowSelection"
      :tree-data="true"
      :group-default-expanded="groupDefaultExpanded"
      :get-data-path="getDataPath"
      :get-row-id="getRowId"
      :theme="theme"
      :loading="isLoading"
      :reset-row-data-on-update="true"
      tree-data-display-type="custom"
      @selection-changed="onSelectionChanged"
    />
  </div>
</template>

<style scoped></style>
