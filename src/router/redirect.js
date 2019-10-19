import { curRoute } from '../store'

export default (route, subroute) => {
  curRoute.set({ route, subroute })
  const subroutePath = subroute ? `/${subroute}` : ''
  window.history.pushState({ route, subroute }, '', `${window.location.origin}${window.location.pathname}${route}${subroutePath}`)
}
