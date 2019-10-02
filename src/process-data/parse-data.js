const fs = require('fs')
const splitReplaysByVersion = require('./split-by-version')
const { statsOutputDir, versionsDir, dataFiles } = require('../configs')

async function parseData () {
  let versions = fs.readdirSync(versionsDir)

  // split replays to files per version and filter out unwanted games
  if (!versions.length) {
    console.log('spit replays by versions')
    await splitReplaysByVersion(dataFiles.replays, versionsDir)
    versions = fs.readdirSync(versionsDir)
  }
}

module.exports = parseData
