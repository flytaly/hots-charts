import * as d3 from 'd3'
import dateSlider from './date-slider'
import patchInfo from '../patches.json'

export default () => {
  const minPopularity = 8
  const maxHeroes = 10
  const getColor = (n) => `hsl(${n * 3.6}, 30%, 90%)`
  const tDuration = 1000
  const tEase = d3.easeSinOut
  const svg = d3.select('svg')

  const [width, height] = svg.attr('viewBox').split(' ').slice(2)

  const margin = {
    top: 50, right: 50, bottom: 100, left: 50
  }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const render = (data) => {
    const xValue = (d) => d.winrate
    const xValue2 = (d) => d.popularity
    const yValue = (d) => d.name
    const flatWinrates = data.flatMap((ver) => ver.data.filter(d => xValue2(d) >= minPopularity).map(xValue))

    const xScale = d3.scaleLinear()
      .domain([d3.min(flatWinrates) - 5, d3.max(flatWinrates) + 2])
      .range([0, innerWidth])
      .nice()

    const xScale2 = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth / 2])
      .nice()

    const xAxis = d3.axisBottom(xScale).tickFormat(n => `${n}%`)
    const xAxis2 = d3.axisTop(xScale2).tickFormat(n => `${n}%`).ticks(2)

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
    g.append('g').call(xAxis)
      .attr('transform', `translate(0, ${innerHeight})`)
    g.append('g').call(xAxis2)
    // .attr('transform', `translate(0, ${innerHeight + 30})`)

    const sliderG = g.append('g')
      .attr('transform', `translate(0,${innerHeight + 60})`)

    let count = 0

    const updateDateSlider = dateSlider(sliderG, innerWidth, tDuration, onDateSliderChange)
    renderPatch(data[count])
    const interval = d3.interval(() => {
      count += 1

      if (count >= data.length) {
        interval.stop()
      } else {
        renderPatch(data[count])
        const v = data[count].version
        const date = patchInfo[v] && patchInfo[v].date && new Date(patchInfo[v].date)
        if (date) { updateDateSlider(date) }
      }
    }, 2700)

    function onDateSliderChange (ver) {
      const idx = data.findIndex(d => ver <= d.version)
      count = idx !== -1 ? idx : data.length - 1
      if (count < data.length) { renderPatch(data[count], false) } else { interval.stop() }
    }

    function renderPatch (patchWinrates, withTransitions = true) {
      const heroData = patchWinrates.data
      const patchVer = patchWinrates.version
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

      const onExit = (exitSelection) => {
        if (withTransitions) {
          exitSelection
            .transition().duration(tDuration * 0.70).ease(tEase)
            .attr('y', innerHeight)
            .attr('width', 0)
            .remove()
        } else {
          exitSelection.remove()
        }
      }

      barRect.exit().call(onExit)
      subBarRect.exit().call(onExit)

      subBarRect.enter()
        .append('rect')
        .attr('class', 'subbar')
        .attr('stroke', 'grey')
        .style('fill', (d) => 'white')
        .attr('y', innerHeight)
        .merge(subBarRect)
        .attr('height', yScale.bandwidth() / 3)
        .call((selection) => {
          if (withTransitions) { selection = selection.transition().duration(tDuration).ease(tEase) } else { selection = selection.interrupt() }
          selection
            .attr('y', (d) => yScale(yValue(d)) + yScale.bandwidth() * 0.66)
            .attr('width', (d) => xScale2(xValue2(d)))
        })

      barRect.enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('stroke', 'black')
        .style('fill', (d) => `${getColor(d.id - 71)}`)
        .attr('y', innerHeight)
        .merge(barRect)
        .attr('height', yScale.bandwidth() * 0.66)
        .call((selection) => {
          if (withTransitions) { selection = selection.transition().duration(tDuration).ease(tEase) } else { selection = selection.interrupt() }
          selection
            .attr('y', (d) => yScale(yValue(d)))
            .attr('width', (d) => xScale(xValue(d)))
        })

      heroWR.exit().remove()
      heroName.exit().remove()
      heroPop.exit().remove()

      heroName.enter().append('text')
        .attr('class', 'heroname')
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'central')
        .style('fill', 'black')
        .attr('y', innerHeight)
        .text((d) => yValue(d))
        .merge(heroName)
        .attr('font-size', yScale.bandwidth() * 0.4)
        .call((selection) => {
          if (withTransitions) { selection = selection.transition().duration(tDuration).ease(tEase) } else { selection = selection.interrupt() }
          selection
            .attr('x', (d) => xScale(xValue(d)) - 5)
            .attr('y', (d) => yScale(yValue(d)) + yScale.bandwidth() * 0.33)
        })

      heroWR.enter().append('text')
        .attr('class', 'herowr')
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'central')
        .style('fill', 'black')
        .attr('y', innerHeight)
        .merge(heroWR)
        .attr('font-size', yScale.bandwidth() * 0.4)
        .call((selection) => {
          if (withTransitions) {
            selection = selection.transition().duration(tDuration).ease(tEase).tween('text', function (d) {
              const i = d3.interpolate(this.textContent, xValue(d))
              return function (t) { this.textContent = d3.format('.1f')(i(t)) }
            })
          } else { selection = selection.interrupt().text(d => d3.format('.1f')(xValue(d))) }

          selection
            .attr('x', (d) => xScale(xValue(d)) + 5)
            .attr('y', (d) => yScale(yValue(d)) + yScale.bandwidth() * 0.33)
        })

      heroPop.enter().append('text')
        .attr('class', 'heropop')
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'central')
        .style('fill', 'black')
        .attr('y', innerHeight)
        .merge(heroPop)
        .attr('font-size', yScale.bandwidth() * 0.3)
        .call((selection) => {
          if (withTransitions) {
            selection = selection.transition().duration(tDuration).ease(tEase).tween('text', function (d) {
              const i = d3.interpolateRound(this.textContent, xValue2(d))
              return function (t) { this.textContent = i(t) }
            })
          } else { selection = selection.interrupt().text(xValue2) }

          selection
            .attr('x', (d) => xScale2(xValue2(d)) - 3)
            .attr('y', (d) => yScale(yValue(d)) + yScale.bandwidth() * 0.825)
        })

      images.enter().append('image')
        .attr('class', 'heroImg')
        .attr('xlink:href', (d) => `/assets/images/${d.shortName}.png`)
        .attr('y', innerHeight)
        .merge(images)
        .attr('width', yScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('x', -yScale.bandwidth())
        .call((selection) => {
          if (withTransitions) { selection = selection.transition().duration(tDuration).ease(tEase) } else { selection = selection.interrupt() }
          selection.attr('y', (d) => yScale(yValue(d)))
        })

      if (withTransitions) {
        images.exit()
          .transition().duration(tDuration / 2).ease(tEase)
          .attr('y', innerHeight)
          .remove()
      } else {
        images.exit().remove()
      }
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
        d.version = d.version.split('.').slice(0, 3).join('.')
        d.data = d.data
          .filter(hero => hero.popularity >= minPopularity)
          .slice(0, maxHeroes)
        return d
      })

      render(data)
    })
}
