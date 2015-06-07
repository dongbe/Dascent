'use strict';

angular.module('dascentApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('moncompte', {
        url: '/moncompte',
        templateUrl: 'app/profil/moncompte/moncompte.html',
        controller: 'SideBarCtrl',
        authenticate: true,
        access: 'user'
      });
  });
