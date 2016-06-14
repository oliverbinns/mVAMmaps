// Map control functions
function loadMap(m){
	// Load data from topoJSON files
	d3.json(m.file, function(error, topology) {
		if (error) return console.error(error);
		
		//Parse the topoJSON content to geoJSON format and store the data
		regions = topojson.feature(topology, topology.objects[m.tName]);
		// capitals = topojson.feature(topology, topology.objects.capitals);
		
		//Call the map drawing function (below)
		console.log(topology)
		drawMap()

	});
}


function drawMap(){
	// Define SVG elements	
	var svg = d3.select("#animationHolder").append("svg")
			.attr("id", "animSVG")
			.attr("width", width)
			.attr("height", height);
			
	var gCountries = svg.append("g")
  			.attr("id","countries");
  	
  	//Define D3.js map projection and path handlers
	var path = d3.geo.path()
	    .projection(projection);

	//Plot country shapes
	gCountries.selectAll(".region")
    	.data(regions.features)
		.enter().append("path")
			.attr("class", function(d) { 
				nm = d.properties.name.replace('\'', '').replace(' ', '').toLowerCase()
				return "region " + nm; 
			})
			.attr("d", path);
}