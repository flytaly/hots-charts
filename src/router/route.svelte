<script>
  import { onDestroy } from "svelte";
  import { curRoute, initialRoute, activeTab, tabs } from "../store";
  import router from "./router";

  let component;
  const unsubscribe = curRoute.subscribe(({ route }) => {
    const curr = router.filter(r => r.path === route);
    component = curr.length ? curr[0].component : router[0].component;
  });

  window.onpopstate = event => {
    if (!event.state) {
      curRoute.set({ ...initialRoute });
      $activeTab = tabs.find(t => t.key === initialRoute.route) || tabs[0];
      return;
    }
    if (event.state.route) {
      curRoute.set({ ...event.state });
      $activeTab = tabs.find(t => t.key === event.state.route) || tabs[0];
    }
  };

  onDestroy(unsubscribe);
</script>

<style>

</style>

<svelte:component this={component} />
