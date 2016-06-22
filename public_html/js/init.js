// Global variables
// Define D3.js map projection and path handlers
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var projection = d3.geo.mercator()
	.center([0,15.5])
	.rotate([-48.5,0])
    .scale(2000)
    .translate([width / 2, height / 2]);

//SLE is .center([0,8.4]).rotate([11.8,0]).scale(11000)
//YEM is .center([0,15.5]).rotate([-48.5,0]).scale(4000)

// Globals for API data responses
APIresponse = {}
APIpage = 0
regioMeta = {}
minDate = 0
minDate = 0

// Graph styling globals
popWidth = 90
popHeight = 25
popGap = 5
popTextSize = 10

// Map data files
mapData = [
	{"id":0, "file":"/data/baseMap/admin0_topo.json","tName":"admin0"},
	{"id":1, "file":"/data/baseMap/admin1_topo_SLE.json","tName":"admin1_SLE"},
	{"id":2, "file":"/data/baseMap/admin1_topo_YEM.json","tName":"admin1_YEM"},
	{"id":3, "file":"/data/baseMap/admin1_topo.json","tName":"admin1"},
	{"id":4, "file":"/data/baseMap/admin2_topo_YEM.json","tName":"admin2_YEM"},
	{"id":5, "file":"/data/baseMap/admin2_topo_SLE.json","tName":"admin2_SLE"},
	{"id":6, "file":"/data/baseMap/admin3_topo_SLE.json","tName":"admin3_SLE"},
	{"id":7, "file":"/data/baseMap/roads_topo_SLE.json","tName":"sle_trs_roads_wfp_osm"},
	{"id":8, "file":"/data/baseMap/roads_topo_YEM.json","tName":"yem_trs_roads_wfp_1"}
]

// Initial run script (document load)
$(document).ready(function () {
	console.log("Ready")
	getRegions()
	initGraphs()
});
