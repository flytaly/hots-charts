const axios = require('axios')
const fs = require('fs')
const path = require('path')

const url = 'http://hotsapi.net/api/v1/heroes/'
const imgDir = path.join(__dirname, 'images')

if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir)

async function saveImage (imgUrl, heroName) {
  const file = fs.createWriteStream(path.join(imgDir, `${heroName}.png`))
  try {
    const { data } = await axios({
      method: 'get',
      url: imgUrl,
      responseType: 'stream'
    })
    data.pipe(file)
    file
      .on('finish', () => console.log(`${heroName}.png saved`))
  } catch (e) {
    console.log(`couldn't get ${imgUrl}`)
  }
}

async function getImages () {
  const { data } = await axios(url)
  for (const hero of data) {
    const size = Object.keys(hero.icon_url).pop()
    await saveImage(hero.icon_url[size], hero.short_name)
  }
}

getImages()
