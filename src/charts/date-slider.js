import * as d3 from 'd3'
import patchInfo from '../patches.json'

// based on https://bl.ocks.org/officeofjane/47d2b0bfeecfcb41d2212d06d095c763

const patches = Object.keys(patchInfo).sort((a, b) => new Date(patchInfo[b].date) - new Date(patchInfo[a].date))
const dates = patches.map(p => new Date(patchInfo[p].date))

const getPatchBeDate = (date) => {
  const result = patches.find((p) => {
    const patchDate = new Date(patchInfo[p].date)
    if (date >= patchDate) {
      return true
    }
  })
  return result || patches[patches.length - 1]
}

const dateSlider = (g, width, tDuration, onChange) => {
  const formatDate = d3.timeFormat('%b %Y')
  const formatDateYear = d3.timeFormat('%Y')
  const parseDate = d3.timeParse('%m/%d/%y')

  let currentValue = 0
  const slider = g
    .attr('class', 'slider')

  const startDate = d3.min(dates)
  const endDate = d3.max(dates)

  const x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, width])
    .clamp(true)

  slider.append('line')
    .attr('class', 'track')
    .attr('x1', x.range()[0])
    .attr('x2', x.range()[1])
    .select(function () { return this.parentNode.appendChild(this.cloneNode(true)) })
    .attr('class', 'track-inset')
    .select(function () { return this.parentNode.appendChild(this.cloneNode(true)) })
    .attr('class', 'track-overlay')
    .call(d3.drag()
      .on('start.interrupt', function () { slider.interrupt() })
      .on('start drag', function () {
        currentValue = d3.event.x
        update(x.invert(currentValue), false)
        onChange && onChange(getPatchBeDate(x.invert(currentValue)))
      })
    )

  slider.insert('g', '.track-overlay')
    .attr('class', 'ticks')
    .attr('transform', 'translate(0,18)')
    .selectAll('text')
    .data(x.ticks(5))
    .enter()
    .append('text')
    .attr('x', x)
    .attr('y', 10)
    .attr('text-anchor', 'middle')
    .text((d) => formatDateYear(d))

  const handle = slider.insert('circle', '.track-overlay')
    .attr('class', 'handle')
    .attr('r', 9)

  const label = slider.append('text')
    .attr('class', 'label')
    .attr('text-anchor', 'middle')
    .text(formatDate(startDate))
    .attr('transform', 'translate(0, -18)')

  function update (h, withTransition = true) {
    const _h = withTransition ? handle.transition().duration(tDuration) : handle.interrupt()
    _h.attr('cx', x(h))
    const _l = withTransition ? label.transition().duration(tDuration) : label.interrupt()
    _l
      .attr('cx', x(h))
      .attr('x', x(h))
      .text(formatDate(h))
  }

  return update
}

export default dateSlider
