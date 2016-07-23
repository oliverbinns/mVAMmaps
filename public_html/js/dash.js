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


		// Create popup box
		var popGrp = svg.append("g")
			.attr("id", "popUp-" + name)

		popGrp.append("rect")
				.attr("class", "popupRect")
				.attr("id", "popupRect-" + name)
				.attr("x",0)
				.attr("y",0)
				.attr("width",0)
				.attr("height",0)

		popGrp.append("text")
				.attr("class", "popupText")
				.attr("id", "popupText-" + name)
				.text("")
				.attr("x",0)
				.attr("y",0)

		popGrp.append("text")
				.attr("class", "popupTitle")
				.attr("id", "popupTitle-" + name)
				.text("")
				.attr("x",0)
				.attr("y",0)
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
  		varConfHigh = APIfilt[i]["CnfIntvHi"]
  		varConfLow = APIfilt[i]["CnfIntvLo"]

		ix = APIts.map(function(x) {return x.tsString}).indexOf(APIfilt[i].ts.toISOString());
  		
  		if(ix == -1){
  			//Add the time period and the value associated with it
  			objts = {}
  			objts["tsString"] = APIfilt[i].ts.toISOString()
  			objts["ts"] = APIfilt[i].ts
  			objts[varName] = {}
  			objts[varName]["mean"] = varValue
  			objts[varName]["confHigh"] = varConfHigh
  			objts[varName]["confLow"] = varConfLow
  			APIts.push(objts)	
  		} else {
  			//Append the value to the identified time period
  			APIts[ix][varName] = {}
  			APIts[ix][varName]["mean"] = varValue
  			APIts[ix][varName]["confHigh"] = varConfHigh
  			APIts[ix][varName]["confLow"] = varConfLow
  		}
	}

	// Sort the time series 
	function tsSort(a,b){
		if(a.ts < b.ts) { return -1 }
		if(a.ts > b.ts) { return 1 }
		if(a.ts == b.ts) { return 0}
	}

	APIts.sort(tsSort)

	// Define d3 scales and axis objects
	xScale = d3.time.scale()
    	.range([0, width])
    	.domain([
    		minDate.subtract(1,'months').toDate(),
    		maxDate.add(1,'months').toDate()
    		]);

	yScale = d3.scale.linear()
    	.range([height, 0])

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
	yScale.domain([0, 1]);

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
	dateRange = maxDate.diff(minDate,"months") + 1
	barWidth = (width / (dateRange+2))
	if(barWidth > 10){
		// Add padding only if bars are wide enough
		barWidth = barWidth - (0.1 * barWidth)
	} 
	
	barCols = ["white","red","yellow","green"]

	// Redraw the stacked bars
	for(var rNo=1;rNo<4;rNo++){
		var r = svg.select("#dataGroup-FCG")
			.selectAll(".FCG_" + rNo)
			.data(APIts)
    		
	    r.enter().append("rect")
		r.style("fill", function(){return barCols[rNo]})
			.attr("class", "FCG_" + rNo)
		
		r.attr("x", function(d) { 
				return xScale(d.ts.toDate()) - (0.5 * barWidth); 
				})
			.attr("width", barWidth)
			.attr("y", function(d) { 
				y0 = 0
				for(var j=rNo;j>0;j--){
					y0 = y0 + d["FCG==" + j].mean
				}
				return yScale(y0)
			})
			.attr("height", function(d) { return height - yScale(d["FCG==" + rNo].mean); })
			.on("mouseover", function(d) { 
				updatePopup(d3.select(this).attr('class'),d)
				d3.select(this)
					.style("stroke", "orange"); 
			})
			.on("mouseout",  function(d) { 
				updatePopup(d3.select(this).attr('class'),0)
				d3.select(this)
					.style("stroke", "none"); 
			});
	}

	//Update FCS graph (line)
	maxFCS = Math.max.apply(null, APIts.map(function(d){return d.FCS.confHigh}))
	minFCS = Math.min.apply(null, APIts.map(function(d){return d.FCS.confLow}))

	yScale.domain([(0.9 * minFCS), (maxFCS * 1.1)])
	yAxis.ticks(10, "");

	svg = d3.select("#svgContentFCS")

	svg.select("#xAxis-FCS")
		.call(xAxis)

	svg.select("#yAxis-FCS")
		.call(yAxis)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("FCS");

	// Add the confidence interval shape
	var cfData = [],
		cfHigh = [],
		cfLow = [],
		cfLength = APIts.length
	for(var i = 0; i < cfLength; i++ ){
		var h  = {}
		h.val = APIts[i].FCS.confHigh
		h.ts = APIts[i].ts

		var l = {}
		l.val = APIts[(cfLength-1) - i].FCS.confLow
		l.ts = APIts[(cfLength-1) - i].ts

		cfHigh.push(h)
		cfLow.push(l)
	}
	cfData = cfHigh.concat(cfLow)

	var cfLine = d3.svg.line()
		.x(function(d) { return xScale(d.ts.toDate()) })
		.y(function(d) { return yScale(d.val) })

	var l = svg.select("#dataGroup-FCS")
		.selectAll(".cfLinePath")
		.data([cfData])
		
	l.enter().append("path")
		
	l.style("stroke", "none")
		.style("fill", "lightblue")
		.attr("class", "cfLinePath")
		.attr("d", function(d) { return cfLine(d) + "Z"; })


	// Add the line
	var line = d3.svg.line()
		.x(function(d) { return xScale(d.ts.toDate()) })
		.y(function(d) { return yScale(d.FCS.mean) })

	var l = svg.select("#dataGroup-FCS")
		.selectAll(".linePath")
		.data([APIts])
		
	l.enter().append("path")
	
	l.style("stroke", "blue")
		.style("fill", "none")
		.attr("class", "linePath")
		.attr("d", line)

	// Draw the circles
	var c = svg.select("#dataGroup-FCS")
		.selectAll("circle")
		.data(APIts)
		
    c.enter().append("circle")
		.style("stroke", "blue")
		.style("fill", "blue")
		.attr("class", "lineCircle")
	
	c.attr("cx", function(d){return xScale(d.ts.toDate())})
		.attr("cy", function(d){return yScale(d.FCS.mean)})
		.attr("r", "3")
		.on("mouseover", function(d) { 
			updatePopup("FCS",d)
			d3.select(this)
				.style("fill", "orange")
				.style("stroke", "orange"); 
		})
		.on("mouseout",  function(d) { 
			updatePopup("FCS",0)
			d3.select(this)
				.style("fill", "blue")
				.style("stroke", "blue"); 
		});





	//Update rCSI graph (line)
	maxrCSS = Math.max.apply(null, APIts.map(function(d){return d.rCSI.confHigh}))
	minrCSI = Math.min.apply(null, APIts.map(function(d){return d.rCSI.confLow}))

	yScale.domain([(0.9 * minrCSI), (maxrCSS * 1.1)])
	yAxis.ticks(10, "");

	svg = d3.select("#svgContentrCSI")

	svg.select("#xAxis-rCSI")
		.call(xAxis)

	svg.select("#yAxis-rCSI")
		.call(yAxis)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("rCSI");

	// Add the confidence interval shape
	var cfData = [],
		cfHigh = [],
		cfLow = [],
		cfLength = APIts.length
	for(var i = 0; i < cfLength; i++ ){
		var h  = {}
		h.val = APIts[i].rCSI.confHigh
		h.ts = APIts[i].ts

		var l = {}
		l.val = APIts[(cfLength-1) - i].rCSI.confLow
		l.ts = APIts[(cfLength-1) - i].ts

		cfHigh.push(h)
		cfLow.push(l)
	}
	cfData = cfHigh.concat(cfLow)

	var cfLine = d3.svg.line()
		.x(function(d) { return xScale(d.ts.toDate()) })
		.y(function(d) { return yScale(d.val) })

	var l = svg.select("#dataGroup-rCSI")
		.selectAll(".cfLinePath")
		.data([cfData])
		
	l.enter().append("path")
		
	l.style("stroke", "none")
		.style("fill", "lightgreen")
		.attr("class", "cfLinePath")
		.attr("d", function(d) { return cfLine(d) + "Z"; })

	// Add the line
	var line = d3.svg.line()
		.x(function(d) { return xScale(d.ts.toDate()) })
		.y(function(d) { return yScale(d.rCSI.mean) })

	var l = svg.select("#dataGroup-rCSI")
		.selectAll(".linePath")
		.data([APIts])
		
	l.enter().append("path")

	l.style("stroke", "green")
		.style("fill", "none")
		.attr("class", "linePath")
		.attr("d", line)

	// Draw the circles
	var c = svg.select("#dataGroup-rCSI")
		.selectAll("circle")
		.data(APIts)
		
    c.enter().append("circle")
		.style("stroke", "green")
		.style("fill", "green")
		.attr("class", "lineCircle")
	
	c.attr("cx", function(d){return xScale(d.ts.toDate())})
		.attr("cy", function(d){return yScale(d.rCSI.mean)})
		.attr("r", "3")
		.on("mouseover", function(d) { 
			updatePopup("rCSI",d)
			d3.select(this)
				.style("fill", "orange")
				.style("stroke", "orange"); 
		})
		.on("mouseout",  function(d) { 
		    updatePopup("rCSI",0)
		    d3.select(this)
				.style("fill", "green")
				.style("stroke", "green"); 
		});



}

