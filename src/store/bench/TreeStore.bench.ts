import { bench, describe } from 'vitest';
import { TreeStore } from '../TreeStore';
import {
  generateTreeData,
  generateChainTree,
  generateWideTree,
  getDeepestId,
  getMiddleId,
} from './helpers/generateTree';

const SMALL = generateTreeData({ levels: 4, childrenPerNode: 5 });
const MEDIUM = generateTreeData({ levels: 5, childrenPerNode: 6 });
const LARGE = generateTreeData({ levels: 6, childrenPerNode: 7 });

const CHAIN_10K = generateChainTree(10_000);

const WIDE_100K = generateWideTree(100_000);

const smallTree = new TreeStore(SMALL);
const mediumTree = new TreeStore(MEDIUM);
const largeTree = new TreeStore(LARGE);
const chainTree = new TreeStore(CHAIN_10K);
const wideTree = new TreeStore(WIDE_100K);

describe('tree construction', () => {
  bench('small tree', () => {
    new TreeStore(SMALL);
  });

  bench('medium tree', () => {
    new TreeStore(MEDIUM);
  });

  bench('large tree', () => {
    new TreeStore(LARGE);
  });

  bench('deep chain', () => {
    new TreeStore(CHAIN_10K);
  });

  bench('wide tree', () => {
    new TreeStore(WIDE_100K);
  });
});

describe('setItems rebuild', () => {
  const store = new TreeStore([]);

  bench('Set with medium tree', () => {
    store.setItems(MEDIUM);
  });

  bench('Set with large tree', () => {
    store.setItems(LARGE);
  });
});

describe('getItem', () => {
  const midId = getMiddleId(LARGE);
  const deepId = getDeepestId(LARGE);

  bench('Get item in the middle of the large tree', () => {
    largeTree.getItem(midId);
  });

  bench('Get item in the deepest part of the large tree', () => {
    largeTree.getItem(deepId);
  });
});

describe('getChildren', () => {
  bench('children of root in normal tree', () => {
    largeTree.getChildren(1);
  });

  bench('children of root in wide tree', () => {
    wideTree.getChildren(1);
  });

  bench('children of leaf', () => {
    largeTree.getChildren(getDeepestId(LARGE));
  });
});

describe('getAllChildren', () => {
  bench('All children from root — small', () => {
    smallTree.getAllChildren(1);
  });

  bench('All children from root — medium', () => {
    mediumTree.getAllChildren(1);
  });

  bench('All children from root — large', () => {
    largeTree.getAllChildren(1);
  });

  bench('All children of large tree in the middle', () => {
    largeTree.getAllChildren(getMiddleId(LARGE));
  });

  bench('All children of chain tree', () => {
    chainTree.getAllChildren(1);
  });

  bench('All children of wide tree', () => {
    wideTree.getAllChildren(1);
  });
});

describe('getAllParents', () => {
  bench('parents of leaf in large tree', () => {
    largeTree.getAllParents(getDeepestId(LARGE));
  });

  bench('parents of leaf in chain tree', () => {
    chainTree.getAllParents(getDeepestId(CHAIN_10K));
  });

  bench('parents of root', () => {
    largeTree.getAllParents(1);
  });
});

describe('addItem', () => {
  bench('add 100 items to large tree', () => {
    const store = new TreeStore(LARGE);
    for (let i = 0; i < 100; i++) {
      store.addItem({ id: `new-${i}`, parent: 1, label: 'aaaa' });
    }
  });
});

describe('updateItem changing parent', () => {
  bench('Change parent of leaf to root in large tree', () => {
    const store = new TreeStore(LARGE);
    const leaf = store.getItem(getDeepestId(LARGE)) ?? { id: 0, parent: 0, label: 'aaaa' };
    store.updateItem({ ...leaf, parent: 1 });
  });

  bench('Change parent of node in wide tree', () => {
    const store = new TreeStore(WIDE_100K);
    const node = store.getItem(50_000) ?? { id: 0, parent: 0, label: 'aaaa' };
    store.updateItem({ ...node, parent: 2 });
  });
});

describe('removeItem', () => {
  bench('remove leaf from large tree', () => {
    const store = new TreeStore(LARGE);
    store.removeItem(getDeepestId(LARGE));
  });

  bench('remove mid-tree subtree in large tree', () => {
    const store = new TreeStore(LARGE);
    store.removeItem(getMiddleId(LARGE));
  });

  bench('remove root of medium tree', () => {
    const store = new TreeStore(MEDIUM);
    store.removeItem(1);
  });

  bench('remove root of wide tree', () => {
    const store = new TreeStore(WIDE_100K);
    store.removeItem(1);
  });
});

describe('Sequence of operations', () => {
  let store: TreeStore;
  let idx = 0;

  bench(
    'add + update + getAllChildren + getAllParents',
    () => {
      const newId = `new-${idx++}`;
      store.addItem({ id: newId, parent: 1, label: 'qqqqq' });
      store.updateItem({ id: newId, parent: 1, label: 'wwwww' });
      store.getAllChildren(1);
      store.getAllParents(getDeepestId(MEDIUM));
    },
    {
      setup: () => {
        store = new TreeStore(MEDIUM);
        idx = 0;
      },
    },
  );
});
