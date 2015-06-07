'use strict';

angular.module('dascentApp')
  .controller('SideBarCtrl', function ($scope, $location, Auth, $http, ManDev,socket,notifications,uiGmapGoogleMapApi) {
    $scope.menu = [
      {
        title:"My profile",
        link:"/moncompte"
      },
      {
        title:"My devices",
        link:"/device"
      },
      {
        title:"My followers",
        link:"/follower"
      }
    ];

    $scope.followings=[];
    $scope.currentUser=Auth.getCurrentUser;
    $scope.profile=[];
    $scope.device={};
    $scope.point={};
    $scope.polylines=[];
    $scope.map = { zoom: 15 };
    var presence=false;


    $http.get('/api/users/me/followers').success(function(data){
      console.log(data);
      $scope.profile=data;
      socket.syncProfileUpdates('follower',$scope.profile);
      socket.syncDevUpdates('device',$scope.profile.watchs);
      var nope=false;

      //get followings profile information
      for(var i in $scope.profile.watchs){
        if($scope.profile.watchs[i].type==false){
          for (var y in $scope.followings){
            if($scope.followings[y]==$scope.profile.watchs[i].device._owner){
              nope=true;
            }
          }
          if(!nope){
            $scope.followings.push($scope.profile.watchs[i].device._owner);
          }
          nope=false;
        }
      }
      for (var g in $scope.profile.watchs[i].group){

        if($scope.profile.watchs[i].group[g]=='GPS'){
          var latitude=[];
          var longitude=[];
          for(var s in $scope.profile.watchs[i].group[g].streams){
            if($scope.profile.watchs[i].group[g].streams[s].name=='Latitude'){
              latitude=$scope.profile.watchs[i].group[g].streams[s].values;
            }
            if($scope.profile.watchs[i].group[g].streams[s].name=='Longitude'){
              longitude=$scope.profile.watchs[i].group[g].streams[s].values;
            }
          }
          if(latitude.length>longitude.length) {
            $scope.polylines.path.push({latitude:latitude[0],longitude:longitude[0]});
            for (var i in latitude){
              if(latitude[i].time>longitude[i].time){
                $scope.polylines.path.push({latitude:latitude[i],longitude:longitude[i]});
              }else {
                $scope.polylines.path.push({latitude:latitude[i],longitude:longitude[i-1]});
              }
            }
          }
        }
      }
    }).error(function(err){
      console.log(err);
    });


    $scope.type = function(device){
      return device.type;
    };
    $scope.isActive = function(route) {
      return route === $location.path();
    };


    $scope.register = function(form){
      angular.forEach($scope.profile.watchs,function(u,i){
        if(u.device.serial==$scope.device.serial){
          presence=true;
        }
      });

      if(!presence){
        ManDev.addDevice({
          serial:$scope.device.serial
        })
          .then(function(data){
          $scope.profile.waiting.push(data);
              notifications.showSuccess('Demande envoyé!');

        }).catch(function(err){
          notifications.showError('Oops! Something bad just happened!'+err);
        });
      }else{
        notifications.showError('Vous avez deja souscrit à ce capteur');
      }
      presence=false;
      $scope.device={};

    };

    //enregistrement proprietaire des capteurs
    $scope.registerO = function(form){
      angular.forEach($scope.profile.watchs,function(u,i){
        if(u.device.serial==$scope.device.serial && u._owner===$scope.currentUser._id){
          presence=true;
        }
      });
      if(!presence){
        ManDev.addDevice({
          serial:$scope.device.serial,
          password:$scope.device.pass
        })
          .then(function(data){
                $scope.profile.watchs.push({device:data,type:true});
                notifications.showSuccess('Capteur enregistré!');

          }).catch(function(err){
            notifications.showError('Oops! Something bad just happened!'+err);
          });
      }else{
        notifications.showError('Vous etes dèja proprietaire de ce capteur');
      }
      presence=false;
      $scope.device={};
    };

    $scope.confirm=function(dev){
      ManDev.confirm({id:$scope.profile._id, demand:dev})
        .then(function(data){
            //$scope.profile.accepted.push(data);
            notifications.showSuccess('Félicitations, vous avez un nouveau suiveur!');

        }).catch(function(error){
          console.log(error);
        });
    };
    $scope.discard=function(dev){
      ManDev.discard({id:$scope.profile._id, demand:dev})
        .then(function(data){
            angular.forEach($scope.profile.accepted, function(u, i) {
              if (u === dev) {
                $scope.profile.accepted.splice(i, 1);
              }
          });
          notifications.showSuccess('Vous venez de revoquer un suiveur!');
        }).catch(function(error){
          console.log(error);
        });
    };

    $scope.cancel=function(dev){
      ManDev.cancel({id:$scope.profile._id, demand:dev})
        .then(function(){
              angular.forEach($scope.profile.waiting, function(u, i) {
                if (u === dev) {
                  $scope.profile.waiting.splice(i, 1);
                }
              });
        }).catch(function(error){
          console.log(error);
        });
    };
    $scope.cancelR=function(dev){
      ManDev.cancelRequest({id:$scope.profile._id, demand:dev})
        .then(function(){
          angular.forEach($scope.profile.waiting, function(u, i) {
            if (u === dev) {
              $scope.profile.waiting.splice(i, 1);
            }
          });
        }).catch(function(error){
          console.log(error);
        });
    };

    uiGmapGoogleMapApi.then(function(maps) {
      $scope.polylines=[{
        id: 3,
        path: [
          {
            latitude: 45.7600,
            longitude: 4.8400
          },
          {
            latitude: 50,
            longitude: -89
          },
          {
            latitude: 57,
            longitude: -122
          },
          {
            latitude: 20,
            longitude: -95
          }
        ],
        stroke: {
          color: '#FF0066',
          weight: 3
        },
        editable: true,
        draggable: true,
        geodesic: true,
        visible: true
      }];
      for (var i in $scope.polylines.path){

      }
    });
    $scope.staticMarker = {
      id: 0,
      coords: $scope.point,
      options: { draggable: false },
      events: {
        dragend: function (marker, eventName, args) {
          /*
          $log.log('marker dragend');
          $log.log(marker.getPosition().lat());
          $log.log(marker.getPosition().lng());
          */
        }
      }
    };
    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('follower');
      socket.unsyncUpdates('device');
    });

  });
