<script lang="ts">
  import { AppBar } from '@skeletonlabs/skeleton';
  import { breadcrumbStore } from '@stores/breadcrumb.store';
</script>

<AppBar>
  <svelte:fragment slot="lead">
    <h1>
      <a href="/"><strong class="text-xl uppercase">Crypto portfolio Manager</strong></a>
    </h1>
  </svelte:fragment>

  <ol class="breadcrumb justify-center">
    {#each $breadcrumbStore as [label, link], i}
      {#if i !== $breadcrumbStore.length - 1}
        <li class="crumb"><a href={link} class="anchor">{label}</a></li>
        <li class="crumb-separator" aria-hidden>/</li>
      {:else}
        <li class="crumb">{label}</li>
      {/if}
    {/each}
  </ol>

  <svelte:fragment slot="trail">
    <div class="flex flex-col gap-4 sm:flex-row">
      <a class="btn btn-sm bg-primary-600" href="/stakeholders">Stakeholders</a>
      <a class="btn btn-sm bg-secondary-600" href="/portfolios">Portfolios</a>
    </div>
  </svelte:fragment>
</AppBar>
