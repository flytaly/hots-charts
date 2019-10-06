const heroes = require('../heroes.json')

const heroesNormalizedById = heroes.reduce((acc, hero) => {
  const id = hero[0]
  const name = hero[1]
  const shortName = hero[2]
  return { ...acc, [id]: { name, shortName } }
}, {})

const heroesNormalizedByName = heroes.reduce((acc, hero) => {
  const id = hero[0]
  const name = hero[1]
  const shortName = hero[2]
  return { ...acc, [name]: { id, shortName } }
}, {})

module.exports = {
  heroesNormalizedById,
  heroesNormalizedByName
}
