/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 * 
 * Обработка запросов к статистике
 */

const express   = require('express');
const router    = express.Router();
const checkAuth = require('./../passport/is_autenticated');

const getMainStat = require('./lib/get_main_stat');
const getUserStat = require('./lib/get_user_stat');

router.get('/main/:first_date/:second_date', checkAuth, getMainStat);
router.get('/user/:vid', checkAuth, getUserStat);

module.exports = router;
