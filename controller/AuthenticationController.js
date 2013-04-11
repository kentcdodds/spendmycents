var AuthenticationController = (function() {
  var logger = require('winston');
  var passport = require('passport');
  var UserController = require('./UserController');
  var ErrorController = require('./ErrorController');

  var authenticateTo;
  var callbackFrom;
  var configure;
  var handleAuthenticatedUser;
  var sendUnsupportedPartyError;

  authenticateTo = {
    facebook: function(req, res, next) {
      passport.authenticate('facebook')(req, res, next);
    },
    twitter: function(req, res, next) {
      passport.authenticate('twitter')(req, res, next);
    },
    google: function(req, res, next) {
      passport.authenticate('google', {
        scope: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email'
        ]
      })(req, res, next);
    }
  };

  callbackFrom = {
    facebook: function(req, res, next) {
      passport.authenticate('facebook', {
        successRedirect: '/users/me',
        failureRedirect: '/facebook-failure'
      })(req, res, next);
    },
    twitter: function(req, res, next) {
      passport.authenticate('twitter', {
        successRedirect: '/users/me',
        failureRedirect: '/twitter-failure'
      })(req, res, next);
    },
    google: function(req, res, next) {
      passport.authenticate('google', {
        successRedirect: '/users/me',
        failureRedirect: '/google-failure'
      })(req, res, next);
    }
  }


  handleAuthenticatedUser = function(accessToken, refreshToken, profile, done) {
    UserController.handleAuthenticatedUser(profile, function(error, user) {
      if (error) {
        logger.warn('There was an error with handling a ' + profile.provider + ' authenticated user!');
        logger.error(error);
        return done(error);
      } else {
        done(null, user);
      }
    });
  }

  configure = {
    facebook: function() {
      var FacebookStrategy = require('passport-facebook').Strategy;
      passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_KEY,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.BASE_URL + "/auth/facebook/callback"
      },
      handleAuthenticatedUser));
    },
    twitter: function() {
      var TwitterStrategy = require('passport-twitter').Strategy;
      passport.use(new TwitterStrategy({
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: process.env.BASE_URL + "/auth/twitter/callback"
      },
      handleAuthenticatedUser));
    },
    google: function() {
      var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

      passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.BASE_URL + "/auth/google/callback"
      },
      handleAuthenticatedUser));
    }
  }

  sendUnsupportedPartyError = function(res, provider) {
    var message = 'The third-party provider "' + provider + '" is not supported';
    var code = 400;
    ErrorController.sendErrorJson(res, code, message);
  }

  return {
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
    authenticate: function(req, res, next) {
      var authFunction = authenticateTo[req.params.provider];
      if (authFunction) {
        authFunction(req, res, next);
      } else {
        sendUnsupportedPartyError(res, req.params.provider);
      }
    },
    callback: function(req, res, next) {
      var callbackFunction = callbackFrom[req.params.provider];
      if (callbackFunction) {
        callbackFunction(req, res, next);
      } else {
        sendUnsupportedPartyError(res, req.params.provider);
      }
    }
  }
})();

module.exports = AuthenticationController;