var UserController = require('../controller/UserController');


UserRoutes = (function() {
  var saveUserRoute
    , isPrivilaged
    , sendUnauthorizedError
    , ErrorController = require('../controller/ErrorController');

  saveUserRoute = function(req, res) {
    if (isPrivilaged(req, null)) {
      UserController.saveUser(req, res);
    } else {
      sendUnauthorizedError(res);
    }
  }

  isPrivilaged = function(req, id) {
    return req.user && (req.user.privilages === 'admin' || req.user.id === id);
  }

  sendUnauthorizedError = function(res, asUser) {
    var message = 'Must be signed in with admin privilages' + (asUser ? ' or as the user' : '') + ' to perform this call';
    var code = 403;
    ErrorController.sendErrorJson(res, code, message);
  }

  return {
    setupRoutes: function(app) {
      app.get('/users', function(req, res) {
        if (isPrivilaged(req, null)) {
          UserController.getAllUsers(req, res);
        } else {
          sendUnauthorizedError(res);
        }
      });

      app.get('/users/me', function(req, res) {
        if (req.user) {
          UserController.getMe(req, res);
        } else {
          ErrorController.sendErrorJson(res, 403, 'Must be signed in to see this resource');
        }
      });

      app.get('/users/:id', function(req, res) {
        if (isPrivilaged(req, req.params.id)) {
          UserController.getUser(req, res);
        } else {
          sendUnauthorizedError(res, true);
        }
      });

      app.post('/users', saveUserRoute);
      app.put('/users', saveUserRoute);

      app.del('/users/:id', function(req, res) {
        if (isPrivilaged(req, req.params.id)) {
          UserController.deleteUser(req, res);
        } else {
          sendUnauthorizedError(res, true);
        }
      });
    }
  }
})();

module.exports = UserRoutes;
