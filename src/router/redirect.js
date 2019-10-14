import { curRoute } from '../store'

export default (path) => {
  curRoute.set(path)
  window.history.pushState({ path }, '', `${window.location.origin}${window.location.pathname}${path}`)
}
