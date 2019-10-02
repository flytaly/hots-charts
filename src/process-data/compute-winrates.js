const { statsOutputDir } = require('../configs')
const path = require('path')
const heroesInfo = require('./heroes')
const fs = require('fs')

const defaultInPath = path.join(statsOutputDir, 'win-lose-ban.json')
const defaultOutPath = path.join(statsOutputDir, 'winrates-historical.json')

function computeWinrates (filePath = defaultInPath, outputPath = defaultOutPath) {
  const wlData = filePath
  const data = require(wlData)

  const result = Object.keys(data).map(version => {
    const heroesData = data[version]
    let count = 0
    let wrs = Object.keys(heroesData).filter(id => id && id !== '\\N').map((heroId) => {
      const { win, lose, ban } = heroesData[heroId]
      const winrate = Math.round(win / (win + lose) * 100 * 100) / 100

      if (!heroesInfo[heroId]) return {}

      const { name, shortName } = heroesInfo[heroId]
      count += win + lose
      return ({ win, lose, ban, winrate, name, shortName, id: heroId })
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
  fs.writeFileSync(outputPath, JSON.stringify(result))
}

module.exports = computeWinrates
