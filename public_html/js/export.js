function prepCSV(name){	
	// Filter the API response as necessary
	var CSVdata = []

	//ADM0
	ADM0_NAME = APIresponse["ADM0"][0]["ADM0_NAME"]
	for(var i = 0; i<APIts["ADM0"].length; i++){
		var row = {}
		row["timestamp"] = APIts["ADM0"][i].ts.format("YYYY-MM")
		row["region"] = ADM0_NAME
		
		if(name == "FCG"){
			row["%FCG=1"] = APIts["ADM0"][i]["FCG==1"]["mean"]
			row["%FCG=2"] = APIts["ADM0"][i]["FCG==2"]["mean"]
			row["%FCG=3"] = APIts["ADM0"][i]["FCG==3"]["mean"]
		} else {
			row[name + "_mean"] = APIts["ADM0"][i][name]["mean"]
			row[name + "_confidence_high"] = APIts["ADM0"][i][name]["confHigh"]
			row[name + "_confidence_low"] = APIts["ADM0"][i][name]["confLow"]
		}
		
		CSVdata.push(row)
	}


	if(APIresponse["ADM1"].length > 0 ){
		ADM1_NAME = APIresponse["ADM1"][0]["AdminStrata"]


		for(var i = 0; i<APIts["ADM1"].length; i++){
			var row = {}
			row["timestamp"] = APIts["ADM1"][i].ts.format("YYYY-MM")
			row["region"] = ADM1_NAME
			
			if(name == "FCG"){
				row["%FCG=1"] = APIts["ADM1"][i]["FCG==1"]["mean"]
				row["%FCG=2"] = APIts["ADM1"][i]["FCG==2"]["mean"]
				row["%FCG=3"] = APIts["ADM1"][i]["FCG==3"]["mean"]
			} else {
				row[name + "_mean"] = APIts["ADM1"][i][name]["mean"]
				row[name + "_confidence_high"] = APIts["ADM1"][i][name]["confHigh"]
				row[name + "_confidence_low"] = APIts["ADM1"][i][name]["confLow"]
			}
			
			CSVdata.push(row)
		}

	}

	// Parse the JSON back to proper CSV
	CSVstring = Papa.unparse(CSVdata)

	return CSVstring

}

function downLoadCSV(name){
	//Prep the CSV
	var c = prepCSV(name)

	//Download using filesaver.js
	var blob = new Blob([c], {type: "text/csv;charset=utf-8"});
	saveAs(blob, "mVAMdata.csv")
}


function prepPNG(name){
	// Scale the canvas
	var scaleFactor = 1
	var s = $('#svg' + name);
	$('#hiddenPNGcanvas')
	    .attr("width", s.width() * scaleFactor)
	    .attr("height", s.height() * scaleFactor);

	var canv=$('#hiddenPNGcanvas')[0];
	var SVGstring = $('#svg' + name)[0].innerHTML;
	canvgOptions = {
	    scaleWidth: s.width() * scaleFactor, 
	    scaleHeight: s.height() * scaleFactor, 
	    ignoreDimensions: false, 
	    renderCallback: canvRenderDone 
    };

	canvg(canv, SVGstring, canvgOptions);

}

function canvRenderDone(){
	var canv=$('#hiddenPNGcanvas')[0];

	var dataURL = canv.toDataURL( "image/png" );
	var data = atob( dataURL.substring( "data:image/png;base64,".length ) );

	var asArray = new Uint8Array(data.length);
	for( var i = 0, len = data.length; i < len; ++i ) {
	    asArray[i] = data.charCodeAt(i);    
	}

	var pngBlob = new Blob( [ asArray.buffer ], {type: "image/png"} );
	var pngBlobURL = URL.createObjectURL(pngBlob);

	saveAs(pngBlob, "mVAMimage.png");

}

