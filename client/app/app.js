'use strict';

angular.module('dascentApp', [
  'ngNotificationsBar',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'uiGmapgoogle-maps',
  'vcRecaptcha'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider,uiGmapGoogleMapApiProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
    uiGmapGoogleMapApiProvider.configure({
      //    key: 'your api key',
      v: '3.17',
      libraries: 'weather,geometry,visualization'
    });
  })
  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
          if ($location.path()==='/'){
            $location.path('/');
          }else{
            $location.path('/login');
          }
          // remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

  .run(function ($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {

        if (next.authenticate && !loggedIn){
          $location.path('/');
        }
        else if (!next.access && loggedIn){
          $location.path(next.url);
        }
        else if(Auth.isAuthorized('admin') && loggedIn){
          $location.path('/admin');
        }
        else if(Auth.isAuthorized('constructor') && loggedIn){
          $location.path('/constructor');
        }
        else if(next.access==='user' && Auth.isAuthorized('user')){
          $location.path(next.url);
        }
        else if(!Auth.isAuthorized(next.access)){
          $location.path('/login');
        }

      });
    });
  });
