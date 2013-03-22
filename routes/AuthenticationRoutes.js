var passport = require('passport')
  , AuthenticationController = require('../controller/AuthenticationController')
  , authenticationRoutes;

authenticationRoutes = {
  setupRoutes: function(app) {
    app.get('/auth/:provider', AuthenticationController.authenticate);
    app.get('/auth/:provider/callback', AuthenticationController.callback);
  }
}

module.exports = authenticationRoutes;