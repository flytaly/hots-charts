export const parseHashRoute = (hash) => {
  if (!hash) return { route: '#ranked_wr', subroute: '' }
  const [route, subroute] = hash.split('/')
  return { route, subroute }
}
