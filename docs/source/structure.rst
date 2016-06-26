Code structure
==============

This section describes the structure of the project JavaScript code, split by each of the JavaScript files (see the :doc:`files` section).



init.js
-------

This file contains global variable definitions for: 

* The size and margins of the dashboard objects (height, width, margin) and popup object sizes (popWidth, popHeight, popGap, popTextSize)
* The map projection (Todo: move to mapping.js?)
* Global variables to hold the API response (APIresponse), region metadata for the selectors (regioMeta), control API paging (APIpage) and holding the range of available dates returned from the API (minDate and maxDate)
* Map metaData (map data file locations) - TODO - move to regional metadata

The file also contains a jQuery $(document).ready() function, which calls the functions:

* getRegions(), which begins the process of downloading regional metadata (see io.js)
* initGraphs(), which creates the initial SVG elements in the DOM to display the graphs (see dash.js)



io.js
-----

The file deals with reading data from various sources, including the mVAM API.  Functions include:

* APIpull(opt) - Implements an mVAM API call for the dashboard.
	opt - required object of API arguments, where opt["adm0"] - required string with Admin level 0 (country) name, and opt["adm1"] - option string with region name.  The function firstly forms a query string based on the options passed and uses the global APIpage variable to request a specific page from the API via an AJAX request.  When the request is completed successfully, the server message it is parsed, appended to the variable APIresponse and checked for the number of rows returned.  If 999 or more rows are returned, APIpage is incremented and the APIpull() function called again.  Otherwise, the APIresponse array is parsed and all timestamps are converted to moment.js objects, before the largest and smallest dates are found and added to the minDate and maxDate variables.
* getRegions() - Temporary function to pull country data from local cache, by making an AJAX call to data/regionMeta.json.  In future - to be replaced by API pull?



mapping.js
----------

The file contains the map loading and drawing functions: 

* loadMap(m) - function for loading and parsing a topojson file using d3 functions.  Takes a map configuration object m, where m["file"] is a path reference to the topoJSON file to load and m["tname"] is the topology reference to use (see the :doc:`mapping` section).  When the map file is loaded, calls drawMap(m)
* drawMap(m) -  uses d3 functions to draw a topojson object.  Creates an SVG group and adds shapes based on the topoJSON files using the project defined in init.js.  Class names are added to the svg path based on the region names defined in the topojson file.



gui.js
------

This file handles user interface events: 

* selectorInit() - called after the meta data is loaded.  Populates the country  selectors with the values from the mata data.  Calls resetAdmin1() to clear the current region selection
* selectAdmin0() - Called when a selection is changed on the admin 0 (country) selector.  Provided a country has been selected (and not the 'null' 'select a country' value), then the admin 1 (region) selector is populated with the appropriate regions for the country.  Calls the loadDashboard() routine to update any maps (see dash.js)
* selectAdmin1() - Called when a selection is changed on the admin 1 (region) selector. Calls the loadDashboard() routine to update any dashboard graphs (see dash.js)
* resetAdmin1() - Clears contents the admin 1 (region) selector.



dash.js
-------

Handles updating of the dashboard and drawing graphs: 

* loadDashboard() - handles updating necessary elements of the dashboard, and is called whenever one of the GUI elements is changed.  If a new country has been selected, triggers loading of the map via loadMap().  If a region has been selected, triggers loading of API data for the graphs.
* initGraphs() - Sets up the initial SVG elements for the graphs by calling the makeGraph(name) function once for each graph.  Graphs are labelled by the name variable using mVAM terminology (FCS, FCG, rCSI).
* makeGraph(name) - draws the initial SVG elements for the graphs, including SVG DOM elements, group elements for the axes and data items (bars / lines / points etc.) and empty popup boxes.  Elements are given common class names, appended with the value of the name variable.
* updateGraphs() - uses d3 functions to update each of the graphs on the dashboard.  Initially the function takes the APIresponse value and produces a modified representation of the data as a time series.  Here each row represents a unique time stamp and the associated variables for FCG/FCS/rSCI.  Mean values and confidence indices are stored for each variable, then the time series is sorted.  Next, d3 scaling functions are defined for converting data values to pixel values on the screen.  The domain of the y-axis scale is based on the minumum and maximum values in the data set +/- 10% for padding, on the x-axis it is based on the min and max date values (see io.js)  The dashboard graphs are split into two types - the stacked bar for the FCG plot and line trend for the FCS and rSCI plots.  The stacked bar is drawn first, by calculating bar positions (x and y) using the scaling factors and adding SVG rect elements.  The rect elements have mouseover events attached to them, which change the stroke colour of the shape and call the updatePopup() function, passing the graph name and point reference (d).  Next the line plots are drawn by adding circles to indicate data points and a linear path drawn between them to show the trend.  Additionally, the confidence interva values are used to create an SVG closed path shape to shape a window of confidence of the plot.  The circles used to indicate datapoints have mouseover events attached to them, which change the colour of the shape and call the updatePopup() function, passing the graph name and point reference (d)
* updatePopup(name,d) - Updates the popup on the graph to show the currently moused-over data point value.  The function takes the name of the graph and a data point reference.  If the data point reference is equal to 0, the popup is reset (effectively hidden by setting both the height and width to zero).  Otherwise, the position of the popup is calculated based on the availability of space around the point, defaulting to being above and to the right of the point (i.e. if the point is at the top right corner of the graph, the popup would change to appear below and to the left of the point).  The popup text is set to contain the datapoint value and timestamp.
