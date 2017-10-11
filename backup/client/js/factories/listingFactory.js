angular.module('customers', []).factory('Listings', function($http) {
  var methods = {
    getAll: function() {
      return $http.get('http://localhost:8080/api/customers');
    }
  };

  return methods;
});