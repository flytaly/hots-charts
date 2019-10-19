<script>
  import Tab, { Label } from "@smui/tab";
  import TabBar from "@smui/tab-bar";
  import { onMount } from "svelte";
  import { curRoute, tabs, activeTab } from "../store";
  import redirect from "../router/redirect.js";

  $: if ($curRoute.route !== $activeTab.key) {
    redirect($activeTab.key, $curRoute.subroute);
  }
</script>

<nav>
  <TabBar {tabs} let:tab key={tab => tab.key} bind:active={$activeTab}>
    <Tab {tab} minWidth>
      <Label>{tab.label}</Label>
    </Tab>
  </TabBar>
</nav>
