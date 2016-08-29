// Dashboard control functions

function loadDashboard(adm0ID, adm1ID) {

	// If a region has been selected, run the API data pull
	// NB: can also be 'Entire Country' on region selector
	if(adm1ID != null){
		console.log("not null")
		opt = {}
		opt["adm0"] = adm0ID
		opt["adm1"] = adm1ID
		
		APIresponse.ADM1 = []
		APIpage = 0
		APIpull(opt)		
	} else {
		//Pull entire country data
		opt = {}
		opt["adm0"] = adm0ID
		opt["adm1"] = "Entire country"
		
		APIresponse.ADM0 = []
		APIresponse.ADM1 = []
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

		// Create a group to hold the bars / lines
		var dataGrp = svg.append("g")
			.attr("id", "dataGroup-" + name)

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

	// Get min/max dates
	var APIdates = []
	for(var a=0;a<=1;a++){
		for (var i = 0; i < APIresponse["ADM"+a].length; i++) {
			//Convert to a moment timestamp
			APIresponse["ADM"+a][i].ts = moment.utc(APIresponse["ADM"+a][i].SvyDate)
			APIdates.push(APIresponse["ADM"+a][i].ts)
		}
	}

	minDate = moment.min(APIdates)
	maxDate = moment.max(APIdates)

	// Filter the API response as necessary
	APIfilt = {}
	APIfilt.ADM0=[]
	APIfilt.ADM1=[]
	
	for(var a=0;a<=1;a++){
		APIfilt["ADM"+a] = APIresponse["ADM"+a].filter(function (d) {
			return 	d.Variable == "FCG==1" ||
					d.Variable == "FCG==2" ||
					d.Variable == "FCG==3" ||
					d.Variable == "rCSI" ||
					d.Variable == "FCS";
		})
	}

	// TO-DO date filtering based on user control

	//Convert data to time series
	APIts = {}
	APIts.ADM0=[]
	APIts.ADM1=[]

	for(var a=0;a<=1;a++){
		for(var i = 0; i<APIfilt["ADM"+a].length; i++){
			varName = APIfilt["ADM"+a][i]["Variable"]
	  		varValue = APIfilt["ADM"+a][i]["Mean"]
	  		varConfHigh = APIfilt["ADM"+a][i]["CnfIntvHi"]
	  		varConfLow = APIfilt["ADM"+a][i]["CnfIntvLo"]

			ix = APIts["ADM"+a].map(function(x) {return x.tsString}).indexOf(APIfilt["ADM"+a][i].ts.toISOString());
	  		
	  		if(ix == -1){
	  			//Add the time period and the value associated with it
	  			objts = {}
	  			objts["tsString"] = APIfilt["ADM"+a][i].ts.toISOString()
	  			objts["ts"] = APIfilt["ADM"+a][i].ts
	  			objts[varName] = {}
	  			objts[varName]["mean"] = varValue
	  			objts[varName]["confHigh"] = varConfHigh
	  			objts[varName]["confLow"] = varConfLow
	  			APIts["ADM"+a].push(objts)	
	  		} else {
	  			//Append the value to the identified time period
	  			APIts["ADM"+a][ix][varName] = {}
	  			APIts["ADM"+a][ix][varName]["mean"] = varValue
	  			APIts["ADM"+a][ix][varName]["confHigh"] = varConfHigh
	  			APIts["ADM"+a][ix][varName]["confLow"] = varConfLow
	  		}
		}
	}

	// Sort the time series 
	function tsSort(a,b){
		if(a.ts < b.ts) { return -1 }
		if(a.ts > b.ts) { return 1 }
		if(a.ts == b.ts) { return 0}
	}

	APIts.ADM0.sort(tsSort)
	APIts.ADM1.sort(tsSort)

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
	if(APIts.ADM1.length == 0){
		FCGData = APIts.ADM0
	} else {
		FCGData = APIts.ADM1
	}

	for(var rNo=1;rNo<4;rNo++){
		var r = svg.select("#dataGroup-FCG")
			.selectAll(".FCG_" + rNo)
			.data(FCGData)
    		
    	r.exit().remove()
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
	maxFCSvals = []
	minFCSvals = []
	for(var a=0;a<=1;a++){
		maxFCSvals[a] = Math.max.apply(null, APIts["ADM"+a].map(function(d){return d.FCS.confHigh}))
		minFCSvals[a] = Math.min.apply(null, APIts["ADM"+a].map(function(d){return d.FCS.confLow}))
	}
	maxFCS = Math.max.apply(null, maxFCSvals)
	minFCS = Math.min.apply(null, minFCSvals)

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

	// Add the confidence interval shapes
	var endPoint = 1
	if(APIts.ADM1.length == 0){
		endPoint = 0
	} 

	for(var a=0;a<=endPoint;a++){
		var cfData = [],
			cfHigh = [],
			cfLow = [],
			cfLength = APIts["ADM"+a].length
		for(var i = 0; i < cfLength; i++ ){
			var h  = {}
			h.val = APIts["ADM"+a][i].FCS.confHigh
			h.ts = APIts["ADM"+a][i].ts

			var l = {}
			l.val = APIts["ADM"+a][(cfLength-1) - i].FCS.confLow
			l.ts = APIts["ADM"+a][(cfLength-1) - i].ts

			cfHigh.push(h)
			cfLow.push(l)
		}
		cfData = cfHigh.concat(cfLow)

		var cfLine = d3.svg.line()
			.x(function(d) { return xScale(d.ts.toDate()) })
			.y(function(d) { return yScale(d.val) })

		var l = svg.select("#dataGroup-FCS")
			.selectAll(".cfLinePath-FCS-" + a)
			.data([cfData])
		
		l.exit().remove()
		l.enter().append("path")
			
		l.style("stroke", "none")
			.attr("class", "cfLinePath-FCS-" + a)
			.attr("d", function(d) { return cfLine(d) + "Z"; })

		// Add the line
		var line = d3.svg.line()
			.x(function(d) { return xScale(d.ts.toDate()) })
			.y(function(d) { return yScale(d.FCS.mean) })

		var l = svg.select("#dataGroup-FCS")
			.selectAll(".linePath-FCS-" + a)
			.data([APIts["ADM"+a]])
			
		l.exit().remove()
		l.enter().append("path")
		
		l.attr("class", "linePath-FCS-" + a)
			.attr("d", line)


		// Draw the circles
		var c = svg.select("#dataGroup-FCS")
			.selectAll(".lineCircle-FCS-" + a)
			.data(APIts["ADM"+a])

		c.exit().remove()
	    c.enter().append("circle")
			.attr("class", "lineCircle-FCS-" + a)
		
		c.attr("cx", function(d){return xScale(d.ts.toDate())})
			.attr("cy", function(d){return yScale(d.FCS.mean)})
			.attr("r", "3")

		if(a==0){
			c.on("mouseover", function(d) { 
				updatePopupADM0("FCS",d)
				d3.select(this)
					.style("fill", "orange")
					.style("stroke", "orange"); 
			})
			.on("mouseout",  function(d) { 
				updatePopupADM1("FCS",0)
				d3.select(this)
					.style("fill", "darkgrey")
					.style("stroke", "darkgrey"); 
			});
		} else {
			c.on("mouseover", function(d) { 
				updatePopupADM0("FCS",d)
				d3.select(this)
					.style("fill", "orange")
					.style("stroke", "orange"); 
			})
			.on("mouseout",  function(d) { 
				updatePopupADM1("FCS",0)
				d3.select(this)
					.style("fill", "blue")
					.style("stroke", "blue"); 
			});
		}

	d3.select(".cfLinePath-FCS-" + a).moveToBack();
	}



	//Update rCSI graph (line)
	maxrCSIvals = []
	minrCSIvals = []
	for(var a=0;a<=1;a++){
		maxrCSIvals[a] = Math.max.apply(null, APIts["ADM"+a].map(function(d){return d.rCSI.confHigh}))
		minrCSIvals[a] = Math.min.apply(null, APIts["ADM"+a].map(function(d){return d.rCSI.confLow}))
	}
	maxrCSI = Math.max.apply(null, maxrCSIvals)
	minrCSI = Math.min.apply(null, minrCSIvals)

	yScale.domain([(0.9 * minrCSI), (maxrCSI * 1.1)])
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
	for(var a=0;a<=endPoint;a++){
		var cfData = [],
			cfHigh = [],
			cfLow = [],
			cfLength = APIts["ADM"+a].length
		for(var i = 0; i < cfLength; i++ ){
			var h  = {}
			h.val = APIts["ADM"+a][i].rCSI.confHigh
			h.ts = APIts["ADM"+a][i].ts

			var l = {}
			l.val = APIts["ADM"+a][(cfLength-1) - i].rCSI.confLow
			l.ts = APIts["ADM"+a][(cfLength-1) - i].ts

			cfHigh.push(h)
			cfLow.push(l)
		}
		cfData = cfHigh.concat(cfLow)

		var cfLine = d3.svg.line()
			.x(function(d) { return xScale(d.ts.toDate()) })
			.y(function(d) { return yScale(d.val) })

		var l = svg.select("#dataGroup-rCSI")
			.selectAll(".cfLinePath-rCSI-" + a)
			.data([cfData])
		
		l.exit().remove()
		l.enter().append("path")
			
		l.style("stroke", "none")
			.attr("class", "cfLinePath-rCSI-" + a)
			.attr("d", function(d) { return cfLine(d) + "Z"; })

		// Add the line
		var line = d3.svg.line()
			.x(function(d) { return xScale(d.ts.toDate()) })
			.y(function(d) { return yScale(d.rCSI.mean) })

		var l = svg.select("#dataGroup-rCSI")
			.selectAll(".linePath-rCSI-" + a)
			.data([APIts["ADM"+a]])
			
		l.exit().remove()
		l.enter().append("path")
		
		l.attr("class", "linePath-rCSI-" + a)
			.attr("d", line)


		// Draw the circles
		var c = svg.select("#dataGroup-rCSI")
			.selectAll(".lineCircle-rCSI-" + a)
			.data(APIts["ADM"+a])

		c.exit().remove()
	    c.enter().append("circle")
			.attr("class", "lineCircle-rCSI-" + a)
		
		c.attr("cx", function(d){return xScale(d.ts.toDate())})
			.attr("cy", function(d){return yScale(d.rCSI.mean)})
			.attr("r", "3")

		if(a==0){
			c.on("mouseover", function(d) { 
				updatePopupADM0("rCSI",d)
				d3.select(this)
					.style("fill", "orange")
					.style("stroke", "orange"); 
			})
			.on("mouseout",  function(d) { 
				updatePopupADM1("rCSI",0)
				d3.select(this)
					.style("fill", "darkgrey")
					.style("stroke", "darkgrey"); 
			});
		} else {
			c.on("mouseover", function(d) { 
				updatePopupADM0("rCSI",d)
				d3.select(this)
					.style("fill", "orange")
					.style("stroke", "orange"); 
			})
			.on("mouseout",  function(d) { 
				updatePopupADM1("rCSI",0)
				d3.select(this)
					.style("fill", "green")
					.style("stroke", "green"); 
			});
		}

	d3.select(".cfLinePath-rCSI-" + a).moveToBack();
	}


	console.log("Graphs updated")
	$('#loadDiv').fadeOut()

}

function updatePopupADM0(name,d){
	updatePopup(name,d,0)
}
function updatePopupADM1(name,d){
	updatePopup(name,d,1)
}

function updatePopup(name,d,a){
	// Updates the popup with data for the hovered / selected item
	if(name=="FCG_1"){
		name = "FCG==1"
	} else if(name=="FCG_2"){
		name = "FCG==2"
	} else if(name=="FCG_3"){
		name = "FCG==3"
	}

	if(name.indexOf("FCG") > -1){
		selName = "FCG"
		yScale.domain([0,1])
	} else {
		selName = name

		maxDomVals = []
		minDomVals = []
		for(var a=0;a<=1;a++){
			maxDomVals[a] = Math.max.apply(null, APIts["ADM"+a].map(function(e){return e[name].confHigh}))
			minDomVals[a] = Math.min.apply(null, APIts["ADM"+a].map(function(e){return e[name].confLow}))
		}
		maxDom= Math.max.apply(null, maxDomVals)
		minDom = Math.min.apply(null, minDomVals)

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
