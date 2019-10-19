<script>
  import Page from "../components/page.svelte";
  import PopCharts from "../components/charts/popularity-bar-charts.svelte";
  import PopScatter from "../components/charts/popularity-scatter-plot.svelte";
  import { curRoute, chartTypes } from "../store";
</script>

<style>

</style>

<Page>
  {#if $curRoute.subroute === chartTypes.bar}
    <PopCharts />
  {:else}
    <PopScatter />
  {/if}
</Page>
