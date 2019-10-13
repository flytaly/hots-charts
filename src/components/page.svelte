<script>
  import PlayButton from "../components/charts/play-button.svelte";
</script>

<style>
  .pageContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 900px;
    max-width: 100%;
  }
</style>

<div class="pageContainer">
  <slot />
  <PlayButton />
</div>
