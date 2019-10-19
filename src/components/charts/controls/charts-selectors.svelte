<script>
  import styles from "./button.module.scss";
  import { curRoute, chartTypes } from "../../../store";
  import redirect from "../../../router/redirect.js";
  const { svgButton, active } = styles;
</script>

<style>
  button {
    width: 24px;
    height: 24px;
  }
</style>

<article class="item">
  <button
    class={`${svgButton} ${$curRoute.subroute === chartTypes.bar ? active : ''}`}
    on:click={() => redirect($curRoute.route, chartTypes.bar)}
    title="Bar chart">
    <svg
      style="transform: rotate(90deg)"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24">
      <g>
        <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z" />
      </g>
    </svg>
  </button>
  <button
    class={`${svgButton} ${$curRoute.subroute === chartTypes.scatter ? active : ''}`}
    on:click={() => redirect($curRoute.route, chartTypes.scatter)}
    title="Scatter plot">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24">
      <g>
        <circle cx="7" cy="14" r="3" />
        <circle cx="11" cy="6" r="3" />
        <circle cx="16.6" cy="17.6" r="3" />
      </g>
    </svg>
  </button>
</article>
