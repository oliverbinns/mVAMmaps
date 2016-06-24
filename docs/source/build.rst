Compiling the site
==================

The site is built using bower and gulp to manage third-party JavaScript plugins, JavaScript minification and Sass/CSS compilation.  Gulp also helps the development process by watching for changes in the source code and recompiling the files as necessary.  As third-party libraries and compiled code are not committed to the git repository and so the site must be compiled before it can be used for development work.


Prerequisites
-------------

1. Install node from the node.js website
2. Install bower and gulp globally onto the machine using npm::

	npm install -g bower
	npm install -g gulp

3. For building the documentation, install `python from here`_ and the sphinx module::

	pip install sphinx


Building the site
-----------------

1. Download the latest version from github::

	git clone http://github.com/oliverbinns/mVAMmaps/

2. Change to the source directory::

	cd mVAMmaps/source/

3. Download necessary gulp and third party JavaScript plugins, then compile the site ::

	npm install
	bower install
	gulp

Note that once the gulp command has been run, gulp will continue to watch the mVAM/public_html/js/ and mVAM/public_html/css/Sass/ directories for changes and recompile the appropriate files if any changes are made.  The gulp command can be stopped with ctrl-c.

6. Serve the pages.  You need to serve the mVAM/public_html/ directory using whatever web server you wish to use.  The site uses entirely static html (no PHP/ASP/node etc. required).  For test and development purposes, a simple http server can be started on your local machine using python::

	cd cd mVAMmaps/public_html/
	python -m SimpleHTTPServer

This will serve the site at http://localhost:8000 


Building the documentation
--------------------------

1. Download the latest version from github::

	git clone http://github.com/oliverbinns/mVAMmaps/

2. Change to the documentation directory::

	cd mVAMmaps/docs/

3. Build the html version documentation::

	make html

The html files will be placed in mVAM/docs/build/html/ directory.  Note that the sphinx documentation builder can also make PDF versions of the documentation along with many other formats (run the make command without arguments for details).  The latest compiled documentation is also `available here`_ 


.. _python from here : http://python.org
.. _available here : http://mvammaps.readthedocs.io/en/latest/
