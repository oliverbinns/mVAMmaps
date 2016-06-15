// Dashboard control functions

function loadDashboard() {
	// Get the current selection
	adm0ID = $('#ADM0select').val()
	adm1ID = $('#ADM1select').val()

	mapData = {}
	mapData["file"] = regioMeta.adm0[adm0ID].mapFile
	mapData["tName"] =regioMeta.adm0[adm0ID].topologyName
	
	// Check if country map is already loaded (i.e. only an admin1 change)
	if($('#map-' + mapData["tName"]).length == 0){
		$('#mapHolder').empty()
		loadMap(mapData)
	}

	// Pull the API data (triggers graph redraw)
	opt = {}
	opt["adm0"] = regioMeta.adm0[adm0ID].name
	opt["adm1"] = regioMeta.adm0[adm0ID].adm1[adm1ID]
	
	APIresponse = []
	APIpage = 0
	APIpull(opt)
}

function initGraphs(){
	// Draw initial (empty) graph objects

}

function updateGraphs(){
	// Update graph objects with new data

}

