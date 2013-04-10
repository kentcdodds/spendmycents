'use strict';

/* Controllers */

function ProductControl($scope, $http) {
  $http.get('/products').success(function(data) {
    $scope.products = data;
  });

  $scope.orderProp = 'age';
}

//PhoneListCtrl.$inject = ['$scope', '$http'];


// function PhoneDetailCtrl($scope, $routeParams) {
//   $scope.phoneId = $routeParams.phoneId;
// }

//PhoneDetailCtrl.$inject = ['$scope', '$routeParams'];
