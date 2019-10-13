<script>
  import { onDestroy } from "svelte";
  import { curRoute } from "../store";
  import router from "./router";

  let component;
  const unsubscribe = curRoute.subscribe(value => {
    const curr = router.filter(r => r.path === $curRoute);
    component = curr.length ? curr[0].component : router[0].component;
  });

  onDestroy(unsubscribe);
</script>

<style>

</style>

<svelte:component this={component} />
