// Dashboard control functions

function loadDashboard(adm0ID, adm1ID, IDP, yearStart, monthStart, yearEnd, monthEnd) {
	//Call the API t pull the requried data 
	//(will call updateGraphs() when done)

	//Form options object
	opt = {}
	opt["adm0"] = adm0ID
	opt["adm1"] = adm1ID
	opt["IDP"] = IDP

	// Parse the dates
	if(!yearStart | !monthStart | !yearEnd | !monthEnd){
		//Incomplete dates
		dateSelection["start"] = null
		dateSelection["end"] = null
	} else {
		var s = yearStart + "-" + pad(monthStart,2,0) + "-01T00:00:00"
		var e = yearEnd + "-" + pad(monthEnd,2,0) + "-01T00:00:00"
		dateSelection["start"] = moment.utc(s)
		dateSelection["end"] = moment.utc(e)
	}

	if(IDP==true){
		opt["adm1"] = null
	}

	//Reset the API status (invalidate caches)
	APIstatus["ADM0"]["status"] = 'in progress'
	APIstatus["ADM1"]["status"] = 'in progress'
	
	APIresponse["ADM0"] = []
	APIresponse["ADM1"] = []

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
	
	//Call the API function (see io.js)
	APIpull(opt)
}

function initGraphs(){
	// Draw initial (empty) graph objects
	makeGraph("FCS")
	makeGraph("FCG")
	makeGraph("rCSI")

	function makeGraph(name){
		// Create an SVG element
		var svgWidth =  width + margin.left + margin.right,
			svgHeight = height + margin.top + margin.bottom

		var svg = d3.select("#" + name + "graph").append("svg")
			.attr("id", "svg" + name)
			.attr("width", svgWidth)
    		.attr("height", svgHeight)
		.append("g")
			.attr("id", "svgContent" + name)
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// Create axes
		var axGrp = svg.append("g")
			.attr("id", "axGroup-" + name)

      	axGrp.append("g")
      		.attr("id", "hlGroup-" + name)

		axGrp.append("g")
      		.attr("class", "x axis")
      		.attr("transform", "translate(0," + height + ")")
      		.attr("id", "xAxis-" + name)
      		.style("font-size", "10px")
      		.style("font-family", "Arial")
      		.style("fill", WFPcolours["WFPtext"])

		axGrp.append("g")
      		.attr("class", "y axis")
      		.attr("id", "yAxis-" + name)
      		.style("font-size", "10px")
      		.style("font-family", "Arial")
      		.style("fill", WFPcolours["WFPtext"])

      	axGrp.append("g")
      		.attr("class", "axisLabel")
      		.attr("transform", "rotate(-90,10,70)")
      		.append("text")
      			.attr("id","axisLabelText")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "middle")
				.text(name)
				.style("font-size", "10px")
      			.style("font-family", "Arial")
      			.style("fill", WFPcolours["WFPtext"])
      			.style("stroke", "none")

      	axGrp.append("g")
      		.attr("class", "titleLabel")
      		.attr("transform", "translate(" + (svgWidth/3) + ",-20)")
      		.append("text")
      			.attr("class","titleLabelText")
				.style("font-size", "14px")
      			.style("font-family", "Arial")
      			.style("fill", WFPcolours["WFPgrey-2"])
      			.style("stroke", "none")

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

	//Register a window resize  (with debounce)
    $(window).on('resize', debounce(function(){
	      var win = $(this);
	      windowResizeDash()
	    },100)
    );

}

function windowResizeDash(){

	//Update the graphs
	updateGraphs()
}

