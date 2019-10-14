const path = require('path')
const fs = require('fs')

const dataDir = path.join(__dirname, '../data')
const versionsDir = path.join(dataDir, 'versions')
const statsOutputDir = path.join(dataDir, '../data/stats')

if (!fs.existsSync(versionsDir)) { fs.mkdirSync(versionsDir) }
if (!fs.existsSync(statsOutputDir)) { fs.mkdirSync(statsOutputDir) }

const dataFiles = {
  replays: path.join(dataDir, 'db-dumps/replays.csv.gz'),
  players: path.join(dataDir, 'db-dumps/players.csv.gz'),
  bans: path.join(dataDir, 'db-dumps/bans.csv.gz'),
  maxParsedId: path.join(dataDir, 'db-dumps/max_parsed_id')
}

module.exports = {
  statsOutputDir,
  dataDir,
  versionsDir,
  dataFiles
}
