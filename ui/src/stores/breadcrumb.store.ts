import { onDestroy } from 'svelte';
import { writable } from 'svelte/store';

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
