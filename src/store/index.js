import { writable } from 'svelte/store'

const initialRoute = window.location.hash

export const curRoute = writable(initialRoute)
