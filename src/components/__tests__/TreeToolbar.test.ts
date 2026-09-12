import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TreeToolbar from '../TreeToolbar.vue';
import { TreeStore, type TreeItem } from '@/store/TreeStore';

const testData: TreeItem[] = [
  { id: 1, parent: null, label: 'Item 1' },
  { id: 2, parent: 1, label: 'Item 2' },
  { id: 3, parent: 1, label: 'Item 3' },
];

const mountToolbar = (selected: TreeItem | null, extra: { disabled?: boolean } = {}) => {
  const storeItems = testData.map((item) => ({ ...item }));
  const store = new TreeStore(storeItems);
  return mount(TreeToolbar, {
    props: {
      store,
      items: storeItems,
      selected: selected ? (store.getItem(selected.id) ?? null) : null,
      disabled: extra.disabled,
    },
  });
};

describe('TreeToolbar', () => {
  it('keeps "add" enabled and edit controls off when nothing is selected', () => {
    const wrapper = mountToolbar(null);

    expect(wrapper.get('[data-test="add-item"]').attributes('disabled')).toBeUndefined();
    expect(wrapper.get('[data-test="update-item"]').attributes('disabled')).toBeDefined();
    expect(wrapper.get('[data-test="remove-item"]').attributes('disabled')).toBeDefined();
    expect(wrapper.get('[data-test="edit-label"]').attributes('disabled')).toBeUndefined();
  });

  it('disables every action while loading', () => {
    const selected = testData[0];
    if (!selected) throw new Error('expected items[0]');
    const wrapper = mountToolbar(selected, { disabled: true });

    expect(wrapper.get('[data-test="add-item"]').attributes('disabled')).toBeDefined();
    expect(wrapper.get('[data-test="update-item"]').attributes('disabled')).toBeDefined();
    expect(wrapper.get('[data-test="remove-item"]').attributes('disabled')).toBeDefined();
  });

  it('excludes the selected node and its children from parent options', async () => {
    const selected = testData[0];
    if (!selected) throw new Error('expected items[0]');
    const wrapper = mountToolbar(selected);
    const values = wrapper
      .get('[data-test="edit-parent"]')
      .findAll('option')
      .map((option) => option.text());

    expect(values).toEqual(['Корневой элемент']);
  });

  it('emits add, update and remove from the toolbar actions', async () => {
    const selected = testData[2];
    if (!selected) throw new Error('expected items[2]');
    const wrapper = mountToolbar(selected);

    await wrapper.get('[data-test="add-item"]').trigger('click');
    await wrapper.get('[data-test="edit-label"]').setValue('New name');
    await wrapper.get('[data-test="edit-parent"]').setValue('n:2');
    await wrapper.get('[data-test="update-item"]').trigger('click');
    await wrapper.get('[data-test="remove-item"]').trigger('click');

    expect(wrapper.emitted('add')).toHaveLength(1);
    expect(wrapper.emitted('update')?.[0]).toEqual([{ label: 'New name', parent: 2 }]);
    expect(wrapper.emitted('remove')).toHaveLength(1);
  });
});
