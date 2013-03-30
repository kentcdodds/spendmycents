var UserController
  , User = require('../model/User')
  , logger = require('winston')
  , DatabaseController = require('./DatabaseController')
  , ErrorController = require('./ErrorController');

UserController = (function() {

  var findUserWithProviderId
    , createNewUser
    , userIsAdmin
    , findUserById
    , userCollectionName = 'SMC_USER'
    , preferenceArray =
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
      var user = (doc ? new User(doc) : null);
      callback(error, user);
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

  findOrCreateUser = function(profile, callback) {
    findUserWithProviderId(profile, function(error, user) {
      if (error) {
        logger.warn('There was an error finging a user with a provider id');
        logger.error(error);
        throw error;
      }
      if (!user) {
        logger.log('Creating new user');
        createNewUser(profile, callback);
      } else {
        logger.log('User found, updating lastLogin date and saving.');
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
  };



  return {
    getMe: function(req, res) {
      res.json(req.user.getObject());
    },
    getAllUsers: function(req, res) {
      DatabaseController.findAll(userCollectionName, function(error, results) {
        res.json(results);
      });
    },
    getUser: function(req, res) {
      findUserById(req.params.id, function(error, user) {
        if (error || !user) {
          ErrorController.sendErrorJson(res, 500, error);
        } else {
          res.json(user.getObject());
        }
      });
    },
    getPreferencesList: function(req, res) {
      res.json(200, preferenceArray);
    },
    handleAuthenticatedUser: function(profile, callback) {
      profile.fromPassport = true;
      findOrCreateUser(profile, callback);
    },
    findById: function(id, callback) {
      findUserById(id, callback);
    },
    updateUserPreferences: function(req, res) {
      var preferences = req.body;
      var currentUser = req.user;
      currentUser.preferences(preferences);
      DatabaseController.saveObject(userCollectionName, currentUser, function(error, updatedUser) {
        res.json(200, updatedUser);
      });
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
          ErrorController.sendErrorJson(res, 500, error);
        } else {
          res.json({response: 'Success deleting user with id ' + req.params.id});
        }
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
    convertPreferencesToPreferenceNumber: function(preferences) {
      var preferenceNumberArray = [];
      if (preferences.All === true) {
        for (var i = 0; i < preferenceArray.length; i++) {
          preferenceNumberArray[i] = 1;
        }
      } else {
        for (var i = 0; i < preferenceArray.length; i++) {
          preferenceNumberArray[i] = (preferences[preferenceArray[i]] ? 1 : 0);
        }
      }
      return preferenceNumberArray.join('');
    }
  }

})();

module.exports = UserController;