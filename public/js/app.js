'use strict';

/* App Module */

angular.module('spendmycents', []).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/index', {templateUrl: 'partials/productSearchTemplate.html',   controller: ProductControl}).
      when('/products/:productId', {templateUrl: 'html/productDetailTemplate.html', controller: ProductDetailControl}).
      otherwise({redirectTo: '/index'});
}]);