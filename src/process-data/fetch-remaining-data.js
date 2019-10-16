const axios = require('axios')
const { dataFiles, statsOutputDir } = require('../configs')
const path = require('path')
const fs = require('fs')
const readline = require('readline')

const startWithParsedId = 19102346
const maxParsedId = startWithParsedId || +fs.readFileSync(dataFiles.maxParsedId).toString()
const rankedStatsFile = path.join(statsOutputDir, `ranked-stats_${maxParsedId}.json`)
const qmStatsFile = path.join(statsOutputDir, `qm-stats_${maxParsedId}.json`)
const lastFetchIdFile = path.join(statsOutputDir, 'last_fetch_id.txt')

const url = 'http://hotsapi.net/api/v1/replays/parsed'

const rankedStats = {}
const qmStats = {}
let lastParsedId = maxParsedId

const mergeStats = (globalStats, gameStats = {}, version) => {
  if (!globalStats[version]) globalStats[version] = {}
  Object.keys(gameStats).forEach(hero => {
    if (!globalStats[version][hero]) { globalStats[version][hero] = { win: 0, lose: 0, ban: 0 } }
    globalStats[version][hero].win += gameStats[hero].win
    globalStats[version][hero].lose += gameStats[hero].lose
    globalStats[version][hero].ban += gameStats[hero].ban
  })
}

const fetchNextBatch = async () => {
  let count = 0

  try {
    const { data, headers } = await axios.get(url, {
      params: { min_parsed_id: lastParsedId + 1, with_players: true }
    })

    if (+headers['x-ratelimit-remaining'] < 20) {
      await new Promise(resolve => setTimeout(resolve, 6000))
    }

    if (!data || !data.length) { return 0 }
    data.forEach((game) => {
      lastParsedId = +game.parsed_id
      count += 1

      // Get wins and loses
      const players = Object.values(game.players) // It's not consistent and could be whether array or object
      const gameStats = players.reduce((acc, player) => {
        return { ...acc, [player.hero]: { win: +player.winner, lose: +!player.winner, ban: 0 } }
      }, {})

      // Get bans
      if (game.bans && game.bans.length) {
        [...game.bans[0], ...game.bans[1]].forEach(hero => { hero && (gameStats[hero] = { win: 0, lose: 0, ban: 1 }) })
      }

      let globalStats

      if (['HeroLeague', 'StormLeague'].includes(game.game_type)) {
        globalStats = rankedStats
      } else if (game.game_type === 'QuickMatch') {
        globalStats = qmStats
      } else { return }

      mergeStats(globalStats, gameStats, game.game_version)
    })
  } catch (error) {
    console.log('Error. parsed id =', lastParsedId)
    console.log(error)
    return 0
  }

  return count
}

const fetchReplays = async () => {
  let fetchMore = true
  let count = 0

  while (fetchMore) {
    const ts = Date.now()

    process.stdout.write(' Fetching...')

    const len = await fetchNextBatch()

    if (len) { count += len } else { fetchMore = false }

    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0, null)
    process.stdout.write(`Last parsed replay's id: ${lastParsedId}. Fetch: ${count} replays`)

    fs.writeFileSync(lastFetchIdFile, lastParsedId)
    fs.writeFileSync(qmStatsFile, JSON.stringify(qmStats))
    fs.writeFileSync(rankedStatsFile, JSON.stringify(rankedStats))

    const wait = 2200 - Date.now() - ts
    await new Promise(resolve => setTimeout(resolve, wait > 0 ? wait : 0))
  }
}

fetchReplays()
