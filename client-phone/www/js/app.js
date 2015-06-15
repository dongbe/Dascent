// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'dascentApp' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'dascentApp.services' is found in services.js
// 'dascentApp.controllers' is found in controllers.js
angular.module('dascentApp', ['ionic','ngResource','btford.socket-io'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
  .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider) {

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');
    $httpProvider.interceptors.push('authInterceptor');
    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.navBar.alignTitle('center');
    $stateProvider
      // setup an abstract state for the tabs directive
      .state('tab', {
        url: "/tab",
        abstract: true,
        templateUrl: "templates/tabs.html",
        authenticate: true
      });
  })

  .factory('authInterceptor', function ($localstorage, $q) {
  return {
    // Add authorization token to headers
    request: function (config) {
      config.headers = config.headers || {};
      if ($localstorage.get('token')) {
        config.headers.Authorization = 'Bearer ' + $localstorage.get('token');
      }
      return config;
    },

    // Intercept 401s and redirect you to login
    responseError: function(response, $state, $localstorage) {
      if(response.status === 401) {
        $state.go('login');
        // remove any stale tokens
        //$cookieStore.remove('token');
        $localstorage.remove('token');
        return $q.reject(response);
      }
      else {
        return $q.reject(response);
      }
    }
  };
});
