<script lang="ts">
  import { enhance } from '$app/forms';

  export let id: string | undefined;
  export let i: number;
</script>

<div class="card w-72 p-4 shadow-xl" data-popup={`popupDeletePortfolio-${i}`}>
  <p class="mb-4 text-center">Are you sure ?</p>
  <form action="?/deletePortfolio" method="post" use:enhance>
    <div class="justify-cente flex gap-4">
      <input type="hidden" name="id" value={id} />
      <button type="submit" class="btn w-1/2 bg-primary-600"> Delete </button>
      <button class="btn w-1/2 bg-secondary-600" on:click={(e) => e.preventDefault()}> No! </button>
    </div>
  </form>
</div>
