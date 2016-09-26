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

var dateSelection = {}
dateSelection["start"] = null
dateSelection["end"] = null

APIpage = 0
regioMeta = {}
minDate = 0
minDate = 0

// Graph styling globals
popWidth = 90
popHeight = 25
popGap = 5
popTextSize = 10

// UI time slider selector limit
minSelectableDate = moment("2015-07-01").toDate()

// Initial run script (document load)
$(document).ready(function () {
	console.log("Ready")
	initGraphs()
	initTimeSlider()
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

//Zero-padding function
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

// IDP toggle hook
$('#IDPtoggle').change(function () {
	var IDPstate = $("#IDPtoggle").prop("checked")
    console.log("IDP toggle switch changed to " + IDPstate)
 });