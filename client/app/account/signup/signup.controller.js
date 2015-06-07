'use strict';

angular.module('dascentApp')
  .controller('SignupCtrl', function ($scope, Auth, $location) {
    $scope.user = {};
    $scope.errors = {};

    $scope.register = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.createUser({
          name: $scope.user.name,
          lastname: $scope.user.lastname,
          email: $scope.user.email,
          password: $scope.user.password1
        })
        .then( function() {
          // Account created, redirect to home
          $location.path('/login');
        })
        .catch( function(err) {
          err = err.data;
          $scope.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
            form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.message;
          });
        });
      }
    };
    $scope.registerPro = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.createUser({
          name: $scope.user.name,
          isskey: $scope.user.isskey,
          idclient: $scope.user.idclient,
          email: $scope.user.email,
          password: $scope.user.password1
        })
          .then( function() {
            // Account created, redirect to home
            $location.path('/login');
          })
          .catch( function(err) {
            err = err.data;
            $scope.errors = {};

            // Update validity of form fields that match the mongoose errors
            angular.forEach(err.errors, function(error, field) {
              form[field].$setValidity('mongoose', false);
              $scope.errors[field] = error.message;
            });
          });
      }
    };

  });
