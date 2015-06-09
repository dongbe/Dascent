'use strict';

angular.module('dascentApp')
  .controller('LoginCtrl', function ($scope, Auth, $location) {
    $scope.user = {};
    $scope.errors = {};

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          // Logged in, redirect to home
         $location.path('/moncompte');
        })
        .catch( function(err) {
            console.log(err.message);
            $scope.errors.other = err.message;
        });
      }else{
        $location.path('/login');
      }
    };

  });
