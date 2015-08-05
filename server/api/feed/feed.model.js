'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FeedSchema = new Schema({
  id:String,
  ds_id:String,
  name:String,
  lastValue: Number,
  values: [{
    value:Number,
    time:Date
  }],
  lastPost: { type: Date }
});

module.exports = mongoose.model('Feed', FeedSchema);
