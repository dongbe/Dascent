/**
 * Created by donatien-gbe on 31/03/15.
 */
/**
 * Created by donatien-gbe on 31/03/15.
 */
'use strict'

angular.module('dascentApp')
  .factory('ManDev', function ($q, $cookieStore, $http, User, Auth) {
    var currentDevices = [];
    var currentUser = {};
    var config = {};

    return {
      config: function(){
        if(Auth.isLoggedIn() && !Auth.isAdmin()) {
          currentUser = Auth.getCurrentUser();
          console.log('current user: '+currentUser);
        }

        if (currentUser && Auth.isLoggedIn()) {
          //currentDevices = User.getDevices({id: currentUser._id});
          config = {
            headers: {
              'X-ISS-Key': currentUser.isskey,
              'X-OAPI-Key': currentUser.idclient,
              'Content-Type': 'application/json'
            }
          };

        }
      },
      confirm: function (profile, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        console.log('ici');

        $http.post('/api/followers/'+profile.id+'/confirm', {user:profile.demand.user._id,device:profile.demand.device._id})
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
        $http.post('/api/followers/'+profile.id+'/cancel', {user:profile.demand._owner,device:profile.demand._id})
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
        $http.post('/api/followers/'+profile.id+'/cancel', {user:profile.demand.user._id,device:profile.demand.device._id, options:'request'})
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

        $http.post('/api/followers/'+profile.id+'/discard', {user:profile.demand.user._id,device:profile.demand.device._id})
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
        $http.post('/api/users/' + currentUser._id + '/devices', device)
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

        return $http.post('https://api.orange.com/datavenue/v1/datasources', device, config)
          .success(function (data) {
            var device = {};
            var deferred = $q.defer();

            device.ds_id = data.id;
            device.name = data.name;
            device.description = data.description;
            device.serial = data.serial;
            device.group = [];
            device.group = data.group;
            device._constructor = currentUser._id;
            $http.post('/api/devices', device)
              .success(function (data) {
                deferred.resolve(data);
                return cb();
              }).
              error(function (err) {
                deferred.reject(err);
                return cb(err);
              }.bind(this));
            return deferred.promise;
          })
          .error(function (err) {
            console.log(err);
          }.bind(this)).$promise;

      },
      getData: function(id)
      {

        return

      },

      //get a device from datavenue API and save information in local database
      importDevice: function (callback) {
        this.config();
        var cb = callback || angular.noop;
        var def=$q.defer();

        var devices=[];
        $http.get('https://api.orange.com/datavenue/v1/datasources', config)
          .success(function (data) {
            console.log(data);


            angular.forEach(data, function(d){
              var deferred = $q.defer();
              var device = {};
              device.ds_id = d.id;
              device.name = d.name;
              device.description = d.description;
              device.serial = d.serial;
              device._constructor = currentUser._id;
              device.group = d.group;
              device.streams = [];
              device.apikeys = [];

              $q.all([
                $http.get('https://api.orange.com/datavenue/v1/datasources/'+device.ds_id+'/streams',config).success(function(data){deferred.resolve(data);}),
                $http.get('https://api.orange.com/datavenue/v1/datasources/'+device.ds_id+'/keys',config).success(function(data){deferred.resolve(data);})])
                .then(function (ret) {
                  var streams=[];
                  var apikeys=[];

                  for (var y in ret[1].data) {
                    for(var x in ret[1].data[y].rights) {
                      if (ret[1].data[y].rights[x]=='GET') {
                        apikeys.push(ret[1].data[y].value);
                      }
                    }
                  }

                  angular.forEach(ret[0].data, function(st) {
                    console.log(st);
                    streams.push({
                      id: st.id,
                      name: st.name,
                      lastValue: st.lastValue,
                      values: st.lastValue ? [{value: st.lastValue, time: new Date()}] : [],
                      lastPost: new Date()
                    });
                  });
                  device.streams=streams;
                  device.apikeys=apikeys;
                  $http.post('/api/devices',device).success(function(data){
                    def.resolve(data);
                  }).error(function(error){
                    def.reject(error);
                  });
                });
            });
          })
          .error(function (data) {
            console.log(data);
          });
        return def.promise;
      },
      removeDevice: function (callback, device) {
        var cb = callback || angular.noop;

      },
      deleteDevice: function (callback, device) {
        var cb = callback || angular.noop;

      },
      getCurrentDevices: function () {
        return currentDevices;
      },
      clear: function() {

        currentDevices = [];
        config = {};
      }
    }
  });
