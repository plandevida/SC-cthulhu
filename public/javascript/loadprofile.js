function JSONize(str) {

	return str
	.replace(/([\$\w]+)\s*:/g, function(_, $1){return '"'+$1+'":'})
	.replace(/'([^']+)'/g, function(_, $1){return '"'+$1+'"'})
	.replace(/"("https|http)":/g, function(_, $1){return ''+$1+':'})
	.replace(/(')/, '"')
	.replace(/'/g, '"')
	.replace(/:\s*["|']([\$\w]+)'\s*}/g, function(_, $1){return ':"'+$1+'"}'})
}

window.onload = function() {

	var puserdata = document.getElementById('userdata');
	var userdata = puserdata.textContent;

	if (userdata && userdata != "") {
		userdata = userdata.replace(/(_id:\s*[\w]+)\s*,/g, '');
		console.log(userdata);
		var JSONi = JSONize(userdata);
		console.log(JSONi);
		userdata = JSON.parse(JSONi);
		var githubprofile = userdata['github'];

		var profilename = document.getElementById("profilename");
		profilename.textContent = githubprofile['login'];

		var profileimage = document.getElementById('profileimage');
		profileimage.src = githubprofile['avatar'];

		var profilegithuburl = document.getElementById('profilegithuburl');
		var url = profilegithuburl.children[1];
		url.setAttribute('href', githubprofile['htmlurl']);	
		url.appendChild(document.createTextNode(githubprofile['htmlurl']));

		var email = document.getElementById('email');
		email.value = userdata['email'];
	}
};
