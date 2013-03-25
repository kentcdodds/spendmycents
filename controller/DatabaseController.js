var DatabaseController = function() {
  var mongo = require('mongodb')
    , openConnectionToCollection
    , getOrCreateClient
    , findOneObject
    , deleteObjectByQuery;

  var createClient = function(callback) {

    var services = JSON.parse(process.env.VCAP_SERVICES)
      , dbInfo = services['mongodb-1.8'][0]
      , server = new mongo.Server(dbInfo.credentials.host, dbInfo.credentials.port, {auto_reconnect: false})
      , client = new mongo.Db(dbInfo.name, server, {w: 1, strict: true})
      , authenticateToClient;

    console.log('client created');

    client.open(function(error, openedClient) {
      console.log('client opened');
      if (error) {
        throw error;
      }
      var usersCollection = new mongo.Collection(openedClient, 'system.users');
      console.log('Looking for users in system.users');
      usersCollection.findOne({user: dbInfo.credentials.username}, function(error, doc) {
        console.log('finished looking');
        if (error) {
          throw error;
        }
        if (!doc) {
          console.log('No user found. Adding user.');
          openedClient.addUser(dbInfo.credentials.username, dbInfo.credentials.password, function(error, result) {
            authenticateToClient(openedClient);
          });
        } else {
          authenticateToClient(openedClient);
        }
      });
    });

    authenticateToClient = function(openedClient) {
      console.log('Authenticating to client');
      openedClient.authenticate(dbInfo.credentials.username, dbInfo.credentials.password, function(error, result) {
        console.log('closing client');
        openedClient.close();
        if (result) {
          console.log('Success authenticating');
          callback(error, openedClient);
        } else {
          console.log('Failure in authenticating');
          throw 'Authentication to database failed!';
        }
      });
    }

  };

  getOrCreateClient = function(callback) {
    if (!this.instanceClient) {
      createClient(callback);
    } else {
      callback(null, this.instanceClient);
    }
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
          return;
        }
        callback(new mongo.Collection(openedClient, collectionName));
      });
    });
  };

  findOneObject = function(collectionName, query, callback) {
    openConnectionToCollection(collectionName, function(collection) {
      collection.findOne(query, function(error, doc) {
        collection.db.close();
        callback(error, doc);
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
      findOneObject(collectionName, {_id: new mongo.ObjectID(idString)}, callback);
    },
    findOneObjectByQuery: function(collectionName, query, callback) {
      findOneObject(collectionName, query, callback);
    },
    deleteObjectById: function(collectionName, idString, callback) {
      deleteObjectByQuery(collectionName, {_id: new mongo.ObjectID(idString)}, callback);
    }
  };
}();

module.exports = DatabaseController;
