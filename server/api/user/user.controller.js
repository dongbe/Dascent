'use strict';

var User = require('./user.model');
var Device = require('../device/device.model');
var Profile = require('../profile/profile.model');
var rest = require('../../components/polling');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var auth = require('../../auth/auth.service');
var _ = require('lodash');
var multiparty = require('multiparty');
var uuid = require('node-uuid');
var path = require('path');
var fs = require('fs');
var https = require('https');

var validationError = function (res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function (req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if (err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  https.get("https://www.google.com/recaptcha/api/siteverify?secret=6Ld4yAsTAAAAAJZ2pkx_xxwy8_V9EsuHZ3sZDuXx&response=" + req.body.key, function (rest) {
    var data = "";
    rest.on('data', function (chunk) {
      data += chunk.toString();//response from google recaptcha
    });
    rest.on('end', function () {
      try {
        var parsedData = JSON.parse(data);
        if (parsedData.success) {
          var newUser = new User(req.body);
          if (newUser.isskey !== undefined) {
            newUser.role = 'constructor';
          } else {
            //create a profile for users if not device provider
            Profile.create({
              user: newUser._id,
              accepted: [],
              waitlist: [],
              watchs: [],
              waiting: []
            }, function (err, profile) {
              if (err) {
                return next(err);
              }
              newUser._profile = profile._id;
              newUser.avatar = '90a4c5ab-455f-44f2-a100-0af87bdb724b.jpg';//default picture on account creation
            });
          }
          newUser.save(function (err, user) {
            if (err) return validationError(res, err);
            var token = jwt.sign({_id: user._id}, config.secrets.session, {expiresInMinutes: 60 * 5});
            res.json({token: token});
          });
        } else {
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
  var userId = req.user._id;
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
exports.destroy = function (req, res) {
  User.findByIdAndRemove(req.params.id, function (err, user) {
    if (err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Update user information
 * @param req
 * @param res
 */
exports.update = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  User.findById(req.params.id, function (err, user) {
    if (err) {
      return res.send(401);
    }
    if (!user) {
      return res.send(404);
    }
    var updated = _.merge(user, req.body);
    updated.save(function (err) {
      if (err) {
        return res.json(401);
      }
      return res.json(200, user);
    });
  });
};

/**
 * Change a users password
 */
exports.changePassword = function (req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if (user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function (err) {
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
exports.me = function (req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function (err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};


/*
 * get all devices from a constructor
 */
exports.createDevices = function (req, res, next) {
  var userId = req.user._id;
  var device = new Device(req.body);
  device._constructor = userId;
  device.save(function (err, device) { // don't ever give out the password or salt
    if (err) return validationError(res, err);
    if (!device) return res.json(404);
    res.json(device);
  });
};


/**
 * Confirm a subscription request
 * @param req
 * @param res
 */
exports.confirm = function (req, res) {
  //Profile.find({})
  console.log(req);
  Device.findById(req.body.device, function (err, device) {
    if (err) return res.send(500, err);
    if (!device) return res.json(404);
    User.findById(req.user._id, '-salt -hashedPassword', function (err, user) {
      if (err) return res.send(500, err);
      if (!user) return res.json(404);
      user.watchs.push(device._id);
      user.save(function (err) {
        if (err) return validationError(res, err);
        res.json(201, device);
      });
    });
  });

};

/**
 * Get all devices of device provider
 * @param req
 * @param res
 */
exports.devices = function (req, res) {
  var userId = req.user._id;
  Device.find({
    _constructor: userId
  }, '-location -streams', function (err, devices) { // don't ever give out the password or salt
    if (err) return res.send(500, err);
    if (!devices) return res.json(404);
    return res.json(200, devices);
  });
};


/**
 * Get a user profile
 * @param req
 * @param res
 */
exports.profile = function (req, res) {
  Profile.findById(req.user._profile).populate('waitlist.user waitlist.device accepted.user accepted.device watchs.device watchs.device.streams waiting', '-salt -hashedPassword').exec(function (err, ff) { // don't ever give out the password or salt
    if (err) return res.send(500, err);
    if (!ff) return res.json(404);
    return res.json(200, ff);
  });
};


/**
 * Add a device to a profile
 * @param req
 * @param res
 */
exports.addDevice = function (req, res) {

  var userId = req.user._id;//current user
  var serial = req.body.serial;// serial device
  if (req.body.password) {
    var pass = req.body.password;//pass for ownership
  }
  Device.findOne({
    serial: serial
  }, '-location -streams', function (err, device) { // don't ever give out the password or salt

    if (err) return res.send(500, err);
    if (!device) {
      return res.send(404);
    }
    //change ownership
    //Add device to my profile's lists
    Profile.findOne({
      user: userId
    }, function (err, follower) {

      if (err) return res.send(500, err);
      if (!follower) return res.json(404);

      //if password that means owner so
      // create follower list update
      // device information
      if (pass && device._owner==undefined) {
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

        Profile.findOne({
          user: device._owner
        }, function (err, foll) {

          if (err) return res.send(500, err);
          if (!foll) return res.json(404);
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


exports.createDevices = function (req, res) {

  var userId = req.params.id;//current user
  var config = {
    host: 'iotsandbox.cisco.com',
    port: 8888,
    method: 'GET',
    path: '/stdacsent?rcn=4',
    headers: {
      'Content-Type': 'application/json',
      'X-M2M-Origin': '//iotsandbox.cisco.com:10000',
      'X-M2M-RI': 12345
    }
  };

  rest.getJSON(config, function (statusCode, result) {
    if (result) {
      _.forEach(result.ch, function (res) {
        var device = {};
        if (res.rty == 2) {
          device.ds_id = res.ri;
          device.name = res.apn;
          device.description = res.or;
          device.serial = res.api;
          device._constructor = userId;
          device.link = res.rn;
          device.group = ['AE'];
          device.streams = [{id: 'st', name: 'st', lastValue: '', values: []}];
          var time = res.lt.slice(0, 4) + '-' + res.lt.slice(4, 6) + '-' + res.lt.slice(6, 11) + ':' + res.lt.slice(11, 13) + ':' + res.lt.slice(13, 15);
          var date = new Date(time);
          device.lastPost = date;

          Device.create(device, function (err) {
            if (err) console.log(err);
            console.log(device);
          });

        }

      });
      return res.json(201);
    }
    return res.json(304);
  });

};


/**
 * return profile image
 * @param req
 * @param res
 */
exports.serveFile = function (req, res) {
  res.sendfile(path.resolve('server/images') + '/' + req.params.id);
};

/**
 * add image to server
 * @param req
 * @param res
 */
exports.postImage = function (req, res) {

  var form = new multiparty.Form();
  form.parse(req, function (err, fields, files) {
    var file = files.file[0];
    var contentType = file.headers['content-type'];
    var tmpPath = file.path;
    var extIndex = tmpPath.lastIndexOf('.');
    var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
    // uuid is for generating unique filenames.

    var fileName = uuid.v4() + extension;
    var destPath = path.resolve('server/images') + '/' + fileName;
    console.log(destPath);
    // Server side file type checker.
    if (contentType !== 'image/png' && contentType !== 'image/jpeg') {
      fs.unlink(tmpPath);
      return res.status(400).send('Unsupported file type.');
    }

    fs.rename(tmpPath, destPath, function (err) {
      if (err) {
        console.log('Image is not saved ' + err);
        return res.status(400).send('Image is not saved:');
      }
      User.findById(req.params.id, function (err, user) {
        if (err) return res.send(500, err);
        if (!user) return res.json(401);
        user.avatar = fileName;
        user.save(function (err) {
          if (err) return validationError(res, err);
        });
      });
      return res.json(200, fileName);
    });
  });
};
/**
 * Authentication callback
 */
exports.authCallback = function (req, res, next) {
  res.redirect('/');
};
