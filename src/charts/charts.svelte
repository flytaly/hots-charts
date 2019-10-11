<script>
  import { minPopularity, maxHeroes, rankedData } from "../store";
  import charts from "./winrate";
  import ChartContainer from "./chart-container.svelte";
  import { onMount, afterUpdate } from "svelte";

  afterUpdate(() => {
    const { data } = $rankedData;
    if (data) {
      charts(data, $minPopularity, $maxHeroes);
    }
  });
</script>

<style>

</style>

<ChartContainer />
