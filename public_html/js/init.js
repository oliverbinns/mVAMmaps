// Global variables
// Define D3.js map projection and path handlers
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Globals for API data responses
APIresponse = {}
APIresponse.ADM0 = []
APIresponse.ADM1 = []
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
