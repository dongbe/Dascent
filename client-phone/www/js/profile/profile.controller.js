'use strict';
angular.module('dascentApp')
  .controller('ProfilCtrl', function ($scope,$q, $http, Auth, $state, $ionicPlatform, ManDev, $cordovaDevice, uiGmapGoogleMapApi) {

    $scope.followings=[];
    $scope.currentUser=Auth.getCurrentUser;
    $scope.profile=[];
    $scope.device={};
    $scope.points=[];
    $scope.polylines=[];
    $scope.geolocationSetting=false;

    $scope.changeGeolocationSetting= function(start){
      if(start){
        geolocalisation.initialize($cordovaDevice,$http);
      }else{
        if(window.plugins.backgroundGeoLocation){
          window.plugins.backgroundGeoLocation.stop();
          geolocalisation.stopPositionWatch();
          }
      }
    };

    $scope.logout = function() {
      Auth.logout();
      $state.go('login');
    };

    $scope.notif =function(){
      if($scope.profile.length) return false;
      else{
        for(var x in $scope.profile.watchs){
          for(var s in $scope.profile.watchs[x].device.streams){
            if($scope.profile.watchs[x].device.streams[s].lastValue){
              return true;
            }
          }
        }
        return false;
      }
    };

    $scope.doRefresh=function(){

      $http.get('http://dascent-dascent.rhcloud.com/api/users/me/profiles')
        .success(function(data){

          $scope.profile=data;
          var deviceID='91435c1dd2183934';//$cordovaDevice.getUUID();
          var nope=false;
          var phone=false;
          if ($scope.profile.watchs){
            for(var i in $scope.profile.watchs){
              // check device owner
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
              // check if phone serial is known
              if(deviceID===$scope.profile.watchs[i].device.serial){
                phone=true;
              }
              // check if some devices are GPS
              if($scope.profile.watchs[i].device.group[0]==='GPS'){
                angular.forEach($scope.profile.watchs[i].device.streams, function(stream){
                  var point={};
                  var location={};
                  var polyline={};
                  polyline.path=[];
                  var existPoint=true;
                  if(stream.lastValue && stream.name==='GPS'){
                    point.latitude = stream.lastValue.latitude;
                    point.longitude= stream.lastValue.longitude;
                    if (stream.values.length>1){
                      polyline.id=$scope.polylines.length>0?$scope.polylines.length+1:1;
                      for(var y in stream.values){
                        polyline.path.push(stream.values[y].value);
                      }
                      polyline.stroke= {color: '#6060FB', weight: 3};
                      polyline.editable= true;
                      polyline.visible=true;
                      $scope.polylines.push(polyline);
                    }
                    location.coords=point;
                    location.id=$scope.points.length>0?$scope.points.length:0;
                    location.options= {
                      draggable: false,
                      labelContent: $scope.profile.watchs[i].device.name,
                      labelAnchor: "22 0",
                      labelClass: "marker-labels"
                    };
                  }
                  else {
                    existPoint= false;
                  }
                  if (existPoint){
                    $scope.points.push(location);
                  }
                });
              }
            }
          }
          if(!phone){
            ManDev.createDevice({
              name: deviceID,
              description: "registered phone",
              serial: deviceID,
              templateId: '24704c55a59046eb8a2988db22baf8c4',
              group: ['GPS']
            }).then( function(data) {
              $scope.profile.watchs.push({type:true,device:data});
              ManDev.addDevice({serial:deviceID,password:'test'});
              phone=false;
            })
              .catch( function(err) {
                console.log(err.message);
              });
          }
          uiGmapGoogleMapApi.then(function(map) {
            var last_element = $scope.points[$scope.points.length-1];
            $scope.map = {center:last_element.coords,zoom: 16};
            geolocalisation.map=map;
          });
        })
        .error(function(err){console.log(err);})
        .finally(function(){
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $http.get('http://dascent-dascent.rhcloud.com/api/users/me/profiles')
      .success(function(data){

      $scope.profile=data;
      var deviceID='91435c1dd2183934';//$cordovaDevice.getUUID();
      var nope=false;
      var phone=false;
      if ($scope.profile.watchs){
        for(var i in $scope.profile.watchs){
          // check device owner
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
          // check if phone serial is known
          if(deviceID===$scope.profile.watchs[i].device.serial){
            phone=true;
          }
          // check if some devices are GPS
          if($scope.profile.watchs[i].device.group[0]==='GPS'){
            angular.forEach($scope.profile.watchs[i].device.streams, function(stream){
              var point={};
              var location={};
              var polyline={};
                polyline.path=[];
              var existPoint=true;
              if(stream.lastValue && stream.name==='GPS'){
                point.latitude = stream.lastValue.latitude;
                point.longitude= stream.lastValue.longitude;
                if (stream.values.length>1){
                    polyline.id=$scope.polylines.length>0?$scope.polylines.length+1:1;
                    for(var y in stream.values){
                      polyline.path.push(stream.values[y].value);
                    }
                    polyline.stroke= {color: '#6060FB', weight: 3};
                    polyline.editable= true;
                    polyline.visible=true;
                    $scope.polylines.push(polyline);
                }
                location.coords=point;
                location.id=$scope.points.length>0?$scope.points.length:0;
                location.options= {
                  draggable: false,
                  labelContent: $scope.profile.watchs[i].device.name,
                  labelAnchor: "22 0",
                  labelClass: "marker-labels"
                };
              }
              else {
                existPoint= false;
              }
              if (existPoint){
                  $scope.points.push(location);
              }
            });
          }
        }
      }
      if(!phone){
        ManDev.createDevice({
          name: deviceID,
          description: "registered phone",
          serial: deviceID,
          templateId: '24704c55a59046eb8a2988db22baf8c4',
          group: ['GPS']
        }).then( function(data) {
          $scope.profile.watchs.push({type:true,device:data});
          ManDev.addDevice({serial:deviceID,password:'test'});
          phone=false;
        })
          .catch( function(err) {
            console.log(err.message);
          });
      }
        uiGmapGoogleMapApi.then(function(map) {
          var last_element = $scope.points[$scope.points.length-1];
          $scope.map = {center:last_element.coords,zoom: 16};
          geolocalisation.map=map;
        });
    })
      .error(function(err){console.log(err);});

    $scope.type = function(device){
      return device.type;
    };

  });

