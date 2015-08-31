'use strict';

angular.module('dascentApp')
  .controller('MainCtrl', function ($scope) {

    /*
     $scope.isConstructor= Auth.isConstructor();
     $scope.isAdmin = Auth.isAdmin();
     $scope.isLoggedIn= Auth.isLoggedIn();
     if($scope.isLoggedIn){
     if($scope.isAdmin) $location.path('/admin');
     else if($scope.isConstructor)  $location.path('/constructor');
     else  $location.path('/moncompte');
     }
     $scope.awesomeThings = [];

     $scope.addThing = function() {
     if($scope.newThing === '') {
     return;
     }
     $http.post('/api/things', { name: $scope.newThing });
     $scope.newThing = '';
     };

     $scope.deleteThing = function(thing) {
     $http.delete('/api/things/' + thing._id);
     };

     $scope.$on('$destroy', function () {
     socket.unsyncUpdates('thing');
     });*/
  });
