<script lang="ts">
  import type { EditorView } from "@codemirror/view";
  import YAMLEditor from "@rilldata/web-common/components/editor/YAMLEditor.svelte";
  import { debounce } from "@rilldata/web-common/lib/create-debouncer";
  import { createEventDispatcher } from "svelte";
  import ChartsEditorContainer from "../charts/editor/ChartsEditorContainer.svelte";
  import { V1ParseError } from "@rilldata/web-common/runtime-client";

  const dispatch = createEventDispatcher();

  export let yaml: string;
  export let errors: V1ParseError[] = [];

  const QUERY_DEBOUNCE_TIME = 300;

  let view: EditorView;
  let editor: YAMLEditor;

  function updateChart(content: string) {
    dispatch("update", content);
  }
  const debounceUpdateChartContent = debounce(updateChart, QUERY_DEBOUNCE_TIME);
</script>

<ChartsEditorContainer error={errors[0]}>
  <YAMLEditor
    bind:this={editor}
    bind:view
    content={yaml}
    whenFocused
    on:update={(e) => debounceUpdateChartContent(e.detail.content)}
  />
</ChartsEditorContainer>
