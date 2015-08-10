'use strict';

angular.module('dascentApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('construct', {
        url: '/constructor',
        templateUrl: 'app/provider/constructor.html',
        controller: 'ConstructorCtrl',
        authenticate: true,
        access: 'constructor'
      });
  });
