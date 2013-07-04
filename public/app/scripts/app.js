'use strict';

angular.module('SMC', [])
  .config(function ($routeProvider) {
    console.log('config smc');
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
