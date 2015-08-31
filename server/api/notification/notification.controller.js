'use strict';

var _ = require('lodash');
var Device = require('../device/device.model');
var rest = require('../../components/polling');
var Notification = require('./notification.model');

// Get list of notifications
exports.index = function (req, res) {
  Notification.find(function (err, notifications) {
    if (err) {
      return handleError(res, err);
    }
    return res.json(200, notifications);
  });
};

// Get a single notification
exports.show = function (req, res) {
  Notification.findById(req.params.id, function (err, notification) {
    if (err) {
      return handleError(res, err);
    }
    if (!notification) {
      return res.send(404);
    }
    return res.json(notification);
  });
};

// Creates a new notification in the DB.
exports.create = function (req, res) {
  var nouveau = false;
  Device.findOne({
    ds_id: req.body.device.ds_id
  }, function (err, device) {
    if (err) {
      return handleError(res, err);
    }
    if (!device) {
      return res.send(404);
    }
    _.forEach(device.streams, function (stream) {
      rest.postJSON(req.body.location, {id: device.ds_id, stream: stream.id}, function (result) {
        if (result) {
          nouveau = true;
          console.log("saving data");
          var date = new Date(result.at);
          stream.lastValue = req.body.location;
          stream.lastPost = date;
          stream.values.push({value: req.body.location, time: date});
          device.save(function (err) {
            if (err) console.log(err);
          });
        }
      });
    });

  });
  res.json(200);
};

// Updates an existing notification in the DB.
exports.update = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Notification.findById(req.params.id, function (err, notification) {
    if (err) {
      return handleError(res, err);
    }
    if (!notification) {
      return res.send(404);
    }
    var updated = _.merge(notification, req.body);
    updated.save(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(200, notification);
    });
  });
};

// Deletes a notification from the DB.
exports.destroy = function (req, res) {
  Notification.findById(req.params.id, function (err, notification) {
    if (err) {
      return handleError(res, err);
    }
    if (!notification) {
      return res.send(404);
    }
    notification.remove(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
