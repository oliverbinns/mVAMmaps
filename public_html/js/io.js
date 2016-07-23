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
	if(typeof(opt["adm1"]) != "undefined" && opt["adm1"] != "Entire country"){
		qs = qs + " AND AdminStrata = '" + opt["adm1"] + "'"
		qs = qs + " AND IndpVars = 'AdminUnits'"

	} else if(typeof(opt["adm1"]) != "undefined" && opt["adm1"] == "Entire country") {
		qs = qs + " AND AdminStrata = '" + opt["adm0"] + "'"
		qs = qs + " AND IndpVars = 'ADM0'"
	}
	//qs = qs + " AND IndpVars = \'AdminUnits,IDP_YN\'"
	
	console.log("Requesting data from API:")
	console.log("    " + qs + " | page = " + APIpage)

	APIurl = "http://vam.wfp.org/mvam_monitoring/api.aspx"
	APIdata = {
		'table': "pblStatsSum", 
		'where': qs,
		'page': APIpage
	}

	// Offline use
	//APIurl = "data/offlineAPIdata.json"

	var request = $.ajax({
		type: "POST",
		url: APIurl,
		data: APIdata,
		dataType: 'text'
	});
	
	//Success - load the graphs with the data
	request.done(function(msg) {
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
			APIdates = []
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
	request.fail(function(){
		console.warn("Error getting API data")
	});
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