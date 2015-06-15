angular.module('dascentApp')
.controller('ChatDetailCtrl', function($scope, $state, $stateParams, Chats, Auth) {
  $scope.chat = Chats.get($stateParams.chatId);
    $scope.logout = function() {
      Auth.logout();
      $state.go('login');
    };
});
