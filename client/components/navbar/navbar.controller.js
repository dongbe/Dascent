'use strict';

angular.module('dascentApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth, ManDev) {
    $scope.menu = [
      {
        title: 'My profile',
        link: '/moncompte'
      },
      {
        title: 'My devices',
        link: '/device'
      },
      {
        title: 'My followers',
        link: '/follower'
      }
    ];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.isConstructor = Auth.isConstructor;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function () {
      Auth.logout();
      ManDev.clear();
      $location.path('/');
    };

    $scope.isActive = function (route) {
      return route === $location.path();
    };
  });
