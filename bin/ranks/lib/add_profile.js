/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Добавляем профиль к списку
 */

const constants = require('./../../constants');
const ioc = require('./../../io_controller');

module.exports = function (profile) {
  
  let uid = profile.getID();
  
  this._rProfiles[uid] = {};
  for(let item in constants.RANKS) if(constants.RANKS.hasOwnProperty(item)) {
    this._rProfiles[uid][constants.RANKS[item]] = 0;
  }
  
  let socket = profile.getSocket();
  ioc.setEmit(socket, constants.IO_GET_ACTIVE_RANK, this.onGetActiveRank());
  ioc.setEmit(socket, constants.IO_GET_RANKS, this.onGetRanksOfProfile());
  ioc.setEmit(socket, constants.IO_CHANGE_ACTIVE_RANK, this.onSetActiveRank());
  
};