/**
 * Created by donatien-gbe on 12/06/15.
 */


angular.module('dascentApp')
  .config(function($stateProvider) {
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider
      .state('tab.dash', {
        url: '/dash',
        views: {
          'tab-dash': {
            templateUrl: 'js/dashboard/tab-dash.html',
            controller: 'ProfilCtrl',
            authenticate: true
          }
        }
      });
  });
