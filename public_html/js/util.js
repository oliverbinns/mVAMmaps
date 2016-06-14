// Utility functions

function getRegionNames(){
	x = $('.region')
	u = []
	for (var i = 0; i < x.length; i++) {
		f = false
		for (var j = 0; j < u.length; j++) {
			if(x[i].className.baseVal == u[j]){
				f = true
			}
		}
		if(f==false){
			u.push(x[i].className.baseVal)
			console.log($('#op').text + "," + u)
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