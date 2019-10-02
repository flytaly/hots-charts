const fs = require('fs')
const { readDataFile } = require('./read-datafile')

const saveWinsAndLoses = (replayIdToVersion, playersPath, outputFile) => new Promise(resolve => {
  const heroesData = {}
  function collectHeroData (playersData) {
    const replayId = playersData[1]
    const heroId = playersData[2]
    // const team = playersData[6]
    const winner = playersData[7]

    const version = replayIdToVersion[replayId]

    if (!version) { return }
    const heroes = heroesData[version] || {}
    if (!heroes[heroId]) { heroes[heroId] = { win: 0, lose: 0 } }

    if (Number(winner)) { heroes[heroId].win += 1 } else { heroes[heroId].lose += 1 }

    heroesData[version] = heroes
  }

  function onEnd () {
    fs.writeFileSync(outputFile, JSON.stringify(heroesData))
    resolve()
  }

  readDataFile(playersPath, collectHeroData, onEnd)
})

module.exports = saveWinsAndLoses
