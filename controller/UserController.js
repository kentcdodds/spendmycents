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
      'all',
      'apparel',
      'appliances',
      'artsandcrafts',
      'automotive',
      'baby',
      'beauty',
      'blended',
      'books',
      'classical',
      'collectibles',
      'digitalmusic',
      'grocery',
      'dvd',
      'electronics',
      'healthpersonalcare',
      'homegarden',
      'industrial',
      'jewelry',
      'kindlestore',
      'kitchen',
      'lawnandgarden',
      'magazines',
      'marketplace',
      'merchants',
      'miscellaneous',
      'mobileapps',
      'mp3downloads',
      'music',
      'musicalinstruments',
      'musictracks',
      'officeproducts',
      'outdoorliving',
      'pchardware',
      'petsupplies',
      'photo',
      'shoes',
      'software',
      'sportinggoods',
      'tools',
      'toys',
      'unboxvideo',
      'vhs',
      'video',
      'videogames',
      'watches',
      'wireless',
      'wirelessaccessories'
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
  };



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
          ErrorController.sendErrorJson(res, 500, error);
        } else {
          res.json(user);
        }
      });
    },
    handleAuthenticatedUser: function(profile, callback) {
      profile.fromPassport = true;
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
          ErrorController.sendErrorJson(res, 500, error);
        } else {
          res.json({response: 'Success deleting user with id ' + req.params.id});
        }
      });
    },
    getDefaultPreferenceNumber: function() {
      return this.convertPreferencesToPreferenceNumber({
        all: true,
        apparel: true,
        appliances: true,
        artsandcrafts: true,
        automotive: true,
        baby: true,
        beauty: true,
        blended: true,
        books: true,
        classical: true,
        collectibles: true,
        digitalmusic: true,
        grocery: true,
        dvd: true,
        electronics: true,
        healthpersonalcare: true,
        homegarden: true,
        industrial: true,
        jewelry: true,
        kindlestore: true,
        kitchen: true,
        lawnandgarden: true,
        magazines: true,
        marketplace: true,
        merchants: true,
        miscellaneous: true,
        mobileapps: true,
        mp3downloads: true,
        music: true,
        musicalinstruments: true,
        musictracks: true,
        officeproducts: true,
        outdoorliving: true,
        pchardware: true,
        petsupplies: true,
        photo: true,
        shoes: true,
        software: true,
        sportinggoods: true,
        tools: true,
        toys: true,
        unboxvideo: true,
        vhs: true,
        video: true,
        videogames: true,
        watches: true,
        wireless: true,
        wirelessaccessories: true
      });
    },
    convertPreferenceNumberToPreferences: function(preferenceNumber) {
      var preferences = {};
      return preferences;
    },
    convertPreferencesToPreferenceNumber: function(preferences) {
      var preferenceNumber = -1;
      return preferenceNumber;
    }
  }

})();

module.exports = UserController;