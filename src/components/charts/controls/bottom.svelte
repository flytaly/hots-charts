<script>
  import FormField from "@smui/form-field";
  import Switch from "@smui/switch";
  import { isAtBottom } from "../../../store";
</script>

<article class="item">
  <FormField>
    <Switch bind:checked={$isAtBottom} />
    <span slot="label">bottom</span>
  </FormField>
</article>
