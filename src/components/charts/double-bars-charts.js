import * as d3 from 'd3'
import dateSlider from './date-slider'
import patchInfo from '../../patches.json'

const margin = {
  top: 10, right: 30, bottom: 130, left: 50
}
const getHeroColor = (n) => `hsl(${(n - 71) * 3.6}, 30%, 90%)`

export default class DoubleBarsHeroesChart {
  constructor ({ data, xValue, x2Value, onPlayingEnd, xInterpolate, xFormat }) {
    this.data = data

    this.xValue = xValue
    this.x2Value = x2Value
    this.yValue = (d) => d.name

    this.format = xFormat || d3.format('.3')
    this.interpolate = xInterpolate || d3.interpolateRound

    this.dataOffset = 0
    this.tDuration = 1000
    this.tEase = d3.easeSinOut
    this.isPlaying = true
    this.onPlayingEnd = onPlayingEnd
    this.isReversed = true
  }

  mount () {
    this.svg = d3.select('svg.chartContainer')
    const [width, height] = this.svg.attr('viewBox').split(' ').slice(2)
    this.innerWidth = width - margin.left - margin.right
    this.innerHeight = height - margin.top - margin.bottom

    this.g = this.svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
    this.g.append('g').attr('class', 'xAxis').attr('transform', `translate(0, ${this.innerHeight})`)
    this.g.append('g').attr('class', 'x2Axis').attr('transform', `translate(0, ${this.innerHeight + 30})`)

    const sliderG = this.g.append('g')
      .attr('transform', `translate(0, ${this.innerHeight + 85})`)
    this.updateDateSlider = dateSlider(sliderG, this.innerWidth, this.tDuration, (v) => this.onDateSliderChange(v))
  }

  update ({ data, xDomain, x2Domain, isPlaying = true, isReversed = false }) {
    if (data) this.data = data
    if (xDomain) {
      this.xDomain = xDomain
      this.xScale = this.getXScale()
    }
    if (x2Domain) {
      this.x2Domain = x2Domain
      this.x2Scale = this.getX2Scale()
    }
    this.isPlaying = isPlaying
    this.isReversed = isReversed

    this.xScale = this.getXScale()
    this.x2Scale = this.getX2Scale()
    const xAxis = d3.axisBottom(this.xScale).tickFormat(n => `${n}%`)
    const x2Axis = d3.axisBottom(this.x2Scale).tickFormat(n => `${n}%`).ticks(2)

    this.g.select('.xAxis').transition().call(xAxis)
    this.g.select('.x2Axis').call(x2Axis)

    this.render()
    this.runInterval()
  }

  runInterval () {
    this.clearInterval()
    this.interval = d3.interval(() => {
      if (!this.isPlaying) {
        this.clearInterval()
        return
      }
      this.dataOffset += 1
      if (this.dataOffset >= this.data.length) {
        this.clearInterval()
        this.dataOffset = this.data.length - 1
        this.onPlayingEnd && this.onPlayingEnd()
      } else {
        this.render()
        const v = this.data[this.dataOffset].version
        const date = patchInfo[v] && patchInfo[v].date && new Date(patchInfo[v].date)
        if (date) { this.updateDateSlider(date) }
      }
    }, 2700)
  }

  clearInterval () {
    this.interval && this.interval.stop()
  }

  onDateSliderChange (ver) {
    if (!this.data) return
    const idx = this.data.findIndex(d => ver <= d.version)
    this.dataOffset = idx !== -1 ? idx : this.data.length - 1
    if (this.dataOffset < this.data.length) { this.render(false) } else { this.clearInterval() }
  }

  getXScale () {
    return d3.scaleLinear()
      .domain(this.xDomain)
      .range([0, this.innerWidth])
      .nice()
  }

  getX2Scale () {
    return d3.scaleLinear()
      .domain(this.x2Domain)
      .range([0, this.innerWidth / 2])
      .nice()
  }