function updatePopup(name,d){
	// Updates the popup with data for the hovered / selected item
	if(name.indexOf("FCG") > -1){
		selName = "FCG"
		yScale.domain([0,1])
	} else {
		selName = name
		maxDom = Math.max.apply(null, APIts.map(function(e){return e[name].mean}))
		minDom = Math.min.apply(null, APIts.map(function(e){return e[name].mean}))
		yScale.domain([(0.9 * minDom), (maxDom * 1.1)])
	}

	if(d == 0){
		// Clear the popup
		d3.select("#popupText-" + selName)
			.text("")
		d3.select("#popupTitle-" + selName)
			.text("")
		d3.select("#popupRect-" + selName)
			.attr("width", 0)
			.attr("height", 0)

	} else {
		// Update the popup data
		val = d[name].mean
		valText = name + ": " + d[name].mean
		ts = d.ts

		pointX = xScale(ts.toDate())
		pointY = yScale(val)

		spaceRight = width - pointX
		spaceUp = pointY

		//Select the position
		pX = 0
		pY = 0
		if(spaceRight < (popWidth + popGap)){
			pX = pointX - (popWidth + popGap)
		} else {
			pX = pointX + popGap
		}

		if(spaceUp < (popHeight + popGap)){
			pY = pointY + popGap
		} else {
			pY = pointY - (popHeight + popGap)
		}		

		d3.select("#popupTitle-" + selName)
			.text(ts.format("YYYY-MM"))
			.attr("x", (pX + popTextSize))
			.attr("y", (pY + popTextSize))

		d3.select("#popupText-" + selName)
			.text(valText)
			.attr("x", (pX + popTextSize))
			.attr("y", (pY + (2 * popTextSize)))

		d3.select("#popupRect-" + selName)
			.attr("x",pX)
			.attr("y",pY)
			.attr("width", popWidth)
			.attr("height", popHeight)
	}
}
