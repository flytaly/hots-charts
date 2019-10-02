const path = require('path')
const { readDataFile } = require('./read-datafile')
const fs = require('fs')

const splitReplaysByVersion = (replaysFile, outputDir, suitableGameTypes = ['HeroLeague', 'StormLeague']) => new Promise(resolve => {
  if (!fs.existsSync(outputDir)) { fs.mkdirSync(outputDir) }
  const files = fs.readdirSync(outputDir)
  if (files) { files.forEach(f => fs.unlinkSync(path.join(outputDir, f))) }

  const saveVersions = (d) => {
    const id = d[0]
    const gameType = d[6]
    const gameVersion = d[10]

    if (suitableGameTypes.includes(gameType)) {
      const filePath = path.join(outputDir, gameVersion)
      fs.appendFileSync(filePath, `${id}\n`)
    }
  }

  readDataFile(replaysFile, saveVersions, resolve)
})

module.exports = splitReplaysByVersion
