<script>
  import Slider from "@smui/slider";
  import { minPopularity } from "../../../store";
</script>

<article class="item">
  <div class="name">popularity</div>
  <div class="value">≥ {$minPopularity}%</div>
  <div class="slider">
    <Slider
      color="secondary"
      bind:value={$minPopularity}
      min={0}
      max={30}
      discrete />
  </div>
</article>
