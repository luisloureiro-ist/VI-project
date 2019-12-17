# VI-project

Data visualization dashboard - Fires between 2009 and 2017 and their relationship with companies, elections, firefighters
Project made by:

- Duarte Meneses - IST169740
- Luís Loureiro - IST194070

This project can be access in the following url: https://impact-of-fires-in-portugal.azurewebsites.net/

### Recommended screen resolution

We guarantee that this visualization works fine on screens with resolution equal of greater than 1600 x 900 (16:9)

### Run local server

- `npm start` to start a local python HTTP server listening on port 8000

      NOTE: one needs to have NodeJS and Python3 with the "http.server" module installed in order to execute this command without any errors.

- one can also simply move all the contents of this package to another location to execute in a different application server.

## External dependencies

This project takes advantage of some external dependencies that were downloaded and imported into the folder `assets`:

| Name            | Version | Purpose                                                                                                           | URL                                       |
| --------------- | ------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| D3              | 5.14.2  | Data-driven generations and transformations to the HTML document                                                  | https://d3js.org                          |
| Bulma           | 0.8.0   | CSS framework used to help beautifying the visualization                                                          | https://bulma.io                          |
| noUiSlider      | 14.1.1  | Slider component used to create our years range slider                                                            | https://refreshless.com/nouislider/       |
| d3-color-legend | N/A     | Code snipped obtained and adapted from Mike Bostock and used in this project ot create the legends for our idioms | https://observablehq.com/@d3/color-legend |

## Architecture

In the root of the project an HTML file can be found containing the overall structure of the application: `index.html` and including all the necessary Javascript and CSS files.

The source code is organized in two main folders:

- `assets` - contains all the images, dataset files, and files of external dependencies referred above.
- `src` - contains all the javascript and cascading stylesheet files we created to build this application.

### Source code

We decided to split the application in different visual components:

- on the right side, a component with a Mainland Portugal map. This element is used to filter data affecting the visual idioms in the center;
- in the center, we have the component that contains all the other visual idioms

As a part of each component, we have visual idioms. Inside of our source code folder - `src` - we have two main folders:

- `components` - each file in this folder represents a component in our application. The components are responsible for listening to events, receiving and processing the data obtained from these events and passing them to the idiom.
- `idioms` - inside this folder are the visual data visualization idioms. The idioms are only responsible for displaying the data that is passed to them by the respective component and configuring the interaction for their contents.

Our main Javascript file is `src/index.js`. This files is the one responsible for loading all the CSV files that represent our datasets and initializing all the page components with these loaded data.

| Events                | When                                                                                 | Parameters                                                                                                                               | Dispatcher    | Listeners      |
| --------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------- | -------------- |
| `initialize`          | Is dispatched when application loads.                                                | Sends all the data obtained after loading the CSV files in an object containing three different properties, one for each loaded dataset. | `index.js`    | All components |
| `region_selected`     | Is dispatched when a new municipality or region is selected on the map.              | Name and matching NUTS of the selected municipality/region                                                                               | Map component | `index.js`     |
| `update_municipality` | Is dispatched after handling the information obtained in the event `region_selected` | Name of the selected municipality/region                                                                                                 | `index.js`    | All components |
| `update_years`        | Is dispatched when the years range slider is updated.                                | Sends the minimun and the maximum years of the range                                                                                     | `index.js`    | All components |

## Development

To add a new component to our application, one must take the following steps:

1.  Check if `index.html` already has the HTML element with the correct CSS class that will contain the component one is about to create. Add it in case `index.html` doesn't have.
1.  Check if `src/idioms` folder already has a folder with the name of the idiom one wants to use in the component. In case it doesn't exist, create a new folder with the name of the idiom and two files inside that folder:

    - `index.css` to add all the necessary CSS styling rules applying to this idiom. Import this file inside the `src/idioms/index.css` file.
    - `index.js` to create the class for this idiom where one must put the necessary Javascript code to build the idiom. This class must have the following structure:

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

1.  Add a new JS file to the `src/components/` folder with a name that matches its context and with a structure like the following:

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

1.  In the `src/index.js` import this new component, instanciate it and add it to the `components` array:

    import ComponentName from './components/component_name.js'

    ...

    components.push(new ComponentName(
    dispatch,
    '.component-name-section',
    sectionWidth
    ))

    ...
