var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user:'youremail@gmail.com',
		pass:'yourpass'
	}
});

var sendmail = function(transporter, to, text, html) {

	if (!html) html = '';

	var mailOptions = {
		from: 'Cthulhu <cthulhu.subscription@cthulhu.com>',
		to: to,
		subject: 'Subscription new events',
		text: text,
		html: html
	};

	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			console.log(error);
		}
		else {
			console.log('mailSender.js: Email sended');
			console.log(info);
		}
	});
}

module.exports = { transporter: transporter, sendmail: sendmail  };

