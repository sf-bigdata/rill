<script lang="ts">
  import { page } from "$app/stores";
  import { featureFlags } from "@rilldata/web-common/features/feature-flags";
  import TablePreviewWorkspace from "@rilldata/web-common/features/tables/TablePreviewWorkspace.svelte";
  import { error } from "@sveltejs/kit";
  import { onMount } from "svelte";

  const { readOnly } = featureFlags;

  // Druid does not have a "database" concept
  $: databaseSchema = $page.params.schema;
  $: table = $page.params.table;

  onMount(() => {
    if ($readOnly) {
      throw error(404, "Page not found");
    }
  });
</script>

<svelte:head>
  <title>Rill Developer | {table}</title>
</svelte:head>

<TablePreviewWorkspace connector="druid" {databaseSchema} {table} />
