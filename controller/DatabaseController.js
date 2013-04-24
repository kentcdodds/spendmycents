var DatabaseController = (function() {
  var mongo = require('mongodb');
  var logger = require('winston');
  var openConnectionToCollection;
  var getOrCreateClient;
  var deleteObjectByQuery;

  getOrCreateClient = function(callback) {
    var services = JSON.parse(process.env.VCAP_SERVICES);
    var dbInfo = services['mongodb-1.8'][0];
    var server = new mongo.Server(dbInfo.credentials.host, dbInfo.credentials.port, {auto_reconnect: false});
    var username = dbInfo.credentials.username;
    var password = dbInfo.credentials.password;
    var finishClientSetup, addAdminUser, authenticateToClient;

    var client = new mongo.Db(dbInfo.name, server, {w: 1, strict: true});

    logger.info('Client created');

    client.open(function(error, openedClient) {
      logger.info('Client opened');
      if (error) {
        throw error;
      }
      finishClientSetup(openedClient);
    });

    finishClientSetup = function(openedClient) {
      var usersCollection = new mongo.Collection(openedClient, 'system.users');
      logger.info('Looking for users in system.users');
      usersCollection.findOne({user: username}, function(error, doc) {
        if (error) {
          logger.warn('Error finding user in system.users!');
          logger.error(error);
          throw error;
        }
        if (!doc) {
          addAdminUser(openedClient);
        } else {
          authenticateToClient(openedClient);
        }
      });
    };

    addAdminUser = function(openedClient) {
      logger.info('No user found. Adding user.');
      openedClient.addUser(dbInfo.credentials.username, password, function(error, result) {
        if (!result || error) {
          logger.warn('Error adding admin user to client!');
          logger.error(error);
          throw 'Error adding admin user to client! ' + error;
        }
        authenticateToClient(openedClient);
      });
    };

    authenticateToClient = function(openedClient) {
      logger.info('Authenticating to client');
      openedClient.authenticate(username, password, function(error, result) {
        logger.info('Closing client');
        openedClient.close();
        if (result && !error) {
          logger.info('Success authenticating');
          callback(error, openedClient);
        } else {
          logger.warn('Failure in authenticating!');
          logger.error(error);
          throw 'Authentication to database failed! ' + error;
        }
      });
    };
  };

  openConnectionToCollection = function(collectionName, callback) {
    if (!collectionName) {
      throw 'collectionName must be defined!';
    }
    getOrCreateClient(function(error, receivedClient) {
      if (error) {
        throw error;
      }
      receivedClient.open(function(error, openedClient) {
        if (error) {
          callback(error, null);
        } else {
          callback(new mongo.Collection(openedClient, collectionName));
        }
      });
    });
  };

  deleteObjectByQuery = function(collectionName, query, callback) {
    openConnectionToCollection(collectionName, function(collection) {
      collection.remove(query, {save: true}, function(error, numberRemoved) {
        collection.db.close();
        callback(error, numberRemoved);
      });
    });
  };

  return {
    findAll: function(collectionName, callback) {
      openConnectionToCollection(collectionName, function(collection) {
        collection.find().toArray(function(error, docs) {
          collection.db.close();
          callback(error, docs);
        });
      });
    },
    saveObject: function(collectionName, object, callback) {
      openConnectionToCollection(collectionName, function(collection) {
        collection.save(object, {safe: true}, function(error, doc) {
          collection.db.close();
          callback(error, doc);
        });
      });
    },
    findOneObjectById: function(collectionName, idString, callback) {
      this.findOneObjectByQuery(collectionName, {_id: new mongo.ObjectID(idString)}, callback);
    },
    findOneObjectByQuery: function(collectionName, query, callback) {
      openConnectionToCollection(collectionName, function(collection) {
        collection.findOne(query, function(error, doc) {
          collection.db.close();
          callback(error, doc);
        });
      });
    },
    deleteObjectById: function(collectionName, idString, callback) {
      deleteObjectByQuery(collectionName, {_id: new mongo.ObjectID(idString)}, callback);
    }
  };
})();

module.exports = DatabaseController;
