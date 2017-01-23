/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Модуль статистики
 *
 */

const setMainStat = require('./lib/set_main_stat');
const getMainStat = require('./lib/get_main_stat');
const setUserStat = require('./lib/set_user_stat');
const getUserStat = require('./lib/get_user_stat');

let StatCtrlr = function () {};

StatCtrlr.prototype._isNumeric = function(val) { // Проверка - явлеется ли аргумент числом
  return !isNaN(parseFloat(val)) && isFinite(val);
};

StatCtrlr.prototype.setMainStat = setMainStat;
StatCtrlr.prototype.getMainStat = getMainStat;
StatCtrlr.prototype.setUserStat = setUserStat;
StatCtrlr.prototype.getUserStat = getUserStat;

module.exports = StatCtrlr;