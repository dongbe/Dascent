'use strict';
angular.module('dascentApp')
  .controller('ProfilCtrl', function ($scope, $http, Auth, $state,socket) {

    $scope.followings=[];
    $scope.currentUser=Auth.getCurrentUser();
    $scope.profile=[];
    $scope.device={};
    $scope.settings = {
      enableFriends: true
    };
    $scope.logout = function() {
      Auth.logout();
      $state.go('login');
    };

    $http.get('http://localhost:9000/api/users/me/followers').success(function(data){
      $scope.profile=data;
      console.log(data);
      socket.syncProfileUpdates('follower',$scope.profile);
      socket.syncDevUpdates('device',$scope.profile.watchs);
      var nope=false;

      //get followings profile information
      for(var i in $scope.profile.watchs){
        if($scope.profile.watchs[i].type===false){
          for (var y in $scope.followings){
            if($scope.followings[y]===$scope.profile.watchs[i].device._owner){
              nope=true;
            }
          }
          if(!nope){
            $scope.followings.push($scope.profile.watchs[i].device._owner);
          }
          nope=false;
        }
      }
    }).error(function(err){
      console.log(err);
    });


    $scope.type = function(device){
      return device.type;
    };
  });

