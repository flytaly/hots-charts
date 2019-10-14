<script>
  import { curRoute } from "../store";
  export let page;

  function redirectTo(event) {
    curRoute.set(event.target.hash);
    const { path } = page;
    window.history.pushState(
      { path },
      "",
      `${window.location.origin}${window.location.pathname}${path}`
    );
  }
</script>

<style>

</style>

<a href={page.path} on:click|preventDefault={redirectTo}>
  <slot />
</a>
