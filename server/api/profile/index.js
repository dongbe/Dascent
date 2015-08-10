'use strict';

var express = require('express');
var controller = require('./profile.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.post('/', controller.create);
router.post('/:id/confirm', auth.isAuthenticated(), controller.confirm);
router.get('/:id', controller.show);
router.put('/:id', auth.isAuthenticated(),controller.update);
router.patch('/:id', auth.isAuthenticated(),controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

router.post('/:id/discard', auth.isAuthenticated(), controller.discard);
router.post('/:id/cancel', auth.isAuthenticated(), controller.cancel);
module.exports = router;
