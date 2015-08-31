'use strict';

angular.module('dascentApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('device', {
        url: '/device',
        templateUrl: 'app/profil/device/device.html',
        controller: 'SideBarCtrl',
        access: 'user'
      });
  });
