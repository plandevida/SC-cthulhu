var express = require('express');
var router = express.Router();

/* GET users listing. */
router.use(function(req, res, next) {
	console.log('Routing in users.js: executing middleware authentication');

	ensureAuthenticated(req, res, next);
});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	console.log('No está registrado');
	res.redirect('/')
}

router.get('/map', function(req, res, next) {
  res.render('map');
});

router.get('/tweetsended', function(req, res, next) {
	res.render('tweetsended');
});

router.get('/sendtweet', function(req, res, next) {
	
	var authtwitter = require('../config/auth').twitterAuth;

	var statustweet = req.query.tweet.replace('/\s*/g', '%20');

	var Twitter = require('node-twitter');
	twitter = new Twitter.RestClient( 
		authtwitter.consumerKey,
		authtwitter.consumerSecret,
		req.user.twitter.token,
		req.user.twitter.tokensecret
	); 
 
 
	// Note that you can only direct message someone who follows you 
	twitter.statusesUpdate( 
     		{ status: statustweet
    		 //, in_reply_to_status_id: 357237590082072576 
     		},
		function (err, data) {
		
			if (err) { 
				console.error(err);
				res.send(err);
			} else { 
				console.log(data);
				res.redirect('/users/tweetsended'); 
			} 
     		} 
  	);
});

router.get('/tweet', function(req, res, next) {
	console.log(req.user.twitter.username);	

	var username = req.user.twitter.username;

	//username = 'DaniBot_';
	
	//var eventotweet = { kind: 'customsearch#result',title: 'SXSW Music Hackathon Championship | Hacker League',htmlTitle: 'SXSW <b>Music</b> Hackathon Championship | Hacker League',link: 'https://www.hackerleague.org/hackathons/sxsw-music-hackathon-championship',displayLink: 'www.hackerleague.org',snippet: 'Introducing the first annual SXSW Music Hackathon Championship, presented by \nAT&T U-verse with GigaPower, where world-class hackers and designers will ...',htmlSnippet: 'Introducing the first annual SXSW <b>Music</b> Hackathon Championship, presented by <br>\nAT&amp;T U-verse with GigaPower, where world-class hackers and designers will&nbsp;...',cacheId: '5-UKlToQL3AJ'}
	if ( eventotweet ) {
		res.render('tweet', {evento: eventotweet, twittername: username});
	}
	else {
		res.redirect('/');
	}
});
router.get('/account', function(req, res, next) {
	console.log("Usuario para el perfil\n"+req.user);

	res.render('account', {userdata: req.user});
});

var eventotweet = undefined;

router.get('/evento/*', function(req, res, next) {
	var eventoCacheId = req.params['0'];

	var eventoTweet = undefined;

	var fetchEvents = require('../events/fetchEvents');
	fetchEvents.fetchEvents(function(result) {
		console.log(result.status);
		if (result.status == 200 || result.status == '200') {
			var events = result.body['items'];
	
			if (events.length > 0) {
				for(var i in events) {
					var evento = events[i];
					if (evento.cacheId == eventoCacheId) {
						eventoTweet = evento;
						break;
					}
				}
				if (eventoTweet) {
					//res.render('tweet', {evento:evenotoTweet});
					eventotweet = eventoTweet;
					res.redirect('/twitter/passport');
				}
				else {
					res.send('Oooops el evento no se ha encontrado');
				}
			}
			else {
				res.send('Ooops no se han encontrado eventos');
			}
		}
	});
});

router.post('/account/saveemail', function(req, res, next) {

	console.log(req.body.email);
	console.log(req.user);

	var User = require('../config/mongoosemodel/user').User;
	var Events = require('../config/mongoosemodel/user').Events;

	User.findOne( { '_id': req.user['_id'] }, function(err, user) {
		if (!err && user) {
			user.email = req.body.email;

			user.save(function(err){
				if (err) {
					console.log(err);
				}
				else {
					console.log('saving new email ' + user);

					Events.findOne( { 'userid':req.user['_id'] }, function(err, events) {
						if (err) {
							console.log(err);
						}
						else if(!err && events != null ) {
							console.log('ya tiene subscripción');
						}
						else {
							console.log('creando subscripción');

							var events = new Events();
							events.userid = user['_id'];
							events.eventsSended = [];

							events.save(function(err) {
								if (err) console.log(err);
								else console.log('Subscrito');
							});
						}
					});
				}

				res.render('account', {userdata: user});
			});
		}
	});
});

router.get('/logout', function(req, res, next) {
	req.logout();
	res.redirect('/');
});
//router.get('/random', function(req, res, next) {
//	Twitter = require('node-twitter');
//	twitter = new Twitter.RestClient( 
//     'kvH6KjquAzVeaGZdHjvJ9EA7W' 
//   , 'WdX3IwcFMAYy2f4wHErF7fNQZ2OvMpjDNEPpb4GgNoGvpoQMCl'
//   , req.user.twitter.token
//   , req.user.twitter.tokensecret
//   ); 
// 
// 
//   // Note that you can only direct message someone who follows you 
//   twitter.statusesUpdate( 
//     { status: "SCCthulhu al poder" 
//     //, in_reply_to_status_id: 357237590082072576 
//     } 
//   , function (err, data) { 
//       if (err) { 
//         console.error(err); 
//	res.send(err);
//       } else { 
//         console.log(data);
//         res.redirect('/users/tweetsended'); 
//       } 
//     } 
//   ); 
//
//});
module.exports = router;
