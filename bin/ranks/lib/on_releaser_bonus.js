/**
 * Created by s.t.o.k.a.t.o on 16.01.2017.
 *
 * Обработчик для звание освободитель
 */

const Config    = require('./../../../config.json');
const PF        = require('./../../const_fields');
const oPool     = require('./../../objects_pool');
const logger    = require('./../../../lib/log')(module);

module.exports = function(ranks) {
  
  const RELEASER_RANK = Config.ranks.releaser.name;
  
  return function (err, uid) {
    if(err) {
      return logger.error('handlePopularBonus:' + err);
    }
    
    let  profile = oPool.profiles[uid];
    
    if(!profile) {
      return logger.error('handleReleaserBonus: no profile with such uid');
    }
    
    let socket = profile.getSocket();
    
    if(socket) {
      let bonusCount = ranks._rBonuses[RELEASER_RANK];
      socket.emit(Config.io.emits.IO_NEW_RELEASER_BONUS, { [PF.COUNT] : bonusCount } );
    }
    
  }
};

