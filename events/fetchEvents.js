var unirest = require('unirest');

module.exports = {
	fetchEvents: function(callback) {

		var request = unirest.get("https://ismaelc-hackerleague.p.mashape.com/?q=music")
		.header("X-Mashape-Key", "jqyr5MDmPbmsh978sMLLK0iLZfyUp1BYK5bjsnExeTolOC2QMl")
		//.header("X-Mashape-Key", "ccf8cUeAZMmsh8EQqS4T8O5G8yw2p1YyGOIjsnAGeP12e5pdJb")
		//.header("X-Mashape-Key", "OMh2HlAhrmmsh7allu1J7fiwV4Uop1q7OiujsnrRuy3v7oix7f")
		.header("Accept", "text/plain")

		if (callback) {
			console.log('FetchEvents.js: registrando callback');
			request.end(callback);
		}
		else {
			console.log('FetchEvents.js: callback por defecto');
			request.end(function(result) {
				console.log(result.status, result.headers, result.body);
			})
		}
	}
};
