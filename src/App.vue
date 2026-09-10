<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { loadData } from './api/loadData'
import TreeTable from './components/TreeTable.vue'

const isLoading = ref(true)

onMounted(async () => {
  const data = await loadData()
  // TODO: Set data for tree later.
  void data
  isLoading.value = false
})
</script>

<template>
  <main class="page">
    <div class="table-wrap">
      <TreeTable />
    </div>
  </main>
</template>

<style scoped>
.page {
  height: 100%;
  box-sizing: border-box;
  padding: 16px;
  background: #fff;
}

.table-wrap {
  position: relative;
  height: 100%;
}
</style>
