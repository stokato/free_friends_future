/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Добавить (связать) профиль
 *
 * @param profile - профиль
 */

const constants = require('./../../constants'),
    logger    = require('./../../../lib/log')(module);

module.exports = function (profile) {
  
  this._ranks.addProfile(profile);
  // this._ranks.addEmits(profile.getSocket());
  // this._mplayer.addEmits(profile.getSocket());
  
  let sex = profile.getSex();
  if(sex == constants.GUY) {
    this._guys[profile.getID()]  = profile;
    this._guys_count++;
  } else {
    this._girls[profile.getID()] = profile;
    this._girls_count++;
  }
  
  let socket = profile.getSocket();
  if(socket) {
    socket.join(this._nameOfRoom);
  } else {
    logger.error("Room_add_profile : Не удалось получить сокет профиля");
  }
  
  let arr = (sex == constants.GUY)? this._guys_indexes : this._girls_indexes;
  arr.sort(function (i1, i2) { return i1 - i2; });
  
  let index = arr[0];
  
  arr.splice(0, 1);
  
  profile.setGameIndex(index);
  
  profile.setGame(this._game);
};