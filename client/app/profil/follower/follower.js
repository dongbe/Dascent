'use strict';

angular.module('dascentApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('follower/', {
        url: '/follower',
        templateUrl: 'app/profil/follower/follower.html',
        controller: 'SideBarCtrl',
        access: 'user',
        authenticate: true
      });
  });
