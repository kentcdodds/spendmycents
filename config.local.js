var config = (function() {
  var configObject
    , appPort = 3000
    , protocol = 'http'
    , domain = 'local.spendmycents.com'
    , baseURL = protocol + '://' + domain + ':' + appPort

    , getDatabase = function() {
    var username = 'LocalMongoUsername'
      , password = 'LocalMongoPassword'
      , name = 'spendmycentsdb'
      , dbPort = 27017
      , db = 'db';
    return {
      "mongodb-1.8": [
        {
          name: "mongoDB",
          label: "mongodb-1.8",
          plan: "free",
          tags: [
            "mongodb",
            "mongodb-1.8",
            "nosql",
            "mongodb-1.8",
            "mongodb"
          ],
          credentials: {
            hostname: domain,
            host: domain,
            port: dbPort,
            username: username,
            password: password,
            name: name,
            db: db,
            url: "mongodb://" + username + ":" + password + "@" + baseURL + ":" + dbPort + "/" + db
          }
        }
      ]
    }
  };

  configObject = {
    env: {
      port: appPort,
      baseURL: baseURL,
      adminEmails: [
        "me@kentcdodds.com",
        "kent@doddsfamily.us",
        "mack.cope@gmail.com"
      ],
      twitter: {
        key: "DkBC6oU8qesnPgJ2vrzfDA",
        secret: "mwmBPH4NUpWCjkNMVk6i6X4SyDX7A449r8JDbaEBCQg"
      },
      google: {
        id: "825342467969.apps.googleusercontent.com",
        secret: "RtH1BJ7CqdUQ6KP6Q0wuzzE5",
        key: "AIzaSyAYHK6vhBE7F3rJMQC2-NS-PI9OsLB7UFQ"
      },
      amazon: {
        key: "AKIAIZJAGS6K4VTM3ZNA",
        secret: "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",
        associateId: "spmyce-20"
      },
      facebook: {
        key: "553468694687494",
        secret: "82cbc58709854b6eef370adfa211ddfe",
        namespace: "spendmycents"
      },
      database: getDatabase(),
      setupEnvironmentVariables: function() {
        process.env.PORT = this.port;
        process.env.BASE_URL = this.baseURL;

        process.env.AMZ_ACCESS_KEY_CODE = this.amazon.key;
        process.env.AMZ_SECRET_ACCESS_KEY = this.amazon.secret;
        process.env.AMZ_ASSOCIATE_ID = this.amazon.associateId;

        process.env.TWITTER_CONSUMER_KEY = this.twitter.key;
        process.env.TWITTER_CONSUMER_SECRET = this.twitter.secret;

        process.env.GOOGLE_CLIENT_ID = this.google.id;
        process.env.GOOGLE_CLIENT_SECRET = this.google.secret;
        process.env.GOOGLE_API_KEY = this.google.key;

        process.env.FACEBOOK_APP_KEY = this.facebook.key;
        process.env.FACEBOOK_APP_SECRET = this.facebook.secret;
        process.env.FACEBOOK_APP_NAMESPACE = this.facebook.namespace;

        process.env.VCAP_SERVICES = JSON.stringify(this.database);

        process.env.ADMIN_EMAILS = JSON.stringify(this.adminEmails);
      }
    }
  }

  return configObject;
})();


module.exports = config;