  render (withTransitions = true) {
    const patchData = this.data && this.data[this.dataOffset]
    if (!patchData) return
    const { version, data: heroData } = patchData
    this.yScale = d3.scaleBand()
      .domain(heroData.map(this.yValue))
      .range([0, this.innerHeight])
      .padding(0.2)

    const barRect = this.g.selectAll('rect.bar').data(heroData, this.yValue)
    const bar2Rect = this.g.selectAll('rect.subbar').data(heroData, this.yValue)
    const barName = this.g.selectAll('text.barName').data(heroData, this.yValue)
    const barValue = this.g.selectAll('text.barValue').data(heroData, this.yValue)
    const bar2Value = this.g.selectAll('text.bar2Value').data(heroData, this.yValue)
    const images = this.g.selectAll('image.barImg').data(heroData, this.yValue)

    const yStart = this.isReversed ? -10 : this.innerHeight
    const widthStart = this.isReversed ? this.innerWidth * 0.70 : 0

    const onExit = (exitSelection) => {
      if (withTransitions) {
        exitSelection
          .transition().duration(this.tDuration * 0.70).ease(this.tEase)
          .attr('y', yStart)
          .remove()
      } else {
        exitSelection.remove()
      }
    }
    barRect.exit().call(onExit)
    bar2Rect.exit().call(onExit)
    barName.exit().remove()
    barValue.exit().remove()
    bar2Value.exit().remove()

    bar2Rect.enter()
      .append('rect')
      .attr('class', 'subbar')
      .attr('stroke', 'grey')
      .style('fill', (d) => 'white')
      .attr('y', yStart)
      .attr('width', widthStart / 2)
      .merge(bar2Rect)
      .attr('height', this.yScale.bandwidth() / 3)
      .call((selection) => {
        if (withTransitions) {
          selection = selection.transition().duration(this.tDuration).ease(this.tEase)
        } else {
          selection = selection.interrupt()
        }
        selection
          .attr('y', (d) => this.yScale(this.yValue(d)) + this.yScale.bandwidth() * 0.66)
          .attr('width', (d) => this.x2Scale(this.x2Value(d)))
      })

    barRect.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('stroke', 'black')
      .style('fill', (d) => `${getHeroColor(d.id)}`)
      .attr('y', yStart)
      .attr('width', widthStart)
      .merge(barRect)
      .attr('height', this.yScale.bandwidth() * 0.66)
      .call((selection) => {
        if (withTransitions) {
          selection = selection.transition().duration(this.tDuration).ease(this.tEase)
        } else {
          selection = selection.interrupt()
        }
        selection
          .attr('y', (d) => this.yScale(this.yValue(d)))
          .attr('width', (d) => this.xScale(this.xValue(d)))
      })

    barName.enter().append('text')
      .attr('class', 'barName')
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'central')
      .style('fill', 'black')
      .attr('y', yStart)
      .attr('x', widthStart - 5)
      .text((d) => this.yValue(d))
      .merge(barName)
      .attr('font-size', this.yScale.bandwidth() * 0.4)
      .call((selection) => {
        if (withTransitions) {
          selection = selection.transition().duration(this.tDuration).ease(this.tEase)
        } else {
          selection = selection.interrupt()
        }
        selection
          .attr('x', (d) => this.xScale(this.xValue(d)) - 5)
          .attr('y', (d) => this.yScale(this.yValue(d)) + this.yScale.bandwidth() * 0.33)
      })

    barValue.enter().append('text')
      .attr('class', 'barValue')
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'central')
      .style('fill', 'black')
      .attr('y', yStart)
      .attr('x', widthStart + 5)
      .merge(barValue)
      .attr('font-size', this.yScale.bandwidth() * 0.4)
      .call((selection) => {
        if (withTransitions) {
          const { xValue, format, interpolate, isReversed } = this
          selection = selection.transition().duration(this.tDuration).ease(this.tEase)
            .tween('text', function (d) {
              const startValue = isReversed ? xValue(d) + 3 : xValue(d) - 3
              const i = interpolate(this.textContent || startValue, xValue(d))
              return function (t) { this.textContent = format(i(t)) }
            })
        } else { selection = selection.interrupt().text(d => this.format(this.xValue(d))) }

        selection
          .attr('x', (d) => this.xScale(this.xValue(d)) + 5)
          .attr('y', (d) => this.yScale(this.yValue(d)) + this.yScale.bandwidth() * 0.33)
      })

    bar2Value.enter().append('text')
      .attr('class', 'bar2Value')
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'central')
      .style('fill', 'black')
      .attr('y', yStart)
      .attr('x', widthStart / 2 + 3)
      .merge(bar2Value)
      .attr('font-size', this.yScale.bandwidth() * 0.3)
      .call((selection) => {
        if (withTransitions) {
          const { x2Value } = this
          selection = selection.transition().duration(this.tDuration).ease(this.tEase)
            .tween('text', function (d) {
              const i = d3.interpolateRound(this.textContent || x2Value(d), x2Value(d))
              return function (t) { this.textContent = d3.format('d')(i(t)) }
            })
        } else {
          selection = selection.interrupt().text((d) => d3.format('d')(this.x2Value(d)))
        }

        selection
          .attr('x', (d) => this.x2Scale(this.x2Value(d)) + 3)
          .attr('y', (d) => this.yScale(this.yValue(d)) + this.yScale.bandwidth() * 0.825)
      })

    images.enter().append('image')
      .attr('class', 'barImg')
      .attr('xlink:href', (d) => `assets/images/${d.shortName}.png`)
      .attr('y', yStart)
      .merge(images)
      .attr('width', this.yScale.bandwidth())
      .attr('height', this.yScale.bandwidth())
      .attr('x', -this.yScale.bandwidth())
      .call((selection) => {
        if (withTransitions) {
          selection = selection.transition().duration(this.tDuration).ease(this.tEase)
        } else {
          selection = selection.interrupt()
        }
        selection.attr('y', (d) => this.yScale(this.yValue(d)))
      })

    if (withTransitions) {
      images.exit()
        .transition().duration(this.tDuration / 2).ease(this.tEase)
        .attr('y', yStart)
        .remove()
    } else {
      images.exit().remove()
    }

    this.g.select('g.patchBlock').remove()
    const patchG = this.g
      .append('g')
      .attr('class', 'patchBlock')
      .attr('transform', `translate(${this.innerWidth}, ${this.innerHeight - this.yScale.bandwidth() - 30})`)

    patchG
      .append('text')
      .attr('y', this.yScale.bandwidth() + 20)
      .attr('text-anchor', 'end')
      .text(`Patch: ${version}`)

    const { prevHero } = patchInfo[version] ? patchInfo[version] : {}
    if (prevHero) {
      patchG
        .append('image')
        .attr('xlink:href', (d) => `assets/images/${prevHero}.png`)
        .attr('x', -this.yScale.bandwidth())
        .attr('width', this.yScale.bandwidth())
        .attr('height', this.yScale.bandwidth())
        .attr('title', 'text')
        .append('title')
        .text('The last released hero')
    }
  }
}
