var AuthenticationController
  , authenticateTo
  , callbackFrom
  , configure
  , passport = require('passport')
  , UserController = require('./UserController');

AuthenticationController = {
  setupPassport: function() {
    configure.facebook();
    configure.twitter();
    configure.google();

    passport.serializeUser(function(user, done) {
      done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
      UserController.findById(id, function(error, user) {
        done(error, user);
      });
    });
  },
};

configure = {
  facebook: function() {
    var FacebookStrategy = require('passport-facebook').Strategy;
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_KEY,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.BASE_URL + "/auth/facebook/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        UserController.handleAuthenticatedUser(profile, function(error, user) {
          if (error) {
            console.log('There was an error with handling a Facebook Authenticated User!');
            return done(error);
          }
          done(null, user);
        });
      }
    ));
  },

  twitter: function() {
    var TwitterStrategy = require('passport-twitter').Strategy;

    passport.use(new TwitterStrategy({
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: process.env.BASE_URL + "/auth/twitter/callback"
      },
      function(token, tokenSecret, profile, done) {
        UserController.handleAuthenticatedUser(profile, function(error, user) {
          if (error) {
            console.log('There was an error with handling a Twitter Authenticated User!');
            return done(error);
          }
          done(null, user);
        });
      }
    ));
  },

  google: function() {
    var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.BASE_URL + "/auth/google/callback"
  },
  function(token, tokenSecret, profile, done) {
        UserController.handleAuthenticatedUser(profile, function(error, user) {
          if (error) {
            console.log('There was an error with handling a Google Authenticated User!');
            return done(error);
          }
          done(null, user);
        });
      }
    ));
  }
}



module.exports = AuthenticationController;