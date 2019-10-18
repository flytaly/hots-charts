<script>
  import { onMount, afterUpdate, onDestroy } from "svelte";
  import ChartContainer from "./chart-container.svelte";
  import ChartControls from "./chart-controls.svelte";
  import ChartsSelectors from "./controls/charts-selectors.svelte";
  import ScatterPlot from "./scatter-plot.js";
  import { isPlaying, withoutBans, rankedData } from "../../store";

  const xValue = d => d.banrate;
  const yValue = d => d.winrate;
  const onPlayingEnd = () => ($isPlaying = false);

  const scatterPlot = new ScatterPlot({
    xValue,
    yValue,
    xAxisLabel: "BAN RATE",
    yAxisLabel: "WIN RATE",
    onPlayingEnd,
    highlightYMid: true
  });

  onMount(() => {
    scatterPlot.mount();
  });

  afterUpdate(() => {
    const { data } = $rankedData;
    if (data) {
      const chartData = data.map(d => {
        const result = {};
        const { totalGames } = d;
        result.version = d.version;
        result.data = d.data.map(s => ({
          ...s,
          banrate: (s.ban / totalGames) * 100
        }));
        result.data.sort((a, b) => xValue(b) - xValue(a));
        return result;
      });

      const xDomain = [0, 100];
      const yDomain = [30, 70];
      scatterPlot.update({
        data: chartData,
        xDomain,
        yDomain,
        isPlaying: $isPlaying
      });
    }
  });

  onDestroy(() => {
    scatterPlot.clearInterval();
  });
</script>

<ChartControls>
  <ChartsSelectors />
</ChartControls>
<ChartContainer width="1100" height="700">
  <span slot="description">Hero League / Storm League</span>
</ChartContainer>
