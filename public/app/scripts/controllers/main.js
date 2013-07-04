'use strict';

angular.module('SMC')
  .controller('MainCtrl', function ($scope) {
    console.log('controller config');
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
