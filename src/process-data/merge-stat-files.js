// Merge stat files that were fetched from API

const path = require('path')
const fs = require('fs')
const { statsOutputDir } = require('../configs')
const { heroesNormalizedByName: heroesInfo } = require('./heroes')

const oldDataFile = path.join(statsOutputDir, 'archive', 'ranked-stats_0-19102346.json')
const newFetchedDataFiles = [
  path.join(statsOutputDir, 'archive', 'ranked-stats_19102346-19310394.json')
]
const outFile = path.join(statsOutputDir, 'archive', 'ranked-stats_0-19310394.json')

const newData = newFetchedDataFiles.map(fPath => require(fPath))

// import previous data and convert to object
let prevData = require(oldDataFile)
prevData = prevData.reduce((acc, versionStats) => {
  const { version, data } = versionStats

  const heroes = data.reduce((prev, hero) => ({ ...prev, [hero.name]: hero }), {})
  acc[version] = heroes

  return acc
}, {})

const mergeStatObjects = (a = {}, b = {}) => {
  const heroSet = new Set([a, b].flatMap(Object.keys))
  return [...heroSet].reduce((acc, heroName) => {
    const hA = a[heroName] || { win: 0, lose: 0, ban: 0 }
    const hB = b[heroName] || { win: 0, lose: 0, ban: 0 }
    acc[heroName] = { win: hA.win + hB.win, lose: hA.lose + hB.lose, ban: hA.ban + hB.ban }
    return acc
  }, {})
}

const combineData = [prevData, ...newData]
const versions = new Set(combineData.flatMap(Object.keys))
const combineStats = {}

Array.from(versions).forEach(v => {
  combineStats[v] = combineData.reduce((acc, dataset) => mergeStatObjects(acc, dataset[v]), {})
})

const result = Object.keys(combineStats).map(version => {
  const heroesData = combineStats[version]
  let count = 0
  let wrs = Object.keys(heroesData).map((name) => {
    const { win, lose, ban } = heroesData[name]
    const winrate = Math.round(win / (win + lose) * 100 * 100) / 100

    if (!heroesInfo[name]) return {}

    const { id, shortName } = heroesInfo[name]
    count += win + lose
    return ({ win, lose, ban, winrate, name, shortName, id })
  }, [])

  const totalGames = count / 10

  // count popularity
  wrs = wrs.map(({ win, lose, ban, ...rest }) => {
    const t = win + lose + ban
    const popularity = Math.round(t / totalGames * 100)
    return { win, lose, ban, popularity, ...rest }
  })

  wrs.sort((a, b) => b.winrate - a.winrate)

  return { version, data: wrs, totalGames }
})

result.sort((a, b) => a.version < b.version ? -1 : 1)

fs.writeFileSync(outFile, JSON.stringify(result))
