<script>
  import charts from "./winrate";
  import { onMount } from "svelte";
  onMount(() => {
    charts();
  });
</script>

<style>
  :global(.ticks) {
    font-size: 10px;
  }

  :global(.track),
  :global(.track-inset),
  :global(.track-overlay) {
    stroke-linecap: round;
  }

  :global(.track) {
    stroke: #000;
    stroke-opacity: 0.3;
    stroke-width: 10px;
  }

  :global(.track-inset) {
    stroke: #dcdcdc;
    stroke-width: 8px;
  }

  :global(.track-overlay) {
    pointer-events: stroke;
    stroke-width: 50px;
    stroke: transparent;
    cursor: crosshair;
  }

  :global(.handle) {
    fill: #fff;
    stroke: #000;
    stroke-opacity: 0.5;
    stroke-width: 1.25px;
  }
</style>

<svg width="700" height="600" />
