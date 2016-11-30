/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Удалить (отвязать) профиль
 *
 * @param sex - пол пользователя, @profile - его профиль
 */

var constants = require('./../../constants'),
    logger    = require('./../../../lib/log')(module);

module.exports = function (profile) {
  
  var sex = profile.getSex();
  if(sex == constants.GUY) {
    delete  this._guys[profile.getID()];
    this._guys_count--;
  } else {
    delete this._girls[profile.getID()];
    this._girls_count--;
  }
  
  var socket = profile.getSocket();
  if(socket) {
    socket.leave(this._nameOfRoom, function () {});
  } else {
    logger.error("Room_delete_profile : Не удалось получить сокет профиля");
  }
  
  var arr = (sex == constants.GUY)? this._guys_indexes : this._girls_indexes;
  
  arr.push(profile.getGameIndex());
};