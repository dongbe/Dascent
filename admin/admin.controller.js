'use strict';

angular.module('dascentApp')
  .controller('AdminCtrl', function ($scope, $http, Auth, User, Modal) {

    // Use the User $resource to fetch all users
    $scope.users = User.query();

    $scope.delete = Modal.confirm.delete(function (user) {
      User.remove({id: user._id});
      angular.forEach($scope.users, function (u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    });

    $scope.provision = function (fileContent) {
      var lines;
      console.log(fileContent);
      lines = fileContent.split('\n');
      console.log(lines.length);
    }
  });