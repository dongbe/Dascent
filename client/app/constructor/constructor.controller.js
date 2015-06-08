'use strict';

angular.module('dascentApp')
  .controller('ConstructorCtrl', function ($scope, Auth, $timeout, ManDev, $state, $http, socket, Modal) {
    $scope.constructor = Auth.getCurrentUser;
    $scope.toggle = true;
    $scope.disable = false;
    $scope.devices = [];
    $http.get('/api/users/me/devices').success(function(data){
      $scope.devices=data;
      socket.syncUpdates('device', $scope.devices);
    }).error();

    if ($scope.devices.length) {
      $scope.disable = true;
    }
    $scope.createDevice = Modal.confirm.browse(function (fileContent) {
      var lines;
      lines = fileContent.split('\n');
      for (var i = 1; i < lines.length; i++) {
        console.log(i);
        var device = lines[i].split(',');
        console.log(device);
        ManDev.createDevice({
          name: device[0],
          description: device[1],
          serial: device[2],
          templateId: device[3],
          group: [device[4]]
        });
      }
      console.log(lines);
      console.log(lines.length);
      $state.go('construct');
    });

    $scope.getDevices = function () {
      ManDev.importDevice().then(function () {

        $state.go('construct');
      })
        .catch(function (err) {
          err = err.data;
          console.log(err);

        });
    };
    $scope.updateDevices = function () {
      $http.get('/api/devices').success(function (data) {
        console.log(data);
        $scope.devices = data;
      });
    };
    //console.log($scope.devices);

    /*
     $http.get('/api/devices/').success(function(awesomeThings) {

     $scope.awesomeThings = awesomeThings;
     socket.syncUpdates('thing', $scope.awesomeThings);
     });
     */
    $scope.delete=function(device){
      $http.delete('/api/devices/'+device._id);
      angular.forEach($scope.devices, function(u, i) {
        if (u === device) {
          $scope.devices.splice(i, 1);
        }
      });
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('device');
    });
})
.directive('fileReader', function () {
  return {
    scope: {
      fileReader: '='
    },
    link: function (scope, element) {
      $(element).on('change', function (changeEvent) {
        var files = changeEvent.target.files;
        if (files.length) {
          var r = new FileReader();
          r.onload = function (e) {
            var contents = e.target.result;
            scope.$apply(function () {
              scope.fileReader = contents;
            });
          };
          r.readAsText(files[0]);
        }
      });

    }
  };

  });
