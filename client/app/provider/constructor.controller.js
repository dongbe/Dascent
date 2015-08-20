'use strict';

angular.module('dascentApp')
  .controller('ConstructorCtrl', function ($scope, Auth, $timeout, ManDev, $state, $http, socket, Modal, cfpLoadingBar,notifications) {

    $scope.constructor = Auth.getCurrentUser; // information provider
    $scope.importDevice = false;
    $scope.toggle = true;
    $scope.disable = false;
    $scope.devices = [];

    $http.get('/api/users/'+$scope.constructor()._id+'/devices').success(function(data){
      $scope.devices=data;
      socket.syncUpdates('device', $scope.devices);
    }).error();

    if ($scope.devices.length) {
      $scope.disable = true;
    }
    $scope.createDevice = function(fileContent){
      if(fileContent) {
        Modal.confirm.browse(function (fileContent) {
          var lines;
          lines = fileContent.split('\n');
          for (var i = 1; i < lines.length; i++) {
            var device = lines[i].split(',');
            ManDev.createDevice({
              name: device[0],
              description: device[1],
              serial: device[2],
              templateId: device[3],
              group: [device[4]]
            });
          }
          $state.go('construct');
        });
      }else{
        $scope.error.message="veuillez choisir un fichier!!";
      }
    };

    $scope.getDevices = function () {
      $scope.importDevice=true;
      ManDev.importDevice().then(function () {
        $state.go('construct');
        $scope.importDevice=false;
        //$scope.$broadcast("import:completed");
      })
        .catch(function (err) {
          if(err){
            var error = err.message;
            notifications.showError('Datavenue: '+error);
          }else{
            notifications.showError("No internet connection");
          }
        });
    };


    $scope.getStDevices = function () {
      $scope.importDevice=true;
      ManDev.importStDevice().then(function () {
        $state.go('construct');
        $scope.importDevice=false;
        //$scope.$broadcast("import:completed");
      })
        .catch(function (err) {
          if(err){
            err = err.data;
            console.log(err);
          }else{
            notifications.showError("No internet connection");
          }


        });
    };

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
