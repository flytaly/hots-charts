<script>
  import { onMount, afterUpdate, onDestroy } from "svelte";
  import { min, max, format } from "d3";
  import {
    maxHeroes,
    isPlaying,
    isAtBottom,
    withoutBans,
    rankedData
  } from "../../store";
  import DoubleBarsHeroesChart from "./double-bars-charts.js";
  import ChartContainer from "./chart-container.svelte";
  import ChartControls from "./chart-controls.svelte";

  import PopularitySlider from "./controls/popularity.svelte";
  import MaxHeroesSlider from "./controls/max-heroes.svelte";
  import ShowBottomSwitcher from "./controls/bottom.svelte";
  import WithoutBansSlider from "./controls/without-bans.svelte";

  const xValue = d => d.popularity;
  const x2Value = d => d.winrate;
  const onPlayingEnd = () => ($isPlaying = false);
  const charts = new DoubleBarsHeroesChart({
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
        const { totalGames } = d;
        result.version = d.version;
        if ($withoutBans) {
          result.data = d.data.map(s => ({
            ...s,
            popularity: ((s.win + s.lose) / totalGames) * 100
          }));
        } else {
          result.data = d.data.slice();
        }

        result.data.sort((a, b) => xValue(b) - xValue(a));
        if ($isAtBottom) {
          result.data = result.data.slice(result.data.length - $maxHeroes);
        } else {
          result.data = result.data.slice(0, $maxHeroes);
        }

        return result;
      });
      const flatValues = chartData.flatMap(ver => ver.data.map(xValue));
      const xDomain = $isAtBottom
        ? [min(flatValues) - 2, max(flatValues)]
        : [min(flatValues) - 10, max(flatValues)];
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

<ChartControls>
  <MaxHeroesSlider />
  <WithoutBansSlider />
  <ShowBottomSwitcher />
</ChartControls>
<ChartContainer />
