'use strict';

var _ = require('lodash');
var Device = require('./device.model');
var moment = require('moment');
var User = require('../user/user.model');
var Follower = require('../follower/follower.model');
var rest = require('../../components/polling');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

// Get list of devices
exports.index = function(req, res) {
  Device.find(function (err, devices) {
    if(err) { return handleError(res, err); }
    return res.json(200, devices);
  });
};

// Get a single device
exports.show = function(req, res) {
  Device.findById(req.params.id, function (err, device) {
    if(err) { return handleError(res, err); }
    if(!device) { return res.send(404); }
    return res.json(device);
  });
};

// Creates a new device in the DB.
exports.create = function(req, res) {

  //create if serial is unique
  Device.findOne({serial:req.body.serial}, function(err, device){
    if(err) { return handleError(res, err); }
    //if not found create new device
    if(!device) {
      Device.create(req.body, function(err, devic) {
        if(err) { return handleError(res, err); }
        if(!devic) { return res.send(404); }
        return res.json(201, devic);
      });
    }
    return res.send(200);
  });

};

// Updates an existing device in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Device.findById(req.params.id, function (err, device) {
    if (err) { return handleError(res, err); }
    if(!device) { return res.send(404); }
    var updated = _.merge(device, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, device);
    });
  });
};

// Deletes a device from the DB.
exports.destroy = function(req, res) {
  Device.findById(req.params.id, function (err, device) {
    if(err) { return handleError(res, err); }
    if(!device) { return res.send(404); }

    Follower.find({}, function(err,followers){
      if(err) { return handleError(res, err); }
      if(!followers) { console.log('no profile'); }
      var modif=false;
      _.forEach(followers,function(follower){

        for (var i in follower.watchs){
          console.log(device._id);
          if(follower.watchs[i].device==device._id){
            follower.watchs.splice(i,1);
            modif=true;
            console.log(follower.watchs);
          }
        }
        for (var i in follower.accepted){
          if(follower.accepted[i].device==device._id){
            follower.accepted.splice(i,1);
            modif=true;
          }
        }
        for (var i in follower.waitlist){
          if(follower.waitlist[i].device==device._id){
            follower.waitlist.splice(i,1);
            modif=true;
          }
        }
        for (var i in follower.waiting){
          if(follower.waiting[i]==device._id){
            follower.waiting.splice(i,1);
            modif=true;
          }
        }
        if(modif){
          follower.save(function (err) {
            if (err) { return handleError(res, err); }
          });
        }

      });

      device.remove(function(err) {
        if(err) { return handleError(res, err); }
        return res.send(204);
      });
    });
  });
};

exports.getData= function(){
  Device.find({}).populate('_constructor').exec(function (err, devices) {
    if(err) { console.log('error: '+err)}
    if(!devices){console.log('no devices found');}
    _.forEach(devices,function(device){

      if(device._owner && device._constructor){

        _.forEach (device.streams, function(stream){
          var config = {
            host: 'api.orange.com',
            port:443,
            path: '/datavenue/v1/datasources/'+device.ds_id+'/streams/'+stream.id+'/values',
            headers : {
              'X-ISS-Key':device.apikeys[0],
              'X-OAPI-Key':device._constructor.idclient,
              'Content-Type': 'application/json'
            }
          };
          rest.getJSON(config, function(statusCode, result) {
            if (result){
              _.forEach(result, function(res){
                var date = new Date(res.at);
                if (stream.lastPost==null || date>stream.lastPost){
                  stream.lastValue= res.value;
                  stream.location=res.location;
                  stream.lastPost=date;
                  stream.values.push({value:res.value,time:date});
                  device.save(function(err) {
                    if (err) console.log(err);
                  });
                }
              });
            }
          });
        });
        if(_.contains(device.group,'GPS')){
          _.forEach (device.streams, function(stream){
            if(stream.name=='Latitude'){

            }
            if(stream.name=='Longitude'){

            }
          });
        }
      }

    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
