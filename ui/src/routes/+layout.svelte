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
  import hc from '@services/HolochainClientService';

  storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
  initializeStores();

  const clientContext = 'clientContext';

  let client: AppAgentClient | undefined;

  onMount(async () => {
    await hc.connectClient();
    const record = await hc.callZome('ping', 'ping', null);

    console.log('Ping response:', record);
    console.log('appInfo :', await hc.getAppInfo());
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
    {#if !hc.isLoading}
      <div class="flex items-center justify-center">
        <p>Loading...</p>
      </div>
    {:else}
      <slot />
    {/if}
  </div>
</AppShell>
