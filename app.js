
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')

  , routes = require('./routes')

  , ProductRoutes = require('./routes/ProductRoutes')
  , ProductController = require('./controller/ProductController')

  , AuthenticationRoutes = require('./routes/AuthenticationRoutes')
  , AuthenticationController = require('./controller/AuthenticationController')

  , DatabaseRoutes = require('./routes/DatabaseRoutes')
  , DatabaseController = require('./controller/DatabaseController')

  , UserRoutes = require('./routes/UserRoutes')
  , UserController = require('./controller/UserController')
  ;
var app = express();

app.configure(function(){
  var onLocalHost = !process.env.ENVIRONMENT;
  if (onLocalHost) {
    require('./config.local').env.setupEnvironmentVariables();
  }

  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(require('stylus').middleware(__dirname + '/public'));
  
  app.use(express.favicon());
  
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());

  app.use(express.methodOverride());
  app.use(express.session({ secret: 'funny monkey' }));
  
  app.use(express.static(__dirname + '/public'));
  app.use(passport.initialize());
  app.use(passport.session()); 
  app.use(app.router);

});

app.configure('development', function(){
  app.use(express.errorHandler());
});


/*
 * Setup Routes
 */
app.get('/', routes.index);
ProductRoutes.setupRoutes(app, ProductController);
AuthenticationRoutes.setupRoutes(app);
DatabaseRoutes.setupRoutes(app);
UserRoutes.setupRoutes(app);

/*
 * Configure authentication
 */
AuthenticationController.setupPassport();


/*
 * Start server
 */
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
