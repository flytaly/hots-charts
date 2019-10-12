<script>
  import { minPopularity, maxHeroes, rankedData } from "../store";
  import { min, max } from "d3";
  import DoubleBarsHeroesChart from "./double-bars-charts.js";
  import ChartContainer from "./chart-container.svelte";
  import { onMount, afterUpdate, onDestroy } from "svelte";
  import Controls from "./controls.svelte";

  const xValue = d => d.winrate;
  const x2Value = d => d.popularity;

  const charts = new DoubleBarsHeroesChart($rankedData.data, xValue, x2Value);

  onMount(() => {
    charts.mount();
  });

  afterUpdate(() => {
    const { data } = $rankedData;
    if (data) {
      const chartData = data.map(d => {
        const result = {};
        result.version = d.version;
        result.data = d.data
          .filter(hero => hero.popularity >= $minPopularity)
          .slice(0, $maxHeroes);
        return result;
      });
      const flatWinrates = chartData.flatMap(ver =>
        ver.data.filter(d => d.popularity >= $minPopularity).map(d => d.winrate)
      );
      const xDomain = [min(flatWinrates) - 8, max(flatWinrates) + 2];
      const x2Domain = [0, 100];

      charts.update(chartData, xDomain, x2Domain);
    }
  });

  onDestroy(() => {
    charts.clearInterval();
  });
</script>

<style>

</style>

<Controls />
<ChartContainer />
