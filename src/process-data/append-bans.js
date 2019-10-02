const fs = require('fs')
const { readDataFile } = require('./read-datafile')

const appendBans = (replayIdToVersion, heroesData, bansPath, outputFile) => new Promise(resolve => {
  function appendBans (playersData) {
    const replayId = playersData[1]
    const heroId = playersData[2]
    const version = replayIdToVersion[replayId]

    if (!version || !heroesData[version] || !heroesData[version][heroId]) { return }

    const { ban = 0 } = heroesData[version][heroId]
    heroesData[version][heroId].ban = ban + 1
  }

  function saveFile () {
    fs.writeFileSync(outputFile, JSON.stringify(heroesData))
    resolve()
  }

  readDataFile(bansPath, appendBans, saveFile)
})

module.exports = appendBans
