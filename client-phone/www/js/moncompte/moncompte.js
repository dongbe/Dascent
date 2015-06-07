'use strict';

angular.module('dascentApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('moncompte', {
        url: '/moncompte',
        templateUrl: 'app/moncompte/moncompte.html',
        controller: 'MoncompteCtrl',
        authenticate: true
      });
  });
