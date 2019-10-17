import * as d3 from 'd3'
import dateSlider from './date-slider'
import patchInfo from '../../patches.json'

const margin = {
  top: 20, right: 30, bottom: 130, left: 50
}

export default class HeroesScatterPlot {
  constructor ({ data, xValue, yValue, onPlayingEnd }) {
    this.data = data

    this.xValue = xValue
    this.yValue = yValue
    this.key = (d) => d && d.name

    this.circleRadius = 15

    this.dataOffset = 0
    this.tDuration = 1000
    this.tEase = d3.easeSinOut
    this.isPlaying = true
    this.rescaleAxis = false
    this.onPlayingEnd = onPlayingEnd
  }

  mount () {
    this.svg = d3.select('svg.chartContainer')
    const [width, height] = this.svg.attr('viewBox').split(' ').slice(2)
    this.innerWidth = width - margin.left - margin.right
    this.innerHeight = height - margin.top - margin.bottom

    this.g = this.svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Axis
    this.g.append('g').attr('class', 'xAxis').attr('transform', `translate(0, ${this.innerHeight})`)
    this.g.append('g').attr('class', 'yAxis').attr('transform', 'translate(0, 0)')

    // Date slider
    const sliderG = this.g.append('g')
      .attr('transform', `translate(0, ${this.innerHeight + 85})`)
    this.updateDateSlider = dateSlider(sliderG, this.innerWidth, this.tDuration, (v) => this.onDateSliderChange(v))

    // Clip path
    this.g.append('clipPath')
      .attr('id', 'clipObj')
      .append('circle')
      .attr('cx', this.circleRadius)
      .attr('cy', this.circleRadius)
      .attr('r', this.circleRadius)

    this.midBackground = this.g.append('rect')
      .attr('fill', 'lightblue')
      .attr('fill-opacity', '0.3')
      .attr('height', this.innerHeight)
  }

  update ({ data, xDomain, yDomain, isPlaying = true, rescaleAxis = false }) {
    if (data) this.data = data
    if (xDomain) { this.xDomain = xDomain }
    if (yDomain) { this.yDomain = yDomain }
    this.isPlaying = isPlaying
    this.rescaleAxis = rescaleAxis

    this.xScale = this.getXScale()
    this.yScale = this.getYScale()
    this.xAxis = d3.axisBottom(this.xScale).tickFormat(n => `${n}%`)
    this.yAxis = d3.axisLeft(this.yScale).tickFormat(n => `${n}%`)

    this.g.select('.xAxis').transition(this.tEase).duration(this.tDuration / 2).call(this.xAxis)
    this.g.select('.yAxis').transition(this.tEase).duration(this.tDuration / 2).call(this.yAxis)

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
      .clamp(true)
  }

  getYScale () {
    return d3.scaleLinear()
      .domain(this.yDomain)
      .range([this.innerHeight, 0])
      .nice()
      .clamp(true)
  }

  zoomXAxis (heroData, withTransitions) {
    const [l, r] = d3.extent(heroData, this.xValue)
    const span = 50 - l > r - 50 ? 50 - l : r - 50

    this.xDomain = [50 - span, 50 + span]
    this.xScale = this.getXScale()
    this.xAxis = d3.axisBottom(this.xScale).tickFormat(n => `${n}%`)
    this.g.select('.xAxis')
      .transition(this.tEase)
      .duration(withTransitions ? this.tDuration / 2 : 0)
      .call(this.xAxis)
  }

  render (withTransitions = true) {
    const patchData = this.data && this.data[this.dataOffset]
    if (!patchData) return
    const { version, data: heroData } = patchData
    if (this.rescaleAxis) this.zoomXAxis(heroData)

    const { xValue, yValue, xScale, yScale, circleRadius } = this

    const circle = this.g.selectAll('image.heroCircle').data(heroData, this.key)
    circle.exit().remove()

    const translate = (d) => `translate(${xScale(xValue(d)) - circleRadius},${yScale(yValue(d)) - circleRadius})`
    const scale = (d, x = 1.3) => `translate(${xScale(xValue(d)) - circleRadius * x},${yScale(yValue(d)) - circleRadius * x}) scale(${x},${x})`

    this.midBackground
      .transition(this.tEase)
      .duration(withTransitions ? this.tDuration / 2 : 0)
      .attr('x', xScale(45))
      .attr('y', 0)
      .attr('width', xScale(55) - xScale(45))

    const heroCircle = circle
      .enter().append('image')
      .attr('class', 'heroCircle')
      .attr('xlink:href', (d) => `assets/images/${d.shortName}.png`)
      .attr('width', circleRadius * 2)
      .attr('height', circleRadius * 2)
      .on('mouseover', (d, i, elems) => d3.select(elems[i]).attr('transform', scale(d)))
      .on('mouseout', (d, i, elems) => d3.select(elems[i]).attr('transform', translate(d)))
      .attr('clip-path', 'url(#clipObj)')
    heroCircle.append('title').text((d) => d.name)

    if (withTransitions) {
      heroCircle
        .attr('transform', d => scale(d, 3))
        .transition(this.tEase)
        .duration(this.tDuration / 2)
        .attr('transform', translate)
    } else {
      heroCircle.attr('transform', translate)
    }

    circle
      .transition(this.tEase)
      .duration(withTransitions ? this.tDuration : 0)
      .attr('transform', translate)

    const patchImgSize = this.circleRadius * 2
    this.g.select('g.patchBlock').remove()
    const patchG = this.g
      .append('g')
      .attr('class', 'patchBlock')
      .attr('transform', `translate(${this.innerWidth}, ${this.innerHeight - patchImgSize - 30})`)

    patchG
      .append('text')
      .attr('y', patchImgSize + 20)
      .attr('text-anchor', 'end')
      .text(`Patch: ${version}`)

    const { prevHero } = patchInfo[version] ? patchInfo[version] : {}

    if (prevHero) {
      patchG
        .append('image')
        .attr('xlink:href', (d) => `assets/images/${prevHero}.png`)
        .attr('x', -patchImgSize)
        .attr('width', patchImgSize)
        .attr('height', patchImgSize)
        .attr('title', 'text')
        .append('title')
        .text('The last released hero')
    }
  }
}
