var UserController = {
  findOrCreate: function(userInfo, callback) {
    //userInfo.provider is the social network the user is on
    //userInfo.id is the id of the user on that social network
    callback(null, userInfo);
  },

  findById: function(id, callback) {
    //search the database for a user with that id
    callback(null, id);
  }
}

module.exports = UserController;