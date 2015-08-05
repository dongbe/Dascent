'use strict';

var express = require('express');
var controller = require('./device.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.post('/', auth.hasRole('constructor'), controller.create);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.post('/phone', auth.hasRole('user'), controller.createPhone);

module.exports = router;
