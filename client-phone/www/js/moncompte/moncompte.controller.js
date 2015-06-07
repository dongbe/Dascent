'use strict';

angular.module('dascentApp')
  .controller('MoncompteCtrl', function ($scope,$http) {
    $scope.message = 'Hello';
    var config = { headers : {
      'X-ISS-Key': '47a2d4ef8a8847299645a9cba12d2b88',
      'X-OAPI-Key':'9jsBDxbDGwa9d6sY9PGizgEyIh8kAX7o',
      'Content-Type': 'application/json'
    }
    };
    $scope.wallData= [];
    $http.get('https://api.orange.com/datavenue/v1/status',config)
      .success(function(data){
        $scope.status =data.status;
        $http.get('https://api.orange.com/datavenue/v1/prototypes/bca7de3b53a84439b2f5b660ac0aa3c4' +
        '/streams/3214263473da4bd698e1ab53f7032ed5',config)
          .success(function(data) {
            console.log(data);
            $scope.wallData = data;
            //socket.syncUpdates('devData', $scope.wallData);
          })
          .error(function(data){
            console.log(data);
          });
      })
      .error(function(data){
        console.log(data);
      });
  });
