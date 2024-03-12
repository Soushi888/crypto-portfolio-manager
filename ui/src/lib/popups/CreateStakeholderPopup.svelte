<script>
  import { enhance } from '$app/forms';
</script>

<div class="card w-72 p-4 shadow-xl" data-popup="popupCreateStakeholder">
  <div>
    <p class="mb-4 text-center">Create a new stakeholder</p>
    <form
      action="?/createStakeholder"
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
      <button type="submit" class="btn w-1/2 bg-primary-600">Create</button>
    </form>
  </div>
  <div class="bg-surface-100-800-token arrow" />
</div>
