<script>
  import { onMount, afterUpdate, onDestroy } from "svelte";
  import { min, max } from "d3";
  import { minPopularity, maxHeroes, isPlaying, rankedData } from "../../store";
  import DoubleBarsHeroesChart from "./double-bars-charts.js";
  import ChartContainer from "./chart-container.svelte";
  import ChartControls from "./chart-controls.svelte";

  const xValue = d => d.winrate;
  const x2Value = d => d.popularity;
  const onPlayingEnd = () => ($isPlaying = false);

  const charts = new DoubleBarsHeroesChart(
    $rankedData.data,
    xValue,
    x2Value,
    onPlayingEnd
  );

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

      charts.update(chartData, xDomain, x2Domain, $isPlaying);
    }
  });

  onDestroy(() => {
    charts.clearInterval();
  });
</script>

<style>

</style>

<ChartControls />
<ChartContainer />
