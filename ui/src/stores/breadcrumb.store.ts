import { onDestroy } from 'svelte';
import { get, writable, type Writable } from 'svelte/store';

// Custom store that wraps around the writable store
export function createBreadcrumbStore() {
  const { subscribe, set, update } = writable<[Label: string, Link: string][]>([]);
  return {
    subscribe,
    set: (breadcrumb: [Label: string, Link: string][]) => {
      set(breadcrumb);
      onDestroy(() => {
        set([]);
      });
    },
    update
  };
}

export const breadcrumbStore = createBreadcrumbStore();
