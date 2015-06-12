'use strict';

angular.module('dascentApp')
  .controller('LoginCtrl', function ($scope, Auth, $location, notifications) {
    $scope.user = {};
    $scope.errors = {};

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.mail,
          password: $scope.user.pword
        })
        .then( function() {
          // Logged in, redirect to home
         $location.path('/moncompte');
        })
        .catch( function(err) {
            //$scope.errors.other = err.message;
            $location.path('/login');
            notifications.showError(err.message+" Check your credentials and try again");
        });
      }else{
        notifications.showWarning("Login error: Check your credentials and try again");
        $location.path('/login');
      }
    };

  });
