/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var path = require('path');
var passport = require('passport');

var ProductRoutes = require('./routes/ProductRoutes');
var AuthenticationRoutes = require('./routes/AuthenticationRoutes');
var UserRoutes = require('./routes/UserRoutes');

var AuthenticationController = require('./controller/AuthenticationController');

var app = express();
var process = process || {env: {}};

app.configure(function() {
  var onLocalHost = !process.env.ENVIRONMENT;
  var oneWeek = 604800000;
  if (onLocalHost) {
    require('./config.local').env.setupEnvironmentVariables();
  }

  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use('/public', express.static(__dirname + '/public'));

  app.use(express.favicon());

  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());

  app.use(express.methodOverride());
  app.use(express.session({secret: 'funny monkey', cookie: {maxAge: oneWeek * 3}}));

  app.use(express.static(__dirname + '/public'));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);

});

app.configure('development', function() {
  app.use(express.errorHandler());
});


/*
 * Setup Routes
 */
app.get('/', function(req, res) {
  res.render('index', {
    title: 'Spend My Cents!'
  });
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
http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});
