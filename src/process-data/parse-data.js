const fs = require('fs')
const path = require('path')
const splitReplaysByVersion = require('./split-by-version')
const saveWinsAndLoses = require('./save-wins-loses')
const { statsOutputDir, versionsDir, dataFiles } = require('../configs')

async function parseData () {
  let versions = fs.readdirSync(versionsDir)

  // split replays to files per version and filter out unwanted games
  if (!versions.length) {
    console.log('spit replays by versions')
    await splitReplaysByVersion(dataFiles.replays, versionsDir)
    versions = fs.readdirSync(versionsDir)
  }
  let replayIdToVersion = {}

  // parse replays split by version and create object that map replay id to its version
  const mapReplayIdToVersion = () => {
    console.log('parse versions')
    replayIdToVersion = versions.reduce((acc, version) => {
      const replayIds = fs.readFileSync(path.join(versionsDir, version)).toString().split('\n')
      replayIds.forEach(id => { acc[id] = version })
      return acc
    }, {})
  }
  const winLoseFile = path.join(statsOutputDir, 'win-lose.json')

  // parse "players" data file and save wins and loses into json file
  if (!fs.existsSync(winLoseFile)) {
    if (!Object.keys(replayIdToVersion).length) mapReplayIdToVersion()

    console.log('parse heroes win-lose data')
    await saveWinsAndLoses(replayIdToVersion, dataFiles.players, winLoseFile)
  }
}

module.exports = parseData
