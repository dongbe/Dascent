/**
 * Created by donatien-gbe on 12/06/15.
 */
'use strict';

angular.module('dascentApp')
  .controller('DeviceCtrl', function($scope, $state, Auth) {
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.logout = function() {
      Auth.logout();
      $state.go('login');
    };
  });
