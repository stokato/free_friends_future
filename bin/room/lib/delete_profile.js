/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 */

var constants = require('./../../constants'),
    logger    = require('./../../../lib/log')(module);

/*
    Удалить (отвязать) профиль
  */
module.exports = function (sex, profile) {
  
  if(sex == constants.GUY) {
    delete  this.guys[profile.getID()];
    this._guys_count--;
  } else {
    delete this.girls[profile.getID()];
    this._girls_count--;
  }
  
  var socket = profile.getSocket();
  if(socket) {
    socket.leave(this.name);
  } else {
    logger.error("Room_delete_profile : Не удалось получить сокет профиля");
  }
  
  var arr = (sex == constants.GUY)? this._guys_indexes : this._girls_indexes;
  
  arr.push(profile.getGameIndex());
};