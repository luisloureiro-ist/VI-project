class MultiLinesChart {
  constructor (parentSelector, chartWidth, chartHeight) {
    this.parentSelector = parentSelector
    this.chartWidth = chartWidth
    this.chartHeight = chartHeight
    this.chart = d3.select(this.parentSelector)
    this.yScaler = null
    this.xAxisHeight = 35
    this.yAxisWidth = 35
    // this.xlabel('years')
    // this.ylabel('number')
  };

  create (data, years) {
    // var keys = data.columns.slice(1)

    // var parseTime = d3.timeParse('%Y%m%d')
    // var formatDate = d3.timeFormat('%Y-%m-%d')
    // var bisectDate = d3.bisector(d => d.date).left
    // var formatValue = d3.format(',.0f')

    // data.forEach(function (d) {
    //   d.date = parseTime(d.date)
    //   return d
    // })
    this.chart = this.chart
      .append('svg')
      .classed('svg-chart', true)

    var margin = { top: 15, right: 35, bottom: 15, left: 35 }
    var width = +this.chart.attr('width') - margin.left - margin.right
    var height = +this.chart.attr('height') - margin.top - margin.bottom

    var x = d3.scaleLinear()
      .range([0, this.chartWidth])
      .domain([years[0], years[years.length - 1]])

    var y = d3.scaleLinear()
      .rangeRound([0, this.chartHeight])
      .domain([
        d3.min([d3.min(data[0]), d3.min(data[1])]),
        d3.max([d3.max(data[0]), d3.max(data[1])])
      ])

    // var z = d3.scaleOrdinal(d3.schemeCategory10)

    var lines = d3.line()
      .curve(d3.curveCardinal)
      .x((d, i) => x(years[i]))
      .y(d => y(d))

    var xAxis = d3.axisBottom().scale(x).tickValues(years).tickFormat(d3.format('d'))
    var yAxis = d3.axisLeft().scale(y)

    this.chart
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.chartHeight - this.xAxisHeight} )`)
      .call(xAxis)

    this.chart
      .append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${this.yAxisWidth}, 0)`)
      .call(yAxis)

    var focus = this.chart.append('g')
      .attr('class', 'focus')
      .style('display', 'none')

    focus.append('line').attr('class', 'lineHover')
      .style('stroke', '#999')
      .attr('stroke-width', 1)
      .style('shape-rendering', 'crispEdges')
      .style('opacity', 0.5)
      .attr('y1', -height)
      .attr('y2', 0)

    focus.append('text').attr('class', 'lineHoverDate')
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)

    var overlay = this.chart.append('rect')
      .attr('class', 'overlay')
      .attr('x', margin.left)
      .attr('width', width - margin.right - margin.left)
      .attr('height', height)

    this.chart
      .append('path')
      .data(data[0])
      .attr('fill', 'none')
      .attr('stroke', 'orange')
      .attr('stroke-width', 1.5)
      .attr('d', lines)

    this.chart
      .append('path2')
      .data(data[1])
      .attr('fill', 'none')
      .attr('stroke', 'red')
      .attr('stroke-width', 1.5)
      .attr('d', lines)

    // update(d3.select('#selectbox').property('value'), 0)

    // function update (input, speed) {
    //   var copy = keys.filter(f => f.includes(input))

    //   var cities = copy.map(function (id) {
    //     return {
    //       id: id,
    //       values: data.map(d => { return { date: d.date, degrees: +d[id] } })
    //     }
    //   })

    //   y.domain([
    //     d3.min(cities, d => d3.min(d.values, c => c.degrees)),
    //     d3.max(cities, d => d3.max(d.values, c => c.degrees))
    //   ]).nice()

    //   svg.selectAll('.y-axis').transition()
    //     .duration(speed)
    //     .call(d3.axisLeft(y).tickSize(-width + margin.right + margin.left))

    //   var city = svg.selectAll('.cities')
    //     .data(cities)

    //   city.exit().remove()

    //   city.enter().insert('g', '.focus').append('path')
    //     .attr('class', 'line cities')
    //     .style('stroke', d => z(d.id))
    //     .merge(city)
    //     .transition().duration(speed)
    //     .attr('d', d => line(d.values))

    // tooltip(copy)
  }

  // function tooltip (copy) {
  //   var labels = focus.selectAll('.lineHoverText')
  //     .data(copy)

  //   labels.enter().append('text')
  //     .attr('class', 'lineHoverText')
  //     .style('fill', d => z(d))
  //     .attr('text-anchor', 'start')
  //     .attr('font-size', 12)
  //     .attr('dy', (_, i) => 1 + i * 2 + 'em')
  //     .merge(labels)

  //   var circles = focus.selectAll('.hoverCircle')
  //     .data(copy)

  //   circles.enter().append('circle')
  //     .attr('class', 'hoverCircle')
  //     .style('fill', d => z(d))
  //     .attr('r', 2.5)
  //     .merge(circles)

  //   svg.selectAll('.overlay')
  //     .on('mouseover', function () { focus.style('display', null) })
  //     .on('mouseout', function () { focus.style('display', 'none') })
  // .on('mousemove', mousemove)

  // function mousemove () {
  //   var x0 = x.invert(d3.mouse(this)[0])
  //   var i = bisectDate(data, x0, 1)
  //   var d0 = data[i - 1]
  //   var d1 = data[i]
  //   var d = x0 - d0.date > d1.date - x0 ? d1 : d0

  //   focus.select('.lineHover')
  //     .attr('transform', 'translate(' + x(d.date) + ',' + height + ')')

  //   focus.select('.lineHoverDate')
  //     .attr('transform',
  //       'translate(' + x(d.date) + ',' + (height + margin.bottom) + ')')
  //     .text(formatDate(d.date))

  //   focus.selectAll('.hoverCircle')
  //     .attr('cy', e => y(d[e]))
  //     .attr('cx', x(d.date))

  //   focus.selectAll('.lineHoverText')
  //     .attr('transform',
  //       'translate(' + (x(d.date)) + ',' + height / 2.5 + ')')
  //     .text(e => e + ' ' + 'º' + formatValue(d[e]))

  //   x(d.date) > (width - width / 4)
  //     ? focus.selectAll('text.lineHoverText')
  //       .attr('text-anchor', 'end')
  //       .attr('dx', -10)
  //     : focus.selectAll('text.lineHoverText')
  //       .attr('text-anchor', 'start')
  //       .attr('dx', 10)
  // }
}

//   var selectbox = d3.select('#selectbox')
//     .on('change', function () {
//       update(this.value, 750)
//     })
// }
// }

export default MultiLinesChart
