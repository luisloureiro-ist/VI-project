import Legend from '../../../assets/js/d3.legend.js'

class RadarChart {
  constructor (parentSelector, chartWidth, chartHeight) {
    this.parentSelector = parentSelector
    this.legendHeight = 50
    this.chartSize = {
      width: chartWidth,
      height: chartHeight - this.legendHeight
    }
    this.sectionElement = d3.select(this.parentSelector)
    this.chartRadius = Math.min(chartHeight, chartWidth)
    this.transition = d3
      .transition()
      .duration(1000)
      .ease(d3.easeQuadInOut)
    this.colors = d3.schemeOranges
  }

  create (data, categories, titleTextFunction) {
    const paddingForText = 30
    // To guarantee that the chart has a perfect circular shape
    const shortestMeasure = Math.min(
      this.chartSize.width,
      this.chartSize.height
    )
    const chartCenterCoordinates = {
      width: Math.round(shortestMeasure / 2) - paddingForText,
      height: Math.round(shortestMeasure / 2) - paddingForText
    }
    this.radarCenterCoordinates = chartCenterCoordinates
    this.titleTextFunction = titleTextFunction
    const chart = this.sectionElement
      .append('svg')
      .classed('svg-chart radar', true)
      .attr('width', this.chartSize.width)
      .attr('height', this.chartSize.height)

    const polygonData = data.reduce((prev, curr) => prev.concat(curr.value), [])
    const maxValue = Math.round(Math.max(...polygonData) * (1 + 0.2)) // 0.2 for padding
    chart
      // Create axes
      .call(this.__createAxes.bind(this, data))
      // Add text to axes
      .call(this.__addTextToAxes.bind(this, data))
      // Create polygon / area
      .call(this.__createPolygon.bind(this, [polygonData], maxValue))
      // Add circles to intersection points between polygon and axes
      .call(this.__addIntersectionPoints.bind(this, data, maxValue))

    this.__createLegend(categories)
  }

  updateData (newData, circlesTitleFn) {
    const paddingForText = 30
    // To guarantee that the chart has a perfect circular shape
    const shortestMeasure = Math.min(
      this.chartSize.width,
      this.chartSize.height
    )
    const chartCenterCoordinates = {
      width: Math.round(shortestMeasure / 2) - paddingForText,
      height: Math.round(shortestMeasure / 2) - paddingForText
    }
    // Update polygon / area
    const newPolygonData = newData.reduce(
      (prev, curr) => prev.concat(curr.value),
      []
    )
    const newMaxValue = Math.round(Math.max(...newPolygonData) * (1 + 0.2)) // 0.2 for padding

    d3.select(this.parentSelector)
      .selectAll('.svg-chart.radar .area polygon')
      .data([newPolygonData])
      .join(
        enter => enter,
        update =>
          update
            .transition(this.transition)
            .attr('points', d =>
              convertToPointsString(chartCenterCoordinates, d, newMaxValue)
            )
      )

    // Updateintersection circles
    d3.select(this.parentSelector)
      .selectAll('.svg-chart.radar .area .values circle')
      .data(newData)
      .join(
        enter => enter,
        update =>
          update
            .transition(this.transition)
            .attr('cx', (d, i) =>
              calcXCoordinate(
                d.value,
                newMaxValue,
                i,
                newData.length,
                chartCenterCoordinates.width
              )
            )
            .attr('cy', (d, i) =>
              calcYCoordinate(
                d.value,
                newMaxValue,
                i,
                newData.length,
                chartCenterCoordinates.height
              )
            )
            .select('title')
            .text(d => circlesTitleFn(d.axis, d.value))
      )
  }

  __createAxes (data, chart) {
    chart
      .append('g')
      .classed('axes', true)
      .selectAll('line')
      .data(data)
      .enter()
      .append('line')
      .attr('x1', this.radarCenterCoordinates.width)
      .attr('x2', (d, i) =>
        calcMostDistantFromCenterXCoordinateOfItem(
          this.radarCenterCoordinates.width,
          data.length,
          i
        )
      )
      .attr('y1', this.radarCenterCoordinates.height)
      .attr('y2', (d, i) =>
        calcMostDistantFromCenterYCoordinateOfItem(
          this.radarCenterCoordinates.height,
          data.length,
          i
        )
      )
  }

