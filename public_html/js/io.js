// mVAM data-API call functions

function APIpull(opt){
	/*
	Implements an mVAM API call for the dashboard
	Arguments:
		opt - required object of API arguments:
		opt["adm0"] - required string with Admin level 0 (country) name
		opt["adm1"] - option string with region name
		opt["IDP"] - true / false for IDPs, if true, opt["adm1"] must be null

	Note that this function is recursive, as multiple calls to the API
	may be required (for getting ADM0 and ADM1 data and for data paging)
	
	Data is output to global variables:
		APIresponse["ADM0"]
		APIresponse["ADM1"]
	
	API call status is stored in:
		APIstatus["general"]
		APIstatus["ADM0"]
		APIstatus["ADM1"]

	API call status is an object with the keys:
		{
			"status":"done" | "in progress",
			"regName": "region name",
			"page": int (paging number)
		}

	*/

	// Initialise the query string
	var qs = "",
		qType = ""


	//TODO - cehck if time range or IDP selector has changed
	var newTime = false,
		newIDP = false

	if (newTime){
		APIstatus["ADM0"]["regName"] = ""
		APIstatus["ADM1"]["regName"] = ""
	}

	if (newIDP){
		APIstatus["ADM0"]["regName"] = ""
		APIstatus["ADM1"]["regName"] = ""
	}


	//Check the options requested and current data state
	if(opt["adm0"] == APIstatus["ADM0"]["regName"] && APIstatus["ADM0"]["status"] == "done"){
		// All ADM0 data has been collected, look at ADM1 data
		console.log("All ADM0 data collected")

		if(opt["adm1"] == null){
			//No ADM1 data requested - update the graphs
			console.log("No ADM1 data requested, processing graphs...")
			APIresponse["ADM1"] = []
			updateGraphs()

		} else if(opt["adm1"] == APIstatus["ADM1"]["regName"] && APIstatus["ADM1"]["status"] == "done"){
			// All ADM1 data collected (update the graphs)
			console.log("All ADM1 data collected, processing graphs...")
			updateGraphs()

		} else {

			//Check which ADM1 data needs to be loaded
			if(opt["adm1"] != APIstatus["ADM1"]["regName"]){
				//New ADM1 data needed
				console.log("Now collecting ADM1 data for " + opt["adm1"])

				APIstatus["ADM1"]["regName"] = opt["adm1"]
				APIstatus["ADM1"]["page"] = 0
				APIstatus["ADM1"]["status"] = 'in progress'
			} else {
				// Still fetching data for ADM0, increment page number
				console.log("Continuing collecting ADM1 data for " + opt["adm1"])
				APIstatus["ADM1"]["page"] += 1
			}

			// Build ADM1 query string (and set query type)
			qType = "ADM1"
			qs = "ADM0_NAME = '" + opt["adm0"] + "'"
			escapedName = opt["adm1"].replace(/[']/g,"''")
			qs = qs + " AND AdminStrata = '" + escapedName + "'"
			qs = qs + " AND IndpVars = 'AdminUnits'"

		}


	} else {
		//Check which ADM0 data needs to be loaded
		if(opt["adm0"] != APIstatus["ADM0"]["regName"]){
			// Need to get new data for ADM0
			console.log("Now collecting ADM0 data for " + opt["adm0"])

			APIstatus["ADM0"]["regName"] = opt["adm0"]
			APIstatus["ADM0"]["page"] = 0
			APIstatus["ADM0"]["status"] = "in progress"
		} else {
			// Still fetching data for ADM0, increment page number
			console.log("Continuing collecting ADM0 data for " + opt["adm0"])
			APIstatus["ADM0"]["page"] += 1
		}

		// Build ADM0 (entire country) query string (and set query type)
		qType = "ADM0"
		qs = "ADM0_NAME = '" + opt["adm0"] + "'"

		if(opt["IDP"]){
			qs = qs + "AND IndpVars = 'IDP_YN' AND Demographic = 'Y'"
		} else {
			qs = qs + " AND AdminStrata = '" + opt["adm0"] + "'"
			qs = qs + " AND IndpVars = 'ADM0'"
		}
	}


	//If a query string has been set, execute it, then recurse
	if(qs != ""){
		
		console.log("Requesting " + qType + " data from API:")
		console.log("    " + qs + " | page = " + APIpage)

		var APIurl = "http://vam.wfp.org/mvam_monitoring/api.aspx"

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

		var req = $.ajax(reqOptions);

		//Success - save the data into the APIresponse object
		req.done(function(msg) {
			//Parse result and concatenate onto the response
			SVRresp = JSON.parse(msg)
			APIresponse[qType] = APIresponse[qType].concat(SVRresp)

			console.log(qType + " API Data returned ok, " + SVRresp.length + " values, total " + APIresponse[qType].length)
			
			// Check all data was returned in this page
			if(SVRresp.length >= 999 ){
				console.warn("Potentially not all data collected, getting next page")
				APIstatus[qType]["status"] = "in progress"
			} else {
				console.info("Appears to be end of data, not incrementing the page")
				APIstatus[qType]["status"] = "done"
			}

			// Recurse
			APIpull(opt)

		});
		
		//Fail - log to console and alert the user, then stop!
		req.fail(function(){
			console.warn("Error getting" + qtype + "API data")
			alert("Error getting data from the mVAM API.  Cannot continue.")
		});
	}
}
