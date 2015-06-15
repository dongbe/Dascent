/**
 * Created by donatien-gbe on 12/06/15.
 */

'use strict';

angular.module('dascentApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('tab.devices', {
        url: '/devices',
        views: {
          'tab-devices': {
            templateUrl: 'js/device/tab-devices.html',
            controller: 'DeviceCtrl',
            authenticate: true
          }
        }
      })

  });
