<script>
  import { onMount, afterUpdate, onDestroy } from "svelte";
  import ChartContainer from "./chart-container.svelte";
  import ChartControls from "./chart-controls.svelte";
  import ChartsSelectors from "./controls/charts-selectors.svelte";
  import PopularitySlider from "./controls/popularity.svelte";
  import RescaleAxisSwitcher from "./controls/rescale-axis.svelte";
  import ScatterPlot from "./scatter-plot.js";
  import {
    isPlaying,
    minPopularity,
    rescaleAxis,
    rankedData
  } from "../../store";
  const xValue = d => d.winrate;
  const yValue = d => d.popularity;
  const onPlayingEnd = () => ($isPlaying = false);

  const scatterPlot = new ScatterPlot({
    xValue,
    yValue,
    onPlayingEnd,
    highlightMid: true
  });

  onMount(() => {
    scatterPlot.mount();
  });

  afterUpdate(() => {
    const { data } = $rankedData;
    if (data) {
      const chartData = data.map(d => {
        const result = {};
        result.version = d.version;
        result.data = d.data.filter(hero => hero.popularity >= $minPopularity);
        return result;
      });
      const xDomain = [30, 70];
      const yDomain = [$minPopularity, 100];
      scatterPlot.update({
        data: chartData,
        xDomain,
        yDomain,
        isPlaying: $isPlaying,
        rescaleAxis: $rescaleAxis
      });
    }
  });

  onDestroy(() => {
    scatterPlot.clearInterval();
  });
</script>

<ChartControls>
  <ChartsSelectors />
  <PopularitySlider />
  <RescaleAxisSwitcher />
</ChartControls>
<ChartContainer width="1100" height="700">
  <span slot="description">Hero League / Storm League</span>
</ChartContainer>
