/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 */

var constants = require('./../../constants'),
    logger    = require('./../../../lib/log')(module);

/*
    Добавить (связать) профиль
 */
module.exports = function (sex, profile) {
  if(sex == constants.GUY) {
    this._guys[profile.getID()] = profile;
    this._guys_count++;
  } else {
    this._girls[profile.getID()] = profile;
    this._girls_count++;
  }
  
  var socket = profile.getSocket();
  if(socket) {
    socket.join(this._nameOfRoom);
  } else {
    logger.error("Room_add_profile : Не удалось получить сокет профиля");
  }
  
  var arr = (sex == constants.GUY)? this._guys_indexes : this._girls_indexes;
  arr.sort(function (i1, i2) { return i1 - i2; });
  
  var index = arr[0];
  
  arr.splice(0, 1);
  
  profile.setGameIndex(index);
  
  profile.setGame(this._game);
};