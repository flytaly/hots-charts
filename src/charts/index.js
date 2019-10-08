import * as d3 from 'd3'

export default () => {
  const minPopularity = 0
  const maxHeroes = 13
  const getColor = (n) => `hsl(${n * 3.6}, 30%, 90%)`
  const tDuration = 1000
  const tEase = d3.easeSinOut
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
    const xValue2 = (d) => d.popularity
    const yValue = (d) => d.name
    const flatWinrates = data.flatMap((ver) => ver.data.map(xValue))

    const xScale = d3.scaleLinear()
      .domain([d3.min(flatWinrates) - 10, d3.max(flatWinrates) + 2])
      .range([0, innerWidth])
      .nice()

    const xScale2 = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth / 2])
      .nice()

    const xAxis = d3.axisBottom(xScale).tickFormat(n => `${n}%`)
    const xAxis2 = d3.axisBottom(xScale2).tickFormat(n => `${n}%`).ticks(2)

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    g.append('g').call(xAxis)
      .attr('transform', `translate(0, ${innerHeight})`)
    g.append('g').call(xAxis2)
      .attr('transform', `translate(0, ${innerHeight + 30})`)

    let count = 0

    renderPatch(data[count])
    const interval = d3.interval(() => {
      count += 1
      renderPatch(data[count])
      if (count >= data.length - 1) {
        interval.stop()
      }
    }, 2700)

    function renderPatch (patchWinrates) {
      const heroData = patchWinrates.data
      const patchVer = patchWinrates.version.split('.').slice(0, 3).join('.')

      const yScale = d3.scaleBand()
        .domain(heroData.map(yValue))
        .range([0, innerHeight])
        .padding(0.2)

      const barRect = g.selectAll('rect.bar').data(heroData, yValue)
      const subBarRect = g.selectAll('rect.subbar').data(heroData, yValue)
      const heroName = g.selectAll('text.heroname').data(heroData, yValue)
      const heroWR = g.selectAll('text.herowr').data(heroData, yValue)
      const heroPop = g.selectAll('text.heropop').data(heroData, yValue)
      const images = g.selectAll('image.heroImg').data(heroData, yValue)

      const onExit = (exit) => exit
        .transition().duration(tDuration / 2).ease(tEase)
        .attr('y', height)
        .attr('width', 0)
        .remove()

      barRect.exit().call(onExit)
      subBarRect.exit().call(onExit)

      subBarRect.enter()
        .append('rect')
        .attr('class', 'subbar')
        .attr('stroke', 'grey')
        .style('fill', (d) => 'white')
        .attr('y', height)
        .merge(subBarRect)
        .attr('height', yScale.bandwidth() / 3)
        .transition().duration(tDuration).ease(tEase)
        .attr('y', (d) => yScale(yValue(d)) + yScale.bandwidth() * 0.66)
        .attr('width', (d) => xScale2(xValue2(d)))

      barRect.enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('stroke', 'black')
        .style('fill', (d) => `${getColor(d.id - 71)}`)
        .attr('y', height)
        .merge(barRect)
        .attr('height', yScale.bandwidth() * 0.66)
        .transition().duration(tDuration).ease(tEase)
        .attr('y', (d) => yScale(yValue(d)))
        .attr('width', (d) => xScale(xValue(d)))

      heroWR.exit().call(onExit)
      heroName.exit().call(onExit)
      heroPop.exit().call(onExit)

      heroName.enter().append('text')
        .attr('class', 'heroname')
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'central')
        .style('fill', 'black')
        .attr('y', height)
        .text((d) => yValue(d))
        .merge(heroName)
        .attr('font-size', yScale.bandwidth() / 2)
        .transition().duration(tDuration).ease(tEase)
        .attr('x', (d) => xScale(xValue(d)) - 5)
        .attr('y', (d) => yScale(yValue(d)) + yScale.bandwidth() * 0.33)

      heroWR.enter().append('text')
        .attr('class', 'herowr')
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'central')
        .style('fill', 'black')
        .attr('y', height)
        .merge(heroWR)
        .attr('font-size', yScale.bandwidth() / 2)
        .transition().duration(tDuration).ease(tEase)
        .attr('x', (d) => xScale(xValue(d)) + 5)
        .attr('y', (d) => yScale(yValue(d)) + yScale.bandwidth() * 0.33)
      // .text((d) => d3.format('.1f')(xValue(d)))
        .tween('text', function (d) {
          const i = d3.interpolate(this.textContent, xValue(d))
          return function (t) { this.textContent = d3.format('.1f')(i(t)) }
        })

      heroPop.enter().append('text')
        .attr('class', 'heropop')
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'central')
        .style('fill', 'black')
        .attr('y', height)
        .merge(heroPop)
        .attr('font-size', yScale.bandwidth() / 3)
        .transition().duration(tDuration).ease(tEase)
        .attr('x', (d) => xScale2(xValue2(d)) - 3)
        .attr('y', (d) => yScale(yValue(d)) + yScale.bandwidth() * 0.825)
      // .text(xValue2)
        .tween('text', function (d) {
          const i = d3.interpolateRound(this.textContent, xValue2(d))
          return function (t) { this.textContent = i(t) }
        })

      images.enter().append('image')
        .attr('class', 'heroImg')
        .attr('xlink:href', (d) => `/assets/images/${d.shortName}.png`)
        .attr('y', height)
        .merge(images)
        .attr('width', yScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('x', -yScale.bandwidth())
        .transition().duration(tDuration).ease(tEase)
        .attr('y', (d) => yScale(yValue(d)))

      images.exit()
        .transition().duration(tDuration / 2).ease(tEase)
        .attr('y', height)
        .remove()

      g.select('text.patchNumber').remove()
      g
        .append('text')
        .attr('class', 'patchNumber')
        .attr('x', innerWidth)
        .attr('y', innerHeight - 10)
        .attr('text-anchor', 'end')
        .text(d => `Patch: ${patchVer}`)
    }
  }

  fetch('stats/ranked-stats.json')
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
}
