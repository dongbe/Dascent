'use strict';

var _ = require('lodash');
var Follower = require('./follower.model');

// Get list of followers
exports.index = function(req, res) {
  Follower.find(function (err, followers) {
    if(err) { return handleError(res, err); }
    return res.json(200, followers);
  });
};

// Get a single follower
exports.show = function(req, res) {
  Follower.findById(req.params.id).populate('watchs waiting accepted waitlist').exec(function (err, follower) {
    if(err) { return handleError(res, err); }
    if(!follower) { return res.send(404); }
    return res.json(200,follower);
  });
};

// Creates a new follower in the DB.
exports.create = function(req, res) {
  Follower.create(req.body, function(err, follower) {
    if(err) { return handleError(res, err); }
    return res.json(201, follower);
  });
};

// Updates an existing follower in the DB.
exports.update = function(req, res) {
  console.log(req.body._id);
  if(req.body._id) { delete req.body._id; }
  Follower.findById(req.params.id, function (err, follower) {
    if (err) { return handleError(res, err); }
    if(!follower) { return res.send(404); }
    var updated = _.merge(follower, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, follower);
    });
  });
};


exports.confirm = function(req,res){
  Follower.findOne({user:req.body.user},function(err,foll){
    if (err) { return handleError(res, err); }
    if(!foll) { return res.send(404); }

    _.forEach(foll.waiting,function(u,i){
      if(u!=undefined && u==req.body.device){
        foll.waiting.splice(i,1);
        foll.watchs.push({device:u,type:false});
      }
    });

    foll.save(function (err) {
      if (err) { return handleError(res, err); }
      //return res.json(200);
    });
  });
  Follower.findById(req.params.id, function (err, follower) {
    if (err) { return handleError(res, err); }
    if(!follower) { return res.send(404); }

    _.forEach(follower.waitlist,function(u,i){
      if(u!=undefined && u.user==req.body.user && u.device==req.body.device){
        console.log('after if: '+i);
        follower.waitlist.splice(i,1);
        follower.accepted.push(u);
      }
    });
    follower.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200);
    });
  });

};

exports.discard = function(req,res){
  Follower.findById(req.params.id, function (err, follower) {
    if (err) { return handleError(res, err); }
    if(!follower) { return res.send(404); }

    _.forEach(follower.accepted,function(u,i){
      if(u!=undefined && u.user==req.body.user && u.device==req.body.device){
        console.log('after if: '+i);
        follower.accepted.splice(i,1);
      }
    });
    follower.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200,follower);
    });
  });
  Follower.findOne({user:req.body.user},function(err,foll){
    if (err) { return handleError(res, err); }
    if(!foll) { return res.send(404); }

    _.forEach(foll.watchs,function(u,i){
      if(u!=undefined && u.device==req.body.device){
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

exports.cancel = function(req,res){

  Follower.findById(req.params.id, function (err, follower) {
    if (err) { return handleError(res, err); }
    if(!follower) { return res.send(404); }
    if(req.body.options){

      _.forEach(follower.waitlist,function(u,i){
        if(u!=undefined && u.device==req.body.device && u.user==req.body.user){
          follower.waitlist.splice(i,1);
        }
      });

      follower.save(function (err) {
        if (err) { return handleError(res, err); }
      });

      Follower.findOne({user:req.body.user},function(err,foll){
        if (err) { return handleError(res, err); }
        if(!foll) { return res.send(404); }

        _.forEach(foll.waiting,function(u,i){
          if(u!=undefined && u==req.body.device){
            foll.waiting.splice(i,1);
          }
        });
        foll.save(function (err) {
          if (err) { return handleError(res, err); }
        });
      });
      return res.json(200);
    }else{
      _.forEach(follower.waiting,function(u,i){
        if(u!=undefined && u==req.body.device){
          follower.waiting.splice(i,1);
        }
      });

      follower.save(function (err) {
        if (err) { return handleError(res, err); }

      });

      Follower.findOne({user:req.body.user},function(err,foll){
        if (err) { return handleError(res, err); }
        if(!foll) { return res.send(404); }

        _.forEach(foll.waitlist,function(u,i){
          if(u!=undefined && u.device==req.body.device && _.isEqual(u.user,follower.user)){
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
// Deletes a follower from the DB.
exports.destroy = function(req, res) {
  Follower.findById(req.params.id, function (err, follower) {
    if(err) { return handleError(res, err); }
    if(!follower) { return res.send(404); }
    follower.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
