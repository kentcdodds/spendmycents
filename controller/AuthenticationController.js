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
      done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
      UserController.findById(id, function(err, user) {
        done(err, user);
      });
    });
  },

  authenticate: function(req, res) {
    var authFunction = authenticateTo[req.params.provider];
    if (authFunction) {
      authFunction(req, res);
    }
  },
 
  callback: function(req, res) {
    res.send('hello');
    var callbackFunction = callbackFrom[req.params.provider];
    if (callbackFunction) {
      callbackFunction(req, res);
    }
  }

}

authenticateTo = {
  facebook: function(req, res) {
    passport.authenticate('facebook');
  },
  
  twitter: function(req, res) {

  },
  
  google: function(req, res) {

  }
};

callbackFrom = {
  facebook: function(req, res) {
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/'
      });
  }
}

configure = {
  facebook: function() {
    var FacebookStrategy = require('passport-facebook').Strategy;
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_KEY,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.BASE_URL + "/auth/facebook/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        UserController.findOrCreate({id: profile.id, provider: profile.provider}, function(err, user) {
          if (err) { return done(err); }
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
        UserController.findOrCreate({id: profile.id, provider: profile.provider}, function(err, user) {
          if (err) { return done(err); }
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
        UserController.findOrCreate({id: profile.id, provider: profile.provider}, function(err, user) {
          if (err) { return done(err); }
          done(null, user);
        });
      }
    ));
  }
}



module.exports = AuthenticationController;