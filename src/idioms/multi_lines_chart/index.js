import Legend from '../../../assets/js/d3.legend.js'

class MultiLinesChart {
  constructor (parentSelector, chartWidth, chartHeight) {
    this.parentSelector = parentSelector
    this.legendHeight = 50
    this.chartWidth = chartWidth
    this.chartHeight = chartHeight - this.legendHeight
    this.chart = d3.select(this.parentSelector)
    this.yScaler = null
    this.xAxisHeight = 35
    this.yAxisWidth = 50
    this.titleHeight = 190
    this.padding = 10
    this.transition = d3
      .transition()
      .duration(1000)
      .ease(d3.easeQuadInOut)
    this.categories = []

    this.years = [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017]

    this.lines = d3
      .line()
      // .curve(d3.curveCardinal)
      .x((d, i) => this.x(this.years[i]))
      .y(d => this.y(d))

    this.x = d3
      .scalePoint()
      .range([this.yAxisWidth, this.chartWidth])
      .domain(this.years)
      .padding(0.5)

    this.maxValue = 0

    this.y = d3
      .scaleLinear()
      .rangeRound([this.padding, this.chartHeight - this.xAxisHeight])
  }

  create (data, years, categories) {
    this.years = years
    this.categories = categories
    this.maxValue = data.reduce((prev, curr) => {
      const currMax = d3.max(curr)
      return currMax > prev ? currMax : prev
    }, 0)
    this.y.domain([this.maxValue + this.maxValue / 3, 0])

    const chart = this.chart
      .append('svg')
      .classed('svg-chart multi-lines', true)
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight)

    var xAxis = d3
      .axisBottom()
      .scale(this.x)
      .tickValues(years)
      .tickFormat(d3.format('d'))
      .tickSizeOuter(0)
    var yAxis = d3
      .axisLeft()
      .scale(this.y)
      .tickSizeOuter(0)
      .tickFormat(d3.format('d'))

    // create x-axis
    chart
      .append('g')
      .attr('class', 'x-axis')
      .attr(
        'transform',
        `translate(0, ${this.chartHeight - this.xAxisHeight} )`
      )
      .call(xAxis)

    // create y-axis
    chart
      .append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${this.yAxisWidth}, 0)`)
      .call(yAxis)

    const __appendStaticPath = selection =>
      selection
        .append('path')
        .classed('static', true)
        .transition(this.transition)
        .attr('fill', 'none')
        .attr('stroke', (d, i) => categories[i].color)
        .attr('stroke-opacity', 0.5)
        .attr('stroke-width', 1.5)
        .attr('d', this.lines)

    const __appendDynamicPath = selection =>
      selection
        .append('path')
        .classed('dynamic', true)
        .transition(this.transition)
        .attr('fill', 'none')
        .attr('stroke', (d, i) => categories[i].color)
        .attr('stroke-width', 1.5)
        .attr('d', this.lines)

    const __appendDynamicCircles = (selection, i) =>
      selection
        .selectAll('circle')
        .data((d, i) => d.map(d => ({ category: i, value: d })))
        .enter()
        .append('circle')
        .on('mouseover', function () {
          d3.select(this)
            .interrupt()
            .transition(this.transition)
            .attr('r', 6)
        })
        .on('mouseleave', function () {
          d3.select(this)
            .interrupt()
            .transition(this.transition)
            .attr('r', 3)
        })
        .transition(this.transition)
        .attr('fill', d => categories[d.category].color)
        .attr('stroke', d => categories[d.category].color)
        .attr('stroke-width', 1.5)
        .attr('cx', (d, i) => this.x(years[i]))
        .attr('cy', d => this.y(d.value))
        .attr('r', 3)
        .selection()
        .append('title')
        .text(
          (d, i) => `${d.value} ${categories[d.category].label} in ${years[i]}`
        )

    chart
      .append('g')
      .classed('lines', true)
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .call(__appendStaticPath)
      .call(__appendDynamicPath)
      .call(__appendDynamicCircles)

    // create legend
    this.chart
      .append(
        () =>
          new Legend({
            color: d3.scaleThreshold(
              categories.map(c => c.label),
              categories.map(c => c.color)
            ),
            title: 'Absolute number of',
            width: 54 * categories.length
          })
      )
      .classed('svg-legend multi-lines', true)
      .selectAll('.tick text')
      .attr('x', -26)
  }

  update (data, years) {
    this.years = years

    this.maxValue = data.reduce((prev, curr) => {
      const currMax = d3.max(curr)
      return currMax > prev ? currMax : prev
    }, 0)

    this.y.domain([this.maxValue + this.maxValue / 3, 0])

    // y-axis update
    var yAxis = d3
      .axisLeft()
      .scale(this.y)
      .tickSizeOuter(0)
      .tickFormat(d3.format('d'))

    this.chart
      .select('.y-axis')
      .interrupt() // Avoids "too late; already running" error
      .transition(this.transition)
      .call(yAxis)

    const __updateStaticPath = selection =>
      selection.select('.static').attr('d', this.lines)

    const __updateDynamicPath = selection =>
      selection.select('.dynamic').attr('d', this.lines)

    const __updateDynamicCircles = selection =>
      selection
        .selectAll('circle')
        .data((d, i) => d.map(d => ({ category: i, value: d })))
        .join(
          enter => enter,
          update =>
            update
              .interrupt()
              .transition(this.transition)
              .attr('cx', (d, i) => this.x(years[i]))
              .attr('cy', d => this.y(d.value))
              .select('title')
              .text(
                (d, i) =>
                  `${d.value} ${this.categories[d.category].label} in ${
                    years[i]
                  }`
              )
        )

    this.chart
      .select('.lines')
      .selectAll('g')
      .data(data)
      .join(
        enter => enter,
        update =>
          update
            .interrupt()
            .transition(this.transition)
            .call(__updateStaticPath)
            .call(__updateDynamicPath)
      )
      .call(__updateDynamicCircles)
  }

  updateYears (data, years) {
    this.years = years
    this.maxValue = d3.max([d3.max(data[0]), d3.max(data[1])])

    // this.y.domain([
    //   this.maxValue + this.maxValue / 3,
    //   0
    // ])

    this.chart
      .select('.dynamic-fires')
      .selectAll('path')
      .interrupt()
      .datum(data[0])
      .transition(this.transition)
      .attr('d', this.lines)

    this.chart
      .select('.dynamic-fires')
      .selectAll('circle')
      .interrupt()
      .data(data[0])
      .transition(this.transition)
      .attr('cx', (d, i) => this.x(this.years[i]))
      .attr('cy', d => this.y(d))
      .select('title')
      .text((d, i) => d + ' fires in ' + this.years[i])

    this.chart
      .select('.dynamic-firefighters')
      .selectAll('path')
      .interrupt()
      .datum(data[1])
      .transition(this.transition)
      .attr('d', this.lines)

    this.chart
      .select('.dynamic-firefighters')
      .selectAll('circle')
      .interrupt()
      .data(data[1])
      .transition(this.transition)
      .attr('cx', (d, i) => this.x(this.years[i]))
      .attr('cy', d => this.y(d))
      .select('title')
      .text((d, i) => d + ' fires in ' + this.years[i])
  }
}
export default MultiLinesChart
