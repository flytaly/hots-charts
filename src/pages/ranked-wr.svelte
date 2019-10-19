<script>
  import Page from "../components/page.svelte";
  import WinrateBarCharts from "../components/charts/winrate-bar-charts.svelte";
  import WinrateScatter from "../components/charts/winrate-scatter-plot.svelte";
  import { chartTypes, curRoute } from "../store";
</script>

<style>

</style>

<Page>
  {#if $curRoute.subroute === chartTypes.bar}
    <WinrateBarCharts />
  {:else}
    <WinrateScatter />
  {/if}
</Page>
