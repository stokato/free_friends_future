/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Обработчик получения бонуса для звания Популярный
 */

var constants = require('./../../constants');
var oPool     = require('./../../objects_pool');
var logger    = require('./../../../lib/log')(module);
var Config    = require('./../../../config.json');

module.exports = function (err, uid) {
  if(err) { return logger.error('handlePopularBonus:' + err) }
  
  var profile = oPool.profiles[uid];
  
  if(!profile) {
    return logger.error('handlePopularBonus: no profile with such uid');
  }
  
  var profit = Number(Config.moneys.popular_bonus);
  
  profile.earn(profit, function (err, money) {
    if(err) { return logger.error('handlePopularBonus' + err); }
  
    var res = {};
    res[constants.PFIELDS.MONEY] = money;
    
    var socket = profile.getSocket();
    socket.emit(constants.IO_GET_MONEY, res);
  });
  
};
