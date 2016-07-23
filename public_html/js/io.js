// mVAM data-API call functions

function APIpull(opt){
	/*
	Implements an mVAM API call for the dashboard
	Arguments:
		opt - required object of API arguments:
		opt["adm0"] - required string with Admin level 0 (country) name
		opt["adm1"] - option string with region name
	*/

	// Parse options and build query string
	qs = "ADM0_NAME = '" + opt["adm0"] + "'"
	if(opt["adm1"] != "Entire country"){
		// Select region data
		escapedName = opt["adm1"].replace(/[']/g,"''")
		qs = qs + " AND AdminStrata = '" + escapedName + "'"
		qs = qs + " AND IndpVars = 'AdminUnits'"

	} else {
		// Select country data
		qs = qs + " AND AdminStrata = '" + opt["adm0"] + "'"
		qs = qs + " AND IndpVars = 'ADM0'"
	}
	//qs = qs + " AND IndpVars = \'AdminUnits,IDP_YN\'"
	
	console.log("Requesting data from API:")
	console.log("    " + qs + " | page = " + APIpage)

	var APIurl = "http://vam.wfp.org/mvam_monitoring/api.aspx"
	// Offline use
		//var APIurl = "data/offlineAPIdata.json"
	var APIdata = {
		'table': "pblStatsSum", 
		'where': qs,
		'page': APIpage
	}

	var reqOptions = {
		type: "POST",
		url: APIurl,
		data: APIdata,
		dataType: 'text'
	}

	if(opt["adm1"] == "Entire country"){
		var requestCountry = $.ajax(reqOptions);

		//Success - load the country-level data
		requestCountry.done(function(msg) {
			//Parse result and concatenate onto the response
			SVRresp = JSON.parse(msg)
			APIresponse = APIresponse.concat(SVRresp)
			
			console.log("API Data returned ok, " + SVRresp.length + " values, total " + APIresponse.length)
			
			// Check all data was returned in this page
			if(SVRresp.length >= 999 ){
				console.warn("Potentially not all data collected, getting next page")
				APIpage++
				APIpull(opt)
			} else {
				console.log("All data collected, processing...")

				// Get min/max dates
				var APIdates = []
				for (var i = 0; i < APIresponse.length; i++) {
					//Convert to a moment timestamp
					APIresponse[i].ts = moment.utc(APIresponse[i].SvyDate)
					APIdates.push(APIresponse[i].ts)
				}
				minDate = moment.min(APIdates)
				maxDate = moment.max(APIdates)

				updateGraphs()
			}
		});
		
		//Fail - lof to onsole
		requestCountry.fail(function(){
			console.warn("Error getting country-level API data")
			alert("Error getting data from the mVAM API.  Cannot continue.")
			$('#loadDiv').fadeOut()
		});
	} else {
		var requestRegion = $.ajax(reqOptions);

		//Success - load region-level data and update the graphs
		requestRegion.done(function(msg) {
			//Parse result and concatenate onto the response
			SVRresp = JSON.parse(msg)
			APIresponse = APIresponse.concat(SVRresp)
			
			console.log("API Data returned ok, " + SVRresp.length + " values, total " + APIresponse.length)
			
			// Check all data was returned in this page
			if(SVRresp.length >= 999 ){
				console.warn("Potentially not all data collected, getting next page")
				APIpage++
				APIpull(opt)
			} else {
				console.log("All data collected, processing...")

				// Get min/max dates
				var APIdates = []
				for (var i = 0; i < APIresponse.length; i++) {
					//Convert to a moment timestamp
					APIresponse[i].ts = moment.utc(APIresponse[i].SvyDate)
					APIdates.push(APIresponse[i].ts)
				}
				minDate = moment.min(APIdates)
				maxDate = moment.max(APIdates)

				updateGraphs()
			}
		});
		
		//Fail - lof to onsole
		requestRegion.fail(function(){
			console.warn("Error getting region-level API data")
			alert("Error getting data from the mVAM API.  Cannot continue.")
			$('#loadDiv').fadeOut()
		});
	}
}

function getRegions(){
	// Temporary function to pull country data from local cache
	// future - to be replaced by API pull?

	var request = $.ajax({
		type: "GET",
		url: "data/regionMeta.json",
		dataType: 'json'
	});
	
	//Success - initialise the selectors
	request.done(function(msg) {
		regioMeta = msg
		console.log("Region metaData returned ok, " + regioMeta.adm0.length + " values")
		// Populate the UI selectors
		selectorInit()
	});
	
	//Fail - log to console
	request.fail(function(){
		console.warn("Error getting region metaData")
	});

}