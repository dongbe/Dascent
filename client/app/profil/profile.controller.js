'use strict';

angular.module('dascentApp')
  .controller('SideBarCtrl', function ($q, $scope, $location, Auth, $http, ManDev, socket, notifications, uiGmapGoogleMapApi,uiGmapIsReady) {

    $scope.followings = [];
    $scope.currentUser = Auth.getCurrentUser;
    $scope.profile = [];
    $scope.device = {};
    $scope.points = [];
    $scope.polylines = [];
    $scope.control = {};
    $scope.gps = false;
    var presence = false;

    $http.get('/api/users/' + $scope.currentUser()._id + '/profiles')
      .success(function (data) {
        $scope.profile = data;
        socket.syncProfileUpdates('profile', $scope.profile);
        socket.syncDevUpdates('device', $scope.profile.watchs);
        var nope = false;

        //get followings profile information
        for (var i in $scope.profile.watchs) {
          if ($scope.profile.watchs[i].device.group.indexOf('GPS') > -1) {
            var point = {};
            var location = {};
            var polyline = {};
            polyline.path = [];
            var latitudes = [];
            var existPoint = true;
            angular.forEach($scope.profile.watchs[i].device.streams, function (stream) {
              if (stream.lastValue && stream.name === 'GPS') {
                point.latitude = stream.lastValue.latitude;
                point.longitude = stream.lastValue.longitude;
                if (stream.values.length > 1) {
                  latitudes = stream.values;
                }
                location.coords = point;
                location.id = $scope.points.length > 0 ? $scope.points.length : 0;
                location.options = {
                  draggable: false,
                  labelContent: $scope.profile.watchs[i].device.name,
                  labelAnchor: '22 0',
                  labelClass: 'marker-labels'
                };
              }
              else {
                existPoint = false;
              }

              if (latitudes.length > 0) {
                polyline.id = $scope.polylines.length > 0 ? $scope.polylines.length + 1 : 1;
                for (var y in latitudes) {
                  polyline.path.push(latitudes[y].value);
                }
                polyline.stroke = {color: '#6060FB', weight: 3};
                polyline.editable = true;
                polyline.visible = true;
                $scope.polylines.push(polyline);
              }

            });
            if (existPoint) {
              $scope.gps = true;
              $scope.points.push(location);
            }
          }
          if ($scope.profile.watchs[i].type === false) {
            for (var y in $scope.followings) {
              if ($scope.followings[y] === $scope.profile.watchs[i].device._owner) {
                nope = true;
              }
            }
            if (!nope) {
              $scope.followings.push($scope.profile.watchs[i].device._owner);
            }
            nope = false;
          }
        }
      })
      .error(function (err) {
        console.log(err);
      })
      .then(function () {
        uiGmapGoogleMapApi.then(function (maps) {
          maps.visualRefresh = true;
         // var map = $scope.control.getGMap();
          var test=[];
          var last_element = $scope.points.length ? $scope.points[$scope.points.length - 1] : {};
          $scope.map = last_element ? {center: {latitude:45.3002,longitude:5.7222}, zoom: 10, pan: 1} : {};
          //$scope.control.getGMap().fitBounds($scope.bounds);
          uiGmapIsReady.promise()                     // this gets all (ready) map instances - defaults to 1 for the first map
            .then(function(instances) {                 // instances is an array object
              var map = instances[0].map;
              $scope.bounds = new google.maps.LatLngBounds();
              for(var b=0;b<$scope.points.length-1;b++){
                $scope.bounds.extend(new google.maps.LatLng($scope.points[b].coords));
              }
              map.fitBounds($scope.bounds);     // this function will only be applied on initial map load (once ready)
            });


        });
      });

    $scope.type = function (device) {
      return device.type;
    };
    $scope.isGPS = function (device) {
      //console.log(device.device.group.indexOf('GPS')>-1);
      if (device.device.group.indexOf('GPS') > -1) {
        return true;
      }
      return false;
    };
    $scope.deleteDevice = function (watch) {
      console.log(watch._id);
      $http.post('/api/profiles/' + $scope.currentUser()._profile + '/deletedevice/' + watch._id).success(function (data) {
        console.log(data)
      }).error(function (err) {
        console.log(err)
      });
      angular.forEach($scope.profile.watchs, function (u, i) {
        if (u === watch) {
          $scope.profile.watchs.splice(i, 1);
        }
      });
    };
    $scope.isActive = function (route) {
      return route === $location.path();
    };
    $scope.register = function (form) {
      angular.forEach($scope.profile.watchs, function (u, i) {
        if (u.device.serial === $scope.device.serial) {
          presence = true;
        }
      });

      if (!presence) {
        ManDev.addDevice({
          serial: $scope.device.serial
        })
          .then(function (data) {
            $scope.profile.waiting.push(data);
            notifications.showSuccess('Demande envoyé!');

          }).catch(function (err) {
            notifications.showError('Oops! Device ' + err);
          });
      } else {
        notifications.showError('Vous avez deja souscrit à ce capteur');
      }
      presence = false;
      $scope.device = {};

    };
    //enregistrement proprietaire des capteurs
    $scope.registerO = function (form) {
      angular.forEach($scope.profile.watchs, function (u) {
        if (u.device.serial === $scope.device.serial && u._owner === $scope.currentUser._id) {
          presence = true;
        }
      });
      if (!presence) {
        ManDev.addDevice({
          serial: $scope.device.serial,
          password: $scope.device.pass
        })
          .then(function (data) {
            $scope.profile.watchs.push({device: data, type: true});
            notifications.showSuccess('Capteur enregistré!');

          }).catch(function (err) {
            notifications.showError('Oops! Device ' + err);
          });
      } else {
        notifications.showError('Vous etes dèja proprietaire de ce capteur');
      }
      presence = false;
      $scope.device = {};
    };
    $scope.confirm = function (dev) {
      ManDev.confirm({id: $scope.profile._id, demand: dev})
        .then(function () {
          //$scope.profile.accepted.push(data);
          notifications.showSuccess('Félicitations, vous avez un nouveau suiveur!');

        }).catch(function (error) {
          console.log(error);
        });
    };
    $scope.discard = function (dev) {
      ManDev.discard({id: $scope.profile._id, demand: dev})
        .then(function () {
          angular.forEach($scope.profile.accepted, function (u, i) {
            if (u === dev) {
              $scope.profile.accepted.splice(i, 1);
            }
          });
          notifications.showSuccess('Vous venez de revoquer un suiveur!');
        }).catch(function (error) {
          console.log(error);
        });
    };
    $scope.cancel = function (dev) {
      ManDev.cancel({id: $scope.profile._id, demand: dev})
        .then(function () {
          angular.forEach($scope.profile.waiting, function (u, i) {
            if (u === dev) {
              $scope.profile.waiting.splice(i, 1);
            }
          });
        }).catch(function (error) {
          console.log(error);
        });
    };
    $scope.cancelR = function (dev) {
      ManDev.cancelRequest({id: $scope.profile._id, demand: dev})
        .then(function () {
          angular.forEach($scope.profile.waiting, function (u, i) {
            if (u === dev) {
              $scope.profile.waiting.splice(i, 1);
            }
          });
        }).catch(function (error) {
          console.log(error);
        });
    };
    $scope.activateTracking = function (device) {
      device.tracking = true;
      ManDev.updateDevice(device).then(function (data) {

      });
    };
    $scope.deactivateTracking = function (device) {
      device.tracking = false;
      ManDev.updateDevice(device).then(function (data) {

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
    $scope.markers2 = [
      {
        id: 1,
        icon: 'assets/images/blue_marker.png',
        latitude: 46,
        longitude: -77,
        showWindow: false,
        options: {
          labelContent: '[46,-77]',
          labelAnchor: '22 0',
          labelClass: 'marker-labels'
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
          labelAnchor: '22 0',
          labelClass: 'marker-labels',
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
          labelAnchor: '22 0',
          labelClass: 'marker-labels'
        }
      }];

    $scope.notif = function () {
      if ($scope.profile.length) {
        return false;
      }
      else {
        for (var x in $scope.profile.watchs) {
          for (var s in $scope.profile.watchs[x].device.streams) {
            if ($scope.profile.watchs[x].device.streams[s].lastValue) {
              return true;
            }
          }
        }
        return false;
      }
    };


    socket.unsyncUpdates('profile');
    socket.unsyncUpdates('device');
  })
  .directive('loraReader', function ($window, $compile) {
    return {
      scope: {
        loraReader: '='
      },
      link: function (scope, element) {
        var d3 = $window.d3;
        var extracted = [];
        var led=parseInt(scope.loraReader.slice(0,2), 16);
        var pression = parseInt(scope.loraReader.slice(2, 6), 16)/10;
        var temp=parseInt(scope.loraReader.slice(6, 10), 16)/100;
        var altitude=parseInt(scope.loraReader.slice(10, 14), 16)/10;
        var batterie=parseInt(scope.loraReader.slice(14, 16), 16);

        var display = "<div class='row'>" +
          "<div class='col-md-2'>LED: " + led + "</div>" +
          "<div class='col-md-3'>Pression: " + pression + " hPa</div>" +
          "<div class='col-md-3'>Temperature: " + temp + " °C</div>" +
          "<div class='col-md-4'><div id='chart' class='battery' style='width:100px;' ></div></div>" +
          "</div>";
        $compile(display)(scope);
        element.append(display);
        d3.select('#chart')
          .append('div').attr('class', 'left').transition().ease('elastic').style('width', batterie + 'px').text(batterie + '%');

      }
    };
  });
