var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	github: {
		login: String,
		avatar: String,
		htmlurl: String,
		id: String,
		token: String
	},
	email: "",
	twitter: {
		id: String,
		token: String,
		tokensecret: String,
		username: String,
		displayName: String
	}
});

var eventosSchema = mongoose.Schema({
	userid: String,
	eventsSended: Array
});

module.exports = {  User : mongoose.model('User', userSchema),
					Events : mongoose.model('Events', eventosSchema)
				};
