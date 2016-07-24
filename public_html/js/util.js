// Utility functions

// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function() {  
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    });
};


function getRegionNames(){
	x = $('.region')
	u = []
	for (var i = 0; i < x.length; i++) {
		f = false
		for (var j = 0; j < u.length; j++) {
			if(x[i].className.baseVal.split(" ")[1] == u[j]){
				f = true
			}
		}
		if(f==false){
			u.push(x[i].className.baseVal.split(" ")[1])
			//console.log($('#op').text + "," + u)
			console.log(x[i].className.baseVal.split(" ")[1])
		}
	}

	return u
}

function randomColours(){
	cols = colorbrewer.RdBu['10']
	x = $('.region')
	for (var i = 0; i < x.length; i++) {
		randomNum =  Math.floor(Math.random() * (10 - 0 + 1)) + 0;
		$('.' + x[i].className.baseVal.split(" ")[1]).css('fill',cols[randomNum])
	}
}

function randCol(){
	cols = colorbrewer.RdBu['10']
	return cols[Math.floor(Math.random() * (10 - 0 + 1)) + 0]
}

function getData(){
	var request = $.ajax({
		type: "GET",
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