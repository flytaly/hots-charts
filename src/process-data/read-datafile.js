const fs = require('fs')
const zlib = require('zlib')
const readline = require('readline')
const CSV = require('csv-string')

const readDataFile = (fpath, onData, onEnd, isZipped = true) => {
  if (!fpath || !onData) return

  const fileInput = fs.createReadStream(fpath)
  const gunzip = zlib.createGunzip()

  let lineCount = 0

  readline.createInterface({
    input: isZipped ? gunzip : fileInput
  }).on('line', line => {
    const parsed = CSV.parse(line)
    onData(parsed[0])
    lineCount++
    if (lineCount % 1e6 === 0) {
      process.stdout.clearLine()
      process.stdout.write('read ' + lineCount + ' lines')
      process.stdout.cursorTo(0)
    }
  }).on('close', () => {
    process.stdout.clearLine()
    console.log(`Read ${lineCount} lines from ${fpath}`)
    onEnd && onEnd()
  })

  if (isZipped) {
    fileInput.pipe(gunzip)
  }
}

module.exports = {
  readDataFile
}
