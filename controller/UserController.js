var UserController,
  User = require('../model/User')
  , DatabaseController = require('./DatabaseController');

UserController = (function() {

  var findUserWithProviderId
    , createNewUser
    , findUserById
    , userCollectionName = 'SMC_USER';

  findUserWithProviderId = function(profile, callback) {
    var query = {};
    query[profile.provider + 'Id'] = profile.id;
    DatabaseController.findOneObjectByQuery(userCollectionName, query, function(error, doc) {
      var user = (doc ? new User(doc) : null);
      callback(error, user);
    });
  };

  createNewUser = function(profile, callback) {
    var user = new User(
      {
        name: profile.displayName,
        emails: (profile.emails && profile.emails[0] ? profile.emails : null),
        facebookId: (profile.provider.toLowerCase() === 'facebook' ? profile.id.toString() : null),
        twitterId: (profile.provider.toLowerCase() === 'twitter' ? profile.id.toString() : null),
        googleId: (profile.provider.toLowerCase() === 'google' ? profile.id.toString() : null)
      }
    );
    DatabaseController.saveObject(userCollectionName, user, callback);
  };

  findOrCreateUser = function(profile, callback) {
    findUserWithProviderId(profile, function(error, user) {
      if (!user) {
        createNewUser(profile, callback);
      } else {
        user.lastLogin = new Date();
        DatabaseController.saveObject(userCollectionName, user, function(error, updatedUser) {
          callback(error, user);
        });
      }
    });
  };

  findUserById = function(id, callback) {
    DatabaseController.findOneObjectById(userCollectionName, id, function(error, doc) {
      var user = new User(doc);
      callback(error, user);
    });
  }

  return {
    getMe: function(req, res) {
      res.json(req.user);
    },
    getAllUsers: function(req, res) {
      DatabaseController.findAll(userCollectionName, function(error, results) {
        res.json(results);
      });
    },
    getUser: function(req, res) {
      findUserById(req.params.id, function(error, user) {
        if (error || !user) {
          res.json(500, {
            msg: 'There was an error getting user with id: ' + req.params.id,
            error: error,
            user: user
          });
        } else {
          res.json(user);
        }
      });
    },
    handleAuthenticatedUser: function(profile, callback) {
      findOrCreateUser(profile, callback);
    },
    findById: function(id, callback) {
      findUserById(id, callback);
    },
    saveUser: function(req, res) {
      var user = new User(req.body);
      findOrCreateUser(user, function(error, newUser) {
        res.json(newUser);
      })
    },
    deleteUser: function(req, res) {
      DatabaseController.deleteObjectById(userCollectionName, req.params.id, function(error, numberRemoved) {
        if (error) {
          res.json(500, {
            msg: 'There was an error deleting user with id ' + req.params.id,
            error: error
          });
        } else {
          res.json({response: 'Success deleting user with id ' + req.params.id});
        }
      });
    }
  }

})();

module.exports = UserController;