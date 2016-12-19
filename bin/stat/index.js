/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Модуль статистики
 *
 */

var setMainStat = require('./lib/set_main_stat'),
    getMainStat = require('./lib/get_main_stat'),
    setUserStat = require('./lib/set_user_stat'),
    getUserStat = require('./lib/get_user_stat');

function StatManager() {}

StatManager.prototype._isNumeric = function(val) { // Проверка - явлеется ли аргумент числом
  return !isNaN(parseFloat(val)) && isFinite(val);
};

StatManager.prototype.setMainStat = setMainStat;
StatManager.prototype.getMainStat = getMainStat;
StatManager.prototype.setUserStat = setUserStat;
StatManager.prototype.getUserStat = getUserStat;

module.exports = StatManager;