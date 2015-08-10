'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var User = require('../user/user.model');
var _ = require('lodash');

var DeviceSchema = new Schema({
  ds_id: String,
  _constructor:{ type: Schema.Types.ObjectId, ref: 'User' },
  name: String,
  serial: String,
  description: String,
  apikeys: [String],
  group:[String],
  _owner: { type: Schema.Types.ObjectId, ref: 'User' },
  location : String,
  streams: [
    { id:String,
    name:String,
    lastValue: Object,
    location:{
        longitude:Number,
        latitude: Number,
        elevation:Number
      },
    values: [{
      value:Object,
      time:Date
    }],
    lastPost: { type: Date } }],
  tracking:{
    type: Boolean,
    default: false
  }
});


module.exports = mongoose.model('Device', DeviceSchema);
