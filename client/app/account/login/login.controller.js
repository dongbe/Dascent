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
        .then( function(data) {
          // Logged in, redirect to home
         $location.path('/moncompte');
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }else{

        $location.path('/login');
      }
    };

  });