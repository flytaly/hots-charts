<script>
  import NavBar from "./navbar.svelte";
</script>

<style>
  .head {
    display: flex;
    flex-direction: column;
    width: 100%;
    flex-wrap: wrap;
    align-items: center;
  }
  @media (min-width: 820px) {
    .head {
      flex-direction: row;
      justify-content: space-around;
    }
  }
  aside {
    width: 200px;
    text-align: center;
  }
  h1 {
    font-size: 1.1em;
    margin: 0px;
  }
</style>

<div class="head">
  <aside>
    <h1>Heroes of The Storm</h1>
    <div>historical charts</div>
  </aside>
  <span>
    <NavBar />
  </span>
  <aside />
</div>
