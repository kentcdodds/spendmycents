var passport = require('passport')
  , AuthenticationController = require('../controller/AuthenticationController')
  , authenticationRoutes;

authenticationRoutes = {
  setupRoutes: function(app) {
    app.get('/auth/facebook', passport.authenticate('facebook'));
    app.get('/auth/facebook/callback',
      passport.authenticate('facebook', {
        successRedirect: '/facebook-success',
        failureRedirect: '/facebook-failure'
      }));

    app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback',
      passport.authenticate('twitter', {
        successRedirect: '/twitter-success',
        failureRedirect: '/twitter-failure'
      }));

    app.get('/auth/google', passport.authenticate('google', {
        scope: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email'
        ]
      })
    );
    app.get('/auth/google/callback',
      passport.authenticate('google', {
        successRedirect: '/google-success',
        failureRedirect: '/google-failure'
      }));


  }
}

module.exports = authenticationRoutes;