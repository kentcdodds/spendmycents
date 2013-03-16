var passport = require('passport')
  , AuthenticationController = require('../controller/AuthenticationController')
  , authenticationRoutes;

authenticationRoutes = {
  setupRoutes: function(app) {
    app.get('/auth/facebook', passport.authenticate('facebook'));
    app.get('/auth/facebook/callback',
      passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/'
      }));
  }
}

module.exports = authenticationRoutes;