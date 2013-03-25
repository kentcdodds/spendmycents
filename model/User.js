var User = function(userInfo) {
  var logger = require('winston')
  this._id = userInfo._id;
  this.name = userInfo.name;

  if (userInfo.fromPassport && userInfo.emails) {
    this.emails = [];
    for (var i = 0; i < userInfo.emails.length; i++) {
      if (userInfo.emails[i] && userInfo.emails[i].value) {
        this.emails[this.emails.length] = userInfo.emails[i].value;
      } else {
        logger.log('Creating user: Ignoring email: ' + userInfo.emails[i]);
      }
    }
  } else {
    this.emails = userInfo.emails;
  }

  this.facebookId = userInfo.facebookId;
  this.twitterId = userInfo.twitterId;
  this.googleId = userInfo.googleId;
  this.privilages = userInfo.privilages || 'user';
  this.lastLogin = userInfo.lastLogin || new Date();
};

module.exports = User;