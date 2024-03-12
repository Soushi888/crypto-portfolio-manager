<script lang="ts">
  import { enhance } from '$app/forms';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import { coinsListLocalStorageStore } from '@stores/coins.store';

  const modalStore = getModalStore();
</script>

{#if $modalStore[0]}
  <article class="card w-72 p-4 shadow-xl">
    <header class="h3 mb-4 text-center">{$modalStore[0].title}</header>
    <form action="?/addCoin" method="POST" use:enhance={modalStore.close}>
      <div class="flex flex-col items-center gap-4">
        <input type="hidden" name="portfolio_id" value={$modalStore[0].meta.portfolioId} />
        <div class="form-control">
          <input
            type="search"
            name="coin_name"
            placeholder="Search coin"
            class="input"
            autocomplete="off"
          />
        </div>

        <button type="submit" class="btn w-1/2 bg-primary-600">Add</button>
      </div>
    </form>
  </article>
{/if}
