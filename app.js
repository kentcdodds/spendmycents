'use strict';

var express = require('express');
var passport = require('passport');
var _ = require('underscore');

var ProductRoutes = require('./routes/ProductRoutes');
var AuthenticationRoutes = require('./routes/AuthenticationRoutes');
var UserRoutes = require('./routes/UserRoutes');

var AuthenticationController = require('./controller/AuthenticationController');
var logger = require('winston');

var app = express();

app.configure(function() {
  var onLocalHost = !process.env.OPENSHIFT_APP_DNS;
  var oneWeek = 604800000;
  if (onLocalHost) {
    require('./config.local').setupEnvironmentVariables();
  }

  var homeDir = process.env.OPENSHIFT_REPO_DIR;

  app.set('port', process.env.OPENSHIFT_NODEJS_PORT);
  app.set('views', homeDir + 'views');
  app.set('view engine', 'jade');
  app.use('/public', express.static(homeDir + 'public'));

  app.use(express.favicon(homeDir + 'public/img/favicon.ico'));

  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());

  app.use(express.methodOverride());
  app.use(express.session({secret: 'funny monkey', cookie: {maxAge: oneWeek * 3}}));

  app.use(express.static(homeDir + 'public'));
  console.log('Initializing passport');
  console.log('Keys of process.env');
  console.log(_.keys(process.env));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);

});

if (!process.env.ENVIRONMENT || process.env.ENVIRONMENT === 'DEV') {
  app.configure('development', function() {
    app.use(express.errorHandler());
  });
}

/*
 * Setup Routes
 */
app.get('/', function(req, res) {
  res.render('index', {
    title: 'Spend My Cents!'
  });
});

app.get('/partials/:name', function(req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
});

ProductRoutes.setupRoutes(app);
AuthenticationRoutes.setupRoutes(app);
UserRoutes.setupRoutes(app);

/*
 * Configure authentication
 */
AuthenticationController.setupPassport();

/*
 * Start server
 */

var port = app.get('port');
var ipAddress = process.env.OPENSHIFT_NODEJS_IP;



console.log(process.env.BASE_URL);

app.listen(port, ipAddress, function() {
  logger.info(Date(Date.now()) + ': Node server started on ' + ipAddress + ':' + port);
});
