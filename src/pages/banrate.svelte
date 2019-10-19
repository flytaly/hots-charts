<script>
  import Page from "../components/page.svelte";
  import BanrateCharts from "../components/charts/banrate-bar-charts.svelte";
  import BanrateScatter from "../components/charts/banrate-scatter-plot.svelte";
  import { curRoute, chartTypes } from "../store";
</script>

<style>

</style>

<Page>
  {#if $curRoute.subroute === chartTypes.bar}
    <BanrateCharts />
  {:else}
    <BanrateScatter />
  {/if}
</Page>
