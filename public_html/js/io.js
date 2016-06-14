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