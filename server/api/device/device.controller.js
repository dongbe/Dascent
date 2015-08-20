
'use strict';

var _ = require('lodash');
var Device = require('./device.model');
var User = require('../user/user.model');
var Profile = require('../profile/profile.model');
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
  Device.find({name:req.params.id}, function (err, device) {
    if(err) { return handleError(res, err); }
    if(!device) { return res.send(404); }
    return res.json(device);
  });
};

// Creates a new device in the DB.
exports.create = function(req, res) {

  //create if serial is unique
  Device.findOne({ds_id:req.body.ds_id, serial:req.body.serial}, function(err, device){
    if(err) { return handleError(res, err); }
    //if not found create new device
    if(!device) {
      if(!req.body.group){
        var dev={};
        dev=req.body;
        dev.group=[];
        dev.group[0]="LORA";
        Device.create(dev, function(err, lora) {
          if(err) { return handleError(res, err); }
          if(!lora) { return res.send(404); }
          return res.json(201, lora);
        });
      }else{
        Device.create(req.body, function(err, newDevice) {
          if(err) { return handleError(res, err); }
          if(!newDevice) { return res.send(404); }
          return res.json(201, newDevice);
        });
      }

    }
    return res.send(200);
  });

};

// Creates a new phone device in the DB.
exports.createPhone = function(req, res) {

  //create if serial is unique
  Device.findOne({serial:req.body.serial}, function(err, device){
    if(err) { return handleError(res, err); }
    //if not found create new phone device
    if(!device) {
      Device.create(req.body, function(err, devic) {
        if(err) { return handleError(res, err); }
        if(!devic) { return res.send(404); }
        return res.json(201, devic);
      });
    } else {
      return res.json(304,device);
    }
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

    Profile.find({}, function(err,followers){
      if(err) { return handleError(res, err); }
      if(!followers) { console.log('no profile'); }
      var modif=false;
      _.forEach(followers,function(follower){

        for (var i in follower.watchs){
          if(follower.watchs[i].device===device._id){
            follower.watchs.splice(i,1);
            modif=true;
            console.log(follower.watchs);
          }
        }
        for (var y in follower.accepted){
          if(follower.accepted[y].device===device._id){
            follower.accepted.splice(y,1);
            modif=true;
          }
        }
        for (var x in follower.waitlist){
          if(follower.waitlist[x].device===device._id){
            follower.waitlist.splice(x,1);
            modif=true;
          }
        }
        for (var z in follower.waiting){
          if(follower.waiting[z]===device._id){
            follower.waiting.splice(z,1);
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

// Polling mode - get data from datavenue
exports.getData= function(){
  Device.find({}).populate('_constructor').exec(function (err, devices) {
    if(err) { console.log('error: '+err)}
    if(!devices){console.log('no devices found');}
    _.forEach(devices,function(device){

      if(device._owner && device._constructor && device.group[0]!=='AE'){

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
                if (stream.lastPost===null || date>stream.lastPost){
                  if(stream.name!=='message'){
                    stream.lastValue= res.value;
                    stream.location=res.location;
                    stream.lastPost=date;
                    stream.values.push({value:res.value,time:date});
                  }else{
                    var extracted=[];
                    for (var y=0;y<=res.value.length-2;y=y+2){
                      extracted.push(parseInt(res.value.slice(y,y+2),16));
                    }
                    stream.lastValue= res.value;
                    stream.location=extracted[8]+extracted[9]+extracted[10]+'/'+extracted[11]+extracted[12]+extracted[13];
                    stream.lastPost=date;
                    stream.values.push({value:res.value,time:date});
                  }

                  device.save(function(err) {
                    if (err) console.log(err);
                  });
                }
              });
            }
          });
        });
      }
      else if(device._owner && device._constructor && device.group[0]==='AE'){
        var stconfig={
          host:'iotsandbox.cisco.com',
          port:8888,
          method:'GET',
          path:'/stdacsent/stdtAE/stdtContainer2?rcn=4',
          headers:{
            'Content-Type': 'application/json',
            'X-M2M-Origin': '//iotsandbox.cisco.com:10000',
            'X-M2M-RI': 12345
          }
        };

        rest.getJSON(stconfig, function(statusCode, result) {
          if (result) {
            _.forEach(result.ch, function (res) {
              var time = res.lt.slice(0,4)+'-'+res.lt.slice(4,6)+'-'+res.lt.slice(6,11)+':'+res.lt.slice(11,13)+':'+res.lt.slice(13,15);
              var date = new Date(time);
              if (res.rty == 4 && date>device.lastPost) {
                device.streams[0].lastValue= res.con;
                device.lastPost=date;
                device.streams[0].values.push({value:res.con,time:date});

                device.save(function(err) {
                  if (err) console.log(err);
                });
              }

            });
          }
      });
      }
  });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
