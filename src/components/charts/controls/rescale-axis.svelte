<script>
  import FormField from "@smui/form-field";
  import Switch from "@smui/switch";
  import { rescaleAxis } from "../../../store";
</script>

<article class="item">
  <FormField>
    <Switch bind:checked={$rescaleAxis} />
    <span slot="label">zoom axes every step</span>
  </FormField>
</article>
