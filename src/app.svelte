<script>
  import Route from "./router/route.svelte";
  import NavBar from "./components/navbar.svelte";
  import { rankedData } from "./store";
  import { json } from "d3";
  import { onMount } from "svelte";
  import Footer from "./components/footer.svelte";

  const loadData = async () => {
    const resp = await json("stats/ranked-stats.json");
    const data = resp
      .filter(d => d.totalGames > 1000)
      .map(d => {
        d.version = d.version
          .split(".")
          .slice(0, 3)
          .join(".");
        return d;
      });

    $rankedData = { data, isLoading: false };
  };

  $rankedData = { ...rankedData, isLoading: true };
  onMount(() => {
    loadData();
  });
</script>

<NavBar />
{#if $rankedData.isLoading}
  <p>Loading...</p>
{:else}
  <Route />
{/if}
<Footer />
