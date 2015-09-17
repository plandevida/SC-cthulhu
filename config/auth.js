// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    githubAuth : {
        'clientID'      : '', // your App ID
        'clientSecret'  : '', // your App Secret
        'callbackURL'   : 'http://vps79999.ovh.net/callbackgithub'
    },
    twitterAuth : {
    	'consumerKey' : '',
    	'consumerSecret' :'',
    	'ownerID' :  '3284669572'
    }

};
