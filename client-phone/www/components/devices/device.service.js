
/**
 * Created by donatien-gbe on 31/03/15.
 */
'use strict';

angular.module('dascentApp')
  .factory('ManDev', function ($q, $localstorage, $http, User, Auth) {
    var currentDevices = [];
    var currentUser = {};
    var config = {};

    return {
      updateDevice: function(device,callback)
      {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        $http.patch('/api/devices/'+device._id, device).
          success(function(data) {
            deferred.resolve(data);
            return cb();
          }).
          error(function(err) {
            deferred.reject(err);
            return cb(err);
          }.bind(this));

        return deferred.promise;

      },
      config: function(){
        if(Auth.isLoggedIn() && !Auth.isAdmin()) {
          currentUser = Auth.getCurrentUser();
        }

        if (currentUser && Auth.isLoggedIn()) {
          //currentDevices = User.getDevices({id: currentUser._id});
          config = {
            headers: {
              'X-ISS-Key': '47a2d4ef8a8847299645a9cba12d2b88',
              'X-OAPI-Key': '9jsBDxbDGwa9d6sY9PGizgEyIh8kAX7o',
              'Content-Type': 'application/json'
            }
          };

        }
      },
      confirm: function (profile, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        console.log('ici');

        $http.post('http://dascent-dascent.rhcloud.com/api/followers/'+profile.id+'/confirm', {user:profile.demand.user._id,device:profile.demand.device._id})
          .success(function (data) {
            deferred.resolve(data);
            return cb(data);
          }).error(function (err) {
            deferred.reject(err);
            return cb(err);
          }.bind(this));

        return deferred.promise;
      },

      cancel: function (profile, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        $http.post('http://dascent-dascent.rhcloud.com/api/followers/'+profile.id+'/cancel', {user:profile.demand._owner,device:profile.demand._id})
          .success(function (data) {
            deferred.resolve(data);
            return cb();
          }).error(function (err) {
            deferred.reject(err);
            return cb(err);
          }.bind(this));

        return deferred.promise;
      },
      cancelRequest: function (profile, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        $http.post('http://dascent-dascent.rhcloud.com/api/followers/'+profile.id+'/cancel', {user:profile.demand.user._id,device:profile.demand.device._id, options:'request'})
          .success(function (data) {
            deferred.resolve(data);
            return cb();
          }).error(function (err) {
            deferred.reject(err);
            return cb(err);
          }.bind(this));

        return deferred.promise;
      },
      discard: function (profile, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        console.log('ici');

        $http.post('http://dascent-dascent.rhcloud.com/api/followers/'+profile.id+'/discard', {user:profile.demand.user._id,device:profile.demand.device._id})
          .success(function (data) {
            deferred.resolve(data);
            return cb();
          }).error(function (err) {
            deferred.reject(err);
            return cb(err);
          }.bind(this));

        return deferred.promise;
      },
      addDevice: function (device, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        $http.post('http://dascent-dascent.rhcloud.com/api/users/' + currentUser._id + '/devices', device)
          .success(function (data) {
            deferred.resolve(data);
            return cb(data);
          }).error(function (err) {
            deferred.reject(err);
            return cb(err);
          }.bind(this));

        return deferred.promise;
      },

      createDevice: function (device, callback) {
        this.config();
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.post('https://api.orange.com/datavenue/v1/datasources', device, config)
          .success(function (data) {
            var device = {};
            device.ds_id = data.id;
            device.name = data.name;
            device.description = data.description;
            device.serial = data.serial;
            device._owner = currentUser._id;
            device.group = data.group;
            device.streams = [];
            device.apikeys = [];
            var def = $q.defer();
            $q.all([
              $http.get('https://api.orange.com/datavenue/v1/datasources/'+device.ds_id+'/streams',config).success(function(data){def.resolve(data);}),
              $http.get('https://api.orange.com/datavenue/v1/datasources/'+device.ds_id+'/keys',config).success(function(data){def.resolve(data);})])
              .then(function (ret) {
                var streams=[];
                var apikeys=[];

                for (var y in ret[1].data) {
                  for(var x in ret[1].data[y].rights) {
                    if (ret[1].data[y].rights[x]==='GET') {
                      apikeys.push(ret[1].data[y].value);
                    }
                  }
                }

                angular.forEach(ret[0].data, function(st) {
                  streams.push({
                    id: st.id,
                    name: st.name,
                    lastValue: st.lastValue?st.lastValue:{},
                    values: st.lastValue ? [{value: st.lastValue, time: new Date()}] : [],
                    lastPost: new Date()
                  });
                });
                device.streams=streams;
                device.apikeys=apikeys;
                $http.post('http://dascent-dascent.rhcloud.com/api/devices/phone',device)
                  .success(function(data)
                  {
                    console.log("success");
                  deferred.resolve(data);
                  return cb(data);
                }).error(function(err){
                    console.log("error");
                  deferred.reject(err);
                  return cb(err);
                });
              });
          })
          .error(function (err) {
            deferred.reject(err);
            return cb(err);
          }.bind(this));

        return deferred.promise;
      },

      removeDevice: function (callback) {
        //var cb = callback || angular.noop;

      },
      deleteDevice: function (callback) {
        //var cb = callback || angular.noop;

      },
      getCurrentDevices: function () {
        return currentDevices;
      },
      clear: function() {

        currentDevices = [];
        config = {};
      }
    };
  });
