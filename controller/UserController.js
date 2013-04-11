var UserController
  , User = require('../model/User')
  , logger = require('winston')
  , DatabaseController = require('./DatabaseController')
  , ErrorController = require('./ErrorController');

UserController = (function() {

  var findUserWithProviderId
  var createNewUser;
  var userIsAdmin;
  var findOrCreateUserFromProfile;
  var saveUser;
  var findUserById;
  var updatePreferences;
  var getContextualUser;
  var userCollectionName = 'SMC_USER';
  var preferenceArray =
    [
      'All',
      'Apparel',
      'Appliances',
      'Arts And Crafts',
      'Automotive',
      'Baby',
      'Beauty',
      'Blended',
      'Books',
      'Classical',
      'Collectibles',
      'DVD',
      'Digital Music',
      'Electronics',
      'Gift Cards',
      'Gourmet Food',
      'Grocery',
      'Health Personal Care',
      'Home Garden',
      'Industrial',
      'Jewelry',
      'Kindle Store',
      'Kitchen',
      'Lawn And Garden',
      'Marketplace',
      'MP3 Downloads',
      'Magazines',
      'Miscellaneous',
      'Music',
      'Music Tracks',
      'Musical Instruments',
      'Mobile Apps',
      'Office Products',
      'Outdoor Living',
      'PC Hardware',
      'Pet Supplies',
      'Photo',
      'Shoes',
      'Software',
      'Sporting Goods',
      'Tools',
      'Toys',
      'Unbox Video',
      'VHS',
      'Video',
      'Video Games',
      'Watches',
      'Wireless',
      'Wireless Accessories'
    ];

  findUserWithProviderId = function(profile, callback) {
    var query = {};
    query[profile.provider + 'Id'] = profile.id;
    DatabaseController.findOneObjectByQuery(userCollectionName, query, function(error, doc) {
      if(error || !doc) {
        callback(error, null);
      } else {
        var user = (doc ? new User(doc) : null);
        callback(error, user);
      }
    });
  };

  createNewUser = function(profile, callback) {
    logger.log('Creating new user');
    var user = new User(
      {
        name: profile.displayName,
        fromPassport: profile.fromPassport || false,
        emails: (profile.emails && profile.emails[0] ? profile.emails : null),
        facebookId: (profile.provider.toLowerCase() === 'facebook' ? profile.id.toString() : null),
        twitterId: (profile.provider.toLowerCase() === 'twitter' ? profile.id.toString() : null),
        googleId: (profile.provider.toLowerCase() === 'google' ? profile.id.toString() : null)
      }
    );
    if (userIsAdmin(user)) {
      user.privilages = 'admin';
    }
    DatabaseController.saveObject(userCollectionName, user, callback);
  };

  userIsAdmin = function(user) {
    if (user.emails) {
      var adminEmails = JSON.parse(process.env.ADMIN_EMAILS);
      for (var i = 0; i < user.emails.length; i++) {
        for (var j = 0; j < adminEmails.length; j++) {
          if (user.emails[i] === adminEmails[j]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  findOrCreateUserFromProfile = function(profile, callback) {
    findUserWithProviderId(profile, function(error, user) {
      if (error) {
        callback(error, null);
      }
      if (!user) {
        logger.log('Creating new user');
        createNewUser(profile, callback);
      } else {
        logger.log('User found, updating lastLogin date and saving.');
        user.lastLogin = new Date();
        saveUser(null, user, function(updatedUser, error) {
          callback(error, user);
        });
      }
    });
  };

  saveUser = function(res, user, callback) {
    DatabaseController.saveObject(userCollectionName, user, function(error, updatedUser) {
      if (res && (error || !updatedUser)) {
        ErrorController.sendErrorJson(res, 500, error);
      } else if (!res && (error || !updatedUser)) {
        callback(null, error);
      } else {
        logger.log('User saved successfully');
        callback(user);
      }
    });
  };

  findUserById = function(id, callback) {
    DatabaseController.findOneObjectById(userCollectionName, id, function(error, doc) {
      if (error) {
        callback(error, null);
      } else {
        var user = new User(doc);
        callback(error, user);
      }
    });
  };

  updatePreferences = function(res, user, preferences) {
    user.preferences(preferences);
    saveUser(res, user, function(updatedUser) {
      res.json(200, updatedUser.getObject());
    });
  };

  getContextualUser = function(req, res, callback) {
    if (req.user.id === req.params.id) {
      callback(req.user);
    } else {
      findUserById(req.params.id, function(error, user) {
        if (error || !user) {
          ErrorController.sendErrorJson(res, 500, error);
        } else {
          callback(user);
        }
      });
    }
  }

  return {
    ADMIN: 'admin',
    ME: 'me',
    getMe: function(req, res) {
      res.json(req.user.getObject());
    },
    handleAuthenticatedUser: function(profile, callback) {
      profile.fromPassport = true;
      findOrCreateUserFromProfile(profile, callback);
    },
    getAllUsers: function(req, res) {
      DatabaseController.findAll(userCollectionName, function(error, results) {
        res.json(results);
      });
    },
    getUser: function(req, res) {
      getContextualUser(req, res, function(user) {
        res.json(user.getObject());
      });
    },
    getUsersPreferences: function(req, res) {
      getContextualUser(req, res, function(user) {
        res.json(user.preferences());
      });
    },
    getPreferencesList: function(req, res) {
      res.json(200, preferenceArray);
    },
    findById: function(id, callback) {
      findUserById(id, callback);
    },
    updateUserPreferences: function(req, res) {
      var preferences = req.body;
      getContextualUser(req, res, function(user) {
        updatePreferences(res, user, preferences);
      });
    },
    saveUser: function(req, res) {
      var user = new User(req.body);
      saveUser(res, user, function(updatedUser) {
        res.json(user);
      });
    },
    deleteUser: function(req, res) {
      var logoutMessage;
      DatabaseController.deleteObjectById(userCollectionName, req.params.id, function(error, numberRemoved) {
        if (error) {
          ErrorController.sendErrorJson(res, 500, error);
        } else {
          if (req.params.id === req.user.id) {
            req.logout();
            logoutMessage = 'This was you. Your session has ended.';
          }
          res.json({response: 'Success deleting user with id ' + req.params.id + ((logoutMessage) ? '. ' + logoutMessage : '')});
        }
      });
    },
    getUserFavorites: function(req, res) {
      getContextualUser(req, res, function(user) {
        res.json(user.favorites);
      });
    },
    addUserFavorites: function(req, res) {
      getContextualUser(req, res, function(user) {
        user.favorites = user.favorites.concat(req.query.ids.split(','));
        saveUser(res, user, function(updateduser) {
          res.json(user.favorites);
        });
      });
    },
    replaceUserFavorites: function(req, res) {
      getContextualUser(req, res, function(user) {
        user.favorites = req.query.ids.split(',');
        saveUser(res, user, function(updateduser) {
          res.json(user.favorites);
        });
      });
    },
    deleteUserFavorites: function(req, res) {
      getContextualUser(req, res, function(user) {
        user.favorites = [];
        saveUser(res, user, function(updateduser) {
          res.json(user.getObject());
        });
      });
    },
    getDefaultPreferences: function() {
      var preferences = {};
      for (var i = 0; i < preferenceArray.length; i++) {
        preferences[preferenceArray[i]] = true;
      }
      return preferences;
    },
    getDefaultPreferenceNumber: function() {
      return this.convertPreferencesToPreferenceNumber(this.getDefaultPreferences());
    },
    convertPreferenceNumberToPreferences: function(preferenceNumber) {
      var preferences = this.getDefaultPreferences();
      var preferenceNumberArray = preferenceNumber.split('');
      for (var i = 0; i < preferenceArray.length && i < preferenceNumberArray.length; i++) {
        preferences[preferenceArray[i]] = (preferenceNumberArray[i] === '1');
      }
      return preferences;
    },
    convertPreferencesToPreferenceNumber: function(preferences, defaultPreferenceNumber) {
      var preferenceNumberArray = [];
      var defaultPreferenceNumberArray = ((defaultPreferenceNumber) ? defaultPreferenceNumber.split('') : []);
      var preferenceValue = 1;
      if (preferences.All === true) {
        for (var i = 0; i < preferenceArray.length; i++) {
          preferenceNumberArray[i] = 1;
        }
      } else {
        for (var i = 0; i < preferenceArray.length; i++) {
          if (preferences.hasOwnProperty(preferenceArray[i])) {
            preferenceValue = ((preferences[preferenceArray[i]]) ? 1 : 0);
          } else {
            preferenceValue = defaultPreferenceNumberArray[i] || 1;
          }
          preferenceNumberArray[i] = preferenceValue;
        }
      }
      return preferenceNumberArray.join('');
    }
  }

})();

module.exports = UserController;