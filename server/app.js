/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var express = require('express');
var data=require('./api/device/device.controller').getData;
var fs = require('fs');
var mongoose = require('mongoose');
var config = require('./config/environment');
require('ssl-root-cas/latest').inject();

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server

var app = express();
var cors = require('cors');
var server = require('http').createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: (config.env === 'production') ? false : true,
  path: '/socket.io-client'
});
app.use(cors());
require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

setInterval(function(){
  console.log('polling mode ....');
  //data();
}, 1 * 5000 * 1000);

// Expose app
exports = module.exports = app;
