<script lang="ts">
  import { enhance } from '$app/forms';

  export let id: string | undefined;
  export let name: string | undefined;
  export let i: number;
</script>

<div class="card p-4 w-72 shadow-xl" data-popup={`popupRenamePortfolio-${i}`}>
  <div>
    <p class="text-center mb-4">Rename portfolio</p>
    <form
      action="?/renamePortfolio"
      method="post"
      class="flex flex-col gap-4 items-center"
      use:enhance
    >
      <input type="hidden" name="id" value={id} />
      <div class="form-control">
        <input
          type="text"
          name="name"
          class="input"
          placeholder="New Name"
          value={name}
          required
          autocomplete="off"
        />
      </div>
      <button type="submit" class="btn bg-primary-600 w-1/2">Rename</button>
    </form>
  </div>
  <div class="arrow bg-surface-100-800-token" />
</div>
