/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 * 
 * Обработка запросов к статистике
 */

var log = require('./../log')(module);
var express = require('express');
var router = express.Router();

var getMainStat = require('./lib/get_main_stat');
var getUserStat = require('./lib/get_user_stat');

router.get('/main', getMainStat);
router.get('/user', getUserStat);

module.exports = router;
