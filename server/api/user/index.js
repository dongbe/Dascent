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
router.get('/avatar/:id', controller.serveFile);
router.post('/:id/confirm', auth.isAuthenticated(), controller.confirm);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id/profiles', auth.hasRole('user'), controller.profile);
router.get('/:id/devices', auth.isAuthenticated(), controller.devices);
router.post('/:id/devices', auth.hasRole('user'), controller.addDevice);

router.post('/:id/avatar', auth.isAuthenticated(), controller.postImage);

module.exports = router;
