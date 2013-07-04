'use strict';

var express = require('express');
var logger = require('winston');
var app = express();

app.configure(function() {
  var onLocalHost = !process.env.OPENSHIFT_APP_DNS;
  if (onLocalHost) {
    require('./config.local').setupEnvironmentVariables();
  }

  var homeDir = process.env.OPENSHIFT_REPO_DIR;

  app.set('port', process.env.OPENSHIFT_NODEJS_PORT);
  app.set('views', homeDir + 'views');
  app.set('view engine', 'jade');

  app.use(express.static(homeDir + 'public'));
  app.use(express.favicon(homeDir + 'public/img/favicon.ico'));

  app.use(express.logger('dev'));
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

require('./routes/ProductRoutes').setupRoutes(app);

var port = app.get('port');
var ipAddress = process.env.OPENSHIFT_NODEJS_IP;

app.listen(port, ipAddress, function() {
  logger.info(Date(Date.now()) + ': Node server started on ' + ipAddress + ':' + port);
});
