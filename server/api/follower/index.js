'use strict';

var express = require('express');
var controller = require('./follower.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.post('/:id/confirm', controller.confirm);
router.post('/:id/discard', controller.discard);
router.post('/:id/cancel', controller.cancel);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
