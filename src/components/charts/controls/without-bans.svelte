<script>
  import FormField from "@smui/form-field";
  import Switch from "@smui/switch";
  import { withoutBans } from "../../../store";
</script>

<article class="item">
  <FormField>
    <Switch bind:checked={$withoutBans} />
    <span slot="label">without bans</span>
  </FormField>
</article>
