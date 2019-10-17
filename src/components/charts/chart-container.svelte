<script>
  export let width = 600;
  export let height = 700;
</script>

<style>
  .chartContainer {
    max-width: 100%;
  }
  .chartDescription {
    margin-left: 15px;
  }
  .chartWithDescription {
    max-width: 100%;
  }
</style>

<div class="chartWithDescription" style={`width: ${width}px`}>
  <section class="chartDescription">
    <slot name="description" />
  </section>
  <svg class="chartContainer" {width} viewBox="0 0 {width} {height}" />
</div>
