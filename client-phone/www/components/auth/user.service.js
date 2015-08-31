'use strict';

angular.module('dascentApp')
  .factory('User', function ($resource) {
    return $resource('http://dascent-dascent.rhcloud.com/api/users/:id/:controller', {
        id: '@_id'
      },
      {
        changePassword: {
          method: 'PUT',
          params: {
            controller: 'password'
          }
        },
        get: {
          method: 'GET',
          params: {
            id: 'me'
          }
        }
      });
  });
