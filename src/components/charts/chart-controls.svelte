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
    margin: 5px 15px 10px 15px;
    min-height: 50px;
  }
  :global(.optionGroup .item) {
    display: flex;
    align-items: center;
    margin-right: 1.5em;
  }
  :global(.optionGroup .value),
  :global(.optionGroup .name),
  :global(.optionGroup .slider) {
    padding-right: 1em;
    white-space: nowrap;
  }
  :global(.optionGroup .mdc-form-field),
  :global(.optionGroup .name) {
    font-weight: bold;
    font-size: inherit;
  }
  :global(.optionGroup .slider) {
    width: 5em;
  }
</style>

<section class="optionGroup">
  <slot />
</section>
