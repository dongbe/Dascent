'use strict';

angular.module('dascentApp')
  .controller('LoginCtrl', function ($scope, Auth, $state, $ionicPopup) {
    $scope.user = {};
    $scope.errors = {};
    $scope.message = {};

    $scope.login = function (form) {
      $scope.submitted = true;

      if (form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
          .then(function () {
            // Logged in, redirect to home
            $state.go('tab.dash');
          })
          .catch(function (err) {
            if (err) {
              $ionicPopup.alert({
                title: 'Login failed!',
                template: err.message + ' Please check your credentials!'
              });
            } else {
              $ionicPopup.alert({
                title: 'Login failed!',
                template: 'No internet connection!'
              });
            }

          });
      } else {
        $ionicPopup.alert({
          title: 'Login failed!',
          template: 'Please check your credentials!'
        });
        $state.go('login');
      }
    };

  });
