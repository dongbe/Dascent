'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var Device = require('../device/device.model');
var User = require('../user/user.model');

var ProfileSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  waitlist: [
    {
      user: {type: Schema.Types.ObjectId, ref: 'User'},
      device: {type: Schema.Types.ObjectId, ref: 'Device'}
    }
  ],
  accepted: [
    {
      user: {type: Schema.Types.ObjectId, ref: 'User'},
      device: {type: Schema.Types.ObjectId, ref: 'Device'}
    }
  ],
  watchs: [
    {
      device: {type: Schema.Types.ObjectId, ref: 'Device'},
      type: {type: Boolean, default: false}
    }
  ],
  waiting: [{type: Schema.Types.ObjectId, ref: 'Device'}]
});

module.exports = mongoose.model('Profile', ProfileSchema);
