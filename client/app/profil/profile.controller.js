'use strict';

angular.module('dascentApp')
  .controller('SideBarCtrl', function ($q,$scope, $location, Auth, $http, ManDev,socket,notifications,uiGmapGoogleMapApi) {
    $scope.menu = [
      {
        title:'My profile',
        link:'/moncompte'
      },
      {
        title:'My devices',
        link:'/device'
      },
      {
        title:'My followers',
        link:'/follower'
      }
    ];
    $scope.followings=[];
    $scope.currentUser=Auth.getCurrentUser;
    $scope.profile=[];
    $scope.device={};
    $scope.points=[];
    $scope.polylines=[];
    var presence=false;


    $q.all($http.get('/api/users/me/profiles')
      .success(function(data){
      $scope.profile=data;
      socket.syncProfileUpdates('profile',$scope.profile);
      socket.syncDevUpdates('device',$scope.profile.watchs);
      var nope=false;

      //get followings profile information
      for(var i in $scope.profile.watchs){
        if($scope.profile.watchs[i].device.group[0]==='GPS'){
          var point={};
          var location={};
          var polyline={};
              polyline.path=[];
          var latitudes=[];
          var existPoint=true;
          angular.forEach($scope.profile.watchs[i].device.streams, function(stream){

            if(stream.lastValue && stream.name==='GPS'){
              point.latitude = stream.lastValue.latitude;
              point.longitude= stream.lastValue.longitude;
                if (stream.values.length>1){
                  latitudes=stream.values;
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

            if(latitudes.length>0){
              polyline.id=$scope.polylines.length>0?$scope.polylines.length+1:1;
              for(var y in latitudes){
                polyline.path.push(latitudes[y].value);
              }
              polyline.stroke= {color: '#6060FB', weight: 3};
              polyline.editable= true;
              polyline.visible=true;
              $scope.polylines.push(polyline);
            }

          });
          if (existPoint){
            $scope.points.push(location);
          }
        }
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
    })
      .error(function(err){console.log(err);}))
      .then(function(){
      uiGmapGoogleMapApi.then(function(maps) {

        var last_element = $scope.points[$scope.points.length-1];
        $scope.map = {center:last_element.coords,zoom: 16, pan:1};

      });
    });

    $scope.type = function(device){
      return device.type;
    };
    $scope.isActive = function(route) {
      return route === $location.path();
    };
    $scope.register = function(form){
      angular.forEach($scope.profile.watchs,function(u,i){
        if(u.device.serial===$scope.device.serial){
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
      angular.forEach($scope.profile.watchs,function(u){
        if(u.device.serial===$scope.device.serial && u._owner===$scope.currentUser._id){
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
        .then(function(){
            //$scope.profile.accepted.push(data);
            notifications.showSuccess('Félicitations, vous avez un nouveau suiveur!');

        }).catch(function(error){
          console.log(error);
        });
    };
    $scope.discard=function(dev){
      ManDev.discard({id:$scope.profile._id, demand:dev})
        .then(function(){
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
                if (u ===dev) {
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


    /*
    $scope.staticMarker = {

      id: 0,
      coords: {latitude:5,longitude:45},
      options: { draggable: false }*/
      /*events: {
       dragend: function (marker, eventName, args) {
       $log.log('marker dragend');
       $log.log(marker.getPosition().lat());
       $log.log(marker.getPosition().lng());
       }
       }
    };*/
    $scope.markers2= [
      {
        id: 1,
        icon: 'assets/images/blue_marker.png',
        latitude: 46,
        longitude: -77,
        showWindow: false,
        options: {
          labelContent: '[46,-77]',
          labelAnchor: "22 0",
          labelClass: "marker-labels"
        }
      },
      {
        id: 2,
        icon: 'assets/images/blue_marker.png',
        latitude: 33,
        longitude: -77,
        showWindow: false,
        options: {
          labelContent: 'DRAG ME!',
          labelAnchor: "22 0",
          labelClass: "marker-labels",
          draggable: true
        }
      },
      {
        id: 3,
        icon: 'assets/images/blue_marker.png',
        latitude: 35,
        longitude: -125,
        showWindow: false,
        options: {
          labelContent: '[35,-125]',
          labelAnchor: "22 0",
          labelClass: "marker-labels"
        }
      }];


  })
  .directive('loraReader', function($window,$compile){
    return{
      scope: {
        loraReader:'='
      },
      link: function(scope,element){
        var d3= $window.d3;
        var extracted =[];
        for (var i=0;i<=scope.loraReader.length-2;i=i+2){
          extracted.push(parseInt(scope.loraReader.slice(i,i+2),16));
        }
        var display = '<div class="row">' +
          '<div class="col-md-2">LED: '+extracted[0]+'</div>'+
          '<div class="col-md-3">Pression: '+ (extracted[1]+extracted[2])/10+' hPa</div>'+
          '<div class="col-md-3">Temperature: '+(extracted[3]+extracted[4])/100+' °C</div>'+
          '<div class="col-md-4"><div id="chart" class="battery" style="width:100px;" ></div></div>'+
          '</div>';
        $compile(display)(scope);
        element.append(display);
        d3.select('#chart')
          .append('div').attr('class', 'left').transition().ease('elastic').style('width', extracted[7]+'px').text(extracted[7] +'%');

      }
    }
  });
