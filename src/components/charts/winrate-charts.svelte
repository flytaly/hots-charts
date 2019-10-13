<script>
  import { onMount, afterUpdate, onDestroy } from "svelte";
  import { min, max } from "d3";
  import {
    minPopularity,
    maxHeroes,
    isPlaying,
    isAtBottom,
    rankedData
  } from "../../store";
  import DoubleBarsHeroesChart from "./double-bars-charts.js";
  import ChartContainer from "./chart-container.svelte";
  import ChartControls from "./chart-controls.svelte";

  const xValue = d => d.winrate;
  const x2Value = d => d.popularity;
  const onPlayingEnd = () => ($isPlaying = false);
  const charts = new DoubleBarsHeroesChart({
    // data: $rankedData.data,
    xValue,
    x2Value,
    onPlayingEnd
  });

  onMount(() => {
    charts.mount();
  });

  afterUpdate(() => {
    const { data } = $rankedData;
    if (data) {
      const chartData = data.map(d => {
        const result = {};
        result.version = d.version;
        result.data = d.data.filter(hero => hero.popularity >= $minPopularity);
        if ($isAtBottom) {
          result.data = result.data.slice(result.data.length - $maxHeroes);
        } else {
          result.data = result.data.slice(0, $maxHeroes);
        }

        return result;
      });
      const flatWinrates = chartData.flatMap(ver =>
        ver.data.filter(d => d.popularity >= $minPopularity).map(d => d.winrate)
      );
      const [lOffset, rOffset] = $isAtBottom ? [2, 8] : [8, 2];
      const xDomain = [
        min(flatWinrates) - lOffset,
        max(flatWinrates) + rOffset
      ];
      const x2Domain = [0, 100];

      charts.update({
        data: chartData,
        xDomain,
        x2Domain,
        isPlaying: $isPlaying,
        isReversed: $isAtBottom
      });
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
