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

function APItest(){
	// Implements the mVAM API example call (#2) from:
	// http://vam.wfp.org/mvam_monitoring/mvamapi.aspx

	APIurl = "http://vam.wfp.org/mvam_monitoring/api.aspx"
	APIdata = {
		'table': 'pblStatsSum', 
		'where': 'ADM0_NAME = \'Yemen\' AND VARIABLE=\'FCS\' AND MEAN < 40', 
		'page': 0
	}

	var request = $.ajax({
		type: "POST",
		url: APIurl,
		data: APIdata,
		dataType: 'text'
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