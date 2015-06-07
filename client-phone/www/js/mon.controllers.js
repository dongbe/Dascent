/**
 * Created by donatien-gbe on 10/03/15.
 */
'use strict';

angular.module('dascentApp')
.config(function($stateProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'js/account/login/login.html',
      controller: 'LoginCtrl'
    })
    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html",
      authenticate: true
    })

    // Each tab has its own nav history stack:

    .state('tab.dash', {
      url: '/dash',
      views: {
        'tab-dash': {
          templateUrl: 'templates/tab-dash.html',
          controller: 'DashCtrl',
          authenticate: true
        }
      }
    })

    .state('tab.devices', {
      url: '/devices',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-devices.html',
          controller: 'ChatsCtrl',
          authenticate: true
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl',
          authenticate: true
        }
      }
    })

    .state('tab.account', {
      url: '/account',
      views: {
        'tab-account': {
          templateUrl: 'templates/tab-account.html',
          controller: 'AccountCtrl',
          authenticate: true
        }
      }
    });

});
