class ChoroplethMap {
  constructor (parentSelector) {
    this.parentSelector = parentSelector
    this.chart = d3.select(this.parentSelector).select('svg')
    this.transition = d3.transition().duration(200)
  }

  create (clickCallback) {
    this.onClickCallback = clickCallback

    // Draw the map
    this.chart
      .selectAll('#NUTS_II path')
      .attr('fill', 'orange')
      .style('opacity', 0.8)
      .on('click', this.__onPathClick.bind(this))
      .on('mouseover', this.__onMouseOver.bind(this))
      .on('mouseleave', this.__onMouseLeave.bind(this))
  }

  //
  // Private (auxiliar) functions
  //
  __onPathClick (d, i, nodesList) {
    const regionClicked = nodesList[i]
    const regionName = regionClicked.dataset.name
    const regionNUTS = getNUTS(regionClicked)

    this.onClickCallback(regionNUTS, regionName)
  }

  __onMouseOver (d, i, nodesList) {
    this.chart
      .selectAll('#NUTS_II path')
      .interrupt() // Avoids "too late; already running" error
      .transition(this.transition)
      .style('opacity', 0.5)
    d3.select(nodesList[i])
      .interrupt() // Avoids "too late; already running" error
      .transition(this.transition)
      .style('opacity', 0.8)
      .style('stroke', 'black')
  }

  __onMouseLeave (d, i, nodesList) {
    this.chart
      .selectAll('#NUTS_II path')
      .interrupt() // Avoids "too late; already running" error
      .transition(this.transition)
      .style('opacity', 0.8)
    d3.select(nodesList[i])
      .interrupt() // Avoids "too late; already running" error
      .transition(this.transition)
      .style('stroke', 'inherit')
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
