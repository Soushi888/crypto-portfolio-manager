<script lang="ts">
  import {
    createStakeholderProfile,
    storeAllStakeholderProfiles
  } from '@stores/stakeholder-profiles.store';

  let form: HTMLFormElement;
  async function submitForm(event: SubmitEvent) {
    event.preventDefault();
    const formData = new FormData(form);
    const name = formData.get('name') as string;

    await createStakeholderProfile(name);
    await storeAllStakeholderProfiles();

    form.reset();
  }
</script>

<div class="card w-72 p-4 shadow-xl" data-popup="popupCreateStakeholder">
  <div>
    <p class="mb-4 text-center">Create a new stakeholder</p>
    <form
      action="?/createStakeholder"
      method="post"
      class="flex flex-col items-center gap-4"
      bind:this={form}
      on:submit={submitForm}
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
      <button type="submit" class="btn bg-primary-600 w-1/2">Create</button>
    </form>
  </div>
  <div class="bg-surface-100-800-token arrow" />
</div>
