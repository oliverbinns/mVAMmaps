File and directory structure
============================

The project contains the following main directories:

1. /docs/ - this contains all of the project documentation.  The documentation is written in restructured text and can be compiled using the Sphinx python library.  The directory contains a windows batch and unix makefile to automate the compilation the documentation to html, PDF and various other formats using sphinx. Source text and configuration files for the documentation can be found in the /docs/source/ directory, with built output being placed in /docs/build/?/ where '?' is the documentation format (html, pdf etc.)

2. /public_html/ contains the html, css and JavaScript that is to be served to the user.  This folder is contained entirely of static content (i.e. no PHP, ASP etc.), so can be served by a simple HTTP web server.  For more details on the contents of the this directory, see the section below.

3. /source/ contains the npm, bower, and gulp configuration files necessary to download third party JavaScript files and compile the site code for use.



public_html
-----------

The public_html directory contains the main content of the dashboard itself and is composed of the following:

1. index.html - a single page in the root of the served folder, which references all of the other files and contains the structural divs and form elements to display the dashboard.  In production, this would be replaced by whatever additional scaffolding is used to host the dashboard.

2. css/app.css - contains all the css rules for display of the page.  The app.css file is a compiled and minified file, which is based on the files in the css/Sass/ directory.  The app.css file is compiled using the gulpfile in the /source/ directory.  The css/ directory also contains the font-awesome stylesheets (copied over from bower when the site is compiled).

3. fonts/ - contains the fontawesome font files, which are copied over from bower when the site is compiled using the gulpfile in the /source/ directory.

4. js/ - contains the main JavaScript files for the dashboard, which each contain a set of functions, which are outlined in the section below.  The main index.html file uses the single js/compiled/app.min.js file, which is a combined and minified version of the various javascript files in the folder.  The app.min.js file is created by the gulpfile found in the /source/ directory.

5. js/vendor/ - contains the following third party JavaScript libraries, which are copied from bower using the gulpfile in the /source/ directory.
	* jQuery
	* d3 - a SVG drawing library used for the maps and charts
	* topojson - a library for converting topographical JavaScript Object Notation files for use in map drawing
	* colorbrewer - a library of colours selected for good visibility of data in cartographic applications.
	* moment - a library for easier handling of date and timestamps (parsing, displaying and calculating)


6. data/ - contains data files that are loaded using AJAX routines in the js/io.js file.  offlineAPIdata.json contains an example data extraction from the WFP API and can be used in its place if developing offline (by making an appropriate change in the AJAX routine).  regionMeta.json contains region (country subdivision information), which us used to populate the selector drop-down boxes and join data with the regions displayed on the map. The baseMap/ directory contains pre-prepared topojson files, which contain the shape information required to draw the regions on the map.  These files can be made for other regions by following the instructions in the :doc:`mapping` section of this document.


JavaScript files overview
-------------------------

The following JavaScript files are used:

1. dash.js - the main file for drawing and updating the dashboard.  Takes input data from the API, processes it further and draws the dashboard elements using d3.
2. gui.js - contains functions for handling user interface actions, e.g. selecting a country from the dropdown
3. init.js - the initial code to be run when the page has loaded.  Also contains references to globally exposed variables.
4. io.js - all data functions of the dashboards, including reading map data files and making calls to the API
5. mapping.js - functions for drawing and updating the maps
6. util.js - utility functions written for development purposes


