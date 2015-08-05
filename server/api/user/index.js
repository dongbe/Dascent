'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/', controller.create);
router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.post('/:id/confirm', auth.isAuthenticated(), controller.confirm);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/me/profiles', auth.hasRole('user'), controller.profile);
router.get('/:id/devices', auth.isAuthenticated(), controller.devices);
router.post('/:id/devices', auth.hasRole('user'), controller.addDevice);
router.get('/:id/avatar', auth.isAuthenticated(), controller.serveFile);
router.post('/:id/avatar', auth.isAuthenticated(), controller.postImage);

module.exports = router;
