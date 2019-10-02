const heroes = require('../heroes.json')

const heroesNormalized = heroes.reduce((acc, hero) => {
  const id = hero[0]
  const name = hero[1]
  const shortName = hero[2]
  return { ...acc, [id]: { name, shortName } }
}, {})

module.exports = heroesNormalized
