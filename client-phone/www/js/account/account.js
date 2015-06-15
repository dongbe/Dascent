'use strict';

angular.module('dascentApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'js/account/login/login.html',
        controller: 'LoginCtrl'
      })
      .state('tab.signup', {
        url: '/signup',
        views: {
          'tab-signup': {
            templateUrl: 'js/account/signup/signup.html',
            controller: 'SignupCtrl'
          }
        }
      })
      .state('tab.settings', {
        url: '/settings',
        views: {
          'tab-settings': {
            templateUrl: 'js/account/settings/settings.html',
            controller: 'SettingsCtrl',
            authenticate: true
          }
        }
      })
  });
