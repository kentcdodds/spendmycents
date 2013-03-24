var passport = require('passport')
  , AuthenticationController = require('../controller/AuthenticationController')
  , AuthenticationRoutes;

AuthenticationRoutes = {
  setupRoutes: function(app) {
    app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
    });

    app.get('/auth/:provider', AuthenticationController.authenticate);
    app.get('/auth/:provider/callback', AuthenticationController.callback);
  }
}

module.exports = AuthenticationRoutes;