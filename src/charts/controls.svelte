<script>
  import Slider from "@smui/slider";
  import { minPopularity, maxHeroes } from "../store";
</script>

<style>
  .optionGroup {
    display: flex;
  }
  .item {
    display: flex;
    align-items: center;
    margin-right: 2em;
  }
  .value,
  .name,
  .slider {
    padding-right: 10px;
  }
  .slider {
    width: 5em;
  }
</style>

<section class="optionGroup">
  <article class="item">
    <div class="name">popularity</div>
    <div class="value">≥ {$minPopularity}%</div>
    <div class="slider">
      <Slider bind:value={$minPopularity} min={0} max={30} discrete />
    </div>
  </article>
  <article class="item">
    <div class="name">heroes</div>
    <div class="value">{$maxHeroes}</div>
    <div class="slider">
      <Slider bind:value={$maxHeroes} min={8} max={30} discrete />
    </div>
  </article>
</section>
