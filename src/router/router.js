import RankedWR from '../pages/ranked-wr.svelte'
import RankedPopularity from '../pages/ranked-popularity.svelte'
import Banrate from '../pages/banrate.svelte'

export default [
  {
    path: '#ranked_wr',
    component: RankedWR
  },
  {
    path: '#ranked_popularity',
    component: RankedPopularity
  },
  {
    path: '#banrate',
    component: Banrate
  }
]
