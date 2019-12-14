import Legend from '../../../assets/js/d3.legend.js'

class ChoroplethMap {
  constructor (parentSelector) {
    this.parentSelector = parentSelector
    this.chart = d3.select(this.parentSelector)
    this.transition = d3.transition().duration(200)
  }

  create (data, clickCallback) {
    this.onClickCallback = clickCallback

    // Update color scale
    this.colorScale = d3.scaleQuantize(
      [d3.min(data, d => d.value), d3.max(data, d => d.value)],
      d3.schemeOranges[9]
    )

    // Draw the map
    this.chart
      .selectAll('svg #NUTS_III path')
      .attr('fill', (d, i, nodesList) => {
        const regionClicked = nodesList[i]
        const datum = data.find(
          datum =>
            datum.location === regionClicked.dataset.name &&
            datum.nuts === getNUTS(regionClicked)
        )

        return this.colorScale(datum.value)
      })
      .on('click', this.__onPathClick.bind(this))
      .on('mouseover', this.__onMouseOver.bind(this))
      .on('mouseleave', this.__onMouseLeave.bind(this))
      .select('title')
      .text((d, i, nodesList) => {
        const regionClicked = nodesList[i].parentElement
        const datum = data.find(
          datum =>
            datum.location === regionClicked.dataset.name &&
            datum.nuts === getNUTS(regionClicked)
        )

        return `Location: ${datum.location}\n\nAverage number of fires: ${datum.value}`
      })

    this.__addLegend('# Fires')
  }

  //
  // Private (auxiliar) functions
  //
  __addLegend (title) {
    this.chart
      .append(
        () =>
          new Legend({
            color: this.colorScale,
            title,
            tickFormat: 'd'
          })
      )
      .classed('svg-legend', true)
  }

  __onPathClick (d, i, nodesList) {
    const regionClicked = nodesList[i]
    const regionName = regionClicked.dataset.name
    const regionNUTS = getNUTS(regionClicked)

    this.onClickCallback(regionNUTS, regionName)
  }

  __onMouseOver (d, i, nodesList) {
    this.__resetPathsStyle()

    d3.select(nodesList[i])
      .interrupt() // Avoids "too late; already running" error
      .raise()
      .transition(this.transition)
      .style('stroke', 'grey')
      .style('stroke-width', '2px')
  }

  __onMouseLeave () {
    this.__resetPathsStyle()
  }

  __resetPathsStyle () {
    this.chart
      .selectAll('#NUTS_III path')
      .interrupt() // Avoids "too late; already running" error
      .transition(this.transition)
      .style('stroke', 'inherit')
      .style('stroke-width', 'inherit')
  }
}

function getNUTS (nodeElement) {
  let parent = nodeElement
  let parentID = ''
  while (true) {
    parent = parent.parentElement
    parentID = parent.id

    if (parentID) break
  }

  return parent.dataset.name
}

export default ChoroplethMap
