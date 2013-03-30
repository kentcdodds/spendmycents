var User = function(userInfo) {
  var logger = require('winston')
    , UserController = require('../controller/UserController')
    , adjustedEmails = [];

  if (userInfo.fromPassport && userInfo.emails) {
    for (var i = 0; i < userInfo.emails.length; i++) {
      if (userInfo.emails[i] && userInfo.emails[i].value) {
        adjustedEmails[adjustedEmails.length] = userInfo.emails[i].value;
      } else {
        logger.log('Creating user: Ignoring email: ' + userInfo.emails[i]);
      }
    }
  } else {
    adjustedEmails = userInfo.emails;
  }

  var _id = userInfo._id,
    name = userInfo.name,
    facebookId = userInfo.facebookId,
    twitterId = userInfo.twitterId,
    googleId = userInfo.googleId,
    privilages = userInfo.privilages || 'user',
    preferenceNum = userInfo.preferenceNum || UserController.getDefaultPreferenceNum(),
    lastLogin = userInfo.lastLogin || new Date();

  this._id = function(new_Id) {
    _id = new_Id || _id;
    return _id;
  }

  this.name = function(newName) {
    name = newName || name;
    return name;
  }

  this.facebookId = function(newFacebookId) {
    name = newFacebookId|| facebookId;
    return facebookId;
  }

  this.twitterId = function(newTwitterId) {
    twitterId = newTwitterId || twitterId;
    return twitterId;
  }

  this.googleId = function(newGoogleId) {
    googleId = newGoogleId || googleId;
    return googleId;
  }

  this.privilages = function(newPrivilages) {
    privilages = newPrivilages || privilages;
    return privilages;
  }

  this.preferences = function(newPreferences) {
    if (newPreferences) {
      preferenceNum = UserController.convertPreferencesToPreferenceNumber(newPreferences);
    }
    return UserController.convertPreferenceNumberToPreferences(preferenceNum);
  }

  this.lastLogin = function(newLastLogin) {
    lastLogin = newLastLogin || lastLogin;
    return lastLogin;
  }
};

module.exports = User;