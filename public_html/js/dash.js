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
	console.log("Updating graphs...")

	// Filter the API response as necessary
	APIfilt = []
	APIfilt = APIresponse.filter(function (d) {
		return 	d.Variable == "FCG==1" ||
				d.Variable == "FCG==2" ||
				d.Variable == "FCG==3" ||
				d.Variable == "rCSI" ||
				d.Variable == "FCS";
	})

	// TO-DO date filtering based on user control

	//Convert data to time series
	APIts = []
	for(var i = 0; i<APIfilt.length; i++){
		varName = APIfilt[i]["Variable"]
  		varValue = APIfilt[i]["Mean"]

		ix = APIts.map(function(x) {return x.tsString}).indexOf(APIfilt[i].ts.toISOString());
  		
  		if(ix == -1){
  			//Add the time period and the value associated with it
  			objts = {}
  			objts["tsString"] = APIfilt[i].ts.toISOString()
  			objts["ts"] = APIfilt[i].ts
  			objts[varName] = varValue
  			APIts.push(objts)	
  		} else {
  			//Append the value to the identified time period
  			APIts[ix][varName] = varValue
  		}
	}

	dateRange = maxDate.diff(minDate,"months") + 1

	// Define d3 scales and axis objects
	var xScale = d3.time.scale()
    	.range([0, width])
    	.domain([
    		minDate.subtract(1,'months').toDate(),
    		maxDate.add(1,'months').toDate()
    		]);

	var yScale = d3.scale.linear()
    	.range([height, 0])
    	.domain([0, 1]);

	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.ticks(5)
	.tickFormat(d3.time.format("%Y-%b"));

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

	// Calcuate the width of the bars
	barWidth = (width / (dateRange+2))
	if(barWidth > 10){
		// Add padding only if bars are wide enough
		barWidth = barWidth - (0.1 * barWidth)
	} 
	
	barCols = ["white","red","yellow","green"]

	// Redraw the stacked bars
	for(var rNo=1;rNo<4;rNo++){
		console.log(rNo)
		var r = svg.select("#dataGroup-FCG")
			.selectAll(".rect" + rNo)
			.data(APIts)
    		
	    r.enter().append("rect")
			.style("fill", function(){return barCols[rNo]})
			.attr("class", "rect" + rNo)
		
		r.attr("x", function(d) { 
				return xScale(d.ts.toDate()) - (0.5 * barWidth); 
				})
			.attr("width", barWidth)
			.attr("y", function(d) { 
				y0 = 0
				for(var j=rNo;j>0;j--){
					y0 = y0 + d["FCG==" + j]
				}
				return yScale(y0)
			})
			.attr("height", function(d) { return height - yScale(d["FCG==" + rNo]); });
	}
}

