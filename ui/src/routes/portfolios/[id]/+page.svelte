<script lang="ts">
  import {
    Modal,
    getModalStore,
    type ModalSettings,
    type ModalComponent,
    type PopupSettings,
    popup
  } from '@skeletonlabs/skeleton';
  import type { PageData } from './$types';
  import AddCoinPopup from '@lib/modals/AddCoinModal.svelte';
  import { breadcrumbStore } from '@stores/breadcrumb.store';
  import DeleteCoinPopup from '@lib/popups/DeleteCoinPopup.svelte';
  import { onMount } from 'svelte';
  import CoinGeckoApiService from '@services/api-services/CoinGeckoApiService';
  import { get } from 'svelte/store';

  export let data: PageData;

  const modalStore = getModalStore();
  const modalComponent: ModalComponent = { ref: AddCoinPopup };
  const modal = (coinsList: any): ModalSettings => {
    return {
      type: 'component',
      component: modalComponent,
      title: 'Add a coin',
      body: 'Add a coin to your portfolio',
      meta: {
        portfolioId: data.id,
        coinsList: coinsList || []
      }
    };
  };

  function popupDeleteCoin(i: number): PopupSettings {
    return {
      event: 'click',
      target: `popupDeleteCoin-${i}`,
      placement: 'right'
    };
  }

  breadcrumbStore.set([
    [`Home`, '/'],
    [`Portfolios`, '/portfolios'],
    [data.name, `/portfolios/${data.id}`]
  ]);

  onMount(async () => {
    const apiService = new CoinGeckoApiService(fetch);
    await apiService.getCoinsList();
  });
</script>

<Modal />

<main class="flex flex-col gap-4">
  <h2 class="h2">Portfolio {data.name}</h2>
  <div class="flex gap-4">
    <button
      class="btn w-1/2 self-center bg-primary-700"
      on:click={() => modalStore.trigger(modal(data.coinsList))}
    >
      Add a coin
    </button>
    <button class="btn w-1/2 self-center bg-secondary-700">Manage stakeholders</button>
  </div>
  <p>Total value: {data.current_value}$</p>
  <p>Stakeholders: {data.stakeholders?.join(', ')}</p>
  <h3 class="h3">Coins</h3>
  {#if data.coinsList.length > 0}
    <table class="table table-hover">
      <thead>
        <tr>
          <th>Name</th>
          <th>Symbol</th>
          <th>Price</th>
          <th>Amount</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each data.coinsList as coin, i}
          <tr>
            <td>
              <a
                href="https://www.coingecko.com/en/coins/{''}"
                target="_blank"
                class="hover:underline"
              >
                {coin.name}
              </a>
            </td>
            <td>{coin.symbol}</td>
            <td>—</td>
            <td>{coin.amount}</td>
            <td class="flex justify-center gap-2">
              <a
                href="/portfolios/{data.id}/coin?coin_id={coin.id}"
                class="hover:underline"
                title="View transactions"
              >
                <img src="/transactions-icon.png" width="24" alt="View transactions icon" />
              </a>
              <button title="Delete coin" use:popup={popupDeleteCoin(i)}>
                <img src="/trash-icon.png" width="24" alt="Delete coin icon" />
              </button>
            </td>
          </tr>
          <DeleteCoinPopup id={coin.id} {i} />
        {/each}
      </tbody>
    </table>
  {:else}
    <p>No coins yet</p>
  {/if}
</main>
