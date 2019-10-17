<script>
  import Page from "../components/page.svelte";
  import WinrateBarCharts from "../components/charts/winrate-bar-charts.svelte";
  import WinrateScatter from "../components/charts/winrate-scatter-plot.svelte";
  import { chartType, chartTypes } from "../store";
</script>

<style>

</style>

<Page>
  {#if $chartType === chartTypes.bar}
    <WinrateBarCharts />
  {:else}
    <WinrateScatter />
  {/if}
</Page>
