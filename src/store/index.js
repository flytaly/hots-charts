import { writable } from 'svelte/store'
import { parseHashRoute } from '../router/parse-route'

export const chartTypes = { scatter: 'scatter', bar: 'bar' }
export const tabs = [
  { label: 'Winrate', key: '#ranked_wr' },
  { label: 'Popularity', key: '#ranked_popularity' },
  { label: 'Banrate', key: '#banrate' }
]

export const initialRoute = parseHashRoute(window.location.hash)

if (!initialRoute.subroute) initialRoute.subroute = chartTypes.bar

export const curRoute = writable(initialRoute)
export const activeTab = writable(tabs.find(t => t.key === initialRoute.route) || tabs[0])

export const minPopularity = writable(8)
export const maxHeroes = writable(13)
export const isPlaying = writable(true)
export const isAtBottom = writable(false)
export const withoutBans = writable(false)
export const rescaleAxis = writable(false)

export const rankedData = writable({ data: null, isLoading: false })
