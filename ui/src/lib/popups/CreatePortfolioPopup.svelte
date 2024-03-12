<script lang="ts">
  import { enhance } from '$app/forms';
  import type { Stakeholder } from '@models/stakeholder.model';

  export let stakeholders: Stakeholder[];
</script>

<div class="card w-72 p-4 shadow-xl" data-popup="popupCreatePortfolio">
  <div>
    <p class="mb-4 text-center">Create a new portfolio</p>
    {#if stakeholders.length === 0}
      <p class="text-center text-primary-600">No stakeholder found</p>
    {:else}
      <form
        action="?/createPortfolio"
        method="post"
        class="flex flex-col items-center gap-4"
        use:enhance
      >
        <div class="form-control">
          <input
            type="text"
            name="name"
            class="input"
            placeholder="Name"
            required
            autocomplete="off"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Initial stakeholder</span>
            <select name="stakeholder" id="stakeholder" required class="select">
              {#each stakeholders as stakeholder}
                <option value={stakeholder.id} class="option">{stakeholder.name}</option>
              {/each}
            </select>
          </label>
        </div>
        <button type="submit" class="btn w-1/2 bg-primary-600">Create</button>
      </form>
    {/if}
  </div>
  <div class="bg-surface-100-800-token arrow" />
</div>
