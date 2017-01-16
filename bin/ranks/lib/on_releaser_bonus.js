/**
 * Created by s.t.o.k.a.t.o on 16.01.2017.
 *
 * Обработчик для звание освободитель
 */

const constants = require('./../../constants');
const oPool     = require('./../../objects_pool');
const logger    = require('./../../../lib/log')(module);

module.exports = function (err, uid) {
  if(err) { return logger.error('handlePopularBonus:' + err) }
  
  let  profile = oPool.profiles[uid];
  
  if(!profile) {
    return logger.error('handleReleaserBonus: no profile with such uid');
  }
  
  let socket = profile.getSocket();
  if(socket) {
    socket.emit(constants.IO_NEW_RELEASER_BONUS, {
      [constants.PFIELDS.COUNT] : this._rBonuses[constants.RANKS.RELEASER]
    });
  }
  
};

