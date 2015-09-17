// config/passport.js

// load all the things we need
var GitHubStrategy   = require('passport-github').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

// load the auth variables
var configAuth = require('./auth');

// model stuff
var User = require('./mongoosemodel/user').User;

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            if(!err) done(null, user);
            else done(err);
        });
    });
    // =========================================================================
    // TWITTER  AUTHORIZATION===================================================
    // =========================================================================
     passport.use(new TwitterStrategy({

        consumerKey     : configAuth.twitterAuth.consumerKey,
        consumerSecret  : configAuth.twitterAuth.consumerSecret,
        //callbackURL     : configAuth.twitterAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, tokenSecret, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.twitter.token) {
                            user.twitter.token       = token;
			    user.twitter.tokensecret = tokenSecret;
                            user.twitter.username    = profile.username;
                            user.twitter.displayName = profile.displayName;

                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        var newUser                 = new User();

                        newUser.twitter.id          = profile.id;
			newuser.twitter.tokensecret = tokenSecret;
                        newUser.twitter.token       = token;
                        newUser.twitter.username    = profile.username;
                        newUser.twitter.displayName = profile.displayName;

                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user                 = req.user; // pull the user out of the session

                user.twitter.id          = profile.id;
                user.twitter.token       = token;
		user.twitter.tokensecret = tokenSecret;
                user.twitter.username    = profile.username;
                user.twitter.displayName = profile.displayName;

                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
                console.log(user);
            }

        });
        
    }));



    // =========================================================================
    // GITHUB LOGIN=============================================================
    // =========================================================================
    passport.use(new GitHubStrategy({

        clientID     : configAuth.githubAuth.clientID,
        clientSecret : configAuth.githubAuth.clientSecret,
        callbackURL  : configAuth.githubAuth.callbackURL

    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {

            User.findOne({ 'github.id': profile.id }, function(err, user) {
                if (err) {
                    console.log(err);
                    done(err);
                }
                if(!err && user != null) {
                    console.log('user exists: ' + user);
                    done(null, user);
                }
                else {
                    if (profile) {
                        console.log("Github profile:\n");
                        console.log(profile);

                        var jsonProfiledata = profile['_json'];

                        var newuser = new User();
                        newuser.github.id = jsonProfiledata['id'];
                        newuser.github.login = jsonProfiledata['login'];
                        newuser.github.avatar = jsonProfiledata['avatar_url'];
                        newuser.github.htmlurl = jsonProfiledata['html_url'];
                        newuser.github.token = accessToken;

                        console.log("New user to save:\n"+newuser);

                        newuser.save(function(err){
                            if (err) {
                                console.log(err);
                            }
                            else {
                                console.log('saving user ' + newuser);
                                done(null, newuser);
                            }
                        });
                    }
                }
            });
        });
    }));
};
