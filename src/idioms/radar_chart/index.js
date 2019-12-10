class RadarChart {
  constructor (parentSelector, chartWidth, chartHeight) {
    this.parentSelector = parentSelector
    this.chartSize = {
      width: chartWidth,
      height: chartHeight
    }
    this.sectionElement = d3.select(this.parentSelector)
    this.chartRadius = Math.min(chartHeight, chartWidth)
    this.transition = d3
      .transition()
      .duration(1000)
      .ease(d3.easeQuadInOut)
  }

  create (data, categories) {
    const chart = this.sectionElement
      .append('svg')
      .classed('svg-chart', true)
      .attr('width', this.chartSize.width)
      .attr('height', this.chartSize.height)

    // Create axes
    chart
      .append('g')
      .classed('axes', true)
      .selectAll('line')
      .data(data, d => d.axis)
      .enter()
      .append('line')
      .attr('x1', Math.ceil(this.chartSize.width / 2))
      .attr(
        'x2',
        (d, i) =>
          (1 + Math.sin(convertToRadians(data.length, i))) *
          Math.ceil(this.chartSize.width / 2)
      )
      .attr('y1', Math.ceil(this.chartSize.height / 2))
      .attr(
        'y2',
        (d, i) =>
          (1 - Math.cos(convertToRadians(data.length, i))) *
          Math.ceil(this.chartSize.height / 2)
      )
      .style('stroke', 'grey')
      .style('stroke-opacity', '0.75')
      .style('stroke-width', '0.3px')
  }
}

function convertToRadians (numberOfItems, idx) {
  return ((180 / numberOfItems) * idx * 2 * Math.PI) / 180
}

export default RadarChart
