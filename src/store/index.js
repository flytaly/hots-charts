import { writable } from 'svelte/store'

const initialRoute = window.location.hash || '#ranked_wr'

export const curRoute = writable(initialRoute)

export const minPopularity = writable(8)
export const maxHeroes = writable(13)
export const isPlaying = writable(true)
export const isAtBottom = writable(false)

export const rankedData = writable({ data: null, isLoading: false })
