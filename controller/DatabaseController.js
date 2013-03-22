var DatabaseController = function() {
  var instanceClient
  , mongo = require('mongodb')
  , openConnectionToCollection
  , getOrCreateClient
  , findOneObject;

  var createClient = function() {

    var services = JSON.parse(process.env.VCAP_SERVICES)
    , dbInfo = services['mongodb-1.8'][0]
    , server = new mongo.Server(dbInfo.credentials.host, dbInfo.credentials.port,  {auto_reconnect: false})
    , client = new mongo.Db(dbInfo.name, server, {w:1, strict: true});

    // instanceClient.authenticate(dbInfo.credentials.username, dbInfo.credentials.password, null);

    return client;
  };

  getOrCreateClient = function() {
    if (!this.instanceClient) {
      this.instanceClient = createClient();
    }
    return this.instanceClient;
  };

  openConnectionToCollection = function(collectionName, callback) {
    if (!collectionName) {
      throw 'collectionName must be defined!';
    }
    getOrCreateClient().open(function(error, client) {
      if (error) {
        callback(error, null);
        return;
      }
      callback(new mongo.Collection(client, collectionName));
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
    deleteObject: function(collectionName, query, callback) {
      openConnectionToCollection(collectionName, function(collection) {
        collection.findAndModify({
          query: query,
          remove: true,
          callback: function(err, doc) {
            collection.db.close();
            callback(err, doc);
          }
        });
      });
    }
  };
}();

module.exports = DatabaseController;
