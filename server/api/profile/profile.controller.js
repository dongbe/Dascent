'use strict';

var _ = require('lodash');
var Profile = require('./profile.model');

// Get list of user profile
exports.index = function(req, res) {
  Profile.find(function (err, profiles) {
    if(err) { return handleError(res, err); }
    return res.json(200, profiles);
  });
};

// Get a single user profile
exports.show = function(req, res) {
  Profile.findById(req.params.id).populate('watchs waiting accepted waitlist').exec(function (err, profile) {
    if(err) { return handleError(res, err); }
    if(!profile) { return res.send(404); }
    return res.json(200,profile);
  });
};

// Creates a new profile in the DB.
exports.create = function(req, res) {
  Profile.create(req.body, function(err, profile) {
    if(err) { return handleError(res, err); }
    return res.json(201, profile);
  });
};

// Updates an existing profile in the DB.
exports.update = function(req, res) {
  console.log(req.body._id);
  if(req.body._id) { delete req.body._id; }
  Profile.findById(req.params.id, function (err, profile) {
    if (err) { return handleError(res, err); }
    if(!profile) { return res.send(404); }
    var updated = _.merge(profile, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, profile);
    });
  });
};

/**
 * Confirm the subscription of a device in a user profile
 * @param req
 * @param res
 */
exports.confirm = function(req,res){
  Profile.findOne({user:req.body.user},function(err,followerProfile){
    if (err) { return handleError(res, err); }
    if(!followerProfile) { return res.send(404); }

    _.forEach(followerProfile.waiting,function(deviceId,i){
      if(deviceId!==undefined && deviceId==req.body.device){
        followerProfile.waiting.splice(i,1);
        followerProfile.watchs.push({device:deviceId,type:false});
      }
    });

    followerProfile.save(function (err) {
      if (err) { return handleError(res, err); }
      //return res.json(200);
    });
  });

  Profile.findById(req.params.id, function (err, ownerProfile) {
    if (err) { return handleError(res, err); }
    if(!ownerProfile) { return res.send(404); }

    _.forEach(ownerProfile.waitlist,function(u,i){
      if(u!==undefined && u.user==req.body.user && u.device==req.body.device){
        ownerProfile.waitlist.splice(i,1);
        ownerProfile.accepted.push(u);
      }
    });
    ownerProfile.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200);
    });
  });

};

/**
 * Discard the subscription of a device in a user profile
 * @param req
 * @param res
 */
exports.discard = function(req,res){
  Profile.findById(req.params.id, function (err, profile) {
    if (err) { return handleError(res, err); }
    if(!profile) { return res.send(404); }

    _.forEach(profile.accepted,function(u,i){
      if(u!==undefined && u.user===req.body.user && u.device===req.body.device){
        console.log('after if: '+i);
        profile.accepted.splice(i,1);
      }
    });
    profile.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200,profile);
    });
  });
  Profile.findOne({user:req.body.user},function(err,foll){
    if (err) { return handleError(res, err); }
    if(!foll) { return res.send(404); }

    _.forEach(foll.watchs,function(u,i){
      if(u!==undefined && u.device===req.body.device){
        console.log('after if: '+i);
        foll.watchs.splice(i,1);
      }
    });

    foll.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200);
    });
  });
};

/**
 * Cancel the request of a device in a user profile
 * @param req
 * @param res
 */
exports.cancel = function(req,res){

  Profile.findById(req.params.id, function (err, profile) {
    if (err) { return handleError(res, err); }
    if(!profile) { return res.send(404); }
    if(req.body.options){

      _.forEach(profile.waitlist,function(u,i){
        if(u!==undefined && u.device===req.body.device && u.user===req.body.user){
          profile.waitlist.splice(i,1);
        }
      });

      profile.save(function (err) {
        if (err) { return handleError(res, err); }
      });

      Profile.findOne({user:req.body.user},function(err,foll){
        if (err) { return handleError(res, err); }
        if(!foll) { return res.send(404); }

        _.forEach(foll.waiting,function(u,i){
          if(u!==undefined && u===req.body.device){
            foll.waiting.splice(i,1);
          }
        });
        foll.save(function (err) {
          if (err) { return handleError(res, err); }
        });
      });
      return res.json(200);
    }else{
      _.forEach(profile.waiting,function(u,i){
        if(u!==undefined && u===req.body.device){
          profile.waiting.splice(i,1);
        }
      });

      profile.save(function (err) {
        if (err) { return handleError(res, err); }

      });

      Profile.findOne({user:req.body.user},function(err,foll){
        if (err) { return handleError(res, err); }
        if(!foll) { return res.send(404); }

        _.forEach(foll.waitlist,function(u,i){
          if(u!==undefined && u.device===req.body.device && _.isEqual(u.user,profile.user)){
            foll.waitlist.splice(i,1);
          }
        });
        foll.save(function (err) {
          if (err) { return handleError(res, err); }
        });
      });

      return res.json(200);
    }

  });


};

// Deletes a profile from the DB.
exports.destroy = function(req, res) {
  Profile.findById(req.params.id, function (err, profile) {
    if(err) { return handleError(res, err); }
    if(!profile) { return res.send(404); }
    profile.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
