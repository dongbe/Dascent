/**
 * Created by donatien-gbe on 16/06/15.
 */
'use strict';

angular.module('dascentApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('tab.add', {
        url: '/add',
        views: {
          'tab-add': {
            templateUrl: 'js/add/tab-add.html',
            controller: 'AddCtrl',
            authenticate: true
          }
        }
      })

  });
