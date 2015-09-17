var run = function() {

	var childprocess = require('child_process');

	var mailProcess = childprocess.spawn('node',['subscription/mailProcess.js'] , {
		stdio: 'inherit',
	});

	mailProcess.on('close', function(code) {
		console.log('Parando servicio de mail');
	});
}

module.exports = run;