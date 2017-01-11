/**
 * Created by s.t.o.k.a.t.o on 11.01.2017.
 *
 * Обработка товаров
 */

const express   = require('express');
const router    = express.Router();
const checkAuth = require('./../passport/is_autenticated');

const addCoin     = require('./lib/add_coin');
const getCoins    = require('./lib/get_coins');
const updateCoin  = require('./lib/update_coin');
const addGift     = require('./lib/add_gift');
const getGifts    = require('./lib/get_gifts');
const updateGift  = require('./lib/update_gift');
const deleteGood  = require('./lib/delete_good');

router.get('/coins', checkAuth, getCoins);

router.post('/coins', checkAuth, function (req, res, next) {
  if(req.body.operation_type == 'insert') {
    addCoin(req, res, next);
  } else if(req.body.operation_type == 'update') {
    updateCoin(req, res, next);
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
  } else {
    next(new Error('not implemented'));
  }
});

router.post('/', checkAuth, function (req, res, next) {
  if(req.body.operation_type == 'delete') {
    deleteGood(req, res, next);
  } else {
    next(new Error('not implemented'));
  }
});

module.exports = router;
