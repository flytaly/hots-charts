<script>
  import Tab, { Label } from "@smui/tab";
  import TabBar from "@smui/tab-bar";
  import { curRoute } from "../store";
  import redirect from "../router/redirect.js";
  let tabs = [
    { label: "Winrate", key: "#ranked_wr" },
    { label: "Popularity", key: "#ranked_popularity" },
    { label: "Banrate", key: "#banrate" }
  ];
  let activeTab = tabs.find(t => t.key === $curRoute) || tabs[0];
  $: if ($curRoute !== activeTab.key) {
    redirect(activeTab.key);
  }
</script>

<nav>
  <TabBar {tabs} let:tab key={tab => tab.key} bind:active={activeTab}>
    <Tab {tab} minWidth>
      <Label>{tab.label}</Label>
    </Tab>
  </TabBar>
</nav>
