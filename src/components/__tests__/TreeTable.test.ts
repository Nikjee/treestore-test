import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TreeTable from '../TreeTable.vue';
import { TreeStore, type TreeItem } from '@/store/TreeStore';

const items: TreeItem[] = [
  { id: 1, parent: null, label: 'Item 1' },
  { id: 2, parent: 1, label: 'Item 2' },
];

describe('TreeTable', () => {
  it('renders the grid in a loading state before data is loaded', () => {
    const store = new TreeStore([]);
    const wrapper = mount(TreeTable, {
      props: {
        store,
        rowData: [],
        isLoading: true,
      },
    });

    expect(wrapper.find('.ag-grid-table').exists()).toBe(true);

    const grid = wrapper.findComponent({ name: 'AgGridVue' });
    expect(grid.exists()).toBe(true);
    expect(grid.props('loading')).toBe(true);
  });

  it('passes loaded rows into the grid', () => {
    const store = new TreeStore(items);
    const wrapper = mount(TreeTable, {
      props: {
        store,
        rowData: items,
        isLoading: false,
      },
    });

    const grid = wrapper.findComponent({ name: 'AgGridVue' });
    expect(grid.exists()).toBe(true);
    expect(grid.props('rowData')).toHaveLength(items.length);
    expect(grid.props('rowData')[0]).toMatchObject({ id: 1, path: ['n:1'] });
    expect(grid.props('loading')).toBe(false);
    expect(grid.props('rowSelection')).toMatchObject({ mode: 'singleRow' });
  });

  it('expects number and string ids to be different row ids and paths', () => {
    const mixed: TreeItem[] = [
      { id: 8, parent: null, label: 'numeric' },
      { id: '8', parent: null, label: 'string' },
    ];
    const store = new TreeStore(mixed);
    const wrapper = mount(TreeTable, {
      props: {
        store,
        rowData: mixed,
        isLoading: false,
      },
    });

    const grid = wrapper.findComponent({ name: 'AgGridVue' });
    const rows = grid.props('rowData') as Array<TreeItem & { path: string[] }>;
    const getRowId = grid.props('getRowId') as (params: { data: TreeItem }) => string;

    expect(rows).toHaveLength(2);
    const numeric = rows[0];
    const stringRow = rows[1];
    if (!numeric || !stringRow) throw new Error('expected two grid rows');

    expect(rows.map((row) => row.path)).toEqual([['n:8'], ['s:8']]);
    expect(getRowId({ data: numeric })).toBe('n:8');
    expect(getRowId({ data: stringRow })).toBe('s:8');
  });
});
