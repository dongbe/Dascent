'use strict';

var User = require('./user.model');
var Device = require('../device/device.model');
var Follower = require('../follower/follower.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var auth = require('../../auth/auth.service');
var https= require('https');

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  https.get("https://www.google.com/recaptcha/api/siteverify?secret=6LfJBggTAAAAAL1BdFIvIb_EIPkeJLArFk8xaZ2A&response=" + req.body.key, function(rest) {
    var data = "";
    rest.on('data', function (chunk) {
      data += chunk.toString();
    });
    rest.on('end', function() {
      try {
        var parsedData = JSON.parse(data);
        console.log(parsedData);

        if(parsedData.success){
          var newUser = new User(req.body);
          newUser.provider = 'local';
          if(newUser.isskey) newUser.role = 'constructor';
          else
            newUser.role = 'user';

          //create empty follower list
          Follower.create({user:newUser._id, accepted:[], waitlist:[], watchs:[],waiting:[]}, function(err, follower) {
            if(err) { return  next(err);}
            newUser._profile=follower._id;
            newUser.save(function(err, user) {
              if (err) return validationError(res, err);
              var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
              res.json({ token: token });
            });
          });
        }else{
          return res.json(422);
        }
      } catch (e) {
        return res.json(422);
      }
    });
  });



};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};
/*
 * get all devices from a constructor
 */
exports.createDevices = function(req, res, next) {
  var userId = req.user._id;
  var device = new Device(req.body);
  device._constructor=userId;
  device.save(function(err, device) { // don't ever give out the password or salt
    if (err) return validationError(res, err);
    if (!device) return res.json(401);
    res.json(device);
  });
};

exports.confirm = function(req, res){
  //Follower.find({})
  console.log(req);
  Device.findById(req.body.device, function(err,device){
    if(err) return res.send(500, err);
    if (!device) return res.json(401);
    User.findById(req.user._id,'-salt -hashedPassword', function (err, user) {
      if(err) return res.send(500, err);
      if (!user) return res.json(401);
      user.watchs.push(device._id);
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.json(201, device);
      });
    });
  });

};

exports.devices = function(req, res) {
  var userId = req.user._id;
        Device.find({
          _constructor: userId
        }, '-location -streams', function(err, devices) { // don't ever give out the password or salt
          if (err) return res.send(500, err);
          if (!devices) return res.json(401);
          return res.json(200,devices);
        });
};

exports.followers = function(req, res) {
  var userId = req.user._id;
  Follower.findOne({
    user: userId
  }).populate('waitlist.user waitlist.device accepted.user accepted.device watchs.device watchs.device.streams waiting','-salt -hashedPassword').exec( function(err, ff) { // don't ever give out the password or salt
    if (err) return res.send(500, err);
    if (!ff) return res.json(401);
    return res.json(200,ff);
  });
};

exports.addDevice = function(req, res) {
  var userId = req.user._id;//current user
  var serial = req.body.serial;// serial device
  if (req.body.password) {
    var pass = req.body.password;//pass for ownership
  }
  Device.findOne({
    serial: serial
  }, '-location -streams', function (err, device) { // don't ever give out the password or salt
    if (err) return res.send(500, err);
    if (!device) return res.json(401);

    //change ownership

    //Add device to my profile's lists
    Follower.findOne({
      user: userId
    }, function (err, follower) {

      if (err) return res.send(500, err);
      if (!follower) return res.json(401);

      //if password that means owner so
      // create follower list update
      // device information
      if (pass) {
        //add device to watch list
        follower.watchs.push({device: device._id, type: true});

        follower.save(function (err) {
          if (err) return validationError(res, err);
          //res.json(201);
        });

        //add device ownership info
        device._owner = userId;

        //save device
        device.save(function (err) {
          if (err) return validationError(res, err);
          //res.json(201, device);
        });

      } else {
        //add device to waiting list
        follower.waiting.push(device._id);
        follower.save(function (err) {
          if (err) return validationError(res, err);
          //res.json(201);
        });

        Follower.findOne({
          user: device._owner
        }, function (err, foll) {

          if (err) return res.send(500, err);
          if (!foll) return res.json(401);
          //add device to waitlist of the owner
          foll.waitlist.push({user: userId, device: device._id});
          //save owner profile
          foll.save(function (err) {
            if (err) return validationError(res, err);
          });
        });
      }
    });
    return res.json(201, device);
  });
};
/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
