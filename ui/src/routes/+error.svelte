<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="flex flex-col items-center space-y-10 text-center">
  <h1 class="h1 text-red-700">Error</h1>
  <h2 class="h2">{$page.status} {$page.error?.message}</h2>
</div>