function updateGraphs(){
	// Update graph objects with new data
	console.log("Updating graphs...")

	//Find the width and height of the graphs
    var svgHolder = d3.select("#FCSgraph");
    width = svgHolder.node().getBoundingClientRect().width;
        
    var svgElem = d3.select("#svgFCS")
        .attr("width", width)

    var svgTop = svgElem.node().getBoundingClientRect().top
    var holderBottom = svgHolder.node().getBoundingClientRect().bottom;
   	height = holderBottom - svgTop;

    width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom;


	//Set the graph titles
	var graphTitle = ""

	if(APIresponse["ADM1"].length > 0 ){
		graphTitle += APIresponse["ADM0"][0]["ADM0_NAME"]
	} else {
		graphTitle = "No country selected"
	}
	
	if(APIresponse["ADM1"].length > 0 ){
		graphTitle += " - " + APIresponse["ADM1"][0]["AdminStrata"]
	}

	$(".titleLabelText").text(graphTitle)

	// Get min/max dates
	var APIdates = []
	for(var a=0;a<=1;a++){
		for (var i = 0; i < APIresponse["ADM"+a].length; i++) {
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

		var s = dateSelection["start"]
		var e = dateSelection["end"]

		if(s != null && e != null){
			APIfilt["ADM"+a] = APIfilt["ADM"+a].filter(function(d){
				return d.ts >= dateSelection["start"] &&
					d.ts <= dateSelection["end"]
			})
			minDate = s
			maxDate = e
		}

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
		.style("fill", "none")
		.style("stroke", WFPcolours["WFPtext"])
		.style("shape-rendering", "crispEdges")
		.selectAll("text")
			.style("fill", WFPcolours["WFPtext"])
			.style("stroke", "none")

	svg.select("#yAxis-FCG")
		.call(yAxis)
		.style("fill", "none")
		.style("stroke", WFPcolours["WFPtext"])
		.style("shape-rendering", "crispEdges")
		.selectAll("text")
			.style("fill", WFPcolours["WFPtext"])
			.style("stroke", "none")

	var hLine = svg.select("#axGroup-FCG").select("#hlGroup-FCG")
		.selectAll("line.horizontalGrid")
		.data(yScale.ticks(10))

		hLine.exit().remove()
		hLine.enter().append("line")
	    hLine.attr(
	        {
	            "class":"horizontalGrid",
	            "x1" : 0,
	            "x2" : width,
	            "y1" : function(d){ return yScale(d);},
	            "y2" : function(d){ return yScale(d);},
	        })
	    hLine.style("fill", "none")
	    	.style("stroke", WFPcolours["WFPgrey-2"])
	    	.style("stroke-width", "1px")


	// Calcuate the width of the bars
	dateRange = maxDate.diff(minDate,"months") + 1
	barWidth = (width / (dateRange+2))
	if(barWidth > 10){
		// Add padding only if bars are wide enough
		barWidth = barWidth - (0.1 * barWidth)
	} 

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
		r.attr("class", "FCG_" + rNo)
			.style("fill", function(d){
				if(rNo == 0){return WFPcolours["WFPbackground"]}
				if(rNo == 1){return WFPcolours["WFPred"]}
				if(rNo == 2){return WFPcolours["WFPyellow"]}
				if(rNo == 3){return WFPcolours["WFPgreen"]}
			})
			.style("stroke", "none")
		
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
		.style("fill", "none")
		.style("stroke", WFPcolours["WFPtext"])
		.style("shape-rendering", "crispEdges")
		.selectAll("text")
			.style("fill", WFPcolours["WFPtext"])
			.style("stroke", "none")

	svg.select("#yAxis-FCS")
		.call(yAxis)
		.style("fill", "none")
		.style("stroke", WFPcolours["WFPtext"])
		.style("shape-rendering", "crispEdges")
		.selectAll("text")
			.style("fill", WFPcolours["WFPtext"])
			.style("stroke", "none")

	var hLine = svg.select("#axGroup-FCS").select("#hlGroup-FCS")
		.selectAll("line.horizontalGrid")
		.data(yScale.ticks(10))

		hLine.exit().remove()
		hLine.enter().append("line")
	    hLine.attr(
	        {
	            "class":"horizontalGrid",
	            "x1" : 0,
	            "x2" : width,
	            "y1" : function(d){ return yScale(d);},
	            "y2" : function(d){ return yScale(d);},
	        });
	   	hLine.style("fill", "none")
	    	.style("stroke", WFPcolours["WFPgrey-2"])
	    	.style("stroke-width", "1px")


	// Add the confidence interval shapes
	var endPoint = 1
	if(APIts.ADM1.length == 0){
		//endPoint = 0
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

		if(cfData.length == 0)
			shapeData = []
		else{
			shapeData = [cfData]
		}

		var cfLine = d3.svg.line()
			.x(function(d) { return xScale(d.ts.toDate()) })
			.y(function(d) { return yScale(d.val) })

		var l = svg.select("#dataGroup-FCS")
			.selectAll(".cfLinePath-FCS-" + a)
			.data(shapeData)

		l.exit().remove()
		l.enter().append("path")
			
		l.attr("class", "cfLinePath-FCS-" + a)
			.attr("d", function(d) { return cfLine(d) + "Z"; })

		l.style("stroke", "none")
		 .style("fill",function(){
		 	if(a == 0){return WFPcolours["WFPgrey-2"]}
		 	if(a == 1){return WFPcolours["WFPBlue-1"]}
		 })		
		 .style("fill-opacity", "0.5")	

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

		l.style("stroke",function(){
		 	if(a == 0){return WFPcolours["WFPgrey-4"]}
		 	if(a == 1){return WFPcolours["WFPBlue"]}
		 })
		 .style("fill", "none")	

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

		c.style("fill", function(){
			if(a == 0){return WFPcolours["WFPgrey-4"]}
			if(a == 1){return WFPcolours["WFPBlue"]}
		})
		 .style("stroke", function(){
			if(a == 0){return WFPcolours["WFPgrey-4"]}
			if(a == 1){return WFPcolours["WFPBlue"]}
		})


		if(a==0){
			c.on("mouseover", function(d) { 
				updatePopupADM0("FCS",d)
				d3.select(this)
					.classed("circSelected", true); 
			})
			.on("mouseout",  function(d) { 
				updatePopupADM1("FCS",0)
				d3.select(this)
					.classed("circSelected", false); 
			});
		} else {
			c.on("mouseover", function(d) { 
				updatePopupADM0("FCS",d)
				d3.select(this)
					.classed("circSelected", true); 
			})
			.on("mouseout",  function(d) { 
				updatePopupADM1("FCS",0)
				d3.select(this)
					.classed("circSelected", false); 
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
		.style("fill", "none")
		.style("stroke", WFPcolours["WFPtext"])
		.style("shape-rendering", "crispEdges")
		.selectAll("text")
			.style("fill", WFPcolours["WFPtext"])
			.style("stroke", "none")

	svg.select("#yAxis-rCSI")
		.call(yAxis)
		.style("fill", "none")
		.style("stroke", WFPcolours["WFPtext"])
		.style("shape-rendering", "crispEdges")
		.selectAll("text")
			.style("fill", WFPcolours["WFPtext"])
			.style("stroke", "none")

	var hLine = svg.select("#axGroup-rCSI").select("#hlGroup-rCSI")
		.selectAll("line.horizontalGrid")
		.data(yScale.ticks(10))

		hLine.exit().remove()
		hLine.enter().append("line")
	    hLine.attr(
	        {
	            "class":"horizontalGrid",
	            "x1" : 0,
	            "x2" : width,
	            "y1" : function(d){ return yScale(d);},
	            "y2" : function(d){ return yScale(d);},
	        })
	   	hLine.style("fill", "none")
	    	.style("stroke", WFPcolours["WFPgrey-2"])
	    	.style("stroke-width", "1px")


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

		if(cfData.length == 0)
			shapeData = []
		else{
			shapeData = [cfData]
		}

		var cfLine = d3.svg.line()
			.x(function(d) { return xScale(d.ts.toDate()) })
			.y(function(d) { return yScale(d.val) })

		var l = svg.select("#dataGroup-rCSI")
			.selectAll(".cfLinePath-rCSI-" + a)
			.data(shapeData)
		
		l.exit().remove()
		l.enter().append("path")
			
		l.attr("class", "cfLinePath-rCSI-" + a)
			.attr("d", function(d) { return cfLine(d) + "Z"; })

		l.style("stroke", "none")
		 .style("fill",function(){
		 	if(a == 0){return WFPcolours["WFPgrey-2"]}
		 	if(a == 1){return WFPcolours["WFPBlue-1"]}
		 })		
		 .style("fill-opacity", "0.5")	

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

		l.style("stroke",function(){
		 	if(a == 0){return WFPcolours["WFPgrey-4"]}
		 	if(a == 1){return WFPcolours["WFPBlue"]}
		 })
		 .style("fill", "none")	

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

		c.style("fill", function(){
			if(a == 0){return WFPcolours["WFPgrey-4"]}
			if(a == 1){return WFPcolours["WFPBlue"]}
		})
		 .style("stroke", function(){
			if(a == 0){return WFPcolours["WFPgrey-4"]}
			if(a == 1){return WFPcolours["WFPBlue"]}
		})

		if(a==0){
			c.on("mouseover", function(d) { 
				updatePopupADM0("rCSI",d)
				d3.select(this)
					.classed("circSelected", true); 
			})
			.on("mouseout",  function(d) { 
				updatePopupADM1("rCSI",0)
				d3.select(this)
					.classed("circSelected", false); 
			});
		} else {
			c.on("mouseover", function(d) { 
				updatePopupADM0("rCSI",d)
				d3.select(this)
					.classed("circSelected", true); 
			})
			.on("mouseout",  function(d) { 
				updatePopupADM1("rCSI",0)
				d3.select(this)
					.classed("circSelected", false); 
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
	//Find the width and height of the graphs
    var svgHolder = d3.select("#FCSgraph");
    width = svgHolder.node().getBoundingClientRect().width;
        
    var svgElem = d3.select("#svgFCS")
        .attr("width", width)

    var svgTop = svgElem.node().getBoundingClientRect().top
    var holderBottom = svgHolder.node().getBoundingClientRect().bottom;
   	height = holderBottom - svgTop;

    width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom;


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
		valText = name + ": " + (Math.round(val * 100)) / 100
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
