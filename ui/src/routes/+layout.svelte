<script lang="ts">
  import '../app.postcss';
  import { AppShell, AppBar } from '@skeletonlabs/skeleton';
  import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
  import { storePopup } from '@skeletonlabs/skeleton';
  import NavBar from '$lib/NavBar.svelte';
  import { initializeStores } from '@skeletonlabs/skeleton';
  import { onMount, setContext } from 'svelte';
  import type { ActionHash, AppAgentClient } from '@holochain/client';
  import { AppAgentWebsocket } from '@holochain/client';

  storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
  initializeStores();

  const clientContext = 'clientContext';

  let client: AppAgentClient | undefined;

  let loading = true;

  onMount(async () => {
    // We pass an unused string as the url because it will dynamically be replaced in launcher environments
    client = await AppAgentWebsocket.connect(new URL('https://UNUSED'), 'crypto-portfolio-manager');

    console.log('client', client);

    loading = false;
  });

  setContext(clientContext, {
    getClient: () => client
  });
</script>

<!-- App Shell -->
<AppShell>
  <svelte:fragment slot="header">
    <NavBar />
  </svelte:fragment>
  <svelte:fragment slot="sidebarLeft">
    <!-- <div class="h-full w-52 bg-slate-400">
      <p class="pt-4 text-center text-xl text-black">Side bar</p>
    </div> -->
  </svelte:fragment>
  <div class="container mx-auto flex h-full items-center justify-center pt-4">
    {#if loading}
      <div class="flex items-center justify-center">
        <p>Loading...</p>
      </div>
    {:else}
      <slot />
    {/if}
  </div>
</AppShell>
