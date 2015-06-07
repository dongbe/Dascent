angular.module('dascentApp')

.controller('DashCtrl', function($scope, $state, Auth) {
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.logout = function() {
      Auth.logout();
      $state.go('login');
    };
  })

.controller('ChatsCtrl', function($scope, $state, Chats, Auth) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
    $scope.logout = function() {
      Auth.logout();
      $state.go('login');
    };
})

.controller('ChatDetailCtrl', function($scope, $state, $stateParams, Chats, Auth) {
  $scope.chat = Chats.get($stateParams.chatId);
    $scope.logout = function() {
      Auth.logout();
      $state.go('login');
    };
})

.controller('AccountCtrl', function($scope,$state, Auth) {
  $scope.settings = {
    enableFriends: true
  };
    $scope.logout = function() {
      Auth.logout();
      $state.go('login');
    };
});
