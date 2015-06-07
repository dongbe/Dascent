'use strict';

angular.module('dascentApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      },
      getDevices:{
        method: 'GET',
        params: {
          id: 'me',
          controller:'devices'
        },
        isArray: true
      }
	  });
  });
