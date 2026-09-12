import { describe, expect, it } from 'vitest'
import { TreeStore, type TreeItem } from '../TreeStore'
import { buildDataPaths, getRowCategory } from '../buildDataPaths'

const items: TreeItem[] = [
  { id: 1, parent: null, label: 'Item 1' },
  { id: '91064cef', parent: 1, label: 'Item 2' },
  { id: 3, parent: 1, label: 'Item 3' },
  { id: 4, parent: '91064cef', label: 'Item 4' },
  { id: 7, parent: 4, label: 'Item 7' },
]

const shuffledItems: TreeItem[] = [
  { id: 7, parent: 4, label: 'Item 7' },
  { id: 3, parent: 1, label: 'Item 3' },
  { id: 4, parent: '91064cef', label: 'Item 4' },
  { id: 1, parent: null, label: 'Item 1' },
  { id: '91064cef', parent: 1, label: 'Item 2' },
]

describe('buildDataPaths', () => {
  it('builds paths for mixed id types', () => {
    const store = new TreeStore(items)
    const paths = buildDataPaths(store)

    expect(paths.get(1)).toEqual(['n:1'])
    expect(paths.get('91064cef')).toEqual(['n:1', 's:91064cef'])
    expect(paths.get(7)).toEqual(['n:1', 's:91064cef', 'n:4', 'n:7'])
    expect(paths.get(3)).toEqual(['n:1', 'n:3'])
  })

  it('keeps number and string ids with the same digits on different paths', () => {
    const store = new TreeStore([
      { id: 8, parent: null, label: 'number' },
      { id: '8', parent: null, label: 'string' },
    ])
    const paths = buildDataPaths(store)

    expect(paths.get(8)).toEqual(['n:8'])
    expect(paths.get('8')).toEqual(['s:8'])
    expect(paths.get(8)).not.toEqual(paths.get('8'))
  })

  it('builds paths for items in random order', () => {
    const store = new TreeStore(shuffledItems);
    const paths = buildDataPaths(store);

    expect(paths.get(7)).toEqual(['n:1', 's:91064cef', 'n:4', 'n:7'])
    expect(paths.get(3)).toEqual(['n:1', 'n:3'])
    expect(paths.get(4)).toEqual(['n:1', 's:91064cef', 'n:4'])
    expect(paths.get(1)).toEqual(['n:1'])
    expect(paths.get('91064cef')).toEqual(['n:1', 's:91064cef'])
  })
})

describe('getRowCategory', () => {
  it('marks nodes with children as groups', () => {
    const store = new TreeStore(items)

    expect(getRowCategory(store, store.getItem(1)!)).toBe('Группа')
    expect(getRowCategory(store, store.getItem(3)!)).toBe('Элемент')
  })
})
