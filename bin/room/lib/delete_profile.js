/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Удалить (отвязать) профиль
 *
 * @param sex - пол пользователя, @profile - его профиль
 */

const constants = require('./../../constants'),
    logger    = require('./../../../lib/log')(module);

module.exports = function (profile) {
  
  this._ranks.deleteProfile(profile);
  // this._ranks.deleteEmits(profile.getSocket());
  // this._mplayer.deleteEmits(profile.getSocket());
  
  let sex = profile.getSex();
  if(sex == constants.GUY) {
    delete  this._guys[profile.getID()];
    this._guys_count--;
  } else {
    delete this._girls[profile.getID()];
    this._girls_count--;
  }
  
  let socket = profile.getSocket();
  if(socket) {
    socket.leave(this._nameOfRoom, function () {});
  } else {
    logger.error("Room_delete_profile : Не удалось получить сокет профиля");
  }
  
  let arr = (sex == constants.GUY)? this._guys_indexes : this._girls_indexes;
  
  arr.push(profile.getGameIndex());
};