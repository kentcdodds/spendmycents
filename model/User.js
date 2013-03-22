var User = function(name, facebookId, twitterId, googleId, privilages, lastLogin) {
  this.name = name;
  this.facebookId = facebookId;
  this.twitterId = twitterId;
  this.googleId = googleId;
  this.privilages = privilages;
  this.lastLogin = new Date();
};

module.exports = User;