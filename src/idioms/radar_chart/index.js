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
    const paddingForText = 30
    const chartCenterCoordinates = {
      width: Math.round(this.chartSize.width / 2) - paddingForText,
      height: Math.round(this.chartSize.height / 2) - paddingForText
    }
    const chart = this.sectionElement
      .append('svg')
      .classed('svg-chart radar', true)
      .attr('width', this.chartSize.width)
      .attr('height', this.chartSize.height)

    // Create axes
    chart
      .append('g')
      .classed('axes', true)
      .selectAll('line')
      .data(data)
      .enter()
      .append('line')
      .attr('x1', chartCenterCoordinates.width)
      .attr('x2', (d, i) =>
        calcXCoordinate(chartCenterCoordinates.width, data.length, i)
      )
      .attr('y1', chartCenterCoordinates.height)
      .attr('y2', (d, i) =>
        calcYCoordinate(chartCenterCoordinates.height, data.length, i)
      )

    // Add text to axes
    chart
      .select('.axes')
      .append('g')
      .classed('labels', true)
      .selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .text(d => d.axis)
      .attr(
        'dx',
        // Center align text in relation to axis
        (d, i, nodesList) => -nodesList[i].getBoundingClientRect().width / 2
      )
      .attr(
        'transform',
        (d, i) =>
          `translate(${calcXCoordinate(
            chartCenterCoordinates.width,
            data.length,
            i
          )}, ${calcYCoordinate(
            chartCenterCoordinates.height,
            data.length,
            i
          )})`
      )
      .attr('dominant-baseline', (d, i) =>
        isInUpperQuadrants(data.length, i) ? 'auto' : 'hanging'
      )

    // Create polygon / area
    const polygonData = data.reduce((prev, curr) => prev.concat(curr.value), [])
    chart
      .append('g')
      .classed('area', true)
      .selectAll('polygon')
      .data([polygonData])
      .enter()
      .append('polygon')
      .attr('points', d => convertToPointsString(chartCenterCoordinates, d))
  }
}

function isInUpperQuadrants (numberOfItems, itemIdx) {
  const degrees = Math.round(360 / numberOfItems) * itemIdx
  return degrees > 270 || degrees < 90
}

function convertToRadians (numberOfItems, idx) {
  return ((180 / numberOfItems) * idx * 2 * Math.PI) / 180
}

function calcXCoordinate (maxWidth, numItems, itemIdx) {
  return Math.round(
    (1 + Math.sin(convertToRadians(numItems, itemIdx))) * maxWidth
  )
}

function calcYCoordinate (maxHeight, numItems, itemIdx) {
  return Math.round(
    (1 - Math.cos(convertToRadians(numItems, itemIdx))) * maxHeight
  )
}

function convertToPointsString (chartCenterCoordinates, arrayWithValues) {
  const maxValue = Math.max(...arrayWithValues) * (1 + 0.1) // 0.1 for padding

  return arrayWithValues
    .map((value, idx) => {
      const ratio = value / maxValue
      const axisCoordinates = {
        start: {
          x: chartCenterCoordinates.width,
          y: chartCenterCoordinates.height
        },
        end: {
          x: calcXCoordinate(
            chartCenterCoordinates.width,
            arrayWithValues.length,
            idx
          ),
          y: calcYCoordinate(
            chartCenterCoordinates.height,
            arrayWithValues.length,
            idx
          )
        }
      }

      return `${Math.round(
        (axisCoordinates.start.x - axisCoordinates.end.x) * ratio
      ) + axisCoordinates.start.x}, ${Math.round(
        (axisCoordinates.end.y - axisCoordinates.start.y) * ratio
      ) + axisCoordinates.start.y}`
    })
    .join(' ')
}

export default RadarChart
