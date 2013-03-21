var DatabaseController = function() {
  var instanceClient,
  mongo = require('mongodb');

  var createClient = function() {

    var services = JSON.parse(process.env.VCAP_SERVICES)
    , dbInfo = services['mongodb-1.8'][0]
    , server = new mongo.Server(dbInfo.credentials.host, dbInfo.credentials.port,  {auto_reconnect: false})
    , client = new mongo.Db(dbInfo.name, server, {w:1, strict: true})
    , openConnectionToCollection
    , getOrCreateClient
    , findOneObject
    , testDB;

    // instanceClient.authenticate(dbInfo.credentials.username, dbInfo.credentials.password, null);

    return client;
  };

  getOrCreateClient = function() {
    if (!this.instanceClient) {
        this.instanceClient = createClient();
    }
    return this.instanceClient;
  };

  testDB = function(req, res) {
    var client = getOrCreateClient();
    res.write('Client received\n\n');
    if (client) {
      // res.write(JSON.stringify(client, null, 2));
      res.write('\n\n');
      // res.write(client.open);
      res.write('\n\n');

      client.open(function (error, p_client) {
        res.write('client open\n\n');
        if (error) throw error;
        res.write('no errors\n\n');
        var collection = new mongo.Collection(p_client, 'test_collection');
        collection.insert({hello: 'world'}, {safe:true},
          function(err, objects) {
            if (err) console.warn(err.message);
            if (err && err.message.indexOf('E11000 ') !== -1) {
              // this _id was already inserted in the database
            }
            res.write('Inserted successfully\n\n');
            collection.find().toArray(function(err, results) {
              res.write(JSON.stringify(results, null, 2));
              client.close();
              res.write('Test complete');
              res.end();
            });
          });
      });
    } else {
      res.send('Client does not exist');
    }
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
