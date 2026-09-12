import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DUMMY_DELAY_MS, loadData } from '../loadData';

describe('loadData', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve([{ id: 1, parent: null, label: 'Item 1' }]),
      }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('delays for 2 seconds before fetching /items.json', async () => {
    const pending = loadData();

    expect(fetch).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(DUMMY_DELAY_MS - 1);
    expect(fetch).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    const result = await pending;

    expect(fetch).toHaveBeenCalledWith('/items.json');
    expect(result).toEqual([{ id: 1, parent: null, label: 'Item 1' }]);
  });
});
