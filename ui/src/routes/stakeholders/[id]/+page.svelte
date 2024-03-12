<script lang="ts">
  import { breadcrumbStore } from '@stores/breadcrumb.store.js';

  export let data;

  breadcrumbStore.set([
    ['Home', '/'],
    ['Stakeholders', '/stakeholders'],
    [data.stakeholder.name, `/stakeholders/data.id`]
  ]);
</script>

<main>
  <h2 class="h2">{data.stakeholder.name}</h2>
</main>
