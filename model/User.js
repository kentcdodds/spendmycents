var User = function(name, facebookId, twitterId, googleId, privilages) {
  this.name = name;
  this.facebookId = facebookId;
  this.twitterId = twitterId;
  this.googleId = googleId;
  this.privilages = privilages;
};

module.exports = User;