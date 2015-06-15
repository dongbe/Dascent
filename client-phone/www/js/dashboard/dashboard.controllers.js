/**
 * Created by donatien-gbe on 10/03/15.
 */
'use strict';

angular.module('dascentApp')
  .controller('DashCtrl', function($scope, $state, Auth) {
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.logout = function() {
      Auth.logout();
      $state.go('login');
    };
  });
