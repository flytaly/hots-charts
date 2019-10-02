/* global d3 */

const minPopularity = 8
const maxHeroes = 10
const getColor = (n) => `hsl(${n * 3.6}, 30%, 90%)`

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

  const currentHeroData = data[data.length - 1].data
  const patchVer = data[data.length - 1].version.split('.').slice(0, 3).join('.')

  /* Scales  */
  const flatWinrates = data.flatMap((ver) => ver.data.map(xValue))

  const xScale = d3.scaleLinear()
    .domain([49, d3.max(flatWinrates)])
    .range([0, innerWidth])
    .nice()

  const yScale = d3.scaleBand()
    .domain(currentHeroData.map(yValue))
    .range([0, innerHeight])
    .padding(0.2)

  /* Axes */
  const xAxis = d3.axisBottom(xScale).tickFormat(n => `${n}%`)

  // const yAxis = d3.axisLeft(yScale)

  /* Groups */
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const xAxisG = g.append('g').call(xAxis)
    .attr('transform', `translate(0, ${innerHeight})`)

  /* Selections */
  var bar = g.selectAll('g.bar')
    .data(currentHeroData)
    .enter().append('g')
    .attr('class', 'bar')

  bar.append('rect')
    .attr('y', (d) => yScale(yValue(d)))
    .attr('width', (d) => xScale(xValue(d)))
    .attr('height', yScale.bandwidth())
    .attr('stroke', 'black')
    .style('fill', (d) => `${getColor(d.id - 71)}`)

  bar.append('text')
    .attr('x', (d) => xScale(xValue(d)) - 10)
    .attr('y', (d) => yScale(yValue(d)) + yScale.bandwidth() / 2)
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'central')
    .text((d) => yValue(d))
    .style('fill', 'black')

  bar.append('text')
    .attr('x', (d) => xScale(xValue(d)) + 5)
    .attr('y', (d) => yScale(yValue(d)) + yScale.bandwidth() / 2)
    .attr('text-anchor', 'start')
    .attr('dominant-baseline', 'central')
    .text((d) => d3.format('.1f')(d.winrate))
    .style('fill', 'black')

  g.append('text')
    .attr('x', innerWidth)
    .attr('y', innerHeight - 10)
    .attr('text-anchor', 'end')
    .text(`Patch: ${patchVer}`)
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
