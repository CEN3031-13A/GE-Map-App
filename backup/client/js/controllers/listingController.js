angular.module('customers').controller('ListingsController', ['$scope', 'Listings', 
  function($scope, Listings) {
    /* Get all the customers, then bind it to the scope */
    Listings.getAll().then(function(response) {
      $scope.customers = response.data;
    }, function(error) {
      console.log('Unable to retrieve customers:', error);
    });

    $scope.detailedInfo = undefined;

    $scope.addListing = function() {
      $scope.customers.push($scope.newListing);
      $scope.newListing = {};
    };

    $scope.deleteListing = function(index) {
      $scope.customers.splice(index, 1);
    };

    $scope.showDetails = function(index) {
      $scope.detailedInfo = $scope.customers[index];
    };
  }
]);