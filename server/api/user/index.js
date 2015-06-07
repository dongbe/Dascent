'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.post('/:id/confirm', auth.isAuthenticated(), controller.confirm);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/me/devices', auth.isAuthenticated(), controller.devices);
router.get('/me/followers', auth.hasRole('user'), controller.followers);
router.post('/:id/devices', auth.hasRole('user'), controller.addDevice);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);

module.exports = router;
