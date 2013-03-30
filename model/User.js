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

  this._id = userInfo._id;
  this.name = userInfo.name;
  this.emails = adjustedEmails;
  this.facebookId = userInfo.facebookId;
  this.twitterId = userInfo.twitterId;
  this.googleId = userInfo.googleId;
  this.privilages = userInfo.privilages || 'user';
  this.preferenceNum = userInfo.preferenceNum || UserController.getDefaultPreferenceNumber();
  this.lastLogin = userInfo.lastLogin || new Date();

  this.preferences = function(newPreferences) {
    if (newPreferences) {
      this.preferenceNum = UserController.convertPreferencesToPreferenceNumber(newPreferences);
    }
    return UserController.convertPreferenceNumberToPreferences(this.preferenceNum);
  }

  this.getObject = function() {
    return {
      _id: this._id,
      name: this.name,
      emails: this.emails,
      facebookId: this.facebookId,
      twitterId: this.twitterId,
      googleId: this.googleId,
      privilages: this.privilages,
      preferences: this.preferences(),
      lastLogin: this.lastLogin
    }
  }
};

module.exports = User;