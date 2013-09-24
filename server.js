'use strict';

var express = require('express');
var _ = require('underscore');
var ProductRoutes = require('./routes/ProductRoutes');
var logger = require('winston');
var app = express();

app.configure(function() {
  var oneWeek = 604800000;
  
  var homeDir = process.env.OPENSHIFT_REPO_DIR || '';

  app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);

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

ProductRoutes.setupRoutes(app);

var port = app.get('port') || 3000;
var ipAddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

app.listen(port, ipAddress, function() {
  logger.info(Date(Date.now()) + ': Node server started on ' + ipAddress + ':' + port);
});
