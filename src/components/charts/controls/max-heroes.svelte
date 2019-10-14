<script>
  import Slider from "@smui/slider";
  import { maxHeroes } from "../../../store";
</script>

<article class="item">
  <div class="name">heroes</div>
  <div class="value">{$maxHeroes}</div>
  <div class="slider">
    <Slider bind:value={$maxHeroes} min={8} max={30} discrete />
  </div>
</article>
