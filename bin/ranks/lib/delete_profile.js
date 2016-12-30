/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Удаляем профиль
 */

const constants = require('./../../constants');
// const ioc = require('./../../io_controller');

module.exports = function (profile) {
  let uid = profile.getID();
  let socket = profile.getSocket();
  
  // ioc.removeEmit(socket, constants.IO_GET_ACTIVE_RANK);
  // ioc.removeEmit(socket, constants.IO_GET_RANKS);
  // ioc.removeEmit(socket, constants.IO_CHANGE_ACTIVE_RANK);
  
  delete this._rProfiles[uid];
  
  for(let item in constants.RANKS) if(constants.RANKS.hasOwnProperty(item)) {
    if(this._rRankOwners[constants.RANKS[item]] == uid) {
      this._rRankOwners[constants.RANKS[item]] = null;
      this._rBonuses[constants.RANKS[item]] = 0;
    }
  }
};