class Slider {
  constructor (sliderId) {
    this.slider = document.getElementById(sliderId)

    // 'noUiSlider' globally imported
    noUiSlider.create(this.slider, {
      start: [2009, 2017],
      // connect: true,
      step: 1,
      range: {
        min: 2009,
        max: 2017
      },
      pips: {
        mode: 'count',
        density: 9,
        values: 9,
        stepped: true
      }
    })
    // slider.noUiSlider.on('update', function (values) {
    //   // sliderValueElement.innerHTML = values.map(v => +v).join(' - ');
    //   console.log(values.join(' - '))
    // })
  }

  registerUpdateEventHandler (handler) {
    // Format numbers to int. Default is to return values as float
    this.slider.noUiSlider.on('update', values => handler(values.map(v => +v)))
  }
}

export default Slider
