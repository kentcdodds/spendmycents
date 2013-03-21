var User = function(name, facebookId, twitterId, googleId) {
  this.name = name;
  this.facebookId = facebookId;
  this.twitterId = twitterId;
  this.googleId = googleId;
};

module.exports = User;