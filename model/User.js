var $ = require('jquery')
, cleanEmails
, User;

cleanEmails = function(emails) {
  var cleanedEmails = [];
  for (var i = 0; i < emails.length; i++) {
    if (emails[i] && emails[i].value) {
      cleanedEmails[cleanedEmails.length] = emails[i];
    } else {
      console.log('ignoring:' + emails[i]);
    }
  }
  return cleanedEmails;
}

User = function(userInfo) {
  this.id = userInfo.id;
  this.name = userInfo.name;
  this.emails = (userInfo.emails ? cleanEmails(userInfo.emails) : null);
  this.facebookId = userInfo.facebookId;
  this.twitterId = userInfo.twitterId;
  this.googleId = userInfo.googleId;
  this.privilages = userInfo.privilages || 'user';
  this.lastLogin = userInfo.lastLogin || new Date();
};

module.exports = User;