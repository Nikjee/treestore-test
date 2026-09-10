<script setup lang="ts">
import { ref } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import {
  ClientSideRowModelModule,
  ModuleRegistry,
  enableDevValidations,
  type AutoGroupColumnDef,
  type ColDef,
  type GetDataPath,
} from 'ag-grid-community'

import { TreeDataModule } from 'ag-grid-enterprise'

if (import.meta.env.DEV) {
  enableDevValidations()
}

ModuleRegistry.registerModules([ClientSideRowModelModule, TreeDataModule])

const testData = [
  { employeeId: '1', name: 'Alice Johnson', path: ['1'] },
  { employeeId: '2', name: 'Bob Stevens', path: ['1', '2'] },
  { employeeId: '5', name: 'Maya Chen', path: ['1', '2', '5'] },
  { employeeId: '11', name: 'Daniel Park', path: ['1', '2', '5', '11'] },
  { employeeId: '12', name: 'Priya Shah', path: ['1', '2', '5', '12'] },
  { employeeId: '13', name: 'Lucas Meyer', path: ['1', '2', '5', '13'] },
  { employeeId: '6', name: 'Elena Rossi', path: ['1', '2', '6'] },
  { employeeId: '14', name: 'Noah Kim', path: ['1', '2', '6', '14'] },
  { employeeId: '15', name: 'Sofia Alvarez', path: ['1', '2', '6', '15'] },
  { employeeId: '16', name: 'James Wright', path: ['1', '2', '6', '16'] },
  { employeeId: '21', name: 'Emma Liu', path: ['1', '2', '6', '16', '21'] },
  { employeeId: '3', name: 'Tom Bradley', path: ['1', '3'] },
  { employeeId: '7', name: 'Olivia Grant', path: ['1', '3', '7'] },
  { employeeId: '17', name: 'Liam Brooks', path: ['1', '3', '7', '17'] },
  { employeeId: '18', name: 'Ava Patel', path: ['1', '3', '7', '18'] },
  { employeeId: '8', name: 'Henry Cole', path: ['1', '3', '8'] },
  { employeeId: '19', name: 'Chloe Nguyen', path: ['1', '3', '8', '19'] },
  { employeeId: '4', name: 'Jessica Adams', path: ['1', '4'] },
  { employeeId: '9', name: 'Marcus Webb', path: ['1', '4', '9'] },
  { employeeId: '20', name: 'Isla Thompson', path: ['1', '4', '9', '20'] },
  { employeeId: '10', name: 'Nina Volkov', path: ['1', '4', '10'] },
  { employeeId: '22', name: 'Ryan Foster', path: ['1', '4', '10', '22'] },
  { employeeId: '23', name: 'Grace Bennett', path: ['1', '4', '10', '23'] },
  { employeeId: '24', name: 'Owen Clarke', path: ['1', '4', '10', '24'] },
  { employeeId: '25', name: 'Sarah Mitchell', path: ['1', '25'] },
  { employeeId: '26', name: 'Jack Rivera', path: ['1', '25', '26'] },
  { employeeId: '27', name: 'Mia Santos', path: ['1', '25', '26', '27'] },
  { employeeId: '28', name: 'Ethan Walsh', path: ['1', '25', '26', '28'] },
  { employeeId: '29', name: 'Hannah Price', path: ['1', '25', '29'] },
  { employeeId: '30', name: 'Caleb Ortiz', path: ['1', '25', '29', '30'] },
  { employeeId: '31', name: 'Zoe Hart', path: ['1', '25', '29', '31'] },
]

const columnDefs = ref<ColDef[]>([{ field: 'employeeId' }])

const defaultColDef = ref<ColDef>({
  flex: 1,
})

const autoGroupColumnDef = ref<AutoGroupColumnDef>({
  headerName: 'Organisation Chart',
  field: 'name',
  cellRendererParams: {
    suppressCount: true,
  },
})

const rowData = ref<unknown[] | null>(testData)

const groupDefaultExpanded = ref(-1)

const getDataPath = ref<GetDataPath>((data) => data.path)
</script>

<template>
  <div style="height: 100%">
    <ag-grid-vue
      style="width: 100%; height: 100%"
      :column-defs="columnDefs"
      :default-col-def="defaultColDef"
      :auto-group-column-def="autoGroupColumnDef"
      :row-data="rowData"
      :tree-data="true"
      :group-default-expanded="groupDefaultExpanded"
      :get-data-path="getDataPath"
    />
  </div>
</template>

<style scoped></style>
