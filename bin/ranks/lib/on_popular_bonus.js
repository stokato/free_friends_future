/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Обработчик получения бонуса для звания Популярный
 */

const Config    = require('./../../../config.json');
const PF        = require('./../../const_fields');
const oPool     = require('./../../objects_pool');
const logger    = require('./../../../lib/log')(module);


module.exports = function(ranks) {
  return function (err, uid) {
    if(err) {
      return logger.error('handlePopularBonus:' + err)
    }
    
    let  profile = oPool.profiles[uid];
    
    if(!profile) {
      return logger.error('handlePopularBonus: no profile with such uid');
    }
    
    let  profit = Number(Config.moneys.popular_bonus);
    
    profile.earn(profit, (err, money) => {
      if(err) {
        return logger.error('handlePopularBonus' + err);
      }
      
      let  socket = profile.getSocket();
      socket.emit(Config.io.emits.IO_GET_MONEY, { [PF.MONEY] : money });
    });
    
  }
};
