<script lang="ts">
  import { breadcrumbStore } from '@stores/breadcrumb.store';

  export let data;

  const uppercaseSymbol = data.coin?.symbol.toUpperCase();

  breadcrumbStore.set([
    ['Home', '/'],
    ['Portfolios', '/portfolios'],
    [data.portfolio.name, `/portfolios/${data.portfolio.id}`],
    [data.coin?.symbol ? uppercaseSymbol! : 'Coin', '']
  ]);
</script>

<main class="flex flex-col items-center justify-center gap-5">
  {#if data.coin}
    <h2 class="h2">Coin: {uppercaseSymbol}</h2>
  {:else}
    <h2 class="h2">No coin found</h2>
  {/if}
</main>
