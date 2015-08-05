/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Follower = require('./profile.model');

exports.register = function(socket) {
  Follower.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Follower.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  Follower.populate(doc,'waitlist.user waitlist.device accepted.user accepted.device watchs.device watchs.device.streams waiting',function(err,foll){
    socket.emit('profile:save', doc);
  });

}

function onRemove(socket, doc, cb) {
  Follower.populate(doc,'waitlist.user waitlist.device accepted.user accepted.device watchs.device watchs.device.streams waiting',function(err,foll){
    socket.emit('profile:remove', doc);
  });

}
