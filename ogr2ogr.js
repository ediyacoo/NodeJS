var ogr2ogr = require('ogr2ogr'),
	fs=require("fs"),
	geojson = {
	  "type": "Feature",
	  "geometry": {
	    "type": "Point",
	    "coordinates": [125.6, 10.1]
	  },
	  "properties": {
	    "name": "Dinagat Islands"
	  }
	}
	
//var rs = fs.createReadStream('h:\nodejs\shp\WGS84_Countries.shp')

ogr2ogr(geojson).exec(function(error, data){
	if(error) {console.error(error); return;}
	
	console.log(data);
})



