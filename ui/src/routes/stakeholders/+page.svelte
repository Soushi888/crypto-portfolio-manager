<script lang="ts">
  import CreateStakeholderPopup from '@lib/popups/CreateStakeholderPopup.svelte';
  import DeleteStakeholderPopup from '@lib/popups/DeleteStakeholderPopup.svelte';
  import RenameStakeholderPopup from '@lib/popups/RenameStakeholderPopup.svelte';
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import { breadcrumbStore } from '@stores/breadcrumb.store.js';
  import {
    allStakeholderProfiles,
    storeAllStakeholderProfiles
  } from '@stores/stakeholder-profiles.store';
  import { onMount } from 'svelte';

  onMount(async () => {
    await storeAllStakeholderProfiles();
    console.log('allStakeholderProfiles :', $allStakeholderProfiles);
  });

  breadcrumbStore.set([
    ['Home', '/'],
    ['Stakeholders', '/stakeholders']
  ]);

  const popupCreateStakeholder: PopupSettings = {
    event: 'click',
    target: 'popupCreateStakeholder',
    placement: 'top'
  };

  function popupRenameStakeholder(i: number): PopupSettings {
    return {
      event: 'click',
      target: `popupRenameStakeholder-${i}`,
      placement: 'right'
    };
  }

  function popupDeleteStakeholder(i: number): PopupSettings {
    return {
      event: 'click',
      target: `popupDeleteStakeholder-${i}`,
      placement: 'right'
    };
  }
</script>

<CreateStakeholderPopup />

<main class="flex flex-col gap-4">
  <h2 class="h2">Stakeholders</h2>

  {#if $allStakeholderProfiles.length === 0}
    <p class="text-center">No stakeholder found</p>
    <button class="btn bg-primary-700 self-center" use:popup={popupCreateStakeholder}>
      Create a new stakeholder
    </button>
  {:else}
    <button class="btn bg-primary-700 self-center" use:popup={popupCreateStakeholder}>
      Create stakeholder
    </button>
    <table class="table">
      <thead>
        <tr>
          <th class="text-center">Name</th>
          <th class="text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each $allStakeholderProfiles as stakeholder, i}
          <tr>
            <td class="text-center hover:underline">
              <a href="/stakeholders/{stakeholder.name}">
                {stakeholder.name}
              </a>
            </td>
            <td class="flex justify-center gap-2">
              <button title="Rename" use:popup={popupRenameStakeholder(i)}>
                <img src="/rename-icon.png" width="24" alt="Rename stakeholder icon" />
              </button>
              <button title="Delete" use:popup={popupDeleteStakeholder(i)}>
                <img src="/trash-icon.png" width="24" alt="Delete stakeholder icon" />
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>
