var mongoose = require('mongoose');
var configDB = require('../config/mongoosemodel/database');

mongoose.connect(configDB.url);

var userSchema = require('../config/mongoosemodel/user');
var User = userSchema.User;
var Events = userSchema.Events;

var mail = require('./mailSender');

console.log('mailProcess.js: Subsistema de email corriendo');

var fetchEvents = require('../events/fetchEvents');
// TESTING (change) -> var eventsCache = [];
//var eventsCache = [ {'title': 'Evento 1', 'cacheId':'asdfasdf'}, {'title': 'Evento 2', 'cacheId':'fadsfdas'}];
// --
var eventsCache = [];

if(fetchEvents) {
	fetchEvents.fetchEvents(function(result) {
		if (result.body['items']) {
			eventsCache = result.body['items'];
		}
		console.log('mailProcess.js: Estatus code ' + result.status);
		console.log(eventsCache);
		
		// TESTING (delete)
		//	if ( eventsCache && eventsCache.length > 0) {
		//		console.log('borrando el último elemento');
		//		console.log(eventsCache.splice(-1, 1));	
		//		console.log('borrado el último elemento');
		//		 console.log(eventsCache);
		//	}
		// --
		
		console.log('mailProcess.js: Proxima comprobación en 5 minutos');
		setInterval(function() {
			console.log('mailProcess.js: comporbando eventos nuevos');
			
			var newEvents = [];
			var eventsForMail = [];

			fetchEvents.fetchEvents(function(result) {
				newEvents = result.body['items'];

				// TESTING (delete)
				// if (!newEvents || newEvents.length == 0) {
				 	console.log('populando nuevos eventos');
				 	newEvents = [{'title': 'Evento de prueba'+String(Math.random()), 'cacheId':String(Math.random())}];
				// }
				// --

				for(var i in newEvents) {
					var evento = newEvents[i];
					var cacheid = evento['cacheId'];
						
					// console.log('evento a comprobar: ' + cacheid);						
					var inCache = true;
					for( var j in eventsCache ) {
						var eventCached = eventsCache[j];
						var cacheidCached = eventCached['cacheId'];
					
						// console.log('comprobando con: '+cacheidCached);

						if (cacheid == cacheidCached) {
							inCache = true;
							// console.log('mailProcess.js: Evento ya en cache');
							break;
						}
						else {
							inCache = false;
							// console.log('mailProcess.js: Evento diferente');
						}
					}
					
					if ( !inCache ) {
						// console.log('mailProcess.js: Evento registrado');
						eventsForMail[eventsForMail.length] = evento;
						eventsCache[eventsCache.length] = evento;
					}
				}
				
				console.log('mailProces.js: eventos para enviar por email');
				console.log(eventsForMail);
		
				if (eventsForMail.length > 0) {

					// console.log('buscando usuarios');
					
					// Solo los usuarios que tengan un email
					User.find({email: { '$ne':null, '$ne':"" }}, function(err, users) {

						if (err) console.log(err);
						else if (!err && users) {

							console.log('usuarios:')
							console.log(users);

							for (var i in users) {

								// CUANTO PUEDES ODIAR A JAVASCRIPT Y SUS MIERDAS :D
								checkusers();
								function checkusers() {

									var u = users[i];
									 console.log('usuario: ' + u.github.login);
									// console.log(u);
									// Solo si tiene un email está suscrito
									if (u.email && u.email != "") {

										var userid = u['_id'];

										Events.findOne( { 'userid':userid }, function(err, evento) {

											if (err) console.log(err);
											else if (!err && evento) {

												console.log(evento);
												var eventList = evento.eventsSended;
											
												var toSend = [];
												for(var j in eventsForMail) {
													var ev = eventsForMail[j];
													var cacheid = ev['cacheId'];

													// console.log('evento a comparar con los del usuario: ' + cacheid);

													var sended = true;
													for(var k in eventList) {
														var cachid = eventList[k]['cacheId'];

														// console.log('evento comparado: ' + cachid);

														if (cacheid == cachid) {
															sended = true;
															// console.log('Evento ya enviado');
															break;
														}
														else {
															sended = false;
															// console.log('No coincide');
														}
													}

													if (!sended) {
														console.log('mailProcess.js: Evento para enviar al usuario: ' + u.github.login);
														toSend.push(ev);
													}
												}

												if( toSend.length > 0) {

													var text = "";
													for(var n in toSend) {
														var even = toSend[n];

														evento.eventsSended.push(even);
														text = text.concat(even['title']+'\n');
													}

													evento.save(function(err) {
														if (err) console.log(err);
														else console.log('eventos guardados, usuario:' + u.github.login);
													});

													console.log('mailProcess.js: Enviando email');
													console.log('Texto: ' + text);
													mail.sendmail(mail.transporter, u.email, text);
												}
												else {
													console.log('Nada que enviar al usuario: ' + u.github.login);
												}
											}
											else {
												console.log('mailProces.js: no hay eventos registrados para este usuario');

												var events = new Events();
												events.userid = userid;
												events.eventsSended = eventsCache;

												events.save(function(err) {
													if (err) console.log(err);
													else console.log('mailProcess.js: eventos guardados en el usuario por primera vez');
												});

												var text = "";
												for(var j in eventsCache) {
													var ev = eventsCache[j];
													var title = ev['title'];
													text = text.concat(title+'\n');
												}

												console.log('mailProcess.js: Enviando email a: ' + u.github.login);
												console.log('Texto: ' + text);
												mail.sendmail(mail.transporter, u.email, text);
											}
										});
									}
									else {
										console.log('mailProcess.js: usuario no suscrito');
									}
								}
							}
						}
					});
				}
			});

			console.log("mailProcess.js: Proxima comprobación en 5 minutos");
		}, 300000);
	});
}
else {
	console.log('mailProcess.js: No se han cargado bien los eventos');
}

