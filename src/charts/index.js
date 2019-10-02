/* global d3 */

const minPopularity = 8
const maxHeroes = 10

const svg = d3.select('svg')

const width = +svg.attr('width')
const height = +svg.attr('height')

const margin = {
  top: 50, right: 50, bottom: 50, left: 50
}
const innerWidth = width - margin.left - margin.right
const innerHeight = height - margin.top - margin.bottom

const render = (data) => {
  const xValue = (d) => d.winrate
  const yValue = (d) => d.name
  const patchVer = data.version && data.version.split('.').slice(0, 3).join('.')

  const currentHeroData = data[data.length - 1].data

  /* Scales  */
  const flatWinrates = data.flatMap((ver) => ver.data.map(xValue))

  const xScale = d3.scaleLinear()
    .domain([49, d3.max(flatWinrates)])
    .range([0, innerWidth])
    .nice()

  const yScale = d3.scaleBand()
    .domain(currentHeroData.map(yValue))
    .range([0, innerHeight])
    .padding(0.1)

  /* Axes */
  const xAxis = d3.axisBottom(xScale)
  const yAxis = d3.axisLeft(yScale)

  /* Groups */
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const xAxisG = g.append('g').call(xAxis)
    .attr('transform', `translate(0, ${innerHeight})`)

  const yAxisG = g.append('g').call(yAxis)

  /* Selections */
  g.selectAll('rect').data(currentHeroData)
    .enter().append('rect')
    .attr('y', (d) => yScale(yValue(d)))
    .attr('width', (d) => xScale(xValue(d)))
    .attr('height', yScale.bandwidth())

  g.append('text')
    .attr('x', innerWidth - 30)
    .attr('y', innerHeight - 20)
    .text(patchVer)
}

fetch('stats/winrates-historical.json')
  .then((resp) => resp.json())
  .then(data => {
    data = data.filter(d => d.totalGames > 1000)
    data = data.map(d => {
      d.data = d.data
        .filter(hero => hero.popularity >= minPopularity)
        .slice(0, maxHeroes)
      return d
    })

    render(data)
  })
