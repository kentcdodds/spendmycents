'use strict';

/* Controllers */

function ProductControl($scope, $http, $location) {
  // console.log('calling product control')
//   $http.get('/products?price=2000').success(function(data) {
//     console.log(data)
//     window.dataStuff = data;
//     $scope.products = data.ItemSearchResponse.Items[0].Item;
//   });
  
  $scope.sendRequest = function () {
    $http({
        url: '/products', 
        method: "GET",
        query: {price: $scope.price}
     }).success(function(data) {
      console.log(data)
      window.dataStuff = data;
      $scope.products = data.ItemSearchResponse.Items[0].Item;    
    });
  }

  
}

ProductControl.$inject = ['$scope', '$http', '$location'];


function ProductDetailControl($scope, $routeParams) {
  $scope.phoneId = $routeParams.phoneId;
}

ProductDetailControl.$inject = ['$scope', '$routeParams'];
