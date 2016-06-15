// Dashboard control functions

function loadDashboard() {
	// Get the current selection
	adm0ID = $('#ADM0select').val()
	adm1ID = $('#ADM1select').val()

	mapData = {}
	mapData["file"] = regioMeta.adm0[adm0ID].mapFile
	mapData["tName"] =regioMeta.adm0[adm0ID].topologyName
	
	// Check if country map is already loaded (i.e. only an admin1 change)
	if($('#map-' + mapData["tName"]).length == 0){
		$('#mapHolder').empty()
		loadMap(mapData)
	}

	// If a region has been selected, run the API data pull
	// NB: can also be 'Entire Country' on region selector
	if(adm1ID != "null"){
		opt = {}
		opt["adm0"] = regioMeta.adm0[adm0ID].name
		opt["adm1"] = regioMeta.adm0[adm0ID].adm1[adm1ID]
		
		APIresponse = []
		APIpage = 0
		APIpull(opt)		
	}

}

function initGraphs(){
	// Draw initial (empty) graph objects
	makeGraph("FCS")
	makeGraph("FCG")
	makeGraph("rCSI")

	function makeGraph(name){
		// Create an SVG element
		var svg = d3.select("#" + name + "graph").append("svg")
			.attr("id", "svg" + name)
			.attr("width", width + margin.left + margin.right)
    		.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("id", "svgContent" + name)
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// Create axes
		var axGrp = svg.append("g")
			.attr("id", "axGroup-" + name)

		axGrp.append("g")
      		.attr("class", "x axis")
      		.attr("transform", "translate(0," + height + ")")
      		.attr("id", "xAxis-" + name)

		axGrp.append("g")
      		.attr("class", "y axis")
      		.attr("id", "yAxis-" + name)

		// Create a group to hold the bars / lines
		var dataGrp = svg.append("g")
			.attr("id", "dataGroup-" + name)
	}

}

function updateGraphs(){
	// Update graph objects with new data

	// Define d3 scales and axis objects
	var xScale = d3.scale.ordinal()
    	.rangeRoundBands([0, width], .1)
    	.domain([1,2,3,4,5]);

	var yScale = d3.scale.linear()
    	.range([height, 0])
    	.domain([0, 1]);

	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left")
		.ticks(10, "%");

	// Update FCG graph (bar)
	svg = d3.select("#svgContentFCG")

	svg.select("#xAxis-FCG")
		.call(xAxis)

	svg.select("#yAxis-FCG")
		.call(yAxis)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("% population");
}

