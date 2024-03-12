<script lang="ts">
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import type { PageData } from './$types';
  import DeletePortfolioPopup from '@lib/popups/DeletePortfolioPopup.svelte';
  import CreatePortfolioPopup from '@lib/popups/CreatePortfolioPopup.svelte';
  import RenamePortfolioPopup from '@lib/popups/RenamePortfolioPopup.svelte';
  import { breadcrumbStore } from '@stores/breadcrumb.store';

  export let data: PageData;

  breadcrumbStore.set([
    ['Home', '/'],
    ['Portfolios', '/portfolios']
  ]);

  const popupCreatePortfolio: PopupSettings = {
    event: 'click',
    target: 'popupCreatePortfolio',
    placement: 'top'
  };

  function popupRenamePortfolio(i: number): PopupSettings {
    return {
      event: 'click',
      target: `popupRenamePortfolio-${i}`,
      placement: 'right'
    };
  }

  function popupDeletePortfolio(i: number): PopupSettings {
    return {
      event: 'click',
      target: `popupDeletePortfolio-${i}`,
      placement: 'right'
    };
  }
</script>

<CreatePortfolioPopup stakeholders={data.stakeholders} />

<main class=" flex flex-col gap-4">
  <h2 class="h2 text-center">Portfolios</h2>

  {#if data.portfolios.length === 0}
    <div class="flex flex-col items-center gap-4">
      <p>No portfolio found</p>
      <button class="btn self-center bg-primary-700" use:popup={popupCreatePortfolio}>
        Create a new portfolio
      </button>
    </div>
  {:else}
    <button class="btn w-1/2 self-center bg-primary-700" use:popup={popupCreatePortfolio}>
      Create a new portfolio
    </button>

    <table class="table">
      <thead>
        <tr>
          <th class="text-center">Name</th>
          <th class="text-center">Total Value</th>
          <th class="text-center">Stakeholders</th>
          <th class="text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each data.portfolios as portfolio, i}
          <tr>
            <td class="text-center hover:underline">
              <a href="/portfolios/{portfolio.id}">{portfolio.name}</a>
            </td>
            <td class="text-center">{portfolio.current_value}$</td>
            <td class="text-center">{portfolio.stakeholders?.join(', ')}</td>
            <td class="flex justify-center gap-2">
              <button title="Rename portfolio" use:popup={popupRenamePortfolio(i)}>
                <img src="/rename-icon.png" width="24" alt="Rename portfolio icon" />
              </button>
              <button use:popup={popupDeletePortfolio(i)} title="Delete portfolio">
                <img src="/trash-icon.png" width="24" alt="Delete portfolio icon" />
              </button>
            </td>
          </tr>

          <RenamePortfolioPopup id={portfolio.id} {i} name={portfolio.name} />
          <DeletePortfolioPopup id={portfolio.id} {i} />
        {/each}
      </tbody>
    </table>
  {/if}
</main>
