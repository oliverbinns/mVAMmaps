// Global variables
// Define D3.js map projection and path handlers
var width= 1000
var height = 800
var projection = d3.geo.mercator()
	.center([0,15.5])
	.rotate([-48.5,0])
    .scale(4500)
    .translate([width / 2, height / 2]);

//SLE is .center([0,8.4]).rotate([11.8,0]).scale(11000)
//YEM is .center([0,15.5]).rotate([-48.5,0]).scale(4000)

// Globals for API data responses
APIresponse = {}
regioMeta = {}

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
	loadMap(mapData[2])
});
