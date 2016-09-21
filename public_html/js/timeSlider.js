function initTimeSlider(){
	$("#timeSlider").dateRangeSlider({
		bounds: {min: minSelectableDate, max: moment().toDate()},
		defaultValues: {min: minSelectableDate, max: moment().toDate()},
		step:{months: 1},
		formatter:function(val){
	        var month = val.getMonth() + 1,
	          year = val.getFullYear();
	        return  year + "-" + month;
	      }
	});

	$("#timeSlider").bind("userValuesChanged", function(e, data){
	  console.log("New date selected:" + JSON.stringify(getTimeSliderVals()));
	});

}

function getTimeSliderVals(){
	var vals = $('#timeSlider').dateRangeSlider("values"),
		retVals = {}

	retVals["yearStart"] = moment(vals.min).year()
	retVals["monthStart"] = moment(vals.min).month() + 1
	retVals["yearEnd"] = moment(vals.max).year()
	retVals["monthEnd"] = moment(vals.max).month() + 1
	return retVals
}