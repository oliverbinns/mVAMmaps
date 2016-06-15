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
	qs = qs + " AND IndpVars = \'AdminUnits,IDP_YN\'"

	console.log(qs)

	APIurl = "http://vam.wfp.org/mvam_monitoring/api.aspx"
	APIdata = {
		'table': "pblStatsSum", 
		'where': qs
	}

	var request = $.ajax({
		type: "POST",
		url: APIurl,
		data: APIdata,
		dataType: 'text'
	});
	
	//Success - 
	request.done(function(msg) {
		APIresponse = JSON.parse(msg)
		console.log("API Data returned ok, " + APIresponse.length + " values")
	});
	
	//Fail - 
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
	
	//Success - 
	request.done(function(msg) {
		regioMeta = msg
		console.log("Region metaData returned ok, " + regioMeta.length + " values")
	});
	
	//Fail - 
	request.fail(function(){
		console.warn("Error getting region metaData")
	});

}