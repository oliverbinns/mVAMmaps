// Global variables
// Define D3.js map projection and path handlers
var margin = {top: 50, right: 20, bottom: 40, left: 70},
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Globals for API data responses
var APIresponse = {}
	APIresponse["ADM0"] = []
	APIresponse["ADM1"] = []


var APIstatus = {}
	APIstatus["ADM0"] = {
		"status": 0,
		"page": 0,
		"regName": null
	}
	APIstatus["ADM1"] = {
		"status": 0,
		"page": 0,
		"regName": null
	}
	APIstatus["general"] = {
		"timeStart": "",
		"timeEnd": "",
		"IDP": false
	}

APIpage = 0
regioMeta = {}
minDate = 0
minDate = 0

// Graph styling globals
popWidth = 90
popHeight = 25
popGap = 5
popTextSize = 10

// Initial run script (document load)
$(document).ready(function () {
	console.log("Ready")
	initGraphs()
});

//Window resize debouncing function
function debounce(fn, delay) {
	var timer = null;
	return function () {
		var context = this, args = arguments;
		clearTimeout(timer);
		timer = setTimeout(function () {
			fn.apply(context, args);
		}, delay);
	};
}
