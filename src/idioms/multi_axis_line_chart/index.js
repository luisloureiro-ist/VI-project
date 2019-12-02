import './index.css'
import * as d3 from 'd3'

class MultiAxisLineChart {
  constructor (parentSelector, chartWidth, withYAxis = false, barHeight = 20) {
    this.parentSelector = parentSelector
    this.barHeight = barHeight
    this.chartWidth = chartWidth
    this.chart = d3.select(this.parentSelector)
    this.xScaler = d3.scaleLinear()
    this.xAxis = d3.axisBottom()
    this.yScaler = null
    this.yAxis = null
    this.yAxisPadding = +(withYAxis && 35) // if false then equals 0
    this.transition = d3
      .transition()
      .duration(1000)
      .ease(d3.easeQuadInOut)
  }

  create (data) {
    this.chart = this.chart
      .append('svg')
      .attr('width', chartWidth + margin.left + margin.right)
      .attr('height', barHeight + margin.top + margin.bottom)
      .append('g')
      .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')')
  }
}

var x = d3.time.scale().range([0, width])
var y0 = d3.scale.linear().range([height, 0])
var y1 = d3.scale.linear().range([height, 0])

var xAxis = d3.svg.axis().scale(x)
  .orient('bottom').ticks(5)

var yAxisLeft = d3.svg.axis().scale(y0)
  .orient('left').ticks(5)

var yAxisRight = d3.svg.axis().scale(y1)
  .orient('right').ticks(5)

var valueline = d3.svg.line()
  .x(function (d) { return x(d.date) })
  .y(function (d) { return y0(d.close) })

var valueline2 = d3.svg.line()
  .x(function (d) { return x(d.date) })
  .y(function (d) { return y1(d.open) })

var svg = d3.select('body')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform',
    'translate(' + margin.left + ',' + margin.top + ')')

// Get the data
d3.csv('data2a.csv', function (error, data) {
  data.forEach(function (d) {
    d.date = parseDate(d.date)
    d.close = +d.close
    d.open = +d.open
  })

  // Scale the range of the data
  x.domain(d3.extent(data, function (d) { return d.date }))
  y0.domain([0, d3.max(data, function (d) {
    return Math.max(d.close)
  })])
  y1.domain([0, d3.max(data, function (d) {
    return Math.max(d.open)
  })])

  svg.append('path') // Add the valueline path.
    .attr('d', valueline(data))

  svg.append('path') // Add the valueline2 path.
    .style('stroke', 'red')
    .attr('d', valueline2(data))

  svg.append('g') // Add the X Axis
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  svg.append('g')
    .attr('class', 'y axis')
    .style('fill', 'steelblue')
    .call(yAxisLeft)

  svg.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(' + width + ' ,0)')
    .style('fill', 'red')
    .call(yAxisRight)
})
