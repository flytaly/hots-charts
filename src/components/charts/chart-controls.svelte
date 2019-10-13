<script>
  import Slider from "@smui/slider";
  import FormField from "@smui/form-field";
  import Switch from "@smui/switch";
  import { minPopularity, maxHeroes, isAtBottom } from "../../store";
</script>

<style>
  .optionGroup {
    display: flex;
    flex-wrap: wrap;
  }
  .item {
    display: flex;
    align-items: center;
    margin-right: 1.5em;
  }
  .value,
  .name,
  .slider {
    padding-right: 1em;
    white-space: nowrap;
  }
  :global(.mdc-form-field),
  .name {
    font-weight: bold;
    font-size: inherit;
    font-family: inherit;
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
      <Slider
        color="secondary"
        bind:value={$minPopularity}
        min={0}
        max={30}
        discrete />
    </div>
  </article>
  <article class="item">
    <div class="name">heroes</div>
    <div class="value">{$maxHeroes}</div>
    <div class="slider">
      <Slider bind:value={$maxHeroes} min={8} max={30} discrete />
    </div>
  </article>
  <article class="item">
    <FormField>
      <Switch bind:checked={$isAtBottom} />
      <span slot="label">bottom</span>
    </FormField>
  </article>
</section>
