/**
 * Created by donatien-gbe on 16/06/15.
 */
'use strict';

angular.module('dascentApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('tab.notif', {
        url: '/notif',
        views: {
          'tab-notif': {
            templateUrl: 'js/notification/tab-notif.html',
            controller: 'ProfilCtrl',
            authenticate: true
          }
        }
      })

  });
