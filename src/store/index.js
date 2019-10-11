import { writable } from 'svelte/store'

const initialRoute = window.location.hash

export const curRoute = writable(initialRoute)

export const minPopularity = writable(8)
export const maxHeroes = writable(10)

export const rankedData = writable({ data: null, isLoading: false })
