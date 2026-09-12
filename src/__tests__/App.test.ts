import { defineComponent } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { TreeStore, type TreeItem } from '@/store/TreeStore';

const loadItems = vi.fn<() => Promise<TreeItem[]>>();

vi.mock('@/api/loadData', () => ({
  loadData: () => loadItems(),
}));

vi.mock('@/components/TreeTable.vue', () => ({
  default: defineComponent({
    name: 'TreeTable',
    props: {
      store: { type: Object, required: true },
      rowData: { type: Array, required: true },
      isLoading: { type: Boolean, required: true },
    },
    emits: ['select'],
    template: '<div class="table-mock">{{ isLoading ? \'loading\' : \'ready\' }}:{{ rowData.length }}</div>',
  }),
}));

describe('App', () => {
  beforeEach(() => {
    loadItems.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('Keep tree store empty and shows loading until fetch resolves with items', async () => {
    let resolveItems: (value: TreeItem[]) => void = () => { };

    loadItems.mockReturnValue(
      new Promise<TreeItem[]>((resolve) => {
        resolveItems = resolve;
      }),
    );

    const { default: App } = await import('../App.vue');
    const wrapper = mount(App);
    await flushPromises();

    expect(wrapper.text()).toContain('loading:0');

    resolveItems([{ id: 1, parent: null, label: 'Item 1' }]);
    await flushPromises();

    expect(wrapper.text()).toContain('ready:1');
    const store = wrapper.findComponent({ name: 'TreeTable' }).props('store') as TreeStore;
    expect(store.getItem(1)?.label).toBe('Item 1');
  });

  it('adds a root item when nothing is selected', async () => {
    loadItems.mockResolvedValue([{ id: 1, parent: null, label: 'Item 1' }]);

    const { default: App } = await import('../App.vue');
    const wrapper = mount(App);
    await flushPromises();

    await wrapper.get('[data-test="add-item"]').trigger('click');

    const store = wrapper.findComponent({ name: 'TreeTable' }).props('store') as TreeStore;
    const added = store.getAll().find((item) => item.id !== 1);
    expect(added?.parent).toBeNull();
    expect(store.getChildren(1)).toEqual([]);
  });

  it('adds a child to the selected item', async () => {
    const root: TreeItem = { id: 1, parent: null, label: 'Item 1' };
    loadItems.mockResolvedValue([root]);

    const { default: App } = await import('../App.vue');
    const wrapper = mount(App);
    await flushPromises();

    wrapper.findComponent({ name: 'TreeTable' }).vm.$emit('select', root);
    await wrapper.get('[data-test="add-item"]').trigger('click');

    const store = wrapper.findComponent({ name: 'TreeTable' }).props('store') as TreeStore;
    expect(store.getChildren(1)).toHaveLength(1);
  });

  it('updates the selected item label and parent', async () => {
    const items: TreeItem[] = [
      { id: 1, parent: null, label: 'Item 1' },
      { id: 2, parent: 1, label: 'Item 2' },
      { id: 3, parent: 1, label: 'Item 3' },
    ];
    loadItems.mockResolvedValue(items);

    const { default: App } = await import('../App.vue');
    const wrapper = mount(App);
    await flushPromises();

    wrapper.findComponent({ name: 'TreeTable' }).vm.$emit('select', items[2]);
    await flushPromises();

    await wrapper.get('[data-test="edit-label"]').setValue('New label');
    await wrapper.get('[data-test="edit-parent"]').setValue('n:2');
    await wrapper.get('[data-test="update-item"]').trigger('click');

    const store = wrapper.findComponent({ name: 'TreeTable' }).props('store') as TreeStore;
    expect(store.getItem(3)?.label).toBe('New label');
    expect(store.getItem(3)?.parent).toBe(2);
    expect(store.getChildren(2).map((item) => item.id)).toEqual([3]);
  });
});
