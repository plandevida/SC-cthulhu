var unirest = require('unirest');
var key = require('../config/gMapsAPI/api-key.js');

module.exports = {
	geocodeEvent: function(address,callback) {

		var request = unirest.get("https://maps.googleapis.com/maps/api/geocode/json?address="+address+"&sensor=false&key="+key.gMapsAPI.key)

		if (callback) {
			console.log('GeocodeEvent.js: registrando callback');
			request.end(callback);
		}
		else {
			console.log('GeocodeEvent.js: callback por defecto');
			request.end(function(result) {
				console.log(result.status, result.headers, result.body);
			})
		}
	}
};
