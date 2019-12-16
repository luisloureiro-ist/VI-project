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
  };

  create (data, years) {
    const chart = this.chart
      .append('svg')
      .classed('svg-chart multi-lines', true)
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight)

    var x = d3.scalePoint()
      .range([this.yAxisWidth, this.chartWidth])
      .domain(years)
      .padding(0.5)

    var maxValue = d3.max([d3.max(data[0]), d3.max(data[1])])

    var y = d3.scaleLinear()
      .rangeRound([this.padding, this.chartHeight - this.xAxisHeight])
      .domain([
        maxValue + maxValue / 3,
        0
      ])

    var lines = d3.line()
      .curve(d3.curveCardinal)
      .x((d, i) => x(years[i]))
      .y(d => y(d))

    var xAxis = d3.axisBottom().scale(x).tickValues(years).tickFormat(d3.format('d')).tickSizeOuter(0)
    var yAxis = d3.axisLeft().scale(y).tickSizeOuter(0).tickFormat(d3.format('d'))

    // create x-axis
    chart
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.chartHeight - this.xAxisHeight} )`)
      .call(xAxis)

    // create y-axis
    chart
      .append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${this.yAxisWidth}, 0)`)
      .call(yAxis)

    // create fix fires path
    chart
      .append('g')
      .classed('static-fires', true)
      .append('path')
      .datum(data[0])
      .transition(this.transition)
      .attr('fill', 'none')
      .attr('stroke', 'orange')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', 1.5)
      .attr('d', lines)

    // create dynamic fires path
    chart
      .append('g')
      .classed('dynamic-fires', true)
      .append('path')
      .datum(data[0])
      .transition(this.transition)
      .attr('fill', 'none')
      .attr('stroke', 'orange')
      .attr('stroke-width', 1.5)
      .attr('d', lines)

    // create static firefighters path
    chart
      .append('g')
      .classed('static-firefighters', true)
      .append('path')
      .datum(data[1])
      .transition(this.transition)
      .attr('fill', 'none')
      .attr('stroke', 'red')
      .attr('stroke-width', 1.5)
      .attr('d', lines)

    // create dynamic firefighters path
    chart
      .append('g')
      .classed('dynamic-firefighters', true)
      .append('path')
      .datum(data[1])
      .transition(this.transition)
      .attr('fill', 'none')
      .attr('stroke', 'red')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.5)
      .attr('d', lines)

    chart
      .select('.dynamic-fires')
      .selectAll('circle')
      .data(data[0])
      .enter()
      .append('circle')
      .on('mouseover', function () {
        d3.select(this).interrupt().transition(this.transition).attr('r', 6)
      })
      .on('mouseleave', function () {
        d3.select(this).interrupt().transition(this.transition).attr('r', 3)
      })
      .transition(this.transition)
      .attr('fill', 'orange')
      .attr('stroke', 'orange')
      .attr('stroke-width', 1.5)
      .attr('cx', (d, i) => x(years[i]))
      .attr('cy', d => y(d))
      .attr('r', 3)

      .selection()
      .append('title')
      .text((d, i) => (d + ' fires in ' + years[i]))

    chart
      .select('.dynamic-firefighters')
      .selectAll('circle')
      .data(data[1])
      .enter()
      .append('circle')
      .on('mouseover', function () {
        d3.select(this).interrupt().transition(this.transition).attr('r', 6)
      })
      .on('mouseleave', function () {
        d3.select(this).interrupt().transition(this.transition).attr('r', 3)
      })
      .transition(this.transition)
      .attr('fill', 'red')
      .attr('stroke', 'red')
      .attr('stroke-width', 1.5)
      .attr('cx', (d, i) => x(years[i]))
      .attr('cy', d => y(d))
      .attr('r', 3)
      .selection()
      .append('title')
      .text((d, i) => (d + ' firefighters in ' + years[i]))

    // create legend
    this.chart
      .append(
        () =>
          new Legend({
            color: d3.scaleThreshold(
              ['Firefighters', 'Fires'],
              ['red', 'orange']
            ),
            title: 'Absolute number of',
            width: 108
          })
      )
      .classed('svg-legend multi-lines', true)
      .selectAll('.tick text')
      .attr('x', -26)
  }

  update (data, years) {
    var lines = d3.line()
      .curve(d3.curveCardinal)
      .x((d, i) => x(years[i]))
      .y(d => y(d))

    var x = d3.scalePoint()
      .range([this.yAxisWidth, this.chartWidth])
      .domain(years)
      .padding(0.5)

    var maxValue = d3.max([d3.max(data[0]), d3.max(data[1])])

    var y = d3.scaleLinear()
      .rangeRound([this.padding, this.chartHeight - this.xAxisHeight])
      .domain([
        maxValue + maxValue / 3,
        0
      ])

    // y-axis update
    var yAxis = d3.axisLeft().scale(y).tickSizeOuter(0).tickFormat(d3.format('d'))

    this.chart
      .select('.y-axis')
      .interrupt() // Avoids "too late; already running" error
      .transition(this.transition)
      .call(yAxis)

    // fire's path update
    this.chart
      .select('.static-fires')
      .selectAll('path')
      .interrupt()
      .datum(data[0])
      .join(enter => enter, update => update
        .transition(this.transition)
        .attr('d', lines))

    this.chart
      .select('.dynamic-fires')
      .selectAll('path')
      .interrupt()
      .datum(data[0])
      .join(enter => enter, update => update
        .transition(this.transition)
        .attr('d', lines))

    // firefighter's path update
    this.chart
      .select('.static-firefighters')
      .selectAll('path')
      .interrupt()
      .datum(data[1])
      .join(enter => enter, update => update
        .transition(this.transition)
        .attr('d', lines))

    this.chart
      .select('.dynamic-firefighters')
      .selectAll('path')
      .interrupt()
      .datum(data[1])
      .join(enter => enter, update => update
        .transition(this.transition)
        .attr('d', lines))

    // fires circle's update
    this.chart
      .select('.dynamic-fires')
      .selectAll('circle')
      .interrupt()
      .data(data[0])
      .join(enter => enter, update => update
        .transition(this.transition)
        .attr('cx', (d, i) => x(years[i]))
        .attr('cy', d => y(d))
        .select('title')
        .text((d, i) => (d + ' fires in ' + years[i]))
      )

    // firefighters circle's update
    this.chart
      .select('.dynamic-firefighters')
      .selectAll('circle')
      .interrupt()
      .data(data[1])
      .join(enter => enter, update => update
        .transition(this.transition)
        .attr('cx', (d, i) => x(years[i]))
        .attr('cy', d => y(d))
        .select('title')
        .text((d, i) => (d + ' firefighters in ' + years[i]))
      )
  }

  updateYears (data, years) {
    var x = d3.scalePoint()
      .range([this.yAxisWidth, this.chartWidth])
      .domain(years)
      .padding(0.5)

    var maxValue = d3.max([d3.max(data[0]), d3.max(data[1])])

    var y = d3.scaleLinear()
      .rangeRound([this.padding, this.chartHeight - this.xAxisHeight])
      .domain([
        maxValue + maxValue / 3,
        0
      ])

    var lines = d3.line()
      .curve(d3.curveCardinal)
      .x((d, i) => x(years[i]))
      .y(d => y(d))

    this.chart
      .select('.dynamic-fires')
      .selectAll('path')
      .interrupt()
      .datum(data[0])
      .join(enter => enter, update => update
        .transition(this.transition)
        .attr('d', lines))
  }
}
export default MultiLinesChart
