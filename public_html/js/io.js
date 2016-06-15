// mVAM data-API call functions

function getData(){
	var request = $.ajax({
		type: "POST",
		url: "/data/testFile.json",
		data: {}
	});
	
	//Success - callback to runArticle() to load content into div
	request.done(function(msg) {
		console.log("Data returned:")
		console.log(msg)
	});
	
	//Fail - callback to errorArticle() to load error message on screen
	request.fail(function(){
		console.warn("Error getting data")
	});
}

function APIpull(opt){
	/*
	Implements an mVAM API call for the dashboard
	Arguments:
		opt - required object of API arguments:
		opt["adm0"] - required string with Admin level 0 (country) name
		opt["adm1"] - option string with region name
	*/

	// Parse options and build query string
	qs = "ADM0_NAME = \'" + opt["adm0"] + "\'"
	if(typeof(opt["adm1"]) != "undefined"){
		qs = qs + " AND AdminStrata = \'" + opt["adm1"] + "\'"
	}
	//qs = qs + " AND IndpVars = \'AdminUnits,IDP_YN\'"
    qs = qs + " AND IndpVars = \'AdminUnits\'"
	
	console.log("Requesting data from API:")
	console.log("    " + qs + " | page = " + APIpage)

	APIurl = "http://vam.wfp.org/mvam_monitoring/api.aspx"
	APIdata = {
		'table': "pblStatsSum", 
		'where': qs,
		'page': APIpage
	}

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
			console.log("All data collected, building graphs")
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
		type: "POST",
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