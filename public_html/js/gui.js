function selectorInit(){
	// Fill in selctors with metaData
	$('#ADM0select').empty()
	$('#ADM0select').append('<option value="null">Select a country</option>')

	for(var i=0; i<regioMeta.adm0.length; i++){
		adm0Name = regioMeta.adm0[0].name
		optionTag = '<option value="' + i + '">' + adm0Name + '</option>'
		$('#ADM0select').append(optionTag)
	}

	// Reset the admin 1 selector (blank)
	resetAdmin1()
}


function selectAdmin0(){
	// Reset admin 1 selector
	$('#ADM1select').empty()
	$('#ADM1select').append('<option value="null">Select a region</option>')
	$('#ADM1select').val("null")

	if($('#ADM0select').val() != 'null'){
		
		var j = $('#ADM0select').val()
		for (var i=0; i<regioMeta.adm0[j].adm1.length; i++) {
			adm1Name = regioMeta.adm0[j].adm1[i]
			optionTag = '<option value="' + i + '">' + adm1Name + '</option>'
			$('#ADM1select').append(optionTag)
		}		

		// Load any maps
		loadDashboard()

	} else {
		// Null selected
		resetAdmin1()
	}	
}

function selectAdmin1(){
	// Load the dashboard for the selection
	if($('#ADM1select').val() != 'null'){
		loadDashboard()

		colourMap()
	}
}

function getSelectedRegion(){
		var c = $('#ADM0select').val()
		var r = $('#ADM1select').val()
		var regName = regioMeta.adm0[c].shapeFile_adm1[r]

		return regName
}

function resetAdmin1(){
	$('#ADM1select').empty()
	$('#ADM1select').append('<option value="null"></option>')
	$('#ADM1select').val("null")
}

function mapClick(d){
	var c = $('#ADM0select').val()
	var regName = d.properties.name.replace(/ /g, '_')
	var r = regioMeta.adm0[c].shapeFile_adm1.indexOf(regName)
	$('#ADM1select').val(r)

	selectAdmin1()
}