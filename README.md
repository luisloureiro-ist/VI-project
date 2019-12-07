# VI-project
Data visualization dashboard - Fires between 2009 and 2017 and their relationship with companies, elections, firefighters

### Run local server
`npm start` to start a local python HTTP server listening on port 8000

## Architecture
The root of the project has one main files:

* `index.html` - the file with overall structure of the application

The source code is organized in two main folders:

* `assets` - contains all the images, dataset files, and files of external sources ([Bulma](https://bulma.io) css and [D3](https://d3js.org) js)
* `src` - contains all the javascript and cascading stylesheet files we created to build this application.

### Source code
We decided to split the application in different visual components. Looking at the sketch, we can easily see three main components:

* on the left side, we can see a component containing a lot of input elements used to filter the data causing an effect on the visual idioms
* on the right side, a component with a Portugal map. Like in the previous one, this element is used to filter data affecting the visual idioms
* in the middle, we have the component that contains most of our visual idioms

As a part of each component, we have visual idioms. Inside of our source code folder - `src` - we two main folders:

* `components` - each file in this folder represents a component in our application.
* `idioms` - inside this folder are the visual data visualization idioms.

## Development
To add a new component to our application, one must take the following steps:

1. Check if `index.html` already has the HTML element with the correct CSS class that will contain the component one is about to create. Add it in case `index.html` doesn't have.
1. Check if `src/idioms` folder already has a folder with the name of the idiom one wants to use in the component. In case it doesn't exist, create a new folder with the name of the idiom and two files inside that folder:

    * `index.css` to add all the necessary CSS styling rules applying to this idiom. Import this file inside the `src/idioms/index.css` file.
    * `index.js` to create the class for this idiom where one must put the necessary Javascript code to build the idiom. This class must have the following structure:

          class IdiomName {
            constructor (parentSelector, chartWidth, ...) {
              this.parentSelector = parentSelector
              this.chartWidth = chartWidth
              ...
            }

            create (data, ...) {
              // should contain all the lines of code necessary to CREATE this idiom
              // taking in consideration the data that is received has a parameter
              ...
            }

            update (newData, ...) {
              // should contain all the lines of code necessary to UPDATE this idiom
              // taking in consideration the NEW data that is received has a parameter
            }
          }
1. Add a new JS file to the `src/components/` folder with a name that matches its context and with a structure like the following:

       import Component from './component.js'
       import IdiomName from '../idioms/name_of_the_idiom/index.js

       class ComponentName extends Component {
         constructor (dispatch, parentSelector, componentSize) {
           super(dispatch, parentSelector, componentSize)
           ...

           dispatch.on('initialize.componentname', this.initialize.bind(this))
           dispatch.on('update_municipality.componentname', this.update.bind(this))
           // TODO: listen to more events if necessary
         }

         initialize ({ nameOfThePropertyWithTheInterestingData: data }, municipality) {
           super.setMunicipality(municipality)
           super.setDataset(data)
           // TODO: initialize instance variables if necessary

           this.updateSectionTitle()

           // Pass the necessary arguments to the contructor
           this.chart = new IdiomName(...)

           // TODO: parse/transform/reduce the data if necessary
           transformedData = data.filter(...).map(...).reduce(...) ...

           // Pass the necessary arguments to the "create" function
           this.chart.create(transformedData, ...)
         }

         update ({ nameOfThePropertyWithTheInterestingData: newData }, newMunicipality) {
           super.setDataset(newData)
           super.setMunicipality(newMunicipality)
           // TODO: update instance variables if necessary

           this.updateSectionTitle()

           // TODO: parse/transform/reduce the new data if necessary
           transformedData = newData.filter(...).map(...).reduce(...) ...

           // Pass the necessary arguments to the "update" function
           this.chart.update(transformedData, ...)
         }

         updateSectionTitle () {
           d3.select(super.getContainerSelector())
             .select('.component-title')
             .text(`Some text ${super.getMunicipality()}`)
         }
       }
1. In the `src/index.js` import this new component, instanciate it and add it to the `components` array:

       import ComponentName from './components/component_name.js'

       ...

       components.push(new ComponentName(
         dispatch,
         '.component-name-section',
         sectionWidth
       ))

       ...


