'use strict';

var UserRoutes = (function() {
  var saveUserRoute;
  var isPrivilaged;
  var handleAuthorization;
  var sendUnauthorizedError;
  var handleUserId;
  var idIsMe;
  var idEqualsUserId;
  var userIsAdmin;
  var idParamExists;
  var userIdExists;
  var userIdAndIdParamExist;
  var userIdOrIdParamExist;
  var userPrivilagesExists;
  var ErrorController = require('../controller/ErrorController');
  var UserController = require('../controller/UserController');


  handleAuthorization = function(req, res, asUser, callback) {
    if (!isPrivilaged(req)) {
      sendUnauthorizedError(res, asUser);
    } else {
      callback(req, res);
    }
  };

  saveUserRoute = function(req, res) {
    handleAuthorization(req, res, false);
    UserController.saveUser(req, res);
  };
  
  isPrivilaged = function(req) {
    if (userIdOrIdParamExist(req)) {
      return userIsAdmin(req) || idEqualsUserId(req);
    }
  };

  sendUnauthorizedError = function(res, asUser) {
    var message = 'Must be signed in with ' + UserController.ADMIN + ' privilages' + (asUser ? ' or as the user' : '') + ' to perform this call';
    var code = 403;
    ErrorController.sendErrorJson(res, code, message);
  };

  handleUserId = function(req) {
    if (userIdExists(req) && idIsMe(req)) {
      req.params.id = req.user._id.toString();
    }
  };

  idIsMe = function(req) {
    return req.params.id.toLowerCase() === UserController.ME;
  };

  idEqualsUserId = function(req) {
    return idParamExists(req) && userIdExists(req) && req.params.id === req.user._id.toString();
  };

  userIsAdmin = function(req) {
    return userPrivilagesExists(req) && req.user.privilages === UserController.ADMIN;
  };

  idParamExists = function(req) {
    return req.params.hasOwnProperty('id') && req.params.id;
  };

  userIdExists = function(req) {
    return req.hasOwnProperty('user') && req.user.hasOwnProperty('_id') && req.user._id;
  };

  userPrivilagesExists = function(req) {
    return req.hasOwnProperty('user') && req.user.hasOwnProperty('privilages');
  };

  userIdAndIdParamExist = function(req) {
    return idParamExists(req) && userIdExists(req);
  };

  userIdOrIdParamExist = function(req) {
    return idParamExists(req) || userIdExists(req);
  };

  return {
    setupRoutes: function(app) {
      app.get('/users', function(req, res) {
        handleAuthorization(req, res, false, UserController.getAllUsers);
      });

      app.post('/users', saveUserRoute);
      app.put('/users', saveUserRoute);

      app.get('/users/preferences', function(req, res) {
        UserController.getPreferencesList(req, res);
      });

      app.get('/users/:id', function(req, res) {
        if (idIsMe(req) && !userIdExists(req)) {
          ErrorController.sendErrorJson(res, 200, 'User not logged in.');
        } else {
          if (idIsMe(req) && req.hasOwnProperty('user')) {
            UserController.getMe(req, res);
          } else {
            handleUserId(req);
            handleAuthorization(req, res, true, UserController.getUser);
          }
        }
      });

      app.del('/users/:id', function(req, res) {
        handleUserId(req);
        handleAuthorization(req, res, true, UserController.deleteUser);
      });

      app.get('/users/:id/preferences', function(req, res) {
        handleUserId(req);
        handleAuthorization(req, res, true, UserController.getUsersPreferences);
      });

      app.post('/users/:id/preferences', function(req, res) {
        handleUserId(req);
        handleAuthorization(req, res, true, UserController.setUserPreferences);
      });

      app.put('/users/:id/preferences', function(req, res) {
        handleUserId(req);
        handleAuthorization(req, res, true, UserController.updateUserPreferences);
      });

      app.get('/users/:id/favorites', function(req, res) {
        var functionToCall = UserController.getUserFavorites;
        handleUserId(req);
        if (req.query.ids) {
          functionToCall = UserController.getUserFavoritesNumbers;
        }
        handleAuthorization(req, res, true, functionToCall);
      });

      app.post('/users/:id/favorites', function(req, res) {
        handleUserId(req);
        handleAuthorization(req, res, true, UserController.setUserFavoritesNumbers);
      });

      app.put('/users/:id/favorites', function(req, res) {
        handleUserId(req);
        handleAuthorization(req, res, true, UserController.addUserFavoritesNumbers);
      });

      app.del('/users/:id/favorites', function(req, res) {
        handleUserId(req);
        handleAuthorization(req, res, true, UserController.deleteUserFavoritesNumbers);
      });
    }
  };
})();

module.exports = UserRoutes;