  __addTextToAxes (data, chart) {
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
          `translate(${calcMostDistantFromCenterXCoordinateOfItem(
            this.radarCenterCoordinates.width,
            data.length,
            i
          )}, ${calcMostDistantFromCenterYCoordinateOfItem(
            this.radarCenterCoordinates.height,
            data.length,
            i
          )})`
      )
      .attr('dominant-baseline', (d, i) =>
        isInUpperQuadrants(data.length, i) ? 'auto' : 'hanging'
      )
  }

  __createPolygon (data, maxValue, chart) {
    chart
      .append('g')
      .classed('area', true)
      .selectAll('polygon')
      .data(data)
      .enter()
      .append('polygon')
      .attr('points', d =>
        convertToPointsString(this.radarCenterCoordinates, d, maxValue)
      )
  }

  __addIntersectionPoints (data, maxValue, chart) {
    chart
      .select('.area')
      .append('g')
      .classed('values', true)
      .selectAll('circles')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d, i) =>
        calcXCoordinate(
          d.value,
          maxValue,
          i,
          data.length,
          this.radarCenterCoordinates.width
        )
      )
      .attr('cy', (d, i) =>
        calcYCoordinate(
          d.value,
          maxValue,
          i,
          data.length,
          this.radarCenterCoordinates.height
        )
      )
      .attr('r', 3)
      .append('title')
      .text(d => this.titleTextFunction(d.axis, d.value))
  }

  __createLegend (categories) {
    this.sectionElement
      .append(
        () =>
          new Legend({
            color: d3.scaleThreshold(
              [categories[0], 'and', categories[categories.length - 1]],
              [
                this.colors[4][3],
                this.colors[4][3],
                this.colors[4][3],
                this.colors[4][3]
              ]
            ),
            title: 'Average number per year between:',
            width: 108
          })
      )
      .classed('svg-legend radar', true)
  }
}

function isInUpperQuadrants (numberOfItems, itemIdx) {
  const degrees = Math.round(360 / numberOfItems) * itemIdx
  return degrees > 270 || degrees < 90
}

function convertToRadians (numberOfItems, idx) {
  return ((180 / numberOfItems) * idx * 2 * Math.PI) / 180
}

function calcMostDistantFromCenterXCoordinateOfItem (
  maxWidth,
  numItems,
  itemIdx
) {
  return Math.round(
    (1 + Math.sin(convertToRadians(numItems, itemIdx))) * maxWidth
  )
}

function calcMostDistantFromCenterYCoordinateOfItem (
  maxHeight,
  numItems,
  itemIdx
) {
  return Math.round(
    (1 - Math.cos(convertToRadians(numItems, itemIdx))) * maxHeight
  )
}

function calcXCoordinate (value, maxValue, idx, numberOfValues, width) {
  const ratio = value / maxValue
  const axisCoordinates = {
    start: {
      x: width
    },
    end: {
      x: calcMostDistantFromCenterXCoordinateOfItem(width, numberOfValues, idx)
    }
  }
  return (
    Math.round((axisCoordinates.end.x - axisCoordinates.start.x) * ratio) +
    axisCoordinates.start.x
  )
}

function calcYCoordinate (value, maxValue, idx, numberOfValues, height) {
  const ratio = value / maxValue
  const axisCoordinates = {
    start: {
      y: height
    },
    end: {
      y: calcMostDistantFromCenterYCoordinateOfItem(height, numberOfValues, idx)
    }
  }
  return (
    Math.round((axisCoordinates.end.y - axisCoordinates.start.y) * ratio) +
    axisCoordinates.start.y
  )
}

function convertToPointsString (
  chartCenterCoordinates,
  arrayWithValues,
  maxValue
) {
  return arrayWithValues
    .map((value, idx) => {
      return `${calcXCoordinate(
        value,
        maxValue,
        idx,
        arrayWithValues.length,
        chartCenterCoordinates.width
      )}, ${calcYCoordinate(
        value,
        maxValue,
        idx,
        arrayWithValues.length,
        chartCenterCoordinates.height
      )}`
    })
    .join(' ')
}

export default RadarChart
