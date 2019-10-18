import * as d3 from 'd3'
import dateSlider from './date-slider'
import patchInfo from '../../patches.json'

const margin = {
  top: 20, right: 30, bottom: 130, left: 60
}

export default class HeroesScatterPlot {
  constructor ({ data, xValue, yValue, xAxisLabel, yAxisLabel, onPlayingEnd, highlightXMid = false, highlightYMid = false }) {
    this.data = data

    this.xValue = xValue
    this.yValue = yValue
    this.key = (d) => d && d.name
    this.xAxisLabel = xAxisLabel
    this.yAxisLabel = yAxisLabel

    this.circleRadius = 15

    this.dataOffset = 0
    this.tDuration = 1000
    this.tEase = d3.easeSinOut
    this.intervalDuration = 2700
    this.isPlaying = true
    this.rescaleAxis = false
    this.onPlayingEnd = onPlayingEnd
    this.highlightXMid = highlightXMid
    this.highlightYMid = highlightYMid
  }

  mount () {
    this.svg = d3.select('svg.chartContainer')
    const [width, height] = this.svg.attr('viewBox').split(' ').slice(2)
    this.innerWidth = width - margin.left - margin.right
    this.innerHeight = height - margin.top - margin.bottom

    this.g = this.svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Axis
    this.xAxisG = this.g.append('g')
      .attr('class', 'xAxis')
      .style('font-size', '14px')
      .attr('transform', `translate(0, ${this.innerHeight})`)
    this.yAxisG = this.g.append('g')
      .attr('class', 'yAxis')
      .style('font-size', '14px')
      .attr('transform', 'translate(0, 0)')

    // Axis Labels
    this.xAxisG
      .append('text')
      .attr('class', 'axis-label')
      .attr('y', 45)
      .attr('x', this.innerWidth / 2)
      .attr('fill', 'black')
      .text(this.xAxisLabel)
    this.yAxisG
      .append('text')
      .attr('class', 'axis-label')
      .attr('y', -45)
      .attr('x', -this.innerHeight / 2)
      .attr('fill', 'black')
      .attr('transform', 'rotate(-90)')
      .style('text-anchor', 'middle')
      .text(this.yAxisLabel)

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

    if (this.highlightXMid) {
      this.xMidBackground = this.g.append('rect')
        .attr('fill', 'lightblue')
        .attr('fill-opacity', '0.3')
        .attr('height', this.innerHeight)
        .attr('x', this.innerWidth / 2)
        .attr('y', 0)
        .attr('width', 0)
    }
    if (this.highlightYMid) {
      this.yMidBackground = this.g.append('rect')
        .attr('fill', 'lightblue')
        .attr('fill-opacity', '0.3')
        .attr('width', this.innerWidth)
        .attr('x', 0)
        .attr('y', this.innerHeight / 2)
        .attr('height', 0)
    }
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

    this.xAxisG.transition(this.tEase).duration(this.tDuration / 2).call(this.xAxis)
    this.yAxisG.transition(this.tEase).duration(this.tDuration / 2).call(this.yAxis)

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
    }, this.intervalDuration)
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

    const { xValue, yValue, circleRadius } = this

    const circle = this.g.selectAll('image.heroCircle').data(heroData, this.key)
    circle.exit().remove()

    // It's important to call xScale from instance (this.xScale) so it won't save old value in closure.
    // Or otherwise mouse events should be added on every update not only on enter.
    const translate = (d) => `translate(${this.xScale(xValue(d)) - circleRadius},${this.yScale(yValue(d)) - circleRadius})`
    const scale = (d, x = 1.3) => `translate(${this.xScale(xValue(d)) - circleRadius * x},${this.yScale(yValue(d)) - circleRadius * x}) scale(${x},${x})`

    this.xMidBackground && this.xMidBackground
      .transition(this.tEase)
      .duration(withTransitions ? this.tDuration / 2 : 0)
      .attr('x', this.xScale(45))
      .attr('width', this.xScale(55) - this.xScale(45))

    this.yMidBackground && this.yMidBackground
      .transition(this.tEase)
      .duration(withTransitions ? this.tDuration / 2 : 0)
      .attr('y', this.yScale(55))
      .attr('height', this.yScale(45) - this.yScale(55))

    const heroCircleEnter = circle
      .enter().append('image')
      .attr('class', 'heroCircle')
      .attr('xlink:href', (d) => `assets/images/${d.shortName}.png`)
      .attr('width', circleRadius * 2)
      .attr('height', circleRadius * 2)
      .on('mouseover', (d, i, elems) => d3.select(elems[i]).attr('transform', scale(d)))
      .on('mouseout', (d, i, elems) => d3.select(elems[i]).attr('transform', translate(d)))
      .attr('clip-path', 'url(#clipObj)')
    heroCircleEnter.append('title').text((d) => d.name)

    if (withTransitions) {
      heroCircleEnter
        .attr('transform', d => scale(d, 3))
        .transition(this.tEase)
        .duration(this.tDuration / 2)
        .attr('transform', translate)
    } else {
      heroCircleEnter.attr('transform', translate)
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
