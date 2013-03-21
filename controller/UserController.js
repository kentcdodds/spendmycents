var UserController
, User = require('../model/User')
, DatabaseController = require('./DatabaseController');

 UserController = (function() {

  var findUserWithProviderId
  , createNewUser
  , findOrCreateUserWithProviderId
  , findUserById
  , userCollectionName = 'SMC_USER';

  findUserWithProviderId = function(profile, callback) {
    var query = {};
    query[profile.provider + 'Id'] = profile.id;
    DatabaseController.findOneObject(userCollectionName, query, callback);
  };

  createNewUser = function(profile, callback) {
    var user = new User(
      profile.displayName
      , (profile.provider.toLowerCase() === 'facebook' ? profile.id : null)
      , (profile.provider.toLowerCase() === 'twitter' ? profile.id : null)
      , (profile.provider.toLowerCase() === 'google' ? profile.id : null)
    );
    DatabaseController.saveObject(userCollectionName, user, callback);
  };

  findOrCreateUser = function(profile, callback) {
    findUserWithProviderId(profile, function(error, user) {
      if (!user) {
        createNewUser(profile, callback);
      } else {
        callback(error, user);
      }
    });
  };

  findUserById = function(id, callback) {
    DatabaseController.findOneObject(userCollectionName, {_id: id}, callback);
  }

  return {

    getAllUsers: function(req, res) {
      DatabaseController.findAll(userCollectionName, function(error, results) {
        res.json(results);
      });
    },

    getUser: function(req, res) {
      findUserById(req.params.id, function(error, user) {
        console.log(JSON.stringify({
          error: error,
          user: user
        }, null, 2));
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
      var user = new User({
          name: req.body.name,
          facebookId: req.body.facebookId,
          twitterId: req.body.twitterId,
          googleId: req.body.googleId
        });
      findOrCreateUser(user, function(error, newUser) {
        res.json(newUser);
      })
    },

    deleteUser: function(req, res) {
      DatabaseController.deleteObject(userCollectionName, res.params.id, function(error, object) {
        if (error) {
          res.json(500, {
            msg: 'There was an error deleting user with id ' + res.params.id,
            error: error
          });
        } else {
          res.json({response: 'Success deleting user with id ' + res.params.id});
        }
      });
    }
  }

})();

module.exports = UserController;