<script>
  import Button, { Label } from "@smui/button";
  import { isPlaying } from "../../store";
</script>

{#if $isPlaying}
  <Button
    color="secondary"
    on:click={() => ($isPlaying = false)}
    variant="raised">
    <Label>Stop</Label>
  </Button>
{:else}
  <Button on:click={() => ($isPlaying = true)} variant="raised">
    <Label>Play</Label>
  </Button>
{/if}
