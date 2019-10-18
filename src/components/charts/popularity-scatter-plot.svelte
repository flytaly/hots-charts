<script>
  import { onMount, afterUpdate, onDestroy } from "svelte";
  import ChartContainer from "./chart-container.svelte";
  import ChartControls from "./chart-controls.svelte";
  import ChartsSelectors from "./controls/charts-selectors.svelte";
  import WithoutBansSlider from "./controls/without-bans.svelte";
  import ScatterPlot from "./scatter-plot.js";
  import { isPlaying, withoutBans, rankedData } from "../../store";

  const xValue = d => d.popularity;
  const yValue = d => d.winrate;
  const onPlayingEnd = () => ($isPlaying = false);

  const scatterPlot = new ScatterPlot({
    xValue,
    yValue,
    xAxisLabel: "POPULARITY",
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
      let xValueMax = 0;
      const chartData = data.map(d => {
        const result = {};
        const { totalGames } = d;
        result.version = d.version;
        if ($withoutBans) {
          result.data = d.data.map(s => {
            const popularity = ((s.win + s.lose) / totalGames) * 100;
            xValueMax = popularity > xValueMax ? popularity : xValueMax;
            return { ...s, popularity };
          });
        } else {
          result.data = d.data.slice();
        }
        result.data.sort((a, b) => xValue(b) - xValue(a));
        return result;
      });
      const xDomain = [0, xValueMax || 100];
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
  <WithoutBansSlider />
</ChartControls>
<ChartContainer width="1100" height="700">
  <span slot="description">Hero League / Storm League</span>
</ChartContainer>
