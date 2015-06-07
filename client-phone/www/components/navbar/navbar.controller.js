'use strict';

angular.module('dascentApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {
    $scope.menu = [
      {
        title:"My profile",
        link:""
      },
      {
        title:"My devices",
        link:""
      },
      {
        title:"My followers",
        link:""
      },
      {
        title:"Following",
        link:""
      },
      {
        title:"Contact",
        link:""
      },
      {
        title:"Help",
        link:""
      }
    ];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $location.path('/');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
