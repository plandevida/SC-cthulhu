var express = require('express');
var router = express.Router();
var passport = require('passport');
var request = require('request');

var middlewareAuth = function(req, res, next) {
        console.log('Routing in users.js: executing middleware authentication');

        ensureAuthenticated(req, res, next);
};

function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
                return next();
        }
        console.log('No está registrado');
        res.redirect('/login')
}

/* GET home page. */
router.get('/', [middlewareAuth, function(req, res, next) {
        res.redirect('/users/map');
}]);

router.get('/about', function(req, res, next) {
	res.render('about');
});

router.get('/login', function(req, res, next) {
	res.render('index');
});
//debug only
router.get('/maptest', function(req, res, next) {
	res.render('map');
});

router.get('/github/passport', passport.authenticate('github'));

router.get('/callbackgithub', passport.authenticate('github', { faliureRedirect: '/'}), function(req, res, next) {
	console.log('logeado con passport en github');
	console.log(req.user)

	res.redirect('/users/map');
});
router.get('/twitter/passport', passport.authorize('twitter'));
router.get('/callbacktwitter',
   passport.authorize('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log("Twitter login success");
    res.redirect('/users/tweet');
  });

router.get('/markers', function(req, res, next) {
	//JSON request for markers
	res.writeHead(200, {"Content-Type": "application/json"});
	//Definicion de marcadores, infoWindows y side_Bar html
	var markers = [];
	var callbacks=0;
	var fetchEvents = require('../events/fetchEvents');
	var geocode = require('../events/geocodeEvent.js');
	if(fetchEvents) {
		fetchEvents.fetchEvents(function(result) {
			console.log('Api request: '+result.status);
			events = result.body['items'];
			//console.log(events);
			for(var i in events) {
				treatrequest();
				function treatrequest(){
					var evento = events[i];
					//console.log(evento);
					//var cacheid = evento['cacheid'];
					
					request(evento.link, function (error, response, body) {
	  					var loc ="";
	  					if (!error && response.statusCode == 200) {
	  						loc = body.substring(body.search("<div class='small'>"));
	  						loc = loc.substring(loc.search('in')+2,loc.search('</div>')-1);
	  						console.log("location: "+ loc);
	  					
							geocode.geocodeEvent(loc,function(result){
								if(result.body.status == "OK"){
									var mk = {title: evento.title, lat: result.body.results[0].geometry.location.lat, longitud: result.body.results[0].geometry.location.lng,side_bar_title: evento.htmlTitle, infoWindow: evento.snippet, cacheId: evento.cacheId};
									console.log(mk);
									markers.push(mk);				
								}
							});				
						}		
					 	markRequest();
					});
				}

			}
			function markRequest(){
				callbacks++;
				console.log(callbacks);
				if(callbacks == events.length){
					var json = JSON.stringify(markers);
					res.end(json);
				}
			}	
		});	
	}
	//}
});

module.exports = router;
