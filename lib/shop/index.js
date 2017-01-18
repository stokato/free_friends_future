/**
 * Created by s.t.o.k.a.t.o on 11.01.2017.
 *
 * Обработка товаров
 */

const express   = require('express');
const router    = express.Router();
const checkAuth = require('./../passport/is_autenticated');

const addCoins      = require('./lib/add_coin');
const getCoins      = require('./lib/get_coins');
const updateCoins   = require('./lib/update_coin');
const addGift       = require('./lib/add_good');
const getGifts      = require('./lib/get_goods');
const updateGift    = require('./lib/update_good');
const deleteGood    = require('./lib/delete_good');
const deleteCoins   = require('./lib/delete_coins');

router.get('/coins', checkAuth, getCoins);

router.post('/coins', checkAuth, function (req, res, next) {
  if(req.body.operation_type == 'insert') {
    addCoins(req, res, next);
  } else if(req.body.operation_type == 'update') {
    updateCoins(req, res, next);
  } else if(req.body.operation_type == 'delete') {
    deleteCoins(req, res, next);
  } else {
    next(new Error('not implemented'));
  }
});

router.get('/gifts', checkAuth, getGifts);

router.post('/gifts', checkAuth, function (req, res, next) {
  if(req.body.operation_type == 'insert') {
    addGift(req, res, next);
  } else if(req.body.operation_type == 'update') {
    updateGift(req, res, next);
  } else if(req.body.operation_type == 'delete') {
    deleteGood(req, res, next);
  } else {
    next(new Error('not implemented'));
  }
});

module.exports = router;
